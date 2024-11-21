import axios from './axiosConfig';

export const getTeachers = () => {
  return axios.get('/profesores');
};

export const getTeacherById = (id) => {
  if (!id) throw new Error('El ID del profesor no puede ser indefinido o nulo');
  return axios.get(`/profesores/${id}`);
};

export const addLike = async (teacherId, likeData) => {
  try {
    if (!teacherId) {
      throw new Error('El ID del profesor no puede ser indefinido o nulo');
    }

    const formattedData = {
      category: likeData.category,
      subcategory: likeData.subcategory,
      comment: likeData.comment
    };

    if (!formattedData.category || !formattedData.subcategory || !formattedData.comment) {
      throw new Error('Faltan campos requeridos en los datos del like');
    }

    const response = await axios.post(`/profesores/${teacherId}/like`, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error in addLike service:', error);
    throw error;
  }
};

export const getLikes = async (teacherId) => {
  if (!teacherId) throw new Error('El ID del profesor no puede ser indefinido o nulo');
  return axios.get(`/profesores/${teacherId}/likes`);
};

export const getLikesHistory = async (teacherId) => {
  if (!teacherId) throw new Error('El ID del profesor no puede ser indefinido o nulo');
  return axios.get(`/profesores/${teacherId}/historico-likes`);
};

export const getLikesGiven = async (teacherId) => {
  if (!teacherId) throw new Error('El ID del profesor no puede ser indefinido o nulo');
  return axios.get(`/profesores/${teacherId}/likes-dados`);
};

export const getLikeStats = async (teacherId) => {
  if (!teacherId) throw new Error('El ID del profesor no puede ser indefinido o nulo');
  return axios.get(`/profesores/${teacherId}/estadisticas-likes`);
};