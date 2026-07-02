const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/admin');
const adminController = require('../controllers/adminController');

router.get('/stats', requireAdmin, adminController.getStats);
router.post('/tournaments', requireAdmin, adminController.createTournament);
router.put('/tournaments/:id', requireAdmin, adminController.updateTournament);
router.delete('/tournaments/:id', requireAdmin, adminController.deleteTournament);
router.get('/registrations', requireAdmin, adminController.getRegistrations);
router.patch('/registrations/:id/approve', requireAdmin, adminController.approveRegistration);
router.patch('/registrations/:id/disapprove', requireAdmin, adminController.disapproveRegistration);
router.delete('/registrations/:id', requireAdmin, adminController.deleteRegistration);
router.post('/leaderboard', requireAdmin, adminController.upsertLeaderboard);
router.delete('/leaderboard/:id', requireAdmin, adminController.deleteLeaderboard);

module.exports = router;