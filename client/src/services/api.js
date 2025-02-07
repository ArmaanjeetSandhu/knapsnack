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
      throw error.response?.data || error.message;
    }
  },

  addFood: async (foodData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/add_food`, foodData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  removeFood: async (fdcId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/remove_food`, {
        fdcId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  calculateNutrition: async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/calculate`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
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
      throw error.response?.data || error.message;
    }
  },
};

export default api;
