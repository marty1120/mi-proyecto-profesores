import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Badge, ListGroup, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaTrash, FaSignOutAlt, FaUserPlus, FaEdit } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axios from '../services/axiosConfig';
import '../styles/GroupDetails.css';

const GroupActions = ({ 
  group, 
  onJoin, 
  onLeave, 
  onEdit, 
  onDelete, 
  isLoading 
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const { user } = useAuth();
  const { darkMode } = useTheme();

  // Verificaciones de permisos
  const isCreator = user?.id === group.creator_id;
  const isMember = group.isMember;
  const isAdmin = group.isAdmin;
  const isGlobalAdmin = user?.rol === 'administrador';
  const hasAdminRights = isAdmin || isGlobalAdmin;

  // Verificar si es el último administrador
  const adminCount = group.members?.filter(m => m.role === 'admin').length || 0;
  const isLastAdmin = isAdmin && adminCount === 1;

  const handleConfirmAction = () => {
    if (actionType === 'leave') {
      onLeave();
    } else if (actionType === 'delete') {
      onDelete();
    }
    setShowConfirmModal(false);
  };

  return (
    <>
      <div className="d-flex gap-2 justify-content-end">
        {!isMember ? (
          <Button 
            variant="primary" 
            onClick={onJoin}
            disabled={isLoading}
            className={darkMode ? 'btn-dark' : ''}
          >
            <FaUserPlus className="me-2" />
            {isLoading ? 'Uniéndose...' : 'Unirse al Proyecto'}
          </Button>
        ) : (
          <div className="d-flex gap-2">
            {hasAdminRights && (
              <>
                <Button 
                  variant="outline-primary" 
                  onClick={onEdit}
                  className={darkMode ? 'btn-dark' : ''}
                >
                  <FaEdit className="me-2" />
                  Editar
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => {
                    setActionType('delete');
                    setShowConfirmModal(true);
                  }}
                  disabled={isLoading}
                >
                  <FaTrash className="me-2" />
                  Eliminar
                </Button>
              </>
            )}
            
            {!isLastAdmin && (
              <Button 
                variant="outline-danger"
                onClick={() => {
                  setActionType('leave');
                  setShowConfirmModal(true);
                }}
                disabled={isLoading}
                className={darkMode ? 'btn-dark' : ''}
              >
                <FaSignOutAlt className="me-2" />
                {isLoading ? 'Abandonando...' : 'Abandonar'}
              </Button>
            )}
          </div>
        )}
      </div>

      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton className={darkMode ? 'bg-dark text-white' : ''}>
          <Modal.Title>
            {actionType === 'delete' ? 'Eliminar Proyecto' : 'Abandonar Proyecto'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? 'bg-dark text-white' : ''}>
          <p>
            ¿Estás seguro de que quieres {actionType === 'delete' ? 'eliminar' : 'abandonar'} 
            el proyecto "{group.name}"?
          </p>
          {actionType === 'delete' && (
            <Alert variant="danger">
              Esta acción no se puede deshacer y eliminará todo el contenido del proyecto.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className={darkMode ? 'bg-dark' : ''}>
          <Button 
            variant="secondary" 
            onClick={() => setShowConfirmModal(false)}
          >
            Cancelar
          </Button>
          <Button 
            variant="danger"
            onClick={handleConfirmAction}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
            ) : null}
            {actionType === 'delete' ? 'Eliminar' : 'Abandonar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.invalidateQueries(['group']);
      queryClient.invalidateQueries(['groups']);
    }
  }, [isAuthenticated, queryClient]);

  // Query para obtener datos del grupo
  const { 
    data: group, 
    isLoading,
    isError,
    error: queryError 
  } = useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      const response = await axios.get(`/grupos/${id}`);
      return response.data;
    },
    enabled: !!id && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 1
  });

  // Mutación para unirse al grupo
  const joinMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/grupos/${id}/unirse`);
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries(['group', id]);
      const previousGroup = queryClient.getQueryData(['group', id]);

      queryClient.setQueryData(['group', id], old => ({
        ...old,
        isMember: true,
        members: [
          ...(old?.members || []),
          {
            id: user.id,
            name: user.nombre,
            department: user.departamento,
            role: 'member'
          }
        ]
      }));

      return { previousGroup };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['group', id], context?.previousGroup);
      const errorMessage = error.response?.data?.message || 'Error al unirse al grupo';
      toast.error(errorMessage);
      setError(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups']);
      queryClient.invalidateQueries(['group', id]);
      toast.success('Te has unido al grupo exitosamente');
    }
  });

  // Mutación para abandonar el grupo
  const leaveMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/grupos/${id}/salir`);
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries(['group', id]);
      const previousGroup = queryClient.getQueryData(['group', id]);

      queryClient.setQueryData(['group', id], old => ({
        ...old,
        isMember: false,
        members: old.members?.filter(member => member.id !== user?.id) || []
      }));

      return { previousGroup };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['group', id], context?.previousGroup);
      const errorMessage = error.response?.data?.message || 'Error al abandonar el grupo';
      toast.error(errorMessage);
      setError(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups']);
      queryClient.invalidateQueries(['group', id]);
      toast.success('Has abandonado el grupo exitosamente');
      navigate('/grupos');
    }
  });

  // Mutación para eliminar el grupo
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.delete(`/grupos/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups']);
      toast.success('Grupo eliminado exitosamente');
      navigate('/grupos');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Error al eliminar el grupo';
      toast.error(errorMessage);
      setError(errorMessage);
    }
  });

  // Manejadores de eventos
  const handleJoin = useCallback(async () => {
    try {
      await joinMutation.mutateAsync();
    } catch (error) {
      console.error('Error al unirse al grupo:', error);
    }
  }, [joinMutation]);

  const handleLeave = useCallback(async () => {
    try {
      await leaveMutation.mutateAsync();
    } catch (error) {
      console.error('Error al abandonar el grupo:', error);
    }
  }, [leaveMutation]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteMutation.mutateAsync();
    } catch (error) {
      console.error('Error al eliminar el grupo:', error);
    }
  }, [deleteMutation]);

  const handleEdit = useCallback(() => {
    navigate(`/grupos/${id}/editar`);
  }, [navigate, id]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="danger" className="m-4">
        {queryError?.message || 'Error al cargar el grupo'}
      </Alert>
    );
  }

  if (!group) {
    return (
      <Alert variant="warning" className="m-4">
        No se encontró el grupo solicitado.
      </Alert>
    );
  }

  return (
    <div className="group-details">
      <Card className={`mb-4 ${darkMode ? 'bg-dark text-light' : ''}`}>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">{group.name}</h4>
            <GroupActions 
              group={group}
              onJoin={handleJoin}
              onLeave={handleLeave}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={
                joinMutation.isLoading || 
                leaveMutation.isLoading || 
                deleteMutation.isLoading
              }
            />
          </div>
        </Card.Header>
        
        <Card.Body>
          {error && (
            <Alert 
              variant="danger" 
              className="mb-3" 
              dismissible 
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          
          <Card.Text>{group.description}</Card.Text>
          
          {group.tags?.length > 0 && (
            <div className="mb-4">
              <h6>Etiquetas:</h6>
              <div className="d-flex flex-wrap gap-2">
                {group.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    bg="info"
                    className={darkMode ? 'bg-secondary' : ''}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3">
            <h6>Miembros ({group.members?.length || 0}):</h6>
            <ListGroup>
              {group.members?.map((member, index) => (
                <ListGroup.Item 
                  key={index}
                  className={`${darkMode ? 'bg-dark text-light' : ''} ${
                    member.id === group.creator_id ? 'border-primary' : ''
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      {member.name} - {member.department}
                      {member.id === group.creator_id && (
                        <Badge 
                          bg="primary" 
                          className="ms-2"
                        >
                          Creador
                        </Badge>
                      )}
                      {member.role === 'admin' && (
                        <Badge 
                          bg="warning" 
                          text="dark"
                          className="ms-2"
                        >
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default GroupDetails;