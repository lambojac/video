
import Video from '../Models/videoModels.js';
import User from "../Models/userModel.js"

// Get users to tag
 export const TaggableUser=async (req, res) => {
    try {
      const users = await User.find({}).select('userName');
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
    }
  }

// Tag a user in a video
export const tagUser= async (req, res) => {
  const { videoId } = req.params;
  const { userId } = req.body;

  try {
    // Find video and user
    const video = await Video.findById(videoId);
    const user = await User.findById(userId);

    if (!video || !user) {
      return res.status(404).json({ message: 'Video or User not found' });
    }

    // Check if already tagged
    const alreadyTagged = video.tags.some(tag => tag.user.equals(userId));
    if (alreadyTagged) {
      return res.status(400).json({ message: 'User already tagged' });
    }

    // Add tag to video
    video.tags.push({ user: userId });
    await video.save();

    // Create notification for tagged user
    user.notifications.push({
      type: 'video_tag',
      content: `You were tagged in a video: ${video.title}`,
      relatedEntity: videoId,
      notificationModel: 'Video'
    });
    await user.save();

    res.status(200).json({ message: 'User tagged successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error tagging user', error });
  }
}

// Get user notifications
export const Notifications= async (req, res) => {
  const userId = req.user 

  try {
    const user = await User.findById(userId)
      .populate({
        path: 'notifications.relatedEntity',
        model: 'Video'
      });

    const newNotifications = user.notifications.filter(n => !n.isRead);
    const olderNotifications = user.notifications.filter(n => n.isRead);

    res.json({
      newNotifications,
      olderNotifications,
      unreadCount: newNotifications.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error });
  }
}