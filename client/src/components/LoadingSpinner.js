import React from 'react';
import { Spinner } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';

const LoadingSpinner = () => {
  const { darkMode } = useTheme();
  
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Spinner 
        animation="border" 
        variant={darkMode ? 'light' : 'primary'}
        style={{ width: '3rem', height: '3rem' }}
      >
        <span className="visually-hidden">Cargando...</span>
      </Spinner>
    </div>
  );
};

export default LoadingSpinner;