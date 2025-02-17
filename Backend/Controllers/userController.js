import asyncHandler from "express-async-handler";
import User from "../Models/userModel.js";
import genToken from "../utils/tokenGen.js";
import bcrypt from "bcryptjs";

// Register User
export const registerUser = asyncHandler(async (req, res) => {
    const { fullName, userName, email, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !userName) {
        res.status(400);
        throw new Error("Please provide all required fields.");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(400);
        throw new Error("User with this email already exists.");
    }

    // Hash the password before storing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const user = await User.create({
        fullName,
        email,
        password: hashedPassword,
        userName
    });

    if (user) {
        // Generate a JWT token
        const token = genToken(user._id);

        // Set the token in an HTTP-only cookie
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
            sameSite: "none",
            secure: true,
        });

        res.status(201).json({
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            userName: user.userName,
            createdAt: user.createdAt,
            token,
        });
    } else {
        res.status(400);
        throw new Error("Failed to register user.");
    }
});

// Login User
export const loginUser = asyncHandler(async (req, res) => {
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
        throw new Error("User not found, please sign up!");
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
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
            sameSite: "none",
            secure: true,
        });

        const { fullName, userName, email } = user;

        // Include the user ID in the response
        res.status(200).json({
            id: user._id,
            fullName,
            userName,
            email,
            token,
        });
    } else {
        res.status(400);
        throw new Error("Invalid email or password.");
    }
});

// Logout
export const logOut = asyncHandler(async (req, res) => {
    // Expire the session
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(),
        sameSite: "none",
        secure: true,
    });
    return res.status(200).json({ message: "You are successfully logged out." });
});
// get userbyid
export const getUserById = asyncHandler(async (req, res) => {
  try {
    // Extract user from auth middleware
    const user = req.user;

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Fetch the user's details
    const userData = await User.findById(user._id).select("userName email banner avatar fullName");

    res.status(200).json({ 
      success: true, 
      message: "User successfully retrieved", 
      data: userData 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }
});
// search users
export const searchUsers= async (req, res) => {
  let { search } = req.query;

  // If search is an array, take the first value and make sure it's a string
  if (Array.isArray(search)) {
      search = search[0];
  }

  // Ensure search is a string
  if (typeof search !== 'string') {
      search = '';
  }

  // Build the query object
  const query= {};

  // If search term is provided, filter by fullName or userName
  if (search.trim()) {
      query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { userName: { $regex: search, $options: 'i' } }
      ];
  }

  // Fetch users based on the query
  const users = await User.find(query)
      .select('fullName userName email avatar banner');

  res.status(200).json({ users });
}