// src/context/AuthContext.jsx

import React, { createContext, useState, useContext } from 'react';
import { jwtDecode } from 'jwt-decode'; // We need a library to decode the token

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the AuthProvider Component
export const AuthProvider = ({ children }) => {
    // State to hold the authentication token
    const [token, setToken] = useState(localStorage.getItem('authToken'));

    // Decode the token to get user data. Use a memo to avoid re-calculating on every render.
    const user = React.useMemo(() => {
        if (!token) return null;
        try {
            // The jwt-decode library will parse the token's payload
            return jwtDecode(token);
        } catch (error) {
            console.error("Invalid token:", error);
            return null;
        }
    }, [token]);

    // The login function that LoginPage will call
    const login = (newToken) => {
        localStorage.setItem('authToken', newToken);
        setToken(newToken);
    };

    // The logout function that our Navbar will call
    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
    };

    // The value that will be provided to all consuming components
    const value = {
        token,
        user, // The decoded user object (contains sub, restaurantId, etc.)
        login,
        logout,
        isAuthenticated: !!token, // A simple boolean flag
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Create a custom hook for easy access to the context
export const useAuth = () => {
    return useContext(AuthContext);
};