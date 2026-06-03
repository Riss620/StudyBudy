import { format, formatDistanceToNow } from 'date-fns'

export const formatDate = (date) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

export const formatDateTime = (date) => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

export const formatRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export const getFileIcon = (mimetype) => {
  if (mimetype.includes('pdf')) return '📄'
  if (mimetype.includes('image')) return '🖼️'
  if (mimetype.includes('word') || mimetype.includes('document')) return '📝'
  if (mimetype.includes('sheet') || mimetype.includes('excel')) return '📊'
  if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return '📽️'
  return '📎'
}

export const getAvatarUrl = (avatar) => {
  if (!avatar) return 'https://via.placeholder.com/150'
  if (avatar.startsWith('http')) return avatar
  const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
  return `${backendBase}${avatar}`
}


