const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");

dotenv.config(); // ladda miljövariabler

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// ⚡ Rätt sätt med slash
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
