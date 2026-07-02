const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const { hashPassword, comparePassword, signToken, verifyToken } = require('../config/auth');
const { isValidEmail, isValidUsername, isValidPhone, isValidPassword } = require('../utils/validators');

// ── REGISTER ──
exports.register = async (req, res) => {
    try {
        const { fullName, username, email, phone, password } = req.body;

        if (!fullName || !username || !email || !password) {
            return res.status(400).json({ error: 'All required fields must be filled' });
        }
        if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email' });
        if (!isValidUsername(username)) return res.status(400).json({ error: 'Invalid username (3-20 chars, letters/numbers/_)' });
        if (phone && !isValidPhone(phone)) return res.status(400).json({ error: 'Invalid phone number' });
        if (!isValidPassword(password)) {
            return res.status(400).json({ error: 'Password must be 8+ chars with uppercase, lowercase, number' });
        }

        const existingEmail = await User.findByEmail(email);
        if (existingEmail) return res.status(409).json({ error: 'Email already registered' });

        const existingUser = await User.findByUsername(username);
        if (existingUser) return res.status(409).json({ error: 'Username already taken' });

        const hashed = hashPassword(password);
        const userId = await User.create(fullName, username, email, phone, hashed);
        await UserActivity.log(userId, 'registered');

        return res.status(201).json({ message: 'Account created successfully', userId });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Server error during registration' });
    }
};

// ── LOGIN ──
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const user = await User.findByEmail(email);
        if (!user || !comparePassword(password, user.password_hash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (!user.is_active) {
            return res.status(403).json({ error: 'Account is disabled' });
        }

        await User.updateLastLogin(user.id);
        await UserActivity.log(user.id, 'login');

        const isAdmin = user.role === 'admin';
        const token = signToken({ id: user.id, email: user.email, username: user.username, role: user.role }, isAdmin);

        const response = {
            message: 'Login successful',
            user: { id: user.id, fullName: user.full_name, username: user.username, email: user.email, role: user.role },
            token,
            isAdmin
        };

        const cookieName = isAdmin ? 'adminToken' : 'token';
        res.cookie(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
        return res.json(response);
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Server error during login' });
    }
};

// ── LOGOUT ──
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.clearCookie('adminToken');
    return res.json({ message: 'Logged out successfully' });
};

// ── ME ──
exports.me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.json({ user });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
};

// ── FORGOT PASSWORD ──
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'No account found with this email' });
        }

        const resetToken = signToken({ id: user.id, purpose: 'reset' }, false, '1h');
        const expires = new Date(Date.now() + 3600000);
        await User.updateResetToken(user.id, resetToken, expires);

        const resetLink = `${process.env.CLIENT_URL}/reset-password.html?token=${resetToken}`;
        console.log(`🔑 Reset link: ${resetLink}`);

        return res.json({
            message: 'Password reset link has been sent to your email (check console).',
            resetLink // remove this in production
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

// ── RESET PASSWORD ──
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password required' });
        }
        if (!isValidPassword(newPassword)) {
            return res.status(400).json({ error: 'Password must be 8+ chars with uppercase, lowercase, number' });
        }

        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (err) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        const user = await User.findByResetToken(token);
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        const hashed = hashPassword(newPassword);
        await User.updatePassword(user.id, hashed);
        await User.clearResetToken(user.id);
        await UserActivity.log(user.id, 'password_reset');

        return res.json({ message: 'Password reset successfully. Please login.' });
    } catch (err) {
        console.error('Reset password error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};