const express = require('express');
const router = express.Router();
const Franchise = require('../models/Franchise');

// Get all active franchises
router.get('/', async (req, res) => {
    try {
        const query = req.query.city ? { city: req.query.city, isActive: true } : { isActive: true };
        const franchises = await Franchise.find(query).sort({ city: 1, name: 1 });
        res.json(franchises);
    } catch (error) {
        res.status(500).json({ error: { message: 'Server Error' } });
    }
});

// Seed some test franchises
router.post('/seed', async (req, res) => {
    try {
        await Franchise.deleteMany({});
        const data = [
            { name: "FlavorHub Central", city: "New York", address: "123 Main St, New York, NY", location: { lat: 40.7128, lng: -74.0060 } },
            { name: "FlavorHub Downtown", city: "New York", address: "456 Broadway, New York, NY", location: { lat: 40.7118, lng: -74.0020 } },
            { name: "FlavorHub West", city: "Los Angeles", address: "789 Hollywood Blvd, LA, CA", location: { lat: 34.0522, lng: -118.2437 } },
            { name: "FlavorHub North", city: "Chicago", address: "321 Michigan Ave, Chicago, IL", location: { lat: 41.8781, lng: -87.6298 } }
        ];
        const franchises = await Franchise.insertMany(data);
        res.status(201).json({ message: 'Franchises seeded', count: franchises.length, franchises });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

module.exports = router;
