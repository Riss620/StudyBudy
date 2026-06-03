import axios from 'axios'

const API_BASE_URL = '/api'

// Auth API
export const sendOtp = (data) => axios.post(`${API_BASE_URL}/auth/send-otp`, data);
export const verifyOtp = (data) => axios.post(`${API_BASE_URL}/auth/verify-otp`, data);
export const changePassword = (data) => axios.post(`${API_BASE_URL}/auth/change-password`, data);

// User API
export const deleteAccount = (data) => axios.delete(`${API_BASE_URL}/user/delete-account`, { data });

// Groups API
export const groupsAPI = {
  getAll: () => axios.get(`${API_BASE_URL}/groups`),
  getMyGroups: () => axios.get(`${API_BASE_URL}/groups/my-groups`),
  getById: (id) => axios.get(`${API_BASE_URL}/groups/${id}`),
  create: (data) => axios.post(`${API_BASE_URL}/groups`, data),
  update: (id, data) => axios.put(`${API_BASE_URL}/groups/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE_URL}/groups/${id}`),
  join: (id) => axios.post(`${API_BASE_URL}/groups/${id}/join`),
  leave: (id) => axios.post(`${API_BASE_URL}/groups/${id}/leave`),
}

// Discussions API
export const discussionsAPI = {
  getByGroup: (groupId) => axios.get(`${API_BASE_URL}/discussions/group/${groupId}`),
  getById: (id) => axios.get(`${API_BASE_URL}/discussions/${id}`),
  create: (data) => axios.post(`${API_BASE_URL}/discussions`, data),
  update: (id, data) => axios.put(`${API_BASE_URL}/discussions/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE_URL}/discussions/${id}`),
  addReply: (id, content) => axios.post(`${API_BASE_URL}/discussions/${id}/reply`, { content }),
  togglePin: (id) => axios.post(`${API_BASE_URL}/discussions/${id}/pin`),
}

// Files API
export const filesAPI = {
  getByGroup: (groupId) => axios.get(`${API_BASE_URL}/files/group/${groupId}`),
  upload: (formData) => axios.post(`${API_BASE_URL}/files/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  download: (id) => axios.get(`${API_BASE_URL}/files/download/${id}`, {
    responseType: 'blob'
  }),
  delete: (id) => axios.delete(`${API_BASE_URL}/files/${id}`),
}

export default {
  groups: groupsAPI,
  discussions: discussionsAPI,
  files: filesAPI,
}

