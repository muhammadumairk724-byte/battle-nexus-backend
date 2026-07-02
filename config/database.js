const mysql = require('mysql2/promise');

let pool = null;

function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'battlenexus',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }
    return pool;
}

async function connectDB() {
    try {
        const conn = await getPool().getConnection();
        console.log('✅ MySQL connected successfully');
        conn.release();
        return pool;
    } catch (err) {
        console.error('❌ MySQL connection error:', err.message);
        throw err;
    }
}

async function query(sql, params = []) {
    const pool = getPool();
    const [rows] = await pool.execute(sql, params);
    return rows;
}

async function queryOne(sql, params = []) {
    const rows = await query(sql, params);
    return rows[0] || null;
}

async function insert(sql, params = []) {
    const pool = getPool();
    const [result] = await pool.execute(sql, params);
    return result.insertId;
}

async function update(sql, params = []) {
    const pool = getPool();
    const [result] = await pool.execute(sql, params);
    return result.affectedRows;
}

module.exports = {
    getPool,
    connectDB,
    query,
    queryOne,
    insert,
    update
};