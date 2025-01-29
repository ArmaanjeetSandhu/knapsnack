document.addEventListener("DOMContentLoaded", () => {
  const personalInfoForm = document.getElementById("personal-info-form");
  const resultsSection = document.getElementById("results");
  const foodSelectionSection = document.getElementById("food-selection");
  const searchInput = document.getElementById("food-search");
  const searchButton = document.getElementById("search-button");
  const searchResults = document.getElementById("search-results");
  const resultsList = document.getElementById("results-list");
  const selectedFoodsList = document.getElementById("selected-foods-list");
  const optimizeButton = document.getElementById("optimize-button");
  const optimizationResults = document.getElementById("optimization-results");
  const dietPlan = document.getElementById("diet-plan");
  const ageInput = document.getElementById("age");

  let nutrientGoals = {};
  let selectedFoods = new Map(); // Map to store selected foods with their nutritional data

  ageInput.addEventListener("input", function () {
    if (this.value < 19) {
      this.setCustomValidity("Age must be 19 or older");
    } else {
      this.setCustomValidity("");
    }
  });

  personalInfoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(personalInfoForm);
    const data = Object.fromEntries(formData.entries());

    if (parseInt(data.age) < 19) {
      alert("Age must be 19 or older");
      return;
    }

    try {
      const response = await fetch("/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      displayResults(result);
      showFoodSelection();
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while calculating. Please try again.");
    }
  });

  searchButton.addEventListener("click", async () => {
    const query = searchInput.value.trim();
    if (!query) return;

    try {
      const response = await fetch("/search_food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      displaySearchResults(data.results);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while searching. Please try again.");
    }
  });

  function displaySearchResults(results) {
    resultsList.innerHTML = "";
    results.forEach((food) => {
      const div = document.createElement("div");
      div.className =
        "p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center";
      div.innerHTML = `
        <span>${food.description}</span>
        <button class="add-food-btn bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600" 
          data-food='${JSON.stringify(food)}'>
          Add
        </button>
      `;
      resultsList.appendChild(div);
    });
    searchResults.classList.remove("hidden");
  }

  resultsList.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-food-btn")) {
      const foodData = JSON.parse(e.target.dataset.food);
      addFoodToSelection(foodData);
    }
  });

  function addFoodToSelection(foodData) {
    if (selectedFoods.has(foodData.fdcId)) {
      alert("This food is already in your selection.");
      return;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        ${foodData.description}
        <div class="text-xs text-gray-500">Base nutrients per 100g</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <input type="number" step="0.01" min="0" 
              class="food-price w-24 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200" 
              placeholder="Price (₹)" required>
          </div>
          <div class="flex items-center gap-2">
            <input type="number" step="1" min="0" 
              class="serving-size w-24 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200" 
              placeholder="Serving (g)" required>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <button class="remove-food text-red-600 hover:text-red-900">Remove</button>
      </td>
    `;

    const priceInput = row.querySelector(".food-price");
    const servingSizeInput = row.querySelector(".serving-size");

    // Add event listeners for validation
    priceInput.addEventListener("input", updateOptimizeButton);
    servingSizeInput.addEventListener("input", updateOptimizeButton);

    row.querySelector(".remove-food").addEventListener("click", () => {
      selectedFoods.delete(foodData.fdcId);
      row.remove();
      updateOptimizeButton();
    });

    selectedFoodsList.appendChild(row);
    selectedFoods.set(foodData.fdcId, {
      ...foodData,
      row: row,
      priceInput: priceInput,
      servingSizeInput: servingSizeInput,
    });
    updateOptimizeButton();
  }

  function updateOptimizeButton() {
    const allInputsEntered = Array.from(selectedFoods.values()).every(
      (food) =>
        food.priceInput.value &&
        food.priceInput.value > 0 &&
        food.servingSizeInput.value &&
        food.servingSizeInput.value > 0
    );
    optimizeButton.disabled = selectedFoods.size === 0 || !allInputsEntered;
  }

  function displayResults(result) {
    document.getElementById("bmr-result").textContent = `${Math.round(
      result.bmr
    )} kcal`;
    document.getElementById("tdee-result").textContent = `${Math.round(
      result.tdee
    )} kcal`;
    document.getElementById(
      "calorie-result"
    ).textContent = `${result.daily_caloric_intake} kcal`;
    document.getElementById(
      "protein-result"
    ).textContent = `${result.protein} g`;
    document.getElementById(
      "carbs-result"
    ).textContent = `${result.carbohydrates} g`;
    document.getElementById("fats-result").textContent = `${result.fats} g`;

    nutrientGoals = {
      protein: result.protein,
      carbohydrates: result.carbohydrates,
      fats: result.fats,
      fibre: result.fibre,
      saturated_fats: result.saturated_fats,
    };

    resultsSection.classList.remove("hidden");
  }

  function showFoodSelection() {
    foodSelectionSection.classList.remove("hidden");
    selectedFoods.clear();
    selectedFoodsList.innerHTML = "";
    searchInput.value = "";
    searchResults.classList.add("hidden");
    updateOptimizeButton();
  }

  function adjustNutrientsForServingSize(nutrients, servingSize) {
    const adjustedNutrients = {};
    for (const [nutrient, value] of Object.entries(nutrients)) {
      // Convert from per 100g to per serving size
      adjustedNutrients[nutrient] = (value * servingSize) / 100;
    }
    return adjustedNutrients;
  }

  optimizeButton.addEventListener("click", async () => {
    if (selectedFoods.size === 0) {
      alert("Please select at least one food item.");
      return;
    }

    const foodsData = Array.from(selectedFoods.values()).map((food) => {
      const servingSize = parseFloat(food.servingSizeInput.value);
      const adjustedNutrients = adjustNutrientsForServingSize(
        food.nutrients,
        servingSize
      );

      return {
        fdcId: food.fdcId,
        description: `${food.description} (${servingSize}g serving)`,
        price: parseFloat(food.priceInput.value),
        nutrients: adjustedNutrients,
        servingSize: servingSize,
      };
    });

    const data = {
      selected_foods: foodsData,
      nutrient_goals: nutrientGoals,
      age: document.getElementById("age").value,
      gender: document.getElementById("gender").value,
    };

    try {
      const response = await fetch("/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      if (result.success) {
        displayOptimizationResults(result.result);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while optimizing. Please try again.");
    }
  });

  function displayOptimizationResults(result) {
    const nonZeroItems = result.food_items
      .map((food, index) => ({
        food,
        servings: result.servings[index],
        cost: result.total_cost[index],
      }))
      .filter((item) => item.servings > 0);

    dietPlan.innerHTML = `
      <h3 class="text-xl font-semibold text-gray-700 mb-4">Recommended Daily Intake</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food Item</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number of Servings</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost (₹)</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${nonZeroItems
              .map(
                (item) => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${
                  item.food
                }</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.servings.toFixed(
                  1
                )}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹${item.cost.toFixed(
                  2
                )}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="mt-4 flex justify-end">
        <button id="exportCSV" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
          Export as CSV
        </button>
      </div>
      <div class="mt-6">
        <h3 class="text-xl font-semibold text-gray-700 mb-4">Daily Nutrition</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          ${Object.entries(result.nutrient_totals)
            .map(
              ([nutrient, value]) => `
              <div class="bg-gray-100 p-4 rounded-md">
                <h4 class="font-semibold text-gray-700">${nutrient}</h4>
                <p class="text-xl font-bold text-green-600">${value}</p>
              </div>
            `
            )
            .join("")}
        </div>
      </div>
      <div class="mt-6">
        <h3 class="text-xl font-semibold text-gray-700">Total Daily Cost</h3>
        <p class="text-2xl font-bold text-green-600">₹${result.total_cost_sum.toFixed(
          2
        )}</p>
      </div>
    `;

    optimizationResults.classList.remove("hidden");

    document.getElementById("exportCSV").addEventListener("click", () => {
      exportToCSV(nonZeroItems, result.total_cost_sum, result.nutrient_totals);
    });
  }

  function exportToCSV(items, totalCost, nutrientTotals) {
    let csvContent = "Food Item,Number of Servings,Cost (₹)\n";
    items.forEach((item) => {
      csvContent += `"${item.food}",${item.servings.toFixed(
        1
      )},₹${item.cost.toFixed(2)}\n`;
    });

    csvContent += "\nTotal Daily Cost,₹" + totalCost.toFixed(2) + "\n\n";
    csvContent += "Daily Nutrition\n";

    for (const [nutrient, value] of Object.entries(nutrientTotals)) {
      csvContent += `${nutrient},${value}\n`;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "diet_plan.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Add event listener for Enter key in search input
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchButton.click();
    }
  });
});
