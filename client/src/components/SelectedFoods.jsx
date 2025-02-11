import { useState } from 'react';
import PropTypes from 'prop-types';
import { Trash2, Calculator, Download } from 'lucide-react';
import api from '../services/api';

import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Table,
  TableBody,
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
      parseFloat(food.servingSize) <= 0 ||
      parseFloat(food.maxServing) <= 0
    );

    if (invalidFoods.length > 0) {
      setError('Please enter valid price, serving size, and maximum serving size for all foods.');
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
        maxServing: parseFloat(food.maxServing),
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

  const handleExportSelectedFoods = () => {
    const headers = [
      'Food Item',
      'Price (₹)',
      'Serving Size (g)',
      'Max Serving (g)',
      'FDC ID',
      'Vitamin A (µg)',
      'Vitamin C (mg)',
      'Vitamin D (µg)',
      'Vitamin E (mg)',
      'Vitamin K (µg)',
      'Thiamin (mg)',
      'Riboflavin (mg)',
      'Niacin (mg)',
      'Vitamin B6 (mg)',
      'Folate (µg)',
      'Vitamin B12 (µg)',
      'Calcium (mg)',
      'Carbohydrate (g)',
      'Choline (mg)',
      'Protein (g)',
      'Fats (g)',
      'Saturated Fats (g)',
      'Fiber (g)',
      'Copper (µg)',
      'Iron (mg)',
      'Magnesium (mg)',
      'Manganese (mg)',
      'Phosphorus (mg)',
      'Selenium (µg)',
      'Zinc (mg)',
      'Potassium (mg)',
      'Sodium (mg)',
      'Pantothenic Acid (mg)'
    ];

    let csvContent = headers.join(',') + '\n';

    foods.forEach(food => {
      const row = [
        `"${food.description}"`,
        food.price || '',
        food.servingSize || '',
        food.maxServing || '',
        food.fdcId,
        food.nutrients['Vitamin A (µg)'] || '',
        food.nutrients['Vitamin C (mg)'] || '',
        food.nutrients['Vitamin D (µg)'] || '',
        food.nutrients['Vitamin E (mg)'] || '',
        food.nutrients['Vitamin K (µg)'] || '',
        food.nutrients['Thiamin (mg)'] || '',
        food.nutrients['Riboflavin (mg)'] || '',
        food.nutrients['Niacin (mg)'] || '',
        food.nutrients['Vitamin B6 (mg)'] || '',
        food.nutrients['Folate (µg)'] || '',
        food.nutrients['Vitamin B12 (µg)'] || '',
        food.nutrients['Calcium (mg)'] || '',
        food.nutrients['carbohydrate'] || '',
        food.nutrients['Choline (mg)'] || '',
        food.nutrients['protein'] || '',
        food.nutrients['fats'] || '',
        food.nutrients['saturated_fats'] || '',
        food.nutrients['fiber'] || '',
        food.nutrients['Copper (µg)'] || '',
        food.nutrients['Iron (mg)'] || '',
        food.nutrients['Magnesium (mg)'] || '',
        food.nutrients['Manganese (mg)'] || '',
        food.nutrients['Phosphorus (mg)'] || '',
        food.nutrients['Selenium (µg)'] || '',
        food.nutrients['Zinc (mg)'] || '',
        food.nutrients['Potassium (mg)'] || '',
        food.nutrients['Sodium (mg)'] || '',
        food.nutrients['Pantothenic Acid (mg)'] || ''
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'selected_foods.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader className="bg-primary">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Selected Foods</CardTitle>
          {foods.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportSelectedFoods}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Foods CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {foods.length > 0 ? (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Food Item</TableHead>
                    <TableHead>Price (₹)</TableHead>
                    <TableHead>Serving Size (g)</TableHead>
                    <TableHead>Max Serving (g)</TableHead>
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
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          value={food.maxServing || 500}
                          onChange={(e) => handleInputChange(food.fdcId, 'maxServing', e.target.value)}
                          className="w-[100px]"
                          placeholder="500"
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