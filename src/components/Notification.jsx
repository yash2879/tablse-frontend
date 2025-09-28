import React from 'react'
import "./Notification.css"

const Notification = ({ notification, onClose }) => {
  const { message, type } = notification;
  return (
    <div className={`notification ${type}`}>
      {message}
      <button className="close-button" onClick={onClose}>&times;</button>
    </div>
  )
}

export default Notification
