const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();

const corsOptions = {
  origin: process.env.CORS_URLS || [
    "https://realtime-poll-woc.netlify.app",
    "https://realtime-poll-admin.netlify.app",
    "*",
    "http://127.0.0.1:5501",
    "http://192.168.1.10:5501",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// let users = {};

let polls = {}; // Store polls in memory

// Handle socket connection
io.on("connection", (socket) => {
  console.log("A user connected");
  console.log(polls);

  //   users[socket.id] = socket.id;
  //   console.log(`User connected: ${socket.id}`);

  // Listen for poll creation
  socket.on("create-poll", (poll) => {
    const pollId = Date.now().toString(); // Generate a unique poll ID
    polls[pollId] = poll; // Save poll in memory

    console.log(`Poll created: ${pollId}`);
    console.log(poll);

    // Broadcast the new poll to all clients
    io.emit("new-poll", { pollId, ...poll });
  });

  // Listen for voting events
  socket.on("vote", ({ pollId, optionId }) => {
    const poll = polls[pollId];

    if (poll) {
      // Update vote count in poll options
      const updatedOptions = poll.options.map((option) =>
        option.id === optionId ? { ...option, votes: option.votes + 1 } : option
      );
      polls[pollId] = { ...poll, options: updatedOptions };

      // Debugging logs
      console.log(`Vote cast on poll ${pollId}, option ${optionId}`);
      console.log("Updated poll data:", polls[pollId]);

      // Broadcast the updated poll to all clients
      io.emit("vote-update", { pollId, ...polls[pollId] });
    }
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    delete users[socket.id];
  });
});

// Start the server
server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
