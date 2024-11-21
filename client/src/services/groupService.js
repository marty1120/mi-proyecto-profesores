import axios from './axiosConfig';

export const getGroups = async (filters = {}) => {
  const response = await axios.get('/grupos', { params: filters });
  return response.data;
};

export const createGroup = async (groupData) => {
  const response = await axios.post('/grupos', groupData);
  return response.data;
};

export const deleteGroup = async (groupId) => {
  const response = await axios.delete(`/grupos/${groupId}`);
  return response.data;
};

export const updateGroup = async (groupId, groupData) => {
  const response = await axios.put(`/grupos/${groupId}`, groupData);
  return response.data;
};

export const joinGroup = async (groupId) => {
  const response = await axios.post(`/grupos/${groupId}/unirse`);
  return response.data;
};

export const leaveGroup = async (groupId) => {
  const response = await axios.post(`/grupos/${groupId}/salir`);
  return response.data;
};