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
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
