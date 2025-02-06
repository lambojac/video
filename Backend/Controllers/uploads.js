import User from "../Models/userModel";

// Upload Avatar (Profile Picture)
export const profilePic = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Convert the image buffer to Base64
    const avatar = req.file ? req.file.buffer.toString('base64') : null;

    // Store the Base64 string in MongoDB
    user.avatar = avatar;
    await user.save();

    res.json({ message: "Avatar uploaded successfully", avatar: user.avatar });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload Banner
export const banner = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Convert the image buffer to Base64
    const banner = req.file ? req.file.buffer.toString('base64') : null;

    // Store the Base64 string in MongoDB
    user.banner = banner;
    await user.save();

    res.json({ message: "Banner uploaded successfully", banner: user.banner });
  } catch (error) {
    console.error("Error uploading banner:", error);
    res.status(500).json({ message: "Server error" });
  }
};


