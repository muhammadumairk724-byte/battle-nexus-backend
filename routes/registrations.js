const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const registrationController = require('../controllers/registrationController');

router.post('/', authenticate, registrationController.submit);
router.get('/my', authenticate, registrationController.getMy);

module.exports = router;