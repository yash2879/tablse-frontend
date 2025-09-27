import React from 'react'
import "./MenuItemCard.css"

function MenuItemCard(props) {

    const { name, price, description } = props.item;

    return (
    <div className="card menu-item-card">
        <div className="card-body"> {/* You can actually remove this div now if you want, padding is on the parent */}
            <h5 className="card-title">
                <span>{name}</span>
                <span>&#8377;{price.toFixed(2)}</span>
            </h5>
            <p className="card-text">{description || "No description available."}</p>
            {/* Use the new, specific class name */}
            <button className='add-to-cart-btn' onClick={() => props.onAddToCart(props.item)}>Add to Cart</button>
        </div>
    </div>
    )
}

export default MenuItemCard
