import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    bookingReference: {
        type: String,
        unique: true,
        default: () => `BR-${Math.floor(100000 + Math.random() * 900000)}`
    },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    brandName: { type: String, required: true },
    modelName: { type: String, required: true },
    deviceType: { type: String, required: true },
    expectedRepairs: [{ type: String }],
    additionalNote: { type: String, default: "" },
    appointmentDate: { type: Date, required: true },
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
    initialExpectedPrice: { type: Number, required: true },
    finalPricePaid: { type: Number, default: 0 },
}, { 
    timestamps: true,
    collection: "bookingsCollection" 
});

export default mongoose.model('Booking', bookingSchema);