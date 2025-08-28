import * as React from "react";
import { useState, useEffect } from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

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

export default function ProductModal({
  open,
  setOpen,
  editProductId,
  setEditProductId,
  rows,
  setRows,
}) {
  const handleClose = () => setOpen(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    gender: "",
    quantity: "",
    price: "",
    description: "",
  });
  const [editing, setEditing] = useState(false);
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!editProductId) return;

    async function fetchProduct() {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await fetch(
          `http://localhost:5001/api/products/${editProductId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (!response.ok) {
          alert("Something went wrong while fetching the product.");
          return;
        }

        const data = await response.json();
        setFormData({
          name: data.name || "",
          category: data.category || "",
          gender: data.gender || "",
          quantity: data.quantity || "",
          price: data.price || "",
          description: data.description || "",
        });

        setImage(null);
        setOpen(true);
        setEditing(true);
      } catch (error) {
        console.error(error);
        alert("An error occurred while fetching the product.");
      }
    }

    fetchProduct();
  }, [editProductId, setOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => setImage(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      setImage(e.dataTransfer.files[0]);
  };
  const handleDragOver = (e) => e.preventDefault();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, category, gender, quantity, price, description } = formData;

    if (!name || !category || !gender || !quantity || !price || !description) {
      alert("Fyll i alla fält");
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append("name", name);
    dataToSend.append("category", category);
    dataToSend.append("gender", gender);
    dataToSend.append("quantity", quantity);
    dataToSend.append("price", price);
    dataToSend.append("description", description);
    if (image) dataToSend.append("image", image);

    const token = localStorage.getItem("jwtToken");
    const url = editing
      ? `http://localhost:5001/api/products/${editProductId}`
      : "http://localhost:5001/api/products";
    const method = editing ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: dataToSend,
    });

    if (response.ok) {
      const updatedProduct = await response.json();

      if (setRows) {
        setRows((prevRows) =>
          editing
            ? prevRows.map((r) =>
                r._id === editProductId ? updatedProduct : r
              )
            : [...prevRows, updatedProduct]
        );
      }

      alert(editing ? "Product updated!" : "Product added!");
      setOpen(false);
      if (setEditProductId) setEditProductId(null);
      setEditing(false);
      setFormData({
        name: "",
        category: "",
        gender: "",
        quantity: "",
        price: "",
        description: "",
      });
      setImage(null);
    } else {
      alert("Something went wrong. Please try again.");
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
          <Typography variant="h6" component="h2" gutterBottom>
            {editing ? "Edit Product" : "Add New Product"}
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
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="gender-label">"Gender"</InputLabel>
              <Select
                labelId="gender-label"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <MenuItem value="women">Women</MenuItem>
                <MenuItem value="men">Men</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              style={{
                border: "2px dashed gray",
                borderRadius: "8px",
                padding: "16px",
                textAlign: "center",
                marginTop: "16px",
                cursor: "pointer",
              }}
            >
              {image ? (
                <p>{image.name}</p>
              ) : (
                <p>Drag & drop an image here or click the button</p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                id="fileInput"
                hidden
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => document.getElementById("fileInput").click()}
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "bold",
                  px: 3,
                  py: 1,
                }}
              >
                Choose File
              </Button>
            </div>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              {editing ? "Update" : "Add"}
            </Button>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
}
