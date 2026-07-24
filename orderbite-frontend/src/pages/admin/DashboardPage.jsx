import { useState, useEffect } from "react";
import { LayoutDashboard, Wallet, ShoppingBag, Table2, ChefHat, AlertCircle, TrendingUp, Clock } from "lucide-react";
import api from "../../api/axios";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [summaryRes, dashRes, weeklyRes] = await Promise.all([
          api.get("/reports/summary"),
          api.get("/reports/dashboard"),
          api.get("/reports/weekly-revenue"),
        ]);
        setSummary(summaryRes.data);
        setDashboard(dashRes.data);
        setWeeklyRevenue(weeklyRes.data);
      } catch (err) {
        setError("Gagal memuat dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatRupiah = (num) => `Rp ${Number(num).toLocaleString("id-ID")}`;

  if (loading) return <div className="loading-wrap"><div className="spinner" /> Memuat dashboard...</div>;
  if (error) return <p style={{ color: "#dc2626" }}>{error}</p>;

  const maxRevenue = Math.max(...weeklyRevenue.map((d) => Number(d.total)), 1);

  const statCards = [
    { label: "Pendapatan Hari Ini", value: formatRupiah(summary.today_revenue), icon: Wallet, color: "#4f8a5c", bg: "#f1f8f0" },
    { label: "Pesanan Aktif", value: dashboard.active_orders, icon: ShoppingBag, color: "#b45309", bg: "#fffbeb" },
    { label: "Meja Terisi", value: `${dashboard.tables_occupied} / ${dashboard.tables_total}`, icon: Table2, color: "#2563eb", bg: "#eff6ff" },
    { label: "Item Sedang Diproses", value: dashboard.pending_kitchen_items, icon: ChefHat, color: "#b91c1c", bg: "#fef2f2" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-icon"><LayoutDashboard size={22} /></div>
          <h2>Dashboard</h2>
          <p>Ringkasan operasional restoran Anda hari ini.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={22} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-muted)" }}>{s.label}</p>
                <h3 style={{ margin: "3px 0 0", fontSize: 20 }}>{s.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {dashboard.menu_unavailable > 0 && (
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, background: "#fffbeb", border: "1px solid #fde68a" }}>
          <AlertCircle size={20} color="#b45309" />
          <p style={{ margin: 0, color: "#92400e", fontSize: 14 }}>
            <strong>{dashboard.menu_unavailable} menu</strong> saat ini berstatus tidak tersedia.
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Grafik */}
        <div className="card">
          <h4 style={{ margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}>
            <TrendingUp size={17} /> Pendapatan 7 Hari Terakhir
          </h4>
          {weeklyRevenue.length === 0 ? (
            <p style={{ fontSize: 13 }}>Belum ada data transaksi.</p>
          ) : (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 160, marginTop: 20, padding: "0 6px" }}>
              {weeklyRevenue.map((d) => (
                <div key={d.tanggal} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                  <div style={{
                    width: "100%",
                    background: "linear-gradient(180deg, #a9cba3, #4f8a5c)",
                    height: `${(Number(d.total) / maxRevenue) * 130}px`,
                    borderRadius: "6px 6px 0 0",
                    minHeight: 4,
                    transition: "height 0.3s ease",
                  }} title={formatRupiah(d.total)} />
                  <span style={{ fontSize: 11, marginTop: 6, color: "var(--text-muted)" }}>{d.tanggal.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pesanan Terbaru */}
        <div className="card">
          <h4 style={{ margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}>
            <Clock size={17} /> Pesanan Terbaru
          </h4>
          {dashboard.recent_orders.length === 0 ? (
            <p style={{ fontSize: 13 }}>Belum ada pesanan.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
              {dashboard.recent_orders.map((o) => (
                <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>{o.table?.nomor_meja} — {o.nama_customer}</p>
                    <p style={{ margin: 0, fontSize: 12 }}>{formatRupiah(o.total_harga)}</p>
                  </div>
                  <span className={`badge ${o.status_pembayaran === "lunas" ? "badge-success" : "badge-warning"}`}>
                    {o.status_pembayaran === "lunas" ? "Lunas" : "Belum Bayar"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}