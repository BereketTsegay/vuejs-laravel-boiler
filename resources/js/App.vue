<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
    <!-- Global application notifications or loading bars can go here -->

    <main>
      <!-- Dynamic page injection point managed by Vue Router -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
