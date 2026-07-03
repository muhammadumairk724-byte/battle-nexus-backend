const { query, insert } = require('../config/database');

const UserActivity = {
    log: (userId, action) => insert('INSERT INTO user_activity (user_id, action) VALUES (?, ?)', [userId, action]),
    getByUser: (userId) => {
        return query('SELECT * FROM user_activity WHERE user_id = ? ORDER BY timestamp DESC LIMIT 100', [userId]);
    }
};

module.exports = UserActivity;