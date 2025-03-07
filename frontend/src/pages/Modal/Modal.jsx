import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';

const VideoTagModal = ({ videoId, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTaggableUsers = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/notification/tagable-users`);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchTaggableUsers();
  }, []);

  const handleTagUser = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/notification/${videoId}/tag`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        alert('User tagged successfully!');
        onClose();
      }
    } catch (error) {
      console.error('Error tagging user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tag-user-modal">
      <div className="modal-content">
        <h3>Tag a User</h3>
        <div className="user-list">
          {users.map(user => (
            <div 
              key={user._id} 
              className="user-item"
              onClick={() => handleTagUser(user._id)}
            >
              <UserPlus /> {user.userName}
            </div>
          ))}
        </div>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default VideoTagModal;