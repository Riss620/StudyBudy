import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from './context/AuthContext'
import { useSocket } from './context/SocketContext'
import Navbar from './components/Navbar'
import { NotificationToastContainer, showNotificationToast } from './components/NotificationToast'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import Loading from './components/Loading'
import { useEffect } from 'react'

function App() {
  const { user, loading } = useAuth()
  const { socket, isConnected } = useSocket()
  const location = useLocation()

  // Listen for socket notifications
  useEffect(() => {
    if (!socket) return

    const handleNewNotification = (notification) => {
      showNotificationToast({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        icon: notification.icon
      })
    }

    socket.on('new_notification', handleNewNotification)
    socket.on('group_notification', handleNewNotification)

    return () => {
      socket.off('new_notification', handleNewNotification)
      socket.off('group_notification', handleNewNotification)
    }
  }, [socket])

  // Show loading screen while checking authentication
  if (loading) {
    return <Loading />
  }

  // Show login if not authenticated, otherwise show main app
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    )
  }

  // Authenticated user - show main app with navbar and routes
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <NotificationToastContainer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App

