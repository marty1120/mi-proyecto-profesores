import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import { FaHeart, FaHistory, FaClock, FaUser } from 'react-icons/fa';
import axios from '../services/axiosConfig';
import { useAuth } from '../context/AuthContext';
import '../styles/TeacherLikeSystem.css';

const TeacherLikeSystem = ({ teacherId, teacherName }) => {
  const [showLikeModal, setShowLikeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  
  const [likeForm, setLikeForm] = useState({
    type: '',
    comment: ''
  });

  const likeTypes = [
    'Compañerismo',
    'Innovación',
    'Comunicación',
    'Trabajo en equipo',
    'Ayuda profesional',
    'Liderazgo',
    'Compromiso'
  ];

  const loadLikesHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/teachers/${teacherId}/likes-history`);
      setLikes(response.data);
    } catch (err) {
      setError('Error al cargar el historial de likes');
      console.error('Error loading likes history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLike = async (e) => {
    e.preventDefault();
    if (!likeForm.type || !likeForm.comment) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (teacherId === user?.id) {
      setError('No puedes darte like a ti mismo');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`/teachers/${teacherId}/like`, likeForm);
      setShowLikeModal(false);
      setLikeForm({ type: '', comment: '' });
      loadLikesHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el like');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showHistoryModal) {
      loadLikesHistory();
    }
  }, [showHistoryModal]);

  return (
    <div className="like-system-container">
      <div className="d-flex justify-content-between mb-3">
        <Button 
          variant="outline-primary" 
          className="d-flex align-items-center"
          onClick={() => setShowLikeModal(true)}
        >
          <FaHeart className="me-2" />
          Dar Like
        </Button>
        <Button
          variant="outline-secondary"
          className="d-flex align-items-center"
          onClick={() => setShowHistoryModal(true)}
        >
          <FaHistory className="me-2" />
          Ver Historial
        </Button>
      </div>

      {/* Modal para dar like */}
      <Modal show={showLikeModal} onHide={() => setShowLikeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Dar Like a {teacherName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmitLike}>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Like</Form.Label>
              <Form.Select
                value={likeForm.type}
                onChange={(e) => setLikeForm({...likeForm, type: e.target.value})}
                required
              >
                <option value="">Selecciona un tipo</option>
                {likeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Comentario</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Explica por qué das este like..."
                value={likeForm.comment}
                onChange={(e) => setLikeForm({...likeForm, comment: e.target.value})}
                required
                minLength={10}
                maxLength={500}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowLikeModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Dar Like'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal del historial */}
      <Modal 
        show={showHistoryModal} 
        onHide={() => setShowHistoryModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Historial de Likes de {teacherName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center py-3">Cargando historial...</div>
          ) : likes.length === 0 ? (
            <div className="text-center py-3">No hay likes registrados aún</div>
          ) : (
            likes.map((like) => (
              <Card key={like._id} className="mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="d-flex align-items-center mb-1">
                        <FaUser className="me-2" />
                        <strong>{like.givenBy.name}</strong>
                        <span className="text-muted ms-2">({like.givenBy.department})</span>
                      </div>
                      <div className="text-muted small">
                        <FaClock className="me-1" />
                        {new Date(like.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="badge bg-primary">{like.like_type}</span>
                  </div>
                  <p className="mb-0">{like.comment}</p>
                </Card.Body>
              </Card>
            ))
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TeacherLikeSystem;