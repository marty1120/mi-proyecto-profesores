import React, { useState, useEffect } from 'react';
import { Card, Badge, Form, InputGroup, Button } from 'react-bootstrap';
import { FaUser, FaClock, FaSearch, FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../services/axiosConfig';
import { useTheme } from '../context/ThemeContext';
import '../styles/TeacherLikesHistory.css';

const TeacherLikesHistory = ({ teacherId }) => {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleLikes, setVisibleLikes] = useState(5); // Número inicial de likes a mostrar
  const LIKES_PER_LOAD = 5; // Cantidad de likes a cargar cada vez
  const { darkMode } = useTheme();

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/profesores/${teacherId}/historico-likes`);
        setLikes(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching likes:', err);
        setError('Error al cargar los likes');
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      fetchLikes();
    }
  }, [teacherId]);

  const loadMoreLikes = () => {
    setVisibleLikes(prev => prev + LIKES_PER_LOAD);
  };

  const formatDate = (dateInput) => {
    try {
      if (!dateInput) return 'Fecha no disponible';

      if (dateInput.$date && dateInput.$date.$numberLong) {
        return new Date(parseInt(dateInput.$date.$numberLong)).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      if (dateInput.$date) {
        return new Date(dateInput.$date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      return 'Fecha no disponible';
    } catch (error) {
      console.error('Error al formatear fecha:', error, 'Fecha recibida:', dateInput);
      return 'Fecha no disponible';
    }
  };

  const filteredLikes = likes.filter(like => {
    let matchesSearch = true;
    let matchesCategory = true;

    if (searchTerm) {
      matchesSearch = 
        like.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        like.given_by?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        like.given_by?.departamento?.toLowerCase().includes(searchTerm.toLowerCase());
    }

    if (selectedCategory !== 'all') {
      matchesCategory = like.category === selectedCategory;
    }

    return matchesSearch && matchesCategory;
  });

  // Limitar los likes visibles
  const visibleFilteredLikes = filteredLikes.slice(0, visibleLikes);
  const hasMoreLikes = filteredLikes.length > visibleLikes;

  if (loading) {
    return <div className="text-center p-4">Cargando historial...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-danger">{error}</div>;
  }

  if (!likes?.length) {
    return (
      <div className="text-center p-4">
        <FaUser className="mb-3 text-muted" size={32} />
        <p className="text-muted">No hay likes registrados aún</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <InputGroup className="mb-2">
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Buscar en los likes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <Form.Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="mb-3"
        >
          <option value="all">Todas las categorías</option>
          <option value="PEDAGOGIA">Pedagogía</option>
          <option value="SOFT_SKILLS">Soft Skills</option>
          <option value="PROFESIONAL">Profesional</option>
        </Form.Select>
      </div>
  
      <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="likes-scroll">
        <AnimatePresence>
          {visibleFilteredLikes.map((like, index) => (
            <motion.div
              key={like.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`mb-3 ${darkMode ? 'bg-dark text-light' : ''}`}>
                <Card.Body>
                  <div className="d-flex align-items-start">
                    <div className="like-user-avatar me-3">
                      {like.given_by?.foto ? (
                        <img
                          src={like.given_by.foto}
                          alt={like.given_by.nombre}
                          className="rounded-circle"
                          width="40"
                          height="40"
                        />
                      ) : (
                        <FaUser className="avatar-icon" size={24} />
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{like.given_by?.nombre || 'Usuario Desconocido'}</h6>
                          <div className="text-muted small">
                            {like.given_by?.departamento || 'Departamento no especificado'}
                          </div>
                        </div>
                        <small className="text-muted d-flex align-items-center">
                          <FaClock className="me-1" />
                          {formatDate(like.created_at)}
                        </small>
                      </div>
                      <Badge bg="primary" className="my-2">
                        {like.category} - {like.subcategory}
                      </Badge>
                      <p className="mt-2 mb-0">{like.comment}</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
  
        {hasMoreLikes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-3"
          >
            <Button 
              variant="outline-primary" 
              onClick={loadMoreLikes}
              className="load-more-btn"
            >
              <FaChevronDown className="me-2" />
              Cargar más likes ({filteredLikes.length - visibleLikes} restantes)
            </Button>
          </motion.div>
        )}
  
        {visibleFilteredLikes.length === 0 && (
          <div className="text-center p-4">
            <FaUser className="mb-3 text-muted" size={32} />
            <p className="text-muted">No se encontraron likes con los filtros actuales</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherLikesHistory;