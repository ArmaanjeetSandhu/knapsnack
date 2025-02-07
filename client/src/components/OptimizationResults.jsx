import { Card, Table, Button, Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

const OptimizationResults = ({ results }) => {
  const nonZeroItems = results.food_items
    .map((food, index) => ({
      food,
      servings: results.servings[index],
      cost: results.total_cost[index]
    }))
    .filter(item => item.servings > 0);

  const handleExportCSV = () => {
    let csvContent = 'Food Item,Number of Servings,Cost (₹)\n';
    
    nonZeroItems.forEach(item => {
      csvContent += `"${item.food}",${item.servings.toFixed(1)},₹${item.cost.toFixed(2)}\n`;
    });

    csvContent += '\nTotal Daily Cost,₹' + results.total_cost_sum.toFixed(2) + '\n\n';
    csvContent += 'Daily Nutrition\n';

    for (const [nutrient, value] of Object.entries(results.nutrient_totals)) {
      csvContent += `${nutrient},${value}\n`;
    }

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
    <Card className="mb-4 shadow">
      <Card.Header as="h5" className="bg-success text-white d-flex justify-content-between align-items-center">
        Optimized Diet Plan
        <Button 
          variant="outline-light" 
          size="sm"
          onClick={handleExportCSV}
        >
          <FontAwesomeIcon icon={faDownload} className="me-2" />
          Export CSV
        </Button>
      </Card.Header>
      <Card.Body>
        <h6 className="mb-4">Recommended Daily Intake</h6>
        <Table responsive className="mb-4">
          <thead>
            <tr>
              <th>Food Item</th>
              <th>Number of Servings</th>
              <th>Cost (₹)</th>
            </tr>
          </thead>
          <tbody>
            {nonZeroItems.map((item, index) => (
              <tr key={index}>
                <td>{item.food}</td>
                <td>{item.servings.toFixed(1)}</td>
                <td>₹{item.cost.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="table-active font-weight-bold">
              <td colSpan="2" className="text-end">Total Daily Cost:</td>
              <td>₹{results.total_cost_sum.toFixed(2)}</td>
            </tr>
          </tbody>
        </Table>

        <h6 className="mb-4">Daily Nutrition</h6>
        <Row className="g-4">
          {Object.entries(results.nutrient_totals).map(([nutrient, value], index) => (
            <Col md={3} sm={6} key={index}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title className="h6">{nutrient}</Card.Title>
                  <Card.Text className="h4 text-primary mb-0">
                    {value}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
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
  selectedFoods: PropTypes.arrayOf(PropTypes.string)
};

export default OptimizationResults;