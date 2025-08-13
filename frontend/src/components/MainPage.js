import { useEffect, useState } from "react";
import Header from "./Header";
import Inventorytable from "./InventoryTable";

const MainPage = () => {
  const [rows, setRows] = useState([]);
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "50px" }}>
      <Header></Header>
      <Inventorytable rows={rows}></Inventorytable>
    </div>
  );
};

export default MainPage;
