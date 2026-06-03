const Group = require('../models/Group');
const User = require('../models/User');
const { validateGroupInput } = require('../middleware/validation');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  try {
    const { name, description, subject, isPrivate, maxMembers } = req.body;

    // Validate input
    const errors = validateGroupInput({ name, description, subject, maxMembers });
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    // Check if group name already exists
    const existingGroup = await Group.findOne({ name: name.trim() });
    if (existingGroup) {
      return res.status(400).json({ message: 'A group with this name already exists' });
    }

    const group = await Group.create({
      name: name.trim(),
      description: description.trim(),
      subject: subject.trim(),
      isPrivate: isPrivate || false,
      maxMembers: maxMembers || 50,
      creator: req.user._id,
      members: [req.user._id]
    });

    // Add group to user's studyGroups
    await User.findByIdAndUpdate(req.user._id, {
      $push: { studyGroups: group._id }
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('creator', 'name email avatar')
      .populate('members', 'name email avatar');

    res.status(201).json(populatedGroup);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A group with this name already exists' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors)[0].message });
    }
    res.status(500).json({ message: 'Failed to create group' });
  }
};

// @desc    Get all groups
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ isPrivate: false })
      .populate('creator', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's groups
// @route   GET /api/groups/my-groups
// @access  Private
const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('creator', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get group by ID
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a group
// @route   POST /api/groups/:id/join
// @access  Private
const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if already a member
    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Group is full' });
    }

    group.members.push(req.user._id);
    await group.save();

    // Add group to user's studyGroups
    await User.findByIdAndUpdate(req.user._id, {
      $push: { studyGroups: group._id }
    });

    const updatedGroup = await Group.findById(group._id)
      .populate('creator', 'name email avatar')
      .populate('members', 'name email avatar');

    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave a group
// @route   POST /api/groups/:id/leave
// @access  Private
const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the creator
    if (group.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Creator cannot leave the group. Transfer ownership or delete the group.' });
    }

    // Remove user from members
    group.members = group.members.filter(
      member => member.toString() !== req.user._id.toString()
    );
    await group.save();

    // Remove group from user's studyGroups
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { studyGroups: group._id }
    });

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private (Creator only)
const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is creator
    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this group' });
    }

    const { name, description, subject, isPrivate, maxMembers } = req.body;

    // Validate updates if provided
    if (name) {
      const errors = validateGroupInput({ name, description: description || group.description, subject: subject || group.subject });
      if (errors.length > 0) {
        return res.status(400).json({ message: errors[0] });
      }
      group.name = name.trim();
    }
    
    if (description) group.description = description.trim();
    if (subject) group.subject = subject.trim();
    if (isPrivate !== undefined) group.isPrivate = isPrivate;
    if (maxMembers) {
      if (maxMembers < 2 || maxMembers > 500) {
        return res.status(400).json({ message: 'Max members must be between 2 and 500' });
      }
      group.maxMembers = maxMembers;
    }

    const updatedGroup = await group.save();

    const populatedGroup = await Group.findById(updatedGroup._id)
      .populate('creator', 'name email avatar')
      .populate('members', 'name email avatar');

    res.json(populatedGroup);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A group with this name already exists' });
    }
    res.status(500).json({ message: 'Failed to update group' });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private (Creator only)
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is creator
    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this group' });
    }

    await group.deleteOne();

    // Remove group from all members' studyGroups
    await User.updateMany(
      { studyGroups: group._id },
      { $pull: { studyGroups: group._id } }
    );

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getMyGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  updateGroup,
  deleteGroup
};

