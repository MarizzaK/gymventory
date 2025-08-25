const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      size: String,
      quantity: { type: Number, default: 1 },
    },
  ],
  total: Number,
  name: String,
  address: String,
  createdAt: { type: Date, default: Date.now },
});

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  googleId: { type: String },
  magicCode: { type: String },
  codeExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      size: String,
      quantity: { type: Number, default: 1 },
    },
  ],
  orders: [orderSchema],
  address: String,
});

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
