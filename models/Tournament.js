const { query, queryOne, insert, update } = require('../config/database');

const toNull = (val) => (val === undefined ? null : val);

const Tournament = {
    findAll: (filters = {}) => {
        let sql = 'SELECT * FROM tournaments WHERE 1=1';
        const params = [];
        if (filters.type && filters.type !== 'all') {
            sql += ' AND type = ?';
            params.push(filters.type);
        }
        if (filters.map && filters.map !== 'all') {
            sql += ' AND map = ?';
            params.push(filters.map);
        }
        if (filters.status && filters.status !== 'all') {
            sql += ' AND status = ?';
            params.push(filters.status);
        }
        sql += ' ORDER BY date_time ASC';
        return query(sql, params);
    },
    findById: (id) => queryOne('SELECT * FROM tournaments WHERE id = ?', [id]),
    create: (data) => {
        const { name, game, type, map, prizePool, entryFee, maxSlots, dateTime, description } = data;
        return insert(
            `INSERT INTO tournaments (name, game, type, map, prize_pool, entry_fee, max_slots, filled_slots, date_time, description)
             VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
            [name, game || 'Free Fire', type, toNull(map), toNull(prizePool) || 0, toNull(entryFee) || 0, maxSlots, dateTime, toNull(description)]
        );
    },
    update: (id, data) => {
        const { name, game, type, map, prizePool, entryFee, maxSlots, dateTime, description, status } = data;
        return update(
            `UPDATE tournaments SET
                name = ?, game = ?, type = ?, map = ?,
                prize_pool = ?, entry_fee = ?,
                max_slots = ?, date_time = ?, description = ?, status = ?
             WHERE id = ?`,
            [
                name,
                game || 'Free Fire',
                type,
                toNull(map),
                toNull(prizePool) || 0,
                toNull(entryFee) || 0,
                maxSlots,
                dateTime,
                toNull(description),
                toNull(status) || 'upcoming',
                id
            ]
        );
    },
    delete: (id) => update('DELETE FROM tournaments WHERE id = ?', [id]),
    incrementFilledSlots: (id) => update('UPDATE tournaments SET filled_slots = filled_slots + 1 WHERE id = ?', [id])
};

module.exports = Tournament;