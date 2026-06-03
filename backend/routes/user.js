const express = require('express');
const router = express.Router();
const { changePassword, deleteAccount } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Protect all routes with JWT authentication
router.use(protect);

router.put('/change-password', changePassword);
router.delete('/delete-account', deleteAccount);

module.exports = router;
