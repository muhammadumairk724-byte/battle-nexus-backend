const { verifyToken } = require('../config/auth');

function requireAdmin(req, res, next) {
    const token = req.cookies?.adminToken || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Admin authentication required' });
    }
    try {
        const decoded = verifyToken(token, true);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired admin token' });
    }
}

module.exports = { requireAdmin };