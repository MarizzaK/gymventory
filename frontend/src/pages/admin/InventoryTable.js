import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import ProductModal from "./ProductModal";

const paginationModel = { page: 0, pageSize: 5 };

export default function InventoryTable({
  rows: initialRows,
  setEditProductId,
}) {
  const [rows, setRows] = React.useState(initialRows || []);
  const [editProductId, setLocalEditProductId] = React.useState(null);
  const [openModal, setOpenModal] = React.useState(false);

  React.useEffect(() => {
    if (initialRows) setRows(initialRows);
  }, [initialRows]);

  // --- Delete produkt ---
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("jwtToken");
    const response = await fetch(`http://localhost:5001/api/products/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      alert("Failed to delete product");
      return;
    }

    setRows((prevRows) => prevRows.filter((row) => row._id !== id));
    if (setEditProductId) setEditProductId(null);
  };

  // --- Edit produkt ---
  const handleSetEditProductId = (id) => {
    setLocalEditProductId(id);
    setOpenModal(true);
  };

  const columns = [
    { field: "_id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "gender", headerName: "Gender", flex: 1 },
    { field: "quantity", headerName: "Quantity", type: "number", flex: 1 },
    { field: "price", headerName: "Price", type: "number", flex: 1 },
    {
      field: "description",
      headerName: "Description",
      description: "This column has a value getter and is not sortable.",
      sortable: false,
      flex: 1,
    },
    {
      field: "delete",
      headerName: "Delete",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="error"
          onClick={() => handleDelete(params.row._id)}
        >
          Delete
        </Button>
      ),
    },
    {
      field: "edit",
      headerName: "Edit",
      flex: 0,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSetEditProductId(params.row._id)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Paper sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row._id}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10, 20, 50]}
        sx={{ border: 0 }}
      />

      <ProductModal
        open={openModal}
        setOpen={setOpenModal}
        editProductId={editProductId}
        setEditProductId={setLocalEditProductId}
        rows={rows}
        setRows={setRows}
      />
    </Paper>
  );
}
