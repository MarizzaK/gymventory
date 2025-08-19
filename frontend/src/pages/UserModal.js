import * as React from "react";
import { useState, useEffect } from "react";
import {
  Backdrop,
  Box,
  Modal,
  Fade,
  Button,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function UserModal({ open, setOpen, userToEdit }) {
  const handleClose = () => setOpen(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    isAdmin: false,
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name || "",
        email: userToEdit.email || "",
        isAdmin: userToEdit.isAdmin || false,
      });
    } else {
      setFormData({ name: "", email: "", isAdmin: false });
    }
  }, [userToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      alert("Please fill all fields");
      return;
    }

    try {
      const url = userToEdit
        ? `http://localhost:5001/api/users/${userToEdit._id}`
        : "http://localhost:5001/api/users";

      const method = userToEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(
          userToEdit ? "User updated successfully" : "User added successfully"
        );
        window.location.reload();
        setOpen(false);
      } else {
        const data = await response.json();
        alert("Something went wrong: " + (data.message || ""));
      }
    } catch (error) {
      alert("Network error: " + error.message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 500 } }}
    >
      <Fade in={open}>
        <Box sx={style}>
          <Typography variant="h6" gutterBottom>
            {userToEdit ? "Edit User" : "Add New User"}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              fullWidth
              required
              margin="normal"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="isAdmin"
                  checked={formData.isAdmin}
                  onChange={handleChange}
                />
              }
              label="Administrator privileges"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              {userToEdit ? "Update" : "Save"}
            </Button>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
}
