const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['message', 'file', 'group_invite', 'reply', 'group_member_joined'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  discussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion'
  },
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  },
  link: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: 'bell'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
