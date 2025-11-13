import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  // Register with email and password
  async register(userData) {
    try {
      console.log('📝 Registering user:', userData.email);
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Registration successful');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  // Login with email and password
  async emailLogin(credentials) {
    try {
      console.log('🔑 Email login attempt:', credentials.email);
      const response = await api.post('/auth/email-login', credentials);
      
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Email login successful');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Email login error:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  // Login with wallet
  async walletLogin(walletData) {
    try {
      console.log('🔗 Wallet login attempt:', walletData.walletAddress);
      const response = await api.post('/auth/wallet-login', walletData);
      
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Wallet login successful');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Wallet login error:', error);
      throw new Error(error.response?.data?.error || 'Wallet login failed');
    }
  },

  // Get current user profile
  async getProfile() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get profile');
    }
  },

  // Logout user
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    console.log('👋 User logged out');
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if token is valid
  async validateToken() {
    try {
      const response = await api.get('/auth/me');
      return response.data.success;
    } catch (error) {
      return false;
    }
  }
};

export default authService;