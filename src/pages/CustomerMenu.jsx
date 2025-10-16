import React, { useState, useEffect } from 'react';
import MenuItemCard from '../components/MenuItemCard';
import Cart from '../components/Cart';
import Notification from '../components/Notification';
import { getMenuItems, placeOrder } from '../services/apiClient';
import './CustomerMenu.css';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';

function CustomerMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState(null);
  const params = useParams();
  const restaurantId = params.restaurantId;
  const tableNumber = params.tableNumber;

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const data = await getMenuItems(restaurantId);
        setMenuItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (restaurantId) {
      fetchMenuItems();
    }
  }, [restaurantId]);

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
      restaurantId: restaurantId,
      tableNumber: tableNumber,
      items: cart.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity
      }))
    };
    
    try {
      await placeOrder(orderPayload);
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

export default CustomerMenu;