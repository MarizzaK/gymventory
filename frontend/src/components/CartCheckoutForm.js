import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  IconButton,
  TextField,
  CircularProgress,
} from "@mui/material";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import CloseIcon from "@mui/icons-material/Close";

export default function CartCheckoutForm({
  cart,
  addToCart,
  removeFromCart,
  user,
  onClose,
  setInventoryRows,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const token = localStorage.getItem("jwtToken");
      const res = await fetch("http://localhost:5001/api/customers/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setName(data.name || "");
      setAddress(data.address || "");
    };

    fetchProfile();
  }, [user]);

  const handlePayment = async () => {
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("jwtToken");

      // Update profile before payment
      if (user && token) {
        await fetch("http://localhost:5001/api/customers/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, address }),
        });
      }

      // Create PaymentIntent
      const res = await fetch("http://localhost:5001/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, name, address }),
      });
      const data = await res.json();

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name },
        },
      });

      if (result.error) {
        setMessage(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        // --- Create order ---
        if (user && token) {
          await fetch("http://localhost:5001/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              items: cart.map((item) => ({
                _id: item._id,
                name: item.name,
                price: item.price,
                size: item.size,
                cartQuantity: item.cartQuantity || 1,
              })),
              total: cart.reduce(
                (acc, item) => acc + item.price * (item.cartQuantity || 1),
                0
              ),
            }),
          });
        }

        // --- Update stock in backend ---
        await fetch("http://localhost:5001/api/products/decrease-stock", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            items: cart.map((item) => ({
              _id: item._id,
              quantity: item.cartQuantity || 1,
            })),
          }),
        });

        if (setInventoryRows) {
          const updated = await fetch(
            "http://localhost:5001/api/products"
          ).then((res) => res.json());
          setInventoryRows(updated);
        }

        setMessage("Payment successful! 🎉");
        localStorage.removeItem("cart_guest");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const total = cart.reduce(
    (acc, item) => acc + item.price * (item.cartQuantity || 1),
    0
  );

  return (
    <Box sx={{ p: 2, position: "relative" }}>
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", top: 8, left: 8 }}
      >
        <CloseIcon />
      </IconButton>

      <Typography variant="h6" sx={{ flex: 1, textAlign: "center" }}>
        Your Cart
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {cart.length === 0 ? (
        <Typography>No items in the cart</Typography>
      ) : (
        cart.map((item, index) => (
          <Box
            key={index}
            sx={{ display: "flex", gap: 1, mb: 2, alignItems: "center" }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: 60,
                height: 60,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography>{item.name}</Typography>
              <Typography variant="body2">Size: {item.size}</Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Button size="small" onClick={() => removeFromCart(index, 1)}>
                  -
                </Button>
                <Typography variant="body2">
                  {item.cartQuantity || 1}
                </Typography>
                <Button
                  size="small"
                  onClick={() => addToCart(item, item.size, 1)}
                >
                  +
                </Button>
              </Box>
              <Typography variant="body2">
                ${item.price.toFixed(2)} x {item.cartQuantity || 1}
              </Typography>
              <Button
                color="error"
                size="small"
                onClick={() => removeFromCart(index, item.cartQuantity || 1)}
              >
                Remove
              </Button>
            </Box>
          </Box>
        ))
      )}

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">Shipping Information</Typography>
      <TextField
        fullWidth
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Typography variant="h6">Payment</Typography>
      <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: 1, mb: 2 }}>
        <CardElement />
      </Box>

      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Total: ${total.toFixed(2)}
      </Typography>

      <Button
        variant="contained"
        onClick={handlePayment}
        disabled={!stripe || loading}
        fullWidth
        startIcon={loading && <CircularProgress size={20} color="inherit" />}
      >
        {loading ? "Processing..." : "Pay"}
      </Button>

      {message && (
        <Typography
          color={message.includes("Payment") ? "success.main" : "error"}
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}
