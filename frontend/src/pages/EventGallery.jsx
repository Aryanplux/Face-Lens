import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/EventGallery.css';

const EventGallery = () => {
    const { eventName } = useParams();
    const [eventData, setEventData] = useState({ description: '', photos: [], lastUpdated: null });
    const [theme, setTheme] = useState('light');
    const [displayedPhotos, setDisplayedPhotos] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    
    // Camera state
    const [cameraActive, setCameraActive] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

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
                    const photos = data.photos || data.photoUrls || [];
                    setEventData({
                        id: data.id,
                        description: data.description,
                        photos: photos,
                        lastUpdated: data.lastUpdated
                    });
                    // Don't show photos automatically until searched
                    // setDisplayedPhotos(photos);
                } else {
                    console.error("Failed to fetch event data. Status:", response.status);
                }
            } catch (error) {
                console.error("Failed to fetch event data", error);
            }
        };

        fetchEventData();
    }, [eventName]);

    const handleFaceSearch = async (file) => {
        if (!file || !eventData.id) return;
        setIsSearching(true);
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            
            const response = await fetch(`http://localhost:9090/api/photos/search-face?eventId=${eventData.id}`, {
                method: 'POST',
                headers,
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                
                let matchedPhotos = [];
                let closestDistance = null;
                
                // Handle the new response format with distances
                if (result && typeof result === 'object' && result.matchedPhotos !== undefined) {
                    matchedPhotos = result.matchedPhotos;
                    closestDistance = result.closest_match_distance;
                } else if (Array.isArray(result)) {
                    // Fallback for old API format
                    matchedPhotos = result;
                }
                
                console.log(`[Face Search Diagnostics] Closest Match Distance: ${closestDistance}`);

                setDisplayedPhotos(matchedPhotos);
                setHasSearched(true);
                if (matchedPhotos.length === 0) {
                    alert(`No matching photos found.\nClosest Match Distance: ${closestDistance}`);
                }
            } else {
                const contentType = response.headers.get("content-type");
                let errorData = "Try again.";
                if (contentType && contentType.includes("application/json")) {
                    const errorJson = await response.json();
                    errorData = errorJson.message || JSON.stringify(errorJson);
                } else {
                    errorData = await response.text();
                }
                alert(`Failed to search photos. Server says: ${errorData}`);
            }
        } catch (err) {
            console.error(err);
            alert("Error connecting to search service");
        } finally {
            setIsSearching(false);
        }
    };

    const startCamera = async () => {
        setCameraActive(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            alert("Unable to access camera");
            setCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        setCameraActive(false);
    };

    const captureAndSearch = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            
            canvasRef.current.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                    stopCamera();
                    handleFaceSearch(file);
                }
            }, 'image/jpeg');
        }
    };

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

                <div className="face-search-section">
                    {!cameraActive && !hasSearched && (
                        <>
                            <button 
                              className="search-face-btn" 
                              onClick={startCamera}
                              disabled={isSearching}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {isSearching ? 'Scanning...' : 'Scan Face'}
                            </button>
                            <p className="search-hint">Take a selfie to find all your photos.</p>
                        </>
                    )}

                    {cameraActive && (
                        <div className="camera-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
                            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '400px', borderRadius: '12px' }}></video>
                            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                <button className="capture-btn" onClick={captureAndSearch} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--primary-color)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                                    Take Photo & Search
                                </button>
                                <button className="cancel-btn" onClick={stopCamera} style={{ padding: '10px 20px', borderRadius: '8px', background: 'grey', color: '#fff', border: 'none', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {hasSearched && (
                        <div style={{ marginTop: '20px' }}>
                            <h2 style={{ marginBottom: '10px' }}>Found {displayedPhotos.length} photos of you</h2>
                            <button className="search-again-btn" onClick={() => setHasSearched(false)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', color: 'var(--text-color)', border: '1px solid var(--primary-color)', cursor: 'pointer' }}>
                                Search Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {hasSearched && (
                <div className="photo-grid">
                    {displayedPhotos.map((photo, index) => (
                        <div key={index} className="photo-card">
                            <img src={`http://localhost:9090/uploads/${photo.thumbnailPath || photo.filePath}`} alt={photo.filename} loading="lazy" />
                            <div className="photo-actions">
                                <a href={`http://localhost:9090/uploads/${photo.filePath}`} download className="download-btn">
                                    Download
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventGallery;
