// src/hooks/useTimeAgo.js

import { useState, useEffect } from 'react';

// A helper function to calculate the time difference string
const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
};

// The custom hook
const useTimeAgo = (timestamp) => {
    const [timeAgo, setTimeAgo] = useState(() => formatTimeAgo(new Date(timestamp)));

    useEffect(() => {
        const date = new Date(timestamp);
        // Set up an interval to update the time every 30 seconds
        const intervalId = setInterval(() => {
            setTimeAgo(formatTimeAgo(date));
        }, 30000); // Update every 30 seconds

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [timestamp]); // Rerun the effect if the timestamp changes

    return timeAgo;
};

export default useTimeAgo;