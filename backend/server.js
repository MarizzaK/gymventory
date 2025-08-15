const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Lägg till detta för statiska filer

app.use("/api/products", productRoutes);

// Socket.IO för realtidsuppdatering
io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => console.log("Client disconnected"));
});

// Skicka uppdatering när CRUD ändras
// För detta behöver vi lägga till det i dina routes senare

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = io; // exportera io så vi kan använda det i productRoutes
