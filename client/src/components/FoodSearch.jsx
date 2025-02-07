import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Form, Button, ListGroup, Alert, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const FoodSearch = ({ onFoodSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { results } = await api.searchFood(searchTerm);
      setSearchResults(results);
    } catch (err) {
      setError(err.message || 'An error occurred while searching');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodSelect = (food) => {
    onFoodSelect({
      ...food,
      price: '',
      servingSize: '',
    });
  };

  return (
    <Card className="mb-4 shadow">
      <Card.Header as="h5" className="bg-primary text-white">
        Search Foods
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSearch} className="mb-4">
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search for foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faSearch} className="me-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </InputGroup>
        </Form>

        {searchResults.length > 0 && (
          <div className="search-results">
            <h6 className="mb-3">Search Results</h6>
            <ListGroup style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {searchResults.map((food) => (
                <ListGroup.Item
                  key={food.fdcId}
                  className="d-flex justify-content-between align-items-center"
                  action
                  onClick={() => handleFoodSelect(food)}
                >
                  <div>{food.description}</div>
                  <Button variant="success" size="sm">
                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                    Add
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
FoodSearch.propTypes = {
  onFoodSelect: PropTypes.func.isRequired,
};

export default FoodSearch;