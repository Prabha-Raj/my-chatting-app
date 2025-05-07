import express from "express";
import { getCurrentChatters, getMessages, sendMessage } from "../controllers/messageController.js";
import isLogin from "../middlewares/isLogin.js";

const router = express.Router();

router.post("/send/:receiverId", isLogin, sendMessage);
// Get messages with a specific user
router.get("/get/:receiverId", isLogin, getMessages);
router.get("/current-chatters/", isLogin, getCurrentChatters);
export default router;
