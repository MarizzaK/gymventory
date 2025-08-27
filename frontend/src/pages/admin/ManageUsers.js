import * as React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    isAdmin: false,
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [originalEmail, setOriginalEmail] = useState("");

  // Hämta alla användare
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(`http://localhost:5001/api/users/${id}`, {
        method: "DELETE",
      });
      if (response.ok) fetchUsers();
      else alert("Failed to delete user");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleAddNew = () => {
    setNewUser({ name: "", email: "", isAdmin: false });
    setEditingUserId(null);
    setOriginalEmail("");
    setOpenModal(true);
  };

  const handleEdit = (user) => {
    setNewUser({ name: user.name, email: user.email, isAdmin: user.isAdmin });
    setEditingUserId(user._id);
    setOriginalEmail(user.email);
    setOpenModal(true);
  };

  // Skicka invitation eller uppdatering
  const handleInviteUser = async () => {
    try {
      let response;
      let data;

      if (editingUserId) {
        // Om e-post ändrades → ny inbjudan
        if (originalEmail !== newUser.email) {
          response = await fetch("http://localhost:5001/api/users/invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
          });
        } else {
          // Annars uppdatera namn/admin
          response = await fetch(
            `http://localhost:5001/api/users/${editingUserId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: newUser.name,
                isAdmin: newUser.isAdmin,
              }),
            }
          );
        }

        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }

        if (!response.ok) {
          alert("Failed: " + (data.message || "Unknown error"));
          return;
        }

        if (originalEmail !== newUser.email)
          alert("Email changed → invitation sent for new password!");
        else alert("User updated successfully!");
      } else {
        // Ny användare, skicka invitation
        response = await fetch("http://localhost:5001/api/users/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });

        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }

        if (!response.ok) {
          alert("Failed: " + (data.message || "Unknown error"));
          return;
        }

        alert("Invitation sent successfully!");
      }

      setOpenModal(false);
      setEditingUserId(null);
      setOriginalEmail("");
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Manage Users
        </Typography>

        <Button
          variant="contained"
          color="primary"
          sx={{ marginBottom: 2 }}
          onClick={handleAddNew}
        >
          Add New User
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user._id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    {user.email} {user.isAdmin ? "admin" : ""}
                  </TableCell>
                  <TableCell>
                    <Button
                      color="primary"
                      onClick={() => handleEdit(user)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      color="secondary"
                      onClick={() => handleDelete(user._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>
          {editingUserId ? "Edit User" : "Add New User"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <TextField
            label="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <Box>
            <label>
              <input
                type="checkbox"
                checked={newUser.isAdmin}
                onChange={(e) =>
                  setNewUser({ ...newUser, isAdmin: e.target.checked })
                }
              />{" "}
              Admin
            </label>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleInviteUser}>
            {editingUserId ? "Update" : "Invite"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
