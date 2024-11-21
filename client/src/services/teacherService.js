import axios from './axiosConfig';

// Servicios básicos de profesor
export const getTeachers = () => {
  return axios.get('/profesores');  // Ya no necesita /api/
};

export const getTeacherById = (id) => {
  if (!id) throw new Error('El ID del profesor no puede ser indefinido o nulo');
  return axios.get(`/profesores/${id}`);
};

// Servicios de likes
export const addLike = async (teacherId, likeData) => {
  try {
    if (!teacherId) {
      throw new Error('El ID del profesor no puede ser indefinido o nulo');
    }

    // Validar el formato de los datos antes de enviar
    const formattedData = {
      category: likeData.category,
      subcategory: likeData.subcategory,
      comment: likeData.comment
    };

    // Validar que todos los campos requeridos estén presentes
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

export const getLikeStats = async (teacherId) => {
  if (!teacherId) throw new Error('El ID del profesor no puede ser indefinido o nulo');
  return axios.get(`/profesores/${teacherId}/estadisticas-likes`);
};