import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaUserTie, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import TeacherLikeSystem from './TeacherLikeSystem';
import { getTeacherById } from '../services/teacherService';
import LoadingSpinner from './LoadingSpinner';
import { useTheme } from '../context/ThemeContext';

const TeacherProfile = () => {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();

  useEffect(() => {
    const loadTeacher = async () => {
      try {
        const response = await getTeacherById(id);
        setTeacher(response.data);
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeacher();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!teacher) return <div>No se encontró el profesor</div>;

  return (
    <Container className="py-5">
      <Row>
        <Col md={4}>
          <Card className={darkMode ? 'bg-dark text-light' : ''}>
            <Card.Img 
              variant="top" 
              src={teacher.photo || "/placeholder-teacher.jpg"} 
              alt={teacher.name} 
            />
            <Card.Body>
              <Card.Title className="h4">{teacher.name}</Card.Title>
              <Card.Subtitle className="mb-3 text-muted">
                {teacher.department}
              </Card.Subtitle>
              
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                <FaCalendarAlt className="me-2" />
                  <strong>Año de llegada:</strong>
                  <span className="ms-2">{teacher.año_llegada || 'No disponible'}</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <FaMapMarkerAlt className="me-2" />
                  <strong>Provincia:</strong>
                  <span className="ms-2">{teacher.provincia || 'No disponible'}</span>
                </div>
              </div>

              <TeacherLikeSystem
                teacherId={teacher.id}
                teacherName={teacher.name}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className={`mb-4 ${darkMode ? 'bg-dark text-light' : ''}`}>
            <Card.Body>
              <h2 className="mb-4">Información Profesional</h2>
              
              <div className="mb-4">
                <h5>Habilidades Destacadas</h5>
                <div className="d-flex flex-wrap gap-2">
                  {teacher.skills?.map((skill, index) => (
                    <span key={index} className="badge bg-primary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h5>Descripción</h5>
                <p>{teacher.description || 'No hay descripción disponible.'}</p>
              </div>

              <div className="mb-4">
                <h5>Estadísticas</h5>
                <Row className="g-3">
                  <Col sm={6} md={4}>
                    <div className="border rounded p-3 text-center">
                      <h6>Total Likes</h6>
                      <div className="h4 mb-0">{teacher.likes || 0}</div>
                    </div>
                  </Col>
                  <Col sm={6} md={4}>
                    <div className="border rounded p-3 text-center">
                      <h6>Año de Llegada</h6>
                      <div className="h4 mb-0">{teacher.año_llegada || 'N/A'}</div>
                    </div>
                  </Col>
                  <Col sm={6} md={4}>
                    <div className="border rounded p-3 text-center">
                      <h6>Proyectos</h6>
                      <div className="h4 mb-0">{teacher.projects?.length || 0}</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>

          <Card className={darkMode ? 'bg-dark text-light' : ''}>
            <Card.Body>
              <h5 className="mb-3">Historial de Actividad</h5>
              <div className="timeline">
                {teacher.activity_history?.map((activity, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-date">
                      {new Date(activity.date).toLocaleDateString()}
                    </div>
                    <div className="timeline-content">
                      {activity.description}
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TeacherProfile;