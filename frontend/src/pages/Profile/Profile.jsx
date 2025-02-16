import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import { FaHome, FaUserCircle, FaBell, FaQuestionCircle, FaSearch } from "react-icons/fa";
import "./Profile.scss";

const Profile = () => {
  const { userId } = useParams();
  const { userName } = useParams(); 
  console.log(userId)
  const [user, setUser] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

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
        setUser(data.data); // Access the data from the response structure
  
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
  
    fetchUser();
  }, []);
  

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
  
  const handleVideoClick = (url) => {
    setVideoUrl(url);
    setIsPlaying(true);
  };

  return (
    <div className="profile">
      {/* Top Navigation */}
      <div className="top-nav">
        <Link to="/dashboard">
          <FaHome className="home-icon" />
        </Link>
        <div className="right-icons">
          <Link to="/notifications">
            <FaBell className="icon" />
          </Link>
          <Link to="/profile/:userId">
            <FaUserCircle className="icon" />
          </Link>
          <button className="help-btn">
            <FaQuestionCircle /> HELP
          </button>
        </div>
      </div>

      {/* Profile Banner */}
      <div className="banner">
        <label htmlFor="banner-upload">
          <img
            src={user?.banner || '/default-banner.jpg'} // Use default image if no banner
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

      <div className="profile-info">
        <div className="user">
          <label htmlFor="avatar-upload">
            <img
              src={user?.avatar || '/default-avatar.jpg'} // Use default image if no avatar
              alt="User Avatar"
              className="avatar"
            />
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "avatar")}
            style={{ display: "none" }}
          />
        </div>
        </div>
        <div className="user-details">
        <h2>{user?.fullName || 'No Name'}</h2>
        <p>@{user?.userName || 'username'}</p>
        </div>
      

      <div className="search-bar">
        <label>SEARCH FOR USERS:</label>
        <div className="search-input">
          <input type="text" placeholder="SEARCH HERE" />
          <button>
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Videos Section */}
      <Link to="/upload">
        <div className="videos-section">
          <h3>MY VIDEOS</h3>
          <p className="video-category">UNIVERSITY ATHLETE FOREHAND (PRIVATE)</p>
          <div className="video-content">
            <div className="video-thumbnail" onClick={() => handleVideoClick("/path-to-video.mp4")}>
              <img
                src="/path-to-video-thumbnail.jpg"
                alt="Video Thumbnail"
              />
              <button className="play-btn">▶</button>
            </div>
            <div className="video-actions">
              <button className="btn">LOAD DRAFT</button>
              <button className="btn primary">UPLOAD VIDEOS</button>
            </div>
          </div>
          {/* Video Player */}
          {isPlaying && (
            <div className="video-player">
              <ReactPlayer 
                url={videoUrl}
                controls
                playing={isPlaying}
                onEnded={() => setIsPlaying(false)}
                width="100%"
                height="auto"
              />
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default Profile;
