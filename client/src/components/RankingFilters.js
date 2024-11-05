import React from 'react';
import { Row, Col, Form, InputGroup } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter } from 'react-icons/fa';

const RankingFilters = ({ nameFilter, departmentFilter, onFilterChange }) => {
  return (
    <Row className="justify-content-center mb-4">
      <Col md={6} lg={4}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <InputGroup className="search-input">
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar por nombre"
              value={nameFilter}
              onChange={(e) => onFilterChange('name', e.target.value)}
            />
          </InputGroup>
        </motion.div>
      </Col>
      <Col md={6} lg={4}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <InputGroup className="search-input">
            <InputGroup.Text>
              <FaFilter />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Filtrar por departamento"
              value={departmentFilter}
              onChange={(e) => onFilterChange('department', e.target.value)}
            />
          </InputGroup>
        </motion.div>
      </Col>
    </Row>
  );
};

export default RankingFilters;