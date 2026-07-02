const express = require('express');
const router = express.Router();
const hallOfFameController = require('../controllers/hallOfFameController');

router.get('/', hallOfFameController.getAll);

module.exports = router;