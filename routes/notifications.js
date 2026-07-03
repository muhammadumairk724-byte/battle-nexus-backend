const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Notification = require('../models/Notification');

// Get unread notifications
router.get('/unread', authenticate, async (req, res) => {
    try {
        const notifications = await Notification.getUnread(req.user.id);
        res.json({ notifications });
    } catch (err) {
        console.error('Unread notifications error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all notifications (last 50)
router.get('/all', authenticate, async (req, res) => {
    try {
        const notifications = await Notification.getAll(req.user.id);
        res.json({ notifications });
    } catch (err) {
        console.error('All notifications error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark a single notification as read
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        const affected = await Notification.markRead(req.params.id, req.user.id);
        if (affected === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json({ message: 'Notification marked as read' });
    } catch (err) {
        console.error('Mark read error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark all notifications as read
router.put('/read-all', authenticate, async (req, res) => {
    try {
        await Notification.markAllRead(req.user.id);
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Mark all read error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
