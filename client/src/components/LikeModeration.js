import React, { useState, useCallback } from 'react';
import { Card, Table, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaClock, FaUser, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import axios from '../services/axiosConfig';

// Componente para los botones de acción
const ActionButtons = React.memo(({ like, onEdit, onDelete, darkMode, disabled }) => (
  <div className="d-flex gap-2">
    <Button
      variant={darkMode ? "outline-light" : "outline-primary"}
      size="sm"
      onClick={() => onEdit(like)}
      disabled={disabled}
    >
      <FaEdit /> Editar
    </Button>
    <Button
      variant="outline-danger"
      size="sm"
      onClick={() => onDelete(like.id)}
      disabled={disabled}
    >
      <FaTrash /> Eliminar
    </Button>
  </div>
));

const LikeModeration = () => {
  const { darkMode } = useTheme();
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLike, setSelectedLike] = useState(null);
  const [editedComment, setEditedComment] = useState('');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const queryClient = useQueryClient();
  const queryKey = ['admin-likes', page, debouncedSearch];

  // Debounce search
  const debouncedSearchHandler = useCallback(
    debounce((term) => {
      setDebouncedSearch(term);
      setPage(1);
    }, 500),
    []
  );

  React.useEffect(() => {
    debouncedSearchHandler(searchTerm);
    return () => debouncedSearchHandler.cancel();
  }, [searchTerm, debouncedSearchHandler]);

  // Likes query
  const { 
    data: likes, 
    isLoading, 
    error,
    isFetching 
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await axios.get('/admin/likes', {
        params: {
          page,
          search: debouncedSearch,
        }
      });
      return response.data;
    },
    keepPreviousData: true,
    staleTime: 30000,
    cacheTime: 300000,
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async ({ likeId, comment }) => {
      return axios.put(`/admin/likes/${likeId}`, { comment });
    },
    onMutate: async ({ likeId, comment }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, old => ({
        ...old,
        data: old.data.map(like => 
          like.id === likeId 
            ? { ...like, comment } 
            : like
        )
      }));

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      setShowEditModal(false);
      setSelectedLike(null);
      setEditedComment('');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (likeId) => {
      return axios.delete(`/admin/likes/${likeId}`);
    },
    onMutate: async (likeId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, old => ({
        ...old,
        data: old.data.filter(like => like.id !== likeId),
        total: Math.max(0, (old.total || 0) - 1)
      }));

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    }
  });

  // Event handlers
  const handleEdit = useCallback((like) => {
    setSelectedLike(like);
    setEditedComment(like.comment);
    setShowEditModal(true);
  }, []);

  const handleSaveEdit = useCallback((e) => {
    e.preventDefault();
    if (!editedComment.trim()) return;

    editMutation.mutate({
      likeId: selectedLike.id,
      comment: editedComment.trim()
    });
  }, [editedComment, selectedLike, editMutation]);

  const handleDelete = useCallback((likeId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este like?')) {
      deleteMutation.mutate(likeId);
    }
  }, [deleteMutation]);

  if (error) {
    return (
      <Alert variant="danger" className="m-4">
        Error al cargar los likes: {error.message}
      </Alert>
    );
  }

  return (
    <div className="p-4">
      <Card className={darkMode ? 'bg-dark' : ''}>
        <Card.Header className={`${darkMode ? 'bg-dark' : 'bg-primary'} text-white border-secondary`}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h4 className="mb-0">Moderación de Likes</h4>
            
            <div className="position-relative">
              <input
                type="text"
                className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="position-absolute top-50 end-0 translate-middle-y me-2 text-muted" />
            </div>
          </div>
        </Card.Header>

        <Card.Body className={darkMode ? 'bg-dark text-white' : ''}>
          <div className="table-responsive">
            <Table hover className={darkMode ? 'table-dark' : ''}>
              <thead>
                <tr>
                  <th>Profesor</th>
                  <th>Dado por</th>
                  <th>Categoría</th>
                  <th>Comentario</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {likes?.data?.map((like) => (
                    <motion.tr
                      key={like.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td>
                        <div className="d-flex align-items-center">
                          <FaUser className="me-2" />
                          {like.teacher?.nombre || 'Profesor Desconocido'}
                        </div>
                      </td>
                      <td>{like.given_by?.nombre || 'Usuario Desconocido'}</td>
                      <td>
                        <span className="badge bg-info">
                          {like.category} - {like.subcategory}
                        </span>
                      </td>
                      <td>{like.comment}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaClock className="me-2" />
                          {new Date(like.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <ActionButtons
                          like={like}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          darkMode={darkMode}
                          disabled={editMutation.isLoading || deleteMutation.isLoading}
                        />
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                
                {!isLoading && (!likes?.data?.length) && (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No se encontraron likes
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Loading overlay */}
          {isFetching && (
            <div 
              className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
              style={{ 
                background: darkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)', 
                zIndex: 1000 
              }}
            >
              <Spinner animation="border" variant={darkMode ? 'light' : 'primary'} />
            </div>
          )}

          {/* Pagination */}
          {likes && likes.data.length > 0 && (
            <motion.div 
              className="d-flex justify-content-between align-items-center mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Button
                variant={darkMode ? "outline-light" : "outline-primary"}
                disabled={page === 1 || isFetching}
                onClick={() => setPage(p => p - 1)}
              >
                Anterior
              </Button>
              <span>
                Página {page} de {Math.ceil((likes?.total || 0) / likes?.per_page)}
              </span>
              <Button
                variant={darkMode ? "outline-light" : "outline-primary"}
                disabled={!likes?.has_more || isFetching}
                onClick={() => setPage(p => p + 1)}
              >
                Siguiente
              </Button>
            </motion.div>
          )}
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <Modal 
        show={showEditModal} 
        onHide={() => {
          if (!editMutation.isLoading) {
            setShowEditModal(false);
            setSelectedLike(null);
            setEditedComment('');
          }
        }}
        contentClassName={darkMode ? 'bg-dark text-white' : ''}
      >
        <Modal.Header 
          closeButton 
          className={darkMode ? 'bg-dark text-white border-secondary' : ''}
          closeVariant={darkMode ? 'white' : undefined}
        >
          <Modal.Title>Editar Comentario</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? 'bg-dark text-white' : ''}>
          <Form onSubmit={handleSaveEdit}>
            <Form.Group>
              <Form.Label>Comentario</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editedComment}
                onChange={(e) => setEditedComment(e.target.value)}
                required
                disabled={editMutation.isLoading}
                minLength={10}
                className={darkMode ? 'bg-dark text-white border-secondary' : ''}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button 
                variant={darkMode ? "outline-light" : "secondary"}
                onClick={() => setShowEditModal(false)}
                disabled={editMutation.isLoading}>
                Cancelar
              </Button>
              <Button
                variant={darkMode ? "outline-primary" : "primary"}
                type="submit"
                disabled={editMutation.isLoading}
              >
                {editMutation.isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      className="me-2"
                    />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LikeModeration;