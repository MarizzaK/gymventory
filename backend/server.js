require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Stripe = require("stripe");

const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const Product = require("./models/product");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", require("./routes/orderRoutes"));

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

const userSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  email: String,
  address: String,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

app.get("/user/:googleId", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    res.json(user || {});
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Spara/uppdatera adress
app.post("/user/:googleId/address", async (req, res) => {
  try {
    const { address } = req.body;
    const user = await User.findOneAndUpdate(
      { googleId: req.params.googleId },
      { address },
      { new: true, upsert: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- Stripe PaymentIntent ---
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { cart, name, address } = req.body;
    console.log("Request body:", { cart, name, address });

    const amount = Math.round(
      cart.reduce((acc, item) => acc + item.price * 100, 0)
    );
    console.log("Amount in cents:", amount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { name, address },
    });

    console.log("PaymentIntent created:", paymentIntent.id);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("PaymentIntent error full:", error);
    res
      .status(500)
      .json({ error: error.message || "Något gick fel vid betalning" });
  }
});

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/ignite")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = io;
