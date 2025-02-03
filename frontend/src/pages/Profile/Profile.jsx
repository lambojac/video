import React from "react";
import { FaHome, FaUserCircle, FaBell, FaQuestionCircle, FaSearch } from "react-icons/fa";
import "./Profile.scss";
const Profile = () => {
  return (
    <div className="profile">
      {/* Top Navigation */}
      <div className="top-nav">
        <FaHome className="home-icon" />
        <div className="right-icons">
          <FaBell className="icon" />
          <FaUserCircle className="icon" />
          <button className="help-btn">
            <FaQuestionCircle /> HELP
          </button>
        </div>
      </div>

      {/* Profile Banner */}
      <div className="banner">
        <img src="/path-to-banner.jpg" alt="Banner" className="banner-img" />
      </div>

      {/* Profile Section */}
      <div className="profile-info">
        <div className="user">
          <img src="/path-to-avatar.jpg" alt="User Avatar" className="avatar" />
          <div className="user-details">
            <h2>KEVIN LEVIN</h2>
            <p>@kevinlevin528</p>
          </div>
        </div>
        <div className="search-bar">
          <label>SEARCH FOR USERS:</label>
          <div className="search-input">
            <input type="text" placeholder="SEARCH HERE" />
            <button><FaSearch /></button>
          </div>
        </div>
      </div>

      {/* Videos Section */}
      <div className="videos-section">
        <h3>MY VIDEOS</h3>
        <p className="video-category">UNIVERSITY ATHLETE FOREHAND (PRIVATE)</p>
        <div className="video-content">
          <div className="video-thumbnail">
            <img src="/path-to-video-thumbnail.jpg" alt="Video Thumbnail" />
            <button className="play-btn">▶</button>
          </div>
          <div className="video-actions">
            <button className="btn">LOAD DRAFT</button>
            <button className="btn primary">UPLOAD VIDEOS</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
