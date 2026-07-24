import { useState, useEffect } from "react";
import { Table2, Plus, Pencil, Trash2, QrCode, LayoutGrid } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import api from "../../api/axios";

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({ nomor_meja: "", kapasitas: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrTable, setQrTable] = useState(null);

  const fetchTables = async () => {
    try {
      const res = await api.get("/tables");
      setTables(res.data);
    } catch (err) {
      setError("Gagal memuat data meja");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ nomor_meja: "", kapasitas: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/tables/${editingId}`, form);
      } else {
        await api.post("/tables", form);
      }
      resetForm();
      fetchTables();
    } catch (err) {
      setError("Gagal menyimpan meja. Pastikan nomor meja belum dipakai.");
    }
  };

  const handleEdit = (table) => {
    setEditingId(table.id);
    setForm({ nomor_meja: table.nomor_meja, kapasitas: table.kapasitas });
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus meja ini?")) return;
    try {
      await api.delete(`/tables/${id}`);
      fetchTables();
    } catch (err) {
      setError("Gagal menghapus meja");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-icon"><Table2 size={22} /></div>
          <h2>Kelola Meja</h2>
          <p>Atur nomor meja, kapasitas, dan QR code untuk tiap meja.</p>
        </div>
      </div>

      <div className="form-card">
        <h4>{editingId ? "Edit Meja" : "Tambah Meja Baru"}</h4>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="form-row" style={{ marginBottom: 0, minWidth: 180 }}>
              <label>Nomor Meja</label>
              <input type="text" name="nomor_meja" placeholder="Contoh: A1" value={form.nomor_meja} onChange={handleChange} required />
            </div>
            <div className="form-row" style={{ marginBottom: 0, minWidth: 160 }}>
              <label>Kapasitas</label>
              <input type="number" name="kapasitas" placeholder="4" value={form.kapasitas} onChange={handleChange} required min="1" />
            </div>
            <div className="form-actions" style={{ marginTop: 0 }}>
              <button type="submit">
                {editingId ? <Pencil size={15} /> : <Plus size={15} />}
                {editingId ? "Update" : "Tambah"}
              </button>
              {editingId && <button type="button" className="secondary" onClick={resetForm}>Batal</button>}
            </div>
          </div>
        </form>
        {error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 10, marginBottom: 0 }}>{error}</p>}
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /> Memuat data...</div>
      ) : tables.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon"><LayoutGrid size={26} /></div>
          <p>Belum ada meja. Tambahkan meja pertama Anda di atas.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {tables.map((table) => (
            <div key={table.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 20 }}>{table.nomor_meja}</h3>
                  <p style={{ margin: "3px 0 0", fontSize: 13 }}>{table.kapasitas} orang</p>
                </div>
                <span className={`badge ${table.status === "kosong" ? "badge-success" : "badge-warning"}`}>
                  {table.status === "kosong" ? "Kosong" : "Terisi"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button className="icon-btn secondary" onClick={() => handleEdit(table)} title="Edit"><Pencil size={15} /></button>
                <button className="icon-btn danger" onClick={() => handleDelete(table.id)} title="Hapus"><Trash2 size={15} /></button>
                <button className="icon-btn secondary" onClick={() => setQrTable(table)} title="Lihat QR" style={{ marginLeft: "auto" }}>
                  <QrCode size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {qrTable && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(22,36,26,0.5)", backdropFilter: "blur(2px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
          animation: "fadeIn 0.2s ease",
        }}>
          <div className="card" style={{ padding: 34, textAlign: "center", maxWidth: 320 }}>
            <h3 style={{ marginTop: 0 }}>QR Code Meja {qrTable.nomor_meja}</h3>
            <div style={{ padding: 16, background: "white", borderRadius: 12, display: "inline-block", border: "1px solid var(--border)" }}>
              <QRCodeSVG value={`${window.location.origin}/order/${qrTable.id}`} size={200} />
            </div>
            <p style={{ fontSize: 12, wordBreak: "break-all", marginTop: 14 }}>
              {window.location.origin}/order/{qrTable.id}
            </p>
            <div style={{ marginTop: 16 }}>
              <button onClick={() => window.print()}>Print</button>
              <button className="secondary" onClick={() => setQrTable(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}