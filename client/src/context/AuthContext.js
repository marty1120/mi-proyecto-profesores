// AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { login, logout, getCurrentUser } from '../services/authService';
import PropTypes from 'prop-types';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);      // Estado del usuario autenticado
  const [loading, setLoading] = useState(true); // Estado de carga de la autenticación
  const queryClient = useQueryClient();        // Cliente de React Query

  // Función para limpiar la sesión
  const cleanupSession = useCallback(() => {
    setUser(null);
    // Limpiar todo el caché de React Query
    queryClient.clear();
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, [queryClient]);

  // Verificar la autenticación al montar el componente
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error checking auth:', error);
      cleanupSession();
    } finally {
      setLoading(false);
    }
  }, [cleanupSession]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Función para iniciar sesión
  const loginUser = useCallback(async (credentials) => {
    try {
      const response = await login(credentials);
      setUser(response.user);
      // Almacenar token y datos del usuario en localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  // Función para cerrar sesión
  const logoutUser = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      cleanupSession();
    }
  }, [cleanupSession]);

  // Memorizar el valor del contexto para evitar renderizados innecesarios
  const value = useMemo(() => ({
    user,
    loading,
    login: loginUser,
    logout: logoutUser,
    isAuthenticated: !!user,
  }), [user, loading, loginUser, logoutUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
