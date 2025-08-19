const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const customerRoutes = require("./routes/customerRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

connectDB();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);

app.get("/api/customers/magic-link", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) return res.status(400).json({ message: "Token missing" });

    return res.json({
      message: "Magic link clicked. Implement login logic here.",
    });
  } catch (error) {
    console.error("Magic link error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => console.log("Client disconnected"));
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = io;
