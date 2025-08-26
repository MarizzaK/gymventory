import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

import LandingPage from "./pages/LandingPage";
import ProductPage from "./pages/ProductPage";
import CustomerLoginPage from "./pages/CustomerLoginPage";
import MainPage from "./components/MainPage";
import ManageUsers from "./pages/ManageUsers";
import Navbar from "./components/Navbar";
import OrderHistoryPage from "./pages/OrderHistoryPage.js";
import ProfilePage from "./pages/ProfilePage.js";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // --- Init cart baserat på guest/user ---
  useEffect(() => {
    const initCart = async () => {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        const guestCart = localStorage.getItem("cart_guest");
        setCart(guestCart ? JSON.parse(guestCart) : []);
        setLoading(false);
        return;
      }

      try {
        // Hämta user info
        const profileRes = await axios.get(
          "http://localhost:5001/api/customers/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(profileRes.data);

        // Hämta cart
        const cartRes = await axios.get(
          "http://localhost:5001/api/customers/cart",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCart(cartRes.data || []);
      } catch (err) {
        console.error("Error fetching user/cart:", err);
        localStorage.removeItem("jwtToken");
        setUser(null);
        const guestCart = localStorage.getItem("cart_guest");
        setCart(guestCart ? JSON.parse(guestCart) : []);
      } finally {
        setLoading(false);
      }
    };

    initCart();
  }, []);

  // --- Hämta produkter (för sök) ---
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://localhost:5001/api/products");
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data); // för sök
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    }
    fetchProducts();
  }, []);

  // --- Hantera login (JWT eller Google) ---
  const handleLogin = (userData, token) => {
    if (token) {
      localStorage.setItem("jwtToken", token);
    }
    setUser(userData);

    // Hämta cart från backend
    axios
      .get("http://localhost:5001/api/customers/cart", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCart(res.data || []))
      .catch((err) => console.error("Failed to fetch user cart:", err));
  };

  // --- Spara cart ---
  const saveCart = async (updatedCart) => {
    setCart(updatedCart);
    if (user) {
      try {
        await axios.post(
          "http://localhost:5001/api/customers/cart",
          { cart: updatedCart },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          }
        );
      } catch (err) {
        console.error("Failed to save cart:", err);
      }
    } else {
      localStorage.setItem("cart_guest", JSON.stringify(updatedCart));
    }
  };

  // --- Lägg till i cart (+) ---
  const addToCart = (product, size, quantity = 1) => {
    const index = cart.findIndex(
      (item) => item._id === product._id && item.size === size
    );
    const updatedCart = [...cart];

    if (index > -1) {
      updatedCart[index].cartQuantity =
        (updatedCart[index].cartQuantity || 1) + quantity;
    } else {
      updatedCart.push({ ...product, size, cartQuantity: quantity });
    }
    saveCart(updatedCart);
  };

  // --- Ta bort från cart (-) ---
  const removeFromCart = (index, quantity = 1) => {
    const updatedCart = [...cart];
    if ((updatedCart[index].cartQuantity || 1) > quantity) {
      updatedCart[index].cartQuantity -= quantity;
    } else {
      updatedCart.splice(index, 1);
    }
    saveCart(updatedCart);
  };

  // --- Logout ---
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("jwtToken");
    const guestCart = localStorage.getItem("cart_guest");
    setCart(guestCart ? JSON.parse(guestCart) : []);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Navbar
        user={user}
        setUser={setUser}
        cart={cart}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        handleLogout={handleLogout}
        products={products}
        setFilteredProducts={setFilteredProducts}
      />
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              user={user}
              addToCart={addToCart}
              products={filteredProducts}
            />
          }
        />
        <Route
          path="/product/:id"
          element={<ProductPage user={user} addToCart={addToCart} />}
        />
        <Route
          path="/customer-login"
          element={<CustomerLoginPage user={user} handleLogin={handleLogin} />}
        />
        <Route path="/main" element={<MainPage />} />
        <Route path="/manage-users" element={<ManageUsers />} />
        <Route
          path="/order-history"
          element={<OrderHistoryPage user={user} />}
        />
        <Route
          path="/profile"
          element={<ProfilePage user={user} setUser={setUser} />}
        />
        <Route
          path="/products"
          element={
            <LandingPage
              user={user}
              addToCart={addToCart}
              products={filteredProducts}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
