const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Product = require('../model/Product');
const Category = require('../model/Category');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const categoryCopy = {
  'Microcontrollers & Development Boards': 'Control boards and development platforms for embedded programming, IoT prototypes and robotics projects.',
  Sensors: 'Sensors for measuring motion, distance, temperature, light, gas and environmental conditions.',
  'Wireless & Communication Modules': 'Wireless, GPS, Bluetooth, RF and cellular modules for connected device communication.',
  'Power & Battery Components': 'Batteries, chargers, regulators and power modules for reliable electronics projects.',
  'Actuators & Motors': 'Motors, servo systems, drivers and actuators for robotics and automated movement.',
  'Displays & Indicators': 'LCD, OLED, TFT and LED display components for readable device interfaces and status indicators.',
  'IoT Kits': 'Hands-on IoT and robotics kits with practical components for learning, prototyping and automation.'
};

const productCopy = (name, category) => {
  const lower = name.toLowerCase();
  if (category === 'Sensors') return `${name} sensor module for ${lower.includes('dht') || lower.includes('ds18') ? 'temperature and humidity monitoring' : 'accurate project data collection'} in IoT and embedded systems.`;
  if (category === 'Wireless & Communication Modules') return `${name} communication module for wireless data transfer, remote monitoring and connected IoT devices.`;
  if (category === 'Microcontrollers & Development Boards') return `${name} development platform for firmware programming, IoT prototypes, automation and robotics control.`;
  if (category === 'Power & Battery Components') return `${name} power component for battery management, voltage regulation and reliable electronics projects.`;
  if (category === 'Actuators & Motors') return `${name} actuator or motor component for robotic movement, mechanisms and automation projects.`;
  if (category === 'Displays & Indicators') return `${name} display module for showing sensor values, menus, status messages and device feedback.`;
  if (category === 'IoT Kits') return `${name} project kit with practical modules for IoT, robotics, automation and embedded systems learning.`;
  return `${name} component for electronics, IoT and embedded systems projects.`;
};

const priceByName = {
  '433MHz': 149, CC2530: 399, 'HC-05': 299, 'HC-06': 299, 'NEO-6M': 699, NRF24L01: 249,
  SIM800L: 699, SIM900A: 799, SX1278: 499, XBee: 2499,
  'Raspberry Pi': 2499, 'ESP8266 & ESP32': 449, 'Arduino Boards': 399,
  'IoT kit 1': 2499, 'Iot kit 1': 2499,
  'IoT Starter Electronics Kit': 1499,
  'Smart Home IoT Learning Kit': 1999,
  'Arduino Sensor Experiment Kit': 1799,
  'Robotics and Embedded Systems Kit': 2499,
  'IoT Development Board Kit': 2299,
  'Multi-Sensor Robotics Project Kit': 2999,
  'Embedded Systems Trainer Kit': 3499,
  '0.96 OLED LCD': 299, '16x2 LCD': 149, '20x4 LCD': 299,
  '7-Segment Displays': 99, 'TFT Display': 699, 'WS2812 RGB LEDS': 249,
  '12V Li-po Battery': 1299, 'Li-po battery': 899, '18650': 199,
  'Lithium Battery holder 4 slots': 149, 'Li-ion Charger': 249,
  TP4056: 99, BMS: 149, AMS1117: 49, 'LM317': 99, 'LM7805': 49,
  'XL4015 Buck': 249, 'Solar Panel': 599
};

const priceFor = (product) => {
  if (priceByName[product.name]) return priceByName[product.name];
  const category = product.category_id?.category || '';
  if (category === 'Sensors') return /DHT11|IR|LDR|PIR|SW-420|KY-038/i.test(product.name) ? 79 : 199;
  if (category === 'Wireless & Communication Modules') return 399;
  if (category === 'Displays & Indicators') {
    if (/tft/i.test(product.name)) return 699;
    if (/0\.96|oled/i.test(product.name)) return 299;
    if (/20x4/i.test(product.name)) return 299;
    if (/16x2/i.test(product.name)) return 149;
    if (/7-segment/i.test(product.name)) return 99;
    if (/ws2812|rgb led/i.test(product.name)) return 249;
    return 299;
  }
  if (category === 'Power & Battery Components') {
    if (/12v|li-po battery/i.test(product.name)) return 1299;
    if (/li-ion|18650/i.test(product.name)) return 199;
    if (/solar panel/i.test(product.name)) return 599;
    if (/holder/i.test(product.name)) return 149;
    if (/charger|tp4056|bms/i.test(product.name)) return 149;
    if (/ams1117|lm317|lm7805/i.test(product.name)) return 59;
    if (/xl4015|buck/i.test(product.name)) return 249;
    return 199;
  }
  if (category === 'Actuators & Motors') return 599;
  if (category === 'Microcontrollers & Development Boards') return 699;
  if (category === 'IoT Kits') return 1499;
  return 299;
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  for (const [category, description] of Object.entries(categoryCopy)) {
    await Category.updateOne({ category }, { $set: { description } });
  }

  const products = await Product.find().populate('category_id', 'category');
  for (const product of products) {
    const category = product.category_id?.category || 'Electronics Components';
    const price = priceFor(product);
    const copy = productCopy(product.name, category);
    product.shortdescription = copy;
    product.description = `${copy} Designed for makers, students, engineers and professional prototypes.`;
    product.tags = [category, 'IoT', 'Robotics', 'Embedded Systems'];
    product.price = price;
    product.compareprice = Math.ceil((price * 1.15) / 10) * 10;
    product.costprice = Math.ceil((price * 0.72) / 10) * 10;
    await product.save();
  }

  console.log(`Normalized content for ${products.length} products and ${Object.keys(categoryCopy).length} categories.`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('Catalog normalization failed:', error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
