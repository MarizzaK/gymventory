import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Navbar from "../components/Navbar";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import heroImg from "../img/hero-img.png";
import heroImgMobile from "../img/heroImg-mobile.png";

export default function LandingPage({ user, setUser }) {
  const [products, setProducts] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:5001/api/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    }
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    console.log("Add to cart:", product);
  };

  return (
    <div>
      <Navbar user={user} setUser={setUser} />

      <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <img
          src={isMobile ? heroImgMobile : heroImg}
          alt="Hero"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </Box>

      <Box sx={{ padding: 4 }}>
        {Array.from({ length: Math.ceil(products.length / 4) }).map(
          (_, rowIndex) => {
            const rowProducts = products.slice(rowIndex * 4, rowIndex * 4 + 4);
            return (
              <Box
                key={rowIndex}
                sx={{
                  display: "flex",
                  justifyContent:
                    rowProducts.length === 4 && window.innerWidth >= 1200
                      ? "center"
                      : "flex-start",
                  gap: 3,
                  overflowX: "auto",
                  scrollSnapType: "x mandatory",
                  mb: 3,
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {rowProducts.map((product) => (
                  <Card
                    key={product._id}
                    sx={{
                      borderRadius: 3,
                      width: "280px",
                      flex: "0 0 auto",
                      scrollSnapAlign: "start",
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="300"
                      image={product.image}
                      alt={product.name}
                    />
                    <CardContent>
                      <Typography variant="h6">{product.name}</Typography>
                      <Typography variant="subtitle1">
                        ${product.price.toFixed(2)}
                      </Typography>
                    </CardContent>
                    <Box
                      sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}
                    >
                      <IconButton
                        color="primary"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingBagIcon />
                      </IconButton>
                    </Box>
                  </Card>
                ))}
              </Box>
            );
          }
        )}
      </Box>
    </div>
  );
}
