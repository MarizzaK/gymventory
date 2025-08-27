const express = require("express");
const router = express.Router();
const multer = require("multer");
const Product = require("../models/product");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// --- Multer-konfiguration för filuppladdning ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.put("/decrease-stock", async (req, res) => {
  const { items } = req.body;
  try {
    const updates = items.map(async (item) => {
      const product = await Product.findById(item._id);
      if (product) {
        product.quantity = Math.max(product.quantity - item.quantity, 0);
        await product.save();
        console.log(`Updated ${product.name}: ${product.quantity}`);
      } else {
        console.log(`Product not found: ${item._id}`);
      }
    });
    await Promise.all(updates);
    res.json({ message: "Stock updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update stock" });
  }
});

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", upload.single("image"), createProduct);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
