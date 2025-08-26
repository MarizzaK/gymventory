import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardMedia, CardContent } from "@mui/material";

export default function OrderHistoryPage({ user }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        });
        const data = await res.json();

        // Säkerställ att alla fält alltid finns
        const safeData = (data || []).map((order) => ({
          ...order,
          total: order.total || 0,
          items: (order.items || []).map((item) => ({
            ...item,
            price: item.price || 0,
            quantity: item.cartQuantity || 1,
            image: item.image?.startsWith("http")
              ? item.image
              : item.image
              ? `http://localhost:5001/uploads/${item.image}`
              : "https://via.placeholder.com/200x200?text=No+Image",
            name: item.name || "Namnlös produkt",
            size: item.size || "-",
          })),
        }));

        setOrders(safeData);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };

    fetchOrders();
  }, [user]);

  if (!orders.length) return <p>Inga tidigare beställningar.</p>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Orderhistorik
      </Typography>

      {orders.map((order, idx) => (
        <Box
          key={idx}
          sx={{
            border: "1px solid #ccc",
            borderRadius: 2,
            mb: 3,
            p: 2,
          }}
        >
          <Typography sx={{ mb: 1 }}>
            Orderdatum:{" "}
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString()
              : "Okänt datum"}
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Total: ${Number(order.total).toFixed(2)}
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {order.items.map((item, i) => (
              <Card
                key={i}
                sx={{
                  width: 250,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  "&:hover": { boxShadow: 6 },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={item.image}
                  alt={item.name}
                />
                <CardContent>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography variant="body2">
                    Storlek: {item.size} x {item.quantity}
                  </Typography>
                  <Typography variant="body1">
                    ${Number(item.price).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
