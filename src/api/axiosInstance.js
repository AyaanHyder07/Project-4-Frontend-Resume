import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor - add auth token and log requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Log request details
    console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log(`  - Token Present: ${!!token}`);
    console.log(`  - Headers:`, config.headers);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`  - Authorization: Bearer ${token.substring(0, 20)}...`);
    }
    
    return config;
  },
  (error) => {
    console.error('[API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - log responses and handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[API RESPONSE] ${response.status} ${response.statusText} - ${response.config.url}`);
    console.log(`  - Data:`, response.data);
    return response;
  },
  (error) => {
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();
    const status = error.response?.status;
    const statusText = error.response?.statusText;
    const responseData = error.response?.data;
    
    console.error(`[API ERROR] ${method} ${url}`);
    console.error(`  - Status: ${status} ${statusText}`);
    
    // Show detailed error information
    if (responseData) {
      console.error(`  - Error Details:`, responseData);
      
      // For validation errors, show field-specific messages
      if (responseData.errors && typeof responseData.errors === 'object') {
        console.error(`  - Validation Errors:`);
        Object.entries(responseData.errors).forEach(([field, message]) => {
          console.error(`    • ${field}: ${message}`);
        });
      }
      
      // For generic error message
      if (responseData.message) {
        console.error(`  - Message: ${responseData.message}`);
      }
      
      // For error details string
      if (responseData.error) {
        console.error(`  - Error: ${responseData.error}`);
      }
    }
    
    console.error(`  - Request Message:`, error.message);
    
    // Handle 401 Unauthorized
    if (status === 401) {
      console.error('[AUTH ERROR] 401 Unauthorized');
      console.error('  - Likely cause: No valid authentication token');
      console.error('  - Solution: Please log in');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle 400 Bad Request
    if (status === 400) {
      console.error('[VALIDATION ERROR] 400 Bad Request');
      if (!responseData?.errors && !responseData?.message) {
        console.error('  - Possible causes:');
        console.error('    1. Missing required fields (title, personalInfo.fullName, personalInfo.email)');
        console.error('    2. Invalid request body format');
        console.error('    3. Invalid data types');
        console.error('  - Check your request body structure');
      }
    }
    
    // Handle 403 Forbidden
    if (status === 403) {
      console.error('[PERMISSION ERROR] 403 Forbidden');
      console.error('  - You do not have permission to perform this action');
    }
    
    // Handle 404 Not Found
    if (status === 404) {
      console.error('[NOT FOUND] 404 Resource Not Found');
    }
    
    // Handle 500 Server Error
    if (status === 500) {
      console.error('[SERVER ERROR] 500 Internal Server Error');
      console.error('  - Backend encountered an unexpected error');
      console.error('  - Check backend logs for details');
    }
    
    return Promise.reject(error);
  }
);

// Health check function (uses fetch to bypass axios interceptors)
export const checkBackendHealth = async () => {
  try {
    console.log('[HEALTH CHECK] Checking backend health...');
    // Use fetch instead of axios to avoid Authorization header issues
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      timeout: 5000,
      // NOT sending Authorization header - health endpoint is public
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('[HEALTH CHECK] ✅ Backend is UP', data);
      return true;
    } else {
      console.error(`[HEALTH CHECK] ❌ Backend is DOWN - Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('[HEALTH CHECK] ❌ Backend is DOWN', error.message);
    return false;
  }
};

export default axiosInstance;
