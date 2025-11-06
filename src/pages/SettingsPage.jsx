import React, { useState, useEffect } from 'react';
import { getRestaurantDetails, updateRestaurantDetails } from '../services/apiClient';
import './SettingsPage.css'; // We will create this
import Notification from '../components/Notification';

const SettingsPage = () => {
    const [formData, setFormData] = useState({ name: '', address: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const details = await getRestaurantDetails();
                setFormData({ name: details.name, address: details.address || '' });
            } catch (err) {
                setError("Failed to load restaurant details.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setNotification(null);
        setError(null);
        
        try {
            await updateRestaurantDetails(formData);
            setNotification({ message: 'Settings saved successfully!', type: 'success' });
        } catch (err) {
            setNotification({ message: `Error: ${err.message}`, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    if (isLoading) return <p>Loading settings...</p>;

    return (
        <>
            <div className="notification-container">
                {notification && <Notification notification={notification} onClose={() => setNotification(null)} />}
            </div>
            <div className="form-container">
                <h1>Restaurant Settings</h1>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="form-group">
                        <label htmlFor="name">Restaurant Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Restaurant Address</label>
                        <textarea
                            id="address"
                            name="address"
                            rows="4"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-save" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default SettingsPage;