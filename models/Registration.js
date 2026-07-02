const { query, queryOne, insert, update } = require('../config/database');

const Registration = {
    create: (data) => {
        const { userId, tournamentId, teamName, playerUid, playerUid2, playerUid3, playerUid4, whatsapp, paymentMethod, transactionId, paymentScreenshot } = data;
        return insert(
            `INSERT INTO registrations
             (user_id, tournament_id, team_name, player_uid, player_uid_2, player_uid_3, player_uid_4,
              whatsapp_number, payment_method, transaction_id, payment_screenshot, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [userId, tournamentId, teamName || null, playerUid, playerUid2 || null, playerUid3 || null, playerUid4 || null,
             whatsapp, paymentMethod, transactionId, paymentScreenshot || null]
        );
    },
    findByUserAndTournament: (userId, tournamentId) => {
        return queryOne('SELECT id FROM registrations WHERE user_id = ? AND tournament_id = ?', [userId, tournamentId]);
    },
    findByUser: (userId) => {
        return query(
            `SELECT r.*, t.name as tournament_name, t.type, t.date_time, t.map
             FROM registrations r JOIN tournaments t ON r.tournament_id = t.id
             WHERE r.user_id = ? ORDER BY r.registered_at DESC`,
            [userId]
        );
    },
    findAll: (status = null) => {
        let sql = `
            SELECT r.*, u.username, u.email, u.full_name, t.name as tournament_name
            FROM registrations r
            JOIN users u ON r.user_id = u.id
            JOIN tournaments t ON r.tournament_id = t.id
            WHERE 1=1
        `;
        const params = [];
        if (status && status !== 'all') {
            sql += ' AND r.status = ?';
            params.push(status);
        }
        sql += ' ORDER BY r.registered_at DESC';
        return query(sql, params);
    },
    findById: (id) => {
        return queryOne(
            `SELECT r.*, t.name as tournament_name, t.id as tournament_id, t.max_slots, t.filled_slots,
                    u.username, u.full_name, u.phone
             FROM registrations r
             JOIN tournaments t ON r.tournament_id = t.id
             JOIN users u ON r.user_id = u.id
             WHERE r.id = ?`,
            [id]
        );
    },
    updateStatus: (id, status) => update('UPDATE registrations SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]),
    delete: (id) => update('DELETE FROM registrations WHERE id = ?', [id])
};

module.exports = Registration;