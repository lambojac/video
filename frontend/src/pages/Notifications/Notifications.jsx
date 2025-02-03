import React from 'react';
import { Home, Bell, UserCircle, HelpCircle } from 'lucide-react';
import './Notifications.scss';

const NotificationItem = ({ avatar, message, time, icon }) => (
  <div className="notification-item">
    <div className="notification-left">
      <img src={avatar} alt="User avatar" className="avatar" />
      <div className="notification-content">
        <p className="message">{message}</p>
        <span className="time">{time}</span>
      </div>
    </div>
    <div className="notification-right">
      <img src={icon} alt="Notification icon" className="notification-icon" />
    </div>
  </div>
);

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      avatar: "/coach-avatar.jpg",
      message: "COACH 1 HAS TAGGED YOU IN A VIDEO",
      time: "15 minutes ago",
      icon: "/video-icon.jpg",
      isNew: true
    },
    {
      id: 2,
      avatar: "/event-avatar.jpg",
      message: "2 WEEKS UNTIL NATIONAL QUALIFIES",
      time: "15 minutes ago",
      icon: "/event-icon.jpg",
      isNew: true
    },
    {
      id: 3,
      avatar: "/coach-avatar.jpg",
      message: "COACH 1 HAS TAGGED YOU IN A VIDEO",
      time: "30 minutes ago",
      icon: "/video-icon.jpg",
      isNew: false
    },
    {
      id: 4,
      avatar: "/coach-avatar.jpg",
      message: "COACH 1 HAS TAGGED YOU IN A VIDEO",
      time: "4 days ago",
      icon: "/video-icon.jpg",
      isNew: false
    },
    {
      id: 5,
      avatar: "/coach-avatar.jpg",
      message: "COACH 1 HAS TAGGED YOU IN A VIDEO",
      time: "5 days ago",
      icon: "/video-icon.jpg",
      isNew: false
    }
  ];

  return (
    <div className="notifications-page">
      <header className="header">
        <div className="header-left">
          <button className="btn-icon">
            <Home size={20} />
            <span>HOME</span>
          </button>
        </div>
        <div className="header-right">
          <button className="btn-icon notification">
            <Bell size={20} />
          </button>
          <button className="btn-icon profile">
            <UserCircle size={20} />
          </button>
          <button className="btn-help">
            <HelpCircle size={20} />
            <span>HELP</span>
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="title-section">
          <Bell size={24} className="bell-icon" />
          <h1>NOTIFICATIONS</h1>
        </div>

        <div className="notifications-section">
          <h2>NEW NOTIFICATIONS</h2>
          <div className="notifications-list">
            {notifications
              .filter(notif => notif.isNew)
              .map(notification => (
                <NotificationItem key={notification.id} {...notification} />
              ))}
          </div>

          <h2>OLDER NOTIFICATIONS</h2>
          <div className="notifications-list">
            {notifications
              .filter(notif => !notif.isNew)
              .map(notification => (
                <NotificationItem key={notification.id} {...notification} />
              ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;