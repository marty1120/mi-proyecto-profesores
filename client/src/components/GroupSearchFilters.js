import React from 'react';
import { Form, InputGroup, Row, Col } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

const GroupSearchFilters = ({ filters, onFilterChange }) => {
  return (
    <Row className="mb-4">
      <Col md={6} lg={4}>
        <InputGroup>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Buscar por nombre..."
            value={filters.search}
            onChange={(e) => onFilterChange({
              ...filters,
              search: e.target.value
            })}
          />
        </InputGroup>
      </Col>
      <Col md={6} lg={4}>
        <InputGroup>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Filtrar por departamento..."
            value={filters.department}
            onChange={(e) => onFilterChange({
              ...filters,
              department: e.target.value
            })}
          />
        </InputGroup>
      </Col>
    </Row>
  );
};

export default GroupSearchFilters;