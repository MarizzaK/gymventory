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

      // Uppdatera profil innan betalning
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

      // Skapa PaymentIntent
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
        // Betalning lyckades – skapa order i backend
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

        setMessage("Betalning genomförd! 🎉");
        localStorage.removeItem("cart_guest");
        onClose();
      }
    } catch (err) {
      console.error(err);
      setMessage("Något gick fel. Försök igen.");
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
        Din Varukorg
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {cart.length === 0 ? (
        <Typography>Ingen vara i varukorgen</Typography>
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
              <Typography variant="body2">Storlek: {item.size}</Typography>
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
                Ta bort
              </Button>
            </Box>
          </Box>
        ))
      )}

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">Leveransinformation</Typography>
      <TextField
        fullWidth
        label="Namn"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Adress"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Typography variant="h6">Betalning</Typography>
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
        {loading ? "Bearbetar..." : "Betala"}
      </Button>

      {message && (
        <Typography
          color={message.includes("Betalning") ? "success.main" : "error"}
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}
