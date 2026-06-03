const express = require('express');
const router = express.Router();
const {
  createDiscussion,
  getDiscussionsByGroup,
  getDiscussionById,
  addReply,
  updateDiscussion,
  deleteDiscussion,
  togglePin
} = require('../controllers/discussionController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createDiscussion);
router.get('/group/:groupId', protect, getDiscussionsByGroup);
router.get('/:id', protect, getDiscussionById);
router.post('/:id/reply', protect, addReply);
router.put('/:id', protect, updateDiscussion);
router.delete('/:id', protect, deleteDiscussion);
router.post('/:id/pin', protect, togglePin);

module.exports = router;

