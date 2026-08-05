import React, { useState } from "react";

export const MaintenanceLog = () => {
  const [tickets, setTickets] = useState([
    {
      id: "MNT-001",
      vehicle: "51C-888.99",
      brand: "Hino 8T",
      status: "Chờ bảo dưỡng",
      issue: "Bảo dưỡng định kỳ 50.000 Km, thay nhớt & lọc gió",
      garage: "Garage Futa Express Q9",
      estimatedCost: 3500000,
      createdAt: "2026-08-01"
    },
    {
      id: "MNT-002",
      vehicle: "51C-777.22",
      brand: "Isuzu 5T",
      status: "Đang bảo dưỡng",
      issue: "Thay má phanh trước và lốp xe phía sau",
      garage: "Garage Hàng Xanh",
      estimatedCost: 6800000,
      createdAt: "2026-08-03"
    },
    {
      id: "MNT-003",
      vehicle: "51D-123.45",
      brand: "Hyundai 3.5T",
      status: "Hoàn thành",
      issue: "Sửa máy lạnh cabin và cân chỉnh thước lái",
      garage: "Garage Futa Express Q9",
      estimatedCost: 2400000,
      createdAt: "2026-07-25"
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicle: "51C-999.00",
    brand: "Hino 15T",
    issue: "",
    garage: "Garage Futa Express Q9",
    estimatedCost: 2000000
  });

  const handleCreateTicket = (e) => {
    e.preventDefault();
    const newTicket = {
      id: "MNT-00" + (tickets.length + 1),
      ...formData,
      status: "Chờ bảo dưỡng",
      createdAt: new Date().toISOString().split("T")[0]
    };
    setTickets([newTicket, ...tickets]);
    setShowModal(false);
    setFormData({ vehicle: "51C-999.00", brand: "Hino 15T", issue: "", garage: "Garage Futa Express Q9", estimatedCost: 2000000 });
  };

  const handleUpdateStatus = (id, newStatus) => {
    setTickets(
      tickets.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Chờ bảo dưỡng":
        return <span style={{ background: "#fef3c7", color: "#d97706", padding: "4px 10px", borderRadius: 12, fontWeight: 700, fontSize: 12 }}>⏳ Chờ bảo dưỡng</span>;
      case "Đang bảo dưỡng":
        return <span style={{ background: "#dbeafe", color: "#2563eb", padding: "4px 10px", borderRadius: 12, fontWeight: 700, fontSize: 12 }}>🛠️ Đang bảo dưỡng</span>;
      case "Hoàn thành":
        return <span style={{ background: "#dcfce7", color: "#16a34a", padding: "4px 10px", borderRadius: 12, fontWeight: 700, fontSize: 12 }}>✅ Hoàn thành</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 24, color: "#1e293b" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#0f172a" }}>
            🛠️ Quản Lý Bảo Dưỡng Phương Tiện
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
            Theo dõi trạng thái phương tiện bảo trì (`Chờ bảo dưỡng` ➔ `Đang bảo dưỡng` ➔ `Hoàn thành`). Tự động trả xe về trạng thái Sẵn sàng khi hoàn tất.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "#ea580c",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          📝 Lập Phiếu Bảo Dưỡng
        </button>
      </div>

      <div style={{ background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
              <th style={{ padding: "12px 16px" }}>Mã Phiếu</th>
              <th style={{ padding: "12px 16px" }}>Phương tiện</th>
              <th style={{ padding: "12px 16px" }}>Nội dung bảo dưỡng</th>
              <th style={{ padding: "12px 16px" }}>Gara / Chi phí</th>
              <th style={{ padding: "12px 16px" }}>Trạng thái</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Cập nhật tiến độ</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: "#2563eb" }}>{ticket.id}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{ticket.vehicle}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{ticket.brand}</div>
                </td>
                <td style={{ padding: "12px 16px" }}>{ticket.issue}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div>{ticket.garage}</div>
                  <div style={{ fontSize: 12, color: "#ea580c", fontWeight: 700 }}>
                    {ticket.estimatedCost.toLocaleString()} VNĐ
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>{getStatusBadge(ticket.status)}</td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  {ticket.status === "Chờ bảo dưỡng" && (
                    <button
                      onClick={() => handleUpdateStatus(ticket.id, "Đang bảo dưỡng")}
                      style={{ padding: "5px 10px", background: "#dbeafe", color: "#1d4ed8", border: "1px solid #93c5fd", borderRadius: 6, fontWeight: 700, cursor: "pointer", fontSize: 12 }}
                    >
                      ▶️ Chuyển Đang bảo dưỡng
                    </button>
                  )}
                  {ticket.status === "Đang bảo dưỡng" && (
                    <button
                      onClick={() => handleUpdateStatus(ticket.id, "Hoàn thành")}
                      style={{ padding: "5px 10px", background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", borderRadius: 6, fontWeight: 700, cursor: "pointer", fontSize: 12 }}
                    >
                      ✅ Đã Hoàn thành (Sẵn sàng)
                    </button>
                  )}
                  {ticket.status === "Hoàn thành" && (
                    <span style={{ fontSize: 12, color: "#64748b" }}>Đã khóa phiếu</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <form onSubmit={handleCreateTicket} style={{ background: "#ffffff", padding: 24, borderRadius: 12, width: 450 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>🛠️ Lập Phiếu Bảo Dưỡng Xe</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Biển số xe</label>
              <input type="text" required value={formData.vehicle} onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Nội dung bảo dưỡng / Lỗi kỹ thuật</label>
              <textarea rows="3" required value={formData.issue} onChange={(e) => setFormData({ ...formData, issue: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} placeholder="Mô tả sự cố hoặc linh kiện cần bảo dưỡng..." />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Tên Gara thực hiện</label>
                <input type="text" required value={formData.garage} onChange={(e) => setFormData({ ...formData, garage: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Chi phí dự kiến (VNĐ)</label>
                <input type="number" required value={formData.estimatedCost} onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: "8px 16px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 6, cursor: "pointer" }}>Hủy</button>
              <button type="submit" style={{ padding: "8px 16px", background: "#ea580c", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}>Tạo Phiếu</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MaintenanceLog;
