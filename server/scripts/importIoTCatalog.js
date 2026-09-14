const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Category = require('../model/Category');
const Product = require('../model/Product');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const sourceRoot = path.resolve(
    'C:/Users/Adil Raza/Desktop/IoT Robotics Drone & Embedded Systems Categories and Components (2)/IoT Robotics Drone & Embedded Systems Categories and Components'
);
const uploadRoot = path.join(__dirname, '..', 'uploads', 'products');
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);

const categoryDefinitions = [
    { directory: '1 Microcontrollers & Development Boards', name: 'Microcontrollers & Development Boards' },
    { directory: '2 Sensor', name: 'Sensors' },
    { directory: '3 Wireless & Communication Modules', name: 'Wireless & Communication Modules' },
    { directory: '4 Power & Battery Components', name: 'Power & Battery Components' },
    { directory: '5 Actuators & Motors', name: 'Actuators & Motors' },
    { directory: '6 Displays & Indicators', name: 'Displays & Indicators' },
    { directory: 'IoT KIT', name: 'IoT Kits' }
];

const cleanName = (value) => value.replace(/\.[^.]+$/, '').replace(/\s+/g, ' ').trim();
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function collectImages(directory) {
    if (!fs.existsSync(directory)) return [];
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return collectImages(fullPath);
        return imageExtensions.has(path.extname(entry.name).toLowerCase()) ? [fullPath] : [];
    });
}

function copyImage(sourcePath, productSlug) {
    const extension = path.extname(sourcePath).toLowerCase();
    const fileName = `${productSlug}-${path.basename(sourcePath, extension).toLowerCase().replace(/[^a-z0-9]+/g, '-')}${extension}`;
    const targetPath = path.join(uploadRoot, fileName);
    if (!fs.existsSync(targetPath)) fs.copyFileSync(sourcePath, targetPath);
    return `uploads/products/${fileName}`;
}

function productEntries(categoryDirectory) {
    const entries = fs.readdirSync(categoryDirectory, { withFileTypes: true });
    return entries.flatMap((entry) => {
        const fullPath = path.join(categoryDirectory, entry.name);
        if (entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase())) {
            return [{ name: cleanName(entry.name), images: [fullPath] }];
        }
        if (entry.isDirectory()) {
            const images = collectImages(fullPath);
            return images.length ? [{ name: entry.name, images }] : [];
        }
        return [];
    });
}

async function run() {
    if (!fs.existsSync(sourceRoot)) throw new Error(`Source folder not found: ${sourceRoot}`);
    fs.mkdirSync(uploadRoot, { recursive: true });
    await mongoose.connect(process.env.MONGO_URI);

    let categoryCount = 0;
    let productCount = 0;
    for (const definition of categoryDefinitions) {
        const categoryDirectory = path.join(sourceRoot, definition.directory);
        const entries = productEntries(categoryDirectory);
        const categoryImage = entries[0]?.images?.[0]
            ? copyImage(entries[0].images[0], `category-${slug(definition.name)}`)
            : '';
        const category = await Category.findOneAndUpdate(
            { category: definition.name },
            {
                $set: categoryImage ? { image: categoryImage } : {},
                $setOnInsert: {
                    category: definition.name,
                    description: `IoT, robotics, drone and embedded systems ${definition.name.toLowerCase()} components.`
                }
            },
            { upsert: true, new: true }
        );
        categoryCount += 1;

        for (const entry of entries) {
            const copiedImages = entry.images.map((image) => copyImage(image, slug(entry.name)));
            const existingProduct = await Product.findOne({ name: entry.name, category_id: category._id });
            if (existingProduct) continue;

            await Product.create({
                name: entry.name,
                shortdescription: `${entry.name} for IoT, robotics and embedded systems projects.`,
                description: `Reliable ${entry.name} component for prototyping and embedded applications.`,
                price: 100,
                compareprice: 120,
                costprice: 80,
                stockquantity: 10,
                stockstatus: 'In Stock',
                refundpolicy: '7-day replacement',
                refund_days: 7,
                images: copiedImages,
                thumbnail: copiedImages[0],
                category_id: category._id,
                tags: ['IoT', 'Robotics', 'Embedded Systems'],
                height: 10,
                width: 10,
                status: 'active'
            });
            productCount += 1;
        }
    }

    console.log(`Catalog import complete: ${categoryCount} categories, ${productCount} new products.`);
    await mongoose.disconnect();
}

run().catch(async (error) => {
    console.error('Catalog import failed:', error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
});