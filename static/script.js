document.addEventListener("DOMContentLoaded", () => {
  const personalInfoForm = document.getElementById("personal-info-form");
  const resultsSection = document.getElementById("results");
  const foodSelectionSection = document.getElementById("food-selection");
  const foodOptions = document.getElementById("food-options");
  const optimizeButton = document.getElementById("optimize-button");
  const optimizationResults = document.getElementById("optimization-results");
  const dietPlan = document.getElementById("diet-plan");
  const ageInput = document.getElementById("age");

  let nutrientGoals = {};

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
      loadFoodOptions();
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while calculating. Please try again.");
    }
  });

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
    foodSelectionSection.classList.remove("hidden");
  }

  async function loadFoodOptions() {
    try {
      const response = await fetch("/food_options");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const foods = await response.json();
      displayFoodOptions(foods);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while loading food options. Please try again.");
    }
  }

  function displayFoodOptions(foods) {
    foodOptions.innerHTML = "";
    foods.forEach((food) => {
      const checkbox = document.createElement("div");
      checkbox.className = "flex items-center";
      checkbox.innerHTML = `
                <input type="checkbox" id="${food}" name="food" value="${food}" class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded">
                <label for="${food}" class="ml-2 block text-sm text-gray-900">${food}</label>
            `;
      foodOptions.appendChild(checkbox);
    });
  }

  optimizeButton.addEventListener("click", async () => {
    const selectedFoods = Array.from(
      document.querySelectorAll('input[name="food"]:checked')
    ).map((el) => el.value);
    if (selectedFoods.length === 0) {
      alert("Please select at least one food item.");
      return;
    }

    const data = {
      selected_foods: selectedFoods,
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
    dietPlan.innerHTML = `
            <h3 class="text-xl font-semibold text-gray-700 mb-4">Recommended Daily Intake</h3>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food Item</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servings</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${result.food_items
                          .map(
                            (food, index) => `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${food}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
                                  result.servings[index]
                                }</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
                                  result.quantity[index]
                                }</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${result.total_cost[
                                  index
                                ].toFixed(2)}</td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
            <div class="mt-6">
                <h3 class="text-xl font-semibold text-gray-700 mb-4 relative group">
                    Daily Nutrition
                    <span class="tooltip invisible group-hover:visible absolute left-0 top-full mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg">
                        On following the above 'Recommended Daily Intake'
                    </span>
                </h3>
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
                <p class="text-2xl font-bold text-green-600">$${result.total_cost_sum.toFixed(
                  2
                )}</p>
            </div>
            <div class="mt-6">
                <button id="exportCSV" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                    Export as CSV
                </button>
            </div>
        `;

    optimizationResults.classList.remove("hidden");

    document.getElementById("exportCSV").addEventListener("click", () => {
      exportToCSV(result);
    });
  }

  function exportToCSV(result) {
    let csvContent = "Food Item,Servings,Quantity,Cost\n";
    result.food_items.forEach((food, index) => {
      csvContent += `${food},${result.servings[index]},${
        result.quantity[index]
      },${result.total_cost[index].toFixed(2)}\n`;
    });

    csvContent += "\nDaily Nutrition\n";
    for (const [nutrient, value] of Object.entries(result.nutrient_totals)) {
      csvContent += `${nutrient},${value}\n`;
    }

    csvContent += `\nTotal Daily Cost,$${result.total_cost_sum.toFixed(2)}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "recommended_daily_intake.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
});
