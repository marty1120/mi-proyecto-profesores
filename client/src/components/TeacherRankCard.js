import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { FaChartLine, FaTrophy, FaEnvelope } from 'react-icons/fa';
import TeacherLikeSystem from './TeacherLikeSystem';
import '../styles/FIFAStyleCard.css';

const TeacherRankCard = ({
  teacher,
  initialRank,
  onLikeSuccess,
  darkMode,
  onClick,
  isMoving 
}) => {
  const [rank, setRank] = useState(initialRank);
  const [imageError, setImageError] = useState(false);
  const defaultAvatar = "/assets/default-fifa-avatar.png";

  useEffect(() => {
    setRank(initialRank);
  }, [initialRank]);

  // Animación de la tarjeta cuando cambia de posición
  const cardSpring = useSpring({
    transform: isMoving ? 'scale(1.05)' : 'scale(1)',
    boxShadow: isMoving 
      ? '0 20px 40px rgba(0,0,0,0.2)' 
      : '0 5px 15px rgba(0,0,0,0.1)',
    zIndex: isMoving ? 999 : 1,
    config: { 
      tension: 300, 
      friction: 20,
      mass: 1
    }
  });

  const getRankIcon = () => {
    switch(rank) {
      case 1:
        return <FaTrophy className="rank-icon gold" />;
      case 2:
        return <FaTrophy className="rank-icon silver" />;
      case 3:
        return <FaTrophy className="rank-icon bronze" />;
      default:
        return <span>{rank}</span>;
    }
  };

  const getTeacherEmail = () => {
    if (teacher?.email) {
      return teacher.email;
    }
    return 'Email no disponible';
  };

  const getTeacherImage = () => {
    if (imageError || !teacher.foto) {
      return defaultAvatar;
    }
    return teacher.foto;
  };

  return (
    <animated.div style={cardSpring}>
      <motion.div
        layout
        className={`fifa-style-card rank-${rank} ${darkMode ? 'dark-mode' : ''}`}
        onClick={onClick}
        initial={false}
        animate={isMoving ? {
          scale: [1, 1.05, 1],
          transition: { duration: 0.3 }
        } : {}}
        whileHover={{ scale: 1.02 }}
      >
        <motion.div
          className="rank-medal"
          animate={isMoving ? {
            scale: [1, 1.2, 1],
            rotate: [0, -10, 10, 0]
          } : {}}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
        >
          {getRankIcon()}
        </motion.div>

        <motion.div
          className="card-img-wrapper"
          layout
        >
          <Card.Img
            variant="top"
            src={getTeacherImage()}
            alt={teacher.nombre}
            className="card-img-top"
            onError={(e) => {
              setImageError(true);
              e.target.src = defaultAvatar;
            }}
          />
        </motion.div>

        <Card.Body>
          <motion.div layout>
            <Card.Title>{teacher.nombre}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              {teacher.departamento}
            </Card.Subtitle>

            <div className="email-container mb-3">
              <FaEnvelope className="email-icon" />
              <span className="email-text" title={getTeacherEmail()}>
                {getTeacherEmail()}
              </span>
            </div>

            <div className="stats-container mb-3">
              <div className="stat-item">
                <FaChartLine />
                <span>{teacher.año_llegada || 'N/A'}</span>
                <small>Año de llegada</small>
              </div>
              <motion.div 
                className="stat-item likes-count"
                animate={isMoving ? {
                  scale: [1, 1.2, 1],
                  transition: { duration: 0.3 }
                } : {}}
              >
                <span>{teacher.contador_likes || 0}</span>
                <small>Likes</small>
              </motion.div>
            </div>

            <div className="mt-3" onClick={e => e.stopPropagation()}>
              <TeacherLikeSystem
                teacherId={teacher._id || teacher.id}
                teacherName={teacher.nombre}
                currentLikes={teacher.contador_likes || 0}
                onLikeAdded={onLikeSuccess}
              />
            </div>
          </motion.div>
        </Card.Body>
      </motion.div>
    </animated.div>
  );
};

TeacherRankCard.propTypes = {
  teacher: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nombre: PropTypes.string.isRequired,
    email: PropTypes.string,
    departamento: PropTypes.string,
    foto: PropTypes.string,
    año_llegada: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    contador_likes: PropTypes.number
  }).isRequired,
  initialRank: PropTypes.number.isRequired,
  onLikeSuccess: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  isMoving: PropTypes.bool
};

TeacherRankCard.defaultProps = {
  darkMode: false,
  isMoving: false
};

export default React.memo(TeacherRankCard, (prevProps, nextProps) => {
  return (
    prevProps.teacher.id === nextProps.teacher.id &&
    prevProps.initialRank === nextProps.initialRank &&
    prevProps.teacher.contador_likes === nextProps.teacher.contador_likes &&
    prevProps.darkMode === nextProps.darkMode &&
    prevProps.isMoving === nextProps.isMoving
  );
});