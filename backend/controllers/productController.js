const Product = require("../models/product");

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create product
const createProduct = async (req, res) => {
  const { name, category, quantity, price, description } = req.body;
  try {
    const product = await Product.create({
      name,
      category,
      quantity,
      price,
      description,
    });
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update product
const updateProduct = async (req, res) => {
  const { name, category, quantity, price, description } = req.body;
  const { id } = req.params;
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, category, quantity, price, description },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
