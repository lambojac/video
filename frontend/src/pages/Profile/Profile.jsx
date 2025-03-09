import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import { FaHome, FaUserCircle, FaBell, FaQuestionCircle, FaUpload, FaPen } from "react-icons/fa";
import "./Profile.scss";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [user, setUser] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Video states
  const [privateVideos, setPrivateVideos] = useState([]);
  const [annotatedVideos, setAnnotatedVideos] = useState([]);
  const [currentPrivatePage, setCurrentPrivatePage] = useState(1);
  const [currentAnnotatedPage, setCurrentAnnotatedPage] = useState(1);
  const [totalPrivatePages, setTotalPrivatePages] = useState(1);
  const [totalAnnotatedPages, setTotalAnnotatedPages] = useState(1);
  
  // Upload modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [privacy, setPrivacy] = useState('private');
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`https://video-g4h9.onrender.com/api/users/`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error("User not found");
        }
  
        const data = await response.json();
        setUser(data.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
  
    fetchUser();
  }, []);

  // Fetch private videos
  useEffect(() => {
    fetchVideos(currentPrivatePage, 'private', false, setPrivateVideos, setTotalPrivatePages);
  }, [currentPrivatePage]);

  // Fetch annotated private videos
  useEffect(() => {
    fetchVideos(currentAnnotatedPage, 'private', true, setAnnotatedVideos, setTotalAnnotatedPages);
  }, [currentAnnotatedPage]);

  const fetchVideos = async (page, privacyType, isAnnotated, setVideosFunction, setTotalPagesFunction) => {
    setIsLoading(true);
    try {
      // Modify the API endpoint to include the isAnnotated parameter
      const response = await fetch(
        `https://video-g4h9.onrender.com/api/video?page=${page}&limit=3&privacy=${privacyType}&isAnnotated=${isAnnotated}`
      );
      const data = await response.json();
      setVideosFunction(data.videos);
      setTotalPagesFunction(data.pagination.pages);
    } catch (error) {
      console.error(`Error fetching ${isAnnotated ? 'annotated' : ''} ${privacyType} videos:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchResults = async (query) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://video-g4h9.onrender.com/api/users/search?search=${query}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Error searching users");
      }

      const data = await response.json();
      setSearchResults(data.users);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      fetchSearchResults(searchQuery);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchSearchResults(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);
  
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append(type, file);
  
    try {
      const response = await fetch(`https://video-g4h9.onrender.com/api/upload/${type}/${userId}`, {
        method: "POST",
        body: formData,
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
  
      const data = await response.json();
      setUser(prev => ({
        ...prev,
        [type]: data[type]
      }));
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(error.message || 'Failed to upload image');
    }
  };
  
  const handleVideoClick = (video) => {
    setVideoUrl(video.url);
    setIsPlaying(true);
    setSelectedVideo(video._id);
  };

  // Handle file change for video upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle video upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploadLoading(true);
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
      
      // Refresh the video lists
      fetchVideos(currentPrivatePage, 'private', false, setPrivateVideos, setTotalPrivatePages);
      fetchVideos(currentAnnotatedPage, 'private', true, setAnnotatedVideos, setTotalAnnotatedPages);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadLoading(false);
    }
  };
  
  // Navigate to user profile when clicked in search results
  const navigateToUserProfile = (userId) => {
    navigate(`/profile/${userId}`);
    setSearchQuery(""); // Clear the search query
    setSearchResults([]); // Clear search results
  };

  // Navigate to annotation page
  const goToAnnotation = (videoId) => {
    navigate(`/annotation/${videoId}`);
  };

  return (
    <div className="profile">
      {/* Top Navigation */}
      <div className="top-nav">
        <div className="left-side">
          <Link to="/dashboard" className="home-link">
            <div className="icon-circle">
              <FaHome className="home-icon" />
            </div>
            <span>HOME</span>
          </Link>
        </div>
        <div className="right-icons">
          <Link to="/notifications" className="icon-wrapper">
            <div className="icon-circle">
              <FaBell className="icon" />
            </div>
          </Link>
          <Link to="/profile/:userId" className="icon-wrapper">
            <div className="icon-circle">
              <FaUserCircle className="icon" />
            </div>
          </Link>
          <button className="help-btn">
            <FaQuestionCircle className="help-icon" /> HELP
          </button>
        </div>
      </div>

      {/* Profile Banner */}
      <div className="banner">
        <label htmlFor="banner-upload">
          <img
            src={user?.banner || '/banner.jpg'}
            alt="Banner"
            className="banner-img"
          />
        </label>
        <input
          id="banner-upload"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload(e, "banner")}
          style={{ display: "none" }}
        />
      </div>

      <div className="profile-content">
        <div className="profile-info">
          <div className="user-profile">
            <label htmlFor="avatar-upload">
              <div className="avatar-container">
                <img
                  src={user?.avatar || '/avatar.jpg'}
                  alt="User Avatar"
                  className="avatar"
                />
              </div>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "avatar")}
              style={{ display: "none" }}
            />
          
            <div className="user-details">
              <h2>{user?.fullName || 'Kevin Levin'}</h2>
              <p>@{user?.userName || 'kevinlevin528'}</p>
            </div>
          </div>

          <div className="search-section">
            <div className="search-bar">
              <label>SEARCH FOR USERS:</label>
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="SEARCH HERE"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button onClick={handleSearch} className="search-button">
                  <span>SEARCH</span>
                </button>
              </div>
            </div>
            
            {searchQuery.trim() !== "" && (
              <div className="search-results">
                {isLoading ? (
                  <p>Loading...</p>
                ) : (
                  searchResults.length > 0 ? (
                    searchResults.map(user => (
                      <div 
                        key={user._id}
                        className="search-item"
                        onClick={() => navigateToUserProfile(user._id)}
                      >
                        <span>{user.fullName}</span>
                      </div>
                    ))
                  ) : (
                    <p>No users found.</p>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Videos Section */}
        <div className="videos-section">
          {/* Private Videos Section */}
          <div className="videos-category">
            <div className="videos-header">
              <div>
                <h3>MY VIDEOS</h3>
                <p className="video-category">PRIVATE VIDEOS</p>
              </div>
              <div className="upload-action">
                <button 
                  className="btn upload-btn"
                  onClick={() => setShowUploadModal(true)}
                >
                  <FaUpload /> UPLOAD VIDEOS
                </button>
              </div>
            </div>
            
            <div className="video-grid">
              {isLoading ? (
                <p>Loading videos...</p>
              ) : privateVideos.length > 0 ? (
                privateVideos.map((video) => (
                  <div 
                    key={video._id} 
                    className={`video-card ${selectedVideo === video._id ? 'selected' : ''}`}
                    onClick={() => handleVideoClick(video)}
                  >
                    <video src={video.url} controls />
                    <div className="video-info">
                      <p>{video.title}</p>
                      <span className="privacy-badge">{video.privacy}</span>
                    </div>
                    <div className="video-actions">
                      <button 
                        className="btn load-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          goToAnnotation(video._id);
                        }}
                      >
                        <FaPen /> LOAD DRAFT
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No private videos found.</p>
              )}
            </div>
            
            {/* Pagination for Private Videos */}
            {totalPrivatePages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPrivatePage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPrivatePage === 1}
                >
                  Previous
                </button>
                <span>Page {currentPrivatePage} of {totalPrivatePages}</span>
                <button
                  onClick={() => setCurrentPrivatePage(prev => Math.min(prev + 1, totalPrivatePages))}
                  disabled={currentPrivatePage === totalPrivatePages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
          
          {/* Annotated Private Videos Section - Replace Public Videos */}
          <div className="videos-category">
            <div className="videos-header">
              <div>
                <h3>ANNOTATED PRIVATE VIDEOS</h3>
              </div>
            </div>
            
            <div className="video-grid">
              {isLoading ? (
                <p>Loading videos...</p>
              ) : annotatedVideos.length > 0 ? (
                annotatedVideos.map((video) => (
                  <div 
                    key={video._id} 
                    className={`video-card ${selectedVideo === video._id ? 'selected' : ''}`}
                    onClick={() => handleVideoClick(video)}
                  >
                    <video src={video.url} controls />
                    <div className="video-info">
                      <p>{video.title}</p>
                      <span className="privacy-badge">Annotated</span>
                    </div>
                    <div className="video-actions">
                      <button 
                        className="btn load-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          goToAnnotation(video._id);
                        }}
                      >
                        <FaPen /> VIEW ANNOTATIONS
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No annotated videos found.</p>
              )}
            </div>
            
            {/* Pagination for Annotated Videos */}
            {totalAnnotatedPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentAnnotatedPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentAnnotatedPage === 1}
                >
                  Previous
                </button>
                <span>Page {currentAnnotatedPage} of {totalAnnotatedPages}</span>
                <button
                  onClick={() => setCurrentAnnotatedPage(prev => Math.min(prev + 1, totalAnnotatedPages))}
                  disabled={currentAnnotatedPage === totalAnnotatedPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
          
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
                      disabled={uploadLoading}
                      className="submit-button"
                    >
                      {uploadLoading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Video Player for selected video */}
          {isPlaying && (
            <div className="video-player-modal">
              <div className="video-player-container">
                <button 
                  className="close-button"
                  onClick={() => setIsPlaying(false)}
                >
                  ✕
                </button>
                <ReactPlayer 
                  url={videoUrl}
                  controls
                  playing={isPlaying}
                  width="100%"
                  height="auto"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;