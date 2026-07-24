import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Award, Receipt } from "lucide-react";
import api from "../../api/axios";

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
        const [summaryRes, weeklyRes, bestRes, transRes] = await Promise.all([
          api.get("/reports/summary"),
          api.get("/reports/weekly-revenue"),
          api.get("/reports/best-sellers"),
          api.get("/reports/transactions"),
        ]);
        setSummary(summaryRes.data);
        setWeeklyRevenue(weeklyRes.data);
        setBestSellers(bestRes.data);
        setTransactions(transRes.data.data || []);
      } catch (err) {
        setError("Gagal memuat laporan");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatRupiah = (num) => `Rp ${Number(num).toLocaleString("id-ID")}`;

  if (loading) return <div className="loading-wrap"><div className="spinner" /> Memuat laporan...</div>;
  if (error) return <p style={{ color: "#dc2626" }}>{error}</p>;

  const maxRevenue = Math.max(...weeklyRevenue.map((d) => Number(d.total)), 1);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-icon"><BarChart3 size={22} /></div>
          <h2>Laporan Penjualan</h2>
          <p>Pantau performa penjualan restoran Anda.</p>
        </div>
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

      <div className="card" style={{ marginBottom: 24 }}>
        <h4 style={{ margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}>
          <TrendingUp size={17} /> Pendapatan 7 Hari Terakhir
        </h4>
        {weeklyRevenue.length === 0 ? (
          <p style={{ fontSize: 13 }}>Belum ada data</p>
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
                }} title={formatRupiah(d.total)} />
                <span style={{ fontSize: 11, marginTop: 6, color: "var(--text-muted)" }}>{d.tanggal.slice(5)}</span>
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