import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Row, Col, Form, InputGroup } from 'react-bootstrap';
import { FaSearch, FaChalkboardTeacher, FaTrophy } from 'react-icons/fa';
import { useTransition, animated, useSpring, config } from '@react-spring/web';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import TeacherRankCard from './TeacherRankCard';
import TeacherModal from './TeacherModal';
import Confetti from './Confetti';
import StatsDashboard from './StatsDashboard';
import UpcomingBirthdays from './UpcomingBirthdays';
import { getTeachers } from '../services/teacherService';
import { toast } from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import '../styles/TeacherList.css';

// Componente SearchBar memoizado
const SearchBar = React.memo(({ value, onChange, placeholder }) => (
  <InputGroup className="search-input">
    <InputGroup.Text>
      <FaSearch />
    </InputGroup.Text>
    <Form.Control
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </InputGroup>
));

// Componente SearchFilters memoizado
const SearchFilters = React.memo(
  ({ nameFilter, departmentFilter, onNameChange, onDepartmentChange }) => (
    <Row className="justify-content-center mb-4">
      <Col md={6} lg={4}>
        <SearchBar
          value={nameFilter}
          onChange={onNameChange}
          placeholder="Buscar por nombre"
        />
      </Col>
      <Col md={6} lg={4}>
        <SearchBar
          value={departmentFilter}
          onChange={onDepartmentChange}
          placeholder="Buscar por departamento"
        />
      </Col>
    </Row>
  )
);

const TeacherList = () => {
  const { darkMode } = useTheme();
  const { isAuthenticated } = useAuth();
  
  // Estados
  const [teachers, setTeachers] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedRank, setSelectedRank] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movingTeachers, setMovingTeachers] = useState(new Set());

  // Filtrar profesores
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher =>
      teacher.nombre?.toLowerCase().includes(nameFilter.toLowerCase()) &&
      teacher.departamento?.toLowerCase().includes(departmentFilter.toLowerCase())
    );
  }, [teachers, nameFilter, departmentFilter]);

  // Calcular total de likes
  const totalLikes = useMemo(() => {
    return filteredTeachers.reduce((sum, t) => sum + (t.contador_likes || 0), 0);
  }, [filteredTeachers]);

  // Configurar transiciones para las tarjetas
  const transitions = useTransition(
    filteredTeachers,
    {
      keys: item => item.id,
      from: { opacity: 0, transform: 'translate3d(0,30px,0)' },
      enter: { opacity: 1, transform: 'translate3d(0,0px,0)' },
      leave: { opacity: 0, transform: 'translate3d(0,-30px,0)' },
      update: (item, index) => ({
        transform: `translate3d(0,${index * 0}px,0)`,
        zIndex: filteredTeachers.length - index,
        immediate: false
      }),
      config: { 
        tension: 300, 
        friction: 20, 
        mass: 1 
      }
    }
  );

  // Cargar profesores
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setLoading(true);
        const response = await getTeachers();
        const sortedTeachers = response.data
          .map(teacher => ({
            ...teacher,
            contador_likes: parseInt(teacher.likes || 0, 10)
          }))
          .sort((a, b) => b.contador_likes - a.contador_likes);
        
        setTeachers(sortedTeachers);
      } catch (err) {
        setError('Error al cargar los profesores');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTeachers();
  }, []);

  // Manejar likes
  const handleLikeAdded = useCallback(async (teacherId) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para dar like');
      return false;
    }

    try {
      const currentIndex = teachers.findIndex(t => t.id === teacherId);
      const updatedTeachers = teachers.map(teacher => 
        teacher.id === teacherId
          ? { ...teacher, contador_likes: (teacher.contador_likes || 0) + 1 }
          : teacher
      );

      // Ordenar y encontrar nueva posición
      const sortedTeachers = [...updatedTeachers].sort((a, b) => 
        b.contador_likes - a.contador_likes
      );

      const newIndex = sortedTeachers.findIndex(t => t.id === teacherId);

      // Si el profesor subió en el ranking, mostrar efectos
      if (newIndex < currentIndex) {
        setMovingTeachers(prev => new Set([...prev, teacherId]));
        setShowConfetti(true);
        
        setTimeout(() => {
          setMovingTeachers(prev => {
            const next = new Set(prev);
            next.delete(teacherId);
            return next;
          });
          setShowConfetti(false);
        }, 1000);
      }

      setTeachers(sortedTeachers);
      return true;
    } catch (error) {
      console.error('Error al actualizar like:', error);
      return false;
    }
  }, [teachers, isAuthenticated]);

  const handleCardClick = useCallback((teacher) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para ver los detalles del profesor');
      return;
    }

    const rank = teachers.findIndex(t => t.id === teacher.id) + 1;
    setSelectedTeacher(teacher);
    setSelectedRank(rank);
    setShowModal(true);
  }, [teachers, isAuthenticated]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className={`teacher-list-container ${darkMode ? 'dark-mode' : ''}`}>
      <Confetti run={showConfetti} />

      <TeacherModal
        show={showModal}
        onHide={() => setShowModal(false)}
        teacher={selectedTeacher}
        rank={selectedRank}
        onLikeAdded={handleLikeAdded}
      />

      <animated.div className="ranking-header text-center">
        <h1 className="ranking-title">
          <FaTrophy className="trophy-icon" />
          Ranking de Profesores
        </h1>
      </animated.div>

      <div>
        <StatsDashboard 
          teachers={filteredTeachers} 
          totalLikes={totalLikes} 
        />
        {isAuthenticated && (
          <UpcomingBirthdays teachers={filteredTeachers} />
        )}
      </div>

      <SearchFilters
        nameFilter={nameFilter}
        departmentFilter={departmentFilter}
        onNameChange={(e) => setNameFilter(e.target.value)}
        onDepartmentChange={(e) => setDepartmentFilter(e.target.value)}
      />

      <div className="cards-grid">
        {transitions((style, teacher, _, index) => (
          <animated.div
            style={{
              ...style,
              position: 'relative',
              zIndex: filteredTeachers.length - index
            }}
            className="card-container"
          >
            <TeacherRankCard
              teacher={teacher}
              initialRank={index + 1}
              onLikeSuccess={handleLikeAdded}
              darkMode={darkMode}
              onClick={() => handleCardClick(teacher)}
              isMoving={movingTeachers.has(teacher.id)}
            />
          </animated.div>
        ))}

        {filteredTeachers.length === 0 && (
          <div className="no-results">
            <FaChalkboardTeacher size={40} />
            <h3>No se encontraron profesores</h3>
            <p>Intenta con otros criterios de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherList;