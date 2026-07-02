const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Registration = require('../models/Registration');
const Leaderboard = require('../models/Leaderboard');
const UserActivity = require('../models/UserActivity');
const { sendWhatsApp, buildApprovalMessage, buildDisapprovalMessage } = require('../services/whatsapp');

// ── Dashboard Stats ──
exports.getStats = async (req, res) => {
    try {
        const totalUsers = (await User.getAll()).length;
        const totalTournaments = (await Tournament.findAll()).length;
        const pendingRegs = (await Registration.findAll('pending')).length;
        const totalRegs = (await Registration.findAll()).length;
        return res.json({
            stats: { totalUsers, totalTournaments, pendingRegistrations: pendingRegs, totalRegistrations: totalRegs }
        });
    } catch (err) {
        console.error('Stats error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

// ── Tournament CRUD ──
exports.createTournament = async (req, res) => {
    try {
        console.log('📥 Tournament payload:', req.body);
        const { name, game, type, map, prizePool, entryFee, maxSlots, dateTime, description } = req.body;
        if (!name || !type || !maxSlots || !dateTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const id = await Tournament.create({ name, game, type, map, prizePool, entryFee, maxSlots, dateTime, description });
        return res.status(201).json({ message: 'Tournament created', tournamentId: id });
    } catch (err) {
        console.error('Create tournament error:', err);
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};

exports.updateTournament = async (req, res) => {
    try {
        const { name, game, type, map, prizePool, entryFee, maxSlots, dateTime, description, status } = req.body;
        console.log('📥 Update tournament payload:', req.body);
        
        const updateData = {
            name: name || 'Untitled Tournament',
            game: game || 'Free Fire',
            type: type || 'squad',
            map: map || null,
            prizePool: prizePool !== undefined ? prizePool : 0,
            entryFee: entryFee !== undefined ? entryFee : 0,
            maxSlots: maxSlots || 48,
            dateTime: dateTime || new Date().toISOString(),
            description: description || null,
            status: status || 'upcoming'
        };

        await Tournament.update(req.params.id, updateData);
        return res.json({ message: 'Tournament updated successfully' });
    } catch (err) {
        console.error('Update tournament error:', err);
        return res.status(500).json({ error: 'Server error: ' + err.message });
    }
};

exports.deleteTournament = async (req, res) => {
    try {
        await Tournament.delete(req.params.id);
        return res.json({ message: 'Tournament deleted' });
    } catch (err) {
        console.error('Delete tournament error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

// ── Registration Management ──
exports.getRegistrations = async (req, res) => {
    try {
        const { status } = req.query;
        const registrations = await Registration.findAll(status);
        return res.json({ registrations });
    } catch (err) {
        console.error('Get registrations error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.approveRegistration = async (req, res) => {
    try {
        const regId = req.params.id;
        const reg = await Registration.findById(regId);
        if (!reg) return res.status(404).json({ error: 'Registration not found' });
        if (reg.status !== 'pending') {
            return res.status(400).json({ error: 'Registration already processed' });
        }
        if (reg.filled_slots >= reg.max_slots) {
            return res.status(400).json({ error: 'Tournament is full' });
        }

        await Registration.updateStatus(regId, 'approved');
        await Tournament.incrementFilledSlots(reg.tournament_id);
        await UserActivity.log(reg.user_id, `registration #${regId} approved for ${reg.tournament_name}`);

        try {
            const message = buildApprovalMessage(reg.tournament_name, reg.team_name || reg.username, reg.date_time);
            await sendWhatsApp(reg.whatsapp_number, message);
        } catch (waErr) {
            console.warn('⚠️ WhatsApp notification failed:', waErr.message);
        }

        return res.json({ message: 'Registration approved, slot incremented, notification sent' });
    } catch (err) {
        console.error('Approve registration error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.disapproveRegistration = async (req, res) => {
    try {
        const regId = req.params.id;
        const { reason } = req.body;
        const reg = await Registration.findById(regId);
        if (!reg) return res.status(404).json({ error: 'Registration not found' });
        if (reg.status !== 'pending') {
            return res.status(400).json({ error: 'Registration already processed' });
        }

        await Registration.updateStatus(regId, 'disapproved');
        await UserActivity.log(reg.user_id, `registration #${regId} disapproved for ${reg.tournament_name}`);

        try {
            const message = buildDisapprovalMessage(reg.tournament_name, reason);
            await sendWhatsApp(reg.whatsapp_number, message);
        } catch (waErr) {
            console.warn('⚠️ WhatsApp notification failed:', waErr.message);
        }

        return res.json({ message: 'Registration disapproved' });
    } catch (err) {
        console.error('Disapprove registration error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteRegistration = async (req, res) => {
    try {
        await Registration.delete(req.params.id);
        return res.json({ message: 'Registration deleted' });
    } catch (err) {
        console.error('Delete registration error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

// ── Leaderboard Management ──
exports.upsertLeaderboard = async (req, res) => {
    try {
        console.log('📥 Incoming leaderboard payload:', req.body);
        const { userId, tournamentId, rank, score, kills, booyahs } = req.body;

        if (!userId || !tournamentId) {
            return res.status(400).json({ error: 'User and tournament required' });
        }

        await Leaderboard.upsert({ userId, tournamentId, rank, score, kills, booyahs });
        console.log('✅ Leaderboard entry saved successfully');

        return res.json({ message: 'Leaderboard entry saved' });
    } catch (err) {
        console.error('❌ Leaderboard upsert error:', err);
        return res.status(500).json({
            error: 'Server error',
            details: err.message,
            sql: err.sql || null,
            sqlMessage: err.sqlMessage || null
        });
    }
};

exports.deleteLeaderboard = async (req, res) => {
    try {
        await Leaderboard.delete(req.params.id);
        return res.json({ message: 'Leaderboard entry deleted' });
    } catch (err) {
        console.error('Delete leaderboard error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};