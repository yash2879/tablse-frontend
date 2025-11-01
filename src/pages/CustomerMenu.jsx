import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import MenuItemCard from '../components/MenuItemCard';
import Cart from '../components/Cart';
import Notification from '../components/Notification';
import { Client } from "@stomp/stompjs"; // Import the STOMP client
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode
import { getMenuItems, authenticateTableSession, addItemToOrder, removeItemFromOrder } from '../services/apiClient'; 
import './CustomerMenu.css';

function CustomerMenu() {
    // --- STATE MANAGEMENT ---
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState([]); // This will now be controlled by the WebSocket
    
    // New state for session management
    const [isSessionAuthenticated, setIsSessionAuthenticated] = useState(false);
    const [sessionToken, setSessionToken] = useState(null);

    // Standard UI states
    const [isLoadingMenu, setIsLoadingMenu] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // --- HOOKS for getting URL info ---
    const { restaurantId } = useParams(); // Gets 'restaurantId' from the path /menu/:restaurantId/...
    const [searchParams] = useSearchParams(); // Hook to get query parameters like '?otp=123456'

    const clientRef = useRef(null);
    
    // --- CORE AUTHENTICATION AND DATA FETCHING EFFECT ---
    useEffect(() => {
        // This function runs once when the component mounts
        const initializeSessionAndMenu = async () => {
            setIsLoadingMenu(true);
            setError(null);
            
            try {
                // Step 1: Always fetch the public menu. This can happen in parallel.
                const menuDataPromise = getMenuItems(restaurantId);

                // Step 2: Check for OTP/PIN in the URL and try to authenticate the session.
                const tableId = searchParams.get('table');
                const otp = searchParams.get('otp'); // or 'pin' depending on your URL structure

                if (tableId && otp) {
                    try {
                        const authResponse = await authenticateTableSession(tableId, otp);
                        // If authentication is successful:
                        localStorage.setItem('sessionToken', authResponse.sessionToken);
                        setSessionToken(authResponse.sessionToken);
                        setCart(authResponse.currentOrder.items || []); // Set initial cart state
                        setIsSessionAuthenticated(true);
                        console.log("Session authenticated successfully!");
                    } catch (authError) {
                        // If authentication fails:
                        console.error("Session authentication failed:", authError);
                        setError("QR Code is invalid or expired. Ordering is disabled.");
                        setIsSessionAuthenticated(false);
                    }
                } else {
                    // If no OTP is present in the URL:
                    setError("No valid QR code detected. Ordering is disabled.");
                    setIsSessionAuthenticated(false);
                }

                // Wait for the menu data to finish fetching and set it
                const menuData = await menuDataPromise;
                setMenuItems(menuData);

            } catch (err) {
                // This catches errors from the menu fetch
                setError('Could not load the menu. Please try refreshing.');
            } finally {
                setIsLoadingMenu(false);
            }
        };

        if (restaurantId) {
            initializeSessionAndMenu();
        }
    }, [restaurantId, searchParams]); // Effect depends on these values from the URL

    // --- WebSocket Effect (for real-time cart updates) ---
    useEffect(() => {
        if (!sessionToken) return;

        // Decode the session token to get the session ID
        try {
            const decodedToken = jwtDecode(sessionToken);
            setSessionId(decodedToken.sessionId); // Assuming the payload has sessionId
        } catch (error) {
            console.error("Invalid session token:", error);
            setError("Session is invalid. Ordering is disabled.");
            return;
        }

        const onConnect = (id) => {
            console.log("WebSocket Connected!");
            const topic = `/topic/sessions/${id}`;
            clientRef.current.subscribe(topic, (message) => {
                if (message.body) {
                    const updatedOrder = JSON.parse(message.body);
                    // Replace the entire cart state with the live data from the server
                    setCart(updatedOrder.items || []);
                }
            });
        };

        const onError = (error) => {
            console.error("WebSocket Error:", error);
            setNotification({ message: 'Live connection lost. Please refresh.', type: 'error' });
        };

        // Create and activate the client
        if (!clientRef.current) {
            const decoded = jwtDecode(sessionToken);
            const id = decoded.sessionId;

            const client = new Client({
                brokerURL: import.meta.env.VITE_WEBSOCKET_URL,
                reconnectDelay: 5000,
                onConnect: () => onConnect(id),
                onStompError: onError,
            });
            clientRef.current = client;
            client.activate();
        }

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, [sessionToken]); // This effect depends on the sessionToken.


    // --- EVENT HANDLERS (will be updated to use WebSockets) ---
    const handleAddToCart = async (itemToAdd) => {
        if (!isSessionAuthenticated || !sessionId) {
            setNotification({ message: 'Please scan a valid QR code to enable ordering.', type: 'error' });
            return;
        }
        try {
            await addItemToOrder(sessionId, itemToAdd.id, 1);
            setNotification({ message: `${itemToAdd.name} added to order!`, type: 'success' });
        } catch (err) {
            setNotification({ message: `Error: ${err.message}`, type: 'error' });
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await removeItemFromOrder(sessionId, itemId);
            setNotification({ message: `Item removed.`, type: 'success' });
        } catch (err) {
            setNotification({ message: `Error: ${err.message}`, type: 'error' });
        }
    };

    // According to the API, incrementing is the same as adding.
    const handleIncrementItem = async (itemId) => {
        try {
            await addItemToOrder(sessionId, itemId, 1);
        } catch (err) {
            setNotification({ message: `Error: ${err.message}`, type: 'error' });
        }
    };

    // The API doesn't have a decrement endpoint, so this will remove the item completely.
    const handleDecrementItem = async (itemId) => {
        // This is a design choice based on the API. To fully remove one-by-one,
        // the backend would need a different endpoint.
        // For now, we remove the whole item stack.
        await handleRemoveItem(itemId);
    };
    
    // Notification auto-clear effect
    useEffect(() => {
        // If there's a notification, set a timer to clear it
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null); // Clear the notification after 3 seconds
            }, 3000);

            // Cleanup function: If the component unmounts or if a new notification
            // is set, clear the previous timer to prevent it from firing.
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // --- DERIVED STATE (calculations for UI) ---
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const clearNotification = () => setNotification(null);


    // --- RENDER LOGIC ---
    return (
        <>
            <div className="notification-container">
                {notification && <Notification notification={notification} onClose={clearNotification} />}
            </div> 

            <div className="customer-menu-container">
                {/* The header now shows the error state clearly */}
                <h1 className="menu-title">Our Menu</h1>
                {error && <p className="session-error-message">{error}</p>}
                
                {isLoadingMenu && <p className="loading-message">Loading...</p>}

                {!isLoadingMenu && (
                    <div className="menu-list">
                        {menuItems.map(item => (
                            <MenuItemCard
                                key={item.id}
                                item={item}
                                onAddToCart={handleAddToCart}
                                // Pass down the disabled state to the card
                                isDisabled={!isSessionAuthenticated} 
                            />
                        ))}
                    </div>
                )}
            </div>
      
            {/* The modal and FAB are now controlled by the session status */}
            {isSessionAuthenticated && isCartOpen && (
                <div className="cart-modal-overlay" onClick={() => setIsCartOpen(false)}>
                    <div className="cart-modal-content" onClick={e => e.stopPropagation()}>
                        <Cart 
                            cartItems={cart} 
                            onRemoveItem={handleRemoveItem}
                            onIncrementItem={handleIncrementItem}
                            onDecrementItem={handleDecrementItem}
                        />
                    </div>
                </div>
            )}

            {isSessionAuthenticated && cart.length > 0 && (
                <div className="cart-footer-fab" onClick={() => setIsCartOpen(true)}>
                    <div className="cart-summary">
                        <span>{totalItems} item{totalItems > 1 ? 's' : ''}</span>
                        <span>Total: ₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="view-cart-action">View Cart</div>
                </div>
            )}
        </>
    );
}

export default CustomerMenu;