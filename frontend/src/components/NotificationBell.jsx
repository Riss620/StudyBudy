import { useState, useEffect } from 'react'
import axios from 'axios'
import { FiBell, FiCheck, FiX, FiTrash2 } from 'react-icons/fi'
import { useSocket } from '../context/SocketContext'

const NotificationBell = () => {
  const [showPanel, setShowPanel] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const { socket, isConnected, unreadCount: socketUnreadCount } = useSocket()

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    if (socket && isConnected) {
      socket.on('new_notification', (notification) => {
        setNotifications(prev => [notification, ...prev])
        setUnreadCount(prev => prev + 1)
      })

      return () => {
        socket.off('new_notification')
      }
    }
  }, [socket, isConnected])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/notifications?limit=10')
      setNotifications(response.data.notifications)
      setUnreadCount(response.data.unreadCount)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`)
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all')
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`)
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const deleteAllNotifications = async () => {
    try {
      await axios.delete('/api/notifications')
      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error('Error deleting all notifications:', error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return '💬'
      case 'file':
        return '📁'
      case 'reply':
        return '💬'
      case 'group_invite':
        return '👥'
      case 'group_member_joined':
        return '✨'
      default:
        return '🔔'
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id)
    }
    if (notification.link) {
      window.location.href = notification.link
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
        aria-label="Notifications"
      >
        <FiBell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  title="Mark all as read"
                >
                  <FiCheck size={16} />
                </button>
              )}
              <button
                onClick={deleteAllNotifications}
                className="text-sm text-red-600 hover:text-red-700"
                title="Delete all"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {notification.title}
                        </h4>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification._id)
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <a
                href="/notifications"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}

      {/* Close panel when clicking outside */}
      {showPanel && (
        <div
          onClick={() => setShowPanel(false)}
          className="fixed inset-0 z-40"
        />
      )}
    </div>
  )
}

export default NotificationBell
