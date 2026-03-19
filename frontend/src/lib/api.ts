import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('snapattend_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('snapattend_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (formData: FormData) => api.post('/auth/login', formData),
  getMe: () => api.get('/auth/me'),
  setupRoot: () => api.post('/auth/setup-root'),
};

export const studentApi = {
  register: (formData: FormData) => api.post('/students/register', formData),
  getAll: () => api.get('/students/'),
  delete: (id: number) => api.delete(`/students/${id}`),
};

export const attendanceApi = {
  getAll: () => api.get('/attendance/'),
  getStudent: (id: number) => api.get(`/attendance/${id}`),
  markManual: (roll: string) => api.post(`/attendance/manual?roll_number=${roll}`),
  export: () => `${API_BASE_URL}/attendance/export`,
};

export const analyticsApi = {
  getDaily: () => api.get('/analytics/daily'),
  getMonthly: () => api.get('/analytics/monthly'),
  getLowAttendance: () => api.get('/analytics/low-attendance'),
};

export const recognitionApi = {
  start: () => api.post('/recognition/start'),
  stop: () => api.post('/recognition/stop'),
  getStatus: () => api.get('/recognition/status'),
  startCamera: () => api.post('/recognition/camera/start'),
  stopCamera: () => api.post('/recognition/camera/stop'),
  getSnapshot: () => `${API_BASE_URL}/recognition/snapshot`,
};
