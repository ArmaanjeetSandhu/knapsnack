export const getNonZeroItems = (results, selectedFoods) => {
  return results.food_items
    .map((foodName, index) => {
      const servings = results.servings[index];
      if (servings <= 0) return null;
      const food = selectedFoods.find((f) => f.description === foodName);
      if (!food) return null;
      const servingSize = parseFloat(food.servingSize) || 100;
      const totalServing = servings * servingSize;
      const cost = results.total_cost[index];
      return {
        food: foodName,
        servings,
        servingSize,
        totalServing,
        cost,
      };
    })
    .filter((item) => item !== null);
};

export const sortItems = (items, config, type = "portions") => {
  if (!config.key) return items;

  return [...items].sort((a, b) => {
    let aValue, bValue;

    if (type === "portions") {
      if (config.key === "food") {
        aValue = a.food.toLowerCase();
        bValue = b.food.toLowerCase();
      } else if (config.key === "servingSize") {
        aValue = a.servingSize || 0;
        bValue = b.servingSize || 0;
      } else if (config.key === "servings") {
        aValue = a.servings || 0;
        bValue = b.servings || 0;
      } else if (config.key === "totalServing") {
        aValue = a.totalServing || 0;
        bValue = b.totalServing || 0;
      } else if (config.key === "cost") {
        aValue = a.cost || 0;
        bValue = b.cost || 0;
      }
    } else if (type === "nutrients") {
      if (config.key === "nutrient") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (config.key === "amount") {
        aValue = a.value || 0;
        bValue = b.value || 0;
      } else if (config.key === "unit") {
        aValue = a.unit.toLowerCase();
        bValue = b.unit.toLowerCase();
      }
    }

    if (aValue < bValue) {
      return config.direction === "ascending" ? -1 : 1;
    }
    if (aValue > bValue) {
      return config.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });
};

export const formatValue = (value) => {
  return typeof value === "number"
    ? value.toLocaleString("en-US", {
        maximumFractionDigits: 1,
      })
    : value;
};
