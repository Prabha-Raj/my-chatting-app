import React, { useState, useEffect, useRef } from "react";
import { 
  FiSearch, 
  FiUser, 
  FiMessageSquare, 
  FiArrowLeft,
  FiX,
  FiChevronDown, 
  FiLogOut,
  FiMenu
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useSocketContext } from "../../context/SocketContext";

const Sidebar = ({
  chattedUsers = [],
  searchResults = [],
  onSelectUser,
  selectedUser,
  onSearch,
  loading = false,
  error = null,
  onClose,
  isMobile = false,
  onNavigateToProfile 
}) => {
  const { logout, authUser } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchInputRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Unread messages state - storing count by user ID
  const [unreadCounts, setUnreadCounts] = useState({});

  // Socket logic
  const { socket, onlineUsers } = useSocketContext();
  
  // Handle new messages for unread count tracking
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      // Only count messages from other users, not messages sent by current user
      if (newMessage.senderId !== authUser.user._id) {
        // Don't increment count if this is the currently selected user
        if (!selectedUser || newMessage.senderId !== selectedUser._id) {
          setUnreadCounts(prev => ({
            ...prev,
            [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
          }));
        }
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, authUser.user._id, selectedUser]);

  // Reset unread count when selecting a user
  useEffect(() => {
    if (selectedUser?._id) {
      setUnreadCounts(prev => ({
        ...prev,
        [selectedUser._id]: 0
      }));
    }
  }, [selectedUser]);
  
  // Handle outside clicks for profile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-focus search input when searching
  useEffect(() => {
    if (isSearching) {
      searchInputRef.current?.focus();
    }
  }, [isSearching]);

  // Handle search on input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim()) {
        handleSearch();
      } else {
        resetToChats();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, onSearch]);

  const handleSearch = () => {
    if (searchInput.trim()) {
      onSearch(searchInput);
      setIsSearching(true);
    }
  };

  const resetToChats = () => {
    setSearchInput("");
    setIsSearching(false);
    onSearch("");
  };

  const handleLogout = () => {
    logout();
    toast.success("You are logged out!");
  };

  const openProfile = () => {
    onSelectUser(null);
    if (typeof onNavigateToProfile === 'function') {
      onNavigateToProfile();
    }
    toast.info("Welcome to your profile!");
    setShowProfileMenu(false);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(prev => !prev);
  };

  // Handle selecting a user and reset unread count
  const handleSelectUser = (user) => {
    onSelectUser(user);
    resetToChats();
    
    // Reset unread count for this user
    setUnreadCounts(prev => ({
      ...prev,
      [user._id]: 0
    }));
    
    if (isMobile) onClose();
  };

  // Determine which users to display
  const displayUsers = isSearching ? searchResults : chattedUsers;
  const showBackButton = isSearching || (searchInput.trim() && searchResults.length > 0);

  return (
    <div className={`w-full ${isMobile ? 'fixed inset-0 z-50 bg-white' : 'md:w-80 lg:w-96'} h-full flex flex-col border-r border-gray-200 shadow-md`}>
      {/* Header */}
      <header className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm">
        {/* Left section: Menu/Back button + title */}
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-indigo-700 transition p-1"
              aria-label="Close sidebar"
            >
              <FiX size={24} />
            </button>
          )}
          {showBackButton && !isMobile && (
            <button
              onClick={resetToChats}
              className="text-gray-600 hover:text-indigo-700 transition p-1"
              aria-label="Back to chats"
            >
              <FiArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-lg md:text-xl font-bold text-indigo-700">
            {isSearching || searchInput.trim() ? "Search Results" : "Messages"}
          </h1>
        </div>

        {/* Right section: User profile + dropdown */}
        <div 
          ref={profileMenuRef}
          className="relative flex items-center gap-2 cursor-pointer"
          onClick={toggleProfileMenu}
        >
          <img
            src={
              authUser.user?.profilePic ||
              `https://avatar.iran.liara.run/public/${authUser?.user?.gender === 'female' ? 'girl' : 'boy'}?username=${authUser?.user?.username}`
            }
            alt="My profile"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full border hover:scale-105 transition"
          />
          {!isMobile && (
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                {authUser?.user?.fullName || authUser?.user?.username}
              </p>
              <p className="text-xs text-gray-500">@{authUser?.user?.username}</p>
            </div>
          )}
          {!isMobile && <FiChevronDown className="text-gray-500" />}
          
          {/* Dropdown menu */}
          {showProfileMenu && (
            <div className={`absolute ${isMobile ? 'left-0' : 'right-0'} top-10 md:top-12 w-48 bg-white border rounded-lg shadow-lg z-40`}>
              <button
                onClick={openProfile}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-2"
              >
                <FiUser /> View Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600 flex items-center gap-2"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Search Section */}
      <section className="p-3 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <FiSearch />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search users..."
            className="w-full pl-10 pr-10 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            aria-label="Search users"
          />
          {searchInput && (
            <button
              onClick={resetToChats}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-500">{error}</p>
        )}
      </section>

      {/* User List Section */}
      <section className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (isSearching || searchInput.trim()) && displayUsers.length === 0 ? (
          <div className="p-4 text-center">
            <FiSearch className="mx-auto text-gray-400 text-2xl mb-2" />
            <p className="text-gray-500 text-sm">No users found</p>
            <button
              onClick={resetToChats}
              className="mt-2 text-indigo-600 text-sm hover:underline flex items-center justify-center mx-auto"
            >
              <FiArrowLeft className="mr-1" size={14} />
              Back to messages
            </button>
          </div>
        ) : displayUsers.length === 0 ? (
          <div className="p-4 text-center">
            <FiMessageSquare className="mx-auto text-gray-400 text-2xl mb-2" />
            <p className="text-gray-500 text-sm">No conversations yet</p>
          </div>
        ) : (
          <ul>
            {displayUsers.map((user) => {
              // Check if user is online
              const isUserOnline = onlineUsers.includes(user._id);
              // Get unread count for this user
              const unreadCount = unreadCounts[user._id] || 0;
              
              return (
                <li 
                  key={user._id}
                  onClick={() => handleSelectUser(user)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition ${
                    selectedUser?._id === user._id
                      ? "bg-indigo-50 text-indigo-800"
                      : "hover:bg-gray-50 text-gray-800"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={user.profilePic || `https://avatar.iran.liara.run/public/${user.gender === 'female' ? 'girl' : 'boy'}?username=${user.username}`}
                      alt={`${user.fullName || user.username}'s profile`}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    {isUserOnline && (
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.fullName || user.username}</p>
                    <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                  </div>
                  {/* Unread message count badge */}
                  {unreadCount > 0 && (
                    <div className="flex-shrink-0">
                      <div className="bg-indigo-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Mobile-only logout button (desktop has it in dropdown) */}
      {isMobile && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;