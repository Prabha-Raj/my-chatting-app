import { useState, useEffect, useRef } from "react";
import {
  FiUser,
  FiSend,
  FiMoreVertical,
  FiPhone,
  FiVideo,
  FiPaperclip,
  FiSmile,
  FiMic,
  FiCircle,
  FiX,
  FiChevronDown,
  FiArrowLeft,
  FiTrash2,
  FiArchive
} from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { emojiData } from "../../assets/emojis";
import { useSocketContext } from "../../context/SocketContext";
import notification from "../../assets/notification.mp3"
import congratulation from "../../assets/congratulation.mp3"
// Emoji data array with categories

const MessageContainer = ({ selectedUser, isMobile, onSelectUser }) => {
  const { authUser } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [recentEmojis, setRecentEmojis] = useState(["👍", "❤️", "😊", "😂", "👋", "🎉", "👏", "🙏"]);

  const messageEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);


  // socket
  const { socket, onlineUsers } = useSocketContext()
  const isUserOnline = onlineUsers.includes(selectedUser._id);
  // Fix this useEffect in MessageContainer.jsx
  useEffect(() => {
    if (!socket) return; // Add this guard clause

    const handleNewMessage = (newMessage) => {
      const sound = new Audio(notification);
      sound.play();
      setMessages(prev => [...prev, newMessage]); // Changed from setMessage to setMessages
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket]); // Removed message and setMessage from dependencies

  
  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages when selectedUser changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `/api/messages/get/${selectedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${authUser.token}`,
            },
          }
        );

        setMessages(response.data.messages || []);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser, authUser.token]);

  // Handle outside click to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        event.target.id !== "emoji-button"
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    try {
      // Optimistically add the message to UI
      const newMessage = {
        _id: Date.now().toString(), // Temporary ID
        senderId: {
          _id: authUser.user._id,
          fullName: authUser.user.fullName,
          username: authUser.user.username,
          profilePic: authUser.user.profilePic
        },
        message: message,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage("");

      // Send to backend
      await axios.post(`/api/messages/send/${selectedUser._id}`, { message }, {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
      );

      // Refetch messages to get the actual message from server
      const response = await axios.get(`/api/messages/get/${selectedUser._id}`, {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      }
      );

      setMessages(response.data.messages || []);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
      // Remove the optimistic message if send fails
      setMessages(prev => prev.filter(m => m._id !== Date.now().toString()));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev);
  };

  const handleEmojiClick = (emoji) => {
    // Insert emoji at current cursor position
    const cursorPosition = inputRef.current.selectionStart;
    const textBeforeCursor = message.substring(0, cursorPosition);
    const textAfterCursor = message.substring(cursorPosition);

    setMessage(textBeforeCursor + emoji + textAfterCursor);

    // Update recent emojis
    if (!recentEmojis.includes(emoji)) {
      setRecentEmojis(prev => [emoji, ...prev.slice(0, 7)]);
    } else {
      // Move the emoji to the front if already in recents
      setRecentEmojis(prev => [emoji, ...prev.filter(e => e !== emoji).slice(0, 7)]);
    }

    // Focus back on input and set cursor position after the inserted emoji
    setTimeout(() => {
      inputRef.current.focus();
      const newPosition = cursorPosition + emoji.length;
      inputRef.current.setSelectionRange(newPosition, newPosition);
    }, 10);
  };

  const handleQuickEmojiSend = (emoji) => {
    // Send the emoji immediately as a message
    const tempMessage = emoji;
    setMessage(tempMessage);

    // Add to recent emojis
    if (!recentEmojis.includes(emoji)) {
      setRecentEmojis(prev => [emoji, ...prev.slice(0, 7)]);
    } else {
      setRecentEmojis(prev => [emoji, ...prev.filter(e => e !== emoji).slice(0, 7)]);
    }

    // Use setTimeout to ensure state update before sending
    setTimeout(() => {
      handleSendMessage();
    }, 0);
  };

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  const handleCloseChat = () => {
    setShowDropdown(false);
    onSelectUser(null)
    toast.info("Chat closed");
  };

  const handleDeleteChat = async () => {
    if (!selectedUser) return;

    try {
      await axios.delete(`/api/messages/delete-chat/${selectedUser._id}`, {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      });

      toast.success("Chat deleted successfully");
      handleCloseChat();
    } catch (err) {
      console.error("Error deleting chat:", err);
      toast.error("Failed to delete chat");
    }
  };

  const handleArchiveChat = async () => {
    if (!selectedUser) return;

    try {
      await axios.post(`/api/messages/archive-chat/${selectedUser._id}`, {}, {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      });

      toast.success("Chat archived successfully");
      handleCloseChat();
    } catch (err) {
      console.error("Error archiving chat:", err);
      toast.error("Failed to archive chat");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {selectedUser ? (
        <>
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm">
            {/* Left side (user info) */}
            <div className="flex items-center gap-3">
              {isMobile && (
                <button
                  onClick={handleCloseChat}
                  className="text-gray-600 hover:text-indigo-600 transition-colors p-1"
                  aria-label="Go back"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="relative">
                <img
                  src={selectedUser.profilePic || `https://avatar.iran.liara.run/public/${selectedUser.gender === 'female' ? 'girl' : 'boy'}?username=${selectedUser.username}`}
                  alt={`${selectedUser.fullName || selectedUser.username}'s profile`}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                {isUserOnline && (
                  <span
                    className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                    aria-hidden="true"
                  ></span>
                )}
              </div>
              <div>
                <p className="font-medium">{selectedUser.fullName || selectedUser.username}</p>
                <div className={`flex items-center text-xs ${isUserOnline ? "text-green-600" : "text-gray-500"}`}>
                  <FiCircle className={`w-2 h-2 mr-1 ${isUserOnline ? "fill-current" : ""}`} />
                  <span>{isUserOnline ? "Online" : "Offline"}</span>
                </div>
              </div>
            </div>

            {/* Right side (action buttons) */}
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50">
                <FiPhone className="w-5 h-5" />
              </button>
              <button className="text-gray-600 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50">
                <FiVideo className="w-5 h-5" />
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="text-gray-600 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50"
                >
                  <FiMoreVertical className="w-5 h-5" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={handleCloseChat}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <FiX className="mr-2" /> Close Chat
                      </button>
                      {/* <button
                        onClick={handleArchiveChat}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <FiArchive className="mr-2" /> Archive Chat
                      </button>
                      <button
                        onClick={handleDeleteChat}
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                      >
                        <FiTrash2 className="mr-2" /> Delete Chat
                      </button> */}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-indigo-50 to-white">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-full text-red-500">
                {error}
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isMe = msg.senderId._id === authUser.user._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 shadow-sm ${isMe
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-white text-gray-800 rounded-bl-none"
                          }`}
                      >
                        {!isMe && (
                          <p className="text-xs font-semibold text-indigo-600 mb-1">
                            {msg.senderId.fullName || msg.senderId.username}
                          </p>
                        )}
                        <p>{msg.message}</p>
                        <p
                          className={`text-xs mt-1 text-right ${isMe ? "text-indigo-200" : "text-gray-500"
                            }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messageEndRef} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <FiUser size={30} className="text-indigo-600" />
                </div>
                <p className="text-lg text-gray-600 font-medium mb-2">
                  Start chatting with {selectedUser.username}!
                </p>
                <p className="text-sm text-gray-500 max-w-md text-center">
                  Send a message to begin your conversation. Be friendly and respectful!
                </p>
              </div>
            )}
          </div>

          {/* Quick Emoji Reaction Bar */}
          <div className="px-4 pt-2 pb-0 bg-white flex justify-center">
            <div className="flex flex-wrap gap-1 justify-center">
              {recentEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickEmojiSend(emoji)}
                  className="text-xl hover:bg-gray-100 rounded-full p-1 transition"
                  aria-label={`Quick emoji ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Input Field */}
          <div className="p-4 border-t bg-white relative">
            <div className="flex items-center gap-2">
              <button className="text-gray-500 hover:text-indigo-600 transition-colors">
                <FiPaperclip className="w-5 h-5" />
              </button>
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full p-3 pl-4 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none resize-none h-12 max-h-40 overflow-auto"
                  style={{ minHeight: "48px" }}
                />
                <button
                  id="emoji-button"
                  onClick={toggleEmojiPicker}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  <FiSmile className="w-5 h-5" />
                </button>
              </div>
              <button className="text-gray-500 hover:text-indigo-600 transition-colors">
                <FiMic className="w-5 h-5" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`p-3 rounded-full ${message.trim()
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  } transition-colors`}
              >
                <FiSend className="w-5 h-5" />
              </button>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute left-4 sm:left-auto sm:right-16 bottom-20 sm:bottom-16 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-72 max-h-80 overflow-hidden"
              >
                <div className="flex justify-between items-center p-2 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700">Choose an emoji</h3>
                  <button
                    onClick={() => setShowEmojiPicker(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                {/* Category tabs */}
                <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 p-1 bg-gray-50">
                  {emojiData.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveCategory(index)}
                      className={`px-2 py-1 text-xs whitespace-nowrap rounded flex-shrink-0 ${activeCategory === index
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      {category.category}
                    </button>
                  ))}
                </div>

                {/* Emoji grid */}
                <div className="p-2 grid grid-cols-8 gap-1 overflow-y-auto max-h-48">
                  {emojiData[activeCategory].emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-xl hover:bg-gray-100 rounded p-1 transition"
                      aria-label={`Emoji ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-xl shadow-sm max-w-sm text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiUser size={40} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Conversation Selected</h3>
            <p className="text-gray-500 mb-6">
              Select a user from the list to start a new conversation or continue chatting.
            </p>
            <div className="flex justify-center">
              <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium">
                Select a contact to start
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;

