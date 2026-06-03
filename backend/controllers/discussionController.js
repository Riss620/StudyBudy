const Discussion = require('../models/Discussion');
const Group = require('../models/Group');
const { validateDiscussionInput } = require('../middleware/validation');
const { createAndEmitNotification } = require('../services/socketService');

// @desc    Create a new discussion
// @route   POST /api/discussions
// @access  Private
const createDiscussion = async (req, res) => {
  try {
    const { title, content, groupId, tags } = req.body;

    // Validate input
    const errors = validateDiscussionInput({ title, content });
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    // Check if user is a member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'You must be a member of this group to create discussions' });
    }

    const discussion = await Discussion.create({
      title: title.trim(),
      content: content.trim(),
      author: req.user._id,
      group: groupId,
      tags: tags || []
    });

    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate('author', 'name email avatar')
      .populate('group', 'name subject');

    // Emit notification to group members
    const io = req.app.io;
    if (io) {
      const groupMembers = group.members.filter(id => !id.equals(req.user._id));
      
      await createAndEmitNotification(io, {
        recipient: groupMembers[0],
        sender: req.user._id,
        type: 'message',
        title: `New Discussion in ${group.name}`,
        message: `${req.user.name} posted: "${title}"`,
        group: groupId,
        discussion: discussion._id,
        link: `/groups/${groupId}`,
        icon: 'message-square'
      }, groupMembers);

      // Emit to all group members via socket
      io.to(`group_${groupId}`).emit('new_discussion', {
        discussion: populatedDiscussion,
        author: req.user
      });
    }

    res.status(201).json(populatedDiscussion);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors)[0].message });
    }
    res.status(500).json({ message: 'Failed to create discussion' });
  }
};

// @desc    Get discussions by group
// @route   GET /api/discussions/group/:groupId
// @access  Private
const getDiscussionsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if user is a member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const discussions = await Discussion.find({ group: groupId })
      .populate('author', 'name email avatar')
      .populate('replies.user', 'name email avatar')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get discussion by ID
// @route   GET /api/discussions/:id
// @access  Private
const getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'name email avatar')
      .populate('group', 'name subject')
      .populate('replies.user', 'name email avatar');

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is a member of the group
    const group = await Group.findById(discussion.group._id);
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add reply to discussion
// @route   POST /api/discussions/:id/reply
// @access  Private
const addReply = async (req, res) => {
  try {
    const { content } = req.body;

    // Validate input
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is a member of the group
    const group = await Group.findById(discussion.group);
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'You must be a member of this group to reply' });
    }

    const reply = {
      user: req.user._id,
      content: content.trim()
    };

    discussion.replies.push(reply);
    await discussion.save();

    const updatedDiscussion = await Discussion.findById(discussion._id)
      .populate('author', 'name email avatar')
      .populate('group', 'name subject')
      .populate('replies.user', 'name email avatar');

    res.json(updatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add reply' });
  }
};

// @desc    Update discussion
// @route   PUT /api/discussions/:id
// @access  Private (Author only)
const updateDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is the author
    if (discussion.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this discussion' });
    }

    const { title, content, tags } = req.body;

    // Validate if updating content
    if (title || content) {
      const errors = validateDiscussionInput({ 
        title: title || discussion.title, 
        content: content || discussion.content 
      });
      if (errors.length > 0) {
        return res.status(400).json({ message: errors[0] });
      }
    }

    if (title) discussion.title = title.trim();
    if (content) discussion.content = content.trim();
    if (tags) discussion.tags = Array.isArray(tags) ? tags : [tags];

    await discussion.save();

    const updatedDiscussion = await Discussion.findById(discussion._id)
      .populate('author', 'name email avatar')
      .populate('group', 'name subject')
      .populate('replies.user', 'name email avatar');

    res.json(updatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update discussion' });
  }
};

// @desc    Delete discussion
// @route   DELETE /api/discussions/:id
// @access  Private (Author or Group Creator)
const deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const group = await Group.findById(discussion.group);

    // Check if user is author or group creator
    if (
      discussion.author.toString() !== req.user._id.toString() &&
      group.creator.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this discussion' });
    }

    await discussion.deleteOne();
    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle pin discussion
// @route   POST /api/discussions/:id/pin
// @access  Private (Group Creator only)
const togglePin = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const group = await Group.findById(discussion.group);

    // Check if user is group creator
    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only group creator can pin discussions' });
    }

    discussion.isPinned = !discussion.isPinned;
    await discussion.save();

    const updatedDiscussion = await Discussion.findById(discussion._id)
      .populate('author', 'name email avatar')
      .populate('group', 'name subject')
      .populate('replies.user', 'name email avatar');

    res.json(updatedDiscussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDiscussion,
  getDiscussionsByGroup,
  getDiscussionById,
  addReply,
  updateDiscussion,
  deleteDiscussion,
  togglePin
};

