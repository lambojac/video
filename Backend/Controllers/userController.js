import asyncHandler from "express-async-handler";
import User from "../Backend/Models/userModel.js";
import genToken from "./tokenGen.js"; 
import asynchandler from "express-async-handler";
import bcrypt from "bcryptjs";
import genToken from "../Backend/utils/tokenGen.js";
// registeruser
export const registerUser = asyncHandler(async (req, res) => {
    const { fullName, userName, email, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password||!userName) {
        res.status(400);
        throw new Error("Please provide all required fields.");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(400);
        throw new Error("User with this email already exists.");
    }

    // Create a new user
    const user = await User.create({
        fullName,
        email,
        password, 
        phone_number,
    });

    if (user) {
        // Generate a JWT token
        const token = genToken(user._id);

        // Set the token in an HTTP-only cookie
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // Expires in 1 day
            sameSite: "none",
            secure: true, // Set to true if using HTTPS
        });

        res.status(201).json({
            id: user._id,
            full_name: user.full_name,
            email: user.email,
            phone_number: user.phone_number,
            createdAt: user.createdAt,
            token,
            role
        });
    } else {
        res.status(400);
        throw new Error("Failed to register user.");
    }
});



// loginuser
export const loginUser = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide correct email and password.");
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error("User not found, Please sign up!");
  }

  // Check password
  const passwordIsValid = await bcrypt.compare(password, user.password);

  if (passwordIsValid) {
    // Generate token
    const token = genToken(user._id);

    // Send cookie to server
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 24 * 60 * 60), // Expires in 1 day
      sameSite: "none",
      secure: true,
    });

    const {
        fullName, userName, email,
    } = user;

    // Include the user ID in the response
    res.status(200).json({
        fullName, userName, email,
    });
  } else {
    res.status(400);
    throw new Error("Invalid Email or password.");
  }
});
// logout
export const logOut = asynchandler(async (req, res) => {
  // expire the session
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({ message: "you are Sucessfully logged out" });
});



