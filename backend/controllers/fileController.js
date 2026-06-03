const File = require('../models/File');
const Group = require('../models/Group');
const cloudinary = require('../config/cloudinary');
const { createAndEmitNotification } = require('../services/socketService');

// @desc    Upload file
// @route   POST /api/files/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { groupId, description } = req.body;

    if (!groupId) {
      // Remove from Cloudinary if groupId missing
      if (req.file.public_id) {
        await cloudinary.uploader.destroy(req.file.public_id, { resource_type: 'raw' }).catch(() => {});
      }
      return res.status(400).json({ message: 'Group ID is required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      if (req.file.public_id) {
        await cloudinary.uploader.destroy(req.file.public_id, { resource_type: 'raw' }).catch(() => {});
      }
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(req.user._id)) {
      if (req.file.public_id) {
        await cloudinary.uploader.destroy(req.file.public_id, { resource_type: 'raw' }).catch(() => {});
      }
      return res.status(403).json({ message: 'You must be a member of this group to upload files' });
    }

    const file = await File.create({
      filename: req.file.filename || req.file.public_id,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      // Store the Cloudinary secure URL as path
      path: req.file.path,
      // Store public_id for future deletion
      publicId: req.file.public_id,
      uploader: req.user._id,
      group: groupId,
      description: description || '',
    });

    const populatedFile = await File.findById(file._id)
      .populate('uploader', 'name email avatar')
      .populate('group', 'name subject');

    // Emit notification to group members
    const io = req.app.io;
    if (io) {
      const groupMembers = group.members.filter((id) => !id.equals(req.user._id));

      await createAndEmitNotification(
        io,
        {
          recipient: groupMembers[0],
          sender: req.user._id,
          type: 'file',
          title: `New File Shared in ${group.name}`,
          message: `${req.user.name} shared "${req.file.originalname}"`,
          group: groupId,
          file: file._id,
          link: `/groups/${groupId}`,
          icon: 'file',
        },
        groupMembers
      );

      io.to(`group_${groupId}`).emit('new_file', { file: populatedFile });
    }

    res.status(201).json(populatedFile);
  } catch (error) {
    console.error('uploadFile error:', error);
    // Clean up Cloudinary on unexpected error
    if (req.file && req.file.public_id) {
      await cloudinary.uploader.destroy(req.file.public_id, { resource_type: 'raw' }).catch(() => {});
    }
    res.status(500).json({ message: 'Failed to upload file' });
  }
};

// @desc    Get files by group
// @route   GET /api/files/group/:groupId
// @access  Private
const getFilesByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'You must be a member of this group to view files' });
    }

    const files = await File.find({ group: groupId })
      .populate('uploader', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch files' });
  }
};

// @desc    Download / redirect to file URL
// @route   GET /api/files/download/:id
// @access  Private
const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const group = await Group.findById(file.group);
    if (!group || !group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'You must be a member of this group to download files' });
    }

    // Increment download count
    file.downloads += 1;
    await file.save();

    // Redirect to the Cloudinary URL
    res.redirect(file.path);
  } catch (error) {
    res.status(500).json({ message: 'Failed to download file' });
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private (Uploader or Group Creator)
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const group = await Group.findById(file.group);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (
      file.uploader.toString() !== req.user._id.toString() &&
      group.creator.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'You are not authorized to delete this file' });
    }

    // Delete from Cloudinary
    if (file.publicId) {
      await cloudinary.uploader.destroy(file.publicId, { resource_type: 'raw' }).catch(() => {});
    }

    await file.deleteOne();
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete file' });
  }
};

module.exports = { uploadFile, getFilesByGroup, downloadFile, deleteFile };
