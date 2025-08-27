import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

import LandingPage from "./pages/LandingPage";
import ProductPage from "./pages/ProductPage";
import CustomerLoginPage from "./pages/CustomerLoginPage";
import MainPage from "./pages/admin/MainPage.js";
import ManageUsers from "./pages/admin/ManageUsers.js";
import Navbar from "./components/Navbar";
import OrderHistoryPage from "./pages/OrderHistoryPage.js";
import ProfilePage from "./pages/ProfilePage.js";
import AdminLayout from "./pages/admin/AdminLayout";
import Register from "./pages/Register";
import AdminWelcome from "./pages/admin/AdminWelcome.js";
import Login from "./pages/admin/Login.js";

import ProtectedRoute from "./components/ProtecteRoute.js";

const INACTIVITY_LIMIT = 5 * 60 * 1000;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // --- Logout funktion ---
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("lastActive");
    const guestCart = localStorage.getItem("cart_guest");
    setCart(guestCart ? JSON.parse(guestCart) : []);
  };

  // --- Init cart och user baserat på token och aktivitet ---
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    const lastActive = localStorage.getItem("lastActive");

    if (token && lastActive) {
      const inactiveTime = Date.now() - parseInt(lastActive);
      if (inactiveTime > INACTIVITY_LIMIT) {
        handleLogout();
        setLoading(false);
        return;
      }

      // Hämta profil och cart
      const initUser = async () => {
        try {
          const profileRes = await axios.get(
            "http://localhost:5001/api/customers/profile",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setUser(profileRes.data);

          const cartRes = await axios.get(
            "http://localhost:5001/api/customers/cart",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCart(cartRes.data || []);
        } catch (err) {
          console.error(err);
          handleLogout();
        } finally {
          setLoading(false);
        }
      };
      initUser();
    } else {
      const guestCart = localStorage.getItem("cart_guest");
      setCart(guestCart ? JSON.parse(guestCart) : []);
      setLoading(false);
    }

    // Uppdatera lastActive vid aktivitet
    const updateLastActive = () => {
      if (localStorage.getItem("jwtToken")) {
        localStorage.setItem("lastActive", Date.now());
      }
    };
    window.addEventListener("mousemove", updateLastActive);
    window.addEventListener("keydown", updateLastActive);

    return () => {
      window.removeEventListener("mousemove", updateLastActive);
      window.removeEventListener("keydown", updateLastActive);
    };
  }, []);

  // --- Hämta produkter ---
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://localhost:5001/api/products");
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    }
    fetchProducts();
  }, []);

  // --- Login funktion ---
  const handleLogin = (userData, token) => {
    if (token) {
      localStorage.setItem("jwtToken", token);
      localStorage.setItem("lastActive", Date.now());
    }
    setUser(userData);

    axios
      .get("http://localhost:5001/api/customers/cart", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCart(res.data || []))
      .catch((err) => console.error("Failed to fetch user cart:", err));
  };

  // --- Cart funktioner ---
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

  const removeFromCart = (index, quantity = 1) => {
    const updatedCart = [...cart];
    if ((updatedCart[index].cartQuantity || 1) > quantity) {
      updatedCart[index].cartQuantity -= quantity;
    } else {
      updatedCart.splice(index, 1);
    }
    saveCart(updatedCart);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
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
              <LandingPage
                user={user}
                addToCart={addToCart}
                products={filteredProducts}
              />
            </>
          }
        />
        <Route
          path="/product/:id"
          element={
            <>
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
              <ProductPage user={user} addToCart={addToCart} />
            </>
          }
        />
        <Route
          path="/customer-login"
          element={<CustomerLoginPage user={user} handleLogin={handleLogin} />}
        />
        <Route
          path="/order-history"
          element={
            <>
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
              <OrderHistoryPage user={user} />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
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
              <ProfilePage user={user} setUser={setUser} />
            </>
          }
        />
        <Route
          path="/products"
          element={
            <>
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
              <LandingPage
                user={user}
                addToCart={addToCart}
                products={filteredProducts}
              />
            </>
          }
        />

        {/* Backoffice / Admin */}
        <Route path="/backoffice" element={<Login setUser={setUser} />} />

        <Route
          path="/admin-welcome"
          element={
            <ProtectedRoute user={user}>
              <AdminWelcome user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/main"
          element={
            <ProtectedRoute user={user}>
              <AdminLayout user={user} setUser={setUser}>
                <MainPage products={products} setProducts={setProducts} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-users"
          element={
            <ProtectedRoute user={user} adminOnly={true}>
              <AdminLayout user={user} setUser={setUser}>
                <ManageUsers />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Register */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
