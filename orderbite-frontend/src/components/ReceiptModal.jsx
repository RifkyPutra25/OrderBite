import { X, Printer } from "lucide-react";

export default function ReceiptModal({ order, onClose }) {
  if (!order) return null;

  const formatRupiah = (num) => `Rp ${Number(num).toLocaleString("id-ID")}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-overlay">
      <div className="receipt-modal">
        <div className="receipt-modal-header">
          <button className="icon-btn ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div id="receipt-print-area" className="receipt-content">
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>🍽️ OrderBite</h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666" }}>Struk Pesanan</p>
          </div>

          <div style={{ borderTop: "1px dashed #999", borderBottom: "1px dashed #999", padding: "10px 0", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span>Kode Pesanan</span>
              <strong>#{order.id}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span>Meja</span>
              <span>{order.table?.nomor_meja}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span>Customer</span>
              <span>{order.nama_customer}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span>Tanggal</span>
              <span>{new Date(order.created_at).toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            {order.items?.map((item) => (
              <div key={item.id} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }}>
                  <span>{item.menu_item?.nama}</span>
                  <span>{formatRupiah((item.menu_item?.harga || 0) * item.qty)}</span>
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {item.qty} x {formatRupiah(item.menu_item?.harga || 0)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px dashed #999", paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 15 }}>
            <span>Total</span>
            <span>{formatRupiah(order.total_harga)}</span>
          </div>

          <div style={{ marginTop: 10, textAlign: "center" }}>
            <span style={{
              display: "inline-block", padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: order.status_pembayaran === "lunas" ? "#d1fae5" : "#fef3c7",
              color: order.status_pembayaran === "lunas" ? "#047857" : "#b45309",
            }}>
              {order.status_pembayaran === "lunas" ? "LUNAS" : "BELUM BAYAR"}
            </span>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "#999", marginTop: 20 }}>
            Terima kasih telah memesan di OrderBite!
          </p>
        </div>

        <div className="receipt-modal-footer">
          <button onClick={handlePrint} style={{ width: "100%", justifyContent: "center" }}>
            <Printer size={16} /> Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
}