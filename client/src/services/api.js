import config from "../config";

const api = {
  async searchFood(query, apiKey) {
    const response = await fetch(`${config.apiUrl}/search_food`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, api_key: apiKey }),
    });

    if (!response.ok) {
      throw new Error("Search failed");
    }

    return response.json();
  },

  async calculateNutrition(data) {
    const response = await fetch(`${config.apiUrl}/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Calculation failed");
    }

    return response.json();
  },

  async optimizeDiet(data) {
    const response = await fetch(`${config.apiUrl}/optimize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Optimization failed");
    }

    return response.json();
  },
};

export default api;
