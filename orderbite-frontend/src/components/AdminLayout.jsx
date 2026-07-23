import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{
  width: 240,
  background: "#111827",
  color: "white",
  padding: "24px 20px",
  display: "flex",
  flexDirection: "column",
}}>
  <h3 style={{ color: "white", marginBottom: 4 }}>🍽️ OrderBite</h3>
  <p style={{ fontSize: 13, opacity: 0.6, marginTop: 0 }}>{user?.name}</p>

  <nav style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 20 }}>
    {[
      { to: "/admin/categories", label: "Kategori" },
      { to: "/admin/menu-items", label: "Menu" },
      { to: "/admin/tables", label: "Meja" },
      { to: "/admin/users", label: "Akun Kasir/Dapur" },
      { to: "/admin/reports", label: "Laporan" },
    ].map((item) => (
      <Link
        key={item.to}
        to={item.to}
        style={{
          color: "#d1d5db",
          textDecoration: "none",
          padding: "10px 12px",
          borderRadius: 6,
          fontSize: 14,
        }}
        onMouseOver={(e) => e.currentTarget.style.background = "#1f2937"}
        onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
      >
        {item.label}
      </Link>
    ))}
  </nav>

  <button onClick={handleLogout} style={{ marginTop: "auto", background: "#dc2626" }}>
    Logout
  </button>
</aside>
      <main style={{ flex: 1, padding: 30 }}>
        <Outlet />
      </main>
    </div>
  );
}