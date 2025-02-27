import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaHome, FaUserCircle, FaBell, FaArrowLeft, FaPlus, FaMinus } from "react-icons/fa";
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
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [arrowStartPoint, setArrowStartPoint] = useState(null);
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [fontSize, setFontSize] = useState(14); // Added font size state with default
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const ctx = useRef(null);
  
  // Fetch video details from your API
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const response = await fetch(`https://video-g4h9.onrender.com/api/annotation/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch video details');
        }
        const data = await response.json();
        setVideoDetails(data);
        
        // If video already has annotations, load them
        if (data.annotations && data.annotations.length > 0) {
          setAnnotations(data.annotations.map(anno => ({
            ...anno,
            arrowStart: anno.arrowStart || { x: anno.x - 100, y: anno.y },
            arrowEnd: anno.arrowEnd || { x: anno.x, y: anno.y }
          })));
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
        renderFrame();
        requestAnimationFrame(updateCanvas);
      }
    };
    
    if (isPlaying) {
      updateCanvas();
    } else {
      renderFrame();
    }
  }, [isPlaying, annotations, currentTime, selectedAnnotation, fontSize]);

  // Render the current frame with all annotations
  const renderFrame = () => {
    // Clear canvas
    ctx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
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
        drawBubbleAnnotation(anno);
      }
    });

    // Draw arrow being created if in that state
    if (isDrawingArrow && arrowStartPoint) {
      ctx.current.beginPath();
      ctx.current.moveTo(arrowStartPoint.x, arrowStartPoint.y);
      ctx.current.lineTo(selectedAnnotation.x, selectedAnnotation.y);
      ctx.current.strokeStyle = 'white';
      ctx.current.lineWidth = 2;
      ctx.current.stroke();
      
      // Draw arrowhead
      drawArrowhead(arrowStartPoint.x, arrowStartPoint.y, selectedAnnotation.x, selectedAnnotation.y);
    }
  };
  
  // Draw bubble style annotation with arrow
  const drawBubbleAnnotation = (anno) => {
    ctx.current.save();
    
    // Bubble properties
    const padding = 10;
    const borderRadius = 15;
    const currentFontSize = fontSize;
    ctx.current.font = `${currentFontSize}px Arial`;
    
    // Measure text and handle long text with wrapping
    const maxWidth = 200; // Maximum width for text bubble
    const words = anno.text.split(' ');
    let lines = [];
    let currentLine = words[0];
    
    // Create wrapped text lines
    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.current.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    
    // Calculate bubble dimensions based on wrapped text
    const lineHeight = currentFontSize * 1.2;
    const textHeight = lineHeight * lines.length;
    const textWidth = Math.min(maxWidth, Math.max(...lines.map(line => ctx.current.measureText(line).width)));
    
    // Bubble dimensions
    const bubbleWidth = textWidth + padding * 2;
    const bubbleHeight = textHeight + padding * 2;
    
    // Draw arrow
    ctx.current.beginPath();
    ctx.current.moveTo(anno.arrowStart.x, anno.arrowStart.y);
    ctx.current.lineTo(anno.x, anno.y);
    ctx.current.strokeStyle = 'white';
    ctx.current.lineWidth = 2;
    ctx.current.stroke();
    
    // Draw arrowhead
    drawArrowhead(anno.arrowStart.x, anno.arrowStart.y, anno.x, anno.y);
    
    // Calculate bubble position (centered at arrow start)
    const bubbleX = anno.arrowStart.x - bubbleWidth / 2;
    const bubbleY = anno.arrowStart.y - bubbleHeight / 2;
    
    // Draw bubble background with slightly darker color and higher opacity
    ctx.current.fillStyle = 'rgba(64, 64, 64, 0.9)';
    drawRoundedRect(
      bubbleX, 
      bubbleY, 
      bubbleWidth, 
      bubbleHeight, 
      borderRadius
    );
    
    // Draw bubble text
    ctx.current.fillStyle = 'white';
    lines.forEach((line, i) => {
      ctx.current.fillText(
        line,
        bubbleX + padding,
        bubbleY + padding + currentFontSize + (i * lineHeight)
      );
    });
    
    // Highlight selected annotation
    if (selectedAnnotation && selectedAnnotation.id === anno.id) {
      ctx.current.strokeStyle = '#2ecc71';
      ctx.current.lineWidth = 2;
      ctx.current.strokeRect(
        bubbleX - 2, 
        bubbleY - 2, 
        bubbleWidth + 4, 
        bubbleHeight + 4
      );
    }
    
    ctx.current.restore();
  };
  
  // Helper to draw rounded rectangle
  const drawRoundedRect = (x, y, width, height, radius) => {
    ctx.current.beginPath();
    ctx.current.moveTo(x + radius, y);
    ctx.current.lineTo(x + width - radius, y);
    ctx.current.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.current.lineTo(x + width, y + height - radius);
    ctx.current.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.current.lineTo(x + radius, y + height);
    ctx.current.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.current.lineTo(x, y + radius);
    ctx.current.quadraticCurveTo(x, y, x + radius, y);
    ctx.current.closePath();
    ctx.current.fill();
  };
  
  // Draw arrowhead
  const drawArrowhead = (fromX, fromY, toX, toY) => {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.current.beginPath();
    ctx.current.moveTo(toX, toY);
    ctx.current.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.current.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.current.closePath();
    ctx.current.fillStyle = 'white';
    ctx.current.fill();
  };
  
  // Update current time when video time changes
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  // Handle canvas click to add or edit annotation
  const handleCanvasClick = (e) => {
    if (!videoRef.current) return;
    
    // Get click coordinates relative to canvas
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on an existing annotation
    const clickedAnno = findAnnotationAtPoint(x, y);
    
    if (clickedAnno) {
      // Select the annotation
      setSelectedAnnotation(clickedAnno);
      setAnnotationText(clickedAnno.text);
      
      // Pause video when editing
      videoRef.current.pause();
      setIsPlaying(false);
    } else if (selectedAnnotation && isDrawingArrow) {
      // Finish drawing the arrow
      const updatedAnnotations = annotations.map(anno => {
        if (anno.id === selectedAnnotation.id) {
          return {
            ...anno,
            arrowStart: { x, y },
            x: selectedAnnotation.x,
            y: selectedAnnotation.y
          };
        }
        return anno;
      });
      
      setAnnotations(updatedAnnotations);
      setIsDrawingArrow(false);
      setArrowStartPoint(null);
      renderFrame();
    } else if (!selectedAnnotation) {
      // Pause the video when adding an annotation
      videoRef.current.pause();
      setIsPlaying(false);
      
      // Create a new annotation with default arrow position
      const text = annotationText || 'New annotation';
      
      const newAnnotation = {
        id: Date.now(),
        x,
        y,
        text,
        startTime: currentTime,
        endTime: currentTime + 1, // Default 5 seconds duration
        arrowStart: { x: x - 100, y: y - 50 },
        arrowEnd: { x, y },
        fontSize: fontSize // Store font size with annotation
      };
      
      setAnnotations([...annotations, newAnnotation]);
      setSelectedAnnotation(newAnnotation);
      setAnnotationText('');
      
      // Start drawing mode to position the bubble
      setIsDrawingArrow(true);
      renderFrame();
    }
  };
  
  // Helper to find annotation at a point
  const findAnnotationAtPoint = (x, y) => {
    // Check if point is inside annotation bubble
    for (const anno of annotations) {
      if (currentTime >= anno.startTime && currentTime <= anno.endTime) {
        // Use either the annotation's stored font size or the global font size
        const currentFontSize = anno.fontSize || fontSize;
        ctx.current.font = `${currentFontSize}px Arial`;
        
        // Calculate text width with wrapping consideration
        const maxWidth = 200;
        const words = anno.text.split(' ');
        let lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
          const testLine = currentLine + ' ' + words[i];
          const metrics = ctx.current.measureText(testLine);
          if (metrics.width > maxWidth) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);
        
        const lineHeight = currentFontSize * 1.2;
        const textHeight = lineHeight * lines.length;
        const textWidth = Math.min(maxWidth, Math.max(...lines.map(line => ctx.current.measureText(line).width)));
        
        const padding = 10;
        const bubbleWidth = textWidth + padding * 2;
        const bubbleHeight = textHeight + padding * 2;
        
        // Check bubble boundaries
        const bubbleX = anno.arrowStart.x - bubbleWidth / 2;
        const bubbleY = anno.arrowStart.y - bubbleHeight / 2;
        
        if (
          x >= bubbleX && 
          x <= bubbleX + bubbleWidth && 
          y >= bubbleY && 
          y <= bubbleY + bubbleHeight
        ) {
          return anno;
        }
        
        // Check if clicking near arrow endpoint (target point)
        const targetRadius = 10;
        const dx = x - anno.x;
        const dy = y - anno.y;
        if (dx * dx + dy * dy <= targetRadius * targetRadius) {
          return anno;
        }
      }
    }
    return null;
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
    
    // Clear selection when playing/pausing
    setSelectedAnnotation(null);
  };
  
  // Handle annotation text change
  const handleAnnotationTextChange = (e) => {
    const newText = e.target.value;
    setAnnotationText(newText);
    
    // Update selected annotation if exists
    if (selectedAnnotation) {
      const updatedAnnotations = annotations.map(anno => {
        if (anno.id === selectedAnnotation.id) {
          return { ...anno, text: newText };
        }
        return anno;
      });
      
      setAnnotations(updatedAnnotations);
      setSelectedAnnotation({ ...selectedAnnotation, text: newText });
    }
  };
  
  // Delete an annotation
  const deleteAnnotation = (id) => {
    setAnnotations(annotations.filter(anno => anno.id !== id));
    if (selectedAnnotation && selectedAnnotation.id === id) {
      setSelectedAnnotation(null);
      setAnnotationText('');
    }
  };
  
  // Update annotation duration
  const updateAnnotationDuration = (id, seconds) => {
    const updatedAnnotations = annotations.map(anno => {
      if (anno.id === id) {
        return { ...anno, endTime: anno.startTime + seconds };
      }
      return anno;
    });
    
    setAnnotations(updatedAnnotations);
    
    if (selectedAnnotation && selectedAnnotation.id === id) {
      setSelectedAnnotation({ 
        ...selectedAnnotation, 
        endTime: selectedAnnotation.startTime + seconds 
      });
    }
  };
  
  // Modify arrow position
  const startDrawingArrow = () => {
    if (selectedAnnotation) {
      setIsDrawingArrow(true);
      setArrowStartPoint({ 
        x: selectedAnnotation.arrowStart.x, 
        y: selectedAnnotation.arrowStart.y 
      });
    }
  };
  
  // Change font size
  const changeFontSize = (delta) => {
    const newSize = Math.max(10, Math.min(24, fontSize + delta));
    setFontSize(newSize);
    
    // Update selected annotation if exists
    if (selectedAnnotation) {
      const updatedAnnotations = annotations.map(anno => {
        if (anno.id === selectedAnnotation.id) {
          return { ...anno, fontSize: newSize };
        }
        return anno;
      });
      
      setAnnotations(updatedAnnotations);
      setSelectedAnnotation({ ...selectedAnnotation, fontSize: newSize });
    }
  };
  
  // Save annotated video
  const saveAnnotatedVideo = async () => {
    if (!videoDetails || annotations.length === 0) {
      setMessage('Please add annotations first');
      return;
    }
    
    setIsSaving(true);
    setMessage('Processing video with annotations. This may take a while...');
    
    try {
      // Make sure all annotations have essential properties for proper rendering
      const enhancedAnnotations = annotations.map(anno => ({
        ...anno,
        // Ensure arrow start/end points are explicitly defined
        arrowStart: anno.arrowStart || { x: anno.x - 100, y: anno.y - 50 },
        arrowEnd: { x: anno.x, y: anno.y },
        // Include font size with each annotation
        fontSize: anno.fontSize || fontSize,
        // Add style properties for server-side rendering
        style: {
          backgroundColor: 'rgba(64, 64, 64, 0.9)',
          textColor: 'white',
          arrowColor: 'white',
          padding: 10,
          borderRadius: 15,
          maxWidth: 200
        }
      }));
      
      // Create the payload with video ID and enhanced annotations
      const payload = {
        id: id,
        annotations: enhancedAnnotations,
        title: videoDetails.title,
        originalUrl: videoDetails.url
      };
      
      // Send to server
      const response = await fetch('https://video-g4h9.onrender.com/api/annotation/annotate', {
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
  
  // Cancel arrow drawing
  const cancelDrawing = () => {
    setIsDrawingArrow(false);
    setArrowStartPoint(null);
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
                onChange={handleAnnotationTextChange}
                placeholder="Enter annotation text"
                className="text-input"
              />
              <div className="instructions">
                {selectedAnnotation 
                  ? "Edit annotation text or click 'Position Arrow' to adjust" 
                  : "Click on the video to place annotation at current timestamp"}
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
              
              {selectedAnnotation && (
                <>
                  <button 
                    onClick={startDrawingArrow} 
                    className="edit-button"
                    disabled={isDrawingArrow}
                  >
                    Position Arrow
                  </button>
                  
                  <div className="duration-controls">
                    <button 
                      onClick={() => updateAnnotationDuration(selectedAnnotation.id, 3)} 
                      className="duration-button"
                    >
                      3s
                    </button>
                    <button 
                      onClick={() => updateAnnotationDuration(selectedAnnotation.id, 5)} 
                      className="duration-button"
                    >
                      5s
                    </button>
                    <button 
                      onClick={() => updateAnnotationDuration(selectedAnnotation.id, 10)} 
                      className="duration-button"
                    >
                      10s
                    </button>
                  </div>
                  
                  <div className="font-size-controls">
                    <button 
                      onClick={() => changeFontSize(-2)} 
                      className="font-size-button"
                    >
                      <FaMinus /> Text Size
                    </button>
                    <span className="font-size-value">{fontSize}px</span>
                    <button 
                      onClick={() => changeFontSize(2)} 
                      className="font-size-button"
                    >
                      <FaPlus /> Text Size
                    </button>
                  </div>
                </>
              )}
              
              {isDrawingArrow && (
                <button 
                  onClick={cancelDrawing} 
                  className="cancel-button"
                >
                  Cancel Arrow
                </button>
              )}
              
              <button
                onClick={saveAnnotatedVideo}
                disabled={isSaving || annotations.length === 0}
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
                    <li key={anno.id} className={selectedAnnotation && selectedAnnotation.id === anno.id ? 'selected' : ''}>
                      <div className="annotation-info">
                        <span className="annotation-text">"{anno.text}"</span>
                        <span className="annotation-time">
                          {anno.startTime.toFixed(2)}s - {anno.endTime.toFixed(2)}s
                        </span>
                        {anno.fontSize && (
                          <span className="annotation-size">
                            Size: {anno.fontSize}px
                          </span>
                        )}
                      </div>
                      <div className="annotation-actions">
                        <button 
                          onClick={() => setSelectedAnnotation(anno)}
                          className="edit-button"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteAnnotation(anno.id)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      </div>
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