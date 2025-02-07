import PropTypes from 'prop-types';
import { Download } from 'lucide-react';

import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "../components/ui/table";

// This component handles the display of the optimized diet plan results
const OptimizationResults = ({ results }) => {
  // Filter out food items with zero servings for cleaner display
  const nonZeroItems = results.food_items
    .map((food, index) => ({
      food,
      servings: results.servings[index],
      cost: results.total_cost[index]
    }))
    .filter(item => item.servings > 0);

  // Handle CSV export of the optimization results
  const handleExportCSV = () => {
    // Create CSV content starting with the food items
    let csvContent = 'Food Item,Number of Servings,Cost (₹)\n';
    
    // Add each food item with its servings and cost
    nonZeroItems.forEach(item => {
      csvContent += `"${item.food}",${item.servings.toFixed(1)},₹${item.cost.toFixed(2)}\n`;
    });

    // Add total cost information
    csvContent += '\nTotal Daily Cost,₹' + results.total_cost_sum.toFixed(2) + '\n\n';
    
    // Add nutritional information
    csvContent += 'Daily Nutrition\n';
    for (const [nutrient, value] of Object.entries(results.nutrient_totals)) {
      csvContent += `${nutrient},${value}\n`;
    }

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'diet_plan.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader className="bg-success/10 border-b">
        <div className="flex justify-between items-center">
          <CardTitle>Optimized Diet Plan</CardTitle>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Recommended Daily Intake Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Recommended Daily Intake</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Food Item</TableHead>
                    <TableHead className="text-right">Number of Servings</TableHead>
                    <TableHead className="text-right">Cost (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nonZeroItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.food}</TableCell>
                      <TableCell className="text-right">{item.servings.toFixed(1)}</TableCell>
                      <TableCell className="text-right">₹{item.cost.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2} className="text-right font-semibold">
                      Total Daily Cost:
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{results.total_cost_sum.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>

          {/* Daily Nutrition Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Daily Nutrition</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(results.nutrient_totals).map(([nutrient, value], index) => (
                <Card key={index} className="bg-primary/5">
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      {nutrient}
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

OptimizationResults.propTypes = {
  results: PropTypes.shape({
    food_items: PropTypes.arrayOf(PropTypes.string).isRequired,
    servings: PropTypes.arrayOf(PropTypes.number).isRequired,
    total_cost: PropTypes.arrayOf(PropTypes.number).isRequired,
    total_cost_sum: PropTypes.number.isRequired,
    nutrient_totals: PropTypes.objectOf(PropTypes.number).isRequired,
  }).isRequired,
};

export default OptimizationResults;