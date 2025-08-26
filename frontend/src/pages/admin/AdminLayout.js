import React from "react";
import Header from "../../components/Header";

export default function AdminLayout({ children, user, setUser }) {
  return (
    <div>
      {/* Skicka user och setUser till Header */}
      <Header user={user} setUser={setUser} />

      {/* Innehållet i admin-sidan */}
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}
