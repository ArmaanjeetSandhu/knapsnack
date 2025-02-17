import { useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowRight, Activity, Flame, Target, Beef, Beaker } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { NutrientTable, NutrientCards } from './NutrientDisplay';

const CalculationResults = ({ calculationData, onProceed }) => {
  const [nutrientDisplayMode, setNutrientDisplayMode] = useState('table');

  const formatValue = (value) => {
    return typeof value === 'number' ? value.toLocaleString('en-US', {
      maximumFractionDigits: 1
    }) : value;
  };

  const mainMetrics = [
    {
      icon: Flame,
      label: 'Basal Metabolic Rate (BMR)',
      value: `${formatValue(calculationData.bmr)} kcal/day`,
      color: 'text-orange-500 dark:text-orange-400'
    },
    {
      icon: Activity,
      label: 'Total Daily Energy Expenditure (TDEE)',
      value: `${formatValue(calculationData.tdee)} kcal/day`,
      color: 'text-blue-500 dark:text-blue-400'
    },
    {
      icon: Target,
      label: 'Daily Caloric Target',
      value: `${formatValue(calculationData.daily_caloric_intake)} kcal/day`,
      color: 'text-green-500 dark:text-green-400'
    }
  ];

  const macroNutrients = [
    { label: 'Protein', value: calculationData.protein, unit: 'g' },
    { label: 'Carbohydrates', value: calculationData.carbohydrate, unit: 'g' },
    { label: 'Fats', value: calculationData.fats, unit: 'g' },
    { label: 'Fiber', value: calculationData.fiber, unit: 'g' },
    { label: 'Saturated Fats', value: calculationData.saturated_fats, unit: 'g' }
  ];

  const vitamins = [
    { name: 'Vitamin A', key: 'Vitamin A (µg)', unit: 'µg' },
    { name: 'Vitamin C', key: 'Vitamin C (mg)', unit: 'mg' },
    { name: 'Vitamin D', key: 'Vitamin D (µg)', unit: 'µg' },
    { name: 'Vitamin E', key: 'Vitamin E (mg)', unit: 'mg' },
    { name: 'Vitamin K', key: 'Vitamin K (µg)', unit: 'µg' },
    { name: 'Thiamin', key: 'Thiamin (mg)', unit: 'mg' },
    { name: 'Riboflavin', key: 'Riboflavin (mg)', unit: 'mg' },
    { name: 'Niacin', key: 'Niacin (mg)', unit: 'mg' },
    { name: 'Vitamin B6', key: 'Vitamin B6 (mg)', unit: 'mg' },
    { name: 'Folate', key: 'Folate (µg)', unit: 'µg' },
    { name: 'Vitamin B12', key: 'Vitamin B12 (µg)', unit: 'µg' },
    { name: 'Pantothenic Acid', key: 'Pantothenic Acid (mg)', unit: 'mg' },
    { name: 'Choline', key: 'Choline (mg)', unit: 'mg' }
  ];

  const minerals = [
    { name: 'Calcium', key: 'Calcium (mg)', unit: 'mg' },
    { name: 'Copper', key: 'Copper (µg)', unit: 'µg' },
    { name: 'Iron', key: 'Iron (mg)', unit: 'mg' },
    { name: 'Magnesium', key: 'Magnesium (mg)', unit: 'mg' },
    { name: 'Manganese', key: 'Manganese (mg)', unit: 'mg' },
    { name: 'Phosphorus', key: 'Phosphorus (mg)', unit: 'mg' },
    { name: 'Selenium', key: 'Selenium (µg)', unit: 'µg' },
    { name: 'Zinc', key: 'Zinc (mg)', unit: 'mg' },
    { name: 'Potassium', key: 'Potassium (mg)', unit: 'mg' },
    { name: 'Sodium', key: 'Sodium (mg)', unit: 'mg' },
  ];

  const renderNutrientTable = (nutrients) => (
    <NutrientTable
      nutrients={nutrients}
      lowerBounds={calculationData.lower_bounds}
      upperBounds={calculationData.upper_bounds}
    />
  );

  const renderNutrientCards = (nutrients) => (
    <NutrientCards
      nutrients={nutrients}
      lowerBounds={calculationData.lower_bounds}
      upperBounds={calculationData.upper_bounds}
    />
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Calculated Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {mainMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <metric.icon className={`w-8 h-8 ${metric.color}`} />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {metric.label}
                      </p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Beef className="w-5 h-5 text-green-500 dark:text-green-400" />
              Macronutrient Targets
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {macroNutrients.map((macro, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card text-card-foreground"
                >
                  <p className="text-sm font-medium text-muted-foreground">
                    {macro.label}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatValue(macro.value)}{macro.unit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Beaker className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                Micronutrient Requirements
              </h3>
              <div className="text-sm text-muted-foreground p-3 rounded-md">
                <p><strong>RDA</strong>: Recommended Dietary Allowance</p>
                <p><strong>UL</strong>: Tolerable Upper Intake Level</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={nutrientDisplayMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNutrientDisplayMode('cards')}
                >
                  Cards
                </Button>
                <Button
                  variant={nutrientDisplayMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNutrientDisplayMode('table')}
                >
                  Table
                </Button>
              </div>
            </div>

            <Tabs defaultValue="vitamins" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="vitamins" className="flex-1">Vitamins</TabsTrigger>
                <TabsTrigger value="minerals" className="flex-1">Minerals</TabsTrigger>
              </TabsList>
              <TabsContent value="vitamins">
                <ScrollArea className="h-[400px]">
                  {nutrientDisplayMode === 'table' ? 
                    renderNutrientTable(vitamins) : 
                    renderNutrientCards(vitamins)}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="minerals">
                <ScrollArea className="h-[400px]">
                  {nutrientDisplayMode === 'table' ? 
                    renderNutrientTable(minerals) : 
                    renderNutrientCards(minerals)}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        size="lg"
        onClick={onProceed}
      >
        <span>Ready to meet all these goals?</span>
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};

CalculationResults.propTypes = {
  calculationData: PropTypes.shape({
    bmr: PropTypes.number.isRequired,
    tdee: PropTypes.number.isRequired,
    daily_caloric_intake: PropTypes.number.isRequired,
    protein: PropTypes.number.isRequired,
    carbohydrate: PropTypes.number.isRequired,
    fats: PropTypes.number.isRequired,
    fiber: PropTypes.number.isRequired,
    saturated_fats: PropTypes.number.isRequired,
    lower_bounds: PropTypes.object,
    upper_bounds: PropTypes.object
  }).isRequired,
  userInfo: PropTypes.shape({
    age: PropTypes.number.isRequired,
    gender: PropTypes.string.isRequired
  }).isRequired,
  onProceed: PropTypes.func.isRequired
};

export default CalculationResults;