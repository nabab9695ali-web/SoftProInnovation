require('dotenv').config({ path: 'c:/Users/Adil Raza/Desktop/SoftProInnovation/server/.env' });
const mongoose = require('mongoose');
const Product = require('../model/Product');
const Category = require('../model/Category');
const mongoDB = require('../config/db');

const newProductsData = [
  {
    name: 'Raspberry Pi 5 8GB RAM Single Board Computer',
    categoryName: 'Microcontrollers & Development Boards',
    shortdescription: 'Quad-core 64-bit Arm Cortex-A76 @ 2.4GHz with dual 4Kp60 HDMI display outputs.',
    description: 'The Raspberry Pi 5 delivers 2-3x speedup over Pi 4 with custom silicon RP1 chip, PCI Express 2.0 interface, dual micro-HDMI ports, USB 3.0, Gigabit Ethernet, and real-time clock support.',
    price: 8499,
    compareprice: 9999,
    costprice: 7200,
    stockquantity: 25,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: true,
    is_feature: true,
    height: 15,
    width: 85,
    thumbnail: 'uploads/products/raspberry-pi-raspberry-pi-5-.png',
    images: [
      'uploads/products/raspberry-pi-raspberry-pi-5-.png',
      'uploads/products/raspberry-pi-raspberry-pi-4-model-b-.png'
    ],
    tags: ['Raspberry Pi', 'Pi 5', 'SBC', 'Linux', 'Microcontrollers']
  },
  {
    name: 'Raspberry Pi 4 Model B (4GB RAM)',
    categoryName: 'Microcontrollers & Development Boards',
    shortdescription: 'High-performance 64-bit quad-core processor with 4GB LPDDR4 RAM.',
    description: 'Features 1.5GHz quad-core ARM Cortex-A72 CPU, Gigabit Ethernet, 2x USB 3.0, 2x USB 2.0, dual-band 2.4/5.0 GHz wireless LAN, Bluetooth 5.0, BLE, and dual 4K monitor support.',
    price: 5499,
    compareprice: 6499,
    costprice: 4700,
    stockquantity: 30,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: true,
    is_feature: true,
    height: 15,
    width: 85,
    thumbnail: 'uploads/products/raspberry-pi-raspberry-pi-4-model-b-.png',
    images: [
      'uploads/products/raspberry-pi-raspberry-pi-4-model-b-.png',
      'uploads/products/raspberry-pi-raspberry-pi-3-model-b-.png'
    ],
    tags: ['Raspberry Pi', 'Pi 4', 'SBC', 'Development Board']
  },
  {
    name: 'STM32F103C8T6 Blue Pill Development Board',
    categoryName: 'Microcontrollers & Development Boards',
    shortdescription: 'ARM Cortex-M3 32-Bit Microcontroller 72MHz 64KB Flash 20KB SRAM.',
    description: 'Cost-effective 32-bit development board based on ARM Cortex-M3. Ideal for embedded systems, robotics, and industrial IoT development with rich peripheral interfaces.',
    price: 249,
    compareprice: 350,
    costprice: 180,
    stockquantity: 60,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: true,
    is_feature: true,
    height: 10,
    width: 53,
    thumbnail: 'uploads/products/stm32-boards-stm32-boards-.png',
    images: [
      'uploads/products/stm32-boards-stm32-boards-.png'
    ],
    tags: ['STM32', 'ARM', 'Blue Pill', 'Cortex-M3']
  },
  {
    name: 'Arduino Mega 2560 R3 with USB Cable',
    categoryName: 'Microcontrollers & Development Boards',
    shortdescription: 'ATmega2560 microcontroller board with 54 digital I/O pins and 16 analog inputs.',
    description: 'Designed for complex projects requiring numerous I/O ports. Comes with 54 digital input/output pins, 16 analog inputs, 4 UARTs, 16MHz crystal oscillator, and USB connection.',
    price: 999,
    compareprice: 1299,
    costprice: 800,
    stockquantity: 40,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: true,
    is_feature: true,
    height: 15,
    width: 101,
    thumbnail: 'uploads/products/arduino-boards-arduino-mega.png',
    images: [
      'uploads/products/arduino-boards-arduino-mega.png',
      'uploads/products/arduino-boards-arduino-uno-1-.png'
    ],
    tags: ['Arduino', 'Mega 2560', 'ATmega2560', 'Robotics']
  },
  {
    name: 'HC-SR04 Ultrasonic Distance Sensor Module',
    categoryName: 'Sensors',
    shortdescription: 'Precise non-contact distance measurement module from 2cm to 400cm with 3mm accuracy.',
    description: 'Transmits ultrasound waves at 40kHz and detects reflected pulses. Ideal for obstacle avoidance in robots, parking sensors, and automated level detection systems.',
    price: 129,
    compareprice: 199,
    costprice: 85,
    stockquantity: 80,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: false,
    is_feature: true,
    height: 15,
    width: 45,
    thumbnail: 'uploads/products/ultrasonic-hc-sr04-ultrasonic-hc-sr04-.png',
    images: [
      'uploads/products/ultrasonic-hc-sr04-ultrasonic-hc-sr04-.png'
    ],
    tags: ['Ultrasonic', 'HC-SR04', 'Distance Sensor', 'Robotics']
  },
  {
    name: 'MPU-6050 3-Axis Gyroscope & Accelerometer Module',
    categoryName: 'Sensors',
    shortdescription: '6-DOF motion tracking sensor with onboard DMP (Digital Motion Processor).',
    description: 'Combines a 3-axis gyroscope and a 3-axis accelerometer on the same silicon die together with an onboard Digital Motion Processor. Communicates via I2C interface.',
    price: 179,
    compareprice: 260,
    costprice: 120,
    stockquantity: 75,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: false,
    is_feature: true,
    height: 12,
    width: 20,
    thumbnail: 'uploads/products/mpu6050-mpu6050.png',
    images: [
      'uploads/products/mpu6050-mpu6050.png'
    ],
    tags: ['MPU6050', 'Gyroscope', 'Accelerometer', 'IMU', 'Drone']
  },
  {
    name: 'MQ-2 Gas & Smoke Detection Sensor Module',
    categoryName: 'Sensors',
    shortdescription: 'Detects LPG, Smoke, Alcohol, Propane, Methane, Hydrogen, and other combustible gases.',
    description: 'High sensitivity to LPG, Propane, and Hydrogen. Features analog and digital outputs with onboard potentiometer for threshold sensitivity adjustments.',
    price: 149,
    compareprice: 220,
    costprice: 95,
    stockquantity: 65,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: false,
    is_feature: false,
    height: 18,
    width: 35,
    thumbnail: 'uploads/products/mq-2-mq-2-.png',
    images: [
      'uploads/products/mq-2-mq-2-.png'
    ],
    tags: ['MQ-2', 'Gas Sensor', 'Smoke Sensor', 'Safety']
  },
  {
    name: 'DHT22 Digital Temperature & Humidity Sensor',
    categoryName: 'Sensors',
    shortdescription: 'High precision digital temperature (-40 to 80°C) and humidity (0-100% RH) sensor.',
    description: 'Features a calibrated digital signal output. Offers higher accuracy and wider measurement range than DHT11, making it ideal for weather stations and environmental monitors.',
    price: 249,
    compareprice: 349,
    costprice: 170,
    stockquantity: 50,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: false,
    is_feature: false,
    height: 15,
    width: 28,
    thumbnail: 'uploads/products/dht22-dht22.png',
    images: [
      'uploads/products/dht22-dht22.png',
      'uploads/products/dht11-dht11.png'
    ],
    tags: ['DHT22', 'Temperature', 'Humidity', 'Weather']
  },
  {
    name: 'NRF24L01+ 2.4GHz Wireless Transceiver Module',
    categoryName: 'Wireless & Communication Modules',
    shortdescription: 'Ultra low power 2.4GHz RF transceiver module with SPI interface up to 2Mbps.',
    description: 'Operates in the worldwide 2.4GHz ISM frequency band. Perfect for wireless remote controls, sensor networks, wireless drones, and telemetry communication.',
    price: 119,
    compareprice: 180,
    costprice: 75,
    stockquantity: 90,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: false,
    is_feature: true,
    height: 10,
    width: 29,
    thumbnail: 'uploads/products/nrf24l01-nrf24l01-.png',
    images: [
      'uploads/products/nrf24l01-nrf24l01-.png'
    ],
    tags: ['NRF24L01', 'Wireless', '2.4GHz', 'RF']
  },
  {
    name: 'HC-05 Wireless Bluetooth Serial Module',
    categoryName: 'Wireless & Communication Modules',
    shortdescription: 'Bluetooth V2.0+EDR SPP serial communication module supporting Master/Slave modes.',
    description: 'Easy-to-use Bluetooth SPP module for establishing transparent wireless serial connections between microcontrollers, PCs, and smartphones.',
    price: 289,
    compareprice: 399,
    costprice: 210,
    stockquantity: 55,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: true,
    is_feature: true,
    height: 12,
    width: 37,
    thumbnail: 'uploads/products/hc-05-hc-05.png',
    images: [
      'uploads/products/hc-05-hc-05.png',
      'uploads/products/hc-06-hc-06.png'
    ],
    tags: ['HC-05', 'Bluetooth', 'Serial', 'Wireless']
  },
  {
    name: 'SX1278 433MHz Long Range LoRa Transceiver Module',
    categoryName: 'Wireless & Communication Modules',
    shortdescription: 'Long-range spread spectrum communication module with ultra-high sensitivity.',
    description: 'Features high sensitivity of over -148 dBm and high power output, providing up to 5-10km transmission range in open fields. Ideal for smart agriculture and remote IoT metering.',
    price: 499,
    compareprice: 699,
    costprice: 380,
    stockquantity: 35,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: true,
    is_feature: true,
    height: 12,
    width: 25,
    thumbnail: 'uploads/products/sx1278-sx1278.png',
    images: [
      'uploads/products/sx1278-sx1278.png'
    ],
    tags: ['LoRa', 'SX1278', '433MHz', 'Long Range']
  },
  {
    name: 'SIM800L GPRS GSM Cellular Module with Antenna',
    categoryName: 'Wireless & Communication Modules',
    shortdescription: 'Micro SIM GSM/GPRS Quad-band module for SMS, Call, and Data transmission.',
    description: 'Compact cellular module supporting Quad-band 850/900/1800/1900MHz. Allows microcontrollers to send/receive SMS, make phone calls, and connect to the internet over GPRS.',
    price: 549,
    compareprice: 750,
    costprice: 420,
    stockquantity: 30,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: true,
    is_feature: false,
    height: 10,
    width: 25,
    thumbnail: 'uploads/products/sim800l-sim800l.png',
    images: [
      'uploads/products/sim800l-sim800l.png'
    ],
    tags: ['SIM800L', 'GSM', 'GPRS', 'Cellular', 'IoT']
  },
  {
    name: 'TP4056 1A 5V Type-C Li-Ion Battery Charger with Dual Protection',
    categoryName: 'Power & Battery Components',
    shortdescription: 'Linear lithium battery charging board with battery protection IC and Type-C USB port.',
    description: 'Supports single-cell lithium battery charging with up to 1A constant current. Incorporates over-discharge and over-current protection for enhanced safety.',
    price: 49,
    compareprice: 89,
    costprice: 28,
    stockquantity: 150,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: false,
    is_feature: true,
    height: 5,
    width: 28,
    thumbnail: 'uploads/products/tp4056-tp4056.png',
    images: [
      'uploads/products/tp4056-tp4056.png'
    ],
    tags: ['TP4056', 'Charger', 'Type-C', '18650', 'Lithium']
  },
  {
    name: 'XL4015 5A High Power Step Down Buck Converter Module',
    categoryName: 'Power & Battery Components',
    shortdescription: 'DC-DC adjustable step-down power supply module with up to 96% efficiency.',
    description: 'Handles 4V-38V input and provides 1.25V-36V adjustable output up to 5A. Equipped with heatsink and onboard voltage regulation potentiometer.',
    price: 189,
    compareprice: 280,
    costprice: 135,
    stockquantity: 45,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: false,
    is_feature: true,
    height: 18,
    width: 54,
    thumbnail: 'uploads/products/xl4015-buck-xl4015-buck.png',
    images: [
      'uploads/products/xl4015-buck-xl4015-buck.png'
    ],
    tags: ['XL4015', 'Buck Converter', 'Power Supply', 'Step Down']
  },
  {
    name: '3S 20A 12.6V BMS Protection Board for 18650 Lithium Battery',
    categoryName: 'Power & Battery Components',
    shortdescription: 'Battery Management System protection board with auto-recovery and balance charging.',
    description: 'Guarantees protection against overcharge, over-discharge, short-circuit, and overcurrent for 3-series 18650 lithium battery packs.',
    price: 159,
    compareprice: 240,
    costprice: 110,
    stockquantity: 50,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: false,
    is_feature: false,
    height: 8,
    width: 59,
    thumbnail: 'uploads/products/bms-bms-.png',
    images: [
      'uploads/products/bms-bms-.png'
    ],
    tags: ['BMS', '3S', '18650', 'Battery Protection']
  },
  {
    name: 'SG90 9g Micro Servo Motor 180 Degree with Horns',
    categoryName: 'Actuators & Motors',
    shortdescription: 'Lightweight micro servo motor with 1.8kg/cm torque for RC planes, cars, and robotics.',
    description: 'Extremely popular, lightweight micro servo offering accurate position control via PWM pulses. Comes complete with 3 arms and mounting screws.',
    price: 139,
    compareprice: 199,
    costprice: 90,
    stockquantity: 120,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: false,
    is_feature: true,
    height: 30,
    width: 23,
    thumbnail: 'uploads/products/sg90-micro-servo-motor-sg90-micro-servo-motor.png',
    images: [
      'uploads/products/sg90-micro-servo-motor-sg90-micro-servo-motor.png'
    ],
    tags: ['SG90', 'Servo Motor', 'Robotics', 'Micro Servo']
  },
  {
    name: 'MG995 High Torque Metal Gear Servo Motor',
    categoryName: 'Actuators & Motors',
    shortdescription: 'Metal gear heavy-duty servo motor with 10kg/cm high stall torque.',
    description: 'High-speed standard servo motor equipped with metal gears, double ball bearings, and high holding torque. Ideal for robotic arms, quadrupeds, and RC buggies.',
    price: 389,
    compareprice: 520,
    costprice: 290,
    stockquantity: 40,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: true,
    is_feature: true,
    height: 40,
    width: 20,
    thumbnail: 'uploads/products/mg995-servo-motor-mg995-servo-motor-.png',
    images: [
      'uploads/products/mg995-servo-motor-mg995-servo-motor-.png'
    ],
    tags: ['MG995', 'Metal Gear', 'High Torque', 'Servo']
  },
  {
    name: 'L298N Dual H-Bridge DC Stepper Motor Driver Module',
    categoryName: 'Actuators & Motors',
    shortdescription: 'Heavy duty motor driver capable of driving 2 DC motors or 1 4-wire stepper motor.',
    description: 'Integrated heat sink, 5V regulator, and robust terminal blocks. Controls motor direction and speed using PWM signals with up to 2A per bridge.',
    price: 199,
    compareprice: 299,
    costprice: 140,
    stockquantity: 70,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: false,
    is_feature: true,
    height: 27,
    width: 43,
    thumbnail: 'uploads/products/l298n-motor-driver-l298n-motor-driver.png',
    images: [
      'uploads/products/l298n-motor-driver-l298n-motor-driver.png'
    ],
    tags: ['L298N', 'Motor Driver', 'H-Bridge', 'Robotics']
  },
  {
    name: 'NEMA 17 Stepper Motor (1.5A 42N.cm) 4-Wire with Cable',
    categoryName: 'Actuators & Motors',
    shortdescription: 'High torque hybrid stepper motor 1.8 degree step angle for 3D printers and CNCs.',
    description: 'Premium quality stepper motor with high holding torque of 42 N.cm and low noise. Directly compatible with A4988, DRV8825, and TMC2209 stepper drivers.',
    price: 649,
    compareprice: 850,
    costprice: 490,
    stockquantity: 30,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: true,
    is_feature: true,
    height: 48,
    width: 42,
    thumbnail: 'uploads/products/nema17-stepper-motor-nema17-stepper-motor-.png',
    images: [
      'uploads/products/nema17-stepper-motor-nema17-stepper-motor-.png'
    ],
    tags: ['NEMA17', 'Stepper Motor', '3D Printer', 'CNC']
  },
  {
    name: '0.96 inch I2C OLED Display Module 128x64 Blue/Yellow',
    categoryName: 'Displays & Indicators',
    shortdescription: 'Ultra-clear 128x64 dot matrix self-luminous OLED display with 4-Pin I2C interface.',
    description: 'Requires no backlight, providing high contrast and wide viewing angles. Works with SSD1306 driver chip and requires only two communication lines (SDA and SCL).',
    price: 249,
    compareprice: 380,
    costprice: 170,
    stockquantity: 65,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: false,
    is_feature: true,
    height: 10,
    width: 27,
    thumbnail: 'uploads/products/0-96-oled-lcd-0-96-oled-lcd-.png',
    images: [
      'uploads/products/0-96-oled-lcd-0-96-oled-lcd-.png'
    ],
    tags: ['OLED', '128x64', 'I2C', 'Display', 'SSD1306']
  },
  {
    name: '16x2 Character LCD Display with I2C Backpack Adapter',
    categoryName: 'Displays & Indicators',
    shortdescription: 'Standard 16 character 2 line blue backlight LCD with pre-soldered I2C module.',
    description: 'Reduces the microcontroller pin consumption from 6 pins to just 2 pins (SDA & SCL). Includes potentiometer for contrast adjustment and jumper for backlight control.',
    price: 229,
    compareprice: 320,
    costprice: 155,
    stockquantity: 50,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: false,
    is_feature: false,
    height: 12,
    width: 80,
    thumbnail: 'uploads/products/16x2-lcd-16x2-lcd-.png',
    images: [
      'uploads/products/16x2-lcd-16x2-lcd-.png'
    ],
    tags: ['16x2', 'LCD', 'I2C Backpack', 'Character Display']
  },
  {
    name: 'WS2812B Addressable RGB LED Strip (5M 300 LEDs)',
    categoryName: 'Displays & Indicators',
    shortdescription: 'Individually addressable 5050 SMD RGB pixel strip DC 5V flexible light.',
    description: 'Every single LED can have its own individual color and brightness. Powered by WS2812B IC with integrated driver, compatible with FastLED and Adafruit NeoPixel libraries.',
    price: 799,
    compareprice: 1099,
    costprice: 580,
    stockquantity: 25,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: true,
    is_feature: true,
    height: 5,
    width: 10,
    thumbnail: 'uploads/products/ws2812-rgb-leds-ws2812-rgb-leds.png',
    images: [
      'uploads/products/ws2812-rgb-leds-ws2812-rgb-leds.png'
    ],
    tags: ['WS2812B', 'NeoPixel', 'RGB LED', 'Addressable']
  },
  {
    name: 'Advanced IoT Smart Home Starter Kit with ESP32',
    categoryName: 'IoT Kits',
    shortdescription: 'Comprehensive 45+ component starter kit for smart home and cloud IoT automation.',
    description: 'Packed with ESP32 WiFi+BLE development board, multiple environmental sensors, relay modules, OLED display, jumper wires, servo motor, and complete step-by-step project guide.',
    price: 1899,
    compareprice: 2499,
    costprice: 1400,
    stockquantity: 20,
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Replacement',
    refund_days: 7,
    iscouponavailable: true,
    isreplaceable: true,
    isfreedelivery: true,
    is_feature: true,
    height: 60,
    width: 220,
    thumbnail: 'uploads/products/iot-kit-1-iot-kit-1-.jpg',
    images: [
      'uploads/products/iot-kit-1-iot-kit-1-.jpg'
    ],
    tags: ['IoT Kit', 'Smart Home', 'Starter Kit', 'ESP32', 'Robotics']
  }
];

