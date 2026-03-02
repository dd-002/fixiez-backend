import Booking from '../../models/bookingSchema.js';
import Shop from '../../models/shops.js';

const createBooking = async (req, res) => {
    try {
        const {
            shopId,
            brandName,
            modelName,
            deviceType,
            expectedRepairs,
            additionalNote,
            slotDate, // e.g., "2026-03-15"
            slotTime, // e.g., "14:30"
            initialExpectedPrice // Added to satisfy 'required' schema field
        } = req.body;

        // 1. Validate Shop Existence
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ success: false, message: "Service center not found" });
        }

        // 2. Construct the Appointment Date
        // Your schema uses 'appointmentDate' (Date type)
        const appointmentDate = new Date(`${slotDate}T${slotTime}:00`);

        // 3. Check Slot Availability (Concurrency Control)
        // We filter by checking if any booking exists within the same hour/slot
        const existingBookings = await Booking.countDocuments({
            shopId,
            appointmentDate: appointmentDate,
            status: { $ne: 'cancelled' }
        });

        if (existingBookings >= 3) {
            return res.status(400).json({ 
                success: false, 
                message: "This time slot is fully booked. Please select another time." 
            });
        }

        // 4. Create the Booking
        const newBooking = new Booking({
            shopId,
            userId: req.user._id, // Assumes auth middleware populates req.user
            brandName,
            modelName,
            deviceType,
            expectedRepairs: Array.isArray(expectedRepairs) ? expectedRepairs : [expectedRepairs],
            additionalNote,
            appointmentDate, // Matches Schema field name
            initialExpectedPrice: initialExpectedPrice || 0, // Matches Schema field name
            status: 'awaiting confirmation'
        });

        const savedBooking = await newBooking.save();

        res.status(201).json({
            success: true,
            message: "Booking request sent successfully",
            data: savedBooking
        });

    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};

export { createBooking };