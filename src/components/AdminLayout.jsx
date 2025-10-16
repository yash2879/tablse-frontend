// src/components/AdminLayout.jsx

import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); // Redirect to login page after logout
    };

    return (
        <div className="admin-layout">
            <header className="admin-header">
                <div className="header-left">
                    <Link to="/admin/dashboard" className="header-brand">TableSE Admin</Link>

                    <nav className="header-nav">
                        <NavLink to="/admin/dashboard" className="header-nav-link">Dashboard</NavLink>
                        <NavLink to="/admin/menu" className="header-nav-link">Menu</NavLink>
                        <NavLink to={`/admin/kitchen/hub`} className="header-nav-link">Kitchen Hub</NavLink>
                    </nav>
                </div>
                <div className="header-user-info">
                    {/* Display the username from the JWT's 'sub' (subject) claim */}
                    <span>Welcome, {user?.sub || 'Admin'}</span>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </header>
            <main className="admin-main-content">
                {/* The <Outlet/> component from react-router renders the nested child route */}
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;