import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaChartLine, FaTrophy } from 'react-icons/fa';
import TeacherLikeSystem from './TeacherLikeSystem';
import '../styles/FIFAStyleCard.css';

const FIFAStyleCard = ({ 
  teacher, 
  rank, 
  darkMode,
  onClick 
}) => {
  const getRankIcon = () => {
    switch(rank) {
      case 1:
        return <FaTrophy className="rank-icon gold" />;
      case 2:
        return <FaTrophy className="rank-icon silver" />;
      case 3:
        return <FaTrophy className="rank-icon bronze" />;
      default:
        return <div className="rank">{rank}</div>;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`fifa-style-card rank-${rank} ${darkMode ? 'dark-mode' : ''}`}
        onClick={onClick}
      >
        <div className={`rank-medal rank-${rank}`}>
          {getRankIcon()}
        </div>

        <Card.Img 
          variant="top" 
          src={teacher.photo || "/placeholder-teacher.jpg"} 
          alt={teacher.name}
        />
        
        <Card.Body>
          <Card.Title>{teacher.name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            {teacher.department}
          </Card.Subtitle>

          <div className="stats-container mb-3">
            <div className="stat-item">
              <FaChartLine />
              <span>{teacher.año_llegada || 'N/A'}</span>
              <small>Año llegada</small>
            </div>
          </div>

          <div className="skills-container">
            {teacher.skills?.map((skill, index) => (
              <Badge 
                key={index} 
                bg="info" 
                className="skill-badge"
              >
                {skill}
              </Badge>
            ))}
          </div>

          {/* Sistema de Likes */}
          <div className="mt-3" onClick={e => e.stopPropagation()}>
            <TeacherLikeSystem
              teacherId={teacher.id}
              teacherName={teacher.name}
            />
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default FIFAStyleCard;