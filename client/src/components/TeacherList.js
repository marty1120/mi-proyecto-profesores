// TeacherList.js
import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
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
import { getTeachers, addLike } from '../services/teacherService';
import { toast } from 'react-hot-toast';
import '../styles/TeacherList.css';

// Configuración de animación personalizada para las transiciones de los elementos
const TRANSITION_CONFIG = {
  tension: 300,
  friction: 20,
  mass: 1,
  duration: 200,
};

// Componente memoizado SearchBar para la barra de búsqueda de texto
const SearchBar = memo(({ value, onChange, placeholder }) => (
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

// Componente memoizado SearchFilters para gestionar los filtros de búsqueda
const SearchFilters = memo(
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

// Componente principal que lista profesores
const TeacherList = () => {
  const { darkMode } = useTheme(); // Obtiene el modo oscuro del contexto del tema
  const { isAuthenticated } = useAuth(); // Obtiene el estado de autenticación

  // Definición de estados para gestionar la lista de profesores y otros valores
  const [teachers, setTeachers] = useState([]); // Lista completa de profesores
  const [filteredTeachers, setFilteredTeachers] = useState([]); // Lista filtrada de profesores
  const [nameFilter, setNameFilter] = useState(''); // Filtro por nombre
  const [departmentFilter, setDepartmentFilter] = useState(''); // Filtro por departamento
  const [showConfetti, setShowConfetti] = useState(false); // Estado para activar confetti
  const [selectedTeacher, setSelectedTeacher] = useState(null); // Profesor seleccionado
  const [selectedRank, setSelectedRank] = useState(null); // Rango del profesor seleccionado
  const [showModal, setShowModal] = useState(false); // Mostrar modal de detalles del profesor
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado de error

  // useEffect para cargar los profesores al montar el componente
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getTeachers();

        // Ordenar profesores según los likes
        const sortedTeachers = response.data
          .map((teacher) => ({
            ...teacher,
            contador_likes: parseInt(teacher.likes || 0, 10),
          }))
          .sort((a, b) => b.contador_likes - a.contador_likes);

        setTeachers(sortedTeachers);
        setFilteredTeachers(sortedTeachers); // Inicializamos filteredTeachers con la lista completa
      } catch (error) {
        console.error('Error al obtener los profesores:', error);
        setError('Error al cargar los profesores.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // useEffect para aplicar los filtros a la lista de profesores
  useEffect(() => {
    const filtered = teachers.filter(
      (teacher) =>
        teacher.nombre?.toLowerCase().includes(nameFilter.toLowerCase()) &&
        teacher.departamento
          ?.toLowerCase()
          .includes(departmentFilter.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [teachers, nameFilter, departmentFilter]);

  // Calcula el total de likes de los profesores filtrados
  const totalLikes = useMemo(() => {
    return filteredTeachers.reduce((sum, t) => sum + t.contador_likes, 0);
  }, [filteredTeachers]);

  // Configuración de las animaciones para las transiciones de los elementos
  const transitions = useTransition(filteredTeachers, {
    keys: (teacher) => teacher.id,
    from: { opacity: 0, transform: 'scale(0.95) translateY(20px)' },
    enter: { opacity: 1, transform: 'scale(1) translateY(0px)' },
    leave: { opacity: 0, transform: 'scale(0.95) translateY(20px)' },
    config: TRANSITION_CONFIG,
    trail: 25,
  });

  // Animación para el encabezado del ranking
  const headerSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(-50px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: config.gentle,
  });

  // Animación para el mensaje de "no resultados"
  const noResultsSpring = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: config.gentle,
  });

  // Función memoizada para manejar el evento de dar "like" a un profesor
  const handleLikeAdded = useCallback(
    async (teacherId) => {
      if (!isAuthenticated) {
        toast.error('Debes iniciar sesión para dar like.');
        return false;
      }
      try {
        await addLike(teacherId);
        setTeachers((prevTeachers) =>
          prevTeachers.map((teacher) =>
            teacher.id === teacherId
              ? { ...teacher, contador_likes: teacher.contador_likes + 1 }
              : teacher
          )
        );
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        return true;
      } catch (error) {
        console.error('Error al dar like:', error);
        const errorMessage =
          error.response?.data?.message ||
          'No puedes dar like en este momento.';
        toast.error(errorMessage);
        return false;
      }
    },
    [setTeachers, isAuthenticated]
  );

  // Función para manejar el clic en una tarjeta de profesor
  const handleCardClick = useCallback(
    (teacher) => {
      if (!isAuthenticated) {
        toast.error('Debes iniciar sesión para ver los detalles del profesor.');
        return;
      }
      const rank = teachers.findIndex((t) => t.id === teacher.id) + 1;
      setSelectedTeacher(teacher);
      setSelectedRank(rank);
      setShowModal(true);
    },
    [teachers, isAuthenticated]
  );

  // Mostrar mensaje de carga mientras se obtienen los datos
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Mostrar mensaje de error si la carga de datos falla
  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        {error}
      </div>
    );
  }

  // Render principal del componente
  return (
    <div className={`teacher-list-container ${darkMode ? 'dark-mode' : ''}`}>
      <Confetti run={showConfetti} onComplete={() => setShowConfetti(false)} />

      <TeacherModal
        show={showModal}
        onHide={() => setShowModal(false)}
        teacher={selectedTeacher}
        rank={selectedRank}
      />

      <animated.div style={headerSpring} className="ranking-header text-center">
        <h1 className="ranking-title">
          <FaTrophy className="trophy-icon" />
          Ranking de Profesores
        </h1>
        <p className="ranking-subtitle">
          La red social para profesores del IES Al-Ándalus
        </p>
      </animated.div>

      <div>
        <StatsDashboard teachers={filteredTeachers} totalLikes={totalLikes} />
        {isAuthenticated && <UpcomingBirthdays teachers={filteredTeachers} />}
      </div>

      <SearchFilters
        nameFilter={nameFilter}
        departmentFilter={departmentFilter}
        onNameChange={(e) => setNameFilter(e.target.value)}
        onDepartmentChange={(e) => setDepartmentFilter(e.target.value)}
      />

      {/* Mostrar mensaje si no hay profesores */}
      {filteredTeachers.length === 0 ? (
        <animated.div
          style={noResultsSpring}
          className="no-results text-center my-5"
        >
          <FaChalkboardTeacher size={60} className="mb-3 text-muted" />
          <h3 className="text-muted">No se encontraron profesores</h3>
          <p className="text-muted">Intenta con otros criterios de búsqueda</p>
        </animated.div>
      ) : (
        <div className="cards-grid">
          {transitions((style, teacher) => (
            <animated.div
              style={{
                ...style,
                gridColumn: 'span 1',
                height: '100%',
                position: 'relative',
              }}
              className="card-container"
              key={teacher.id}
            >
              <TeacherRankCard
                teacher={teacher}
                initialRank={teachers.findIndex((t) => t.id === teacher.id) + 1}
                onLikeSuccess={handleLikeAdded}
                darkMode={darkMode}
                onClick={() => handleCardClick(teacher)}
              />
            </animated.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(TeacherList);
