# Goal - $i^{th}$ : The Meal Planner

![Header Image](https://raw.githubusercontent.com/ArmaanjeetSandhu/goal-ith/refs/heads/main/client/public/header-image.png)

Goal - $i^{th}$ is a Python-based tool that uses linear programming to create personalized, cost-effective meal plans while meeting specific nutritional requirements. It takes into account both macronutrients (proteins, carbohydrates, fats) and micronutrients (vitamins, minerals) to ensure a balanced diet tailored to your age, gender, and health goals.

## 🛠️ System Architecture

```mermaid
graph TD
    985["User<br>External Actor"]
    subgraph 981["External Systems"]
        995["USDA FoodData Central API<br>External Service"]
    end
    subgraph 982["Goal-Ith System"]
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

## 📂 Project Structure

- 📄 `.gitattributes`
- 📄 `.gitignore`
- 📄 `.python-version`
- 📄 `Dockerfile`
- 📄 `setup.cfg`
- 📄 `README.md`
- 📄 `requirements.txt`
- 📄 `heroku.yml`
- 📁 **client**
  - 📄 `index.html`
  - 📄 `eslint.config.js`
  - 📄 `postcss.config.js`
  - 📄 `tailwind.config.js`
  - 📄 `vite.config.js`
  - 📄 `package-lock.json`
  - 📄 `package.json`
  - 📄 `README.md`
  - 📁 **public**
    - 📄 `sample.csv`
    - 📄 `background-video.mp4`
    - 📄 `header-image.png`
  - 📁 **src**
    - 📄 `App.css`
    - 📄 `index.css`
    - 📄 `config.js`
    - 📄 `App.jsx`
    - 📄 `main.jsx`
    - 📁 **assets**
      - 📄 `react.svg`
    - 📁 **components**
      - 📄 `ActivitySlider.jsx`
      - 📄 `CalculationResults.jsx`
      - 📄 `CalorieTargetSlider.jsx`
      - 📄 `ExportHandler.jsx`
      - 📄 `Feasibility Analysis.jsx`
      - 📄 `FoodSearch.jsx`
      - 📄 `GitHubIcon.jsx`
      - 📄 `LandingPage.jsx`
      - 📄 `MacroRatioValidator.jsx`
      - 📄 `NutrientDisplay.jsx`
      - 📄 `NutrientInfoPopup.jsx`
      - 📄 `OptimizationResults.jsx`
      - 📄 `PersonalInfoForm.jsx`
      - 📄 `SelectedFoods.jsx`
      - 📄 `ThemeToggle.jsx`
      - 📁 **ui**
        - 📄 `badge-variants.js`
        - 📄 `alert.jsx`
        - 📄 `badge.jsx`
        - 📄 `button.jsx`
        - 📄 `card.jsx`
        - 📄 `dialog.jsx`
        - 📄 `input.jsx`
        - 📄 `label.jsx`
        - 📄 `navigation-menu.jsx`
        - 📄 `scroll-area.jsx`
        - 📄 `select.jsx`
        - 📄 `table.jsx`
        - 📄 `tabs.jsx`
        - 📄 `tooltip.jsx`
    - 📁 **services**
      - 📄 `api.js`
- 📁 **server**
  - 📄 `__init__.py`
  - 📄 `app.py`
  - 📄 `utils.py`
  - 📁 **nutrient-databases**
    - 📄 `AMDRs.csv`
    - 📄 `elements-RDAs.csv`
    - 📄 `elements-ULs.csv`
    - 📄 `macros-RDAs.csv`
    - 📄 `vitamins-RDAs.csv`
    - 📄 `vitamins-ULs.csv`
- 📁 **tests**
  - 📄 `conftest.py`
  - 📄 `setup_tests.py`
  - 📄 `test_api.py`
  - 📄 `test_grid_search.py`
  - 📄 `test_integration.py`
  - 📄 `test_utils.py`

Visualize the repo structure here: https://mango-dune-07a8b7110.1.azurestaticapps.net/?repo=ArmaanjeetSandhu%2Fgoal-ith
