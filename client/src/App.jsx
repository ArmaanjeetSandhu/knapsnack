import { useState } from 'react';
import PersonalInfoForm from './components/PersonalInfoForm';
import FoodSearch from './components/FoodSearch';
import SelectedFoods from './components/SelectedFoods';
import OptimizationResults from './components/OptimizationResults';
import api from './services/api';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./components/ui/navigation-menu";

function App() {
  const [nutrientGoals, setNutrientGoals] = useState(null);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [optimizationResults, setOptimizationResults] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

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
    } catch (error) {
      console.error('Error calculating nutrition:', error);
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
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 mb-8 flex-grow">
        {!nutrientGoals ? (
          <div className="max-w-4xl mx-auto">
            <PersonalInfoForm onSubmit={handleFormSubmit} />
          </div>
        ) : (
          <>
            <FoodSearch 
              onFoodSelect={(food) => setSelectedFoods([...selectedFoods, food])} 
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

      <footer className="bg-gray-900 text-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Goal-ith. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;