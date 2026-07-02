const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

function hashPassword(password) {
    return bcrypt.hashSync(password, 10);
}

function comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
}

// Allow custom expiry
function signToken(payload, isAdmin = false, expiresIn = null) {
    const secret = isAdmin ? ADMIN_JWT_SECRET : JWT_SECRET;
    const options = { expiresIn: expiresIn || JWT_EXPIRE };
    return jwt.sign(payload, secret, options);
}

function verifyToken(token, isAdmin = false) {
    const secret = isAdmin ? ADMIN_JWT_SECRET : JWT_SECRET;
    return jwt.verify(token, secret);
}

module.exports = {
    hashPassword,
    comparePassword,
    signToken,
    verifyToken
};