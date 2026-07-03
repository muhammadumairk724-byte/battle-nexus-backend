const { query, queryOne, insert, update } = require('../config/database');

const Notification = {
    create: (userId, tournamentId, message, type = 'info') => {
        return insert(
            `INSERT INTO notifications (user_id, tournament_id, message, type)
             VALUES (?, ?, ?, ?)`,
            [userId, tournamentId, message, type]
        );
    },
    getUnread: (userId) => {
        return query(
            `SELECT n.*, t.name as tournament_name
             FROM notifications n
             LEFT JOIN tournaments t ON n.tournament_id = t.id
             WHERE n.user_id = ? AND n.is_read = FALSE
             ORDER BY n.created_at DESC`,
            [userId]
        );
    },
    getAll: (userId) => {
        return query(
            `SELECT n.*, t.name as tournament_name
             FROM notifications n
             LEFT JOIN tournaments t ON n.tournament_id = t.id
             WHERE n.user_id = ?
             ORDER BY n.created_at DESC
             LIMIT 50`,
            [userId]
        );
    },
    markRead: (notificationId, userId) => {
        return update(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [notificationId, userId]
        );
    },
    markAllRead: (userId) => {
        return update(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );
    }
};

module.exports = Notification;