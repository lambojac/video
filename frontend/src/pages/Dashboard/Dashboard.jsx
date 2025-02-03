import React, { useState } from "react";
import { FaHome, FaUserCircle, FaBell, FaQuestionCircle, FaFont } from "react-icons/fa";
import { MdOutlineVideoLibrary } from "react-icons/md";
import { IoIosFootball } from "react-icons/io";
import { GiBoxingGloveSurprise } from "react-icons/gi";
import "./Dashboard.scss";

const Dashboard = () => {

  return (
    <div className="dashboard">
      {/* Top Navigation */}
      <div className="top-nav">
        <h2>Home</h2>
        <div className="icons">
          <FaBell className="icon" />
          <FaUserCircle className="icon" />
          <button className="help-btn">
            <FaQuestionCircle /> HELP
          </button>
        </div>
      </div>

      {/* Sidebar and Content */}
      <div className="content">
        {/* Sidebar */}
        <aside className="sidebar">
          <FaHome className="sidebar-icon" />
          <span>HOME</span>
        </aside>

        {/* Main Section */}
        <main className="main">
          <h3>HOME PAGE</h3>
          <div className="cards">
            <div className="card">
              <IoIosFootball className="card-icon" />
              <p>UPCOMING MATCHES</p>
            </div>
            <div className="card">
              <GiBoxingGloveSurprise className="card-icon" />
              <p>TOUGH OPPONENTS</p>
            </div>
            <div className="card active">
              <MdOutlineVideoLibrary className="card-icon" />
              <p>VIDEO ANALYSIS</p>
            </div>
            <div className="card">
              <IoIosFootball className="card-icon" />
              <p>RECENT COACHING POINTS</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
