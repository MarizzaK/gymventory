import React, { useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

export default function AdminWelcome({ user, setUser }) {
  const navigate = useNavigate();

  // Om user inte är inloggad, skicka till login
  useEffect(() => {
    if (!user) {
      navigate("/backoffice");
    }
  }, [user, navigate]);

  const goToDashboard = () => {
    navigate("/main");
  };

  if (!user) return null; // renderar inte om ingen user

  // Bestäm roll
  const role = user.isAdmin ? "Admin" : "Butiksäljare";

  return (
    <div>
      <Header user={user} setUser={setUser} />
      <Box sx={{ maxWidth: 600, margin: "50px auto", textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.name}!
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Email: {user.email}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Role: {role}
        </Typography>
        <Button variant="contained" onClick={goToDashboard}>
          Go to Dashboard
        </Button>
      </Box>
    </div>
  );
}
