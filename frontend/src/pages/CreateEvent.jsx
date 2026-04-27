import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateEvent.css';

const CreateEvent = () => {
    const [eventName, setEventName] = useState('');
    const [password, setPassword] = useState('');
    const [description, setDescription] = useState('');
    const [theme, setTheme] = useState('light');
    const navigate = useNavigate();

    useEffect(() => {
        const savedTheme = localStorage.getItem('facelens-theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:9090/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: eventName, password, description })
            });

            if (response.ok) {
                const event = await response.json();
                console.log('Created event:', event);
                // Redirect directly to the upload page for this new event
                navigate(`/upload?eventId=${event.id}`);
            } else {
                const text = await response.text();
                alert(`Failed to create event: ${text}`);
            }
        } catch (error) {
            console.error('Error creating event:', error);
            alert('An error occurred while creating the event.');
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('facelens-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <div className={`create-event-container ${theme}`}>
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
                <div className="input-group">
                    <label htmlFor="description">Event Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a hint, venue, or any special thing..."
                        rows="3"
                    />
                </div>
                <button type="submit" className="create-event-button">Create Event</button>
            </form>
        </div>
    );
};

export default CreateEvent;
