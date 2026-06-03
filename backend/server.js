const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");
const connectDB = require("./config/db");
const { setupSocketIO } = require("./services/socketService");

const app = express();
const server = http.createServer(app);

// ------------------------------------------------------------------
// CORS – allow the deployed frontend (and localhost during dev)
// ------------------------------------------------------------------
const allowedOrigins = [
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.trim() : null,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`⚠️ [CORS Blocked] Incoming Origin: "${origin}" | Allowed Origins:`, allowedOrigins);
      return callback(new Error(`CORS: ${origin} not allowed`));
    },
    credentials: true,
  })
);

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io accessible to other routes
app.io = io;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB();

// Setup Socket.IO
setupSocketIO(io);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/user"));
app.use("/api/groups", require("./routes/groups"));
app.use("/api/discussions", require("./routes/discussions"));
app.use("/api/files", require("./routes/files"));
app.use("/api/notifications", require("./routes/notifications"));

app.get("/", (req, res) => {
  res.json({ message: "StudyBudy API is running ✅" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
