import React, { useState } from 'react';
import { Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaHeart, FaHistory, FaUser, FaClock, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Confetti from './Confetti';
import * as teacherService from '../services/teacherService';

// Categorías de likes
const CATEGORIAS = {
  PEDAGOGIA: {
    nombre: 'Pedagogía',
    subcategorias: {
      COMUNICACION: 'Comunicación clara y efectiva',
      MOTIVACION: 'Capacidad de motivar a los alumnos',
      PACIENCIA: 'Paciencia en la enseñanza',
      INNOVACION_DOCENTE: 'Métodos innovadores de enseñanza'
    }
  },
  SOFT_SKILLS: {
    nombre: 'Soft Skills',
    subcategorias: {
      EMPATIA: 'Empatía con compañeros y alumnos',
      TRABAJO_EQUIPO: 'Trabajo en equipo',
      COMPANERISMO: 'Apoyo y ayuda a compañeros',
      ADAPTABILIDAD: 'Adaptabilidad a cambios'
    }
  },
  PROFESIONAL: {
    nombre: 'Profesional',
    subcategorias: {
      ORGANIZACION: 'Capacidad de organización',
      LIDERAZGO: 'Habilidades de liderazgo',
      INICIATIVA: 'Toma de iniciativa en proyectos',
      COMPROMISO: 'Compromiso con el centro y la educación'
    }
  }
};

const TeacherLikeSystem = ({ teacherId, teacherName, onLikeAdded }) => {
  const queryClient = useQueryClient();
  const [showLikeModal, setShowLikeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState('');
  const [likeForm, setLikeForm] = useState({
    category: '',
    subcategory: '',
    comment: ''
  });

  // Query para obtener el historial de likes
  const { data: likes = [], isLoading: isLoadingLikes } = useQuery({
    queryKey: ['likes', teacherId],
    queryFn: () => teacherService.getLikesHistory(teacherId),
    select: response => response.data,
    enabled: showHistoryModal,
    staleTime: 30000,
  });

  // Mutación para dar like
  const likeMutation = useMutation({
    mutationFn: async (likeData) => {
      console.log('Sending like data:', { teacherId, ...likeData });
      const response = await teacherService.addLike(teacherId, likeData);
      console.log('Like response:', response);
      return response;
    },
    onMutate: async (newLike) => {
      console.log('Starting optimistic update');
      await queryClient.cancelQueries(['teacher', teacherId]);
      await queryClient.cancelQueries(['likes', teacherId]);
      await queryClient.cancelQueries(['teachers']);

      const previousData = {
        teacher: queryClient.getQueryData(['teacher', teacherId]),
        likes: queryClient.getQueryData(['likes', teacherId]),
        teachers: queryClient.getQueryData(['teachers'])
      };

      // Actualizar optimistamente el contador de likes
      queryClient.setQueryData(['teacher', teacherId], old => {
        console.log('Updating teacher data:', old);
        return old ? {
          ...old,
          contador_likes: (old.contador_likes || 0) + 1
        } : old;
      });

      // Actualizar optimistamente la lista de profesores
      queryClient.setQueryData(['teachers'], old => {
        if (!Array.isArray(old)) return old;
        return old.map(teacher => 
          teacher.id === teacherId
            ? { ...teacher, contador_likes: (teacher.contador_likes || 0) + 1 }
            : teacher
        );
      });

      // Actualizar optimistamente la lista de likes
      queryClient.setQueryData(['likes', teacherId], old => {
        const currentLikes = Array.isArray(old) ? old : [];
        const newLikeEntry = {
          id: `temp-${Date.now()}`,
          ...newLike,
          created_at: new Date().toISOString(),
          teacher_id: teacherId
        };
        return [newLikeEntry, ...currentLikes];
      });

      return previousData;
    },
    onSuccess: (_, variables, context) => {
      console.log('Like successful');
      
      // Activar confetti
      setShowConfetti(false); // Reset para asegurar re-render
      setTimeout(() => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }, 0);

      // Mostrar toast de éxito
      toast.success('¡Like añadido correctamente!', {
        duration: 3000,
        position: 'top-center'
      });

      // Resetear estado
      setShowLikeModal(false);
      setLikeForm({ category: '', subcategory: '', comment: '' });
      setError('');

      // Notificar al componente padre
      if (typeof onLikeAdded === 'function') {
        onLikeAdded(teacherId);
      }
    },
    onError: (error, variables, context) => {
      console.error('Like error:', error);
      
      // Revertir cambios optimistas
      if (context) {
        queryClient.setQueryData(['teacher', teacherId], context.teacher);
        queryClient.setQueryData(['likes', teacherId], context.likes);
        queryClient.setQueryData(['teachers'], context.teachers);
      }

      // Mostrar error
      const errorMessage = error.response?.data?.message || 'Error al dar like';
      setError(errorMessage);
      toast.error(errorMessage);
    },
    onSettled: () => {
      console.log('Like mutation settled');
      queryClient.invalidateQueries(['teacher', teacherId]);
      queryClient.invalidateQueries(['likes', teacherId]);
      queryClient.invalidateQueries(['teachers']);
    }
  });

  const handleSubmitLike = async (e) => {
    e.preventDefault();
    console.log('Submitting like form');
    setError('');

    const { category, subcategory, comment } = likeForm;

    // Validaciones
    if (!category || !subcategory || !comment) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (comment.length < 10) {
      setError('El comentario debe tener al menos 10 caracteres');
      return;
    }

    try {
      await likeMutation.mutateAsync({
        category,
        subcategory,
        comment
      });
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const formatDate = (dateInput) => {
    try {
      const date = new Date(dateInput);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Fecha no disponible';
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              pointerEvents: 'none'
            }}
          >
            <Confetti run={true} recycle={false} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="d-flex gap-2">
        <Button
          variant="outline-primary"
          onClick={() => setShowLikeModal(true)}
          disabled={likeMutation.isLoading}
          className="w-100"
        >
          {likeMutation.isLoading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Procesando...
            </>
          ) : (
            <>
              <FaHeart className="me-2" />
              Dar Like
            </>
          )}
        </Button>

        <Button
          variant="outline-secondary"
          onClick={() => setShowHistoryModal(true)}
          className="w-100"
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
          setError('');
          setLikeForm({ category: '', subcategory: '', comment: '' });
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Dar Like a {teacherName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmitLike}>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Select
                value={likeForm.category}
                onChange={(e) => setLikeForm({
                  ...likeForm,
                  category: e.target.value,
                  subcategory: ''
                })}
                required
                disabled={likeMutation.isLoading}
              >
                <option value="">Selecciona una categoría</option>
                {Object.entries(CATEGORIAS).map(([key, { nombre }]) => (
                  <option key={key} value={key}>{nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>

            {likeForm.category && (
              <Form.Group className="mb-3">
                <Form.Label>Subcategoría</Form.Label>
                <Form.Select
                  value={likeForm.subcategory}
                  onChange={(e) => setLikeForm({
                    ...likeForm,
                    subcategory: e.target.value
                  })}
                  required
                  disabled={likeMutation.isLoading}
                >
                  <option value="">Selecciona una subcategoría</option>
                  {Object.entries(CATEGORIAS[likeForm.category].subcategorias)
                    .map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                </Form.Select>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Comentario</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={likeForm.comment}
                onChange={(e) => setLikeForm({
                  ...likeForm,
                  comment: e.target.value
                })}
                placeholder="Explica por qué das este like..."
                required
                disabled={likeMutation.isLoading}
                minLength={10}
                maxLength={500}
              />
              <Form.Text className="text-muted">
                Mínimo 10 caracteres, máximo 500
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowLikeModal(false);
                  setError('');
                  setLikeForm({ category: '', subcategory: '', comment: '' });
                }}
                disabled={likeMutation.isLoading}
              >
                <FaTimes className="me-2" />
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={likeMutation.isLoading}
              >
                {likeMutation.isLoading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <FaHeart className="me-2" />
                    Dar Like
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de historial */}
      <Modal
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Historial de Likes de {teacherName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoadingLikes && (
            <div className="text-center p-4">
              <Spinner animation="border" variant="primary" />
            </div>
          )}

          {!isLoadingLikes && likes.length === 0 && (
            <div className="text-center p-4">
              <FaHeart size={40} className="text-muted mb-3" />
              <p className="text-muted">No hay likes registrados</p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {likes.map((like, index) => (
              <motion.div
                key={like.id || `like-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  delay: index * 0.1
                }}
                layout
                layoutId={`like-${like.id}`}
              >
                <div className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          {like.given_by?.foto ? (
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
                          <h6 className="mb-1">{like.given_by?.nombre || 'Usuario Desconocido'}</h6>
                          <small className="text-muted">
                            {like.given_by?.departamento || 'Departamento no especificado'}
                          </small>
                        </div>
                      </div>
                      <small className="text-muted d-flex align-items-center">
                        <FaClock className="me-1" />
                        {formatDate(like.created_at)}
                      </small>
                    </div>
                    <div className="mt-2">
                      <div className="mb-2">
                        <Badge bg="primary" className="me-2">
                          {CATEGORIAS[like.category]?.nombre || like.category}
                        </Badge>
                        <Badge bg="secondary">
                          {CATEGORIAS[like.category]?.subcategorias[like.subcategory] || like.subcategory}
                        </Badge>
                      </div>
                      <p className="mb-0">{like.comment}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </Modal.Body>
      </Modal>
    </>
  );
};

// PropTypes para validación de props
TeacherLikeSystem.propTypes = {
  teacherId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  teacherName: PropTypes.string.isRequired,
  onLikeAdded: PropTypes.func,
};

TeacherLikeSystem.defaultProps = {
  onLikeAdded: () => {},
};

// Memoizar el componente para evitar re-renders innecesarios
export default React.memo(TeacherLikeSystem, (prevProps, nextProps) => {
  return prevProps.teacherId === nextProps.teacherId &&
         prevProps.teacherName === nextProps.teacherName;
});