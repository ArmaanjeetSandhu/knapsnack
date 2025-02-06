import { useState } from 'react';
import { Card, Table, Button, Form, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const SelectedFoods = ({ 
  foods, 
  onFoodsUpdate, 
  nutrientGoals, 
  userInfo, 
  onOptimizationResults 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRemoveFood = (fdcId) => {
    onFoodsUpdate(foods.filter(food => food.fdcId !== fdcId));
  };

  const handleInputChange = (fdcId, field, value) => {
    onFoodsUpdate(foods.map(food => {
      if (food.fdcId === fdcId) {
        return { ...food, [field]: value };
      }
      return food;
    }));
  };

  const handleOptimize = async () => {
    if (!foods.length) {
      setError('Please select at least one food item.');
      return;
    }

    const invalidFoods = foods.filter(food => 
      !food.price || !food.servingSize || 
      parseFloat(food.price) <= 0 || 
      parseFloat(food.servingSize) <= 0
    );

    if (invalidFoods.length > 0) {
      setError('Please enter valid price and serving size for all foods.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const foodsData = foods.map(food => ({
        fdcId: food.fdcId,
        description: food.description,
        price: parseFloat(food.price),
        servingSize: parseFloat(food.servingSize),
        nutrients: adjustNutrientsForServingSize(food.nutrients, parseFloat(food.servingSize))
      }));

      const optimizationData = {
        selected_foods: foodsData,
        nutrient_goals: nutrientGoals,
        age: parseInt(userInfo.age),
        gender: userInfo.gender
      };

      const result = await api.optimizeDiet(optimizationData);
      if (result.success) {
        onOptimizationResults(result.result);
      } else {
        setError(result.message || 'Optimization failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during optimization');
    } finally {
      setLoading(false);
    }
  };

  const adjustNutrientsForServingSize = (nutrients, servingSize) => {
    const adjustedNutrients = {};
    for (const [nutrient, value] of Object.entries(nutrients)) {
      adjustedNutrients[nutrient] = (value * servingSize) / 100;
    }
    return adjustedNutrients;
  };

  return (
    <Card className="mb-4 shadow">
      <Card.Header as="h5" className="bg-primary text-white">
        Selected Foods
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="mb-4">
          <Alert variant="info">
            Note: Enter serving size in grams. Base nutrients are per 100g and will be 
            automatically adjusted based on your serving size.
          </Alert>
        </div>

        {foods.length > 0 ? (
          <>
            <Table responsive>
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Price (₹)</th>
                  <th>Serving Size (g)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((food) => (
                  <tr key={food.fdcId}>
                    <td>{food.description}</td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        value={food.price}
                        onChange={(e) => handleInputChange(food.fdcId, 'price', e.target.value)}
                        style={{ width: '100px' }}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="1"
                        min="0"
                        value={food.servingSize}
                        onChange={(e) => handleInputChange(food.fdcId, 'servingSize', e.target.value)}
                        style={{ width: '100px' }}
                      />
                    </td>
                    <td>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleRemoveFood(food.fdcId)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="d-grid">
              <Button
                variant="primary"
                size="lg"
                onClick={handleOptimize}
                disabled={loading}
              >
                {loading ? 'Optimizing...' : 'Optimize Diet Plan'}
              </Button>
            </div>
          </>
        ) : (
          <Alert variant="warning">
            No foods selected. Search and add foods to create your diet plan.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default SelectedFoods;