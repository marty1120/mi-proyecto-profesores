import axios from './axiosConfig';

export const login = async (credentials) => {
  try {
    const response = await axios.post('/login', credentials); 
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);  // Guardar el token
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data);
    throw error;
  }
};

export const logout = async () => {
  try {
    await axios.post('/logout');
    localStorage.removeItem('token');  // Limpiar el token al hacer logout
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get('/me');
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};