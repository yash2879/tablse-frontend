// src/pages/MenuItemForm.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMenuItem, createMenuItem, updateMenuItem, uploadMenuItemImage } from '../services/apiClient';
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
        imageUrl: null,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const fileInputRef = useRef(null); // To trigger the hidden file input

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
                        imageUrl: data.imageUrl,
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

        // 1. Convert price to a number and validate it
        const price = parseFloat(formData.price);
        if (isNaN(price) || price <= 0) {
            setError("Price must be a positive number.");
            setIsLoading(false);
            return; // Stop the submission
        }

        // 2. Construct a clean payload that EXACTLY matches the backend DTO
        const submissionData = {
            name: formData.name,
            description: formData.description,
            price: price, // Use the validated, parsed price
            isAvailable: formData.isAvailable,
            // DO NOT include imageUrl here, as the DTO doesn't have it.
        };

        try {
            if (isEditing) {
                await updateMenuItem(itemId, submissionData);
            } else {
                await createMenuItem(submissionData);
            }
            navigate('/admin/menu');
        } catch (err) {
            // The error from the backend might be more specific (e.g., "Name must be at least 3 characters")
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setUploadError(null);
            // Create a temporary local URL for immediate preview
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleImageUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setUploadError(null);
        try {
            const updatedItem = await uploadMenuItemImage(itemId, selectedFile);
            // Update the form with the new URL from the server response
            setFormData(prevData => ({ ...prevData, imageUrl: updatedItem.imageUrl }));
            setSelectedFile(null);
            setImagePreview(null);
        } catch (err) {
            setUploadError(err.message || 'Image upload failed. Please try a different file.');
        } finally {
            setIsUploading(false);
        }
    };


    // --- 5. RENDER LOGIC ---
    if (isLoading && isEditing) return <p>Loading item details...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="form-container">
            <h1>{isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}</h1>
            {/* Split layout for form and image uploader */}
            <div className="form-layout">
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
                        <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required step="0.01" min="0.01" />
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

                {isEditing && (
                    <div className="image-uploader-container">
                        <h2>Menu Item Image</h2>
                        <div className="image-preview-box">
                            {imagePreview ? (
                                <img src={imagePreview} alt="New preview" />
                            ) : formData.imageUrl ? (
                                <img src={formData.imageUrl} alt={formData.name} />
                            ) : (
                                <div className="no-image-placeholder">
                                    <i className="fas fa-image"></i>
                                    <span>No Image</span>
                                </div>
                            )}
                        </div>

                        {uploadError && <p className="error-message">{uploadError}</p>}

                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />

                        {/* If a new file is selected, show the upload button. Otherwise, show the choose file button. */}
                        {selectedFile ? (
                            <div className="upload-actions">
                                <button type="button" onClick={handleImageUpload} className="btn-save" disabled={isUploading}>
                                    {isUploading ? 'Uploading...' : 'Upload Image'}
                                </button>
                                <button type="button" onClick={() => { setSelectedFile(null); setImagePreview(null); }} className="btn-cancel">
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => fileInputRef.current.click()} className="btn-secondary">
                                Choose Image
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuItemForm;