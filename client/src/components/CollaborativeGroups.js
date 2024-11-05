import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaPlusCircle, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreateGroupModal from './CreateGroupModal';
import GroupSearchFilters from './GroupSearchFilters';
import '../styles/CollaborativeGroups.css';

const CollaborativeGroups = () => {
  const [groups, setGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    department: ''
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock data para desarrollo
  const mockGroups = [
    {
      id: 1,
      name: "Innovación Educativa",
      description: "Grupo para compartir y desarrollar nuevas metodologías de enseñanza",
      creator: "Juan Pérez",
      department: "Matemáticas",
      members: 5,
      tags: ["innovación", "metodología", "tecnología"],
      status: "active"
    },
    {
      id: 2,
      name: "Proyectos Interdisciplinares",
      description: "Colaboración entre departamentos para proyectos conjuntos",
      creator: "María García",
      department: "Literatura",
      members: 3,
      tags: ["interdisciplinar", "proyectos", "colaboración"],
      status: "active"
    }
  ];

  useEffect(() => {
    // Aquí cargaríamos los grupos del backend
    setGroups(mockGroups);
  }, []);

  const handleCreateGroup = (newGroup) => {
    setGroups(prev => [...prev, { ...newGroup, id: prev.length + 1 }]);
    setShowCreateModal(false);
  };

  return (
    <Container className="py-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <FaUsers className="me-2" />
            Proyectos Colaborativos
          </h2>
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
            className="d-flex align-items-center"
          >
            <FaPlusCircle className="me-2" />
            Crear Proyecto
          </Button>
        </div>

        <GroupSearchFilters 
          filters={filters}
          onFilterChange={(newFilters) => setFilters(newFilters)}
        />

        <Row className="g-4">
          {groups.map((group) => (
            <Col key={group.id} xs={12} md={6} lg={4}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <Card.Title>{group.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {group.department}
                    </Card.Subtitle>
                    <Card.Text>{group.description}</Card.Text>
                    
                    <div className="mb-3">
                      {group.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          bg="info" 
                          className="me-1 mb-1"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <FaUsers className="me-1" />
                        {group.members} miembros
                      </small>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/grupos/${group.id}`)}
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      <CreateGroupModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
        departments={["Matemáticas", "Literatura", "Ciencias", "Historia"]}
      />
    </Container>
  );
};

export default CollaborativeGroups;