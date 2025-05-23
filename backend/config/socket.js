import { Server } from "socket.io";
import http from "http";
import express from "express";


const app = express();

const server = http.createServer(app);
const serverURL = process.env.SERVER_URL
const io = new Server(server,{
    cors:{
        origin:[serverURL],
        methods:["GET", "POST"]
    }
});

export const getReceiverSocketId = (receiverId)=>{
    return userSocketmap[receiverId];
}

const userSocketmap = {}; //  userId, socktId
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    if(userId !== "undefine") userSocketmap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketmap));

    socket.on("disconnect", ()=>{
        delete userSocketmap[userId]
        io.emit("getOnlineUsers", Object.keys(userSocketmap))
    })
});

export {app, io, server}

