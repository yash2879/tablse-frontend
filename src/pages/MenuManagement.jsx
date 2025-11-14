// src/pages/MenuManagement.jsx

import React, { useState, useEffect } from 'react';
import './MenuManagement.css';
import ToggleSwitch from '../components/ToggleSwitch'; // Import the new component
import { Link } from 'react-router-dom';
import { getAdminMenuItems, updateMenuItemAvailability, deleteMenuItem } from '../services/apiClient'; // Import the API function

// A simple Modal component defined right in the file for convenience
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h5>{title}</h5>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">{children}</div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={onConfirm} className="btn-danger">Confirm</button>
                </div>
            </div>
        </div>
    );
};


const MenuManagement = () => {
    // --- STATE MANAGEMENT ---
    const [menuItems, setMenuItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState('all');

    // State for the delete confirmation modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const token = localStorage.getItem('authToken');

    // --- DATA FETCHING ---
    useEffect(() => {
        const loadMenuItems = async () => {
            try {
                // 2. Just call the function. It handles the URL, token, and errors.
                const data = await getAdminMenuItems();
                setMenuItems(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        loadMenuItems();
    }, []);


    // --- HANDLER FUNCTIONS ---
    const handleToggleAvailability = async (itemToUpdate, newAvailability) => {
        // Optimistic UI update: Update the state immediately for a snappy feel
        setMenuItems(menuItems.map(item =>
            item.id === itemToUpdate.id ? { ...item, isAvailable: newAvailability } : item
        ));

        try {
            await updateMenuItemAvailability(itemToUpdate.id, newAvailability);
        } catch (err) {
            // If the API call fails, revert the state to show the error
            setMenuItems(menuItems.map(item =>
                item.id === itemToUpdate.id ? { ...item, isAvailable: !newAvailability } : item
            ));
            alert("Failed to update availability. Please try again.");
        }
    };

    const openDeleteModal = (item) => {
        setItemToDelete(item);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setItemToDelete(null);
        setIsModalOpen(false);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        try {
            await deleteMenuItem(itemToDelete.id);
            // On success, filter the item out of the state
            setMenuItems(menuItems.filter(item => item.id !== itemToDelete.id));
            closeDeleteModal();
        } catch (err) {
            alert("Failed to delete item. Please try again.");
            closeDeleteModal();
        }
    };


    // --- FILTERING LOGIC ---
    const filteredMenuItems = menuItems
        .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(item => {
            if (availabilityFilter === 'all') return true;
            return availabilityFilter === 'available' ? item.isAvailable : !item.isAvailable;
        });

    // --- RENDER LOGIC ---
    if (isLoading) {
        return <div className="menu-management-container"><p>Loading menu...</p></div>;
    }

    if (error) {
        return <div className="menu-management-container"><p className="error-message">{error}</p></div>;
    }

    return (
        <>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteConfirm}
                title="Confirm Deletion"
            >
                Are you sure you want to delete the item: <strong>{itemToDelete?.name}</strong>?
            </ConfirmationModal>

            <div className="menu-management-container">
                <div className="header">
                    <h1 className="header__title">Menu Management</h1>
                    <Link to="/admin/menu/new" className="add-item-btn">
                        <i className="fas fa-plus"></i>
                        <span>Add New Item</span>
                    </Link>
                </div>

                {/* This is the new container for the controls */}
                <div className="controls-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="filter-select"
                        value={availabilityFilter}
                        onChange={(e) => setAvailabilityFilter(e.target.value)}
                    >
                        {/* We will add value and onChange in the next step */}
                        <option value="all">Show All</option>
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                    </select>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Available</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMenuItems.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        {/* 2. Add the image cell */}
                                        <div className="table-image-container">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} />
                                            ) : (
                                                <span className="no-image-text"></span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>₹{item.price.toFixed(2)}</td>
                                    <td>
                                        <ToggleSwitch
                                            checked={!!item.isAvailable}
                                            onChange={() => handleToggleAvailability(item, !item.isAvailable)}
                                        />
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn btn-edit"
                                                title="Edit"
                                                onClick={() => window.location.href = `/admin/menu/edit/${item.id}`}
                                            >
                                                <i className="fas fa-pen"></i>
                                            </button>
                                            <button
                                                className="action-btn btn-delete"
                                                title="Delete"
                                                onClick={() => openDeleteModal(item)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredMenuItems.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="empty-table-message">
                                        No menu items found. Click "Add New Item" to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default MenuManagement;