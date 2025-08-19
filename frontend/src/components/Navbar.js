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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function Navbar({ user, setUser }) {
  const [womensAnchor, setWomensAnchor] = useState(null);
  const [mensAnchor, setMensAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = useNavigate();

  const handleAccountClick = () => {
    if (user) {
      setDrawerOpen(true);
    } else {
      navigate("/customer-login");
    }
  };

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  return (
    <>
      <AppBar position="static" color="default" sx={{ boxShadow: 1 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            {/* Womens Menu */}
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
            <IconButton>
              <ShoppingBagIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            <ListItem>
              <ListItemText primary={`Hello, ${user?.name || "User"}`} />
            </ListItem>
            <ListItem button onClick={() => navigate("/profile")}>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                navigate("/", { replace: true });
                setUser(null);
                localStorage.removeItem("jwtToken");
                setDrawerOpen(false);
              }}
            >
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
