import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    avatar: { type: String, default: "/default-avatar.jpg" },
    banner: { type: String, default: "/default-banner.jpg" },
  
  notifications: [{
    type: { type: String, enum: ['video_tag', 'event', 'message'] },
    content: String,
    relatedEntity: { type: mongoose.Schema.Types.ObjectId, refPath: 'notificationModel' },
    notificationModel: { type: String, enum: ['Video', 'Event', 'Message'] },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
},
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
