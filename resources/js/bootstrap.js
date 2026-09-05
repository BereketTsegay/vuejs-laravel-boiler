import axios from 'axios';
window.axios = axios;

// This sets up header configurations so Laravel detects AJAX requests automatically
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
