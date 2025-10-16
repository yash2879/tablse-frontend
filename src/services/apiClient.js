// src/services/apiClient.js

// 1. Get the base URL from the environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Logger utility
const logger = {
    request: (method, path, body) => {
        console.log(`🚀 API Request: ${method} ${path}${body ? `\nBody: ${JSON.stringify(body, null, 2)}` : ''}`);
    },
    response: (method, path, response) => {
        console.log(`✅ API Response: ${method} ${path}\nResponse:`, response);
    },
    error: (method, path, error) => {
        console.error(`❌ API Error: ${method} ${path}\nError:`, error);
    }
};

// A helper function to handle fetch requests
const fetchApi = async (path, options = {}) => {
    // 2. Get the auth token from localStorage
    const token = localStorage.getItem('authToken');

    // 3. Set up the headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers, // Allow overriding headers if needed
    };

    // If a token exists, add the Authorization header
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Log the request
    logger.request(options.method || 'GET', path, options.body ? JSON.parse(options.body) : null);

    // 4. Construct the full URL and make the request
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    // 5. Handle non-ok responses
    if (!response.ok) {
        // Try to parse the error message from the backend, or use a default
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        const error = new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        logger.error(options.method || 'GET', path, error);
        throw error;
    }

    let responseData;
    // Handle different successful status codes
    switch (response.status) {
        case 204: // No Content
            responseData = null;
            break;
        case 201: // Created
            responseData = await response.json().catch(() => null);
            break;
        default:  // 200 OK and others
            responseData = await response.json();
    }

    logger.response(options.method || 'GET', path, responseData);
    return responseData;
};

// --- Define your API methods ---

export const register = (registrationData) => {
    return fetchApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(registrationData),
    });
};

export const login = (username, password) => {
    return fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
};

export const getAdminMenuItems = () => {
    return fetchApi('/api/admin/menu-items');
};

export const updateMenuItemAvailability = (itemId, isAvailable) => {
    return fetchApi(`/api/admin/menu-items/${itemId}/availability`, {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable }),
    });
};

export const getActiveOrders = (restaurantId) => {
    // This requires an authenticated user, but our fetchApi helper adds the token automatically.
    return fetchApi(`/api/orders/restaurant/${restaurantId}/active`);
};

export const getMenuItems = (restaurantId) => {
    return fetchApi(`/api/menu/${restaurantId}`);
};

export const placeOrder = (orderPayload) => {
    return fetchApi('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
    });
};

export const deleteMenuItem = (itemId) => {
    return fetchApi(`/api/admin/menu-items/${itemId}`, {
        method: 'DELETE'
    });
};

export const getMenuItem = (itemId) => {
    return fetchApi(`/api/admin/menu-items/${itemId}`);
};

export const createMenuItem = (menuItemData) => {
    return fetchApi('/api/admin/menu-items', {
        method: 'POST',
        body: JSON.stringify(menuItemData),
    });
};

export const updateMenuItem = (itemId, menuItemData) => {
    return fetchApi(`/api/admin/menu-items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(menuItemData),
    });
};

export const updateOrderStatus = (orderId, newStatus) => {
    return fetchApi(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ newStatus }),
    });
};

// Add other API functions here as you need them...
// e.g., updateOrderStatus, etc.