import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/EventGallery.css';

const EventGallery = () => {
    const { eventName } = useParams();
    const [eventData, setEventData] = useState({ description: '', photos: [], lastUpdated: null });
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('facelens-theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);

        const fetchEventData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = {};
                // if (token) headers['Authorization'] = `Bearer ${token}`;

                console.log(`Fetching event data for ${eventName}...`);
                const response = await fetch(`http://localhost:9090/api/events/${eventName}`, { headers });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log("Event Data fetched:", data);
                    setEventData({
                        description: data.description,
                        photos: data.photoUrls || [],
                        lastUpdated: data.lastUpdated
                    });
                } else {
                    console.error("Failed to fetch event data. Status:", response.status);
                }
            } catch (error) {
                console.error("Failed to fetch event data", error);
            }
        };

        fetchEventData();
    }, [eventName]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('facelens-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const getLastUpdatedStr = () => {
        const localTime = localStorage.getItem('lastUploadTime');
        const timeToUse = localTime || eventData.lastUpdated;
        if (!timeToUse) return 'Never';
        return new Date(timeToUse).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    return (
        <div className={`event-gallery-container ${theme}`}>
            <div className="event-gallery-hero">
                <h1 className="event-title">{eventName}</h1>
                <p className="event-description">
                    {eventData.description || "No description provided for this event."}
                </p>
                <div className="event-big-stats">
                    <div className="stat-card">
                        <span className="stat-value">{getLastUpdatedStr()}</span>
                        <span className="stat-label">Last Updated</span>
                    </div>
                </div>
                
                <button 
                  className="search-face-btn" 
                  onClick={() => alert('Starting OpenCV python face scanner...')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4h6m-6 4h6m-6 4h6M4 4h6m-6 4h6m-6 4h6M4 16h16M4 20h16" />
                    </svg>
                    Search your photos
                </button>
                <p className="search-hint">Our AI will scan your face and securely find all your photos.</p>
            </div>
        </div>
    );
};

export default EventGallery;
