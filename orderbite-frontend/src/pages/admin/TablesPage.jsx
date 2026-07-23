import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({ nomor_meja: "", kapasitas: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <p>Memuat...</p>;

  return (
    <div>
      <h2>Kelola Meja</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 8, maxWidth: 300 }}>
        <input
          type="text"
          name="nomor_meja"
          placeholder="Nomor meja (contoh: A1)"
          value={form.nomor_meja}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="kapasitas"
          placeholder="Kapasitas (jumlah kursi)"
          value={form.kapasitas}
          onChange={handleChange}
          required
          min="1"
        />
        <div>
          <button type="submit">{editingId ? "Update" : "Tambah"}</button>
          {editingId && <button type="button" onClick={resetForm}>Batal</button>}
        </div>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
             <th>ID</th>
             <th>Nomor Meja</th>
             <th>Kapasitas</th>
             <th>Status</th>
             <th>Aksi</th>
         </tr>
         </thead>
        <tbody>
          {tables.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>Belum ada meja</td>
            </tr>
          ) : (
            tables.map((table) => (
              <tr key={table.id}>
                <td>{table.id}</td>
                <td>{table.nomor_meja}</td>
                <td>{table.kapasitas} orang</td>
                <td>{table.status === "kosong" ? "Kosong" : "Terisi"}</td>
                <td>
                  <button onClick={() => handleEdit(table)}>Edit</button>
                  <button onClick={() => handleDelete(table.id)}>Hapus</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}