import cloudinary from '../Config/cloudinary.js';
import Video from '../Models/videoModels.js';

// Upload Video
export const uploadVideo = async (req, res) => {
  try {
    const { title, privacy } = req.body;
    const file = req.file;
    
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      resource_type: 'video',
      folder: 'videos'
    });

    const newVideo = new Video({
      title,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      privacy
    });

    await newVideo.save();
    res.status(201).json({ message: 'Video uploaded successfully', video: newVideo });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ message: 'Video upload failed' });
  }
};

// Get Videos with Pagination & Filtering
export const getVideos = async (req, res) => {
  try {
    const { page = 1, limit = 10, privacy } = req.query;
    const query = privacy ? { privacy } : {};

    const videos = await Video.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ uploadedAt: -1 });

    const total = await Video.countDocuments(query);

    res.status(200).json({
      videos,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Failed to fetch videos' });
  }
};
