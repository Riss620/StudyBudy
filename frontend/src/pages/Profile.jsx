import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FiUser, FiMail, FiEdit2, FiSave, FiUpload } from 'react-icons/fi'
import TextArea from '../components/TextArea'
import ChangePasswordModal from '../components/ChangePasswordModal'
import DeleteAccountModal from '../components/DeleteAccountModal'
import { getAvatarUrl } from '../utils/helpers'

const Profile = () => {
  const { user, updateUser, uploadAvatar } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await updateUser(formData)
    if (success) {
      setIsEditing(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Avatar image must be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      // Upload directly
      const success = await uploadAvatar(file)
      if (success) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setAvatarPreview(reader.result)
        }
        reader.readAsDataURL(file)
        // Reset after 2s
        setTimeout(() => setAvatarPreview(null), 2000)
      }
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
    })
    setIsEditing(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            <div className="mb-4 relative">
              <img
                src={avatarPreview || getAvatarUrl(user?.avatar)}
                alt={user?.name}
                className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-primary-100"
              />
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-1/3 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full cursor-pointer transition-colors">
                <FiUpload className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.name}</h2>
            <p className="text-gray-600 mb-4">{user?.email}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <FiUser className="w-4 h-4" />
                <span>Member since {new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="badge badge-blue">
                  {user?.studyGroups?.length || 0} Groups
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Activity Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Groups Joined</span>
                <span className="font-semibold text-gray-900">
                  {user?.studyGroups?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Discussions Started</span>
                <span className="font-semibold text-gray-900">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Files Shared</span>
                <span className="font-semibold text-gray-900">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <FiEdit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <FiSave className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="inline w-4 h-4 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="input bg-gray-50 cursor-not-allowed"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline w-4 h-4 mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className={`input ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  placeholder="Your full name"
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  disabled={!isEditing}
                  className={`input ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Provide a URL to your profile picture
                </p>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <TextArea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  maxLength={800}
                />
              </div>
            </form>
          </div>

          {/* My Groups */}
          <div className="card mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Study Groups</h2>
            {user?.studyGroups?.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                You haven't joined any groups yet
              </p>
            ) : (
              <div className="space-y-3">
                {user?.studyGroups?.map((group) => (
                  <div
                    key={group._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                      {group.subject && (
                        <span className="badge badge-blue text-xs mt-1">{group.subject}</span>
                      )}
                    </div>
                    <a
                      href={`/groups/${group._id}`}
                      className="btn btn-outline text-sm"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Settings */}
          <div className="card mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Settings</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Change Password</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Update your password. OTP verification required for security.
                </p>
                <button
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="btn btn-primary text-sm"
                >
                  Change Password
                </button>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">Delete Account</h3>
                <p className="text-sm text-red-700 mb-3">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={() => setIsDeleteAccountOpen(true)}
                  className="btn bg-red-600 text-white hover:bg-red-700 text-sm"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Modals */}
          <ChangePasswordModal
            isOpen={isChangePasswordOpen}
            onClose={() => setIsChangePasswordOpen(false)}
            userEmail={user?.email}
          />
          <DeleteAccountModal
            isOpen={isDeleteAccountOpen}
            onClose={() => setIsDeleteAccountOpen(false)}
            userEmail={user?.email}
          />
        </div>
      </div>
    </div>
  )
}

export default Profile

