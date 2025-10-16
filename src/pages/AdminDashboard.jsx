// src/pages/AdminDashboard.jsx

import React from 'react';
import { Link } from 'react-router-dom'; // Import the Link component
import './AdminDashboard.css'; // Import our styles

const AdminDashboard = () => {

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">Select a tool to manage your restaurant.</p>

            <div className="dashboard-grid">

                {/* Card 1: Kitchen Hub */}
                <div className="dashboard-card">
                    <h2 className="dashboard-card__title">🍳 Kitchen Hub</h2>
                    <p className="dashboard-card__description">
                        View and manage all incoming orders in real-time. This is your live operations view.
                    </p>
                    {/* Use the Link component for seamless, client-side navigation */}
                    <Link to={`/admin/kitchen/hub`} className="dashboard-card__link">
                        Go to Kitchen Hub
                    </Link>
                </div>

                {/* Card 2: Menu Management */}
                <div className="dashboard-card">
                    <h2 className="dashboard-card__title">📝 Menu Management</h2>
                    <p className="dashboard-card__description">
                        Add, edit, or change the availability of your menu items.
                    </p>
                    {/* This link points to a route we will create next */}
                    <Link to="/admin/menu" className="dashboard-card__link">
                        Manage Menu
                    </Link>
                </div>

                {/* Card 3: QR Codes (Placeholder) */}
                <div className="dashboard-card">
                    <h2 className="dashboard-card__title">📱 QR Codes</h2>
                    <p className="dashboard-card__description">
                        Generate and print unique QR codes for each of your tables.
                    </p>
                    {/* A '#' indicates a placeholder link for now */}
                    <Link to="#" className="dashboard-card__link dashboard-card__link--disabled">
                        Generate Codes
                    </Link>
                </div>
                
                {/* Card 4: Settings (Placeholder) */}
                 <div className="dashboard-card">
                    <h2 className="dashboard-card__title">⚙️ Settings</h2>
                    <p className="dashboard-card__description">
                        Update your restaurant's name, address, and other details.
                    </p>
                    <Link to="#" className="dashboard-card__link dashboard-card__link--disabled">
                        Edit Settings
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;