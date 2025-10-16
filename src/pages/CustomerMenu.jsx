import React, { useState, useEffect } from 'react';
import MenuItemCard from '../components/MenuItemCard';
import Cart from '../components/Cart';
import Notification from '../components/Notification';
import { getMenuItems, placeOrder } from '../services/apiClient';
import './CustomerMenu.css';
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

  const [isCartOpen, setIsCartOpen] = useState(false);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

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
      setNotification({ message: "Your cart is empty!", type: "error" });
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
      setNotification({ message: "Order placed successfully!", type: "success" });
      setCart([]); // Clear cart after successful order
    } catch (error) {
      setNotification({ message: error.message, type: "error" });
    }
  }

  const clearNotification = () => {
    setNotification(null);
  };

  return (
    <>
      <div className="notification-container">
        {notification && <Notification notification={notification} onClose={clearNotification} />}
      </div>

      {/* This is now a single column container */}
      <div className="customer-menu-container">
        <h1 className="menu-title">Our Menu</h1>
        <p className="table-info">Table: <strong>{tableNumber}</strong></p>

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

      {/* --- NEW: Cart Modal --- */}
      {/* This modal will only be visible when isCartOpen is true */}
      {isCartOpen && (
        <div className="cart-modal-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-modal-content" onClick={e => e.stopPropagation()}>
            <Cart
              cartItems={cart}
              onRemoveItem={handleRemoveItem}
              onIncrementItem={handleIncrementItem}
              onDecrementItem={handleDecrementItem}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        </div>
      )}

      {/* --- NEW: Sticky Cart Footer/FAB --- */}
      {/* This button is only shown if there are items in the cart */}
      {cart.length > 0 && (
        <div className="cart-footer-fab" onClick={() => setIsCartOpen(true)}>
          <div className="cart-summary">
            <span>{totalItems} item{totalItems > 1 ? 's' : ''}</span>
            <span>Total: ₹{totalPrice.toFixed(2)}</span>
          </div>
          <div className="view-cart-action">
            View Cart
          </div>
        </div>
      )}
    </>
  );
}

export default CustomerMenu;