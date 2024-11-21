import React, { useState, useCallback, useMemo } from 'react';
import { Button, Modal, Form, Alert, Card, Spinner } from 'react-bootstrap';
import { FaHeart, FaHistory, FaUser, FaClock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import * as teacherService from '../services/teacherService';

// Datos estáticos de categorías
const CATEGORIAS = {
  PEDAGOGIA: {
    nombre: 'Pedagogía',
    subcategorias: {
      COMUNICACION: 'Comunicación clara y efectiva',
      MOTIVACION: 'Capacidad de motivar a los alumnos',
      PACIENCIA: 'Paciencia en la enseñanza',
      INNOVACION_DOCENTE: 'Métodos innovadores de enseñanza',
    },
  },
  SOFT_SKILLS: {
    nombre: 'Soft Skills',
    subcategorias: {
      EMPATIA: 'Empatía con compañeros y alumnos',
      TRABAJO_EQUIPO: 'Trabajo en equipo',
      COMPANERISMO: 'Apoyo y ayuda a compañeros',
      ADAPTABILIDAD: 'Adaptabilidad a cambios',
    },
  },
  PROFESIONAL: {
    nombre: 'Profesional',
    subcategorias: {
      ORGANIZACION: 'Capacidad de organización',
      LIDERAZGO: 'Habilidades de liderazgo',
      INICIATIVA: 'Toma de iniciativa en proyectos',
      COMPROMISO: 'Compromiso con el centro y la educación',
    },
  },
};

const TeacherLikeSystem = ({ teacherId, teacherName, currentLikes = 0, onLikeAdded }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showLikeModal, setShowLikeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [error, setError] = useState('');
  const [likeForm, setLikeForm] = useState({
    category: '',
    subcategory: '',
    comment: '',
  });

  // Query para historial de likes
  const { 
    data: likes = [], 
    isLoading: isLoadingLikes, 
    refetch: refetchLikes 
  } = useQuery({
    queryKey: ['likes', teacherId],
    queryFn: () => teacherService.getLikesHistory(teacherId),
    enabled: showHistoryModal,
    select: (response) => response.data,
    onError: (error) => {
      toast.error('Error al cargar el historial de likes');
      console.error('Error cargando likes:', error);
    }
  });

// Mutación para dar like
const likeMutation = useMutation({
  mutationFn: (likeData) => teacherService.addLike(teacherId, likeData),
  onMutate: async (newLike) => {
    await queryClient.cancelQueries(['likes', teacherId]);
    const previousLikes = queryClient.getQueryData(['likes', teacherId]);

    // Actualizar caché optimistamente
    queryClient.setQueryData(['likes', teacherId], (old) => {
      const currentLikes = Array.isArray(old) ? old : [];
      return [
        {
          id: `temp-${Date.now()}`,
          ...newLike,
          created_at: new Date().toISOString(),
          given_by: {
            id: user?.id,
            nombre: user?.nombre || 'Usuario',
            departamento: user?.departamento || 'Departamento',
            foto: user?.foto,
          },
        },
        ...currentLikes
      ];
    });

    return { previousLikes };
  },
  onError: (error, variables, context) => {
    if (context?.previousLikes) {
      queryClient.setQueryData(['likes', teacherId], context.previousLikes);
    }
    toast.error(error.response?.data?.message || 'Error al dar like');
    setError(error.response?.data?.message || 'Error al dar like');
  },
  onSuccess: async () => {
    if (onLikeAdded) {
      await onLikeAdded(teacherId);
    }
    toast.success('¡Like añadido correctamente!');
    resetLikeForm();
    setShowLikeModal(false);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['likes', teacherId]);
    queryClient.invalidateQueries(['teachers']);
  },
});

  // Función para resetear el formulario de like
  const resetLikeForm = useCallback(() => {
    setLikeForm({ category: '', subcategory: '', comment: '' });
    setError('');
  }, []);

  // Maneja el envío del formulario de like
  const handleSubmitLike = useCallback(
    async (e) => {
      e.preventDefault();

      if (!user) {
        setError('Debes iniciar sesión para dar like');
        return;
      }

      const { category, subcategory, comment } = likeForm;

      // Validación de los campos del formulario
      if (!category || !subcategory || !comment) {
        setError('Por favor completa todos los campos');
        return;
      }

      if (comment.length < 10) {
        setError('El comentario debe tener al menos 10 caracteres');
        return;
      }

      try {
        await likeMutation.mutateAsync(likeForm); // Ejecuta la mutación para agregar el like
      } catch (err) {
        console.error('Error al dar like:', err);
      }
    },
    [likeForm, likeMutation, user]
  );

  // Función para formatear las fechas de manera robusta
  const formatDate = useCallback((dateInput) => {
    try {
      if (!dateInput) return 'Fecha no disponible';

      let date;

      // Manejo de diferentes formatos de fecha
      if (dateInput.$date) {
        if (typeof dateInput.$date === 'object' && dateInput.$date.$numberLong) {
          date = new Date(parseInt(dateInput.$date.$numberLong, 10)); // Timestamp BSON
        } else {
          date = new Date(dateInput.$date); // ISO String
        }
      } else if (dateInput.$numberLong) {
        date = new Date(parseInt(dateInput.$numberLong, 10)); // Timestamp BSON
      } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
        date = new Date(dateInput); // String o número
      } else {
        date = new Date(dateInput); // Intentar crear una fecha directamente
      }

      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }); // Formatear la fecha en español
      }

      return 'Fecha no disponible';
    } catch (error) {
      console.error('Error al formatear fecha:', error, 'Fecha recibida:', dateInput);
      return 'Fecha no disponible';
    }
  }, []);

  // Memoriza las opciones de categorías para evitar recreaciones
  const categoryOptions = useMemo(() => {
    return Object.entries(CATEGORIAS).map(([key, { nombre }]) => (
      <option key={key} value={key}>
        {nombre}
      </option>
    ));
  }, []);

  // Memoriza las opciones de subcategorías según la categoría seleccionada
  const subcategoryOptions = useMemo(() => {
    if (!likeForm.category) return null;
    return Object.entries(CATEGORIAS[likeForm.category].subcategorias).map(
      ([key, value]) => (
        <option key={key} value={key}>
          {value}
        </option>
      )
    );
  }, [likeForm.category]);

  return (
    <div className="like-system-container">
      <div className="d-flex gap-2">
        {/* Botón para dar like */}
        <Button
          variant="outline-primary"
          onClick={() => {
            if (!user) {
              setError('Debes iniciar sesión para dar like');
              return;
            }
            setShowLikeModal(true);
          }}
          className="w-100"
          disabled={likeMutation.isLoading}
        >
          <FaHeart className="me-2" />
          {likeMutation.isLoading ? 'Procesando...' : 'Dar Like'}
        </Button>

        {/* Botón para ver el historial de likes */}
        <Button
          variant="outline-secondary"
          onClick={() => {
            setShowHistoryModal(true);
            refetchLikes();
          }}
          className="w-100"
          disabled={isLoadingLikes}
        >
          <FaHistory className="me-2" />
          Ver Historial
        </Button>
      </div>

      {/* Modal para dar like */}
      <Modal
        show={showLikeModal}
        onHide={() => {
          setShowLikeModal(false);
          resetLikeForm();
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Dar Like a {teacherName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmitLike}>
            {/* Selección de categoría */}
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Select
                value={likeForm.category}
                onChange={(e) =>
                  setLikeForm({
                    ...likeForm,
                    category: e.target.value,
                    subcategory: '',
                  })
                }
                required
                disabled={likeMutation.isLoading}
              >
                <option value="">Selecciona una categoría</option>
                {categoryOptions}
              </Form.Select>
            </Form.Group>

            {/* Selección de subcategoría, solo si una categoría está seleccionada */}
            {likeForm.category && (
              <Form.Group className="mb-3">
                <Form.Label>Subcategoría</Form.Label>
                <Form.Select
                  value={likeForm.subcategory}
                  onChange={(e) =>
                    setLikeForm({
                      ...likeForm,
                      subcategory: e.target.value,
                    })
                  }
                  required
                  disabled={likeMutation.isLoading}
                >
                  <option value="">Selecciona una subcategoría</option>
                  {subcategoryOptions}
                </Form.Select>
              </Form.Group>
            )}

            {/* Campo de comentario */}
            <Form.Group className="mb-3">
              <Form.Label>Comentario</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={likeForm.comment}
                onChange={(e) =>
                  setLikeForm({
                    ...likeForm,
                    comment: e.target.value,
                  })
                }
                placeholder="Explica por qué das este like..."
                required
                disabled={likeMutation.isLoading}
                minLength={10}
                maxLength={500}
              />
            </Form.Group>

            {/* Botones de acción */}
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowLikeModal(false);
                  resetLikeForm();
                }}
                disabled={likeMutation.isLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={likeMutation.isLoading}
              >
                {likeMutation.isLoading ? 'Enviando...' : 'Dar Like'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal para el historial de likes */}
      <Modal
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Historial de Likes de {teacherName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoadingLikes && (
            <div className="text-center p-4">
              <Spinner animation="border" variant="primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          {!isLoadingLikes && likes.length === 0 && (
            <div className="text-center p-4">
              <FaHeart size={40} className="text-muted mb-3" />
              <p className="text-muted">No hay likes registrados</p>
            </div>
          )}

          {/* Lista animada de likes */}
          <AnimatePresence>
            {likes.map((like, index) => (
              <motion.div
                key={like.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          {like.given_by.foto ? (
                            <img
                              src={like.given_by.foto}
                              alt={like.given_by.nombre}
                              className="rounded-circle"
                              width="40"
                              height="40"
                            />
                          ) : (
                            <div className="bg-light rounded-circle p-2">
                              <FaUser size={24} className="text-secondary" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h6 className="mb-1">{like.given_by.nombre}</h6>
                          <small className="text-muted">
                            {like.given_by.departamento}
                          </small>
                        </div>
                      </div>
                      <small className="text-muted">
                        <FaClock className="me-1" />
                        {formatDate(like.created_at)}
                      </small>
                    </div>
                    <div className="mt-2">
                      <div className="mb-2">
                        <span className="badge bg-primary me-2">
                          {CATEGORIAS[like.category]?.nombre}
                        </span>
                        <span className="badge bg-secondary">
                          {CATEGORIAS[like.category]?.subcategorias[like.subcategory]}
                        </span>
                      </div>
                      <p className="mb-0">{like.comment}</p>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TeacherLikeSystem;
