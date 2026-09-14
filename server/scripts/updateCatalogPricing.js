const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Product = require('../model/Product');
require('../model/Category');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const priceFor = (product) => {
    const text = `${product.name} ${product.category_id?.category || ''}`.toLowerCase();
    const rules = [
        [/raspberry pi 5/, 6499],
        [/raspberry pi 4/, 5299],
        [/raspberry pi/, 2499],
        [/arduino mega/, 899],
        [/arduino uno/, 499],
        [/arduino/, 399],
        [/esp32/, 449],
        [/esp8266/, 299],
        [/stm32|beaglebone|pic microcontroller/, 899],
        [/attiny/, 149],
        [/dht11|ir|ldr|pir|sw-420|ky-038/, 79],
        [/dht22|ds18b20|adxl345|mq-2|mq-135|fingerprint/, 249],
        [/mpu6050|ultrasonic/, 199],
        [/nrf24|hc-05|hc-06|433mhz/, 299],
        [/neo-6m|cc2530|sx1278/, 699],
        [/sim800|sim900|xbee/, 899],
        [/12v li-po|li-po battery/, 1299],
        [/18650|battery holder|tp4056|li-ion charger/, 199],
        [/solar panel/, 599],
        [/bms|ams1117|lm317|lm7805|xl4015/, 149],
        [/nema23|linear actuator|24v dc gear/, 2499],
        [/nema17|drv8825|l298n|12v dc gear/, 799],
        [/mg995|solenoid|6v dc gear/, 499],
        [/sg90|bo motor|6v dc motor|12v dc motor|24v dc motor/, 249],
        [/20x4|tft display/, 699],
        [/0.96 oled|16x2|7-segment|ws2812/, 249],
        [/iot kit/, 2499],
        [/kit/, 1499],
        [/sensor/, 199],
        [/motor|actuator/, 599],
        [/display/, 499]
    ];

    const match = rules.find(([pattern]) => pattern.test(text));
    return match ? match[1] : 299;
};

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const products = await Product.find().populate('category_id', 'category');
    for (const product of products) {
        const price = priceFor(product);
        product.price = price;
        product.compareprice = Math.ceil((price * 1.15) / 10) * 10;
        product.costprice = Math.ceil((price * 0.72) / 10) * 10;
        await product.save();
    }
    console.log(`Updated India retail estimates for ${products.length} products.`);
    await mongoose.disconnect();
}

run().catch(async (error) => {
    console.error('Pricing update failed:', error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
});