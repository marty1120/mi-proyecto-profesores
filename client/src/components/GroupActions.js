import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaEdit, FaTrash, FaSignOutAlt, FaUserPlus, FaEye } from 'react-icons/fa';

const GroupActions = ({ 
  group, 
  onJoin, 
  onLeave, 
  onEdit, 
  onDelete,
  onSelect,
  currentUser, 
  isLoading 
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState(null);

  // Verificar si el usuario es miembro
  const isMember = group.members?.some(m => m.id === currentUser?.id);
  
  // Verificar si es admin del grupo
  const isGroupAdmin = group.members?.some(
    m => m.id === currentUser?.id && m.role === 'admin'
  );
  
  // Verificar si es admin global
  const isGlobalAdmin = currentUser?.rol === 'administrador';

  // Determinar si tiene permisos de administración
  const hasAdminRights = isGroupAdmin || isGlobalAdmin;

  // Verificar si es el último admin
  const adminCount = group.members?.filter(m => m.role === 'admin').length || 0;
  const isLastAdmin = isGroupAdmin && adminCount === 1;

  const handleConfirmAction = () => {
    switch (actionType) {
      case 'leave':
        onLeave(group.id);
        break;
      case 'delete':
        onDelete(group.id);
        break;
      default:
        break;
    }
    setShowConfirmModal(false);
  };

  const showConfirmation = (action) => {
    setActionType(action);
    setShowConfirmModal(true);
  };

  return (
    <div className="d-grid gap-2">
      {/* Botón Ver Detalles - siempre visible */}
      <Button 
        variant="outline-primary" 
        onClick={onSelect}
      >
        <FaEye className="me-2" />
        Ver Detalles
      </Button>

      <div className="d-flex gap-2 justify-content-between">
        {!isMember ? (
          // Botón Unirse - visible para no miembros
          <Button
            variant="primary"
            onClick={() => onJoin(group.id)}
            disabled={isLoading}
            className="w-100"
          >
            <FaUserPlus className="me-2" />
            {isLoading ? 'Uniéndose...' : 'Unirse al Proyecto'}
          </Button>
        ) : (
          // Contenedor para botones de miembros
          <div className="d-flex gap-2 w-100">
            {/* Acciones de administrador */}
            {hasAdminRights && (
              <>
                <Button 
                  variant="outline-primary" 
                  onClick={() => onEdit(group)}
                >
                  <FaEdit className="me-2" />
                  Editar
                </Button>
                
                {isGlobalAdmin && (
                  <Button 
                    variant="danger" 
                    onClick={() => showConfirmation('delete')}
                  >
                    <FaTrash className="me-2" />
                    Eliminar
                  </Button>
                )}
              </>
            )}

            {/* Botón de abandonar - mostrar siempre excepto si es el último admin */}
            {!isLastAdmin && (
              <Button
                variant="outline-danger"
                onClick={() => showConfirmation('leave')}
                disabled={isLoading}
                className={hasAdminRights && !isGlobalAdmin ? '' : 'w-100'}
              >
                <FaSignOutAlt className="me-2" />
                {isLoading ? 'Abandonando...' : 'Abandonar'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === 'delete' ? 'Eliminar Proyecto' : 'Abandonar Proyecto'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que quieres {actionType === 'delete' ? 'eliminar' : 'abandonar'} 
          el proyecto "{group.name}"?
          {actionType === 'delete' && (
            <div className="text-danger mt-2">
              Esta acción no se puede deshacer y eliminará todo el contenido del proyecto.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowConfirmModal(false)}
          >
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmAction}
          >
            {actionType === 'delete' ? 'Eliminar' : 'Abandonar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GroupActions;