import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlay, FaPause, FaSync } from "react-icons/fa";
import './VideoComparison.scss';

const VideoComparison = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [videoDetails, setVideoDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  // References to both video elements
  const originalVideoRef = useRef(null);
  const annotatedVideoRef = useRef(null);
  
  // Fetch video details on component mount
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/annotation/${id}/comparison`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch video details');
        }
        
        const data = await response.json();
        setVideoDetails(data);
      } catch (error) {
        console.error('Error fetching video details:', error);
        setError('Could not load video comparison. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideoDetails();
  }, [id]);
  
  // Synchronize both videos when playing/pausing
  const togglePlayPause = () => {
    if (!originalVideoRef.current || !annotatedVideoRef.current) return;
    
    if (isPlaying) {
      originalVideoRef.current.pause();
      annotatedVideoRef.current.pause();
    } else {
      originalVideoRef.current.play();
      annotatedVideoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Handle time update for video synchronization
  const handleTimeUpdate = (e) => {
    const newTime = e.target.currentTime;
    setCurrentTime(newTime);
    
    // Sync the other video if time difference is more than 0.5 seconds
    if (e.target === originalVideoRef.current && annotatedVideoRef.current) {
      if (Math.abs(annotatedVideoRef.current.currentTime - newTime) > 0.5) {
        annotatedVideoRef.current.currentTime = newTime;
      }
    } else if (e.target === annotatedVideoRef.current && originalVideoRef.current) {
      if (Math.abs(originalVideoRef.current.currentTime - newTime) > 0.5) {
        originalVideoRef.current.currentTime = newTime;
      }
    }
  };
  
  // Sync videos to the same time
  const syncVideos = () => {
    if (!originalVideoRef.current || !annotatedVideoRef.current) return;
    
    // Use the original video's time as the source of truth
    const time = originalVideoRef.current.currentTime;
    annotatedVideoRef.current.currentTime = time;
    setCurrentTime(time);
  };
  
  // Reset both videos to the beginning
  const resetVideos = () => {
    if (!originalVideoRef.current || !annotatedVideoRef.current) return;
    
    originalVideoRef.current.currentTime = 0;
    annotatedVideoRef.current.currentTime = 0;
    setCurrentTime(0);
    
    // Pause videos if they were playing
    if (isPlaying) {
      originalVideoRef.current.pause();
      annotatedVideoRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  // When one video ends, pause the other
  const handleVideoEnd = () => {
    if (isPlaying) {
      if (originalVideoRef.current) originalVideoRef.current.pause();
      if (annotatedVideoRef.current) annotatedVideoRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  // Go back to previous page
  const goBack = () => {
    navigate('/uploads');
  };
  
  if (loading) {
    return (
      <div className="video-comparison loading">
        <div className="spinner"></div>
        <p>Loading video comparison...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="video-comparison error">
        <p>{error}</p>
        <button onClick={goBack}>Go Back</button>
      </div>
    );
  }
  
  return (
    <div className="video-comparison-page">
      <header>
        <button className="back-button" onClick={goBack}>
          <FaArrowLeft /> Back
        </button>
        <h1>Video Comparison</h1>
      </header>
      
      {videoDetails && (
        <div className="content">
          <h2>{videoDetails.title}</h2>
          <div className="video-ids">
            <p><strong>Original ID:</strong> {videoDetails.originalId}</p>
            <p><strong>Annotated ID:</strong> {videoDetails.annotatedId}</p>
          </div>
          
          <div className="videos-container">
            <div className="video-panel">
              <h3>Original Video</h3>
              <video
                ref={originalVideoRef}
                src={videoDetails.originalUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnd}
                controls
              />
            </div>
            
            <div className="video-panel">
              <h3>Annotated Video</h3>
              <video
                ref={annotatedVideoRef}
                src={videoDetails.annotatedUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnd}
                controls
              />
            </div>
          </div>
          
          <div className="controls">
            <button className="control-button" onClick={togglePlayPause}>
              {isPlaying ? <FaPause /> : <FaPlay />} {isPlaying ? 'Pause' : 'Play'} Both
            </button>
            
            <button className="control-button" onClick={syncVideos}>
              <FaSync /> Sync Videos
            </button>
            
            <button className="control-button" onClick={resetVideos}>
              Reset
            </button>
            
            <div className="time-display">
              Time: {currentTime.toFixed(2)}s
            </div>
          </div>

          {videoDetails.annotations && videoDetails.annotations.length > 0 && (
            <div className="annotations-list">
              <h3>Annotations</h3>
              <ul>
                {videoDetails.annotations.map((annotation, index) => (
                  <li key={index}>
                    <p><strong>Text:</strong> {annotation.text}</p>
                    <p><strong>Time:</strong> {annotation.startTime.toFixed(2)}s - {annotation.endTime.toFixed(2)}s</p>
                    {annotation.highlight && (
                      <p><strong>Highlight:</strong> {annotation.highlight}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoComparison;