const { createNotification } = require('../controllers/notificationController');

// Store active user sockets
const userSockets = new Map();

const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User joins with their ID
    socket.on('user_online', (userId) => {
      userSockets.set(userId, socket.id);
      console.log(`User ${userId} is online (socket: ${socket.id})`);
      
      // Notify others that user is online
      io.emit('user_status_changed', { userId, isOnline: true });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      // Find and remove user
      for (let [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          io.emit('user_status_changed', { userId, isOnline: false });
          console.log(`User ${userId} went offline`);
          break;
        }
      }
    });

    // Join group room
    socket.on('join_group', (groupId) => {
      socket.join(`group_${groupId}`);
      console.log(`Socket ${socket.id} joined group ${groupId}`);
    });

    // Leave group room
    socket.on('leave_group', (groupId) => {
      socket.leave(`group_${groupId}`);
      console.log(`Socket ${socket.id} left group ${groupId}`);
    });
  });
};

// Emit notification to specific user
const notifyUser = (io, userId, notification) => {
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit('new_notification', notification);
  }
};

// Emit notification to group members (except sender)
const notifyGroupMembers = (io, groupId, notification, excludeUserId = null) => {
  const notification_with_groupId = { ...notification, groupId };
  io.to(`group_${groupId}`).emit('group_notification', notification_with_groupId);
  
  // Also send direct notifications to group members
  notification.groupMembers?.forEach((memberId) => {
    if (memberId !== excludeUserId) {
      notifyUser(io, memberId.toString(), notification);
    }
  });
};

// Create and emit notification
const createAndEmitNotification = async (io, notificationData, recipientIds = []) => {
  try {
    // Create notification in database
    const notification = await createNotification(notificationData);
    
    // Emit to each recipient
    recipientIds.forEach((recipientId) => {
      if (recipientId !== notificationData.sender.toString()) {
        notifyUser(io, recipientId.toString(), notification);
      }
    });

    return notification;
  } catch (error) {
    console.error('Error creating and emitting notification:', error);
  }
};

module.exports = {
  setupSocketIO,
  notifyUser,
  notifyGroupMembers,
  createAndEmitNotification,
  userSockets
};
