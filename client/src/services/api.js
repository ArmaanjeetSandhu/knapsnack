import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = {
  searchFood: async (query) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/search_food`, {
        query,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to search food" };
    }
  },

  calculateNutrition: async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/calculate`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to calculate nutrition" };
    }
  },

  optimizeDiet: async (optimizationData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/optimize`,
        optimizationData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to optimize diet" };
    }
  },
};

export default api;
