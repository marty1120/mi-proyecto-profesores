import React, { useState } from 'react';
import { Form, Button, Card, Alert, Row, Col, InputGroup, Spinner } from 'react-bootstrap';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaChalkboardTeacher, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaCamera, 
  FaTimes,
  FaSave 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from '../services/axiosConfig';
import provinces from 'provinces';

// Filtrar solo las provincias de España
const spanishProvinces = provinces.filter(province => province.country === 'ES');

const CreateTeacherForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    departamento: '',
    provincia: '',
    año_llegada: '',
    fecha_nacimiento: '',
    foto: null
  });

  const handleInputChange = (e) => {
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

      setFormData(prev => ({
        ...prev,
        foto: file
      }));

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
      <div className="profile-image-preview d-flex align-items-center justify-content-center bg-light rounded-circle" 
           style={{ width: '150px', height: '150px' }}>
        <FaUser size={50} className="text-secondary" />
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validar email
    if (!formData.email.endsWith('@iesalandalus.org')) {
      setError('El email debe pertenecer al dominio @iesalandalus.org');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      const response = await axios.post('/profesores', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el profesor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h4 className="mb-0">Crear Nuevo Profesor</h4>
      </Card.Header>
      <Card.Body>
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
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre Completo</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaUser /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    pattern=".*@iesalandalus\.org$"
                    placeholder="ejemplo@iesalandalus.org"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaLock /></InputGroup.Text>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Departamento</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaChalkboardTeacher /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleInputChange}
                    required
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Provincia</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaMapMarkerAlt /></InputGroup.Text>
                  <Form.Select
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar provincia...</option>
                    {spanishProvinces.map((provincia, index) => (
                      <option key={index} value={provincia.name}>
                        {provincia.name}
                      </option>
                    ))}
                  </Form.Select>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Año de llegada</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="año_llegada"
                    value={formData.año_llegada}
                    onChange={handleInputChange}
                    min={1900}
                    max={new Date().getFullYear()}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Nacimiento</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
                  <Form.Control
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleInputChange}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate('/')}
              disabled={loading}
            >
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
                  <span className="ms-2">Creando...</span>
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Crear Profesor
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CreateTeacherForm;