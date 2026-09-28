import { useAuthStore } from './stores/auth';
import axios from 'axios';


export default function initialize(router) {
    const authStore = useAuthStore();

    router.beforeEach(async (to, from) => {


        // Lazy execution setup: synchronize active profile session cache before parsing route guards
        if (!authStore.initialized) {
            await authStore.initializeAuth();
        }

        // Guard Clause 1: Route requires user authentication session
        if (to.meta.requiresAuth && !authStore.isAuthenticated) {
            return '/login';
        }

        // Guard Clause 2: Area restricts access to active Admin profiles
        if (to.meta.requiresAdmin && !authStore.isAdmin) {
            return '/403';
        }

        // Guard Clause 3: Redirect authenticated users away from landing/login pages
        if (to.meta.guestOnly && authStore.isAuthenticated) {

            return '/dashboard';
        }// Guard by Role
        if (to.meta.requiresRole && !authStore.roles.includes(to.meta.requiresRole)) {
            return next({ path: '/403' });
        }

        // Guard by Permission
        if (to.meta.requiresPermission && !authStore.permissions.includes(to.meta.requiresPermission)) {
            return next({ path: '/403' });
        }

  return;
});


    if (authStore.isAuthenticated && authStore.user?.token) {
        setAuthorization(authStore.user.token);
    }
}

export function setAuthorization(token) {
    console.log('Setting Authorization header with token:', token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
}

export function getToken() {
    return localStorage.getItem('token') || null;
}
export function capitalizeFirstLetter(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return str; // Handle empty or non-string inputs
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
