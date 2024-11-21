// StatsDashboard.js
import React, { memo, useMemo } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import {
  FaThumbsUp,
  FaUsers,
  FaTrophy,
  FaChartLine,
} from 'react-icons/fa';

const StatsDashboard = ({ teachers = [], totalLikes = 0 }) => {
  const stats = useMemo(() => {
    const totalTeachers = teachers.length;
    const averageLikes = totalTeachers
      ? Math.round(totalLikes / totalTeachers)
      : 0;

    const topTeacher = teachers.reduce(
      (prev, current) =>
        prev.contador_likes > current.contador_likes ? prev : current,
      { contador_likes: 0 }
    );

    return [
      {
        icon: <FaThumbsUp />,
        value: totalLikes.toLocaleString(),
        label: 'Total Likes',
        color: '#4a90e2',
        delay: 0,
        bgGradient:
          'linear-gradient(135deg, rgba(74, 144, 226, 0.1), rgba(74, 144, 226, 0.3))',
      },
      {
        icon: <FaUsers />,
        value: totalTeachers,
        label: 'Profesores',
        color: '#50c878',
        delay: 0.1,
        bgGradient:
          'linear-gradient(135deg, rgba(80, 200, 120, 0.1), rgba(80, 200, 120, 0.3))',
      },
      {
        icon: <FaChartLine />,
        value: averageLikes,
        label: 'Media de Likes',
        color: '#e6a23c',
        delay: 0.2,
        bgGradient:
          'linear-gradient(135deg, rgba(230, 162, 60, 0.1), rgba(230, 162, 60, 0.3))',
      },
      {
        icon: <FaTrophy />,
        value: topTeacher?.nombre || 'N/A',
        label: 'Profesor Más Valorado',
        color: '#f56c6c',
        delay: 0.3,
        bgGradient:
          'linear-gradient(135deg, rgba(245, 108, 108, 0.1), rgba(245, 108, 108, 0.3))',
      },
    ];
  }, [teachers, totalLikes]);

  return (
    <Row className="g-4 mb-4">
      {stats.map((stat, index) => (
        <Col key={index} xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay, duration: 0.5 }}
          >
            <Card
              className="h-100 text-center border-0"
              style={{
                background: stat.bgGradient,
                borderRadius: '15px',
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                <div
                  style={{
                    fontSize: '3rem',
                    color: stat.color,
                    marginBottom: '0.5rem',
                  }}
                >
                  {stat.icon}
                </div>
                <Card.Title
                  style={{
                    fontSize: '2rem',
                    fontWeight: '600',
                    fontFamily: 'Roboto, sans-serif',
                    marginBottom: '0.25rem',
                  }}
                >
                  {stat.value}
                </Card.Title>
                <Card.Text
                  style={{
                    color: '#6c757d',
                    fontSize: '1rem',
                    fontFamily: 'Roboto, sans-serif',
                  }}
                >
                  {stat.label}
                </Card.Text>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      ))}
    </Row>
  );
};

export default memo(StatsDashboard);
