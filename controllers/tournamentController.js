const Tournament = require('../models/Tournament');

exports.getAll = async (req, res) => {
    try {
        const { type, map, status } = req.query;
        const tournaments = await Tournament.findAll({ type, map, status });
        return res.json({ tournaments });
    } catch (err) {
        console.error('Tournaments fetch error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.getOne = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
        return res.json({ tournament });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
};