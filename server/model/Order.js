const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema(
    {
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        thumbnail: {
            type: String,
            default: "",
        },

        category: {
            type: String,
            default: "",
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        total: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

const OrderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            unique: true,
            index: true,
        },
        amount: { type: Number },
        razorpayOrderId: { type: String, default: "" },
        razorpayPaymentId: { type: String, default: "" },
        razorpaySignature: { type: String, default: "" },

        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        customerName: {
            type: String,
            required: true,
            trim: true,
        },

        customerEmail: {
            type: String,
            default: "",
            trim: true,
        },

        customerMobile: {
            type: String,
            default: "",
            trim: true,
        },

        items: {
            type: [OrderItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: "Order must contain at least one item",
            },
        },

        address: {
            name: {
                type: String,
                required: true,
                trim: true,
            },

            mobile: {
                type: String,
                required: true,
                trim: true,
            },

            pincode: {
                type: String,
                required: true,
                trim: true,
            },

            locality: {
                type: String,
                default: "",
                trim: true,
            },

            address: {
                type: String,
                required: true,
                trim: true,
            },

            city: {
                type: String,
                required: true,
                trim: true,
            },

            state: {
                type: String,
                required: true,
                trim: true,
            },

            landmark: {
                type: String,
                default: "",
                trim: true,
            },

            latitude: {
                type: Number,
                default: null,
            },

            longitude: {
                type: Number,
                default: null,
            },

            addressType: {
                type: String,
                default: "Home",
            },
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        fee: {
            type: Number,
            default: 0,
            min: 0,
        },

        discount: {
            type: Number,
            default: 0,
            min: 0,
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        paymentMethod: {
            type: String,
            enum: ["cod", "upi", "cards", "credit-card", 'razorpay', 'gift-card', 'emi'],
            default: "cod",
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },

        paymentReference: {
            type: String,
            default: "",
            trim: true,
        },

        estimatedDelivery: {
            type: Date,
            default: null,
        },

        trackingNote: {
            type: String,
            default: "",
            trim: true,
        },

        status: {
            type: String,
            enum: ["pending", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

OrderSchema.pre("validate", function () {
    if (!this.orderId) {
        this.orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    }
});

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

module.exports = Order;
