const { query, queryOne, insert, update } = require('../config/database');

const Leaderboard = {
    findAll: (tournamentId = null) => {
        let sql = `
            SELECT l.*, u.username, u.full_name
            FROM leaderboard l
            JOIN users u ON l.user_id = u.id
        `;
        const params = [];
        if (tournamentId) {
            sql += ' WHERE l.tournament_id = ?';
            params.push(tournamentId);
        }
        sql += ' ORDER BY l.`rank` ASC, l.score DESC LIMIT 100';
        return query(sql, params);
    },
    findByUserAndTournament: (userId, tournamentId) => {
        return queryOne('SELECT id FROM leaderboard WHERE user_id = ? AND tournament_id = ?', [userId, tournamentId]);
    },
    upsert: (data) => {
        const { userId, tournamentId, rank, score, kills, booyahs } = data;
        return new Promise(async (resolve, reject) => {
            try {
                const existing = await queryOne('SELECT id FROM leaderboard WHERE user_id = ? AND tournament_id = ?', [userId, tournamentId]);
                if (existing) {
                    const affected = await update(
                        `UPDATE leaderboard SET \`rank\` = ?, score = ?, kills = ?, booyahs = ?, updated_at = NOW()
                         WHERE user_id = ? AND tournament_id = ?`,
                        [rank || null, score || 0, kills || 0, booyahs || 0, userId, tournamentId]
                    );
                    resolve(affected);
                } else {
                    const id = await insert(
                        `INSERT INTO leaderboard (user_id, tournament_id, \`rank\`, score, kills, booyahs)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [userId, tournamentId, rank || null, score || 0, kills || 0, booyahs || 0]
                    );
                    resolve(id);
                }
            } catch (err) {
                reject(err);
            }
        });
    },
    delete: (id) => update('DELETE FROM leaderboard WHERE id = ?', [id])
};

module.exports = Leaderboard;