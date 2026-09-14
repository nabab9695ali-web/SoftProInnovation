const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ quiet: true });
const app = express();
const AdminRoutes = require('./routes/AdminRoutes');
const mongoDB = require('./config/db');
mongoDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoint (useful for Render & monitoring)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
});

// API'S STARTED
app.use('/api/admin', AdminRoutes);
app.use('/api/category', require('./routes/CategoryRoutes'));
app.use('/api/user', require('./routes/UserRoutes'));
app.use('/api/product', require('./routes/ProductRoutes'));
app.use('/api/cart', require('./routes/CartRoutes'));
app.use('/api/address', require('./routes/AddressRoutes'));
app.use('/api/order', require('./routes/OrderRoutes'));
app.use('/api/complaint', require('./routes/ComplaintRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// Serve frontend in unified production deployment (if client/dist exists)
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
            res.sendFile(path.join(clientDistPath, 'index.html'));
        }
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});