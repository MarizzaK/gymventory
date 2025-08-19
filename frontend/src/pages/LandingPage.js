import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import heroImg from "../img/hero-img.png";
import heroImgMobile from "../img/heroImg-mobile.png";

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [womensAnchor, setWomensAnchor] = useState(null);
  const [mensAnchor, setMensAnchor] = useState(null);

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
      <AppBar position="static" color="default" sx={{ boxShadow: 1 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box
              onMouseEnter={(e) => setWomensAnchor(e.currentTarget)}
              onMouseLeave={() => setWomensAnchor(null)}
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            >
              <Typography>WOMENS</Typography>
              <ArrowDropDownIcon />
            </Box>
            <Menu
              anchorEl={womensAnchor}
              open={Boolean(womensAnchor)}
              onClose={() => setWomensAnchor(null)}
              MenuListProps={{ onMouseLeave: () => setWomensAnchor(null) }}
            >
              <MenuItem>Tops</MenuItem>
              <MenuItem>Bottoms</MenuItem>
              <MenuItem>Accessories</MenuItem>
            </Menu>

            <Box
              onMouseEnter={(e) => setMensAnchor(e.currentTarget)}
              onMouseLeave={() => setMensAnchor(null)}
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            >
              <Typography>MENS</Typography>
              <ArrowDropDownIcon />
            </Box>
            <Menu
              anchorEl={mensAnchor}
              open={Boolean(mensAnchor)}
              onClose={() => setMensAnchor(null)}
              MenuListProps={{ onMouseLeave: () => setMensAnchor(null) }}
            >
              <MenuItem>Tops</MenuItem>
              <MenuItem>Bottoms</MenuItem>
              <MenuItem>Accessories</MenuItem>
            </Menu>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            IGNITE
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton>
              <AccountCircleIcon />
            </IconButton>
            <IconButton>
              <SearchIcon />
            </IconButton>
            <IconButton>
              <ShoppingBagIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <img
          src={isMobile ? heroImgMobile : heroImg}
          alt="Hero"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            objectFit: "contain",
          }}
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
