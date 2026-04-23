const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');
const jwt = require('jsonwebtoken');

// GET all notifications (optionally for a user)
router.get('/', async (req, res) => {
    try {
        // Optionally require auth
        let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (e) { }
        }
        // Fetch all notifications, latest first
        const notifications = await Notification.find({})
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({ notifications });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
    }
});

module.exports = router;
