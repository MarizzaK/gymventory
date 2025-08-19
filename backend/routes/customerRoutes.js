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
// Skicka magic code
// ------------------------
router.post("/send-code", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    let user = await Customer.findOne({ email });
    if (!user) {
      user = await Customer.create({ email, name: email.split("@")[0] });
    }

    // skapa 6-siffrig kod
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.magicCode = code;
    user.codeExpiresAt = Date.now() + 10 * 60 * 1000; // 10 min (rätt fält från schema)
    await user.save();

    // Skicka mail
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

// ------------------------
// Verifiera magic code
// ------------------------
router.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await Customer.findOne({ email });

    if (!user || user.magicCode !== code || user.codeExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid code" });
    }

    // Om användaren inte har ett namn, sätt default
    if (!user.name) {
      user.name = email.split("@")[0];
    }

    // Rensa koden efter användning
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

module.exports = router;
