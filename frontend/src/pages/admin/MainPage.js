import * as React from "react";
import { useEffect, useState } from "react";
import InventoryTable from "./InventoryTable";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import ProductModal from "./ProductModal";

const MainPage = () => {
  const [rows, setRows] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editProductId, setEditProductId] = useState(null);

  useEffect(() => {
    handleFetchData();
  }, []);

  const handleFetchData = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/products");
      const data = await response.json();
      const dataWithUniqueIds = data.map((item) => ({
        ...item,
        id: item._id,
      }));
      setRows(dataWithUniqueIds);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Inventory Table */}
      <InventoryTable rows={rows} setEditProductId={setEditProductId} />

      <Button
        onClick={handleOpenModal}
        variant="contained"
        style={{
          width: "56px",
          height: "56px",
          position: "fixed",
          right: "20px",
          bottom: "20px",
          borderRadius: "50%",
        }}
      >
        <AddIcon />
      </Button>

      {/* Modal */}
      <ProductModal
        open={openModal}
        setOpen={setOpenModal}
        editProductId={editProductId}
      />
    </div>
  );
};

export default MainPage;
