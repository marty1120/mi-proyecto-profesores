import axios from './axiosConfig';

export const login = async (credentials) => {
  try {
    // Primero obtener el CSRF token
    await axios.get('http://localhost:8000/sanctum/csrf-cookie');
    
    // Luego hacer el login
    const response = await axios.post('/login', credentials);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    let errorMessage = 'Error al iniciar sesión';
    
    if (error.response) {
      errorMessage = error.response.data.message || errorMessage;
    } else if (error.request) {
      errorMessage = 'No se pudo conectar con el servidor';
    }
    
    console.error('Login error:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const logout = async () => {
  try {
    await axios.post('/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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