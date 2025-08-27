import { useState, useEffect } from "react";
import axios from "axios";

export default function useCart(user) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const initCart = async () => {
      if (!user) {
        const guestCart = localStorage.getItem("cart_guest");
        setCart(guestCart ? JSON.parse(guestCart) : []);
        return;
      }

      try {
        const res = await axios.get(
          "http://localhost:5001/api/customers/cart",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          }
        );
        setCart(res.data || []);
      } catch (err) {
        console.error("Failed to fetch user cart:", err);
        setCart([]);
      }
    };

    initCart();
  }, [user]);

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
        console.error("Failed to save user cart:", err);
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

  const migrateGuestCart = async (jwtToken) => {
    const guestCart = localStorage.getItem("cart_guest");
    if (!guestCart) return;

    try {
      const updatedCart = [...cart, ...JSON.parse(guestCart)];
      await axios.post(
        "http://localhost:5001/api/customers/cart",
        { cart: updatedCart },
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      setCart(updatedCart);
      localStorage.removeItem("cart_guest");
    } catch (err) {
      console.error("Failed to migrate guest cart:", err);
    }
  };

  return { cart, addToCart, removeFromCart, migrateGuestCart, setCart };
}
