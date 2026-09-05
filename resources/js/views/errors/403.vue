<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
    <div class="text-center max-w-md">
      <div class="text-emerald-600 font-bold text-6xl mb-4">403</div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p class="text-gray-600 mb-6">
        You do not have the required administrative permissions to view this secure directory panel.
      </p>

      <router-link to="/dashboard"
        class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
        Return to Safety
      </router-link>
    </div>
  </div>
</template>
