import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ArrowRight, Activity, Flame, Target, Apple, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

const CalculationResults = ({ calculationData, userInfo, onProceed }) => {
  const [showAllNutrients, setShowAllNutrients] = useState(false);
  const [nutrientBounds, setNutrientBounds] = useState(null);

  useEffect(() => {
    const fetchNutrientBounds = async () => {
      try {
        const { lower_bounds, upper_bounds } = await window.fs.readFile('nutrient-databases/bounds.json', { encoding: 'utf8' });
        setNutrientBounds({ lower_bounds, upper_bounds });
      } catch (error) {
        console.error('Error fetching nutrient bounds:', error);
      }
    };

    fetchNutrientBounds();
  }, [userInfo]);

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
              <Apple className="w-5 h-5 text-green-500 dark:text-green-400" />
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

          {nutrientBounds && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Nutrient Requirements</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllNutrients(!showAllNutrients)}
                  className="flex items-center gap-1"
                >
                  {showAllNutrients ? (
                    <>Show Less <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>Show More <ChevronDown className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
              <ScrollArea className={showAllNutrients ? "h-96" : "h-48"}>
                <div className="grid gap-2">
                  {Object.entries(nutrientBounds.lower_bounds).map(([nutrient, lower]) => {
                    const upper = nutrientBounds.upper_bounds[nutrient];
                    return (
                      <div
                        key={nutrient}
                        className="p-3 rounded-lg border bg-card text-card-foreground"
                      >
                        <p className="text-sm font-medium">{nutrient}</p>
                        <p className="text-sm text-muted-foreground">
                          {lower && upper ? (
                            `${formatValue(lower)} - ${formatValue(upper)}`
                          ) : lower ? (
                            `Min: ${formatValue(lower)}`
                          ) : upper ? (
                            `Max: ${formatValue(upper)}`
                          ) : 'No specific requirement'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        className="w-full"
        size="lg"
        onClick={onProceed}
      >
        <span>Continue to Food Selection</span>
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
    saturated_fats: PropTypes.number.isRequired
  }).isRequired,
  userInfo: PropTypes.shape({
    age: PropTypes.number.isRequired,
    gender: PropTypes.string.isRequired
  }).isRequired,
  onProceed: PropTypes.func.isRequired
};

export default CalculationResults;