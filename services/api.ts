import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ QUAN TRỌNG: Thay đổi IP này thành IP máy tính của bạn!
// Cách lấy IP:
// - Windows: Mở CMD, gõ "ipconfig" -> tìm "IPv4 Address" (ví dụ: 192.168.1.24)
// - Mac/Linux: Mở Terminal, gõ "ifconfig" -> tìm "inet" (ví dụ: 192.168.1.24)
// - Hoặc xem IP trong Expo terminal khi chạy "expo start" (ví dụ: exp://192.168.1.24:8081)
// 
// Lưu ý: Backend phải đang chạy trên port 5000
const API_IP = '10.0.2.2'; // 👈 THAY ĐỔI IP NÀY THÀNH IP CỦA BẠN!

const BASE_URL = `http://${API_IP}:5000/api`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Log requests for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('📦 Request Data:', config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Log responses for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.config?.url}`, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Interceptor để thêm token vào request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// User API
export const userAPI = {
  login: (data: { phone_number: string; password: string }) =>
    api.post('/users/login', data),
  register: (data: {
    fullname: string;
    email: string;
    phone_number: string;
    address: string;
    password: string;
    role_name?: string;
  }) => api.post('/users/register', data),
  getAllUsers: () => api.get('/users/all'),
  getProfile: (id: number) => api.get(`/users/get/${id}`),
  updateProfile: (id: number, data: any) => api.put(`/users/update/${id}`, data),
  changePassword: (id: number, data: { currentPassword: string; newPassword: string }) =>
    api.put(`/users/change-password/${id}`, data),
  deleteAccount: (id: number) => api.delete(`/users/delete/${id}`),
  forgotPassword: (data: { email: string }) => api.post('/users/forgot-password', data),
  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/users/reset-password', data),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get('/category/all'),
  getById: (id: number) => api.get(`/category/get/${id}`),
  create: (data: any) => api.post('/category/create', data),
  update: (id: number, data: any) => api.put(`/category/update/${id}`, data),
  delete: (id: number) => api.delete(`/category/delete/${id}`),
};

// Menu Item API
export const menuItemAPI = {
  getAll: () => api.get('/menu-items/all'),
  getById: (id: number) => api.get(`/menu-items/${id}`),
  create: (data: any) => api.post('/menu-items/create', data),
  update: (id: number, data: any) => api.put(`/menu-items/update/${id}`, data),
  delete: (id: number) => api.delete(`/menu-items/delete/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: (userId: number) => api.get(`/cart/${userId}`),
  addToCart: (userId: number, data: any) => api.post(`/cart/${userId}/add`, data),
  updateCartItem: (userId: number, itemId: number, data: any) =>
    api.put(`/cart/${userId}/items/${itemId}`, data),
  removeFromCart: (userId: number, itemId: number) =>
    api.delete(`/cart/${userId}/items/${itemId}`),
  clearCart: (userId: number) => api.delete(`/cart/${userId}/clear`),
  getCartCount: (userId: number) => api.get(`/cart/${userId}/count`),
};

// Order API
export const orderAPI = {
  getOrderAll: () => api.get('/orders/all'),
  getOrders: (userId: number) => api.get(`/orders/user/${userId}`),
  getOrderById: (orderId: number) => api.get(`/orders/${orderId}`),
  createOrder: (data: any) => api.post('/orders/create', data),
  updateOrder: (orderId: number, data: any) => api.put(`/orders/update/${orderId}`, data),
  cancelOrder: (orderId: number) => api.put(`/orders/cancel/${orderId}`),
  getOrderDetails: (orderId: number) => api.get(`/order-detail/order/${orderId}`),
  createOrderDetails: (data: any) => api.post('/order-detail/create', data),
};

// Payment API
export const paymentAPI = {
  createPayment: (data: any) => api.post('/payment/create', data),
  getPaymentByOrderId: (orderId: number) => api.get(`/payment/order/${orderId}`),
  updatePayment: (id: number, data: any) => api.put(`/payment/update/${id}`, data),
  deletePayment: (id: number) => api.delete(`/payment/delete/${id}`),
  initiateVNPAY: (paymentData: any) => api.post('/payment/vnpay_initiate', paymentData),
};

// Review API
export const reviewAPI = {
  getByMenuItemId: (productId: number) => api.get(`/review/get/${productId}`),
};

// Voucher API
export const voucherAPI = {
  getAll: () => api.get('/voucher/all'),
  getById: (id: number) => api.get(`/voucher/get/${id}`),
  create: (data: any) => api.post('/voucher/create', data),
  update: (id: number, data: any) => api.put(`/voucher/update/${id}`, data),
  delete: (id: number) => api.delete(`/voucher/delete/${id}`),
  checkVoucher: (data: any) => api.post('/voucher/check', data),
};

export default api;

