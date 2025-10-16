// src/pages/RegistrationPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/apiClient'; // We'll need to add this to apiClient.js
import './RegistrationPage.css'; // We'll create this CSS file

const RegistrationPage = () => {
    const [formData, setFormData] = useState({
        ownerName: '',
        ownerEmail: '',
        password: '',
        restaurantName: '',
        restaurantAddress: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // We assume the 'register' function will be added to apiClient.js
            await register(formData);

            // On success, navigate to the login page with a success message in the state
            navigate('/login', { 
                state: { successMessage: 'Registration successful! Please log in.' } 
            });

        } catch (err) {
            // The apiClient will throw an error with a message from the backend
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page-background">
            <div className="register-container">
                <div className="register-card">
                    <div className="register-header">
                        <h1>Create an Account!</h1>
                    </div>
                    
                    {error && <div className="alert-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="register-form">
                        
                        <h6 className="form-section-title">Your Details</h6>
                        <hr />

                        <div className="form-group">
                            <input
                                type="text" name="ownerName" placeholder="Your Full Name (will be your username)"
                                value={formData.ownerName} onChange={handleChange}
                                className="form-control" required minLength="2"
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="email" name="ownerEmail" placeholder="Email Address"
                                value={formData.ownerEmail} onChange={handleChange}
                                className="form-control" required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password" name="password" placeholder="Password (min. 6 characters)"
                                value={formData.password} onChange={handleChange}
                                className="form-control" required minLength="6"
                            />
                        </div>

                        <h6 className="form-section-title">Restaurant Details</h6>
                        <hr />

                         <div className="form-group">
                            <input
                                type="text" name="restaurantName" placeholder="Restaurant Name"
                                value={formData.restaurantName} onChange={handleChange}
                                className="form-control" required minLength="3"
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="text" name="restaurantAddress" placeholder="Restaurant Address"
                                value={formData.restaurantAddress} onChange={handleChange}
                                className="form-control"
                            />
                        </div>

                        <button type="submit" className="btn-register" disabled={isLoading}>
                            {isLoading ? 'Registering...' : 'Register Account'}
                        </button>
                    </form>
                    <hr />
                    <div className="register-footer">
                        <Link to="/login">Already have an account? Login!</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;