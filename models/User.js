const { query, queryOne, insert, update } = require('../config/database');

const User = {
    findByEmail: (email) => queryOne('SELECT * FROM users WHERE email = ?', [email]),
    findByUsername: (username) => queryOne('SELECT * FROM users WHERE username = ?', [username]),
    findById: (id) => queryOne('SELECT id, full_name, username, email, phone, role, is_active, created_at, last_login FROM users WHERE id = ?', [id]),
    create: (fullName, username, email, phone, hashedPassword) => {
        return insert(
            `INSERT INTO users (full_name, username, email, phone, password_hash, role)
             VALUES (?, ?, ?, ?, ?, 'user')`,
            [fullName, username, email, phone || null, hashedPassword]
        );
    },
    updateLastLogin: (userId) => update('UPDATE users SET last_login = NOW() WHERE id = ?', [userId]),
    getAll: () => query(
        `SELECT u.id, u.email, u.username, u.full_name, u.phone, u.role, u.is_active,
                u.created_at, u.last_login,
                (SELECT COUNT(*) FROM registrations r WHERE r.user_id = u.id) as total_registrations
         FROM users u ORDER BY u.created_at DESC`
    ),
    delete: (userId) => update('DELETE FROM users WHERE id = ?', [userId]),
    toggleActive: (userId, status) => update('UPDATE users SET is_active = ? WHERE id = ?', [status, userId]),

    // Reset password methods
    updateResetToken: (userId, token, expires) => {
        return update('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [token, expires, userId]);
    },
    findByResetToken: (token) => {
        return queryOne('SELECT id, email, username FROM users WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);
    },
    updatePassword: (userId, hashedPassword) => {
        return update('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);
    },
    clearResetToken: (userId) => {
        return update('UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [userId]);
    }
};

module.exports = User;