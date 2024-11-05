import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaThumbsUp, FaUsers, FaStar, FaTrophy, FaChartLine } from 'react-icons/fa';

const StatsDashboard = ({ teachers }) => {
  const totalLikes = teachers.reduce((sum, t) => sum + t.likes, 0);
  const totalTeachers = teachers.length;
  const averageLikes = totalTeachers ? Math.round(totalLikes / totalTeachers) : 0;
  const topTeacher = teachers[0]; // Ya están ordenados por likes

  const stats = [
    {
      icon: <FaThumbsUp />,
      value: totalLikes.toLocaleString(),
      label: "Total Likes",
      color: "#4a90e2",
      delay: 0
    },
    {
      icon: <FaUsers />,
      value: totalTeachers,
      label: "Profesores",
      color: "#50c878",
      delay: 0.1
    },
    {
      icon: <FaChartLine />,
      value: averageLikes,
      label: "Media de Likes",
      color: "#e6a23c",
      delay: 0.2
    },
    {
      icon: <FaTrophy />,
      value: topTeacher?.name || "N/A",
      label: "Profesor Más Valorado",
      color: "#f56c6c",
      delay: 0.3
    }
  ];

  return (
    <Row className="stats-dashboard g-4 mb-4">
      {stats.map((stat, index) => (
        <Col key={index} xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay, duration: 0.5 }}
          >
            <Card className="stat-card h-100">
              <Card.Body>
                <div className="stat-icon" style={{ color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      ))}
    </Row>
  );
};

export default StatsDashboard;