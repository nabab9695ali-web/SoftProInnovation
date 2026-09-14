const Razorpay = require("razorpay");

let razorpayInstance = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log("Razorpay SDK initialized successfully");
  } catch (err) {
    console.warn("Failed to initialize Razorpay SDK:", err.message);
  }
} else {
  console.warn("NOTICE: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set in environment variables. Razorpay online payment will be disabled until keys are configured.");
}

module.exports = razorpayInstance;