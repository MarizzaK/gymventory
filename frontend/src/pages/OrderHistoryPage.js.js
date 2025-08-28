import React, { useEffect, useState } from "react";

export default function OrderHistoryPage({ user }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      const res = await fetch("http://localhost:5001/api/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });

      const data = await res.json();
      setOrders(data);
    };

    fetchOrders();
  }, [user]);

  if (!orders.length) return <p>"No previous orders."</p>;

  return (
    <div>
      <h2>My Orders</h2>
      {orders.map((order, idx) => (
        <div
          key={idx}
          style={{
            border: "1px solid #ccc",
            marginBottom: "20px",
            padding: "10px",
          }}
        >
          <p>"Order Date:": {new Date(order.createdAt).toLocaleString()}</p>
          <p>Total: ${order.total.toFixed(2)}</p>
          <ul>
            {order.items.map((item, i) => (
              <li key={i}>
                {item.name} ({item.size}) x {item.quantity} - $
                {item.price.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
