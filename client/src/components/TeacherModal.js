// TeacherModal.js
import React, { useEffect, memo, useCallback } from 'react';
import { Modal, Badge } from 'react-bootstrap';
import { FaTrophy, FaUser, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import TeacherLikesHistoryTabs from './TeacherLikesHistoryTabs';

const TeacherModal = ({ teacher, show, onHide, rank }) => {
  const { darkMode } = useTheme();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Funciones auxiliares para manejar estados y navegación
  const handleUnauthenticated = useCallback(() => {
    onHide();
    toast.error('Necesitas iniciar sesión para ver los detalles del profesor', {
      duration: 3000,
      position: 'top-center',
      icon: '🔒',
      style: {
        borderRadius: '10px',
        background: darkMode ? '#333' : '#fff',
        color: darkMode ? '#fff' : '#333',
      },
    });
    navigate('/login', {
      state: {
        from: location.pathname,
        message: 'Por favor, inicia sesión para ver los detalles del profesor',
      },
    });
  }, [darkMode, navigate, onHide, location.pathname]);

  const handleInvalidTeacher = useCallback(() => {
    onHide();
    toast.error('Información del profesor no válida');
  }, [onHide]);

  useEffect(() => {
    if (show && !loading) {
      if (!isAuthenticated) {
        handleUnauthenticated();
      } else if (!teacher || !teacher.id || typeof rank !== 'number') {
        handleInvalidTeacher();
      }
    }
  }, [show, loading, isAuthenticated, teacher, rank, handleUnauthenticated, handleInvalidTeacher]);

  if (loading || !teacher || !isAuthenticated) {
    return null;
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className={`teacher-modal ${darkMode ? 'dark-mode' : ''}`}
    >
      <Modal.Header
        closeButton
        className={darkMode ? 'bg-dark text-light border-secondary' : ''}
      >
        <Modal.Title className="d-flex align-items-center justify-content-between w-100">
          <div className="d-flex align-items-center">
            <FaTrophy className="trophy-icon me-2" />
            {teacher.nombre}
          </div>
          <Badge
            bg={rank <= 3 ? 'warning' : 'secondary'}
            text={rank <= 3 ? 'dark' : 'light'}
            className="rank-badge"
          >
            #{rank}
          </Badge>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={darkMode ? 'bg-dark text-light' : ''}>
        <div className="teacher-profile mb-4">
          <div className="row">
            {/* Columna de la foto */}
            <div className="col-md-4 text-center">
              {teacher.foto ? (
                <img
                  src={teacher.foto}
                  alt={`Foto de ${teacher.nombre}`}
                  className="teacher-image img-fluid rounded mb-3"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-avatar.png';
                  }}
                />
              ) : (
                <div
                  className={`default-avatar-container ${
                    darkMode ? 'bg-secondary' : 'bg-light'
                  }`}
                >
                  <FaUser size={80} className={darkMode ? 'text-light' : 'text-secondary'} />
                </div>
              )}
            </div>

            {/* Columna de información */}
            <div className="col-md-8">
              <div
                className={`info-card p-3 rounded ${
                  darkMode ? 'bg-dark border border-secondary' : 'bg-light'
                }`}
              >
                <InfoItem
                  icon={<FaEnvelope className="me-2 text-primary" />}
                  text={teacher.email}
                />
                <InfoItem
                  icon={<FaMapMarkerAlt className="me-2 text-danger" />}
                  text={teacher.departamento}
                />
                <InfoItem
                  icon={<FaMapMarkerAlt className="me-2 text-success" />}
                  text={teacher.provincia}
                />
                <InfoItem
                  icon={<FaCalendarAlt className="me-2 text-info" />}
                  text={`Año de llegada: ${teacher.año_llegada}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Historial de Likes */}
        <div className="likes-history mt-4">
          <TeacherLikesHistoryTabs teacherId={teacher.id} darkMode={darkMode} />
        </div>
      </Modal.Body>
    </Modal>
  );
};

// Componente InfoItem para reutilización
const InfoItem = ({ icon, text }) => (
  <div className="info-item mb-2">
    {icon}
    <span>{text}</span>
  </div>
);

InfoItem.propTypes = {
  icon: PropTypes.element.isRequired,
  text: PropTypes.string.isRequired,
};

TeacherModal.propTypes = {
  teacher: PropTypes.shape({
    id: PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    departamento: PropTypes.string.isRequired,
    provincia: PropTypes.string,
    foto: PropTypes.string,
    año_llegada: PropTypes.number,
  }),
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  rank: PropTypes.number.isRequired,
};

TeacherModal.defaultProps = {
  teacher: null,
};

export default memo(TeacherModal);
