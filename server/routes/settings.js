const express = require('express');
const router = express.Router();
const { getSystemSettings, updateSystemSettings } = require('../controllers/settingsController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.use(authorizeRoles(['ADMIN']));
router.get('/', getSystemSettings);
router.put('/', updateSystemSettings);

module.exports = router;
