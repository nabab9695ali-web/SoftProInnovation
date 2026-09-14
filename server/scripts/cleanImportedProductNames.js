const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Product = require('../model/Product');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const kitNames = [
    'IoT Starter Electronics Kit',
    'Smart Home IoT Learning Kit',
    'Arduino Sensor Experiment Kit',
    'Robotics and Embedded Systems Kit',
    'IoT Development Board Kit',
    'Multi-Sensor Robotics Project Kit',
    'Embedded Systems Trainer Kit',
    'Robotics Components Starter Kit'
];

const description = (name) => `${name} with practical modules and components for prototyping, automation, robotics and embedded systems projects.`;

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const products = await Product.find({ name: /whatsapp image/i }).sort({ createdAt: 1 });

    for (const [index, product] of products.entries()) {
        const name = kitNames[index] || `IoT Project Kit ${index + 1}`;
        product.name = name;
        product.shortdescription = description(name);
        product.description = `${description(name)} Ideal for students, makers and engineering labs.`;
        product.tags = ['IoT', 'Robotics', 'Embedded Systems', 'Project Kit'];
        await product.save();
    }

    console.log(`Updated ${products.length} imported product names.`);
    console.log(products.map((product, index) => `${index + 1}. ${kitNames[index] || `IoT Project Kit ${index + 1}`}`).join('\n'));
    await mongoose.disconnect();
}

run().catch(async (error) => {
    console.error('Product name cleanup failed:', error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
});