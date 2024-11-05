import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { FaThumbsUp } from 'react-icons/fa';

const LikeModal = ({ show, onHide, onSubmit, teacherName }) => {
  const [selectedType, setSelectedType] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const likeTypes = [
    'Compañerismo',
    'Innovación',
    'Comunicación',
    'Liderazgo',
    'Empatía',
    'Creatividad',
    'Motivación',
    'Trabajo en equipo',
    'Paciencia',
    'Organización'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedType) {
      setError('Selecciona un tipo de like');
      return;
    }

    if (comment.length < 10) {
      setError('El comentario debe tener al menos 10 caracteres');
      return;
    }

    onSubmit({
      like_type: selectedType,
      comment
    });

    // Limpiar el formulario
    setSelectedType('');
    setComment('');
    setError('');
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaThumbsUp className="me-2" />
          Dar like a {teacherName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>¿Qué aspecto quieres destacar?</Form.Label>
            <Form.Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              required
            >
              <option value="">Selecciona una opción</option>
              {likeTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>¿Por qué das este like?</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explica el motivo del like... (mínimo 10 caracteres)"
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Dar Like
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default LikeModal;
