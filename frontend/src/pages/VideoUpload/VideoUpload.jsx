import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaUserCircle, FaBell, FaPen, FaFilm, FaCompressAlt } from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";
import VideoTagModal from '../Modal/Modal';
import "./VideoUpload.scss";

const VideoUpload = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [privacy, setPrivacy] = useState('private');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showTagModal, setShowTagModal] = useState(false);

  // Function to handle video selection
  const handleVideoClick = (videoId) => {
    setSelectedVideo(videoId);
  };

  // Function to navigate to annotation page
  const goToAnnotation = () => {
    if (selectedVideo) {
      navigate(`/annotation/${selectedVideo}`);
    }
  };
  
  // Function to navigate to comparison page - modified to work with both original and annotated videos
  const goToComparison = async () => {
    if (!selectedVideo) return;
    
    try {
      // Find the selected video in our list
      const selectedVideoData = videos.find(v => v._id === selectedVideo);
      
      if (selectedVideoData) {
        // If it's an annotated video, navigate directly to comparison with its ID
        if (selectedVideoData.isAnnotated && selectedVideoData.originalVideoId) {
          navigate(`/comparison/${selectedVideoData._id}`);
        } 
        // If it's an original video with annotations, navigate using original ID
        else if (selectedVideoData.hasAnnotations) {
          navigate(`/comparison/${selectedVideoData._id}`);
        } else {
          alert("This video doesn't have an annotated version for comparison.");
        }
      }
    } catch (error) {
      console.error("Error navigating to comparison:", error);
    }
  };

  useEffect(() => {
    fetchVideos(currentPage);
  }, [currentPage]);

  const fetchVideos = async (page) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/api/video?page=${page}&limit=6&privacy=${privacy}`
      );
      const data = await response.json();
      setVideos(data.videos);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('privacy', privacy);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/video/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setFile(null);
      setTitle('');
      setShowUploadModal(false);
      fetchVideos(currentPage);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Tag user function
  const handleTagUser = () => {
    if (selectedVideo) {
      setShowTagModal(true);
    }
  };
  
  // Determine if comparison is possible for the selected video
  const canCompareVideo = () => {
    if (!selectedVideo) return false;
    const video = videos.find(v => v._id === selectedVideo);
    
    // Can compare if it's an original video with annotations
    if (video && video.hasAnnotations) return true;
    
    // Can also compare if it's an annotated video with an original
    if (video && video.isAnnotated && video.originalVideoId) return true;
    
    return false;
  };

  return (
    <div className="upload-videos">
      <header>
        <Link to="/dashboard">
          <div className="left"><FaHome /> HOME</div>
        </Link>
        <div className="right">
          <Link to="/profile/:userId">
            <FaUserCircle className="icon" />
          </Link>
          <Link to="/notifications">
            <FaBell className="icon" />
          </Link>
          <FiHelpCircle className="icon" /> HELP
        </div>
      </header>

      <div className="content">
        <h2>UPLOAD VIDEOS</h2>

        <button
          className="upload-button"
          onClick={() => setShowUploadModal(true)}
        >
          UPLOAD VIDEO
        </button>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Upload New Video</h3>
              <form onSubmit={handleUpload}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Video File</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="video/*"
                    required
                  />
                </div>
                <div className="privacy-options">
                  <label>
                    <input
                      type="radio"
                      name="privacy"
                      value="private"
                      checked={privacy === 'private'}
                      onChange={(e) => setPrivacy(e.target.value)}
                    />
                    PRIVATE
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="privacy"
                      value="public"
                      checked={privacy === 'public'}
                      onChange={(e) => setPrivacy(e.target.value)}
                    />
                    PUBLIC
                  </label>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="submit-button"
                  >
                    {loading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="video-grid">
          {videos.map((video) => (
            <div
              className={`video-card ${selectedVideo === video._id ? 'selected' : ''} ${video.hasAnnotations ? 'has-annotations' : ''} ${video.isAnnotated ? 'is-annotated' : ''}`}
              key={video._id}
              onClick={() => handleVideoClick(video._id)}
            >
              <video src={video.url} controls />
              <div className="video-info">
                <p>{video.title}</p>
                <span className="privacy-badge">{video.privacy}</span>
                {video.hasAnnotations && (
                  <span className="annotation-badge">Has Annotations</span>
                )}
                {video.isAnnotated && (
                  <span className="annotated-badge">Annotated Version</span>
                )}
                {video.originalVideoId && (
                  <span className="original-badge">Has Original</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        <div className="actions">
          <button 
            className="action-button tag-user" 
            onClick={handleTagUser}
            disabled={!selectedVideo}
          >
            TAG USER
          </button>
          
          <button
            className="action-button annotation-button"
            onClick={goToAnnotation}
            disabled={!selectedVideo}
          >
            <FaPen /> Add Analysis
          </button>
          
          <button
            className="action-button comparison-button"
            onClick={goToComparison}
            disabled={!canCompareVideo()}
          >
            <FaCompressAlt /> Compare Videos
          </button>
        </div>
      </div>
      
      {showTagModal && (
        <VideoTagModal
          videoId={selectedVideo}
          onClose={() => setShowTagModal(false)}
        />
      )}
    </div>
  );
};

export default VideoUpload;