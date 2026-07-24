import { useState, useEffect } from "react";
import { Users, Plus, Trash2, UserRound } from "lucide-react";
import api from "../../api/axios";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "kasir" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      setError("Gagal memuat data akun");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/users", form);
      setForm({ name: "", email: "", password: "", role: "kasir" });
      fetchUsers();
    } catch (err) {
      setError("Gagal membuat akun. Pastikan email belum dipakai.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus akun ini?")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      setError("Gagal menghapus akun");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-icon"><Users size={22} /></div>
          <h2>Kelola Akun Kasir/Dapur</h2>
          <p>Buat dan kelola akun untuk staf Kasir dan Dapur.</p>
        </div>
      </div>

      <div className="form-card">
        <h4>Buat Akun Baru</h4>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-row">
              <label>Nama</label>
              <input type="text" name="name" placeholder="Nama lengkap" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input type="email" name="email" placeholder="email@orderbite.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-row">
              <label>Password</label>
              <input type="password" name="password" placeholder="Minimal 6 karakter" value={form.password} onChange={handleChange} required minLength={6} />
            </div>
            <div className="form-row">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="kasir">Kasir</option>
                <option value="dapur">Dapur</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit"><Plus size={15} /> Buat Akun</button>
          </div>
        </form>
        {error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 10, marginBottom: 0 }}>{error}</p>}
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /> Memuat data...</div>
      ) : users.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon"><UserRound size={26} /></div>
          <p>Belum ada akun Kasir/Dapur. Buat akun pertama di atas.</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ width: 70 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === "kasir" ? "badge-warning" : "badge-danger"}`}>
                    {u.role === "kasir" ? "Kasir" : "Dapur"}
                  </span>
                </td>
                <td>
                  <button className="icon-btn danger" onClick={() => handleDelete(u.id)} title="Hapus"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}