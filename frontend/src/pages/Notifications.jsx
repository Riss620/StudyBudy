import { useState, useEffect } from 'react'
import axios from 'axios'
import { FiArrowLeft, FiCheck, FiTrash2, FiFilter } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const NotificationsPage = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, unread, read
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [limit] = useState(20)

  useEffect(() => {
    fetchNotifications()
  }, [filter, page])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      let query = `/api/notifications?limit=${limit}&skip=${page * limit}`
      
      if (filter === 'unread') {
        query += '&isRead=false'
      } else if (filter === 'read') {
        query += '&isRead=true'
      }

      const response = await axios.get(query)
      setNotifications(response.data.notifications)
      setTotal(response.data.total)
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
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all')
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))
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
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      try {
        await axios.delete('/api/notifications')
        setNotifications([])
      } catch (error) {
        console.error('Error deleting all notifications:', error)
      }
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return '💬'
      case 'file':
        return '📁'
      case 'reply':
        return '💭'
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
      navigate(notification.link)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage * limit < total) {
      setPage(newPage)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <FiArrowLeft /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">
            Stay updated with all your activities and group updates
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'read'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Read
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Mark all as read"
            >
              <FiCheck size={18} />
              <span className="hidden sm:inline">Mark All</span>
            </button>
            <button
              onClick={deleteAllNotifications}
              className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete all"
            >
              <FiTrash2 size={18} />
              <span className="hidden sm:inline">Delete All</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="text-gray-600 mt-4">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500 text-lg">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 rounded-lg border border-gray-200 hover:border-primary-300 cursor-pointer transition-all ${
                  !notification.isRead
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <span className="text-3xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="inline-block w-2 h-2 bg-primary-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.sender && (
                        <p className="text-sm text-gray-500 mt-2">
                          From: <span className="font-medium">{notification.sender.name}</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification._id)
                        }}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <FiCheck size={18} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification._id)
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && notifications.length > 0 && (
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {page + 1} of {Math.ceil(total / limit)} ({total} total)
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={(page + 1) * limit >= total}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
