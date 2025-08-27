const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const connectDB = require("../config/db");

const createTestAdmin = async () => {
  await connectDB();

  const existingAdmin = await User.findOne({ email: "admin@test.com" });
  if (existingAdmin) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash("12345678", 10);

  const admin = new User({
    name: "Test Admin",
    email: "admin@test.com",
    password: hashedPassword,
    isAdmin: true,
  });

  await admin.save();
  console.log("Test admin created!");
  process.exit(0);
};

createTestAdmin();
