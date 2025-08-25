import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function CustomerLoginPage({ user, handleLogin }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const navigate = useNavigate();

  // --- Google login ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(
        "http://localhost:5001/api/customers/google-login",
        { token: credentialResponse.credential }
      );
      const { token, user } = response.data;

      handleLogin(user, token);
      navigate("/");
    } catch (error) {
      console.error("Google login failed:", error);
      alert("Google login failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    console.error("Google login failed");
    alert("Google login failed. Please try again.");
  };

  // --- Magic code login ---
  const handleSendCode = async () => {
    if (!email.trim()) return alert("Please enter your email");
    try {
      await axios.post("http://localhost:5001/api/customers/send-code", {
        email: email.trim(),
      });
      setCodeSent(true);
      alert("Code sent to your email");
    } catch (error) {
      console.error("Sending code failed:", error);
      alert("Failed to send code. Please try again.");
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) return alert("Please enter the code");

    try {
      const response = await axios.post(
        "http://localhost:5001/api/customers/verify-code",
        { email: email.trim(), code: code.trim() }
      );
      const { token, user } = response.data;

      handleLogin(user, token);
      navigate("/");
    } catch (error) {
      console.error("Verify code failed:", error.response || error);
      const message =
        error.response?.data?.message ||
        "Invalid code or server error. Please try again.";
      alert(message);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Paper sx={{ p: 4, width: 350, textAlign: "center" }}>
          {!user ? (
            <>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
                IGNITE
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Sign in
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Choose how you'd like to sign in
              </Typography>

              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />

              <Divider sx={{ my: 2 }}>- or -</Divider>

              <TextField
                label="Email"
                fullWidth
                sx={{ mb: 2 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={codeSent}
              />

              {codeSent && (
                <TextField
                  label="Enter code"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={codeSent ? handleVerifyCode : handleSendCode}
              >
                {codeSent ? "Verify Code" : "Continue"}
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Welcome back, {user.name}!
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate("/")}
              >
                Start Shopping
              </Button>
            </>
          )}
        </Paper>
      </Box>
    </GoogleOAuthProvider>
  );
}
