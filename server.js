require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/database');

const authRoutes = require('./routes/auth');
const tournamentRoutes = require('./routes/tournaments');
const registrationRoutes = require('./routes/registrations');
const leaderboardRoutes = require('./routes/leaderboard');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications'); // <-- added

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed from ' + origin));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes); // <-- added

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Battle Nexus API running' });
});

async function start() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Battle Nexus API running on port ${PORT}`);
    });
}
start().catch(console.error);