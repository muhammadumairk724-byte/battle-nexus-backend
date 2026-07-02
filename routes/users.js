const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/admin');
const userController = require('../controllers/userController');

router.get('/', requireAdmin, userController.getAll);
router.get('/:id/activity', requireAdmin, userController.getActivity);
router.delete('/:id', requireAdmin, userController.delete);
router.patch('/:id/toggle', requireAdmin, userController.toggleActive);

module.exports = router;