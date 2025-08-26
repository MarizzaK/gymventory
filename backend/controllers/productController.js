const Product = require("../models/product");

const formatImageUrl = (req, image) => {
  return image ? `${req.protocol}://${req.get("host")}/uploads/${image}` : null;
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    const updatedProducts = products.map((p) => ({
      ...p._doc,
      image: formatImageUrl(req, p.image),
    }));
    res.json(updatedProducts);
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
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({
      ...product._doc,
      image: formatImageUrl(req, product.image),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create product
const createProduct = async (req, res) => {
  const { name, category, gender, quantity, price, description } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const product = await Product.create({
      name,
      category,
      gender,
      quantity,
      price,
      description,
      image,
    });

    res.status(201).json({
      ...product._doc,
      image: formatImageUrl(req, product.image),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update product
const updateProduct = async (req, res) => {
  const { name, category, gender, quantity, price, description } = req.body;
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.name = name || product.name;
    product.category = category || product.category;
    product.gender = gender || product.gender;
    product.quantity = quantity || product.quantity;
    product.price = price || product.price;
    product.description = description || product.description;

    if (req.file) product.image = req.file.filename;

    await product.save();

    res.status(200).json({
      ...product._doc,
      image: formatImageUrl(req, product.image),
    });
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
