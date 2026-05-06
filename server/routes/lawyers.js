const express = require('express');
const router = express.Router();
const { getLawyers, createLawyer, toggleLawyer } = require('../controllers/lawyerController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.get('/', getLawyers);
router.post('/', authorizeRoles(['ADMIN']), createLawyer);
router.patch('/:id/toggle', authorizeRoles(['ADMIN']), toggleLawyer);

module.exports = router;
