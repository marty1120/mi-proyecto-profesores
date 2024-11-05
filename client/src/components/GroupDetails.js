import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, ListGroup } from 'react-bootstrap';
import { FaUsers, FaEdit, FaTrash, FaSignOutAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import GroupChat from './GroupChat';
import { getMessages, leaveGroup, deleteGroup } from '../services/groupService';
import '../styles/GroupDetails.css';
const GroupDetails = ({ group, onLeave, onDelete, isAdmin }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { darkMode } = useTheme();

  useEffect(() => {
    loadMessages();
  }, [group._id]);

  const loadMessages = async () => {
    try {
      const response = await getMessages(group._id);
      setMessages(response.data.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeave = async () => {
    if (window.confirm('¿Estás seguro de que quieres salir del grupo?')) {
      try {
        await leaveGroup(group._id);
        onLeave();
      } catch (error) {
        console.error('Error leaving group:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar el grupo? Esta acción no se puede deshacer.')) {
      try {
        await deleteGroup(group._id);
        onDelete();
      } catch (error) {
        console.error('Error deleting group:', error);
      }
    }
  };

  return (
    <div className="group-details">
      <Card className={`mb-4 ${darkMode ? 'bg-dark text-light' : ''}`}>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">{group.name}</h4>
          <div className="d-flex gap-2">
            {isAdmin && (
              <>
                <Button variant="outline-primary" size="sm">
                  <FaEdit /> Editar
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={handleDelete}
                >
                  <FaTrash /> Eliminar
                </Button>
              </>
            )}
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={handleLeave}
            >
              <FaSignOutAlt /> Salir
            </Button>
          </div>
        </Card.Header>
        
        <Card.Body>
          <Card.Text>{group.description}</Card.Text>
          
          <div className="mb-3">
            <h6>Etiquetas:</h6>
            <div className="d-flex flex-wrap gap-2">
              {group.tags.map((tag, index) => (
                <Badge key={index} bg="info">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <h6>Miembros ({group.members.length}/{group.max_members}):</h6>
            <ListGroup>
              {group.members.map((member, index) => (
                <ListGroup.Item 
                  key={index}
                  className={darkMode ? 'bg-dark text-light' : ''}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      {member.name} - {member.department}
                    </div>
                    {member.pivot.role === 'admin' && (
                      <Badge bg="warning">Admin</Badge>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </Card.Body>
      </Card>

      <GroupChat 
        groupId={group._id} 
        messages={messages}
        onNewMessage={loadMessages}
        isLoading={isLoading}
      />
    </div>
  );
};

export default GroupDetails;