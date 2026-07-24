import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, LayoutGrid, UtensilsCrossed, Table2, Users, BarChart3, LogOut, Store } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/categories", label: "Kategori", icon: LayoutGrid },
  { to: "/admin/menu-items", label: "Menu", icon: UtensilsCrossed },
  { to: "/admin/tables", label: "Meja", icon: Table2 },
  { to: "/admin/users", label: "Akun Kasir/Dapur", icon: Users },
  { to: "/admin/reports", label: "Laporan", icon: BarChart3 },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "A";

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon"><Store size={19} /></div>
          <h3>OrderBite</h3>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <span className="sidebar-user-name">{user?.name}</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} className={`sidebar-link ${isActive ? "active" : ""}`}>
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}