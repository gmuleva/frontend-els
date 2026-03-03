import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  logout: () => api.post('/api/auth/logout')
};

export const productsAPI = {
  getAll: (params) => api.get('/api/products', { params }),
  getById: (productId) => api.get(`/api/products/${productId}`),
  create: (productData) => api.post('/api/products', productData)
};

export const cartAPI = {
  get: () => api.get('/api/cart'),
  addItem: (item) => api.post('/api/cart/items', item),
  removeItem: (productId) => api.delete(`/api/cart/items/${productId}`)
};

export const ordersAPI = {
  create: (orderData) => api.post('/api/orders', orderData),
  getAll: () => api.get('/api/orders'),
  getById: (orderId) => api.get(`/api/orders/${orderId}`)
};

export default api;
