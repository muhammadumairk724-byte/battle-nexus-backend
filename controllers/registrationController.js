const Registration = require('../models/Registration');
const Tournament = require('../models/Tournament');
const UserActivity = require('../models/UserActivity');
const { isValidUID, isValidPhone } = require('../utils/validators');

exports.submit = async (req, res) => {
    try {
        const {
            tournamentId, teamName, playerUid, playerUid2, playerUid3, playerUid4,
            whatsapp, paymentMethod, transactionId, paymentScreenshot
        } = req.body;
        const userId = req.user.id;

        if (!tournamentId || !playerUid || !whatsapp || !paymentMethod || !transactionId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (!isValidUID(playerUid)) {
            return res.status(400).json({ error: 'Invalid Player UID (6-12 digits)' });
        }
        if (!isValidPhone(whatsapp)) {
            return res.status(400).json({ error: 'Invalid WhatsApp number' });
        }

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
        if (tournament.filled_slots >= tournament.max_slots) {
            return res.status(400).json({ error: 'Tournament is full' });
        }
        if (tournament.status === 'completed') {
            return res.status(400).json({ error: 'Tournament already completed' });
        }

        const existing = await Registration.findByUserAndTournament(userId, tournamentId);
        if (existing) {
            return res.status(409).json({ error: 'Already registered for this tournament' });
        }

        const regId = await Registration.create({
            userId, tournamentId, teamName, playerUid, playerUid2, playerUid3, playerUid4,
            whatsapp, paymentMethod, transactionId, paymentScreenshot
        });

        await UserActivity.log(userId, `registered for tournament #${tournamentId}`);

        return res.status(201).json({
            message: 'Registration submitted successfully. Waiting for admin approval.',
            registrationId: regId
        });
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ error: 'Server error during registration' });
    }
};

exports.getMy = async (req, res) => {
    try {
        const registrations = await Registration.findByUser(req.user.id);
        return res.json({ registrations });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
};