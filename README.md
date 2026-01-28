# Knap[Snack] : The Meal Planner

![Header Image](https://raw.githubusercontent.com/ArmaanjeetSandhu/goal-ith/refs/heads/main/client/public/header-image.png)

Knap[Snack] is a Python-based tool that uses mixed-integer linear programming to help you create personalized, cost-effective meal plans while meeting specific nutritional requirements. It takes into account macronutrients (proteins, carbohydrates, fats), micronutrients (vitamins, minerals), and water to ensure a balanced diet tailored to your age, gender, and health goals.

## 🛠️ System Architecture

```mermaid
graph TD
    985["User<br>External Actor"]
    subgraph 981["External Systems"]
        995["USDA FoodData Central API<br>External Service"]
    end
    subgraph 982["Knap[Snack] System"]
        subgraph 983["Backend API"]
            990["API Server<br>Flask/Python"]
            991["Calculation Service<br>Python"]
            992["Optimization Service<br>Python/PuLP"]
            993["Food Data Service<br>Python/Requests"]
            994["Nutrient Database<br>CSV/Pandas"]
            %% Edges at this level (grouped by source)
            990["API Server<br>Flask/Python"] -->|Handles /optimize requests using| 992["Optimization Service<br>Python/PuLP"]
            990["API Server<br>Flask/Python"] -->|Handles /search requests using| 993["Food Data Service<br>Python/Requests"]
            991["Calculation Service<br>Python"] -->|Reads data from| 994["Nutrient Database<br>CSV/Pandas"]
            992["Optimization Service<br>Python/PuLP"] -->|Reads data from| 994["Nutrient Database<br>CSV/Pandas"]
        end
        subgraph 984["Frontend Application"]
            986["Client Application<br>React/Vite"]
            987["API Service Client<br>JavaScript"]
            988["Client Configuration<br>JavaScript/JSON"]
            989["UI Components<br>React/Tailwind"]
            %% Edges at this level (grouped by source)
            986["Client Application<br>React/Vite"] -->|Makes API calls via| 987["API Service Client<br>JavaScript"]
        end
    end
    %% Edges at this level (grouped by source)
    985["User<br>External Actor"] -->|Uses| 986["Client Application<br>React/Vite"]
    993["Food Data Service<br>Python/Requests"] -->|Fetches food data from| 995["USDA FoodData Central API<br>External Service"]
```

Visualize the repo structure [here](https://mango-dune-07a8b7110.1.azurestaticapps.net/?repo=ArmaanjeetSandhu%2Fknapsnack).
