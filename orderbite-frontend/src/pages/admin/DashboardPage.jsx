import { useState, useEffect } from "react";
import { LayoutDashboard, Wallet, ShoppingBag, Table2, ChefHat, AlertCircle, TrendingUp, Clock } from "lucide-react";
import api from "../../api/axios";
import LoadingScreen from "../../components/LoadingScreen";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get("/reports/overview");
        setSummary(res.data.summary);
        setDashboard(res.data.dashboard);
        setWeeklyRevenue(res.data.weekly_revenue);
      } catch (err) {
        setError("Gagal memuat dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatRupiah = (num) => `Rp ${Number(num).toLocaleString("id-ID")}`;
  const formatRupiahShort = (num) => {
    const n = Number(num);
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}jt`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}rb`;
    return n.toString();
  };

  if (loading) return <LoadingScreen />;
  if (error) return <p style={{ color: "#dc2626" }}>{error}</p>;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const revenueMap = Object.fromEntries(weeklyRevenue.map((d) => [d.tanggal, Number(d.total)]));
  const chartData = last7Days.map((tanggal) => ({
    tanggal,
    total: revenueMap[tanggal] || 0,
    label: new Date(tanggal).toLocaleDateString("id-ID", { weekday: "short" }),
  }));

  const maxRevenue = Math.max(...chartData.map((d) => d.total), 1);
  const hasAnyRevenue = chartData.some((d) => d.total > 0);
  const gridLines = [1, 0.75, 0.5, 0.25, 0];

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
        {/* ===== Grafik Pendapatan 7 Hari ===== */}
        <div className="card">
          <h4 style={{ margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}>
            <TrendingUp size={17} /> Pendapatan 7 Hari Terakhir
          </h4>

          {!hasAnyRevenue ? (
            <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-faint)" }}>
              <TrendingUp size={26} style={{ opacity: 0.4, marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: 13 }}>Belum ada transaksi lunas dalam 7 hari terakhir.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", marginTop: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 160, paddingRight: 10, paddingBottom: 26 }}>
                  {gridLines.map((g) => (
                    <span key={g} style={{ fontSize: 10, color: "var(--text-faint)", textAlign: "right" }}>
                      {formatRupiahShort(maxRevenue * g)}
                    </span>
                  ))}
                </div>

                <div style={{ flex: 1, position: "relative", height: 160 }}>
                  {gridLines.map((g) => (
                    <div key={g} style={{
                      position: "absolute", left: 0, right: 0,
                      top: `${(1 - g) * 100}%`,
                      borderTop: "1px dashed var(--border)",
                    }} />
                  ))}

                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: "100%", position: "relative" }}>
                    {chartData.map((d) => (
                      <div key={d.tanggal} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                        {d.total > 0 && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 4 }}>
                            {formatRupiahShort(d.total)}
                          </span>
                        )}
                        <div
                          title={`${d.tanggal}: ${formatRupiah(d.total)}`}
                          style={{
                            width: "100%",
                            maxWidth: 36,
                            background: d.total > 0 ? "linear-gradient(180deg, #a9cba3, #4f8a5c)" : "var(--border)",
                            height: d.total > 0 ? `${(d.total / maxRevenue) * 100}%` : 3,
                            borderRadius: "6px 6px 2px 2px",
                            minHeight: 3,
                            transition: "height 0.3s ease",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", marginTop: 8, paddingLeft: 38 }}>
                {chartData.map((d) => (
                  <div key={d.tanggal} style={{ flex: 1, textAlign: "center" }}>
                    <span style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 500 }}>{d.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

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