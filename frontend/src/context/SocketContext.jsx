import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => { // Changed to lowercase 'children'
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]); // More consistent naming
    const { authUser } = useAuth();

    useEffect(() => {
        if (authUser) {
            // const newSocket = io("http://localhost:3000/", {
            const newSocket = io("https://chat-with-prabha.onrender.com", {
                query: {
                    userId: authUser.user._id
                }
            });

            newSocket.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [authUser]);

    // Added return statement
    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};