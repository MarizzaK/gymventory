import * as React from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export default function Header({ user, setUser }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleManageUsers = () => {
    navigate("/manage-users");
    setDrawerOpen(false);
  };

  const handleDashboard = () => {
    navigate("/main");
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    setUser(null);
    navigate("/backoffice");
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography
            variant="h6"
            color="inherit"
            component="div"
            sx={{ flexGrow: 1, textAlign: "center" }}
          >
            Inventory Dashboard
          </Typography>

          <IconButton
            edge="end"
            color="inherit"
            aria-label="login"
            onClick={toggleDrawer(true)}
          >
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250, p: 2 }}>
          <Stack spacing={2}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleDashboard}
            >
              Dashboard
            </Button>

            {user?.isAdmin && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleManageUsers}
              >
                Manage Users
              </Button>
            )}

            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={handleLogout}
            >
              Log out
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
