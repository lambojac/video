// // 
// // Controllers/uploads.js
// import User from "../Models/userModel.js";
// import cloudinary from "../Config/cloudinary.js";
// import fs from 'fs';

// // Upload Banner
// export const banner = async (req, res) => {
//     try {
//       const user = await User.findById(req.params.id);
  
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
  
//       if (!req.file) {
//         return res.status(400).json({ message: "No image file provided" });
//       }
  
//       // Upload to Cloudinary
//       const result = await cloudinary.uploader.upload(req.file.path, {
//         folder: "banners",
//         resource_type: "image",
//       });
  
//       // Save Cloudinary URL to MongoDB
//       user.banner = result.secure_url;
//       await user.save();
  
//       // Delete the temporary file
//       fs.unlinkSync(req.file.path);
  
//       res.json({
//         success: true,
//         message: "Banner uploaded successfully",
//         banner: result.secure_url,
//       });
//     } catch (error) {
//       console.error("Error uploading banner:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   };
  
  
//   // Upload Profile Picture
// export const profilePic = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (!req.file) {
//       return res.status(400).json({ message: "No image file provided" });
//     }

//     // Upload to Cloudinary
//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: "avatars",
//       resource_type: "image",
//     });

//     // Save Cloudinary URL to MongoDB
//     user.avatar = result.secure_url;
//     await user.save();

//     // Delete the temporary file
//     fs.unlinkSync(req.file.path);

//     res.json({
//       success: true,
//       message: "Avatar uploaded successfully",
//       avatar: result.secure_url,
//     });
//   } catch (error) {
//     console.error("Error uploading avatar:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

http://localhost:2000/api/video?privacy=private&page=1&limit=5

http://localhost:2000/api/video/upload