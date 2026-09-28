import axios from 'axios';
import router from '../router';
import { useAuthStore } from '../stores/auth';
import { getToken } from '../general';
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    withCredentials: true, // Required for secure HTTP-only cookies
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',

    }
});

// 2. Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Retrieve your token (from localStorage, sessionStorage, Vuex/Redux, etc.)
    const token = getToken();

    // If the token exists, inject it into the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request errors here
    return Promise.reject(error);
  }
);
// Response Interceptor: Handle systemic authentication errors globally
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const authStore = useAuthStore();

        if (error.response) {
            const status = error.response.status;

            // 401: Unauthorized/Session Expired
            // 419: Laravel CSRF Token Mismatch (Session Timeout)
            if (status === 401 || status === 419) {

                authStore.clearLocalAuth();

                // Route back to login screen if not already there
                if (router.currentRoute.value.name !== 'Login') {
                    router.push({
                        name: 'Login',
                        query: { redirect: router.currentRoute.value.fullPath }
                    });
                }
            }
        }

        return Promise.reject(error);
    }
);

// Response Interceptors: Catch 401s and rotate the token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();

    // Check if error is 401 and hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If we are already running a refresh token process, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return api(originalRequest);
        })
        .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        // Request a fresh token from Laravel
        axios.post('/api/auth/refresh', {}, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        .then(({ data }) => {
          // 1. This action saves and automatically re-decodes new Spatie claims!
          authStore.saveToken(data.token); 
          
          // 2. Clear the queue with the new token
          processQueue(null, data.token);
          
          // 3. Re-run original request
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          resolve(api(originalRequest));
        })
        .catch((err) => {
          processQueue(err, null);
          authStore.clearAuth(); // Token is completely dead, force logout
          reject(err);
        })
        .finally(() => {
          isRefreshing = false;
        });
      });
    }

    return Promise.reject(error);
  });

export default api;
