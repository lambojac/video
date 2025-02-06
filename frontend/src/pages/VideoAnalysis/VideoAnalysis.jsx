import React from 'react';
import { Home, Bell, UserCircle, HelpCircle } from 'lucide-react';
import './VideoAnalysis.scss';
import { Link } from "react-router-dom";

const VideoAnalysis = ({ athleteVideo, exampleVideo, userName, coachName }) => {
  return (
    <div className="video-analysis">
      <header className="header">
        <div className="header-left">
        <Link to="/dashboard">
        <button className="btn-icon">
          <Home size={20} />
          <span>HOME</span>
        </button>
      </Link>
        </div>
        <div className="header-right">
        <Link to="/notifications">
          <button className="btn-icon notification">
            <Bell size={20} />
          </button>
        </Link>
        <Link to="/profile">
          <button className="btn-icon profile">
            <UserCircle size={20} />
          </button>
        </Link>
          <button className="btn-help">
            <HelpCircle size={20} />
            <span>HELP</span>
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="title-section">
          <div className="camera-icon">
            <span className="camera-circle" />
          </div>
          <h1>VIDEO ANALYSIS</h1>
        </div>

        <p className="user-info">USER 1 FOREHAND TOPSPIN (PRIVATE)</p>

        <div className="videos-container">
          <div className="video-section">
            <h2>ATHLETE - FRONT - 1</h2>
            <div className="video-frame">
              <img src={athleteVideo} alt="Athlete video" />
            </div>
          </div>

          <div className="video-section">
            <h2>EXAMPLE - FRONT - 1</h2>
            <div className="video-frame">
              <img src={exampleVideo} alt="Example video" />
            </div>
          </div>
        </div>

        <div className="coach-tag">
          <p>TAGGED BY COACH {coachName}</p>
        </div>
      </main>
    </div>
  );
};

export default VideoAnalysis;