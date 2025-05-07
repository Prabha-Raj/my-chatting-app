import { getReceiverSocketId, io } from "../config/socket.js";
import Conversation from "../models/conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { message } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !message) {
      return res.status(400).json({ message: "Receiver and message are required" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    // Create new conversation if it doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    // Create new message
    const newMessage = await Message.create({
      conversationId: conversation._id,
      senderId,
      reciverId: receiverId,
      message,
    });

    // Push message to conversation
    if(newMessage){
        conversation.messages.push(newMessage._id);
    }
    await Promise.all([conversation.save(), newMessage.save()]);
    const populatedMessage = await newMessage.populate("senderId", "fullName username profilePic");
        
    // here will come socket.io logic
    const receiverSocketId = getReceiverSocketId(receiverId)

    if(receiverSocketId){
      io.to(receiverSocketId).emit("newMessage", populatedMessage)

    }

    res.status(201).json({
      message: "Message sent",
      data: populatedMessage,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to send message", error: err.message });
  }
};

// Get messages between logged-in user and receiver
export const getMessages = async (req, res) => {
    try {
      const { receiverId } = req.params;
      const senderId = req.user._id;
  
      if (!receiverId) {
        return res.status(400).json({ message: "Receiver ID is required" });
      }
  
      // Find the conversation
      const conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] }
      });
  
      if (!conversation) {
        return res.status(200).json({ messages: [] }); // No conversation yet
      }
  
      // Populate all messages with sender info
      const messages = await Message.find({ conversationId: conversation._id })
        .populate("senderId", "fullName username profilePic")
        .sort({ createdAt: 1 }); // ascending order
  
      res.status(200).json({ messages });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch messages", error: err.message });
    }
  };
  

// Get all users the current user has chatted with
export const getCurrentChatters = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all conversations where user is a participant
    const conversations = await Conversation.find({ participants: userId });

    // Extract the other participants (not the logged-in user)
    const userIds = new Set();
    conversations.forEach(convo => {
      convo.participants.forEach(participant => {
        if (participant.toString() !== userId.toString()) {
          userIds.add(participant.toString());
        }
      });
    });

    // Fetch user details
    const users = await User.find({ _id: { $in: [...userIds] } }).select("-password -email");

    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chat users", error: err.message });
  }
};
