import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Dropdown, Modal, ListGroup } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { 
  FaSun, 
  FaMoon, 
  FaUser, 
  FaBars, 
  FaTrophy, 
  FaUsers,
  FaSignOutAlt,
  FaUserPlus,
  FaCog,
  FaComments,
  FaShieldAlt
} from 'react-icons/fa';

const NavbarComponent = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const location = useLocation();
  const isAdmin = user?.rol === 'administrador';
  const isActive = (path) => location.pathname === path;
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const AdminModal = () => (
    <Modal
      show={showAdminModal}
      onHide={() => setShowAdminModal(false)}
      centered
      size="sm"
    >
      <Modal.Header closeButton className={darkMode ? 'bg-dark text-light' : ''}>
        <Modal.Title className="d-flex align-items-center">
          <FaShieldAlt className="me-2" />
          Panel de Admin
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={`p-0 ${darkMode ? 'bg-dark' : ''}`}>
        <ListGroup variant={darkMode ? 'dark' : ''}>
          <ListGroup.Item 
            as={Link} 
            to="/admin/profesores/crear"
            action
            className="d-flex align-items-center py-3"
            onClick={() => setShowAdminModal(false)}
          >
            <FaUserPlus className="me-3" />
            Crear Profesor
          </ListGroup.Item>
          <ListGroup.Item 
            as={Link} 
            to="/admin/likes"
            action
            className="d-flex align-items-center py-3"
            onClick={() => setShowAdminModal(false)}
          >
            <FaComments className="me-3" />
            Moderar Likes
          </ListGroup.Item>
        </ListGroup>
      </Modal.Body>
    </Modal>
  );

  return (
    <Navbar
      bg={darkMode ? 'dark' : 'light'}
      variant={darkMode ? 'dark' : 'light'}
      expand="lg"
      className="custom-navbar"
      expanded={expanded}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            src="/logo.png"
            width="50"
            height="50"
            className="brand-logo"
            alt="Logo"
          />
          <span className="brand-text ms-2">Teacher Connect</span>
        </Navbar.Brand>

        <Navbar.Toggle 
          aria-controls="basic-navbar-nav"
          onClick={() => setExpanded(!expanded)}
        >
          <FaBars />
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link
              as={Link}
              to="/"
              className={`nav-link-custom ${isActive('/') ? 'active' : ''}`}
              onClick={() => setExpanded(false)}
            >
              <FaTrophy className="me-1" />
              Ranking
            </Nav.Link>

            {user && (
              <>
                <Nav.Link
                  as={Link}
                  to="/grupos"
                  className={`nav-link-custom ${isActive('/grupos') ? 'active' : ''}`}
                  onClick={() => setExpanded(false)}
                >
                  <FaUsers className="me-1" />
                  Proyectos
                </Nav.Link>

                {isAdmin && (
                  <Nav.Link
                    className="nav-link-custom"
                    onClick={() => {
                      setShowAdminModal(true);
                      setExpanded(false);
                    }}
                  >
                    <FaCog className="me-1" />
                    Admin
                  </Nav.Link>
                )}
              </>
            )}

            <button
              onClick={() => {
                toggleDarkMode();
                setExpanded(false);
              }}
              className="theme-toggle-btn ms-2"
              aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle className="nav-link-custom user-dropdown">
                  <FaUser className="me-1" />
                  {user.name}
                </Dropdown.Toggle>

                <Dropdown.Menu className={darkMode ? 'dropdown-menu-dark' : ''}>
                  <Dropdown.Item as={Link} to={`/profesor/${user.id}`}>
                    <FaUser className="me-2" />
                    Mi Perfil
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" />
                    Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Link
                to="/login"
                className="btn btn-custom-login ms-3"
                onClick={() => setExpanded(false)}
              >
                <FaUser className="me-2" />
                Iniciar Sesión
              </Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>

      <AdminModal />
    </Navbar>
  );
};

export default NavbarComponent;