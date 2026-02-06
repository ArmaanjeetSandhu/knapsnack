export const bankersRound = (num, decimalPlaces = 0) => {
  const m = Math.pow(10, decimalPlaces);
  const n = +(decimalPlaces ? num * m : num).toFixed(8);
  const i = Math.floor(n);
  const f = n - i;
  const e = 1e-8;
  const r =
    f > 0.5 - e && f < 0.5 + e ? (i % 2 === 0 ? i : i + 1) : Math.round(n);
  return decimalPlaces ? r / m : r;
};

export const calculateConsistentResults = (results, selectedFoods) => {
  const totals = {
    cost: 0,
    nutrients: {},
  };

  const items = results.food_items
    .map((foodName, index) => {
      const rawServings = results.servings[index];

      const roundedServings = bankersRound(rawServings, 1);
      if (roundedServings <= 0) return null;

      const food = selectedFoods.find((f) => f.description === foodName);
      if (!food) return null;

      const servingSize = parseFloat(food.servingSize) || 100;
      const totalServing = roundedServings * servingSize;
      const price = parseFloat(food.price) || 0;
      const cost = roundedServings * price;
      totals.cost += cost;

      const itemNutrients = {};
      Object.entries(food.nutrients).forEach(([key, value]) => {
        const nutrientValue = (value * totalServing) / 100;
        itemNutrients[key] = nutrientValue;

        totals.nutrients[key] = (totals.nutrients[key] || 0) + nutrientValue;
      });

      return {
        food: foodName,
        servings: roundedServings,
        servingSize,
        totalServing,
        cost,
        nutrients: itemNutrients,
      };
    })
    .filter((item) => item !== null);

  return { items, totals };
};

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

    if (aValue < bValue) return config.direction === "ascending" ? -1 : 1;
    if (aValue > bValue) return config.direction === "ascending" ? 1 : -1;
    return 0;
  });
};

export const formatValue = (value) => {
  return value;
};
