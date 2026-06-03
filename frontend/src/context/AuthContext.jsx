import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

export const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me')
      setUser(response.data)
    } catch (error) {
      console.error('Error fetching user:', error)
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { token, ...userData } = response.data
      
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)
      toast.success('Login successful!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      return false
    }
  }

  const register = async (name, email, password, avatarFile) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password })
      const { token, ...userData } = response.data
      
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Upload avatar if provided
      if (avatarFile) {
        const formData = new FormData()
        formData.append('avatar', avatarFile)
        try {
          const avatarResponse = await axios.post('/api/auth/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          userData.avatar = avatarResponse.data.user.avatar
        } catch (error) {
          console.warn('Avatar upload failed, continuing without avatar:', error)
        }
      }
      
      setUser(userData)
      toast.success('Registration successful!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
      return false
    }
  }

  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const response = await axios.post('/api/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUser(prev => ({ ...prev, avatar: response.data.user.avatar }))
      toast.success('Avatar uploaded successfully!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Avatar upload failed')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    toast.info('Logged out successfully')
  }

  const updateUser = async (updates) => {
    try {
      const response = await axios.put('/api/auth/profile', updates)
      setUser(response.data)
      toast.success('Profile updated successfully!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed')
      return false
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    uploadAvatar,
    refreshUser: fetchUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext

