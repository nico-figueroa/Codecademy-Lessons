import { API_ENDPOINT } from ".";
import axios from "axios";

// --- CATEGORY CRUD ---

export const getCategories = async () => {
  const response = await axios.get(`${API_ENDPOINT}/categories`);
  return response.data;
};

export const createCategory = async (name) => {
  const response = await axios.post(`${API_ENDPOINT}/categories`, { name });
  return response.data;
};

export const updateCategory = async (id, name) => {
  const response = await axios.put(`${API_ENDPOINT}/categories/${id}`, { name });
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await axios.delete(`${API_ENDPOINT}/categories/${id}`);
  return response.data;
};

// --- ASSIGNMENT ROUTES ---

export const assignRestaurantToCategory = async (categoryId, restaurantId) => {
  const response = await axios.post(
    `${API_ENDPOINT}/categories/${categoryId}/assign`,
    { restaurantId }
  );
  return response.data;
};

export const removeRestaurantFromCategory = async (categoryId, restaurantId) => {
  const response = await axios.post(
    `${API_ENDPOINT}/categories/${categoryId}/remove`,
    { restaurantId }
  );
  return response.data;
};
