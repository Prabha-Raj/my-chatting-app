import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import MessageContainer from "./MessageContainer";
import axios from "axios";
import { FiMessageSquare, FiSearch, FiUser, FiMenu, FiX } from "react-icons/fi";

const Message = () => {
  const { authUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [chattedUsers, setChattedUsers] = useState([]);
  const [loading, setLoading] = useState({
    chats: false,
    search: false
  });
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Check screen size and update isMobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch users you've chatted with
  useEffect(() => {
    const fetchChattedUsers = async () => {
      try {
        setLoading(prev => ({ ...prev, chats: true }));
        setError(null);
        
        const res = await axios.get(`/api/messages/current-chatters`, {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        });
        
        setChattedUsers(res.data.users || []);
        
        // Auto-select first user if none selected
        if (!selectedUser && res.data.users?.length > 0) {
          setSelectedUser(res.data.users[0]);
        }
      } catch (err) {
        console.error("Error fetching chatted users", err);
        setError("Failed to load conversations");
      } finally {
        setLoading(prev => ({ ...prev, chats: false }));
      }
    };

    fetchChattedUsers();
  }, [authUser.token]);

  
  // Handle search functionality
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(prev => ({ ...prev, search: true }));
      setError(null);
      
      const res = await axios.get(`/api/users/search?searchQuery=${query}`, {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      });
      
      setSearchResults(res.data.users || []);
    } catch (err) {
      console.error("Search error", err);
      setError("Search failed");
      setSearchResults([]);
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Mobile header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 md:hidden">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            {showSidebar ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            {authUser ? authUser.user.fullName || authUser.user.username : "Messages"}
          </h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>
      )}
      
      {/* Sidebar with integrated search and back button */}
      {(showSidebar || !isMobile) && (
        <div className={`${isMobile ? 'fixed inset-0 z-50 bg-white' : 'relative'} w-full md:w-80 lg:w-96 h-full`}>
          <Sidebar
            chattedUsers={chattedUsers}
            searchResults={searchResults}
            onSelectUser={handleSelectUser}
            selectedUser={selectedUser}
            onSearch={handleSearch}
            loading={loading.search || loading.chats}
            error={error}
            onClose={() => setShowSidebar(false)}
            isMobile={isMobile}
          />
        </div>
      )}
      
      {/* Main message area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedUser ? (
          <MessageContainer 
            selectedUser={selectedUser} 
            onSelectUser={setSelectedUser}
            key={selectedUser._id}
            onMenuClick={() => setShowSidebar(true)}
            isMobile={isMobile}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
            <div className="text-center p-6 md:p-8 bg-white rounded-xl shadow-lg w-full max-w-md">
              {/* User Profile Card */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <img
                    src={authUser.user.profilePic || `https://avatar.iran.liara.run/public/boy?username=${authUser.user.username}`}
                    alt="Your profile"
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-indigo-100 shadow-md"
                  />
                  <span className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white"></span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  Welcome, {authUser.user.fullName || authUser.user.username}!
                </h2>
                <p className="text-indigo-600 mt-1 text-sm md:text-base">@{authUser.user.username}</p>
              </div>

              {/* Welcome Message */}
              <div className="mb-6 md:mb-8">
                <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2 md:mb-3">
                  {chattedUsers.length === 0 
                    ? 'Start your messaging journey'
                    : 'Continue your conversations'}
                </h3>
                <p className="text-gray-500 text-sm md:text-base">
                  {chattedUsers.length === 0
                    ? 'Connect with others by searching for users or sharing your profile link'
                    : 'Select a chat from the sidebar or find new people to connect with'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 md:gap-3">
                <button
                  onClick={() => {
                    if (isMobile) {
                      setShowSidebar(true);
                      setTimeout(() => {
                        document.querySelector('input[aria-label="Search users"]')?.focus();
                      }, 300);
                    } else {
                      document.querySelector('input[aria-label="Search users"]')?.focus();
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md text-sm md:text-base"
                >
                  <FiSearch className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Find People to Chat</span>
                </button>
                
                {chattedUsers.length > 0 && (
                  <button
                    onClick={() => handleSelectUser(chattedUsers[0])}
                    className="flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-white text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition text-sm md:text-base"
                  >
                    <FiMessageSquare className="w-4 h-4 md:w-5 md:h-5" />
                    <span>View Latest Conversation</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;