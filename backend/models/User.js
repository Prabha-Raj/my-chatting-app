// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    required:true,
    default: '', 
  },
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User
