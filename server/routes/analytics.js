const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.get('/dashboard', getDashboardData);

module.exports = router;
