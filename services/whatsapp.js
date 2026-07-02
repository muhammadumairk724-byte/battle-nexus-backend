async function sendWhatsApp(to, message) {
    console.log(`[WHATSAPP] To: ${to} | Message: ${message}`);
    return { sid: 'dummy' };
}
function buildApprovalMessage(tournamentName, teamName, dateTime) {
    return `✅ Registration approved for ${tournamentName}`;
}
function buildDisapprovalMessage(tournamentName, reason) {
    return `❌ Registration declined for ${tournamentName}`;
}
module.exports = { sendWhatsApp, buildApprovalMessage, buildDisapprovalMessage };