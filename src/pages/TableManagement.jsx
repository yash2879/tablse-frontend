import React, { useState, useEffect } from 'react';
import { getTables, createTable, getTableDetails } from '../services/apiClient'; // We will add these
import './TableManagement.css'; // We will create this CSS file later

const TableManagement = () => {
    const [tables, setTables] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [baseUrl, setBaseUrl] = useState('');

    const [selectedTable, setSelectedTable] = useState(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [infoModalError, setInfoModalError] = useState(null);
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

    const handleOpenInfoModal = async (tableId) => {
        setIsInfoModalOpen(true);
        setSelectedTable(null); // Reset previous data
        setInfoModalError(null);
        try {
            const tableDetails = await getTableDetails(tableId);
            setSelectedTable(tableDetails);
        } catch (err) {
            setInfoModalError("Could not load table details. Please try again.");
        }
    };

    const handleCloseInfoModal = () => {
        setIsInfoModalOpen(false);
        setSelectedTable(null);
        setInfoModalError(null);
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

            {isInfoModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            {/* The title will show loading text until the data arrives */}
                            <h5>{selectedTable ? `Provisioning Info for "${selectedTable.name}"` : 'Loading...'}</h5>
                            <button onClick={handleCloseInfoModal} className="modal-close-btn">&times;</button>
                        </div>
                        <div className="modal-body">
                            {infoModalError ? (
                                <p className="error-message">{infoModalError}</p>
                            ) : !selectedTable ? (
                                <p>Fetching table details...</p>
                            ) : (
                                <>
                                    <p>Use these details to set up a new or reset e-ink device for this table.</p>
                                    <div className="provisioning-info-item">
                                        <label>Base URL</label>
                                        <div className="info-box">
                                            <span>{`${baseUrl}/menu/${selectedTable.restaurantId}?table=${selectedTable.id}`}</span>
                                            <button onClick={() => navigator.clipboard.writeText(`${baseUrl}/menu/${selectedTable.restaurantId}?table=${selectedTable.id}`)}>Copy</button>
                                        </div>
                                    </div>
                                    <div className="provisioning-info-item">
                                        <label>Secret Key</label>
                                        <div className="info-box">
                                            <span>{selectedTable.secretKey}</span>
                                            <button onClick={() => navigator.clipboard.writeText(selectedTable.secretKey)}>Copy</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button onClick={handleCloseInfoModal} className="btn-primary">Close</button>
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
                                        <button
                                            onClick={() => handleOpenInfoModal(table.id)}
                                            className="action-btn btn-view-qr"
                                            title="View QR Info"
                                        >
                                            <i className="fas fa-qrcode"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {tables.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="empty-table-message">
                                        No tables found. Click "Add New Table" to get started.
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

export default TableManagement;