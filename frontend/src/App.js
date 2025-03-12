import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import VideoUpload from './pages/VideoUpload/VideoUpload';
// import VideoAnalysis from './pages/VideoAnalysis/VideoAnalysis';
import Notifications from './pages/Notifications/Notifications';
import Annotation from './pages/Annotation/Annotation';
import VideoComparison from './pages/VideoComparison/VideoComparison';

// Protected Route component
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  
  // Redirect to login if no token exists
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Render the child routes
  return <Outlet />;
};

function App() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check for token and user data on component mount
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  return (
    <Router>
      {/* {user && <Navbar />} */}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Register />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/upload" element={<VideoUpload />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/annotation/:id" element={<Annotation />} />
          <Route path="/comparison/:id" element={<VideoComparison />} />
          {/* <Route path="/anotation" element={<VideoAnalysis/>} /> */}
          {/* <Route path="/annotations" element={<Annotations />} /> */}
        </Route>
        
        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;