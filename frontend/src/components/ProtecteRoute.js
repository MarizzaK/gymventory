import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, adminOnly = false, children }) {
  // Om ej inloggad, skicka till backoffice (login)
  if (!user) return <Navigate to="/backoffice" replace />;

  // Om användaren inte är admin
  if (adminOnly && !user.isAdmin) return <Navigate to="/main" replace />;

  return children;
}
