import React from "react";
import "./VideoUpload.scss";
import { Link } from "react-router-dom";
import { FaHome, FaUserCircle, FaBell } from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";

const videos = [
  { title: "FOREHAND VIDEO FRONT ANGLE", thumbnail: "video1.jpg" },
  { title: "FOREHAND VIDEO SIDE ANGLE", thumbnail: "video2.jpg" },
  { title: "BACKHAND VIDEO FRONT ANGLE", thumbnail: "video3.jpg" },
  { title: "BACKHAND VIDEO SIDE ANGLE", thumbnail: "video4.jpg" },
  { title: "TOURNAMENT ROUND 1 VIDEO", thumbnail: "video5.jpg" },
  { title: "TOURNAMENT ROUND 2 VIDEO", thumbnail: "video6.jpg" },
];

const UploadVideos = () => {
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

      <h2>UPLOAD VIDEOS</h2>

      <div className="video-grid">
        {videos.map((video, index) => (
          <div className="video-card" key={index}>
            <img src={video.thumbnail} alt={video.title} />
            <div className="overlay">
              <button className="play-button">▶</button>
            </div>
            <p>{video.title}</p>
          </div>
        ))}
      </div>

      <div className="privacy-options lower">
        <label><input type="radio" name="privacy" /> PRIVATE</label>
        <label><input type="radio" name="privacy" /> PUBLIC</label>
      </div>

      <div className="actions">
        <button className="tag-user">TAG USER</button>
        <button className="add-analysis">ADD ANALYSIS</button>
      </div>
    </div>
  );
};

export default UploadVideos;
