const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Get all products
router.get("/", getProducts);

// Get single product by ID
router.get("/:id", getProductById);

// Create a new product
router.post("/", createProduct);

// Update a product
router.put("/:id", updateProduct);

// Delete a product
router.delete("/:id", deleteProduct);

module.exports = router;
