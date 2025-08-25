const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await Customer.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.orders || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, total, name, address } = req.body;

    const user = await Customer.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const orderItems = items.map((item) => ({
      productId: item._id,
      name: item.name,
      price: item.price,
      size: item.size,
      quantity: item.cartQuantity || 1,
    }));

    user.orders = user.orders || [];
    user.orders.push({
      items: orderItems,
      total,
      name,
      address,
      createdAt: new Date(),
    });

    user.cart = [];
    await user.save();

    res.status(201).json({ message: "Order saved", orders: user.orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save order" });
  }
});

module.exports = router;
