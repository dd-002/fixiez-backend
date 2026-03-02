import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "iRepair Hub"
    address: { type: String, required: true }, // e.g., "118 Market Street, San Francisco"
    phone: String,
    rating: { type: Number, default: 0 },
    numberOfRatings : {type:Number, default: 0},
    description: { type: String, default: "" },
    phone : {type:String, default:"0"},
    imageUrls : {type:[String], default:['https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=600&h=400&fit=crop']},
    timings: [
        {
            day: {
                type: String,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                required: true
            },
            isOpen: { type: Boolean, default: true },
            openAt: { type: String, default: "10:00 AM" }, // Format: "HH:mm" or "hh:mm A"
            closeAt: { type: String, default: "08:00 PM" }
        }
    ],

    // GeoJSON Point for Google Maps Integration
    location: {
        type: {
            type: String,
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number], // [Longitude, Latitude] 
            required: true
        }
    },

    // Supporting fields based on your UI
    devicesSupported: [String], // ["Smartphone", "Tablet"]
    repairServices: [{
        serviceName: String,
    }],
    openingHours: String
});

// CRITICAL: Create a geospatial index for distance-based searching
shopSchema.index({ location: '2dsphere' });

export default  mongoose.model('Shop', shopSchema, "shopsCollection");