import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      // No redireccionar en caso de error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '80vh' }}
    >
      <Card style={{ width: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Iniciar Sesión</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FaUser className="me-2" />Email
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="admin@iesalandalus.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                name="email"
                data-testid="email-input" // Añadido data-testid para cypress
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <FaLock className="me-2" />Contraseña
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Introduce tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                name="password"
                data-testid="password-input" // Añadido data-testid para cypress
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={isLoading}
              data-testid="login-button" // Añadido data-testid para cypress
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
