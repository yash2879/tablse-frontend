// src/components/OrderCard.jsx

import React from 'react';
import useTimeAgo from '../hooks/useTimeAgo';
import './OrderCard.css';

const OrderCard = ({ order, onUpdateStatus }) => {
    const timeAgo = useTimeAgo(order.orderTime);

    return (
        <div className={`order-card status-${order.status.toLowerCase()}`}>
            {/* Header with Table Number and Time */}
            <div className="order-card-header">
                <h3 className="table-number">Table: {order.tableNumber}</h3>
                <span className="time-ago">{timeAgo}</span>
            </div>

            <ul className="order-item-list">
                {order.items?.map((item, index) => (
                    <li key={index}>
                        <span className="item-quantity">{item.quantity}x</span>
                        <span className="item-name">{item.menuItemName}</span>
                    </li>
                ))}
            </ul>

            {/* Action Buttons */}
            <div className="order-card-actions">
                {order.status === 'NEW' && (
                    <button
                        className="action-button status-preparing"
                        onClick={() => onUpdateStatus(order.id, 'PREPARING')}
                    >
                        Mark as Preparing
                    </button>
                )}
                {order.status === 'PREPARING' && (
                    <button
                        className="action-button status-completed"
                        onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
                    >
                        Mark as Completed
                    </button>
                )}
                {order.status === 'COMPLETED' && (
                    <button
                        className="action-button status-archived"
                        onClick={() => onUpdateStatus(order.id, 'ARCHIVED')}
                    >
                        Dismiss
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderCard;