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
  Modal,
  Button,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import heroImg from "../img/hero-img.png";
import heroImgMobile from "../img/heroImg-mobile.png";

export default function LandingPage({ addToCart, products }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(products || []);

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedProduct(null);
  };

  const handleSelectSize = (size) => {
    addToCart(selectedProduct, size);
    handleCloseModal();
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");

    if (category && products) {
      const filtered = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products || []);
    }
  }, [location.search, products]);

  return (
    <div>
      {/* Hero */}
      <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <img
          src={isMobile ? heroImgMobile : heroImg}
          alt="Hero"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </Box>

      <Box sx={{ padding: 4 }}>
        {filteredProducts.length === 0 && (
          <Typography variant="h6">Inga produkter hittades</Typography>
        )}
        {Array.from({ length: Math.ceil(filteredProducts.length / 4) }).map(
          (_, rowIndex) => {
            const rowProducts = filteredProducts.slice(
              rowIndex * 4,
              rowIndex * 4 + 4
            );
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
                      cursor: "pointer",
                      "&:hover": { boxShadow: 6 },
                    }}
                    onClick={() => navigate(`/product/${product._id}`)}
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
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenModal(product)}
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

      {/* Modal för storlek */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            background: "white",
            p: 3,
            borderRadius: 2,
            width: 300,
            mx: "auto",
            mt: "20%",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Välj storlek
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {["XXS", "XS", "S", "M", "L", "XL"].map((s) => (
              <Button
                key={s}
                variant="outlined"
                onClick={() => handleSelectSize(s)}
              >
                {s}
              </Button>
            ))}
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
