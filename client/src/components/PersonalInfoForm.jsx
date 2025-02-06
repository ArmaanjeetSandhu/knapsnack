import { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import api from '../services/api';

const PersonalInfoForm = ({ onCalculationSuccess }) => {
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const initialFormData = {
    gender: 'm',
    age: '',
    weight: '',
    height: '',
    activity: '1.2',
    protein: '30',
    carbohydrate: '40',
    fats: '30',
    percentage: '100'
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    // Additional validation
    const age = parseInt(formData.age);
    const weight = parseInt(formData.weight);
    const height = parseInt(formData.height);

    if (age < 19 || age > 100) {
      setError('Age must be between 19 and 100');
      return;
    }

    if (weight < 30 || weight > 200) {
      setError('Weight must be between 30 and 200 kg');
      return;
    }

    if (height < 135 || height > 200) {
      setError('Height must be between 135 and 200 cm');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.calculateNutrition(formData);
      onCalculationSuccess({ ...result, age: formData.age, gender: formData.gender });
    } catch (err) {
      setError(err.message || 'An error occurred while calculating');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card className="mb-4 shadow">
      <Card.Header as="h5" className="bg-primary text-white">Personal Information</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="m">Male</option>
                  <option value="f">Female</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label>Age</Form.Label>
                <Form.Control
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="19"
                  max="100"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Age must be between 19 and 100
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Weight (kg)</Form.Label>
                <Form.Control
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  min="30"
                  max="200"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Weight must be between 30 and 200 kg
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label>Height (cm)</Form.Label>
                <Form.Control
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  min="135"
                  max="200"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Height must be between 135 and 200 cm
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Activity Level</Form.Label>
                <Form.Select
                  name="activity"
                  value={formData.activity}
                  onChange={handleInputChange}
                >
                  <option value="1.2">Sedentary</option>
                  <option value="1.375">Lightly Active</option>
                  <option value="1.55">Moderately Active</option>
                  <option value="1.725">Very Active</option>
                  <option value="1.9">Extremely Active</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Target Caloric Intake (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="percentage"
                  value={formData.percentage}
                  onChange={handleInputChange}
                  min="50"
                  max="150"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Protein Ratio (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="protein"
                  value={formData.protein}
                  onChange={handleInputChange}
                  min="10"
                  max="50"
                  required
                />
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group>
                <Form.Label>Carbohydrate Ratio (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="carbohydrate"
                  value={formData.carbohydrate}
                  onChange={handleInputChange}
                  min="20"
                  max="65"
                  required
                />
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group>
                <Form.Label>Fats Ratio (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="fats"
                  value={formData.fats}
                  onChange={handleInputChange}
                  min="15"
                  max="40"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-grid">
            <Button 
              type="submit" 
              variant="primary" 
              size="lg"
              disabled={loading}
            >
              {loading ? 'Calculating...' : 'Calculate'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PersonalInfoForm;