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
      const errorData = await response.json();
      throw new Error(errorData.error || "Search failed");
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
      const errorData = await response.json();
      throw new Error(errorData.error || "Calculation failed");
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

    const result = await response.json();

    if (!response.ok || !result.success) {
      if (result.feasibilityAnalysis)
        return {
          success: false,
          message: result.message || "Optimization failed",
          feasibilityAnalysis: result.feasibilityAnalysis,
        };

      throw new Error(result.error || result.message || "Optimization failed");
    }

    return result;
  },

  async getBlogPosts() {
    const response = await fetch(`${config.apiUrl}/posts`);
    if (!response.ok) throw new Error("Failed to fetch blog posts");
    return response.json();
  },

  async getBlogPost(slug) {
    const response = await fetch(`${config.apiUrl}/posts/${slug}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch post: ${slug}`);
    }
    return response.json();
  },
};

export default api;
