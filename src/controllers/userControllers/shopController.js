import Shop from '../../models/shops.js'

const getShops = async (req, res) => {
    try {
        const { 
            lng, 
            lat, 
            devices, 
            page = 1, 
            limit = 10, 
            maxDistance = 5000 // Default to 5km
        } = req.body;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const queryPipeline = [];

        // 1. Geospatial Filter (MUST be the first stage in the pipeline)
        if (lng && lat) {
            queryPipeline.push({
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    distanceField: "distance", // Adds 'distance' (in meters) to each document
                    maxDistance: parseInt(maxDistance),
                    spherical: true
                }
            });
        }

        // 2. Devices Supported Filter
        const matchStage = {};
        if (devices) {
            // Expecting 'devices' as a comma-separated string: "Smartphone,Tablet"
            const deviceArray = devices.split(',');
            matchStage.devicesSupported = { $in: deviceArray };
        }

        if (Object.keys(matchStage).length > 0) {
            queryPipeline.push({ $match: matchStage });
        }

        // 3. Faceted Navigation for Pagination
        // This allows us to get both the data and the total count in one query
        queryPipeline.push({
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $skip: skip },
                    { $limit: parseInt(limit) },
                    { $sort: { rating: -1 } } // Secondary sort by rating if needed
                ]
            }
        });

        const result = await Shop.aggregate(queryPipeline);

        const shops = result[0].data;
        const total = result[0].metadata[0]?.total || 0;

        res.status(200).json({
            success: true,
            count: shops.length,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            data: shops
        });

    } catch (error) {
        console.error("Error fetching shops:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

export {
    getShops
}