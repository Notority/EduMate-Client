import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data;
    let msg = 'Connection failed. Make sure the backend server is running.';
    if (data) {
      if (typeof data === 'string') msg = data;
      else if (data.message) msg = data.message;
      else if (data.error) msg = data.error;
    }
    err.message = msg;
    return Promise.reject(err);
  }
);

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (firstName: string, lastName: string, email: string, password: string) =>
    api.post('/auth/register', { firstName, lastName, email, password }),
};

export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (firstName: string, lastName: string, email: string, profilePicture: string) =>
    api.patch('/user/profile', { firstName, lastName, email, profilePicture }),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/user/change-password', { oldPassword, newPassword }),
  getActivities: () => api.get('/user/activities'),
  deleteAccount: () => api.delete('/user'),
};

export const teacherApi = {
  getProfile: () => api.get('/teachers/profile'),
  updateProfile: (data: any) => api.put('/teachers/profile', data),
  getVerification: () => api.get('/teachers/verification'),
  submitVerification: (documentUrl: string) => api.post('/teachers/verification/submit', { documentUrl }),
  getPublicProfile: (id: number) => api.get(`/teachers/public/${id}`)
};

export default api;
