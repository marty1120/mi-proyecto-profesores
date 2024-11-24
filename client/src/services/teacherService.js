import axios from './axiosConfig';

export const getTeachers = () => {
  return axios.get('/profesores');
};

export const getTeacherById = (id) => {
  if (!id) throw new Error('El ID del profesor no puede ser indefinido o nulo');
  return axios.get(`/profesores/${id}`);
};

export const addLike = async (teacherId, likeData) => {
  if (!teacherId) {
    throw new Error('El ID del profesor no puede ser indefinido o nulo');
  }

  // Asegurarnos que teacherId es un string
  const id = String(teacherId);

  try {
    const response = await axios.post(`/profesores/${id}/like`, likeData);
    return response.data;
  } catch (error) {
    console.error('Error en addLike:', error.response?.data || error.message);
    throw error;
  }
};

export const getLikesHistory = async (teacherId) => {
  if (!teacherId) throw new Error('El ID del profesor no puede ser indefinido o nulo');
  const response = await axios.get(`/profesores/${teacherId}/historico-likes`);
  return response;
};