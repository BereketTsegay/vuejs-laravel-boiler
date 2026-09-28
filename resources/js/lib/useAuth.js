// src/composables/useAuth.js
import { useAuthStore } from '../stores/auth';
import { jwtDecode } from 'jwt-decode';

export function useAuth() {
  const authStore = useAuthStore();

  // Check for a specific permission
  const can = (permission) => {
    return authStore.permissions.includes(permission);
  };

  // Check for a specific role
  const is = (role) => {
    return authStore.roles.includes(role);
  };

  // Check if user has ANY of the provided permissions
  const canAny = (permissionsArray) => {
    return permissionsArray.some(p => authStore.permissions.includes(p));
  };

  return { can, is, canAny };
}
