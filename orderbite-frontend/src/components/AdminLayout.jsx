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
      <aside style={{ width: 220, background: "#1f2937", color: "white", padding: 20 }}>
        <h3>OrderBite Admin</h3>
        <p style={{ fontSize: 14, opacity: 0.7 }}>{user?.name}</p>
        <nav style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          <Link to="/admin/categories" style={{ color: "white" }}>Kategori</Link>
          <Link to="/admin/menu-items" style={{ color: "white" }}>Menu</Link>
          <Link to="/admin/tables" style={{ color: "white" }}>Meja</Link>
          <Link to="/admin/users" style={{ color: "white" }}>Akun Kasir/Dapur</Link>
          <Link to="/admin/reports" style={{ color: "white" }}>Laporan</Link>
        </nav>
        <button onClick={handleLogout} style={{ marginTop: 30 }}>Logout</button>
      </aside>
      <main style={{ flex: 1, padding: 30 }}>
        <Outlet />
      </main>
    </div>
  );
}