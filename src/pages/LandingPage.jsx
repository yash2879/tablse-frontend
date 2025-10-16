// src/pages/LandingPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; // We'll create this CSS file next

const LandingPage = () => {
    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="navbar">
                <div className="container">
                    <span className="navbar-brand">TableSE</span>
                    <div className="navbar-actions">
                        <Link to="/login" className="btn btn-outline">Login</Link>
                        <Link to="/register" className="btn btn-primary">Sign Up</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero">
                <div className="container">
                    <h1>Modernize Your Menu. Delight Your Customers.</h1>
                    <p>Dynamic QR code menus and a real-time ordering system that flows directly to your kitchen.</p>
                    <Link to="/register" className="btn btn-light btn-lg">Get Started for Free</Link>
                </div>
            </header>

            {/* Features Section */}
            <main className="features container">
                <div className="feature">
                    <div className="feature-icon">📱</div>
                    <h3>Contactless QR Menus</h3>
                    <p>Customers can view your full menu instantly on their own devices. Update prices and availability anytime.</p>
                </div>
                <div className="feature">
                    <div className="feature-icon">🚀</div>
                    <h3>Real-Time Kitchen Hub</h3>
                    <p>New orders appear instantly on a simple, interactive display in your kitchen, improving speed and accuracy.</p>
                </div>
                <div className="feature">
                    <div className="feature-icon">📈</div>
                    <h3>Increased Efficiency</h3>
                    <p>Free up your staff to focus on great service. Turn tables faster and increase sales.</p>
                </div>
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p>Copyright &copy; TableSe 2025</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;