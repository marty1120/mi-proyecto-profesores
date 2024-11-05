import axios from './axiosConfig';

export const getLikesHistory = async (teacherId) => {
  try {
    const response = await axios.get(`/teachers/${teacherId}/likes-history`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLikes = async (teacherId) => {
  try {
    const response = await axios.get(`/teachers/${teacherId}/likes`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addLike = async (teacherId, likeData) => {
  try {
    const response = await axios.post(`/teachers/${teacherId}/like`, likeData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTeacherLikeStats = async (teacherId) => {
  try {
    const response = await axios.get(`/teachers/${teacherId}/like-stats`);
    return response.data;
  } catch (error) {
    throw error;
  }
};