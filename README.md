# Knap<span style="color:#1463eb">[Snack]</span>: The Cost-Optimised Meal Planner

![Header Image](https://raw.githubusercontent.com/ArmaanjeetSandhu/goal-ith/refs/heads/main/client/public/header-image.png)

Knap<span style="color:#1463eb">[Snack]</span> is a tool that helps you create personalised, cost-effective meal plans. It takes into account macronutrients (proteins, carbohydrates, fats), micronutrients (vitamins, minerals), and hydration to ensure a balanced diet tailored to your age, gender, and health goals.

## How It Works

Under the hood, Knap<span style="color:#1463eb">[Snack]</span> uses an optimisation algorithm called mixed-integer linear programming (MILP). Here's the math:

### Objective

The objective is to minimise the total cost of the diet:

$$
\text{Minimise } \sum_{i=1}^{n} c_i x_i
$$

where:

- $n$ is the number of available food items
- $c_i$ is the cost per serving of food item $i$
- $x_i$ is the number of servings of food item $i$

### Constraints

The optimisation is subject to the following constraints:

#### Micronutrients

For each nutrient $j$, the total amount in the diet must meet or exceed the minimum requirement:

$$
\sum_{i=1}^{n} a_{ij} x_i \geq b_j \quad \forall j \in \{1,2,...,m\}
$$

For nutrients with established upper limits, the total amount must not exceed the maximum allowable intake:

$$
\sum_{i=1}^{n} a_{ij} x_i \leq u_j \quad \forall j \in \{1,2,...,p\}
$$

where:

- $m$ is the number of nutrients
- $p$ is the number of micronutrients with upper limits
- $a_{ij}$ is the amount of nutrient $j$ in one serving of food item $i$
- $b_j$ is the minimum required amount of nutrient $j$ (RDA value)
- $u_j$ is the maximum allowable amount of nutrient $j$ (UL value)

#### Macronutrients

Once Knap<span style="color:#1463eb">[Snack]</span> calculates your daily caloric target, you specify how you want to split that into protein, carbs, and fats. These values then form the lower limits for those nutrients:

$$
\sum_{i=1}^{n} a_{i,p} x_i \geq \frac{C \times r_p}{w_p}
$$

$$
\sum_{i=1}^{n} a_{i,c} x_i \geq \frac{C \times r_c}{w_c}
$$

$$
\sum_{i=1}^{n} a_{i,f} x_i \geq \frac{C \times r_f}{w_f}
$$

where:

- $C$ is your daily caloric goal
- $r_p, r_c$ and $r_f$ are the proportion of calories from protein, carbs, and fats respectively
- $a_{i,p}, a_{i,c}$ and $a_{i,f}$ are grams of protein, carbs, and fats in food item $i$
- $w_p, w_c$ and $w_f$ are the Atwater energy factors for protein (4 kcal/g), carbs (4 kcal/g), and fats (9 kcal/g)

Additionally, in accordance with evidence-based recommendations, fibre has been given a lower limit of 14 grams per 1000 calories:

$$
\sum_{i=1}^{n} a_{i,fb} x_i \geq \frac{14 \times C}{1000}
$$

And saturated fats have been capped at 10% of your daily caloric goal:

$$
\sum_{i=1}^{n} a_{i,sf} x_i \leq \frac{0.10 \times C}{w_f}
$$

Unlike micronutrients, macronutrients don't have well-defined toxicity thresholds, so they typically don't require strict upper limits. However, without any upper bounds, the optimiser might converge on solutions where macronutrient values are significantly higher than their intended targets, disrupting your desired macronutrient ratios and resulting in excessive overall intake. At the same time, enforcing zero deviation from each macronutrient target may make it impossible for the optimiser to find a feasible solution. To balance these competing needs, Knap<span style="color:#1463eb">[Snack]</span> allows controlled deviations above your macronutrient targets:

$$
\sum_{i=1}^{n} a_{i,p} x_i \leq \frac{C \times r_p}{w_p} \times (1 + \delta_p)
$$

$$
\sum_{i=1}^{n} a_{i,c} x_i \leq \frac{C \times r_c}{w_c} \times (1 + \delta_c)
$$

$$
\sum_{i=1}^{n} a_{i,f} x_i \leq \frac{C \times r_f}{w_f} \times (1 + \delta_f)
$$

where $\delta_p, \delta_c,$ and $\delta_f$ represent allowable deviation percentages (ranging from 0% to 10%) for protein, carbohydrates, and fats respectively.

This creates a dual-objective optimisation problem:

- minimising the total cost of the diet, and
- minimising deviations from your target macronutrient values.

Knap<span style="color:#1463eb">[Snack]</span> solves this using a systematic grid search approach that explores combinations of allowable deviations, prioritising solutions that stay closest to your nutritional targets while still finding feasible, cost-effective meal plans.

#### Servings

Each food has a maximum practical serving size $s_i$ (as set by you), and a binary variable $y_i \in \{0, 1\}$ that determines whether the food is included at all. If $y_i = 0$, then $x_i = 0$. If $y_i = 1$, the food must be served in at least 1 unit, but no more than $s_i$:

$$
x_i \leq s_i \cdot y_i \quad \text{and} \quad x_i \geq y_i \quad \forall i \in \{1,2,\dots,n\}
$$

Foods marked as 'Discrete Servings' will not be recommended in fractional amounts, e.g., 1.5 eggs → $x_i \in \mathbb{Z}^+$

Foods marked as 'Must Include' will be guaranteed to appear in your meal plan → $y_i = 1$

---

Visualise the repo structure [here](https://mango-dune-07a8b7110.1.azurestaticapps.net/?repo=ArmaanjeetSandhu%2Fknapsnack).
