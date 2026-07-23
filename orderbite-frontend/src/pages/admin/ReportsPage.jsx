import { useState, useEffect } from "react";
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

  if (loading) return <p>Memuat laporan...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const maxRevenue = Math.max(...weeklyRevenue.map((d) => Number(d.total)), 1);

  return (
    <div>
      <h2>Laporan Penjualan</h2>

      {/* Ringkasan */}
      <div style={{ display: "flex", gap: 15, marginBottom: 30, flexWrap: "wrap" }}>
        <div className="card" style={{ minWidth: 180 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Pendapatan Hari Ini</p>
          <h3 style={{ margin: "5px 0" }}>{formatRupiah(summary.today_revenue)}</h3>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{summary.today_orders} pesanan</p>
        </div>
        <div className="card" style={{ minWidth: 180 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Pendapatan Bulan Ini</p>
          <h3 style={{ margin: "5px 0" }}>{formatRupiah(summary.month_revenue)}</h3>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{summary.month_orders} pesanan</p>
        </div>
      </div>

      {/* Grafik 7 hari terakhir */}
      <div className="card" style={{ marginBottom: 30 }}>
        <h3 style={{ marginTop: 0 }}>Pendapatan 7 Hari Terakhir</h3>
        {weeklyRevenue.length === 0 ? (
          <p>Belum ada data</p>
        ) : (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 150, borderBottom: "1px solid #ddd", padding: "0 10px" }}>
            {weeklyRevenue.map((d) => (
              <div key={d.tanggal} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{
                  width: "100%",
                  background: "#3b82f6",
                  height: `${(Number(d.total) / maxRevenue) * 120}px`,
                  borderRadius: "4px 4px 0 0",
                }} title={formatRupiah(d.total)} />
                <span style={{ fontSize: 11, marginTop: 4 }}>{d.tanggal.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Menu Terlaris */}
      <div className="card" style={{ marginBottom: 30, maxWidth: 420 }}>
        <h3 style={{ marginTop: 0 }}>Menu Terlaris</h3>
        {bestSellers.length === 0 ? (
          <p>Belum ada data</p>
        ) : (
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr><th>Menu</th><th>Terjual</th></tr>
            </thead>
            <tbody>
              {bestSellers.map((item, i) => (
                <tr key={i}>
                  <td>{item.nama}</td>
                  <td>{item.total_terjual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Riwayat Transaksi */}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Riwayat Transaksi (Lunas)</h3>
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
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
            {transactions.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: "center" }}>Belum ada transaksi</td></tr>
            ) : (
              transactions.map((trx) => (
                <tr key={trx.id}>
                  <td>{new Date(trx.created_at).toLocaleString("id-ID")}</td>
                  <td>{trx.table?.nomor_meja}</td>
                  <td>{trx.nama_customer}</td>
                  <td>{trx.items?.map((i) => `${i.menu_item?.nama} x${i.qty}`).join(", ")}</td>
                  <td>{formatRupiah(trx.total_harga)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}