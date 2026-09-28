import { defineStore } from 'pinia';
import api from '../api/axios';
import { setAuthorization } from '../general';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
        token: localStorage.getItem('token') || null,
         roles: localStorage.getItem('roles') ? JSON.parse(localStorage.getItem('roles')) : [],
        permissions: localStorage.getItem('permissions') ? JSON.parse(localStorage.getItem('permissions')) : [],
        loading: false,
        initialized: false,
        apiErrors: null // Holds structured backend validation message arrays
    }),

    getters: {
        isAuthenticated: (state) => !!state.user,
        isAdmin: (state) => state.roles.includes('admin'),
        roleName: (state) => state.roles[0] || 'Member',

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
        saveToken(data) {
            this.token = data.access_token;
            localStorage.setItem('token', data.access_token);
            
            // Decode the JWT custom claims
            try {
                // const decoded = jwtDecode(data.access_token);
                this.user = data.user; // Or however you structured your user object
                this.roles = data.user.roles.map((role) => role.name) || [];
                this.permissions = data.user.roles[0]?.permissions.map((p) => p.name) || [];

                localStorage.setItem('user', JSON.stringify(this.user));
                localStorage.setItem('roles', JSON.stringify(this.roles));
                localStorage.setItem('permissions', JSON.stringify(this.permissions));

              
            } catch (error) {
                this.clearLocalAuth();
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
                     this.saveToken(response.data);
                    //  setAuthorization(response.data.access_token);
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
                  
                    this.saveToken(response.data);
                    // setAuthorization(response.data.access_token);
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
            this.roles = [];
            this.permissions = [];
            this.token = null;
            
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('roles');
            localStorage.removeItem('permissions');
          
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
