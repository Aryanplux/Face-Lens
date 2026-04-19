import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UploadPage.css';

const UploadPage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    }
  };

  const handleChange = function(e) {
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles) => {
    setMessage('');
    
    // Check if zip
    if (newFiles.length === 1 && newFiles[0].name.toLowerCase().endsWith('.zip')) {
        setFiles([newFiles[0]]);
        return;
    }

    // Otherwise expect images
    const validFiles = newFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (validFiles.length !== newFiles.length) {
        setMessage('Only images or a single .zip file are allowed.');
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setProgress(0);
    setMessage('');

    const isZip = files.length === 1 && files[0].name.toLowerCase().endsWith('.zip');
    
    const formData = new FormData();
    if (isZip) {
        formData.append('file', files[0]);
    } else {
        files.forEach(file => {
            formData.append('files', file);
        });
    }

    try {
      const endpoint = isZip ? '/api/photos/upload-zip' : '/api/photos/upload';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:9090${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
          const errorMsg = await response.text();
          throw new Error(errorMsg || 'Upload failed');
      }

      setProgress(100);
      setMessage('Upload successful! ML Processing will begin shortly.');
      
      // Navigate to dashboard or gallery after a delay
      setTimeout(() => navigate('/dashboard'), 2000);
      
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h2>Upload Photos</h2>
        <p>Drag & drop images, or upload a .zip file to get started.</p>
        <button className="back-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>

      <div 
        className={`drop-zone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input 
          ref={inputRef}
          type="file" 
          multiple 
          accept="image/*,.zip"
          onChange={handleChange} 
          style={{display: 'none'}} 
        />
        <div className="drop-zone-content">
          <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <p>Click or drag files here to upload</p>
          <span className="upload-hint">Supports JPEG, PNG, and ZIP</span>
        </div>
      </div>

      {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
          </div>
      )}

      {files.length > 0 && (
        <div className="file-preview-container">
          <h3>Selected Files ({files.length})</h3>
          <ul className="file-list">
            {files.map((file, idx) => (
              <li key={`${file.name}-${idx}`} className="file-item">
                <span className="file-name">{file.name}</span>
                {!isUploading && (
                  <button className="remove-btn" onClick={() => removeFile(idx)}>✕</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isUploading && (
          <div className="progress-container">
              <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${progress}%`}}></div>
              </div>
              <p>Uploading... Please wait.</p>
          </div>
      )}

      <button 
        className="upload-submit-btn" 
        onClick={uploadFiles}
        disabled={files.length === 0 || isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload Files'}
      </button>

    </div>
  );
};

export default UploadPage;
