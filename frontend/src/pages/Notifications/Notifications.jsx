import React, { useState, useEffect } from 'react';
import { Home, Bell, UserCircle, HelpCircle } from 'lucide-react';
import { Link } from "react-router-dom";
import './Notifications.scss';

const NotificationItem = ({ message, time, icon, isNew }) => (
  <div className={`notification-item ${isNew ? 'new' : ''}`}>
    <div className="notification-content">
      <p className="message">{message}</p>
      <span className="time">{time}</span>
    </div>
    <div className="notification-icon">
      {icon}
    </div>
  </div>
);

const Notifications = () => {
  const [notifications, setNotifications] = useState({
    newNotifications: [],
    olderNotifications: [],
    unreadCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
    
        if (!token) {
          throw new Error('No authentication token found');
        }
    
        const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/notification/notifications`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Add token to Authorization header
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setNotifications({
          newNotifications: data.newNotifications || [],
          olderNotifications: data.olderNotifications || [],
          unreadCount: data.unreadCount || 0
        });
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (isLoading) {
    return (
      <div className="notifications-page">
        <header className="header">
          {/* Existing header code */}
        </header>
        <main className="main-content">
          <div className="loading">Loading notifications...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-page">
        <header className="header">
          {/* Existing header code */}
        </header>
        <main className="main-content">
          <div className="error">Error: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="notifications-page">
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
              {notifications.unreadCount > 0 && (
                <span className="notification-badge">
                  {notifications.unreadCount}
                </span>
              )}
            </button>
          </Link>
          <Link to="/profile/:userId">
            <button className="btn-icon profile">
              <UserCircle size={20} />
            </button>
          </Link>
{/*           <button className="btn-help">
            <HelpCircle size={20} />
            <span>HELP</span>
          </button> */}
        </div>
      </header>
      <main className="main-content">
        <div className="title-section">
          <Bell size={24} className="bell-icon" />
          <h1>NOTIFICATIONS</h1>
        </div>
        <div className="notifications-section">
          {notifications.newNotifications.length > 0 && (
            <>
              <h2>NEW NOTIFICATIONS</h2>
              <div className="notifications-list">
                {notifications.newNotifications.map(notification => (
                  <NotificationItem
                    key={notification._id}
                    message={notification.content}
                    time={new Date(notification.createdAt).toLocaleString()}
                    isNew={true}
                    icon={<Bell />}
                  />
                ))}
              </div>
            </>
          )}
         
          <h2>OLDER NOTIFICATIONS</h2>
          <div className="notifications-list">
            {notifications.olderNotifications.map(notification => (
              <NotificationItem
                key={notification._id}
                message={notification.content}
                time={new Date(notification.createdAt).toLocaleString()}
                isNew={false}
                icon={<Bell />}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
