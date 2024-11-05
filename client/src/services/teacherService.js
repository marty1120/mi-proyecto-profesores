import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const getTeachers = () => {
  return axios.get(`${API_URL}/teachers`);
};

export const getTeacherById = (id) => {
  return axios.get(`${API_URL}/teachers/${id}`);
};

export const addLikes = (teacherId, likeTypes) => {
  return axios.post(`${API_URL}/teachers/${teacherId}/likes`, { likeTypes });
};

export const addComment = (teacherId, comment) => {
  return axios.post(`${API_URL}/teachers/${teacherId}/comment`, { comment });
};