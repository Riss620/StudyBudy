import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { groupsAPI } from '../utils/api'
import {
  FiUsers,
  FiMessageSquare,
  FiTrendingUp,
  FiArrowRight,
  FiHome,
  FiFile,
  FiUser,
  FiBell,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useTheme } from '../context/ThemeContext'
import ActivityChart from '../components/charts/ActivityChart'
import DiscussionChart from '../components/charts/DiscussionChart'
import { getAvatarUrl } from '../utils/helpers'


const Dashboard = () => {
  const { user } = useAuth()
  const [myGroups, setMyGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    fetchMyGroups()
  }, [])

  const fetchMyGroups = async () => {
    try {
      const response = await groupsAPI.getMyGroups()
      setMyGroups(response.data)
    } catch (error) {
      toast.error('Failed to fetch groups')
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalGroups: myGroups.length,
    activeDiscussions: myGroups.reduce((acc, g) => acc + (g.recentDiscussions?.length || 0), 0),
    filesShared: 0,
    newMessages: 0,
  }

  // generate sample activity data (7 days) based on groups count
  const generateActivityData = (groups) => {
    const base = groups.length || 1
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    return days.map((d, i) => ({ label: d, value: Math.max(1, Math.floor(base * (1 + Math.sin(i) + Math.random()))) }))
  }

  const generateDiscussionData = (groups) => {
    // sample distribution by group subjects or random buckets
    const samples = [
      { name: 'Homework', value: Math.max(1, groups.length) },
      { name: 'Exam Prep', value: Math.max(1, Math.floor(groups.length/2)) },
      { name: 'General', value: Math.max(1, Math.floor(groups.length/3)) },
      { name: 'Resources', value: Math.max(1, Math.floor(groups.length/4)) },
    ]
    return samples
  }

  const nav = [
    { name: 'Dashboard', to: '/', icon: FiHome },
    { name: 'Groups', to: '/groups', icon: FiUsers },
    { name: 'Discussions', to: '/discussions', icon: FiMessageSquare },
    { name: 'Files', to: '/files', icon: FiFile },
    { name: 'Profile', to: '/profile', icon: FiUser },
  ]

  return (
    <div className="min-h-screen lg:flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 p-6 bg-white/60 backdrop-blur-sm border-r border-gray-200/30">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900">StudySpace</h3>
            <p className="text-sm text-gray-500">Collaborate. Learn. Grow.</p>
          </div>
          <img
            src={getAvatarUrl(user?.avatar)}
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>

        <nav className="space-y-3">
          {nav.map((n) => {
            const Icon = n.icon
            const active = location.pathname === n.to
            return (
              <Link
                key={n.name}
                to={n.to}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{n.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <header className="flex items-center justify-between mb-8 bg-white/80 border-b border-gray-100 shadow-sm p-4 rounded-lg">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome back, {user?.name}</h1>
            <p className="text-gray-600 mt-1">Overview of your study activity</p>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <FiBell className="w-5 h-5 text-gray-600" />
            </button>
            <img src={getAvatarUrl(user?.avatar)} alt="me" className="w-10 h-10 rounded-full object-cover" />
          </div>
        </header>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Groups</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalGroups}</p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Discussions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeDiscussions}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <FiMessageSquare className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Files Shared</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.filesShared}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <FiFile className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">New Messages</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.newMessages}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Activity Over Time</h3>
              <ActivityChart data={generateActivityData(myGroups)} />
            </div>
          </div>
          <div>
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Discussion Distribution</h3>
              <DiscussionChart data={generateDiscussionData(myGroups)} />
            </div>
          </div>
        </div>

        {/* Discussion Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Recent Discussions</h2>
              <Link to="/discussions" className="text-primary-600 hover:underline flex items-center gap-1">View all <FiArrowRight className="w-4 h-4" /></Link>
            </div>

            {/* If you had actual discussions, map them here. For now, show group highlights as placeholders */}
            <div className="space-y-4">
              {myGroups.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="text-gray-600">No recent discussions. Join a group to start collaborating.</p>
                </div>
              ) : (
                myGroups.slice(0, 6).map((g) => (
                  <div key={g._id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{g.name}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{g.description}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-3">
                          <div className="flex items-center gap-2">
                            <img src={getAvatarUrl(g.creator?.avatar)} alt={g.creator?.name} className="w-7 h-7 rounded-full" />
                            <span>{g.creator?.name}</span>
                          </div>
                          <span>{g.members?.length || 0} members</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-gray-500">{new Date(g.createdAt).toLocaleDateString()}</span>
                        <Link to={`/groups/${g._id}`} className="mt-3 btn btn-primary text-sm">Open</Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right column: quick actions / tips */}
          <aside className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                <Link to="/groups" className="btn btn-outline">Browse Groups</Link>
                <Link to="/groups" className="btn btn-primary">Create Group</Link>
                <Link to="/profile" className="btn">Profile</Link>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">Study Tip</h3>
              <p className="text-sm text-gray-600">Engage in at least one discussion every day — teaching is the best way to learn.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default Dashboard

