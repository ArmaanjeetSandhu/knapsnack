import { useState } from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import PersonalInfoForm from './components/PersonalInfoForm';
import FoodSearch from './components/FoodSearch';
import SelectedFoods from './components/SelectedFoods';
import OptimizationResults from './components/OptimizationResults';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [nutrientGoals, setNutrientGoals] = useState(null);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [optimizationResults, setOptimizationResults] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const handleCalculationSuccess = (data) => {
    setNutrientGoals(data);
    setUserInfo({
      age: data.age,
      gender: data.gender
    });
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand href="#home">Goal-ith: The Meal Planner</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#about">About</Nav.Link>
              <Nav.Link href="#contact">Contact</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="flex-grow-1 mb-4">
        <PersonalInfoForm onCalculationSuccess={handleCalculationSuccess} />
        
        {nutrientGoals && (
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
      </Container>

      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <Container>
          <p className="mb-0">&copy; 2025 Goal-ith. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
}

export default App;