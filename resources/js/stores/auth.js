import { defineStore } from 'pinia';
import api from '../api/axios';
import { setAuthorization } from '../general';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
        token: localStorage.getItem('token') || null,
        loading: false,
        initialized: false,
        apiErrors: null // Holds structured backend validation message arrays
    }),

    getters: {
        isAuthenticated: (state) => !!state.user,
        isAdmin: (state) => state.user?.role === 'admin' || state.user?.role?.slug === 'admin',
        roleName: (state) => state.user?.role && typeof state.user.role === 'object' ? state.user.role.name || 'Member' : state.user?.role || 'Member',

        // Quick lookup helper for extracting inline field validation messages
        getFieldError: (state) => {
            return (fieldName) => state.apiErrors?.[fieldName]?.[0] || null;
        }
    },

    actions: {
        /**
         * Initialize active session cache on cold application boots or hard page reloads.
         */
        async initializeAuth() {
            if (this.initialized) return;

            try {

                this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            } catch (error) {
                this.user = null;
            } finally {
                this.initialized = true;
            }
        },

        /**
         * Process user authentications securely.
         */
        async login(credentials) {
            this.loading = true;
            this.apiErrors = null;

            try {
                // Initialize the Laravel Sanctum CSRF cookie handshake (fires to web route endpoint)
                // await api.get('/sanctum/csrf-cookie', { baseURL: '/' });

                // Fire authentication post request
                 await api.post('api/login', credentials, { baseURL: '/' }).then((response) => {
                    // Store the access token in localStorage for subsequent API requests
                     this.user = response.data.user;
                     localStorage.setItem('user', JSON.stringify(response.data.user));
                     localStorage.setItem('token', response.data.access_token);
                     setAuthorization(response.data.access_token);
                    return response;
                });


                // // Fetch the newly authenticated user profile data
                // const response = await api.get('api/user', { baseURL: '/' });
                // this.user = response.data;


                return true;
            } catch (error) {
                this.handleApiError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Handle user account registration.
         */
        async register(userData) {
            this.loading = true;
            this.apiErrors = null;

            try {
                // await api.get('/sanctum/csrf-cookie', { baseURL: '/' });
                await api.post('api/register', userData, { baseURL: '/' }).then((response) => {
                    this.user = response.data.user;
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    localStorage.setItem('token', response.data.access_token);
                    setAuthorization(response.data.access_token);
                    return response;
                });
                return true;
            } catch (error) {
                // this.handleApiError(error);
                console.error('Registration failed:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Safely terminate user cookie session and clear active state profiles.
         */
        async logout() {
            this.loading = true;
            try {
                await api.post('api/logout', {}, { baseURL: '/' });
            } catch (error) {
                console.error('Logout failed to synchronize with backend server:', error);
            } finally {
                this.clearLocalAuth();
                this.loading = false;
            }
        },

        /**
         * Clear active browser memory runtime states.
         */
        clearLocalAuth() {
            this.user = null;
            this.apiErrors = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },

        /**
         * Parse and internalize incoming Axios error responses.
         */
        handleApiError(error) {
            if (error.response && error.response.status === 422) {
                // Laravel validation array structure extraction
                this.apiErrors = error.response.data.errors;
            } else {
                // Fallback fallback generic exception wrap
                this.apiErrors = {
                    global: [error.response?.data?.message || 'A network communication timeout occurred. Please try again.']
                };
            }
        }
    }
});
