const Leaderboard = require('../models/Leaderboard');

exports.getAll = async (req, res) => {
    try {
        const { tournamentId } = req.query;
        const entries = await Leaderboard.findAll(tournamentId);
        return res.json({ leaderboard: entries });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
};