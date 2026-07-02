function isValidEmail(email) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}
function isValidUsername(username) {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}
function isValidPhone(phone) {
    return /^(03\d{9}|\+923\d{9})$/.test(phone);
}
function isValidPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}
function isValidUID(uid) {
    return /^\d{6,12}$/.test(uid);
}
function sanitizeString(str) {
    if (!str) return '';
    return str.trim().replace(/[<>]/g, '');
}
module.exports = {
    isValidEmail,
    isValidUsername,
    isValidPhone,
    isValidPassword,
    isValidUID,
    sanitizeString
};