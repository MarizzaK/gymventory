import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { flex } from "@mui/system";

const paginationModel = { page: 0, pageSize: 5 };

export default function Inventorytable({ rows, setEditProductId }) {
  const columns = [
    { field: "_id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    {
      field: "quantity",
      headerName: "Quantity",
      type: "number",
      flex: 1,
    },
    {
      field: "price",
      headerName: "Price",
      type: "number",
      flex: 1,
    },
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
          onClick={() => {
            handleDelete(params.row._id);
          }}
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
          onClick={() => {
            handleSetEditProdctId(params.row._id);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) {
      return;
    }
    await fetch(`http://localhost:5001/api/products/${id}`, {
      method: "DELETE",
    });
    window.location.reload();
  };

  const handleSetEditProdctId = (id) => {
    setEditProductId(id);
  };

  return (
    <Paper sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10, 20, 50]}
        sx={{ border: 0 }}
      />
    </Paper>
  );
}
