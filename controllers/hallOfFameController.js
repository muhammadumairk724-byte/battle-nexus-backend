const HallOfFame = require('../models/HallOfFame');

exports.getAll = async (req, res) => {
    try {
        const entries = await HallOfFame.findAll();
        return res.json({ hallOfFame: entries });
    } catch (err) {
        console.error('Hall of Fame error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};