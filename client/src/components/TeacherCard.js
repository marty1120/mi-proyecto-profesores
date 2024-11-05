import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FaThumbsUp, FaCommentAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const TeacherCard = ({ teacher }) => {
  const { id, name, department, photo, likes, skills, comments } = teacher;

  return (
    <Card className="teacher-card mb-4 fade-in">
      <Card.Img variant="top" src={photo || "/placeholder-teacher.jpg"} />
      <Card.Body>
        <Card.Title>{name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{department}</Card.Subtitle>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <FaThumbsUp className="me-1 text-primary" />
            <span>{likes}</span>
          </div>
          <div>
            <FaCommentAlt className="me-1 text-secondary" />
            <span>{comments ? comments.length : 0}</span>
          </div>
        </div>
        <div className="mb-3">
          {skills && skills.map((skill, index) => (
            <Badge key={index} bg="info" className="me-1 mb-1">
              {skill}
            </Badge>
          ))}
        </div>
        <Button as={Link} to={`/profesor/${id}`} variant="outline-primary" block>
          Ver Perfil
        </Button>
      </Card.Body>
    </Card>
  );
};

export default TeacherCard;