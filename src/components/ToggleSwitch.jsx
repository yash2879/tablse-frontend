// src/components/ToggleSwitch.jsx
import React from 'react';
import './ToggleSwitch.css';

const ToggleSwitch = ({ checked, onChange }) => {
    return (
        <label className="switch">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="slider"></span>
        </label>
    );
};

export default ToggleSwitch;