import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { FaChartLine, FaTrophy, FaEnvelope } from 'react-icons/fa';
import TeacherLikeSystem from './TeacherLikeSystem';
import '../styles/FIFAStyleCard.css';

const TeacherRankCard = ({
  teacher,
  initialRank,
  onLikeSuccess,
  darkMode,
  onClick
}) => {
  const [rank, setRank] = useState(initialRank);
  const [isMoving, setIsMoving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const defaultAvatar = "/assets/default-fifa-avatar.png";

  useEffect(() => {
    if (initialRank !== rank) {
      setIsMoving(true);
      setRank(initialRank);
      const timer = setTimeout(() => setIsMoving(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [initialRank, rank]);

  const glowAnimation = useSpring({
    from: { boxShadow: '0 0 0px rgba(74, 144, 226, 0)' },
    to: async (next) => {
      if (isMoving) {
        await next({ boxShadow: '0 0 30px rgba(74, 144, 226, 0.6)' });
        await next({ boxShadow: '0 0 0px rgba(74, 144, 226, 0)' });
      }
    },
    config: { tension: 200, friction: 20 }
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
    if (teacher && teacher.email) {
      return teacher.email;
    }
    return 'Email no disponible';
  };

  const getTeacherImage = () => {
    console.log("teacher.foto:", teacher.foto); // Comprobación de URL en la consola
    if (imageError || !teacher.foto) {
        return defaultAvatar;
    }
    return teacher.foto;
};


  return (
    <animated.div style={glowAnimation}>
      <motion.div
        layout
        className={`fifa-style-card rank-${rank} ${darkMode ? 'dark-mode' : ''}`}
        onClick={onClick}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 25
          }
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ 
          type: "spring",
          stiffness: 400,
          damping: 17
        }}
      >
        <motion.div
          className="rank-medal"
          layout
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
                layout
                initial={false}
                animate={isMoving ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
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

export default React.memo(TeacherRankCard);
