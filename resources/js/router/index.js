import { createRouter, createWebHistory } from 'vue-router';
import DashboardLayout from '../layouts/DashboardLayout.vue';

const routes = [
    // Wrap protected routes inside the structural Dashboard Layout frame wrapper
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue'),
      meta: { guestOnly: true }
    },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue')
      },
      {
        path: 'admin',
        name: 'AdminDashboard',
        component: () => import('../views/admin/index.vue'),
        meta: { requiresRole: 'admin' }
      }
    ]
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('../views/errors/403.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});



export default router;
