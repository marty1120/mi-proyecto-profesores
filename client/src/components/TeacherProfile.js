import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaChartLine,
  FaUsers,
  FaClock,
  FaEdit,
  FaUser,
  FaHeart
} from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TeacherLikesHistoryTabs from './TeacherLikesHistoryTabs';
import LoadingSpinner from './LoadingSpinner';
import EditProfileModal from './EditProfileModal'; // Importamos el modal que vamos a reutilizar
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import * as teacherService from '../services/teacherService';
import axios from '../services/axiosConfig';
import '../styles/TeacherProfile.css';

const TeacherProfile = () => {
  const { id } = useParams();
  const [showEditModal, setShowEditModal] = useState(false);
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const likesHistoryRef = useRef();
  const queryClient = useQueryClient();

  // Query para obtener datos del profesor y likes
  const { data: teacher, isLoading, error } = useQuery({
    queryKey: ['teacher', id],
    queryFn: async () => {
      const [teacherResponse, likesGiven, likesReceived] = await Promise.all([
        teacherService.getTeacherById(id),
        axios.get(`/profesores/${id}/likes-dados`),
        axios.get(`/profesores/${id}/likes`)
      ]);

      return {
        ...teacherResponse.data,
        likes_dados: likesGiven.data,
        contador_likes: likesReceived.data.length,
        likes_recibidos: likesReceived.data
      };
    }
  });

  // Manejar likes
  const handleLikeAdded = async (newLike) => {
    queryClient.setQueryData(['teacher', id], (old) => ({
      ...old,
      contador_likes: (old?.contador_likes || 0) + 1
    }));

    if (likesHistoryRef.current) {
      likesHistoryRef.current(newLike);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <Alert variant="danger">{error.message}</Alert>;
  if (!teacher) return <Alert variant="warning">No se encontró el profesor</Alert>;

  return (
    <Container className="py-5">
      <Row>
        {/* Columna izquierda - Información principal */}
        <Col md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={`profile-card mb-4 ${darkMode ? 'dark-mode' : ''}`}>
              <div className="profile-image-container">
                {teacher.foto ? (
                  <img
                    src={teacher.foto}
                    alt={teacher.nombre}
                    className="profile-image"
                    onError={(e) => {
                      e.target.src = "/placeholder-teacher.jpg";
                    }}
                  />
                ) : (
                  <div className="profile-image-placeholder">
                    <FaUser size={60} className="text-secondary" />
                  </div>
                )}
                <div className="profile-overlay">
                  <h2 className="profile-name">{teacher.nombre}</h2>
                  <span className="profile-department">{teacher.departamento}</span>
                </div>
                {user && teacher && String(user.id) === String(teacher.id) && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="edit-profile-btn"
                    onClick={() => setShowEditModal(true)}
                  >
                    <FaEdit className="me-2" />
                    Editar Perfil
                  </Button>
                )}
              </div>
              <Card.Body>
                <div className="info-grid">
                  <InfoItem
                    icon={<FaCalendarAlt />}
                    label="Año de llegada"
                    value={teacher.año_llegada || 'No disponible'}
                  />
                  <InfoItem
                    icon={<FaMapMarkerAlt />}
                    label="Provincia"
                    value={teacher.provincia || 'No disponible'}
                  />
                  {teacher.email && (
                    <InfoItem
                      icon={<FaEnvelope />}
                      label="Email"
                      value={teacher.email}
                    />
                  )}
                  {teacher.telefono && (
                    <InfoItem
                      icon={<FaPhone />}
                      label="Teléfono"
                      value={teacher.telefono}
                    />
                  )}
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        {/* Columna derecha - Estadísticas y contenido */}
        <Col md={8}>
          <Row>
            {/* Tarjetas de Estadísticas */}
            <Col xs={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className={`stats-card mb-4 ${darkMode ? 'dark-mode' : ''}`}>
                  <Card.Body>
                    <div className="stats-grid">
                      <StatItem
                        icon={<FaChartLine />}
                        value={teacher.contador_likes || 0}
                        label="Likes Recibidos"
                        color="primary"
                      />
                      <StatItem
                        icon={<FaHeart />}
                        value={teacher.likes_dados?.length || 0}
                        label="Likes Dados"
                        color="success"
                      />
                      <StatItem
                        icon={<FaClock />}
                        value={teacher.año_llegada ? new Date().getFullYear() - teacher.año_llegada : 'N/A'}
                        label="Años Experiencia"
                        color="info"
                      />
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>

            {/* Historial de Likes */}
            <Col xs={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <TeacherLikesHistoryTabs
                  teacherId={teacher._id || teacher.id}
                  darkMode={darkMode}
                  onLikeAdded={likesHistoryRef}
                />
              </motion.div>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Reutilizar el EditProfileModal */}
      <EditProfileModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        teacher={teacher}
        onUpdate={(updatedTeacher) => {
          queryClient.setQueryData(['teacher', id], (old) => ({
            ...old,
            ...updatedTeacher
          }));
        }}
        darkMode={darkMode}
      />
    </Container>
  );
};

// Componentes auxiliares
const InfoItem = ({ icon, label, value }) => (
  <div className="info-item">
    <span className="info-icon">{icon}</span>
    <div className="info-content">
      <small className="info-label">{label}</small>
      <span className="info-value">{value}</span>
    </div>
  </div>
);

const StatItem = ({ icon, value, label, color }) => (
  <div className={`stat-item stat-${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

export default TeacherProfile;
