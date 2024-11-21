import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, ListGroup, Badge, Container, Card, Row, Col, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaSave, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axios from '../services/axiosConfig';

const EditGroup = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    tags: [],
    members: [],
    is_active: true
  });

  // Consulta para obtener datos del grupo
  const { data: group, isLoading, isError } = useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      const response = await axios.get(`/grupos/${id}`);
      console.log('Datos recibidos del servidor:', response.data);
      return response.data;
    },
  });

  // Efecto para actualizar formData cuando los datos del grupo cambian
  useEffect(() => {
    if (group) {
      console.log('Actualizando formData con:', group);
      setFormData({
        name: group.name || '',
        description: group.description || '',
        department: group.department || '',
        tags: group.tags || [],
        members: Array.isArray(group.members) ? group.members : [],
        is_active: group.is_active ?? true
      });
    }
  }, [group]);

  // Mutación para actualizar el grupo
  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      console.log('Enviando datos para actualizar:', updatedData);
      return await axios.put(`/grupos/${id}`, updatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group', id]);
      toast.success('Grupo actualizado exitosamente');
      navigate(`/grupos/${id}`);
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Error al actualizar el grupo');
      toast.error(error.response?.data?.message || 'Error al actualizar el grupo');
    }
  });

  // Mutación para actualizar rol de miembro
  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, newRole }) => {
      return await axios.put(`/grupos/${id}/members/${memberId}/role`, {
        role: newRole
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group', id]);
      toast.success('Rol actualizado exitosamente');
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Error al actualizar el rol');
      toast.error(error.response?.data?.message || 'Error al actualizar el rol');
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.department) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }
    try {
      await updateMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error en submit:', error);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await updateRoleMutation.mutateAsync({ memberId, newRole });
    } catch (error) {
      console.error('Error cambiando rol:', error);
    }
  };

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <Alert variant="danger">
          <FaExclamationTriangle className="me-2" />
          Error al cargar el grupo. Por favor, intenta de nuevo.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Editar Grupo</h4>
        </Card.Header>
        <Card.Body>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del Grupo</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Departamento</Form.Label>
                  <Form.Control
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="is_active"
                label="Grupo Activo"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>
                Miembros y Roles
                {formData.members && ` (${formData.members.length})`}
              </Form.Label>
              {formData.members && formData.members.length > 0 ? (
                <ListGroup>
                  {formData.members.map(member => (
                    <ListGroup.Item
                      key={member.id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          {member.foto ? (
                            <img
                              src={member.foto}
                              alt={member.name}
                              className="rounded-circle"
                              width="40"
                              height="40"
                            />
                          ) : (
                            <FaUser size={30} className="text-secondary" />
                          )}
                        </div>
                        <div>
                          <div className="fw-bold">
                            {member.name}
                            {member.id === group.creator_id && (
                              <Badge bg="primary" className="ms-2">Creador</Badge>
                            )}
                          </div>
                          <small className="text-muted">{member.department}</small>
                        </div>
                      </div>

                      {member.id !== group.creator_id && (
                        <Form.Select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          style={{ width: 'auto' }}
                          disabled={updateRoleMutation.isLoading}
                        >
                          <option value="member">Miembro</option>
                          <option value="admin">Administrador</option>
                        </Form.Select>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <Alert variant="info">
                  No hay miembros en este grupo
                </Alert>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate(`/grupos/${id}`)}
                disabled={updateMutation.isLoading}
              >
                <FaTimes className="me-2" />
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={updateMutation.isLoading}
              >
                {updateMutation.isLoading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
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
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditGroup;