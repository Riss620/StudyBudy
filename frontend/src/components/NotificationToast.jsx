import { useState, useEffect } from 'react'
import { FiX, FiBell } from 'react-icons/fi'

const NotificationToast = ({ notification, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const getNotificationColor = (type) => {
    switch (type) {
      case 'file':
        return 'bg-blue-50 border-blue-200'
      case 'message':
        return 'bg-green-50 border-green-200'
      case 'reply':
        return 'bg-purple-50 border-purple-200'
      case 'group_invite':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'file':
        return '📁'
      case 'message':
        return '💬'
      case 'reply':
        return '💬'
      case 'group_invite':
        return '👥'
      default:
        return '🔔'
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 max-w-md p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 animate-in slide-in-from-right-full z-50 ${getNotificationColor(
        notification.type
      )}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </span>
          <div>
            <h3 className="font-semibold text-gray-900">
              {notification.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {notification.message}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <FiX size={20} />
        </button>
      </div>
    </div>
  )
}

export const NotificationToastContainer = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    // Global event listener for showing toasts
    const handleShowToast = (event) => {
      const toast = { id: Date.now(), ...event.detail }
      setToasts(prev => [...prev, toast])
    }

    window.addEventListener('showToast', handleShowToast)
    return () => window.removeEventListener('showToast', handleShowToast)
  }, [])

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="fixed top-4 right-4 space-y-3 z-50 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <NotificationToast
            notification={toast}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}

export const showNotificationToast = (notification) => {
  const event = new CustomEvent('showToast', {
    detail: notification
  })
  window.dispatchEvent(event)
}

export default NotificationToast
