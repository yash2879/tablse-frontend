// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// This is a "wrapper" component. It will receive other components as its "children".
const ProtectedRoute = ({ children }) => {
    // 1. Check for the authentication token
    const token = localStorage.getItem('authToken');
    const location = useLocation(); // Get the current location

    // 2. The Logic: Is the user authenticated?
    if (!token) {
        // If there's no token, redirect the user to the login page.
        // The <Navigate> component from react-router-dom is the declarative way to do this.
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // 3. If the token exists, render the child component that was passed in.
    // This allows the user to access the page they originally requested.
    return children;
};

export default ProtectedRoute;