import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Award, Receipt } from "lucide-react";
import api from "../../api/axios";
import LoadingScreen from "../../components/LoadingScreen";
import { Download } from "lucide-react";

export default function ReportsPage() {
  const [summary, setSummary] = useState(null);
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get("/reports/full");
        setSummary(res.data.summary);
        setWeeklyRevenue(res.data.weekly_revenue);
        setBestSellers(res.data.best_sellers);
        setTransactions(res.data.transactions.data || []);
      } catch (err) {
        setError("Gagal memuat laporan");
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

  const handleExport = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://orderbite-backend.test/api/reports/export", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Gagal export");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-orderbite-${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert("Gagal mengunduh laporan");
  }
};

  if (loading) return <LoadingScreen />;
  if (error) return <p style={{ color: "#dc2626" }}>{error}</p>;

  // Bangun 7 hari terakhir lengkap (isi 0 untuk hari tanpa transaksi)
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

  return (
          <div>
            <div className="page-header" style={{ alignItems: "center" }}>
        <div>
          <div className="page-header-icon"><BarChart3 size={22} /></div>
          <h2>Laporan Penjualan</h2>
          <p>Pantau performa penjualan restoran Anda.</p>
        </div>
        <button onClick={handleExport}>
          <Download size={15} /> Export Excel
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="card">
          <p style={{ margin: 0, fontSize: 13 }}>Pendapatan Hari Ini</p>
          <h3 style={{ margin: "6px 0 0" }}>{formatRupiah(summary.today_revenue)}</h3>
          <p style={{ margin: "4px 0 0", fontSize: 12 }}>{summary.today_orders} pesanan</p>
        </div>
        <div className="card">
          <p style={{ margin: 0, fontSize: 13 }}>Pendapatan Bulan Ini</p>
          <h3 style={{ margin: "6px 0 0" }}>{formatRupiah(summary.month_revenue)}</h3>
          <p style={{ margin: "4px 0 0", fontSize: 12 }}>{summary.month_orders} pesanan</p>
        </div>
      </div>

      {/* ===== Grafik Pendapatan 7 Hari ===== */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h4 style={{ margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}>
          <TrendingUp size={17} /> Pendapatan 7 Hari Terakhir
        </h4>

        {!hasAnyRevenue ? (
          <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--text-faint)" }}>
            <TrendingUp size={30} style={{ opacity: 0.4, marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: 13 }}>Belum ada transaksi lunas dalam 7 hari terakhir.</p>
          </div>
        ) : (
          <div style={{ display: "flex", marginTop: 24 }}>
            {/* Sumbu Y (grid label nominal) */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 180, paddingRight: 10, paddingBottom: 26 }}>
              {gridLines.map((g) => (
                <span key={g} style={{ fontSize: 10, color: "var(--text-faint)", textAlign: "right" }}>
                  {formatRupiahShort(maxRevenue * g)}
                </span>
              ))}
            </div>

            {/* Area chart */}
            <div style={{ flex: 1, position: "relative", height: 180 }}>
              {/* Garis grid horizontal */}
              {gridLines.map((g) => (
                <div key={g} style={{
                  position: "absolute", left: 0, right: 0,
                  top: `${(1 - g) * 100}%`,
                  borderTop: "1px dashed var(--border)",
                }} />
              ))}

              {/* Bars */}
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: "100%", position: "relative" }}>
                {chartData.map((d) => (
                  <div key={d.tanggal} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                    {d.total > 0 && (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--primary-dark)", marginBottom: 4 }}>
                        {formatRupiahShort(d.total)}
                      </span>
                    )}
                    <div
                      title={`${d.tanggal}: ${formatRupiah(d.total)}`}
                      style={{
                        width: "100%",
                        maxWidth: 42,
                        background: d.total > 0 ? "linear-gradient(180deg, #a9cba3, #4f8a5c)" : "var(--border)",
                        height: d.total > 0 ? `${(d.total / maxRevenue) * 100}%` : 3,
                        borderRadius: "6px 6px 2px 2px",
                        minHeight: 3,
                        transition: "height 0.3s ease",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {hasAnyRevenue && (
          <div style={{ display: "flex", marginTop: 8, paddingLeft: 42 }}>
            {chartData.map((d) => (
              <div key={d.tanggal} style={{ flex: 1, textAlign: "center" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{d.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 24, maxWidth: 460 }}>
        <h4 style={{ margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}>
          <Award size={17} /> Menu Terlaris
        </h4>
        {bestSellers.length === 0 ? (
          <p style={{ fontSize: 13 }}>Belum ada data</p>
        ) : (
          <div style={{ marginTop: 12 }}>
            {bestSellers.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < bestSellers.length - 1 ? "1px solid var(--border)" : "none" }}>
                <span style={{ fontSize: 14 }}><strong style={{ color: "var(--primary-dark)" }}>#{i + 1}</strong> &nbsp;{item.nama}</span>
                <span className="badge badge-neutral">{item.total_terjual} terjual</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h4 style={{ margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}>
          <Receipt size={17} /> Riwayat Transaksi (Lunas)
        </h4>
        {transactions.length === 0 ? (
          <p style={{ fontSize: 13 }}>Belum ada transaksi</p>
        ) : (
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table style={{ boxShadow: "none", border: "none" }}>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Meja</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((trx) => (
                  <tr key={trx.id}>
                    <td>{new Date(trx.created_at).toLocaleString("id-ID")}</td>
                    <td>{trx.table?.nomor_meja}</td>
                    <td>{trx.nama_customer}</td>
                    <td style={{ fontSize: 13 }}>{trx.items?.map((i) => `${i.menu_item?.nama} x${i.qty}`).join(", ")}</td>
                    <td style={{ fontWeight: 600 }}>{formatRupiah(trx.total_harga)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}