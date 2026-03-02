import Shop from '../../models/shops.js';

const getShops = async (req, res) => {
    try {
        // Destructure from req.body instead of req.query
        const { 
            lng, 
            lat, 
            devices = [], // Array of strings: ["Smartphone", "Tablet"]
            page = 1, 
            limit = 4, 
            maxDistance = 10000 // Default 10km for Mumbai traffic context
        } = req.body;

        const skip = (page - 1) * limit;
        const pipeline = [];

        // 1. Geospatial Stage: Find shops near coordinates
        // This stage MUST be first for the 2dsphere index to work
        if (lng && lat) {
            pipeline.push({
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    distanceField: "distance", 
                    maxDistance: parseInt(maxDistance),
                    spherical: true
                }
            });
        }

        // 2. Filtering Stage: Match devices
        const matchConditions = {};
        if (devices.length > 0) {
            // Finds shops that support ANY of the selected devices
            matchConditions.devicesSupported = { $in: devices };
        }

        if (Object.keys(matchConditions).length > 0) {
            pipeline.push({ $match: matchConditions });
        }

        // 3. Pagination & Metadata Stage
        pipeline.push({
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $sort: { rating: -1, distance: 1 } }, // Best rated and closest first
                    { $skip: skip },
                    { $limit: limit }
                ]
            }
        });

        const [result] = await Shop.aggregate(pipeline);

        const shops = result.data;
        const total = result.metadata[0]?.total || 0;

        res.status(200).json({
            success: true,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
            },
            data: shops
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export { getShops }