import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { groupsAPI, discussionsAPI, filesAPI } from '../utils/api'
import {
  FiUsers,
  FiMessageSquare,
  FiFile,
  FiPlus,
  FiSend,
  FiAnchor,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiArrowLeft,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import Modal from '../components/Modal'
import TextArea from '../components/TextArea'
import { formatRelativeTime, formatFileSize, getFileIcon, getAvatarUrl } from '../utils/helpers'

const GroupDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [discussions, setDiscussions] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('discussions')
  const [showDiscussionModal, setShowDiscussionModal] = useState(false)
  const [showFileModal, setShowFileModal] = useState(false)
  const [selectedDiscussion, setSelectedDiscussion] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [discussionForm, setDiscussionForm] = useState({
    title: '',
    content: '',
    tags: '',
  })
  const [fileForm, setFileForm] = useState({
    file: null,
    description: '',
  })

  useEffect(() => {
    fetchGroupDetails()
  }, [id])

  const fetchGroupDetails = async () => {
    try {
      const [groupRes, discussionsRes, filesRes] = await Promise.all([
        groupsAPI.getById(id),
        discussionsAPI.getByGroup(id),
        filesAPI.getByGroup(id),
      ])
      setGroup(groupRes.data)
      setDiscussions(discussionsRes.data)
      setFiles(filesRes.data)
    } catch (error) {
      toast.error('Failed to fetch group details')
      navigate('/groups')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDiscussion = async (e) => {
    e.preventDefault()
    try {
      await discussionsAPI.create({
        ...discussionForm,
        groupId: id,
        tags: discussionForm.tags.split(',').map((t) => t.trim()).filter((t) => t),
      })
      toast.success('Discussion created successfully!')
      setShowDiscussionModal(false)
      setDiscussionForm({ title: '', content: '', tags: '' })
      fetchGroupDetails()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create discussion')
    }
  }

  const handleAddReply = async (discussionId) => {
    if (!replyContent.trim()) return
    try {
      await discussionsAPI.addReply(discussionId, replyContent)
      toast.success('Reply added successfully!')
      setReplyContent('')
      fetchGroupDetails()
      if (selectedDiscussion) {
        const updated = await discussionsAPI.getById(discussionId)
        setSelectedDiscussion(updated.data)
      }
    } catch (error) {
      toast.error('Failed to add reply')
    }
  }

  const handleDeleteDiscussion = async (discussionId) => {
    if (!window.confirm('Are you sure you want to delete this discussion?')) return
    try {
      await discussionsAPI.delete(discussionId)
      toast.success('Discussion deleted successfully!')
      setSelectedDiscussion(null)
      fetchGroupDetails()
    } catch (error) {
      toast.error('Failed to delete discussion')
    }
  }

  const handleUploadFile = async (e) => {
    e.preventDefault()
    if (!fileForm.file) {
      toast.error('Please select a file')
      return
    }

    const formData = new FormData()
    formData.append('file', fileForm.file)
    formData.append('groupId', id)
    formData.append('description', fileForm.description)

    try {
      await filesAPI.upload(formData)
      toast.success('File uploaded successfully!')
      setShowFileModal(false)
      setFileForm({ file: null, description: '' })
      fetchGroupDetails()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload file')
    }
  }

  const handleDownloadFile = async (fileId, filename) => {
    try {
      // Build the download URL – the backend will redirect to the Cloudinary CDN link
      const token = localStorage.getItem('token')
      const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
      const url = `${backendBase}/api/files/download/${fileId}`

      // Fetch with auth header and follow redirect
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        redirect: 'follow',
      })

      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const objectUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(objectUrl)
      toast.success('File downloaded!')
    } catch (error) {
      toast.error('Failed to download file')
    }
  }

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return
    try {
      await filesAPI.delete(fileId)
      toast.success('File deleted successfully!')
      fetchGroupDetails()
    } catch (error) {
      toast.error('Failed to delete file')
    }
  }

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return
    try {
      await groupsAPI.leave(id)
      toast.success('Left group successfully!')
      navigate('/groups')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to leave group')
    }
  }

  const isCreator = group?.creator?._id === user?._id
  const isMember = group?.members?.some((m) => m._id === user?._id)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/groups')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Back to Groups</span>
        </button>

        <div className="card">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{group?.name}</h1>
              <p className="text-gray-600 mb-4">{group?.description}</p>
              <div className="flex flex-wrap gap-3">
                <span className="badge badge-blue text-sm">{group?.subject}</span>
                <span className="flex items-center text-sm text-gray-600">
                  <FiUsers className="w-4 h-4 mr-1" />
                  {group?.members?.length} / {group?.maxMembers} members
                </span>
                <span className="text-sm text-gray-600">
                  Created {formatRelativeTime(group?.createdAt)}
                </span>
              </div>
            </div>
            {isMember && !isCreator && (
              <button
                onClick={handleLeaveGroup}
                className="btn btn-secondary mt-4 md:mt-0 md:ml-4"
              >
                Leave Group
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('discussions')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'discussions'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiMessageSquare className="inline w-5 h-5 mr-2" />
            Discussions ({discussions.length})
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'files'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiFile className="inline w-5 h-5 mr-2" />
            Files ({files.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'members'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiUsers className="inline w-5 h-5 mr-2" />
            Members ({group?.members?.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'discussions' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Discussions</h2>
            {isMember && (
              <button
                onClick={() => setShowDiscussionModal(true)}
                className="btn btn-primary flex items-center space-x-2"
              >
                <FiPlus className="w-5 h-5" />
                <span>New Discussion</span>
              </button>
            )}
          </div>

          {discussions.length === 0 ? (
            <div className="card text-center py-12">
              <FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Discussions Yet</h3>
              <p className="text-gray-600 mb-4">Start the conversation by creating a discussion</p>
            </div>
          ) : (
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <div key={discussion._id} className="card hover:shadow-lg transition-shadow">
                  {discussion.isPinned && (
                    <div className="flex items-center text-primary-600 text-sm font-medium mb-2">
                      <FiAnchor className="w-4 h-4 mr-1" />
                      Pinned
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {discussion.title}
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{discussion.content}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {discussion.tags?.map((tag, idx) => (
                          <span key={idx} className="badge badge-blue text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <img
                            src={getAvatarUrl(discussion.author?.avatar)}
                            alt={discussion.author?.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span>{discussion.author?.name}</span>
                        </div>
                        <span>{formatRelativeTime(discussion.createdAt)}</span>
                        <span className="flex items-center">
                          <FiMessageSquare className="w-4 h-4 mr-1" />
                          {discussion.replies?.length || 0} replies
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedDiscussion(discussion)}
                        className="btn btn-outline text-sm"
                      >
                        View
                      </button>
                      {(discussion.author?._id === user?._id || isCreator) && (
                        <button
                          onClick={() => handleDeleteDiscussion(discussion._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'files' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Shared Files</h2>
            {isMember && (
              <button
                onClick={() => setShowFileModal(true)}
                className="btn btn-primary flex items-center space-x-2"
              >
                <FiUpload className="w-5 h-5" />
                <span>Upload File</span>
              </button>
            )}
          </div>

          {files.length === 0 ? (
            <div className="card text-center py-12">
              <FiFile className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Files Yet</h3>
              <p className="text-gray-600 mb-4">Share study materials with your group</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <div key={file._id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-3xl">{getFileIcon(file.mimetype)}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {file.originalName}
                        </h3>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  </div>
                  {file.description && (
                    <p className="text-sm text-gray-600 mb-3">{file.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{file.uploader?.name}</span>
                    <span>{formatRelativeTime(file.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownloadFile(file._id, file.originalName)}
                      className="flex-1 btn btn-primary text-sm flex items-center justify-center space-x-1"
                    >
                      <FiDownload className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    {(file.uploader?._id === user?._id || isCreator) && (
                      <button
                        onClick={() => handleDeleteFile(file._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group?.members?.map((member) => (
              <div key={member._id} className="card flex items-center space-x-4">
                <img
                  src={getAvatarUrl(member.avatar)}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  {member._id === group?.creator?._id && (
                    <span className="badge badge-green text-xs mt-1">Creator</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discussion Detail Modal */}
      {selectedDiscussion && (
        <Modal
          isOpen={!!selectedDiscussion}
          onClose={() => setSelectedDiscussion(null)}
          title={selectedDiscussion.title}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-4 border-b">
              <img
                src={getAvatarUrl(selectedDiscussion.author?.avatar)}
                alt={selectedDiscussion.author?.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900">{selectedDiscussion.author?.name}</p>
                <p className="text-sm text-gray-500">
                  {formatRelativeTime(selectedDiscussion.createdAt)}
                </p>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700">{selectedDiscussion.content}</p>
            </div>

            {selectedDiscussion.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedDiscussion.tags.map((tag, idx) => (
                  <span key={idx} className="badge badge-blue">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="font-semibold text-gray-900 mb-4">
                Replies ({selectedDiscussion.replies?.length || 0})
              </h4>

              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {selectedDiscussion.replies?.map((reply, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <img
                        src={getAvatarUrl(reply.user?.avatar)}
                        alt={reply.user?.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{reply.user?.name}</span>
                          <span className="text-sm text-gray-500">
                            {formatRelativeTime(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {isMember && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="input flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddReply(selectedDiscussion._id)
                      }
                    }}
                  />
                  <button
                    onClick={() => handleAddReply(selectedDiscussion._id)}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <FiSend className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Create Discussion Modal */}
      <Modal
        isOpen={showDiscussionModal}
        onClose={() => setShowDiscussionModal(false)}
        title="Create New Discussion"
        size="md"
      >
        <form onSubmit={handleCreateDiscussion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              required
              value={discussionForm.title}
              onChange={(e) => setDiscussionForm({ ...discussionForm, title: e.target.value })}
              className="input"
              placeholder="Discussion title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
            <TextArea
              required
              value={discussionForm.content}
              onChange={(e) => setDiscussionForm({ ...discussionForm, content: e.target.value })}
              rows={6}
              placeholder="What do you want to discuss?"
              maxLength={4000}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={discussionForm.tags}
              onChange={(e) => setDiscussionForm({ ...discussionForm, tags: e.target.value })}
              className="input"
              placeholder="e.g., calculus, homework, exam-prep"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowDiscussionModal(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn btn-primary">
              Create Discussion
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload File Modal */}
      <Modal
        isOpen={showFileModal}
        onClose={() => setShowFileModal(false)}
        title="Upload File"
        size="md"
      >
        <form onSubmit={handleUploadFile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">File *</label>
            <input
              type="file"
              required
              onChange={(e) => setFileForm({ ...fileForm, file: e.target.files[0] })}
              className="input"
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
            />
            <p className="text-sm text-gray-500 mt-1">
              Supported: PDF, DOC, TXT, PPT, XLS, Images (Max 10MB)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <TextArea
              value={fileForm.description}
              onChange={(e) => setFileForm({ ...fileForm, description: e.target.value })}
              rows={3}
              placeholder="Describe the file..."
              maxLength={1000}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowFileModal(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn btn-primary">
              Upload
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default GroupDetail

