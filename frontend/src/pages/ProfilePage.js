import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

export default function ProfilePage({ user, setUser }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("Not authenticated");

      const res = await axios.put(
        "http://localhost:5001/api/customers/profile",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Information updated successfully!");
      setUser(res.data); // uppdatera global user state
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile.");
    }

    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        My Info
      </Typography>

      <TextField
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        fullWidth
        onClick={handleSave}
        disabled={loading}
        startIcon={loading && <CircularProgress size={20} />}
      >
        {loading ? "Saving..." : "Save"}
      </Button>

      {message && (
        <Typography
          sx={{
            mt: 2,
            color: message.includes("successfully") ? "green" : "red",
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}
