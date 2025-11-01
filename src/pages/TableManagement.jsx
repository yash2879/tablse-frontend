import React, { useState, useEffect } from 'react';
import { getTables, createTable } from '../services/apiClient'; // We will add these
import './TableManagement.css'; // We will create this CSS file later

const TableManagement = () => {
    const [tables, setTables] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [baseUrl, setBaseUrl] = useState('');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTableName, setNewTableName] = useState('');
    const [newlyCreatedTable, setNewlyCreatedTable] = useState(null);

    useEffect(() => {
        setBaseUrl(`${window.location.protocol}//${window.location.host}`);
        const loadTables = async () => {
            setIsLoading(true);
            try {
                const tablesData = await getTables(); 
                setTables(tablesData);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadTables();
    }, []);

    const handleOpenCreateModal = () => {
        setNewTableName('');
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleCreateTable = async (e) => {
        e.preventDefault();
        if (!newTableName.trim()) return;

        try {
            const createdTableData = await createTable(newTableName);
            setTables([...tables, createdTableData]); // Add new table to the list
            setNewlyCreatedTable(createdTableData); // Store it to show the secret key
            handleCloseCreateModal(); // Close the form modal
        } catch (err) {
            setError(err.message); // Or show a more specific error in the modal
        }
    };

    const handleCloseSecretModal = () => {
        setNewlyCreatedTable(null);
    };

    if (isLoading) return <p>Loading tables...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <>
            {/* --- MODAL 1: CREATE TABLE FORM --- */}
            {isCreateModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5>Create New Table</h5>
                            <button onClick={handleCloseCreateModal} className="modal-close-btn">&times;</button>
                        </div>
                        <form onSubmit={handleCreateTable}>
                            <div className="modal-body">
                                <label htmlFor="tableName">Table Name</label>
                                <input
                                    type="text"
                                    id="tableName"
                                    className="form-control"
                                    value={newTableName}
                                    onChange={(e) => setNewTableName(e.target.value)}
                                    placeholder="e.g., Patio Table 3"
                                    required
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={handleCloseCreateModal} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-save">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {newlyCreatedTable && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5>Provision New Table Device</h5>
                            <button onClick={handleCloseSecretModal} className="modal-close-btn">&times;</button>
                        </div>
                        <div className="modal-body">
                            <p>To set up the e-ink device for "<strong>{newlyCreatedTable.name}</strong>", connect to its setup WiFi and enter the following details on the configuration page.</p>
                            
                            <div className="provisioning-info-item">
                                <label>Base URL</label>
                                <div className="info-box">
                                    <span>{`${baseUrl}/menu/${newlyCreatedTable.restaurantId}?table=${newlyCreatedTable.id}`}</span>
                                    <button onClick={() => navigator.clipboard.writeText(`${baseUrl}/menu/${newlyCreatedTable.restaurantId}?table=${newlyCreatedTable.id}`)}>Copy</button>
                                </div>
                            </div>

                            <div className="provisioning-info-item">
                                <label>Secret Key</label>
                                <div className="info-box">
                                    <span>{newlyCreatedTable.secretKey}</span>
                                    <button onClick={() => navigator.clipboard.writeText(newlyCreatedTable.secretKey)}>Copy</button>
                                </div>
                            </div>
                            <p className='important-note'><strong>Important:</strong> You will not be able to view the Secret Key again after closing this window.</p>
                        </div>
                        <div className="modal-footer">
                            <button onClick={handleCloseSecretModal} className="btn-primary">Done</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MAIN PAGE CONTENT --- */}
            <div className="table-management-container">
                <div className="header">
                    <h1 className="header__title">Table & QR Code Management</h1>
                    {/* Connect the button to open the modal */}
                    <button onClick={handleOpenCreateModal} className="add-item-btn">
                        <i className="fas fa-plus"></i>
                        <span>Add New Table</span>
                    </button>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Table ID</th>
                                <th>Table Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tables.map(table => (
                                <tr key={table.id}>
                                    <td>{table.id}</td>
                                    <td>{table.name}</td>
                                    <td>
                                        {/* We can add buttons for actions later */}
                                        <button className="action-btn btn-view-qr" title="View QR Info">
                                            <i className="fas fa-qrcode"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {tables.length === 0 && <p className="no-tables-message">No tables found. Click "Add New Table" to get started.</p>}
                </div>
            </div>
        </>
    );
};

export default TableManagement;