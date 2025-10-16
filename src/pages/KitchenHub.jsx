// src/pages/KitchenHub.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Client } from "@stomp/stompjs";
import OrderCard from '../components/OrderCard';
import { useAuth } from '../context/AuthContext';
import Notification from '../components/Notification';
import { getActiveOrders, updateOrderStatus } from '../services/apiClient';
import './KitchenHub.css';

const KitchenHub = () => {
    const [orders, setOrders] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [notification, setNotification] = useState(null);
    const [activeMobileTab, setActiveMobileTab] = useState('NEW');


    // This ref will hold our single, persistent client instance
    const clientRef = useRef(null);
    const { user } = useAuth();
    const token = localStorage.getItem('authToken');
    const restaurantId = user ? user.restaurantId : null;

    // This useEffect hook manages the connection lifecycle: connecting on mount, disconnecting on unmount.
    useEffect(() => {
        // --- 1. Validate we have a restaurantId ---
        if (!restaurantId) {
            console.error("No restaurant ID found in URL. Cannot connect.");
            return; // Stop the effect if there's no ID
        }

        // --- 2. Define our connection and message handlers ---
        const onConnect = async () => {
            setIsConnected(true);
            console.log("SUCCESS: Connected to WebSocket via STOMP!");

            const topic = `/topic/orders/${restaurantId}`;
            console.log(`Subscribing to topic: ${topic}`);

            // Fetch initial active orders
            try {
                console.log("Fetching initial active orders...");
                const initialOrders = await getActiveOrders(restaurantId);
                // Sort orders so 'NEW' are first, then by time.
                initialOrders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
                setOrders(initialOrders);
                console.log("Successfully loaded initial orders:", initialOrders);
            } catch (error) {
                console.error("Failed to fetch initial orders:", error);
                // Optionally set an error state here to show in the UI
                setNotification({
                    message: "Error: Could not load initial orders. Please refresh.",
                    type: 'error'
                });
            }

            // Subscribe to the restaurant-specific topic
            clientRef.current.subscribe(topic, (message) => {
                if (message.body) {
                    const incomingOrder = JSON.parse(message.body);
                    console.log("New order received:", incomingOrder);

                    if (!incomingOrder || !incomingOrder.id) {
                        console.warn("Received an order without an ID, skipping update.", incomingOrder);
                        return; // Stop processing this malformed message
                    }

                    setOrders((prevOrders) => {
                        // First, remove any existing order with the same ID to prevent duplicates
                        const filteredOrders = prevOrders.filter(o => o.id !== incomingOrder.id);
                        // Then, add the new or updated order to the front
                        return [incomingOrder, ...filteredOrders];
                    });
                }
            });
        };

        const onError = (error) => {
            console.error("STOMP Error:", error);
            setIsConnected(false);
        };

        // --- 3. Create the client instance ONCE and store it in the ref ---
        // This check prevents re-creating the client during Strict Mode's double-render.
        if (!clientRef.current) {
            console.log("Creating new STOMP client instance...");
            const client = new Client({
                // Get WebSocket URL from environment variables
                brokerURL: import.meta.env.VITE_WEBSOCKET_URL,
                debug: (str) => console.log(new Date(), str),
                reconnectDelay: 5000,
                onConnect: onConnect,
                onStompError: onError,
            });
            clientRef.current = client; // Store the single instance
        }

        // --- 4. Activate the client ---
        console.log("Activating client...");
        clientRef.current.activate();

        return () => {
            console.log("Cleanup: Deactivating client...");
            if (clientRef.current) {
                clientRef.current.deactivate();
                setIsConnected(false);
            }
        };

    }, [restaurantId]); // Empty dependency array ensures this effect runs only on mount/unmount.

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000); // Disappears after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const newOrders = orders.filter(order => order.status === 'NEW');
    const preparingOrders = orders.filter(order => order.status === 'PREPARING');
    const completedOrders = orders.filter(order => order.status === 'COMPLETED');

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        console.log(`Requesting status update for order ${orderId} to ${newStatus}`);
        try {
            await updateOrderStatus(orderId, newStatus);
            console.log(`Update request for order ${orderId} was successful.`);
        } catch (error) {
            setNotification({
                message: "Error: Could not update order. Please check connection.",
                type: 'error'
            });
        }
    };

    // --- Render Logic (JSX) ---
    return (
        <div className="kitchen-hub-container">
            <div className="notification-container">
                {notification &&
                    <Notification
                        notification={notification}
                        onClose={handleCloseNotification}
                    />
                }
            </div>
            <h1>Kitchen Hub</h1>
            <p className="connection-status">
                Status:
                <span style={{ color: isConnected ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                    {isConnected ? ' Connected' : ' Disconnected'}
                </span>
            </p>

            <div className="kanban-board desktop-only">
                {/* column 1 */}
                <div className="kanban-column">
                    <h2 className='kanban-column-title'>New ({newOrders.length})</h2>
                    <div className="kanban-column-orders">
                        {newOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onUpdateStatus={handleUpdateOrderStatus}
                            />
                        ))}
                    </div>
                </div>

                {/* column 2 */}
                <div className="kanban-column">
                    <h2 className='kanban-column-title'>Preparing ({preparingOrders.length})</h2>
                    <div className="kanban-column-orders">
                        {preparingOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onUpdateStatus={handleUpdateOrderStatus}
                            />
                        ))}
                    </div>
                </div>

                {/* column 3 */}
                <div className="kanban-column">
                    <h2 className='kanban-column-title'>Completed ({completedOrders.length})</h2>
                    <div className="kanban-column-orders">
                        {completedOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onUpdateStatus={handleUpdateOrderStatus}
                            />
                        ))}
                    </div>
                </div>

                {/* columns end */}
            </div>

            {/* --- MOBILE: Tabbed List (Visible on small screens) --- */}
            <div className="mobile-summary mobile-only">
                <div className="mobile-tabs">
                    <button
                        className={`tab-btn ${activeMobileTab === 'NEW' ? 'active' : ''}`}
                        onClick={() => setActiveMobileTab('NEW')}
                    >
                        New ({newOrders.length})
                    </button>
                    <button
                        className={`tab-btn ${activeMobileTab === 'PREPARING' ? 'active' : ''}`}
                        onClick={() => setActiveMobileTab('PREPARING')}
                    >
                        Preparing ({preparingOrders.length})
                    </button>
                    <button
                        className={`tab-btn ${activeMobileTab === 'COMPLETED' ? 'active' : ''}`}
                        onClick={() => setActiveMobileTab('COMPLETED')}
                    >
                        Completed ({completedOrders.length})
                    </button>
                </div>

                <div className="mobile-orders-list">
                    {/* Conditionally render the list based on the active tab */}
                    {activeMobileTab === 'NEW' && newOrders.map(order => (
                        <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} />
                    ))}
                    {activeMobileTab === 'PREPARING' && preparingOrders.map(order => (
                        <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} />
                    ))}
                    {activeMobileTab === 'COMPLETED' && completedOrders.map(order => (
                        <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateOrderStatus} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KitchenHub;