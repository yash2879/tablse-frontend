import React from 'react'
import "./MenuItemCard.css"

function MenuItemCard({ item, onAddToCart, isDisabled }) {

    const { name, price, description, imageUrl } = item;

    return (
        // 2. Add a conditional class to the main card for styling disabled state
        <div className={`menu-item-card ${isDisabled ? 'disabled' : ''}`}>
            <div className="card-body">
                {imageUrl && (
                    <div className="card-image-container">
                        <img src={imageUrl} alt={name} className="card-image" />
                    </div>
                )}
                <h5 className="card-title">
                    <span>{name}</span>
                    <span>₹{price.toFixed(2)}</span>
                </h5>
                <p className="card-text">{description || "No description available."}</p>
                <button
                    className='add-to-cart-btn'
                    onClick={() => onAddToCart(item)}
                    // 3. Apply the disabled attribute to the button
                    disabled={isDisabled}
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
}

export default MenuItemCard
