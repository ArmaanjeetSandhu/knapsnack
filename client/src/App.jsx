import { useState } from 'react';
import PersonalInfoForm from './components/PersonalInfoForm';
import FoodSearch from './components/FoodSearch';
import SelectedFoods from './components/SelectedFoods';
import OptimizationResults from './components/OptimizationResults';
import ThemeToggle from './components/ThemeToggle';
import api from './services/api';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./components/ui/navigation-menu";
import { Alert, AlertDescription } from "./components/ui/alert";

const isDuplicateFood = (newFood, existingFoods) => {
  return existingFoods.some(food => food.fdcId === newFood.fdcId);
};

function App() {
  const [nutrientGoals, setNutrientGoals] = useState(null);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [optimizationResults, setOptimizationResults] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  const handleFormSubmit = async (formData) => {
    try {
      const calculationData = {
        gender: formData.gender,
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        activity: formData.activity,
        percentage: formData.percentage,
        protein: formData.macroRatios.protein,
        carbohydrate: formData.macroRatios.carbohydrate,
        fats: formData.macroRatios.fats
      };

      const result = await api.calculateNutrition(calculationData);
      
      setNutrientGoals(result);
      setUserInfo({
        age: formData.age,
        gender: formData.gender
      });
      setError(null);
    } catch (error) {
      setError('Error calculating nutrition: ' + error.message);
    }
  };

  const handleFoodSelect = (food) => {
    if (isDuplicateFood(food, selectedFoods)) {
      setError(`"${food.description}" is already in your food list.`);
      return;
    }
    
    setSelectedFoods(prevFoods => [...prevFoods, {
      ...food,
      price: '',
      servingSize: 100,
      maxServing: 500,
    }]);
    setOptimizationResults(null);
    setError(null);
  };

  const handleFoodsImport = (importedFoods) => {
    const uniqueNewFoods = importedFoods.filter(
      newFood => !isDuplicateFood(newFood, selectedFoods)
    );
    
    const duplicates = importedFoods.length - uniqueNewFoods.length;
    if (duplicates > 0) {
      setError(`${duplicates} duplicate food item(s) were skipped during import.`);
    } else {
      setError(null);
    }
    
    if (uniqueNewFoods.length > 0) {
      setSelectedFoods(prevFoods => [...prevFoods, ...uniqueNewFoods]);
      setOptimizationResults(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-900 text-white py-4 mb-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Goal-ith: The Meal Planner</h1>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className="text-white hover:text-gray-300 px-3 py-2"
                    href="#home"
                  >
                    Home
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className="text-white hover:text-gray-300 px-3 py-2"
                    href="#about"
                  >
                    About
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className="text-white hover:text-gray-300 px-3 py-2"
                    href="#contact"
                  >
                    Contact
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <ThemeToggle />
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 mb-8 flex-grow">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!nutrientGoals ? (
          <div className="max-w-4xl mx-auto">
            <PersonalInfoForm onSubmit={handleFormSubmit} />
          </div>
        ) : (
          <>
            <FoodSearch 
              onFoodSelect={handleFoodSelect} 
              onFoodsImport={handleFoodsImport} 
              selectedFoodIds={selectedFoods.map(food => food.fdcId)}
            />
            
            <SelectedFoods 
              foods={selectedFoods}
              onFoodsUpdate={setSelectedFoods}
              nutrientGoals={nutrientGoals}
              userInfo={userInfo}
              onOptimizationResults={setOptimizationResults}
            />
            
            {optimizationResults && (
              <OptimizationResults 
                results={optimizationResults}
                selectedFoods={selectedFoods}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;