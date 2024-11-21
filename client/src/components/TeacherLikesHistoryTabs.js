import React, { useState, useEffect } from 'react';
import { Card, Nav, Tab, Badge } from 'react-bootstrap';
import { FaHeart, FaUser, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from '../services/axiosConfig';
import '../styles/TeacherLikesHistory.css';

const TeacherLikesHistoryTabs = ({ teacherId, darkMode }) => {
  const [likesGiven, setLikesGiven] = useState([]);
  const [likesReceived, setLikesReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLikesHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const [receivedResponse, givenResponse] = await Promise.all([
          axios.get(`/profesores/${teacherId}/historico-likes`), // Likes recibidos
          axios.get(`/profesores/${teacherId}/likes-dados`), // Likes dados
        ]);

        // Logs detallados para verificar la estructura de los datos
        console.log('Likes Recibidos:', JSON.stringify(receivedResponse.data, null, 2));
        console.log('Likes Dados:', JSON.stringify(givenResponse.data, null, 2));

        setLikesReceived(receivedResponse.data);
        setLikesGiven(givenResponse.data);
      } catch (error) {
        console.error('Error fetching likes history:', error);
        setError('Error al cargar el historial de likes');
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      fetchLikesHistory();
    }
  }, [teacherId]);

  const formatDate = (dateInput) => {
    try {
      if (!dateInput) return 'Fecha no disponible';

      if (dateInput.$date && dateInput.$date.$numberLong) {
        return new Date(parseInt(dateInput.$date.$numberLong)).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }

      if (dateInput.$date) {
        return new Date(dateInput.$date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }

      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }

      return 'Fecha no disponible';
    } catch (error) {
      console.error('Error al formatear fecha:', error, 'Fecha recibida:', dateInput);
      return 'Fecha no disponible';
    }
  };

  const getAvatarUrl = (foto) => {
    if (!foto) return null; // No hay foto disponible
    if (foto.startsWith('http://') || foto.startsWith('https://')) {
      return foto;
    }
    return `${process.env.REACT_APP_BASE_URL}${foto}`;
  };

  const LikeCard = ({ like }) => {
    const [imageError, setImageError] = useState(false);
    if (!like) return null;

    const avatarUrl = getAvatarUrl(like.given_by?.foto || like.teacher?.foto);

    // Log para depuración
    console.log(`Avatar URL para like ${like.id || like._id}:`, avatarUrl);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        key={like.id || like._id}
      >
        <Card className={`like-card mb-3 ${darkMode ? 'bg-dark text-light' : ''}`}>
          <Card.Body>
            <div className="d-flex align-items-start">
              <div className="like-user-avatar">
                {avatarUrl && !imageError ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="rounded-circle"
                    width="40"
                    height="40"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <FaUser className="avatar-icon" size={40} />
                )}
              </div>
              <div className="flex-grow-1 ms-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">
                      {like.given_by?.nombre || like.teacher?.nombre || 'Usuario Desconocido'}
                    </h6>
                    <div className="text-muted small">
                      {like.given_by?.departamento ||
                        like.teacher?.departamento ||
                        'Departamento no especificado'}
                    </div>
                  </div>
                  <Badge bg="primary" className="category-badge">
                    {like.category} - {like.subcategory}
                  </Badge>
                </div>
                <p className="mt-2 mb-1">{like.comment}</p>
                <small className="text-muted d-flex align-items-center">
                  <FaClock className="me-1" />
                  {formatDate(like.created_at)}
                </small>
              </div>
            </div>
          </Card.Body>
        </Card>
      </motion.div>
    );
  };

  const renderTabContent = (likes, type) => {
    if (loading) {
      return <div className="text-center p-4">Cargando likes...</div>;
    }

    if (error) {
      return <div className="text-center p-4 text-danger">{error}</div>;
    }

    if (!likes?.length) {
      return (
        <div className="text-center p-4">
          <FaHeart className="mb-3 text-muted" size={32} />
          <p className="text-muted">
            {type === 'received' ? 'No has recibido likes aún' : 'No has dado ningún like aún'}
          </p>
        </div>
      );
    }

    return likes.map((like) => <LikeCard key={like.id || like._id} like={like} />);
  };

  return (
    <Card className={`mb-4 ${darkMode ? 'bg-dark text-light' : ''}`}>
      <Card.Body>
        <Tab.Container defaultActiveKey="received">
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="received">
                <FaHeart className="me-2" />
                Likes Recibidos ({likesReceived.length || 0})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="given">
                <FaHeart className="me-2" />
                Likes Dados ({likesGiven.length || 0})
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="received">
              {renderTabContent(likesReceived, 'received')}
            </Tab.Pane>
            <Tab.Pane eventKey="given">
              {renderTabContent(likesGiven, 'given')}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
    </Card>
  );
};

export default TeacherLikesHistoryTabs;
