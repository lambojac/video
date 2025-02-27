// src/components/VideoAnnotation.js
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaHome, FaUserCircle, FaBell, FaArrowLeft } from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";
import './Annotation.scss';

const Annotation = () => {
  const { id } = useParams();
  
  const navigate = useNavigate();
  
  const [videoDetails, setVideoDetails] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [annotationText, setAnnotationText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const ctx = useRef(null);
  
  // Fetch video details from your API
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const response = await fetch(`http://localhost:2000/api/annotation/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch video details');
        }
        const data = await response.json();
        setVideoDetails(data);
        
        // If video already has annotations, load them
        if (data.annotations && data.annotations.length > 0) {
          setAnnotations(data.annotations);
        }
      } catch (error) {
        console.error('Error fetching video details:', error);
        setMessage('Could not load video details');
      }
    };
    
    fetchVideoDetails();
  }, [id]);
  
  // Initialize canvas context
  useEffect(() => {
    if (canvasRef.current) {
      ctx.current = canvasRef.current.getContext('2d');
    }
  }, [videoDetails]);
  
  // Update canvas with video frames and annotations
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !ctx.current) return;
    
    const updateCanvas = () => {
      if (!videoRef.current.paused && !videoRef.current.ended) {
        // Draw the current video frame
        ctx.current.drawImage(
          videoRef.current, 
          0, 
          0, 
          canvasRef.current.width, 
          canvasRef.current.height
        );
        
        // Draw all annotations
        annotations.forEach(anno => {
          // Only draw annotations that should be visible at the current time
          if (currentTime >= anno.startTime && currentTime <= anno.endTime) {
            ctx.current.font = '18px Arial';
            ctx.current.fillStyle = 'white';
            ctx.current.strokeStyle = 'black';
            ctx.current.lineWidth = 3;
            ctx.current.strokeText(anno.text, anno.x, anno.y);
            ctx.current.fillText(anno.text, anno.x, anno.y);
          }
        });
        
        requestAnimationFrame(updateCanvas);
      }
    };
    
    if (isPlaying) {
      updateCanvas();
    }
  }, [isPlaying, annotations, currentTime]);
  
  // Update current time when video time changes
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  // Handle canvas click to add annotation
  const handleCanvasClick = (e) => {
    if (!videoRef.current) return;
    
    // Pause the video when adding an annotation
    videoRef.current.pause();
    setIsPlaying(false);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Use annotation text or default
    const text = annotationText || 'Add annotation text';
    
    // Add the new annotation
    const newAnnotation = {
      id: Date.now(),
      x,
      y,
      text,
      startTime: currentTime,
      endTime: currentTime + 1, // Default 5 seconds duration
    };
    
    setAnnotations([...annotations, newAnnotation]);
    setAnnotationText('');
    
    // Draw the annotation immediately
    ctx.current.font = '18px Arial';
    ctx.current.fillStyle = 'white';
    ctx.current.strokeStyle = 'black';
    ctx.current.lineWidth = 3;
    ctx.current.strokeText(text, x, y);
    ctx.current.fillText(text, x, y);
  };
  
  // Handle play/pause
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  // Delete an annotation
  const deleteAnnotation = (id) => {
    setAnnotations(annotations.filter(anno => anno.id !== id));
  };
  
  // Save annotated video to your MongoDB and Cloudinary
  const saveAnnotatedVideo = async () => {
    if (!videoDetails || annotations.length === 0) {
      setMessage('Please add annotations first');
      return;
    }
    
    setIsSaving(true);
    setMessage('Processing video with annotations. This may take a while...');
    
    try {
      // Create the payload with video ID and annotations
      const payload = {
        id: id,
        annotations: annotations,
        title: videoDetails.title,
        originalUrl: videoDetails.url
      };
      
      // Send to server
      const response = await fetch('http://localhost:2000/api/annotation/annotate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        const result = await response.json();
        setMessage(`Video annotated successfully!`);
        
        // Redirect back to videos page after 2 seconds
        setTimeout(() => {
          navigate('/upload');
        }, 2000);
      } else {
        setMessage('Error saving annotations. Please try again.');
      }
    } catch (error) {
      console.error('Error saving annotations:', error);
      setMessage('Error saving annotations. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="annotation-page">
      <header>
        <div className="left">
          <button className="back-button" onClick={() => navigate('/uploads')}>
            <FaArrowLeft /> BACK
          </button>
        </div>
        <div className="right">
          <FaUserCircle className="icon" />
          <FaBell className="icon" />
          <FiHelpCircle className="icon" /> HELP
        </div>
      </header>

      <div className="annotation-container">
        <h1>Video Annotation</h1>
        
        {videoDetails ? (
          <>
            <h2>{videoDetails.title}</h2>
            
            <div className="annotation-input">
              <input
                type="text"
                value={annotationText}
                onChange={(e) => setAnnotationText(e.target.value)}
                placeholder="Enter annotation text"
                className="text-input"
              />
              <div className="instructions">
                Click on video to place annotation at current timestamp
              </div>
            </div>
            
            <div className="video-container">
              <video
                ref={videoRef}
                src={videoDetails.url}
                onTimeUpdate={handleTimeUpdate}
                style={{ display: 'none' }}
              />
              <canvas
                ref={canvasRef}
                width="640"
                height="360"
                onClick={handleCanvasClick}
                className="video-canvas"
              />
            </div>
            
            <div className="controls">
              <button onClick={togglePlayPause} className="control-button">
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <span className="time-display">
                Time: {currentTime.toFixed(2)}s
              </span>
              <button
                onClick={saveAnnotatedVideo}
                disabled={isSaving}
                className="save-button"
              >
                {isSaving ? 'Processing...' : 'Save Annotated Video'}
              </button>
            </div>
            
            {message && <div className="message">{message}</div>}
            
            <div className="annotations-list">
              <h3>Annotations</h3>
              {annotations.length === 0 ? (
                <p>No annotations yet</p>
              ) : (
                <ul>
                  {annotations.map((anno) => (
                    <li key={anno.id}>
                      "{anno.text}" at {anno.startTime.toFixed(2)}s - {anno.endTime.toFixed(2)}s
                      <button 
                        onClick={() => deleteAnnotation(anno.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <div className="loading">Loading video details...</div>
        )}
      </div>
    </div>
  );
};

export default Annotation;

scss
// src/components/Annotation.scss
.annotation-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
 
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
   
    .left {
      display: flex;
      align-items: center;
     
      .back-button {
        display: flex;
        align-items: center;
        background: none;
        border: none;
        color: #333;
        font-weight: bold;
        cursor: pointer;
       
        svg {
          margin-right: 8px;
        }
       
        &:hover {
          color: #000;
        }
      }
    }
   
    .right {
      display: flex;
      align-items: center;
     
      .icon {
        margin-left: 15px;
        font-size: 20px;
        cursor: pointer;
      }
    }
  }
}
.annotation-container {
  h1 {
    text-align: center;
    margin-bottom: 20px;
  }
 
  h2 {
    text-align: center;
    margin-bottom: 20px;
    font-size: 18px;
    color: #444;
  }
}
.annotation-input {
  margin-bottom: 10px;
 
  .text-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 5px;
  }
 
  .instructions {
    font-size: 14px;
    color: #666;
    margin-bottom: 15px;
  }
}
.video-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
 
  .video-canvas {
    border: 1px solid #000;
    background-color: #000;
    cursor: crosshair;
    max-width: 100%;
    position: relative;
  }
}
.controls {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  justify-content: center;
 
  .control-button, .save-button {
    padding: 10px 20px;
    margin: 0 10px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
   
    &:hover {
      background-color: #2980b9;
    }
   
    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }
 
  .save-button {
    background-color: #27ae60;
   
    &:hover {
      background-color: #219955;
    }
  }
 
  .time-display {
    margin: 0 15px;
    font-family: monospace;
    font-size: 16px;
    color: #333;
  }
}
.message {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
  color: #333;
  border: 1px solid #ddd;
}
.annotations-list {
  margin-top: 30px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
 
  h3 {
    margin-bottom: 15px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }
 
  ul {
    list-style-type: none;
    padding: 0;
  }
 
  li {
    padding: 12px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
   
    &:last-child {
      border-bottom: none;
    }
  }
 
  .delete-button {
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 5px 10px;
    cursor: pointer;
   
    &:hover {
      background-color: #c0392b;
    }
  }
}
.loading {
  text-align: center;
  padding: 30px;
  font-style: italic;
  color: #777;
}
// Additional styles for VideoUpload.scss
.video-card {
  position: relative;
 
  .annotate-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 5px 10px;
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
   
    svg {
      font-size: 12px;
    }
   
    &:hover {
      background-color: rgba(0, 0, 0, 0.9);
    }
  }
}

// New styles for oval annotations
.oval-annotation {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  border: 2px solid white;
  cursor: move;
  pointer-events: all;
  font-size: 14px;
  text-align: center;
}

.annotation-arrow {
  position: absolute;
  background: transparent;
  pointer-events: all;
  cursor: pointer;
  
  &-handle {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: white;
    border-radius: 50%;
    cursor: move;
  }
}