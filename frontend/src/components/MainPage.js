import { useEffect, useState } from "react";
import Header from "./Header";
import Inventorytable from "./InventoryTable";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import ProductModal from "./ProductModal";
const MainPage = () => {
  const [rows, setRows] = useState([]);
  const [OpenModal, setOpenModal] = useState(false);
  useEffect(() => {
    async function fetchData() {
      handleFetchData();
    }
    fetchData();
  }, []);

  const handleFetchData = async () => {
    const response = await fetch("http://localhost:5001/api/products");
    const data = await response.json();
    console.log(data);
    const dataWithUniqueIds = data.map((item, index) => ({
      ...item,
      id: item._id,
    }));
    setRows(dataWithUniqueIds);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "50px" }}>
        <Header></Header>
        <Inventorytable rows={rows}></Inventorytable>
      </div>
      <Button
        onClick={handleOpenModal}
        variant="contained"
        style={{
          width: "56px",
          height: "56px",
          position: "fixed",
          left: "100px",
        }}
      >
        <AddIcon />
      </Button>
      <ProductModal open={OpenModal} setOpen={setOpenModal} />
    </>
  );
};

export default MainPage;
