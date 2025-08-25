import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardMedia,
  Button,
  Divider,
} from "@mui/material";
import { SiKlarna } from "react-icons/si";

export default function ProductPage({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState("M");

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`http://localhost:5001/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (!product) return <Typography>Product not found</Typography>;

  return (
    <Box sx={{ p: 4, display: "flex", gap: 6, flexWrap: "wrap" }}>
      <Card sx={{ maxWidth: 500, flex: "1 1 40%" }}>
        <CardMedia component="img" image={product.image} alt={product.name} />
      </Card>

      <Box sx={{ flex: "1 1 50%", minWidth: 300 }}>
        <Typography variant="h4">{product.name}</Typography>
        <Typography variant="h6" sx={{ my: 2 }}>
          ${product.price.toFixed(2)}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {product.description}
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Select Size:
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          {["XXS", "XS", "S", "M", "L", "XL"].map((s) => (
            <Button
              key={s}
              onClick={() => setSize(s)}
              variant={size === s ? "contained" : "outlined"}
              sx={{
                minWidth: "55px",
                height: "28px",
                borderRadius: "20px",
                fontSize: "0.7rem",
                padding: "2px 6px",
                borderColor: "black",
                color: size === s ? "white" : "black",
                backgroundColor: size === s ? "black" : "transparent",
                textTransform: "none",
                "&:hover": { backgroundColor: size === s ? "#333" : "#f5f5f5" },
              }}
            >
              {s}
            </Button>
          ))}
        </Box>

        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 0.5,
            mb: 3,
            height: "30px",
            borderRadius: "30px",
            backgroundColor: "black",
            color: "white",
            textTransform: "none",
            fontSize: "1rem",
            "&:hover": { backgroundColor: "#333" },
          }}
          onClick={() => addToCart(product, size, 1)}
        >
          Add to Cart
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <SiKlarna size={24} style={{ marginRight: 8 }} />
          <Typography variant="body2">
            Pay in 3 installments of ${(product.price / 3).toFixed(0)}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" sx={{ mb: 1 }}>
          Free Tracked Shipping from 65
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          100 day free returns
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
          Model Wearing Extra Extra Small, True To Size
        </Typography>
        <Typography variant="caption" color="text.secondary">
          If between sizes | Size down for a firmer fit. Size up for a more
          relaxed fit.
        </Typography>
      </Box>
    </Box>
  );
}
