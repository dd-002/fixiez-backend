import Booking from '../../models/bookingSchema.js'
import Shop from '../../models/shops.js'

const createBooking = async (req, res) => {
    try {
        const {
            shopId,
            brandName,
            modelName,
            deviceType,
            expectedRepairs,
            additionalNote,
            slotDate,
            slotTime
        } = req.body;

        // 1. Validate Shop Existence
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ success: false, message: "Service center not found" });
        }

        // 2. Check Slot Availability (Concurrency Control)
        // Logic: Limit to 3 bookings per time slot per shop
        const existingBookings = await Booking.countDocuments({
            shopId,
            slotDate: new Date(slotDate),
            slotTime,
            status: { $ne: 'cancelled' } // Don't count cancelled bookings
        });

        if (existingBookings >= 3) {
            return res.status(400).json({ 
                success: false, 
                message: "This time slot is fully booked. Please select another time." 
            });
        }


        const appointmentDate = new Date(`${slotDate}T${slotTime}`);

        // 4. Create the Booking
        const newBooking = new Booking({
            shopId,
            userId: req.user._id, // Assumes user ID is available via auth middleware
            brandName,
            modelName,
            deviceType,
            expectedRepairs,
            additionalNote,
            appointmentDate,
            initialExpectedPrice: 0,
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