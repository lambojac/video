import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import VideoUpload from './pages/VideoUpload/VideoUpload';
// import VideoAnalysis from './pages/VideoAnalysis/VideoAnalysis';
import Notifications from './pages/Notifications/Notifications';
import Annotation from './pages/Annotation/Annotation';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      {/* {user && <Navbar />} */}
      <Routes>
         <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login/>}/> 
        <Route path="/" element={<Register />} />
        <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/upload" element={<VideoUpload />} />
      {/* <Route path="/anotation" element={<VideoAnalysis/>} />  */}
      <Route path="/notifications" element={<Notifications /> }/>
      <Route path="/annotation/:id" element={<Annotation /> }/>
         {/*  <Route path="/annotations" element={user ? <Annotations /> : <Navigate to="/login" />} />
        
        */} 
      </Routes>
    </Router>
  );
}

export default App;
