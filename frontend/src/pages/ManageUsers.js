import * as React from "react";
import { useState, useEffect } from "react";
import Header from "../components/Header";
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
} from "@mui/material";
import UserModal from "./UserModal";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const fetchUsers = async () => {
    const response = await fetch("http://localhost:5001/api/users");
    const data = await response.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    const response = await fetch(`http://localhost:5001/api/users/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      alert("User deleted successfully");
      fetchUsers();
    } else {
      alert("Failed to delete user");
    }
  };

  const handleEdit = (user) => {
    setUserToEdit(user);
    setOpenModal(true);
  };

  const handleAddNew = () => {
    setUserToEdit(null);
    setOpenModal(true);
  };

  return (
    <div>
      <Header />

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
                    <Button color="primary" onClick={() => handleEdit(user)}>
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

      <UserModal
        open={openModal}
        setOpen={setOpenModal}
        userToEdit={userToEdit}
      />
    </div>
  );
}
