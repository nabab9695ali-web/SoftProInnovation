const express = require('express');
const mongoose = require('mongoose');
const Order = require('../model/Order');
const User = require('../model/User');
const Product = require('../model/Product');

const Router = express.Router();

Router.post('/create', async (req, res) => {
    try {
        const { user_id, items, address, subtotal, fee, discount, totalAmount, paymentMethod, paymentReference, upiId, cardLast4 } = req.body;

        if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({ success: false, message: 'Valid user ID is required' });
        }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
        }
        if (!['cod', 'upi', 'cards', 'credit-card', 'razorpay', 'gift-card', 'emi'].includes(paymentMethod)) {
            return res.status(400).json({ success: false, message: 'Please select a valid payment method' });
        }
        if (paymentMethod === 'upi' && !String(upiId || '').trim()) {
            return res.status(400).json({ success: false, message: 'UPI ID is required' });
        }
        if (['cards', 'credit-card'].includes(paymentMethod) && !/^\d{4}$/.test(String(cardLast4 || ''))) {
            return res.status(400).json({ success: false, message: 'Enter the last 4 digits of your card' });
        }
        if (!address?.name || !address?.mobile || !address?.address || !address?.city || !address?.state || !address?.pincode) {
            return res.status(400).json({ success: false, message: 'Complete delivery address is required' });
        }

        const user = await User.findById(user_id).select('name email mobile');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const orderItems = items.map((item) => {
            const price = Number(item.price) || 0;
            const quantity = Math.max(Number(item.quantity) || 1, 1);
            return {
                product_id: mongoose.Types.ObjectId.isValid(item._id || item.id) ? (item._id || item.id) : undefined,
                name: item.name || 'Product',
                thumbnail: item.thumbnail || '',
                category: item.category || '',
                price,
                quantity,
                total: price * quantity,
            };
        });

        for (const item of orderItems) {
            if (!item.product_id) continue;
            const product = await Product.findById(item.product_id).select('name stockquantity stockstatus');
            if (!product) return res.status(400).json({ success: false, message: `${item.name} is no longer available` });
            if (Number(product.stockquantity) < item.quantity || String(product.stockstatus).toLowerCase() !== 'in stock') {
                return res.status(409).json({ success: false, message: `${product.name} is out of stock` });
            }
        }

        for (const item of orderItems) {
            if (!item.product_id) continue;
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: item.product_id, stockquantity: { $gte: item.quantity } },
                { $inc: { stockquantity: -item.quantity } },
                { returnDocument: 'after', new: true }
            );
            if (!updatedProduct) return res.status(409).json({ success: false, message: `${item.name} stock changed. Please refresh your cart.` });
            if (Number(updatedProduct.stockquantity) <= 0) {
                await Product.findByIdAndUpdate(updatedProduct._id, { stockstatus: 'Out of Stock', stockquantity: 0 });
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
                locality: address.locality || address.localiy || '',
                address: address.address || address.Address,
                city: address.city,
                state: address.state,
                landmark: address.landmark || '',
                latitude: Number.isFinite(Number(address.latitude)) ? Number(address.latitude) : null,
                longitude: Number.isFinite(Number(address.longitude)) ? Number(address.longitude) : null,
                addressType: address.addressType || 'Home',
            },
            subtotal: Number(subtotal) || 0,
            fee: Number(fee) || 0,
            discount: Number(discount) || 0,
            totalAmount: Number(totalAmount) || 0,
            amount: Number(totalAmount) || 0,
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
            paymentReference: paymentReference || (paymentMethod === 'upi' ? String(upiId).trim() : cardLast4 ? `CARD-****${cardLast4}` : paymentMethod === 'gift-card' ? (req.body.giftCardCode || 'GIFT-CARD-REDEMPTION') : paymentMethod === 'emi' ? (req.body.emiDetails || 'BANK-EMI-ORDER') : req.body.razorpayPaymentId || ''),
            razorpayOrderId: req.body.razorpayOrderId || '',
            razorpayPaymentId: req.body.razorpayPaymentId || '',
            razorpaySignature: req.body.razorpaySignature || '',
            estimatedDelivery,
            trackingNote: paymentMethod === 'razorpay' ? 'Payment received via Razorpay. Order confirmed!' :
                          paymentMethod === 'gift-card' ? 'Order paid securely via Gift Card balance. Confirmed!' :
                          paymentMethod === 'emi' ? `EMI Order approved (${req.body.emiTenure || 'Easy installments'}). Dispatching soon.` :
                          'Order placed successfully. We will notify you when it ships.',
            status: ['razorpay', 'gift-card', 'emi'].includes(paymentMethod) ? 'processing' : 'pending',
        });

        return res.status(201).json({ success: true, message: 'Order placed successfully', order });
    } catch (error) {
        console.error('Create order error:', error);
        return res.status(500).json({ success: false, message: 'Failed to place order', error: error.message });
    }
});

Router.get('/show', async (req, res) => {
    try {
        const filter = req.query.status && req.query.status !== 'all' ? { status: req.query.status } : {};
        const orders = await Order.find(filter)
            .populate('user_id', 'name email mobile')
            .sort({ createdAt: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
    }
});

Router.get('/user/:userId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }
        const orders = await Order.find({ user_id: req.params.userId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch user orders', error: error.message });
    }
});

Router.get('/track/:query', async (req, res) => {
    try {
        const q = String(req.params.query || '').trim();
        if (!q) return res.status(400).json({ success: false, message: 'Please provide an Order ID or mobile number' });

        const searchConditions = [
            { orderId: { $regex: q, $options: 'i' } },
            { customerMobile: { $regex: q, $options: 'i' } },
            { customerEmail: { $regex: q, $options: 'i' } },
            { 'address.mobile': { $regex: q, $options: 'i' } }
        ];

        if (mongoose.Types.ObjectId.isValid(q)) {
            searchConditions.push({ _id: q });
        }

        const orders = await Order.find({ $or: searchConditions })
            .populate('user_id', 'name email mobile')
            .sort({ createdAt: -1 });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: `No orders found matching "${q}"` });
        }

        return res.json({ success: true, order: orders[0], allMatching: orders });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Tracking failed', error: error.message });
    }
});

Router.get('/:id', async (req, res) => {
    try {
        const id = String(req.params.id || '').trim();
        const query = mongoose.Types.ObjectId.isValid(id)
            ? { $or: [{ _id: id }, { orderId: id }] }
            : { orderId: id };

        const order = await Order.findOne(query).populate('user_id', 'name email mobile');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        return res.json({ success: true, order });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch order', error: error.message });
    }
});

Router.patch('/:id/status', async (req, res) => {
    try {
        const id = String(req.params.id || '').trim();
        const query = mongoose.Types.ObjectId.isValid(id)
            ? { $or: [{ _id: id }, { orderId: id }] }
            : { orderId: id };

        const allowed = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!allowed.includes(req.body.status)) return res.status(400).json({ success: false, message: 'Invalid order status' });

        const order = await Order.findOneAndUpdate(
            query,
            { status: req.body.status, trackingNote: req.body.trackingNote || `Order status updated to ${req.body.status.replaceAll('_', ' ')}.` },
            { new: true, runValidators: true }
        );
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        return res.json({ success: true, order });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to update order', error: error.message });
    }
});

module.exports = Router;
