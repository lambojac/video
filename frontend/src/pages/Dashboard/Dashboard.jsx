import React, { useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import { FaHome, FaUserCircle, FaBell, FaQuestionCircle, FaFont } from "react-icons/fa";
import { MdOutlineVideoLibrary } from "react-icons/md";
import { IoIosFootball } from "react-icons/io";
import { GiBoxingGloveSurprise } from "react-icons/gi";
import "./Dashboard.scss";
import axios from "axios";
const Dashboard = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/users/logout`, {}, { withCredentials: true }); // Call the backend logout API
  
      //Clear the token from localStorage
      localStorage.removeItem("token");
  
      //Redirect to the login page
      navigate("/login");
  
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="dashboard">
      {/* Top Navigation */}
      <div className="top-nav">
        <h2>Home</h2>
        <div className="icons">
        <Link to="/notifications">
        <FaBell className="icon" />
      </Link>
      <Link to="/profile/:userId">
        <FaUserCircle className="icon" />
      </Link>
{/*           <button className="help-btn">
            <FaQuestionCircle /> HELP
          </button> */}
           {/* Logout Button */}
           <button className="logout-btn" onClick={handleLogout}>
            LOGOUT
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
          <Link to="/upload">
            <div className="card">
              <IoIosFootball className="card-icon" />
              <p>UPCOMING MATCHES</p>
            </div>
            </Link>
            <Link to="/upload">
            <div className="card">
              <GiBoxingGloveSurprise className="card-icon" />
              <p>TOUGH OPPONENTS</p>
            </div>
            </Link>
            <Link to="/upload">
            <div className="card active">
              <MdOutlineVideoLibrary className="card-icon" />
              <p>VIDEO ANALYSIS</p>
            </div>
            </Link>
            <Link to="/upload">
            <div className="card">
              <IoIosFootball className="card-icon" />
              <p>RECENT COACHING POINTS</p>
            </div>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
