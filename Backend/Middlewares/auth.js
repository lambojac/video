// Middlewares/auth.js
import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';

export const protect = async (req, res, next) => {
  try {
    // Get token from cookies or authorization header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Not authorized' });
  }
};