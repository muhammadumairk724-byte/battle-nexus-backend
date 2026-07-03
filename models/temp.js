const { query, queryOne, insert, update } = require('../config/database');

const HallOfFame = {
    findAll: () => {
        return query(
            `SELECT h.*, u.username, u.full_name
             FROM hall_of_fame h
             JOIN users u ON h.user_id = u.id
             ORDER BY h.date DESC, h.created_at DESC LIMIT 20`
        );
    },
    create: (data) => {
        const { userId, title, description, icon, date } = data;
        return insert(
            `INSERT INTO hall_of_fame (user_id, title, description, icon, date)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, title, description || null, icon || '🏆', date || null]
        );
    },
    delete: (id) => update('DELETE FROM hall_of_fame WHERE id = ?', [id])
};

module.exports = HallOfFame;