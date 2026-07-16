import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backendvelazco-production.up.railway.app/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para inyectar el token en peticiones protegidas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('client_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const publicApi = {
  getProducts: async () => {
    const response = await api.get('/public/products');
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get('/public/categories');
    return response.data;
  },
  createOrder: async (orderData: any) => {
    const response = await api.post('/public/orders', orderData);
    return response.data;
  },
  createPaymentPreference: async (orderId: number) => {
    const response = await api.post(`/public/payments/${orderId}/create-preference`);
    return response.data;
  },
  validatePayment: async (orderId: number, paymentId: string) => {
    const response = await api.post(`/public/payments/${orderId}/validate-payment/${paymentId}`);
    return response.data;
  }
};

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data; // { message: string, token: string }
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  clientLogin: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data; // { message: string, token: string, user: { id, nombreCompleto, email, telefono } }
  },
  clientRegister: async (userData: { nombreCompleto: string; email: string; telefono: string; password: string }) => {
    const response = await api.post('/auth/client/register', userData);
    return response.data; // { message: string, token: string, user: { id, nombreCompleto, email, telefono } }
  }
};

export const adminApi = {
  // --- INVENTARIO (Productos) ---
  getProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  createUser: async (userData: any) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  updateUser: async (id: number, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  getAvailableProducts: async () => {
    const response = await api.get('/products/available');
    return response.data;
  },
  createProduct: async (formData: FormData) => {
    // multipart/form-data
    const response = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  updateProduct: async (id: number, formData: FormData) => {
    const response = await api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  deleteProduct: async (id: number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  getLowStockProducts: async () => {
    const response = await api.get('/products/low-stock');
    return response.data;
  },

  // --- PEDIDOS Y CAJA ---
  startOrder: async (orderData: { clientName: string, details: { productId: number, quantity: number }[] }) => {
    const response = await api.post('/orders/start', orderData);
    return response.data;
  },
  confirmSale: async (orderId: number, paymentMethod: string) => {
    const response = await api.post(`/orders/${orderId}/confirm-sale`, { paymentMethod });
    return response.data;
  },
  confirmDispatch: async (orderId: number) => {
    const response = await api.post(`/orders/${orderId}/confirm-dispatch`);
    return response.data;
  },
  getOrdersByStatus: async (status: string, page = 0, size = 50) => {
    const response = await api.get(`/orders/status/${status}?page=${page}&size=${size}`);
    return response.data;
  },
  cancelOrder: async (orderId: number) => {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response.data;
  },
  getDeliveredOrders: async (page = 0, size = 50) => {
    const response = await api.get(`/orders/delivered?page=${page}&size=${size}`);
    return response.data;
  },

  // --- PRODUCCIÓN ---
  getPendingProductions: async () => {
    const response = await api.get('/productions/pending');
    return response.data;
  },
  getInProcessProductions: async () => {
    const response = await api.get('/productions/in-process');
    return response.data;
  },
  createProduction: async (data: any) => {
    const response = await api.post('/productions', data);
    return response.data;
  },
  updateProductionStatus: async (id: number, status: string) => {
    const response = await api.patch(`/productions/${id}/status`, { nuevoEstado: status });
    return response.data;
  },
  finalizeProduction: async (id: number, data: any) => {
    const response = await api.patch(`/productions/${id}/finalize`, data);
    return response.data;
  },

  // --- ANALÍTICAS DEL DASHBOARD ---
  getDailySales: async () => {
    const response = await api.get('/orders/daily-sales/details');
    return response.data;
  },
  getWeeklySales: async () => {
    const response = await api.get('/orders/weekly-sales/details');
    return response.data;
  },
  getTopProducts: async () => {
    const response = await api.get('/orders/top-products/month');
    return response.data;
  },
  getPaymentMethods: async () => {
    const response = await api.get('/orders/payment-methods/summary');
    return response.data;
  },
  
  // --- ASISTENTE DE IA ---
  askAi: async (prompt: string) => {
    const response = await api.post('/v1/ai/generate', { prompt });
    return response.data;
  }
};
