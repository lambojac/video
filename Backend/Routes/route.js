require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const annotationRoutes = require('./routes/annotationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { authenticateUser } = require('./middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected')).catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', authenticateUser, videoRoutes);
app.use('/api/annotations', authenticateUser, annotationRoutes);
app.use('/api/notifications', authenticateUser, notificationRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
