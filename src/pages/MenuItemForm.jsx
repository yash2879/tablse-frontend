// src/pages/MenuItemForm.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMenuItem, createMenuItem, updateMenuItem } from '../services/apiClient';
import './MenuItemForm.css'; // We'll create this CSS file

const MenuItemForm = () => {
    // --- 1. HOOKS ---
    const { itemId } = useParams(); // Gets 'itemId' from the URL, e.g., "123" or undefined
    const navigate = useNavigate(); // Hook to programmatically navigate
    const isEditing = Boolean(itemId); // A simple boolean to know our mode
    const token = localStorage.getItem('authToken');

    // --- 2. STATE MANAGEMENT ---
    // State for the form data, matching our backend DTO structure
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        isAvailable: true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- 3. DATA FETCHING (for Edit Mode) ---
    useEffect(() => {
        // This effect only runs if we are in "edit" mode
        if (isEditing) {
            setIsLoading(true);
            const fetchItemData = async () => {
                try {
                    // We need a new backend endpoint for fetching a single item by ID
                    const data = await getMenuItem(itemId);
                    // Populate the form with the fetched data
                    setFormData({
                        name: data.name,
                        description: data.description || '',
                        price: data.price,
                        isAvailable: data.isAvailable,
                    });
                } catch (err) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchItemData();
        }
    }, [itemId, isEditing]); // Effect runs when component mounts or itemId changes

    // --- 4. EVENT HANDLERS ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        // Handle changes for all inputs, including the checkbox
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const submissionData = {
            ...formData,
            price: parseFloat(formData.price)
        };

        try {
            if (isEditing) {
                await updateMenuItem(itemId, submissionData);
            } else {
                await createMenuItem(submissionData);
            }
            navigate('/admin/menu');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };


    // --- 5. RENDER LOGIC ---
    if (isLoading && isEditing) return <p>Loading item details...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="form-container">
            <h1>{isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}</h1>
            <form onSubmit={handleSubmit} className="menu-item-form">

                <div className="form-group">
                    <label htmlFor="name">Item Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label htmlFor="price">Price (₹)</label>
                    <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required step="0.01" />
                </div>

                <div className="form-group form-group--checkbox">
                    <input type="checkbox" id="isAvailable" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} />
                    <label htmlFor="isAvailable">Item is Available</label>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/admin/menu')} className="btn-cancel">Cancel</button>
                    <button type="submit" className="btn-save" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Item'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MenuItemForm;