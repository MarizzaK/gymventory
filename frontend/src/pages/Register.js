import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Typography, TextField, Button, Alert, Link } from "@mui/material";

export default function Register() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) {
      setError(
        "Token saknas! Kontrollera att du klickade på rätt länk från mejlet."
      );
    }
  }, [token]);

  const validatePassword = (pwd) => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const isLongEnough = pwd.length >= 6;
    return hasUpperCase && hasNumber && hasSpecial && isLongEnough;
  };

  const handleSubmit = async () => {
    setError("");
    if (!token) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 6 characters, contain 1 uppercase, 1 number and 1 special character"
      );
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!response.ok) {
        setError(data.message || "Failed to set password");
        return;
      }

      setSuccess("Password set successfully! ");
    } catch (err) {
      console.error(err);
      setError("Something went wrong: " + err.message);
    }
  };

  if (!token) {
    return (
      <Box sx={{ maxWidth: 400, margin: "50px auto", padding: 4 }}>
        <Alert severity="error">
          Token saknas eller ogiltig. Kontrollera länken från mejlet.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 400, margin: "50px auto", padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        Set Your Password
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success} <Link href="/backoffice">Go to Backoffice Login</Link>
        </Alert>
      )}

      {!success && (
        <>
          <TextField
            type="password"
            label="Password"
            fullWidth
            sx={{ mt: 2 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            type="password"
            label="Confirm Password"
            fullWidth
            sx={{ mt: 2 }}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            onClick={handleSubmit}
          >
            Set Password
          </Button>
        </>
      )}
    </Box>
  );
}
