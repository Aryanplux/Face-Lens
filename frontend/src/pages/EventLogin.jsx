import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/EventLogin.css';

const EventLogin = () => {
    const [eventName, setEventName] = useState('');
    const [password, setPassword] = useState('');
    const [theme, setTheme] = useState('light');
    const navigate = useNavigate();

    useEffect(() => {
        const savedTheme = localStorage.getItem('facelens-theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        // Add your API call to log in to an event here
        console.log('Logging in to event:', { eventName, password });
        // Redirect to the event photo gallery on successful login
        navigate(`/events/${eventName}`);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('facelens-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <div className={`event-login-container ${theme}`}>
            <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? (
                  <img src="https://img.icons8.com/ios-filled/24/1a2b4c/moon-symbol.png" alt="Moon icon" />
                ) : (
                  <img src="https://img.icons8.com/ios-filled/24/ffffff/sun--v1.png" alt="Sun icon" />
                )}
            </button>
            <form onSubmit={handleLogin} className="event-login-form">
                <h2>Event Login</h2>
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
                <button type="submit" className="event-login-button">Login</button>
            </form>
        </div>
    );
};

export default EventLogin;
