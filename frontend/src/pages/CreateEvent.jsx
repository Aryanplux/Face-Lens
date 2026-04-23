import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateEvent.css';

const CreateEvent = () => {
    const [eventName, setEventName] = useState('');
    const [password, setPassword] = useState('');
    const [theme, setTheme] = useState('light');
    const navigate = useNavigate();

    useEffect(() => {
        const savedTheme = localStorage.getItem('facelens-theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        // Add your API call to create an event here
        console.log('Creating event:', { eventName, password });
        // Redirect to the event dashboard or login page after creation
        navigate('/events/login');
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('facelens-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <div className={`create-event-container ${theme}`}>
            <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? (
                  <img src="https://img.icons8.com/ios-filled/24/1a2b4c/moon-symbol.png" alt="Moon icon" />
                ) : (
                  <img src="https://img.icons8.com/ios-filled/24/ffffff/sun--v1.png" alt="Sun icon" />
                )}
            </button>
            <form onSubmit={handleCreateEvent} className="create-event-form">
                <h2>Create New Event</h2>
                <div className="input-group">
                    <label htmlFor="eventName">Event Name</label>
                    <input
                        type="text"
                        id="eventName"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="create-event-button">Create Event</button>
            </form>
        </div>
    );
};

export default CreateEvent;
