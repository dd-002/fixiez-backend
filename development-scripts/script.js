import mongoose from 'mongoose';
// Import your model - adjust path as needed
import Shop from '../src/models/shops.js'
const MONGO_URI = "mongodb://dd002:dipayan2002@localhost:27017/Fixiez?authSource=Fixiez";

const NEIGHBORHOODS = [
    "Colaba", "Dadar", "Bandra West", "Andheri East", "Juhu", "Borivali", 
    "Ghatkopar", "Powai", "Chembur", "Worli", "Lower Parel", "Kandivali", 
    "Malad", "Mulund", "Kurla", "Vile Parle", "Santacruz"
];

const SHOP_NAMES = ["iFix", "Quick Repair", "Mobile Solutions", "Tech Hub", "The Repair Shop", "Gadget Care"];
const DEVICES = ["Smartphone", "Tablet", "Laptop", "Smartwatch"];
const SERVICES = [
    { name: "Screen Replacement", min: 1500, max: 8000 },
    { name: "Battery Swap", min: 800, max: 3000 },
    { name: "Charging Port Fix", min: 500, max: 1500 },
    { name: "Water Damage Repair", min: 1000, max: 5000 }
];

const getRandom = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateRandomShop = (index) => {
    const neighborhood = NEIGHBORHOODS[getRandomInt(0, NEIGHBORHOODS.length - 1)];
    const shopNameBase = SHOP_NAMES[getRandomInt(0, SHOP_NAMES.length - 1)];
    
    // Mumbai Bounding Box logic
    // Longitude: 72.77 to 73.00 | Latitude: 18.89 to 19.27
    const lng = getRandom(72.77, 73.00);
    const lat = getRandom(18.89, 19.27);

    return {
        name: `${shopNameBase} ${neighborhood} #${index}`,
        address: `${getRandomInt(1, 500)}, Link Road, ${neighborhood}, Mumbai`,
        phone: `+91 98${getRandomInt(10000000, 99999999)}`,
        rating: parseFloat(getRandom(3.5, 5.0).toFixed(1)),
        numberOfRatings: getRandomInt(10, 500),
        description: `Premium repair services located in the heart of ${neighborhood}.`,
        imageUrls: [`https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=600&h=400&fit=crop`],
        timings: [
            { day: 'Monday', isOpen: true, openAt: "09:00 AM", closeAt: "09:00 PM" },
            { day: 'Tuesday', isOpen: true, openAt: "09:00 AM", closeAt: "09:00 PM" },
            { day: 'Wednesday', isOpen: true, openAt: "09:00 AM", closeAt: "09:00 PM" },
            { day: 'Thursday', isOpen: true, openAt: "09:00 AM", closeAt: "09:00 PM" },
            { day: 'Friday', isOpen: true, openAt: "09:00 AM", closeAt: "09:00 PM" },
            { day: 'Saturday', isOpen: true, openAt: "10:00 AM", closeAt: "07:00 PM" },
            { day: 'Sunday', isOpen: false }
        ],
        location: {
            type: 'Point',
            coordinates: [lng, lat] // [Long, Lat] is mandatory for 2dsphere
        },
        devicesSupported: DEVICES.slice(0, getRandomInt(1, 4)),
        repairServices: SERVICES.map(s => ({
            serviceName: s.name,
            price: getRandomInt(s.min, s.max)
        })),
        openingHours: "9:00 AM - 9:00 PM"
    };
};

async function seedDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        // Clear existing data (Optional)
        // await Shop.deleteMany({});

        const shops = [];
        for (let i = 1; i <= 300; i++) {
            shops.push(generateRandomShop(i));
        }

        await Shop.insertMany(shops);
        console.log(`Successfully added ${shops.length} shops in Mumbai!`);
        
        process.exit();
    } catch (err) {
        console.error("Error seeding database:", err);
        process.exit(1);
    }
}

seedDB();