import { createContext, useContext, useEffect, useState } from 'react'
import io from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Initialize socket connection
    const socketUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket']
    })

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
      setIsConnected(true)
      // Notify server of user online
      newSocket.emit('user_online', user._id)
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    // Listen for new notifications
    newSocket.on('new_notification', (notification) => {
      console.log('New notification received:', notification)
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
    })

    // Listen for group notifications
    newSocket.on('group_notification', (notification) => {
      console.log('Group notification received:', notification)
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
    })

    // Listen for new discussions
    newSocket.on('new_discussion', (data) => {
      console.log('New discussion:', data)
      // This can be used to update group discussions in real-time
    })

    // Listen for new files
    newSocket.on('new_file', (data) => {
      console.log('New file:', data)
      // This can be used to update group files in real-time
    })

    // Listen for user status changes
    newSocket.on('user_status_changed', (data) => {
      console.log('User status changed:', data)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [user])

  const joinGroup = (groupId) => {
    if (socket && isConnected) {
      socket.emit('join_group', groupId)
    }
  }

  const leaveGroup = (groupId) => {
    if (socket && isConnected) {
      socket.emit('leave_group', groupId)
    }
  }

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      )
    )
  }

  const clearNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    setNotifications,
    setUnreadCount,
    joinGroup,
    leaveGroup,
    markNotificationAsRead,
    clearNotifications
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export default SocketContext