async function seed() {
  await mongoDB();
  console.log('Connected to MongoDB. Finding categories...');

  const categories = await Category.find();
  const catMap = {};
  categories.forEach((cat) => {
    catMap[cat.category.trim().toLowerCase()] = cat._id;
  });

  let addedCount = 0;
  let skippedCount = 0;

  for (const item of newProductsData) {
    const existing = await Product.findOne({ name: item.name });
    if (existing) {
      skippedCount++;
      continue;
    }

    const matchedCatId = catMap[item.categoryName.trim().toLowerCase()] || categories[0]._id;

    const prod = new Product({
      name: item.name,
      shortdescription: item.shortdescription,
      description: item.description,
      price: item.price,
      compareprice: item.compareprice,
      costprice: item.costprice,
      stockquantity: item.stockquantity,
      stockstatus: item.stockstatus,
      refundpolicy: item.refundpolicy,
      refund_days: item.refund_days,
      iscouponavailable: item.iscouponavailable,
      isreplaceable: item.isreplaceable,
      isfreedelivery: item.isfreedelivery,
      is_feature: item.is_feature,
      height: item.height,
      width: item.width,
      thumbnail: item.thumbnail,
      images: item.images,
      tags: item.tags,
      category_id: matchedCatId,
      status: 'active'
    });

    await prod.save();
    addedCount++;
    console.log(`+ Added: ${item.name}`);
  }

  console.log(`\nSeed complete: Added ${addedCount} products, Skipped ${skippedCount} existing products.`);
  const total = await Product.countDocuments();
  console.log(`Total products now in database: ${total}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed Error:', err);
  process.exit(1);
});
