import { useState } from 'react';
import PropTypes from 'prop-types';
import { Trash2, Calculator } from 'lucide-react';
import api from '../services/api';

import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const SelectedFoods = ({ 
  foods, 
  onFoodsUpdate, 
  nutrientGoals, 
  userInfo, 
  onOptimizationResults 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Remove a food item from the selection
  const handleRemoveFood = (fdcId) => {
    onFoodsUpdate(foods.filter(food => food.fdcId !== fdcId));
  };

  // Update food item properties (price or serving size)
  const handleInputChange = (fdcId, field, value) => {
    onFoodsUpdate(foods.map(food => {
      if (food.fdcId === fdcId) {
        return { ...food, [field]: value };
      }
      return food;
    }));
  };

  // Handle optimization request
  const handleOptimize = async () => {
    if (!foods.length) {
      setError('Please select at least one food item.');
      return;
    }

    // Validate all inputs are present and valid
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
      // Prepare food data with adjusted nutrients
      const foodsData = foods.map(food => ({
        fdcId: food.fdcId,
        description: food.description,
        price: parseFloat(food.price),
        servingSize: parseFloat(food.servingSize),
        nutrients: adjustNutrientsForServingSize(food.nutrients, parseFloat(food.servingSize))
      }));

      // Create optimization request data
      const optimizationData = {
        selected_foods: foodsData,
        nutrient_goals: nutrientGoals,
        age: parseInt(userInfo.age),
        gender: userInfo.gender
      };

      // Send optimization request
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

  // Helper function to adjust nutrients based on serving size
  const adjustNutrientsForServingSize = (nutrients, servingSize) => {
    const adjustedNutrients = {};
    for (const [nutrient, value] of Object.entries(nutrients)) {
      adjustedNutrients[nutrient] = (value * servingSize) / 100;
    }
    return adjustedNutrients;
  };

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader className="bg-primary">
        <CardTitle className="text-white">Selected Foods</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription>
              Note: Enter serving size in grams. Base nutrients are per 100g and will be 
              automatically adjusted based on your serving size.
            </AlertDescription>
          </Alert>
        </div>

        {foods.length > 0 ? (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Food Item</TableHead>
                    <TableHead>Price (₹)</TableHead>
                    <TableHead>Serving Size (g)</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {foods.map((food) => (
                    <TableRow key={food.fdcId}>
                      <TableCell className="font-medium">
                        {food.description}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={food.price}
                          onChange={(e) => handleInputChange(food.fdcId, 'price', e.target.value)}
                          className="w-[100px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          value={food.servingSize}
                          onChange={(e) => handleInputChange(food.fdcId, 'servingSize', e.target.value)}
                          className="w-[100px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveFood(food.fdcId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6">
              <Button
                className="w-full"
                size="lg"
                onClick={handleOptimize}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Optimizing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    <span>Optimize Diet Plan</span>
                  </div>
                )}
              </Button>
            </div>
          </>
        ) : (
          <Alert>
            <AlertDescription>
              No foods selected. Search and add foods to create your diet plan.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

SelectedFoods.propTypes = {
  foods: PropTypes.arrayOf(
    PropTypes.shape({
      fdcId: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      servingSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      nutrients: PropTypes.object.isRequired
    })
  ).isRequired,
  onFoodsUpdate: PropTypes.func.isRequired,
  nutrientGoals: PropTypes.object.isRequired,
  userInfo: PropTypes.shape({
    age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    gender: PropTypes.string.isRequired
  }).isRequired,
  onOptimizationResults: PropTypes.func.isRequired
};

export default SelectedFoods;