// Frontend configuration
const CONFIG = {
  // Backend API URL
  API_BASE_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:5000'
    : 'https://your-deployed-backend-url.com',
  
  // Other config
  DEBUG: window.location.hostname === 'localhost'
};

// Make it globally available
window.CONFIG = CONFIG;
