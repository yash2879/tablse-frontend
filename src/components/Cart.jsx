import React from 'react'
import "./Cart.css"

function Cart({cartItems, onRemoveItem, onIncrementItem, onDecrementItem, onPlaceOrder}) {

    // Calculate the total price and total number of items
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);



    return (
        <div className='cart-container'>
        <h2>Your Cart has {totalItems} items</h2>
        {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
        ) : (
            <> 
            <ul className="cart-items-list">
                {cartItems.map(item => (
                    <li key={item.id} className="cart-item">
                        <span className="item-name">{item.name}</span>
                        <div className="item-controls">
                            <button className="decrement-btn" onClick={() => onDecrementItem(item.id)}>-</button>
                            <span className="item-quantity">{item.quantity}</span>
                            <button className="increment-btn" onClick={() => onIncrementItem(item.id)}>+</button>
                        </div>
                        <span className="item-subtotal">₹{(item.price * item.quantity).toFixed(2)}</span>
                        <button className="remove-btn" onClick={() => onRemoveItem(item.id)}>Remove</button>
                    </li>
                ))}
            </ul>
            <hr />
            <div className="cart-total">
                <strong>Total: ₹{totalPrice.toFixed(2)}</strong>
            </div>
            <button className="place-order-btn" onClick={onPlaceOrder}>Place Order</button>
            </>
        )}
        </div>
    )
}

export default Cart
