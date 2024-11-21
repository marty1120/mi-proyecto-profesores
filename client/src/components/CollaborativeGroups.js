// CollaborativeGroups.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaPlusCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axios from '../services/axiosConfig';

// Componentes
import ProjectCard from './ProjectCard';
import CreateGroupModal from './CreateGroupModal';
import GroupSearchFilters from './GroupSearchFilters';
import LoadingSpinner from './LoadingSpinner';

// Constantes
const DEPARTMENTS = ["Matemáticas", "Literatura", "Ciencias", "Historia"];

// Componente Principal
const CollaborativeGroups = () => {
  // Estados
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    department: ''
  });

  // Hooks
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query para obtener los grupos (actualizada para React Query v5)
  const {
    data: groups = [],
    isLoading: isLoadingGroups,
    error: groupsError,
    refetch: refetchGroups
  } = useQuery({
    queryKey: ['groups', filters],
    queryFn: async () => {
      try {
        const response = await axios.get('/grupos', { params: filters });
        return response.data;
      } catch (error) {
        throw new Error('Error al cargar los grupos: ' + (error.response?.data?.message || error.message));
      }
    },
    staleTime: 300000, // 5 minutos
    cacheTime: 600000,  // 10 minutos
    retry: 2
  });

  // Mutación para crear un grupo (sin cambios necesarios)
  const createMutation = useMutation({
    mutationFn: async (newGroup) => {
      const response = await axios.post('/grupos', newGroup);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidar y refrescar las queries necesarias
      queryClient.invalidateQueries(['groups']);
      navigate(`/grupos/${data.id}`);
      toast.success('Grupo creado exitosamente');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Error al crear el grupo';
      toast.error(errorMessage);
      console.error('create error:', error);
    }
  });

  // Memoized Values
  const filteredGroups = useMemo(() => {
    return groups.filter(group =>
      group.name?.toLowerCase().includes(filters.search.toLowerCase()) &&
      group.department?.toLowerCase().includes(filters.department.toLowerCase())
    );
  }, [groups, filters]);

  // Event Handlers
  const handleCreateGroup = useCallback(async (newGroup) => {
    await createMutation.mutateAsync(newGroup);
    setShowCreateModal(false);
  }, [createMutation]);

  const handleSelect = useCallback((group) => {
    navigate(`/grupos/${group.id}`);
  }, [navigate]);

  // Loading State
  if (isLoadingGroups) {
    return <LoadingSpinner />;
  }

  // Error State
  if (groupsError) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {groupsError.message}
          <Button
            variant="link"
            className="d-block mt-2"
            onClick={() => refetchGroups()}
          >
            Intentar de nuevo
          </Button>
        </Alert>
      </Container>
    );
  }

  // Render
  return (
    <Container className="py-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <FaUsers className="me-2" />
            Proyectos Colaborativos
          </h2>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="d-flex align-items-center"
            disabled={createMutation.isLoading}
          >
            <FaPlusCircle className="me-2" />
            Crear Proyecto
          </Button>
        </div>

        {/* Filtros */}
        <GroupSearchFilters
          filters={filters}
          onFilterChange={setFilters}
          isLoading={isLoadingGroups}
        />

        {/* Lista de Grupos */}
        <AnimatePresence>
          {filteredGroups.length > 0 ? (
            <Row className="g-4">
              {filteredGroups.map((group) => (
                <Col key={group.id} xs={12} md={6} lg={4}>
                  <ProjectCard
                    group={group}
                    onSelect={() => handleSelect(group)}
                    currentUser={user}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-5"
            >
              <FaUsers size={40} className="mb-3 text-muted" />
              <h3 className="text-muted">No se encontraron proyectos</h3>
              <p className="text-muted">
                {filters.search || filters.department
                  ? 'Intenta con otros criterios de búsqueda'
                  : 'Sé el primero en crear un proyecto'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modales */}
      <CreateGroupModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
        isLoading={createMutation.isLoading}
        departments={DEPARTMENTS}
      />
    </Container>
  );
};

export default CollaborativeGroups;
