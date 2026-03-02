import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    // Unique ID for the customer to reference (e.g., BR-10293)
    bookingReference: {
        type: String,
        unique: true,
        default: () => `BR-${Math.floor(100000 + Math.random() * 900000)}`
    },

    // Relationships
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Required if you have authentication
        required: true
    },

    // Device Details
    brandName: { type: String, required: true }, // e.g., "Apple"
    modelName: { type: String, required: true }, // e.g., "iPhone 15 Pro"
    deviceType: { type: String, required: true }, // e.g., "Smartphone"

    // Repair Info
    expectedRepairs: [{ type: String }], // e.g., ["Screen Replacement", "Battery"]
    additionalNote: { type: String, default: "" },

    // Appointment Logic
    appointmentDate: {
        type: Date,
        required: true
    },

    // Status Tracking
    status: {
        type: String,
        enum: [
            'awaiting confirmation',
            'booking confirmed',
            'device received',
            'repair in progress',
            'pending payment',
            'payment complete',
            'repaired',
            'cancelled',
            'no show'
        ],
        default: 'awaiting confirmation'
    },

    // Financials
    initialExpectedPrice: { type: Number, required: true },
    finalPricePaid: { type: Number, default: 0 },

    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the 'updatedAt' field on every save
bookingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('Booking', bookingSchema, "bookingsCollection");