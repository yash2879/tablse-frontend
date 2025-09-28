// src/App.jsx

import React, { useState, useEffect, use } from 'react';
import MenuItemCard from './components/MenuItemCard';
import Cart from './components/Cart';
import Notification from './components/Notification';
import './App.css';

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        // NOTE: Make sure this URL is correct for your setup
        const response = await fetch('http://localhost:8080/api/menu/1'); // Using restaurantId 1 for now
        if (!response.ok) {
          throw new Error('Data could not be fetched!');
        }
        const data = await response.json();
        setMenuItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenuItems();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAddToCart = (itemToAdd) => {
    const existingItem = cart.find(item => item.id === itemToAdd.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...itemToAdd, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
    console.log(`Removed item with id: ${itemId}`);
  };

  const handleIncrementItem = (itemId) => {
    setCart(cart.map(item =>
      item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const handleDecrementItem = (itemId) => {
    setCart(cart.map(item =>
      item.id === itemId ? { ...item, quantity: Math.max(item.quantity - 1, 1) } : item
    ));
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setNotification({message: "Your cart is empty!", type: "error"});
      return;
    }
    const orderPayload = {
      restaurantId: 1, // Hardcoded for now
      tableNumber: "A1", // Hardcoded for now
      items: cart.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity
      }))
    };
    try {
      const response = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });
      if (!response.ok) {
        throw new Error('Order could not be placed!');
      }
      const data = await response.json();
      setNotification({message: "Order placed successfully!", type: "success"});
      setCart([]); // Clear cart after successful order
    } catch (error) {
      setNotification({message: error.message, type: "error"});
    }
  }

  const clearNotification = () => {
    setNotification(null);
  };

  return (
    <>
    <div className="notification-container">
    {notification && 
      <Notification 
        notification={notification} 
        onClose={clearNotification} 
      />
    }
    </div> 

    <div className="app-container">
      <div className="main-content">
        <h1 className="menu-title">Our Menu</h1>
        
        {/* CORRECTED CONDITIONAL RENDERING */}
        {isLoading && <p className="loading-message">Loading menu...</p>}
        
        {error && <p className="error-message">{error}</p>}
        
        {!isLoading && !error && (
          <div className="menu-list">
            {menuItems.map(item => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="sidebar-content">
        <Cart cartItems={cart}
          onRemoveItem={handleRemoveItem}
          onIncrementItem={handleIncrementItem}
          onDecrementItem={handleDecrementItem}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>
    </div>
    </>
  );
}

export default App;