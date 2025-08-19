import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import LandingPage from "./pages/LandingPage";
import MainPage from "./components/MainPage";
import ManageUsers from "./pages/ManageUsers";
import CustomerLoginPage from "./pages/CustomerLoginPage";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kontrollera JWT-token och hämta användarprofil
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://localhost:5001/api/customers/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("jwtToken");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<LandingPage user={user} setUser={setUser} />}
        />
        <Route
          path="/customer-login"
          element={<CustomerLoginPage user={user} setUser={setUser} />}
        />
        <Route path="/main" element={<MainPage />} />
        <Route path="/manage-users" element={<ManageUsers />} />
      </Routes>
    </Router>
  );
}

export default App;
