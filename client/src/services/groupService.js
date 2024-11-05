// services/groupService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Grupos
export const getGroups = (filters = {}) => {
  return axios.get(`${API_URL}/groups`, { params: filters });
};

export const createGroup = (groupData) => {
  return axios.post(`${API_URL}/groups`, groupData);
};

export const joinGroup = (groupId) => {
  return axios.post(`${API_URL}/groups/${groupId}/join`);
};

export const leaveGroup = (groupId) => {
  return axios.post(`${API_URL}/groups/${groupId}/leave`);
};

export const updateGroup = (groupId, groupData) => {
  return axios.put(`${API_URL}/groups/${groupId}`, groupData);
};

export const deleteGroup = (groupId) => {
  return axios.delete(`${API_URL}/groups/${groupId}`);
};

// Mensajes
export const getMessages = (groupId, page = 1) => {
  return axios.get(`${API_URL}/groups/${groupId}/messages`, {
    params: { page }
  });
};

export const sendMessage = (groupId, messageData) => {
  const formData = new FormData();
  
  if (messageData.content) {
    formData.append('content', messageData.content);
  }
  
  if (messageData.file) {
    formData.append('file', messageData.file);
  }
  
  if (messageData.parent_id) {
    formData.append('parent_id', messageData.parent_id);
  }

  return axios.post(`${API_URL}/groups/${groupId}/messages`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const updateMessage = (groupId, messageId, content) => {
  return axios.put(`${API_URL}/groups/${groupId}/messages/${messageId}`, {
    content
  });
};

export const deleteMessage = (groupId, messageId) => {
  return axios.delete(`${API_URL}/groups/${groupId}/messages/${messageId}`);
};