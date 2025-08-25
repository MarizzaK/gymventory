import React, { useState } from "react";
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
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
}) {
  const [womensAnchor, setWomensAnchor] = useState(null);
  const [mensAnchor, setMensAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleAccountClick = () => {
    if (user) setDrawerOpen(true);
    else navigate("/customer-login");
  };

  return (
    <>
      <AppBar position="static" color="default" sx={{ boxShadow: 1 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box
              onMouseEnter={(e) => setWomensAnchor(e.currentTarget)}
              onMouseLeave={() => setWomensAnchor(null)}
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            >
              <Typography>WOMEN</Typography>
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
              <Typography>MEN</Typography>
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
            <IconButton onClick={handleAccountClick}>
              <AccountCircleIcon />
            </IconButton>
            <IconButton>
              <SearchIcon />
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
      </AppBar>

      {/* Drawer */}
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

            {/* Profile med dropdown */}
            <ListItem button onClick={() => setProfileOpen(!profileOpen)}>
              <ListItemText primary="Profile" />
              {profileOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={profileOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {/* Orderhistorik */}
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

                {/* My Info */}
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

            {/* Logout */}
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

      {/* Cart Drawer */}
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
