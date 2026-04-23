import axios from 'axios';

// Replace with Render backend URL once deployed, or use localhost for testing
// Note: For Android Emulator, use http://10.0.2.2:3000
const API_URL = 'https://safe-route-navigation.onrender.com/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Mock Token Interceptor
api.interceptors.request.use((config) => {
  // Add JWT token from secure storage in real app
  const token = 'mock_jwt_token';
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
