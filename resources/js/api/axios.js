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
                console.log(error.response.data);
                // authStore.clearLocalAuth();

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

export default api;
