const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroups,
  getMyGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  updateGroup,
  deleteGroup
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createGroup);
router.get('/', protect, getGroups);
router.get('/my-groups', protect, getMyGroups);
router.get('/:id', protect, getGroupById);
router.post('/:id/join', protect, joinGroup);
router.post('/:id/leave', protect, leaveGroup);
router.put('/:id', protect, updateGroup);
router.delete('/:id', protect, deleteGroup);

module.exports = router;

