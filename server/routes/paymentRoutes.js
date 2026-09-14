const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const razorpayInstance = require("../config/razorpay");
const Order = require("../model/Order");
const User = require("../model/User");
const Product = require("../model/Product");
const router = express.Router();

// 1. Get Razorpay Public Key ID
router.get("/get-key", (req, res) => {
  try {
    return res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to get Razorpay key" });
  }
});

// 2. Create Razorpay Order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!razorpayInstance) {
      return res.status(503).json({
        success: false,
        message: "Razorpay payment gateway is not configured yet on this server. Please choose Cash on Delivery or configure Razorpay API keys.",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // Razorpay amount in paise
      currency: currency || "INR",
      receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    return res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return res.status(500).json({
      success: false,
      message: err.error?.description || err.message || "Failed to create Razorpay order",
    });
  }
});

// 3. Verify Razorpay Payment and finalize order
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId,
      orderData,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required",
      });
    }

    // Verify HMAC-SHA256 signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      if (dbOrderId) {
        await Order.findByIdAndUpdate(dbOrderId, {
          paymentStatus: "failed",
          status: "cancelled",
          trackingNote: "Payment signature verification failed.",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Invalid signature",
      });
    }

    // Case 1: Order was already created in DB beforehand
    if (dbOrderId) {
      const updatedOrder = await Order.findByIdAndUpdate(
        dbOrderId,
        {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paymentReference: razorpay_payment_id,
          paymentMethod: "razorpay",
          paymentStatus: "paid",
          status: "processing",
          trackingNote: "Payment verified successfully via Razorpay.",
        },
        { new: true }
      );
      return res.json({
        success: true,
        message: "Payment verified successfully",
        order: updatedOrder,
      });
    }

    // Case 2: Create the order upon successful payment verification
    if (orderData) {
      const { user_id, items, address, subtotal, fee, discount, totalAmount } = orderData;

      if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
        return res.status(400).json({ success: false, message: "Valid user ID is required" });
      }
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "Order must contain at least one item" });
      }
      if (!address?.name || !address?.mobile || !address?.address || !address?.city || !address?.state || !address?.pincode) {
        return res.status(400).json({ success: false, message: "Complete delivery address is required" });
      }

      const user = await User.findById(user_id).select("name email mobile");
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const orderItems = items.map((item) => {
        const price = Number(item.price) || 0;
        const quantity = Math.max(Number(item.quantity) || 1, 1);
        return {
          product_id: mongoose.Types.ObjectId.isValid(item._id || item.id) ? (item._id || item.id) : undefined,
          name: item.name || "Product",
          thumbnail: item.thumbnail || "",
          category: item.category || "",
          price,
          quantity,
          total: price * quantity,
        };
      });

      // Deduct stock for ordered items
      for (const item of orderItems) {
        if (!item.product_id) continue;
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.product_id, stockquantity: { $gte: item.quantity } },
          { $inc: { stockquantity: -item.quantity } },
          { returnDocument: "after", new: true }
        );
        if (updatedProduct && Number(updatedProduct.stockquantity) <= 0) {
          await Product.findByIdAndUpdate(updatedProduct._id, { stockstatus: "Out of Stock", stockquantity: 0 });
        }
      }

      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

      const order = await Order.create({
        user_id,
        customerName: user.name,
        customerEmail: user.email,
        customerMobile: user.mobile || address.mobile,
        items: orderItems,
        address: {
          name: address.name,
          mobile: String(address.mobile),
          pincode: String(address.pincode),
          locality: address.locality || address.localiy || "",
          address: address.address || address.Address,
          city: address.city,
          state: address.state,
          landmark: address.landmark || "",
          latitude: Number.isFinite(Number(address.latitude)) ? Number(address.latitude) : null,
          longitude: Number.isFinite(Number(address.longitude)) ? Number(address.longitude) : null,
          addressType: address.addressType || "Home",
        },
        subtotal: Number(subtotal) || 0,
        fee: Number(fee) || 0,
        discount: Number(discount) || 0,
        totalAmount: Number(totalAmount) || 0,
        amount: Number(totalAmount) || 0,
        paymentMethod: "razorpay",
        paymentStatus: "paid",
        paymentReference: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        estimatedDelivery,
        trackingNote: "Payment confirmed via Razorpay. Preparing for dispatch.",
        status: "processing",
      });

      return res.status(201).json({
        success: true,
        message: "Payment verified and order placed successfully",
        order,
      });
    }

    return res.json({
      success: true,
      message: "Signature verified successfully",
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
      error: err.message,
    });
  }
});

module.exports = router;