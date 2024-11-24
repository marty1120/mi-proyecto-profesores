import React, { useState, useCallback } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';

// Componente de Login optimizado
const Login = React.memo(() => {
  // Uso de react-hook-form para manejar el formulario
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Estado para manejar errores del servidor y carga
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hooks de navegación y autenticación
  const navigate = useNavigate();
  const { login } = useAuth();

  // Función para manejar el envío del formulario
  const onSubmit = useCallback(
    async (data) => {
      setServerError('');
      setIsLoading(true);

      try {
        await login(data);
        navigate('/');
      } catch (err) {
        setServerError(err.message || 'Error al iniciar sesión');
      } finally {
        setIsLoading(false);
      }
    },
    [login, navigate]
  );

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '80vh' }}
    >
      <Card style={{ width: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Iniciar Sesión</h2>
          {serverError && <Alert variant="danger">{serverError}</Alert>}
          <Form onSubmit={handleSubmit(onSubmit)}>
            {/* Campo de Email */}
            <Form.Group className="mb-3">
              <Form.Label>
                <FaUser className="me-2" />Email
              </Form.Label>
              <Form.Control
                type="email"
                {...register('email', { required: 'El email es obligatorio' })}
                isInvalid={errors.email}
                disabled={isLoading}
                name="email"
                data-testid="email-input"
              />
              <Form.Control.Feedback type="invalid">
                {errors.email?.message}
              </Form.Control.Feedback>
            </Form.Group>
            {/* Campo de Contraseña */}
            <Form.Group className="mb-3">
              <Form.Label>
                <FaLock className="me-2" />Contraseña
              </Form.Label>
              <Form.Control
                type="password"
                {...register('password', { required: 'La contraseña es obligatoria' })}
                isInvalid={errors.password}
                disabled={isLoading}
                name="password"
                data-testid="password-input"
              />
              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback>
            </Form.Group>
            {/* Botón de Envío */}
            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={isLoading}
              data-testid="login-button"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
});

export default Login;
