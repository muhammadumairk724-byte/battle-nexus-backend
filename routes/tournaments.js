const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');

router.get('/', tournamentController.getAll);
router.get('/:id', tournamentController.getOne);

module.exports = router;