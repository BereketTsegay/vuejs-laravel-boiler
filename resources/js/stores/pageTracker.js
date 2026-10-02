// src/stores/pageTracker.js
import { defineStore } from 'pinia';

export const usePageTrackerStore = defineStore('pageTracker', {
  state: () => ({
    // Keeps an object structure of { 'Page Name': hitCount }
    pageHits: JSON.parse(localStorage.getItem('frequent_pages')) || {}
  }),
  getters: {
    frequentlyVisited: (state) => {
      return Object.entries(state.pageHits)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Return top 5 elements
    }
  },
  actions: {
    trackVisit(routeName) {
      if (!routeName) return;
      this.pageHits[routeName] = (this.pageHits[routeName] || 0) + 1;
      localStorage.setItem('frequent_pages', JSON.stringify(this.pageHits));
    }
  }
});
