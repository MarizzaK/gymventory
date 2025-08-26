const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new user
router.post("/", async (req, res) => {
  const { name, email, isAdmin } = req.body;
  const user = new User({ name, email, isAdmin });
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update user
router.put("/:id", async (req, res) => {
  try {
    const { name, email, isAdmin } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, isAdmin },
      { new: true, runValidators: true }
    );
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Invite user
router.post("/invite", async (req, res) => {
  const { name, email, isAdmin } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user && user.password) {
      return res.status(400).json({ message: "User already registered" });
    }

    if (!user) {
      user = new User({ name, email, isAdmin, invitedAt: new Date() });
      await user.save();
    } else {
      user.name = user.name || name;
      user.isAdmin = isAdmin ?? user.isAdmin;
      user.invitedAt = new Date();
      await user.save();
    }

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "24h" }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const registerLink = `${frontendUrl}/register?token=${token}`;

    let transporter;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        host: "smtp.mail.me.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_USER ||
        process.env.MAIL_FROM ||
        "noreply@inventory.local",
      to: user.email,
      subject: "You're invited — set your password",
      text: `Hej ${
        user.name || ""
      }, klicka på länken för att skapa ditt konto: ${registerLink}`,
      html: `<p>Hej ${user.name || ""},</p>
             <p>Klicka <a href="${registerLink}">här</a> för att registrera ditt konto. Länken gäller i 24h.</p>`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("Preview URL (ethereal):", previewUrl);
      return res.json({ message: "Invitation sent (preview)", previewUrl });
    }

    console.log("Invitation sent:", info.response);
    res.json({ message: "Invitation sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Register
router.post("/register", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token och password krävs" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    const email = decoded.email;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password set successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Ogiltig token eller fel" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
