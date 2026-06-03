import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { groupsAPI } from '../utils/api'
import { FiUsers, FiPlus, FiSearch, FiLock } from 'react-icons/fi'
import { toast } from 'react-toastify'
import Modal from '../components/Modal'
import TextArea from '../components/TextArea'
import { formatRelativeTime } from '../utils/helpers'

const Groups = () => {
  const [groups, setGroups] = useState([])
  const [myGroups, setMyGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    isPrivate: false,
    maxMembers: 50,
  })

  useEffect(() => {
    fetchGroups()
    fetchMyGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await groupsAPI.getAll()
      setGroups(response.data)
    } catch (error) {
      toast.error('Failed to fetch groups')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyGroups = async () => {
    try {
      const response = await groupsAPI.getMyGroups()
      setMyGroups(response.data)
    } catch (error) {
      console.error('Failed to fetch my groups')
    }
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    try {
      await groupsAPI.create(formData)
      toast.success('Group created successfully!')
      setShowCreateModal(false)
      setFormData({
        name: '',
        description: '',
        subject: '',
        isPrivate: false,
        maxMembers: 50,
      })
      fetchGroups()
      fetchMyGroups()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create group')
    }
  }

  const handleJoinGroup = async (groupId) => {
    try {
      await groupsAPI.join(groupId)
      toast.success('Joined group successfully!')
      fetchGroups()
      fetchMyGroups()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join group')
    }
  }

  const filteredGroups = (activeTab === 'all' ? groups : myGroups).filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isUserInGroup = (groupId) => {
    return myGroups.some((g) => g._id === groupId)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Groups</h1>
            <p className="text-gray-600">
              Join groups and collaborate with fellow students
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary mt-4 sm:mt-0 flex items-center space-x-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create Group</span>
          </button>
        </div>

        {/* Search and Tabs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search groups by name, subject, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Groups
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'my'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              My Groups
            </button>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="card text-center py-12">
          <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? 'Try adjusting your search criteria'
              : activeTab === 'my'
              ? "You haven't joined any groups yet"
              : 'Be the first to create a group!'}
          </p>
          {activeTab === 'my' && !searchTerm && (
            <button onClick={() => setActiveTab('all')} className="btn btn-primary">
              Browse All Groups
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div key={group._id} className="card hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-900 flex-1">
                  {group.name}
                </h3>
                {group.isPrivate && (
                  <FiLock className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {group.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subject:</span>
                  <span className="badge badge-blue">{group.subject}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Members:</span>
                  <span className="font-medium text-gray-900">
                    {group.members?.length || 0} / {group.maxMembers}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-600">
                    {formatRelativeTime(group.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {isUserInGroup(group._id) ? (
                  <Link
                    to={`/groups/${group._id}`}
                    className="flex-1 btn btn-primary text-center"
                  >
                    View Group
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => handleJoinGroup(group._id)}
                      className="flex-1 btn btn-primary"
                      disabled={group.members?.length >= group.maxMembers}
                    >
                      {group.members?.length >= group.maxMembers ? 'Full' : 'Join'}
                    </button>
                    <Link
                      to={`/groups/${group._id}`}
                      className="btn btn-outline"
                    >
                      View
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Study Group"
        size="md"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="e.g., Advanced Mathematics Study Group"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="input"
              placeholder="e.g., Mathematics, Physics, Computer Science"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <TextArea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Describe the purpose and goals of this study group..."
              maxLength={1000}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Members
            </label>
            <input
              type="number"
              min="2"
              max="200"
              value={formData.maxMembers}
              onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
              className="input"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700">
              Make this group private
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn btn-primary">
              Create Group
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Groups

