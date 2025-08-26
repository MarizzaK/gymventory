import React, { useState, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Collapse,
  InputBase,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CartCheckoutForm from "./CartCheckoutForm";

const stripePromise = loadStripe(
  "pk_test_51QrKLxDhY58VsBxGsbptjQ0wQsrMR2HkaupPPVGMHZVTIzwPGkNnDmTXgKYfUwS3cb5i62RXn4DOqWBO0ZzovLi100qZVaX3yG"
);

export default function Navbar({
  user,
  setUser,
  cart,
  addToCart,
  removeFromCart,
  handleLogout,
  products,
  setFilteredProducts,
}) {
  const [womensOpen, setWomensOpen] = useState(false);
  const [mensOpen, setMensOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const womensRef = useRef(null);
  const mensRef = useRef(null);

  const navigate = useNavigate();

  const categorySynonyms = {
    bra: ["bra", "bras", "sports bra", "sports bras"],
    tops: ["top", "tops"],
    jackets: ["jacket", "jackets"],
    shorts: ["short", "shorts"],
    leggings: ["legging", "leggings"],
    hoodies: ["hoodie", "hoodies"],
  };

  const handleAccountClick = () => {
    if (user) setDrawerOpen(true);
    else navigate("/customer-login");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (products && setFilteredProducts) {
      const filtered = products.filter((p) =>
        (p.name || "").toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const handleCategoryClick = (gender, categoryKey) => {
    if (products && setFilteredProducts) {
      let filtered;
      if (!categoryKey) {
        filtered = products.filter(
          (p) => (p.gender || "").toLowerCase() === gender.toLowerCase()
        );
      } else {
        const keywords = categorySynonyms[categoryKey] || [categoryKey];
        filtered = products.filter((p) => {
          const cat = (p.category || "").toLowerCase().replace(/[\s-]/g, "");
          const matchCat = keywords.some((k) =>
            cat.includes((k || "").toLowerCase().replace(/[\s-]/g, ""))
          );
          const matchGender =
            (p.gender || "").toLowerCase() === gender.toLowerCase();
          return matchCat && matchGender;
        });
      }
      setFilteredProducts(filtered);
    }

    // Stäng bara dropdown om kategori valdes
    if (categoryKey) {
      setWomensOpen(false);
      setMensOpen(false);
    }
  };

  return (
    <>
      <AppBar position="static" color="default" sx={{ boxShadow: 1 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            {/* WOMEN */}
            <Box
              sx={{ display: "inline-block" }}
              onMouseEnter={() => {
                setWomensOpen(true);
                setMensOpen(false);
              }}
              onMouseLeave={() => setWomensOpen(false)}
            >
              <Box
                ref={womensRef}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <Typography>WOMEN</Typography>
                <ArrowDropDownIcon />
              </Box>

              <Menu
                anchorEl={womensRef.current}
                open={womensOpen}
                onClose={() => setWomensOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                disableAutoFocusItem
              >
                {/* Alla produkter för kvinnlig kategori */}
                <MenuItem onClick={() => handleCategoryClick("women", "")}>
                  All Women
                </MenuItem>

                <MenuItem disabled sx={{ fontWeight: "bold" }}>
                  SHOP BY CATEGORY
                </MenuItem>
                <MenuItem onClick={() => handleCategoryClick("women", "bra")}>
                  Sports Bras
                </MenuItem>
                <MenuItem onClick={() => handleCategoryClick("women", "tops")}>
                  Tops
                </MenuItem>
                <MenuItem
                  onClick={() => handleCategoryClick("women", "jackets")}
                >
                  Jackets
                </MenuItem>
                <MenuItem
                  onClick={() => handleCategoryClick("women", "hoodies")}
                >
                  Hoodies
                </MenuItem>
                <MenuItem
                  onClick={() => handleCategoryClick("women", "shorts")}
                >
                  Shorts
                </MenuItem>
                <MenuItem
                  onClick={() => handleCategoryClick("women", "leggings")}
                >
                  Leggings
                </MenuItem>
              </Menu>
            </Box>

            {/* MEN */}
            <Box
              sx={{ display: "inline-block" }}
              onMouseEnter={() => {
                setMensOpen(true);
                setWomensOpen(false);
              }}
              onMouseLeave={() => setMensOpen(false)}
            >
              <Box
                ref={mensRef}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <Typography>MEN</Typography>
                <ArrowDropDownIcon />
              </Box>

              <Menu
                anchorEl={mensRef.current}
                open={mensOpen}
                onClose={() => setMensOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                disableAutoFocusItem
              >
                <MenuItem onClick={() => handleCategoryClick("men", "")}>
                  All Men
                </MenuItem>

                <MenuItem disabled sx={{ fontWeight: "bold" }}>
                  SHOP BY CATEGORY
                </MenuItem>
                <MenuItem onClick={() => handleCategoryClick("men", "tops")}>
                  Tops
                </MenuItem>
                <MenuItem onClick={() => handleCategoryClick("men", "jackets")}>
                  Jackets
                </MenuItem>
                <MenuItem onClick={() => handleCategoryClick("men", "hoodies")}>
                  Hoodies
                </MenuItem>
                <MenuItem onClick={() => handleCategoryClick("men", "shorts")}>
                  Shorts
                </MenuItem>
                <MenuItem onClick={() => handleCategoryClick("men", "joggers")}>
                  Joggers
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            IGNITE
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton onClick={handleAccountClick}>
              <AccountCircleIcon />
            </IconButton>
            <IconButton>
              <FavoriteIcon />
            </IconButton>
            <IconButton onClick={() => setCartOpen(true)}>
              <ShoppingBagIcon />
              {cart.length > 0 && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ ml: 0.3, fontWeight: "bold" }}
                >
                  {cart.reduce(
                    (acc, item) => acc + (item.cartQuantity || 1),
                    0
                  )}
                </Typography>
              )}
            </IconButton>
          </Box>
        </Toolbar>

        <Box sx={{ width: "100%", p: 1, backgroundColor: "#f5f5f5" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ccc",
              borderRadius: 2,
              px: 2,
              mx: "auto",
              width: "90%",
              backgroundColor: "#fff",
            }}
          >
            <SearchIcon sx={{ color: "#888", mr: 1 }} />
            <InputBase
              placeholder="Search products"
              fullWidth
              value={searchText}
              onChange={handleSearchChange}
            />
          </Box>
        </Box>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <List>
            <ListItem>
              <ListItemText primary={`Hello, ${user?.name || "User"}`} />
            </ListItem>
            <ListItem button onClick={() => setProfileOpen(!profileOpen)}>
              <ListItemText primary="Profile" />
              {profileOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={profileOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem
                  button
                  sx={{ pl: 4 }}
                  onClick={() => {
                    navigate("/order-history");
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemText primary="Orderhistorik" />
                </ListItem>
                <ListItem
                  button
                  sx={{ pl: 4 }}
                  onClick={() => {
                    navigate("/profile");
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemText primary="My Info" />
                </ListItem>
              </List>
            </Collapse>
            <ListItem
              button
              onClick={() => {
                handleLogout();
                setDrawerOpen(false);
                navigate("/", { replace: true });
              }}
            >
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <Box sx={{ width: 400 }}>
          <Elements stripe={stripePromise}>
            <CartCheckoutForm
              cart={cart}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              user={user}
              onClose={() => setCartOpen(false)}
            />
          </Elements>
        </Box>
      </Drawer>
    </>
  );
}
