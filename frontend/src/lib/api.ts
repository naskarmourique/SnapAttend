import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout (Face processing can take a while)
});

// Removed the naive retry interceptor because it causes double-submissions on POST requests
// when the server takes longer than the timeout to respond.

export const studentApi = {
  register: (formData: FormData) => api.post('/students/register', formData),
  getAll: () => api.get('/students/'),
  delete: (id: number) => api.delete(`/students/${id}`),
};

export const attendanceApi = {
  getAll: () => api.get('/attendance/'),
  getStudent: (id: number) => api.get(`/attendance/${id}`),
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
  getSnapshot: () => `${API_BASE_URL}/recognition/snapshot?t=${Date.now()}`,
};

