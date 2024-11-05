import React from 'react';
import { Modal, ProgressBar } from 'react-bootstrap';
import { FaTrophy } from 'react-icons/fa';
import '../styles/TeacherModal.css';

const TeacherModal = ({ teacher, show, onHide, rank }) => {
    if (!teacher) return null;

    const BASE_PROGRESS = 30;

    // Fórmula para la contribución de likes
    const calculateLikesContribution = () => {
        return Math.min(Math.log1p(teacher.likes) * 10, 40); // Suavizar con logaritmo
    };

    // Calcular progreso por categoría
    const calculateProgress = (category) => {
        let progress = 0;

        // Asignar base si cumple criterios
        if (teacher.likes > 10 || teacher.skills?.length > 1) {
            progress += BASE_PROGRESS;
        }

        // Contribución de likes
        const likesContribution = calculateLikesContribution();
        progress += likesContribution;

        // Progreso por habilidades específicas
        switch (category) {
            case 'Pedagogía':
                if (teacher.skills?.includes('Comunicación')) progress += 15;
                if (teacher.skills?.includes('Motivación')) progress += 10;
                if (teacher.skills?.includes('Paciencia')) progress += 5;
                break;
            case 'Soft Skills':
                if (teacher.skills?.includes('Empatía')) progress += 15;
                if (teacher.skills?.includes('Trabajo en equipo')) progress += 10;
                if (teacher.skills?.includes('Compañerismo')) progress += 5;
                break;
            case 'Profesional':
                if (teacher.skills?.includes('Innovación')) progress += 7.5;
                if (teacher.skills?.includes('Creatividad')) progress += 7.5;
                if (teacher.skills?.includes('Organización')) progress += 7.5;
                if (teacher.skills?.includes('Liderazgo')) progress += 7.5;
                break;
        }

        return Math.min(progress, 100);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="teacher-modal">
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center">
                    <FaTrophy className="trophy-icon me-2" />
                    {teacher.name}
                    <div className="rank-number">#{rank}</div>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="teacher-info">
                    <div className="teacher-main">
                        <img 
                            src={teacher.photo || "/placeholder-teacher.jpg"} 
                            alt={teacher.name} 
                            className="teacher-image"
                        />
                        <h3>{teacher.department}</h3>
                    </div>

                    <div className="teacher-details">
                        <h4>Pedagogía</h4>
                        <ProgressBar now={calculateProgress('Pedagogía')} variant="info" className="skill-bar" />

                        <h4>Soft Skills</h4>
                        <ProgressBar now={calculateProgress('Soft Skills')} variant="success" className="skill-bar" />

                        <h4>Profesional</h4>
                        <ProgressBar now={calculateProgress('Profesional')} variant="warning" className="skill-bar" />

                        <div className="likes-section">
                            <span>{teacher.likes} likes</span>
                        </div>

                        <div className="skills-container">
                            {teacher.skills?.map((skill, index) => (
                                <span key={index} className="skill-badge">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Explicación de las categorías debajo de los gráficos y barras */}
                    <div className="category-explanation-container">
                        <h5>¿Qué significan las categorías?</h5>
                        <p><strong>Pedagogía:</strong> Habilidades clave para enseñar de manera efectiva, como Comunicación, Motivación y Paciencia.</p>
                        <p><strong>Soft Skills:</strong> Habilidades interpersonales esenciales, como Empatía, Trabajo en equipo y Compañerismo.</p>
                        <p><strong>Profesional:</strong> Competencias relacionadas con la organización, innovación y liderazgo.</p>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default TeacherModal;
