import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { FiHome, FiUsers, FiUser, FiLogOut, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi'
import { useState } from 'react'
import NotificationBell from './NotificationBell'
import { getAvatarUrl } from '../utils/helpers'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/groups', label: 'Groups', icon: FiUsers },
    { path: '/profile', label: 'Profile', icon: FiUser },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100 hidden sm:block">
                Discussion Platform
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  isActive(path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
              <NotificationBell />
              <div className="flex items-center space-x-2">
                <img
                  src={getAvatarUrl(user?.avatar)}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={logout} className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <FiLogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
                <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Toggle theme">
                  {theme === 'dark' ? <FiSun className="w-5 h-5 text-yellow-400" /> : <FiMoon className="w-5 h-5 text-gray-600" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium ${
                  isActive(path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 px-3 py-2">
                <img
                  src={getAvatarUrl(user?.avatar)}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</span>
              </div>
              <div className="flex gap-2 px-3 py-2">
                <button
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 mt-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
                <button
                  onClick={() => {
                    toggleTheme()
                    setIsMenuOpen(false)
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {theme === 'dark' ? <FiSun className="w-5 h-5 text-yellow-400" /> : <FiMoon className="w-5 h-5 text-gray-600" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </nav>
  )
}

function MobileBottomNav() {
  const location = useLocation()
  const nav = [
    { to: '/dashboard', icon: FiHome },
    { to: '/groups', icon: FiUsers },
    { to: '/profile', icon: FiUser },
  ]
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-full px-3 py-2 shadow-lg border border-gray-200/30">
      <div className="flex items-center gap-3">
        {nav.map((n) => {
          const Icon = n.icon
          const active = location.pathname === n.to
          return (
            <Link key={n.to} to={n.to} className={`p-2 rounded-full ${active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 dark:text-gray-200'}`}>
              <Icon className="w-5 h-5" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default Navbar

