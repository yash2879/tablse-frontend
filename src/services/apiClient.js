// src/services/apiClient.js

// 1. Get the base URL from the environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Logger utility
const logger = {
    request: (method, path, body) => {
        if (body) {
            console.log(`🚀 API Request: ${method} ${path}\nBody:`, body);
        } else {
            console.log(`🚀 API Request: ${method} ${path}`);
        }
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

    const { sendAuth = true, tokenType = 'any', ...restOptions } = options;

    let token;
    if (tokenType === 'session') {
        token = localStorage.getItem('sessionToken');
    } else if (tokenType === 'admin') {
        token = localStorage.getItem('authToken');
    } else { // Default 'any' case for general authenticated routes
        token = localStorage.getItem('authToken') || localStorage.getItem('sessionToken');
    }

    // 3. Set up the headers
    const headers = { ...restOptions.headers };
    let body = restOptions.body;

    // If the body is NOT FormData, handle it as JSON.
    // Otherwise, let the browser handle the Content-Type for file uploads.
    if (!(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        if (body) {
            body = JSON.stringify(body);
        }
    }

    // If a token exists, add the Authorization header
    if (token && sendAuth) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Log the request
    logger.request(options.method || 'GET', path, options.body);

    try {
        // 4. Construct the full URL and make the request
        const response = await fetch(`${API_BASE_URL}${path}`, {
            ...restOptions,
            headers,
            body,
        });

        // 5. Handle non-ok responses
        if (!response.ok) {
            // Try to parse the error message from the backend, or use a default
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            const error = new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            error.status = response.status;
            throw error;
        }

        let responseData;
        // Handle different successful status codes
        switch (response.status) {
            case 204: // No Content
                responseData = null;
                break;
            case 200: // OK
            case 201: // Created
                responseData = await response.json().catch(() => null);
                break;
            default:  // 202 Accepted and others
                responseData = await response.json();
        }

        logger.response(options.method || 'GET', path, responseData);
        return responseData;
    } catch (error) {
        logger.error(options.method || 'GET', path, error);

        // --- THIS IS THE GLOBAL INTERCEPTOR LOGIC ---
        if (error.status === 401 || error.status === 403) {
            console.log("Authentication error detected. Logging out and redirecting.");
            // Clear any invalid tokens
            localStorage.removeItem('authToken');
            localStorage.removeItem('sessionToken');
            // Force a redirect to the login page. A full page load is good here
            // as it clears all application state.
            window.location.href = '/login';
        }
        // --- END OF INTERCEPTOR LOGIC ---

        // Re-throw the error so individual components can still handle it if needed
        throw error;
    }
};

// --- Define your API methods ---

export const register = (registrationData) => {
    return fetchApi('/api/auth/register', {
        method: 'POST',
        body: registrationData,
        sendAuth: false,
    });
};

export const login = (username, password) => {
    return fetchApi('/api/auth/login', {
        method: 'POST',
        body: { username, password },
        sendAuth: false,
    });
};

export const authenticateTableSession = (tableId, otp) => {
    // This API call intentionally does NOT send an existing auth token.
    // It's the entry point for a customer.
    return fetchApi('/api/sessions/authenticate-table', {
        method: 'POST',
        body: { tableId: parseInt(tableId), otp },
        sendAuth: false,
    });
};

export const getMenuItems = (restaurantId) => {
    return fetchApi(`/api/menu/${restaurantId}`, {
        sendAuth: false,
    });
};

export const getAdminMenuItems = () => {
    return fetchApi('/api/admin/menu-items');
};

export const updateMenuItemAvailability = (itemId, isAvailable) => {
    return fetchApi(`/api/admin/menu-items/${itemId}/availability`, {
        method: 'PATCH',
        body: { isAvailable },
    });
};

export const placeOrderFromSession = (sessionId) => {
    return fetchApi(`/api/orders/from-session`, {
        method: 'POST',
        body: { sessionId: sessionId },
        tokenType: 'session',
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
        body: menuItemData,
    });
};

export const updateMenuItem = (itemId, menuItemData) => {
    return fetchApi(`/api/admin/menu-items/${itemId}`, {
        method: 'PUT',
        body: menuItemData,
    });
};

export const updateOrderStatus = (orderId, newStatus) => {
    return fetchApi(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { newStatus },
    });
};

export const getActiveOrders = (restaurantId) => {
    return fetchApi(`/api/orders/restaurant/${restaurantId}/active`);
};

export const addItemToOrder = (sessionId, menuItemId, quantity) => {
    return fetchApi(`/api/sessions/${sessionId}/items`, {
        method: 'POST',
        body: { menuItemId, quantity },
        tokenType: 'session',
    });
};

export const removeItemFromOrder = (sessionId, menuItemId) => {
    return fetchApi(`/api/sessions/${sessionId}/items/${menuItemId}`, {
        method: 'DELETE',
        tokenType: 'session',
    });
};

export const getTables = () => {
    // NOTE: This endpoint is assumed to exist. Confirm with the backend team.
    return fetchApi('/api/admin/tables');
};

export const createTable = (tableName) => {
    return fetchApi('/api/admin/tables', {
        method: 'POST',
        body: { name: tableName },
    });
};

export const getRestaurantDetails = () => {
    return fetchApi('/api/admin/restaurant');
};

export const updateRestaurantDetails = (detailsData) => {
    return fetchApi('/api/admin/restaurant', {
        method: 'PUT',
        body: detailsData,
    });
};

export const uploadMenuItemImage = (itemId, imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    return fetchApi(`/api/admin/menu-items/${itemId}/media/image`, {
        method: 'POST',
        // We pass the FormData object directly. Our helper will handle it.
        body: formData,
        tokenType: 'admin', // Ensure we use the admin token
    });
};

export const getTableDetails = (tableId) => {
    return fetchApi(`/api/admin/tables/${tableId}`, {
        tokenType: 'admin', // Ensure we use the admin token
    });
};

// Add other API functions here as you need them...
// e.g., updateOrderStatus, etc.