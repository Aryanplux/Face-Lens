import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/EventGallery.css';

const EventGallery = () => {
    const { eventName } = useParams();
    const [photos, setPhotos] = useState([]);
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('facelens-theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Fetch photos for the event
        // Replace with your actual API call
        const fetchPhotos = async () => {
            console.log(`Fetching photos for event: ${eventName}`);
            // Mock data
            const mockPhotos = [
                { id: 1, url: 'https://via.placeholder.com/300' },
                { id: 2, url: 'https://via.placeholder.com/300' },
                { id: 3, url: 'https://via.placeholder.com/300' },
                { id: 4, url: 'https://via.placeholder.com/300' },
            ];
            setPhotos(mockPhotos);
        };

        fetchPhotos();
    }, [eventName]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('facelens-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <div className={`event-gallery-container ${theme}`}>
            <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? (
                  <img src="https://img.icons8.com/ios-filled/24/1a2b4c/moon-symbol.png" alt="Moon icon" />
                ) : (
                  <img src="https://img.icons8.com/ios-filled/24/ffffff/sun--v1.png" alt="Sun icon" />
                )}
            </button>
            <header className="event-gallery-header">
                <h1>{eventName}</h1>
            </header>
            <div className="photo-grid">
                {photos.map(photo => (
                    <div key={photo.id} className="photo-item">
                        <img src={photo.url} alt={`Photo ${photo.id}`} />
                        <a href={photo.url} download className="download-button">Download</a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventGallery;
