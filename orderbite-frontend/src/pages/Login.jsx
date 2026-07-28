import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Mail, Lock, ArrowRight, UtensilsCrossed, QrCode, BarChart3, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "kasir") navigate("/kasir");
      else if (user.role === "dapur") navigate("/dapur");
    } catch (err) {
  if (err.code === "ECONNABORTED") {
    setError("Server sedang sibuk, silakan coba lagi.");
  } else if (err.response?.status === 422) {
    setError("Email atau password salah");
  } else {
    setError("Terjadi kesalahan koneksi, silakan coba lagi.");
  }
} finally {
  setLoading(false);
}
  };

  return (
    <div className="auth-shell">
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-icon">
            <Store size={26} />
          </div>
          <h1>OrderBite</h1>
          <p>Kelola pesanan restoran Anda dengan mudah — dari dapur sampai ke meja pelanggan, semua dalam satu sistem.</p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon"><QrCode size={17} /></div>
              <span>Pesan lewat scan QR di meja</span>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon"><UtensilsCrossed size={17} /></div>
              <span>Pantau dapur & pesanan real-time</span>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon"><BarChart3 size={17} /></div>
              <span>Laporan penjualan otomatis</span>
            </div>
          </div>
        </div>
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-box">
          <h2>Selamat Datang</h2>
          <p className="auth-subtitle">Masuk ke akun Anda untuk melanjutkan</p>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={17} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9aa89b", pointerEvents: "none" }} />
                <input
                  type="email"
                  placeholder="nama@orderbite.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <div className="form-row">
              <label>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={17} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9aa89b", pointerEvents: "none" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                />
                <span
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: "absolute",
                    right: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9aa89b",
                    cursor: "pointer",
                    display: "flex",
                    userSelect: "none",
                  }}
                >
                  {showPassword ? <Eye size={17} /> : <EyeOff size={17} />}
                </span>
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>
              {loading ? "Memproses..." : <>Masuk <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}