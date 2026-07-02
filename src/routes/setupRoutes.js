const express = require('express');
const setupController = require('../controllers/setupController');

const router = express.Router();

router.get('/setup', setupController.showSetup);
router.post('/setup', setupController.storeSetup);

module.exports = router;
