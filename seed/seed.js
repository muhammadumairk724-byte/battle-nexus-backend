require('dotenv').config();
const { query, queryOne, insert, connectDB } = require('../config/database');
const { hashPassword } = require('../config/auth');

const ADMIN_EMAIL = 'battlenexusAdmin@gmail.com';
const ADMIN_PASSWORD = 'AdminUmairkhan@13';
const ADMIN_USERNAME = 'BattleNexusAdmin';

async function seed() {
    try {
        await connectDB();

        const existing = await queryOne('SELECT id FROM users WHERE email = ?', [ADMIN_EMAIL]);
        if (existing) {
            console.log('✅ Admin user already exists.');
            process.exit(0);
        }

        const hashed = hashPassword(ADMIN_PASSWORD);
        const id = await insert(
            `INSERT INTO users (email, password_hash, full_name, username, role, is_active)
             VALUES (?, ?, ?, ?, 'admin', TRUE)`,
            [ADMIN_EMAIL, hashed, 'Battle Nexus Admin', ADMIN_USERNAME]
        );

        console.log(`✅ Super Admin created! (ID: ${id})`);
        console.log(`   Email: ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);

        const now = new Date();
        const future = new Date(now);
        future.setDate(future.getDate() + 3);
        future.setHours(21, 0, 0, 0);

        await insert(
            `INSERT INTO tournaments (name, game, type, map, prize_pool, entry_fee, max_slots, filled_slots, date_time, status, description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Battle Royale Open', 'Free Fire', 'squad', 'Bermuda', 50000, 200, 48, 40, future, 'upcoming', 'Join the ultimate squad battle!']
        );

        const future2 = new Date(now);
        future2.setDate(future2.getDate() + 1);
        future2.setHours(20, 0, 0, 0);

        await insert(
            `INSERT INTO tournaments (name, game, type, map, prize_pool, entry_fee, max_slots, filled_slots, date_time, status, description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Desert Storm Cup', 'Free Fire', 'solo', 'Purgatory', 15000, 100, 48, 28, future2, 'upcoming', 'Solo warriors, claim your glory!']
        );

        console.log('✅ Sample tournaments seeded.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    }
}

seed();