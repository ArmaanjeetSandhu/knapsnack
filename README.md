# Knap[Snack] : The Meal Planner

![Header Image](https://raw.githubusercontent.com/ArmaanjeetSandhu/goal-ith/refs/heads/main/client/public/header-image.png)

Knap[Snack] is a Python-based tool that uses mixed-integer linear programming to help you create personalised, cost-effective meal plans while meeting specific nutritional requirements. It takes into account macronutrients (proteins, carbohydrates, fats), micronutrients (vitamins, minerals), and water to ensure a balanced diet tailored to your age, gender, and health goals.

Visualise the repo structure [here](https://mango-dune-07a8b7110.1.azurestaticapps.net/?repo=ArmaanjeetSandhu%2Fknapsnack).

<details>
<summary><strong>Running Locally</strong></summary>

### Prerequisites

- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- [pnpm](https://pnpm.io/installation)

### Setup

1. **Install server dependencies**

   ```bash
   uv python install
   uv sync --frozen
   ```

2. **Install client dependencies**

   ```bash
   cd client
   pnpm install --frozen-lockfile
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root and add any required environment variables.

### Running

Open two terminal windows:

**Terminal 1:**

```bash
make dev
```

**Terminal 2:**

```bash
cd client
pnpm dev
```

</details>
