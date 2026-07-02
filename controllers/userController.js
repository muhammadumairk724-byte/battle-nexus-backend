const User = require('../models/User');
const UserActivity = require('../models/UserActivity');

exports.getAll = async (req, res) => {
    try {
        const users = await User.getAll();
        return res.json({ users });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.getActivity = async (req, res) => {
    try {
        const logs = await UserActivity.getByUser(req.params.id);
        return res.json({ activity: logs });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.delete = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.role === 'admin') {
            return res.status(403).json({ error: 'Cannot delete admin users' });
        }
        await User.delete(userId);
        return res.json({ message: 'User deleted successfully' });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.toggleActive = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const newStatus = user.is_active ? 0 : 1;
        await User.toggleActive(userId, newStatus);
        return res.json({ message: `User ${newStatus ? 'activated' : 'deactivated'} successfully` });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
};