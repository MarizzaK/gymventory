const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const Customer = require("../models/Customer");

const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);

const transporter = nodemailer.createTransport({
  service: "icloud",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const createToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ------------------------
// Auth middleware
// ------------------------
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ------------------------
// Google login
// ------------------------
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await Customer.findOne({ email: payload.email });
    if (!user) {
      user = await Customer.create({
        name: payload.name,
        email: payload.email,
        cart: [],
      });
    }

    const jwtToken = createToken(user);
    res.json({ token: jwtToken, user });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(400).json({ message: "Google login failed" });
  }
});

// ------------------------
// Magic code
// ------------------------
router.post("/send-code", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    let user = await Customer.findOne({ email });
    if (!user) {
      user = await Customer.create({
        email,
        name: email.split("@")[0],
        cart: [],
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.magicCode = code;
    user.codeExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your verification code",
      text: `Your code is: ${code}`,
    });

    res.json({ message: "Code sent" });
  } catch (err) {
    console.error("Send code error:", err);
    res.status(500).json({ message: "Failed to send code" });
  }
});

router.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await Customer.findOne({ email });

    if (!user || user.magicCode !== code || user.codeExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid code" });
    }

    if (!user.name) user.name = email.split("@")[0];

    user.magicCode = null;
    user.codeExpiresAt = null;
    await user.save();

    const jwtToken = createToken(user);
    res.json({ token: jwtToken, user });
  } catch (err) {
    console.error("Verify code error:", err);
    res.status(500).json({ message: "Failed to verify code" });
  }
});

// ------------------------
// Cart endpoints
// ------------------------
router.get("/cart", authMiddleware, async (req, res) => {
  try {
    const user = await Customer.findById(req.user.id);
    res.json(user.cart || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to load cart" });
  }
});

router.post("/cart", authMiddleware, async (req, res) => {
  try {
    const { cart } = req.body;
    if (!Array.isArray(cart))
      return res.status(400).json({ message: "Cart must be an array" });

    const user = await Customer.findById(req.user.id);
    user.cart = cart;
    await user.save();
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to update cart" });
  }
});

// ------------------------
// Profile endpoints
// ------------------------
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await Customer.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to load profile" });
  }
});

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, email, address } = req.body;
    const user = await Customer.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.address = address || user.address;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

module.exports = router;
