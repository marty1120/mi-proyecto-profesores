import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaUsers, FaCalendarAlt, FaChalkboardTeacher, FaEye } from 'react-icons/fa';

const ProjectCard = ({ 
  group, 
  onSelect,
  currentUser
}) => {
  // Verificar si el usuario es miembro del grupo
  const isMember = group.members?.some(m => m.id === currentUser?.id);
  const isAdmin = group.isAdmin;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-100 shadow-sm">
        <Card.Body>
          <Card.Title className="d-flex justify-content-between align-items-start">
            <span>{group.name}</span>
            <div className="d-flex gap-2">
              {isMember && (
                <Badge bg="info">Miembro</Badge>
              )}
              <Badge bg={group.is_active ? 'success' : 'secondary'}>
                {group.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </Card.Title>
          
          <div className="mb-3 text-muted">
            <FaChalkboardTeacher className="me-2" />
            {group.department}
          </div>
          
          <Card.Text className="mb-3">{group.description}</Card.Text>
          
          <div className="mb-3">
            {group.tags?.map((tag, index) => (
              <Badge key={index} bg="info" className="me-1 mb-1">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="text-muted small">
              <FaUsers className="me-1" />
              {group.members?.length || 0} miembros
            </div>
            {group.created_at && (
              <div className="text-muted small">
                <FaCalendarAlt className="me-1" />
                {new Date(group.created_at).toLocaleDateString()}
              </div>
            )}
          </div>
          
          <div className="mt-3 d-flex gap-2">
            <Button
              variant="primary"
              onClick={onSelect}
              className="w-100 d-flex align-items-center justify-content-center"
            >
              <FaEye className="me-2" />
              Ver Detalles
            </Button>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;
