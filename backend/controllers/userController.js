import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';


// register user
export const registerUser = async (req, res) => {
    try {
      const { fullName, username, email, gender, password, profilePic } = req.body;
  
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: 'Email or username already in use' });
      }
  
      let profilePicForBoy = "";
      let profilePicForGirl = "";
  
      if (!profilePic) {
        if (gender === "male") profilePicForBoy = `https://avatar.iran.liara.run/public/boy?${username}`;
        if (gender === "female") profilePicForGirl = `https://avatar.iran.liara.run/public/girl?${username}`;
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = await User.create({
        fullName,
        username,
        email,
        gender,
        password: hashedPassword,
        profilePic: profilePic || profilePicForBoy || profilePicForGirl,
      });
  
      return res.status(201).json({
        message: 'User registered successfully',
        username: newUser.username,
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic
      });
    } catch (err) {
      res.status(500).json({ message: 'Registration failed', error: err.message });
    }
  };
  
// Login User
export const loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Login successful', token, user });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

// Get Single User
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};

// Update User Profile
export const updateUser = async (req, res) => {
  try {
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};


// Search users by query in fullName, username, or email
export const getUsersBySearchQuery = async (req, res) => {
  try {
    const { searchQuery } = req.query;

    if (!searchQuery || searchQuery.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const regex = new RegExp(searchQuery, "i"); // case-insensitive

    const users = await User.find({
      $or: [
        { fullName: regex },
        { username: regex },
        { email: regex },
      ],
    }).select("-password"); // Exclude password field

    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Failed to search users", error: err.message });
  }
};
