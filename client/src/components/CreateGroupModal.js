// src/components/CreateGroupModal.jsx
import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Badge } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const CreateGroupModal = ({ show, onHide, onSubmit, departments }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.department) {
      setError('Por favor, completa todos los campos requeridos.');
      return;
    }

    onSubmit({
      ...formData,
      creator: user?.name || 'Usuario',
      members: 1, // Número inicial de miembros
      status: 'active'
    });

    setFormData({
      name: '',
      description: '',
      department: '',
      tags: []
    });
    setError('');
    onHide();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Crear Nuevo Proyecto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger">{error}</Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre del Proyecto</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Innovación Educativa"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe el propósito del proyecto..."
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Departamento</Form.Label>
            <Form.Select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona un departamento</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Etiquetas</Form.Label>
            <div className="d-flex mb-2">
              <Form.Control
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Añade una etiqueta y presiona Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(e);
                  }
                }}
              />
              <Button 
                variant="outline-primary" 
                className="ms-2" 
                onClick={handleAddTag}
              >
                Añadir
              </Button>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  bg="info" 
                  className="d-flex align-items-center p-2"
                >
                  {tag}
                  <FaTimes 
                    className="ms-2" 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Crear Proyecto
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateGroupModal;
