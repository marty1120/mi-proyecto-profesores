import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col, Spinner, InputGroup } from 'react-bootstrap';
import { FaCamera, FaUser, FaSave, FaTimes, FaChalkboardTeacher, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from '../services/axiosConfig';
import provinces from 'provinces'; // Corregir la importación

// Filtrar solo las provincias de España
const spanishProvinces = provinces.filter(province => province.country === 'ES');

const EditProfileModal = ({ show, onHide, teacher, onUpdate, darkMode }) => {
  // Inicializar formData con los datos del profesor
  const [formData, setFormData] = useState({
    nombre: '',
    departamento: '',
    provincia: '',
    año_llegada: ''
  });

  // Estado para la imagen
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newImage, setNewImage] = useState(null);

  // Actualizar formData cuando cambia el profesor
  useEffect(() => {
    if (teacher) {
      setFormData({
        nombre: teacher.nombre || '',
        departamento: teacher.departamento || '',
        provincia: teacher.provincia || '',
        año_llegada: teacher.año_llegada || ''
      });
      setImagePreview(teacher.foto || null);
    }
  }, [teacher]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('La imagen no debe superar los 2MB');
        return;
      }

      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderProfileImage = () => {
    if (imagePreview) {
      return (
        <img
          src={imagePreview}
          alt={formData.nombre || 'Perfil'}
          className="profile-image-preview rounded-circle"
          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
        />
      );
    }

    return (
      <div className="profile-image-preview d-flex align-items-center justify-content-center bg-light rounded-circle" style={{ width: '150px', height: '150px' }}>
        <FaUser size={50} className="text-secondary" />
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();

      // Agregar todos los campos del formulario
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Agregar la nueva imagen si existe
      if (newImage) {
        formDataToSend.append('foto', newImage);
      }

      console.log('Enviando datos del profesor:', Object.fromEntries(formDataToSend));

      const response = await axios.post(`/profesores/${teacher.id}/actualizar`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Respuesta del servidor:', response.data);
      onUpdate(response.data);
      onHide();
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setError(error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      className={darkMode ? 'dark-mode' : ''}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Perfil</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <div className="text-center mb-4">
            <div className="image-preview-container position-relative">
              {renderProfileImage()}
              <Button
                variant="primary"
                size="sm"
                className="change-photo-btn position-absolute bottom-0 end-0 rounded-circle"
                onClick={() => document.getElementById('imageInput').click()}
              >
                <FaCamera size={14} />
              </Button>
              <Form.Control
                type="file"
                id="imageInput"
                className="d-none"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Nombre</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaUser />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Departamento</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaChalkboardTeacher />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Provincia</Form.Label>
                <Form.Control
                  as="select"
                  name="provincia"
                  value={formData.provincia}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar provincia...</option>
                  {spanishProvinces.map((provincia, index) => (
                    <option key={index} value={provincia.name}>
                      {provincia.name}
                    </option>
                  ))}
                </Form.Control>


              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Año de llegada</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaCalendarAlt />
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="año_llegada"
                    value={formData.año_llegada}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              <FaTimes className="me-2" />
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditProfileModal;
