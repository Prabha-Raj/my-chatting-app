import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import ConnectDB from "./config/db.js";
import {app, server} from "./config/socket.js";
import path from "path";


const __dirname = path.resolve()
dotenv.config();

app.use(express.json());
app.use(cors()); // <-- fixed here

ConnectDB();

// import routes 
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

// apis end points 
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.use(express.static(path.join(__dirname,"frontend/dist")))
app.get(/^\/(?!api).*/, (req, res) => {  // Match all routes except those starting with /api
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).send('Something broke!');
});

// app.get("/", (req, res) => {
//   res.send("I'm coming from backend");
// });

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("Server is running at port:", port);
});
