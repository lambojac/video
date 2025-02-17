import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { FaHome, FaUserCircle, FaBell } from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";
import "./VideoUpload.scss";

const VideoUpload = () => {
  const [videos, setVideos] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [privacy, setPrivacy] = useState('private');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchVideos(currentPage);
  }, [currentPage]);

  const fetchVideos = async (page) => {
    try {
      const response = await fetch(
        `https://video-g4h9.onrender.com/api/video?page=${page}&limit=6&privacy=${privacy}`
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
      const response = await fetch('https://video-g4h9.onrender.com/api/video/upload', {
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
          {videos.map((video, index) => (
            <div className="video-card" key={index}>
              <video src={video.url} controls />
              <div className="video-info">
                <p>{video.title}</p>
                <span className="privacy-badge">{video.privacy}</span>
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
          <button className="tag-user">TAG USER</button>
          <button className="add-analysis">ADD ANALYSIS</button>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;