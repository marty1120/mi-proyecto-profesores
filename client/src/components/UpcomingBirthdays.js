import React, { useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { FaBirthdayCake, FaCalendar } from 'react-icons/fa';

const DAYS_THRESHOLD = 30; // Mostrar cumpleaños en los próximos 30 días
const MAX_BIRTHDAYS = 3; // Máximo número de cumpleaños a mostrar

const UpcomingBirthdays = ({ teachers }) => {
  const today = new Date();
  
  useEffect(() => {
    console.log('Teachers received in UpcomingBirthdays:', teachers);
    teachers.forEach(teacher => {
      console.log(`${teacher.nombre} - fecha_nacimiento:`, teacher.fecha_nacimiento);
    });
  }, [teachers]);
  
  const getDaysUntilBirthday = (birthDateStr) => {
    try {
      console.log('Processing birthdate string:', birthDateStr);
      
      if (!birthDateStr) {
        console.log('No birthdate provided');
        return Infinity;
      }
      
      const birthDate = new Date(birthDateStr);
      console.log('Converted birthdate to Date:', birthDate);
      
      if (isNaN(birthDate.getTime())) {
        console.log('Invalid date conversion');
        return Infinity;
      }
      
      const nextBirthday = new Date(
        today.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate()
      );
      console.log('Next birthday date:', nextBirthday);
      
      if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
        console.log('Birthday this year already passed, using next year:', nextBirthday);
      }
      
      const diffTime = nextBirthday.getTime() - today.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      console.log('Calculated days until birthday:', days);
      return days;
    } catch (error) {
      console.error('Error processing birthday:', error);
      return Infinity;
    }
  };

  const upcomingBirthdays = teachers
    .filter(teacher => {
      const hasBirthday = Boolean(teacher.fecha_nacimiento);
      const daysUntil = getDaysUntilBirthday(teacher.fecha_nacimiento);
      console.log(`Filtering ${teacher.nombre}:`, { 
        hasBirthday, 
        fecha_nacimiento: teacher.fecha_nacimiento,
        daysUntil
      });
      return hasBirthday && daysUntil <= DAYS_THRESHOLD;
    })
    .map(teacher => {
      const daysUntil = getDaysUntilBirthday(teacher.fecha_nacimiento);
      console.log(`Mapping ${teacher.nombre}:`, { daysUntil });
      return {
        ...teacher,
        daysUntil
      };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, MAX_BIRTHDAYS);

  console.log('Final upcoming birthdays:', upcomingBirthdays);

  if (upcomingBirthdays.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-primary text-white">
        <div className="d-flex align-items-center">
          <FaBirthdayCake className="me-2" />
          <h5 className="mb-0">Próximos Cumpleaños</h5>
        </div>
      </Card.Header>
      <Card.Body>
        {upcomingBirthdays.map((teacher, index) => (
          <div
            key={teacher.id || teacher._id}
            className={`d-flex align-items-center justify-content-between py-2 ${
              index !== upcomingBirthdays.length - 1 ? 'border-bottom' : ''
            }`}
          >
            <div className="d-flex align-items-center">
              <img
                src={teacher.foto || "/placeholder-teacher.jpg"}
                alt={teacher.nombre}
                className="rounded-circle me-2"
                width="32"
                height="32"
              />
              <div>
                <div className="fw-bold">{teacher.nombre}</div>
                <small className="text-muted">{teacher.departamento}</small>
              </div>
            </div>
            <div className="text-end">
              <div className="d-flex align-items-center">
                <FaCalendar className="me-1 text-primary" />
                <small className="text-muted">
                  {teacher.daysUntil === 0
                    ? "¡Hoy!"
                    : teacher.daysUntil === 1
                    ? "¡Mañana!"
                    : `En ${teacher.daysUntil} días`}
                </small>
              </div>
            </div>
          </div>
        ))}
      </Card.Body>
    </Card>
  );
};

export default UpcomingBirthdays;