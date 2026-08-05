import React, { useState, useEffect } from "react";
import BarcodeHandover from "./BarcodeHandover";
import { useAuth } from "../../contexts/AuthContext";

export const DriverPortal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("trips"); // 'trips' | 'handover' | 'expenses'

  // Assigned Trip Data
  const [assignedTrip, setAssignedTrip] = useState({
    id: "TRIP-2026-089",
    code: "FUTA-TRIP-889",
    status: "Đang vận hành", // 'Đang chờ' | 'Đang vận hành' | 'Hoàn thành'
    cargoType: "Hàng gia dụng & Thiết bị điện tử",
    weight: "6.5 Tấn",
    vehicle: "Hino 8T Box",
    licensePlate: "51C-888.99",
    barcode: "FUTA-TRK-001",
    route: "Bãi Xe Miền Đông (TP.HCM) ➔ Bãi Xe Đà Nẵng (Đà Nẵng)",
    schedule: "Xuất bến: 08:00 06/08/2026 - Dự kiến đến: 22:00 06/08/2026",
    distance: 120,
    revenue: 4500000
  });

  // Modal Hoàn thành chuyến đi
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionData, setCompletionData] = useState({
    finalDistance: 120,
    notes: "",
    cargoCondition: "Nguyên vẹn"
  });

  // Driver Expenses List
  const [expenses, setExpenses] = useState([
    {
      id: "EXP-101",
      category: "Phí cầu đường (BOT)",
      amount: 180000,
      description: "Vé BOT Trạm Thu Phí Dầu Giây - QL1A",
      receiptImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
      status: "Đã duyệt",
      createdAt: "2026-08-04"
    },
    {
      id: "EXP-102",
      category: "Nhiên liệu (Dầu Diesel)",
      amount: 1500000,
      description: "Đổ 70 Lít dầu Diesel tại Cây xăng Petrolimex Q.9",
      receiptImage: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80",
      status: "Chờ duyệt",
      createdAt: "2026-08-05"
    }
  ]);

  // New Expense Form
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "Phí cầu đường (BOT)",
    amount: 120000,
    description: "",
    receiptImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80"
  });

  // Load real driver trips dynamically based on logged in user
  useEffect(() => {
    const fetchDriverTrips = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/bookings', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          const list = json.data || [];
          
          // Match trip assigned to logged in user if possible
          const currentUserId = user?.id || user?._id;
          const active = list.find(t => {
            const drvId = typeof t.driver === 'object' ? t.driver._id : t.driver;
            const isMyTrip = !currentUserId || drvId === currentUserId || t.driver?.username === user?.username;
            return isMyTrip && (t.status === 'Đang vận hành' || t.status === 'Đang chờ' || t.status === 'in_progress');
          }) || list[0];

          if (active) {
            setAssignedTrip({
              id: active._id,
              code: active.tripCode || `FUTA-${active._id.slice(-6)}`,
              status: active.status === 'in_progress' ? 'Đang vận hành' : (active.status || 'Đang vận hành'),
              cargoType: active.cargoType || 'Hàng gia dụng & Thiết bị điện tử',
              weight: active.weight || '6.5 Tấn',
              vehicle: active.vehicle?.brand || 'Xe tải Futa Express',
              licensePlate: active.vehicle?.licensePlate || active.licensePlate || '51C-888.99',
              barcode: active.vehicle?.barcode || 'FUTA-TRK-001',
              route: active.route || 'Bãi Xe Miền Đông (TP.HCM) ➔ Bãi Xe Đà Nẵng',
              schedule: `Khởi hành: ${new Date(active.createdAt || Date.now()).toLocaleDateString('vi-VN')}`,
              distance: active.distance || 120,
              revenue: active.fare || active.finalPrice || 4500000
            });
          }
        }
      } catch (err) {
        console.error('Error fetching driver trips:', err);
      }
    };
    fetchDriverTrips();
  }, [user]);

  // Xử lý Bắt đầu Chuyến đi
  const handleStartTrip = async () => {
    try {
      if (assignedTrip.id && !assignedTrip.id.startsWith('TRIP-')) {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/bookings/${assignedTrip.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'Đang vận hành' })
        });
      }
      setAssignedTrip(prev => ({ ...prev, status: 'Đang vận hành' }));
      alert('🚀 Đã bắt đầu chuyến đi thành công!');
    } catch (err) {
      console.error(err);
      setAssignedTrip(prev => ({ ...prev, status: 'Đang vận hành' }));
    }
  };

  // Xử lý Hoàn thành Chuyến đi
  const handleConfirmCompleteTrip = async (e) => {
    e.preventDefault();
    try {
      if (assignedTrip.id && !assignedTrip.id.startsWith('TRIP-')) {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/bookings/${assignedTrip.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            status: 'completed',
            distance: completionData.finalDistance,
            endTime: new Date().toISOString()
          })
        });
      }
      setAssignedTrip(prev => ({ ...prev, status: 'Hoàn thành' }));
      setShowCompleteModal(false);
      alert('🎉 Chúc mừng! Đã ghi nhận HOÀN THÀNH CHUYẾN ĐỊ thành công!');
    } catch (err) {
      console.error(err);
      setAssignedTrip(prev => ({ ...prev, status: 'Hoàn thành' }));
      setShowCompleteModal(false);
    }
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    const created = {
      id: "EXP-" + (expenses.length + 101),
      ...newExpense,
      status: "Chờ duyệt",
      createdAt: new Date().toISOString().split("T")[0]
    };
    setExpenses([created, ...expenses]);
    setShowExpenseModal(false);
    setNewExpense({
      category: "Phí cầu đường (BOT)",
      amount: 120000,
      description: "",
      receiptImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80"
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Đang chờ":
        return <span style={{ background: "#fef3c7", color: "#d97706", padding: "6px 14px", borderRadius: 20, fontWeight: 700, fontSize: 13 }}>⏳ Đang chờ (Sẵn sàng xuất bến)</span>;
      case "Đang vận hành":
      case "in_progress":
        return <span style={{ background: "#dbeafe", color: "#2563eb", padding: "6px 14px", borderRadius: 20, fontWeight: 700, fontSize: 13 }}>🚚 Đang vận hành trên đường</span>;
      case "Hoàn thành":
      case "completed":
        return <span style={{ background: "#dcfce7", color: "#16a34a", padding: "6px 14px", borderRadius: 20, fontWeight: 700, fontSize: 13 }}>✅ Đã Hoàn Thành Chuyến Đi</span>;
      case "Chờ duyệt":
        return <span style={{ background: "#fff7ed", color: "#c2410c", padding: "3px 10px", borderRadius: 12, fontWeight: 700, fontSize: 12 }}>⏳ Chờ duyệt</span>;
      case "Đã duyệt":
        return <span style={{ background: "#f0fdf4", color: "#15803d", padding: "3px 10px", borderRadius: 12, fontWeight: 700, fontSize: 12 }}>✅ Đã duyệt</span>;
      case "Từ chối":
        return <span style={{ background: "#fef2f2", color: "#dc2626", padding: "3px 10px", borderRadius: 12, fontWeight: 700, fontSize: 12 }}>❌ Từ chối</span>;
      default:
        return null;
    }
  };

  const driverName = user?.fullName || user?.name || "Tài xế";
  const driverCode = user?.username ? user.username.toUpperCase() : "TX-FUTA";

  return (
    <div style={{ padding: 20, color: "#1e293b", maxWidth: 1100, margin: "0 auto" }}>
      {/* Driver Header */}
      <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "#fff", padding: 20, borderRadius: 12, marginBottom: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, opacity: 0.7 }}>Cổng Thông Tin Vận Hành Tài Xế FUTA Express</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: "4px 0 0 0", color: "#f97316" }}>
              👨‍✈️ {driverName} ({driverCode})
            </h1>
          </div>
          <div style={{ textAlign: "right", fontSize: 13, opacity: 0.9 }}>
            <div>Xe phụ trách: <strong style={{ color: "#38bdf8" }}>{assignedTrip.licensePlate}</strong></div>
            <div>Trạng thái: <strong>{assignedTrip.status}</strong></div>
          </div>
        </div>
      </div>

      {/* Tabs Nav */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, borderBottom: "2px solid #e2e8f0", paddingBottom: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("trips")}
          style={{
            padding: "10px 18px",
            background: activeTab === "trips" ? "#f97316" : "#f1f5f9",
            color: activeTab === "trips" ? "#fff" : "#475569",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 14
          }}
        >
          📦 Chuyến Đi Được Phân Công
        </button>

        <button
          onClick={() => setActiveTab("handover")}
          style={{
            padding: "10px 18px",
            background: activeTab === "handover" ? "#f97316" : "#f1f5f9",
            color: activeTab === "handover" ? "#fff" : "#475569",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 14
          }}
        >
          📱 Nhận / Giao Xe (Barcode)
        </button>

        <button
          onClick={() => setActiveTab("expenses")}
          style={{
            padding: "10px 18px",
            background: activeTab === "expenses" ? "#f97316" : "#f1f5f9",
            color: activeTab === "expenses" ? "#fff" : "#475569",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 14
          }}
        >
          💵 Khai Báo Chi Phí
        </button>
      </div>

      {/* TAB 1: Assigned Trip Detail & Action Buttons */}
      {activeTab === "trips" && (
        <div style={{ background: "#ffffff", padding: 22, borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #f1f5f9", paddingBottom: 12, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#0f172a" }}>
              Mã chuyến xe: <span style={{ color: "#f97316" }}>{assignedTrip.code}</span>
            </h2>
            {getStatusBadge(assignedTrip.status)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, fontSize: 14, lineHeight: "1.8" }}>
            <div style={{ background: "#f8fafc", padding: 16, borderRadius: 10, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2563eb", marginTop: 0, marginBottom: 10 }}>🚚 Thông tin Phương tiện & Hàng hóa</h3>
              <div>Dòng xe: <strong>{assignedTrip.vehicle}</strong></div>
              <div>Biển số xe: <strong style={{ color: "#ea580c", fontSize: 16 }}>{assignedTrip.licensePlate}</strong></div>
              <div>Mã vạch xe (Barcode): <code>{assignedTrip.barcode}</code></div>
              <div>Loại hàng hóa: <strong>{assignedTrip.cargoType}</strong></div>
              <div>Khối lượng: <strong>{assignedTrip.weight}</strong></div>
            </div>

            <div style={{ background: "#f8fafc", padding: 16, borderRadius: 10, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#16a34a", marginTop: 0, marginBottom: 10 }}>📍 Lộ trình & Lịch trình</h3>
              <div>Tuyến đường: <strong>{assignedTrip.route}</strong></div>
              <div>Thời gian: <strong>{assignedTrip.schedule}</strong></div>
              <div>Quãng đường dự kiến: <strong>{assignedTrip.distance} km</strong></div>
              <div>Doanh thu ước tính: <strong style={{ color: "#16a34a" }}>{assignedTrip.revenue.toLocaleString('vi-VN')} đ</strong></div>
            </div>
          </div>

          {/* ACTION BUTTONS FOR DRIVER TO UPDATE TRIP STATUS */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px dashed #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              💡 <strong>Thao tác tài xế:</strong> Bấm nút bên phải để bắt đầu chuyến đi hoặc xác nhận hoàn thành khi đã cập bến an toàn.
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              {assignedTrip.status === "Đang chờ" && (
                <button
                  onClick={handleStartTrip}
                  style={{
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(37,99,235,0.3)"
                  }}
                >
                  🚀 Bắt Đầu Chuyến Đi
                </button>
              )}

              {(assignedTrip.status === "Đang vận hành" || assignedTrip.status === "in_progress") && (
                <button
                  onClick={() => setShowCompleteModal(true)}
                  style={{
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, #16a34a, #15803d)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(22,163,74,0.3)"
                  }}
                >
                  ✅ Xác Nhận Hoàn Thành Chuyến Đi
                </button>
              )}

              {(assignedTrip.status === "Hoàn thành" || assignedTrip.status === "completed") && (
                <button
                  disabled
                  style={{
                    padding: "12px 24px",
                    background: "#e2e8f0",
                    color: "#16a34a",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: "default"
                  }}
                >
                  🎉 Chuyến Đi Đã Hoàn Thành
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal XÁC NHẬN HOÀN THÀNH CHUYẾN ĐỊ */}
      {showCompleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <form onSubmit={handleConfirmCompleteTrip} style={{ background: "#ffffff", padding: 24, borderRadius: 12, width: 480, maxWidth: "100%", boxShadow: "0 20px 25px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 12px 0", color: "#16a34a", display: "flex", alignItems: "center", gap: 8 }}>
              🏁 Xác Nhận Hoàn Thành Chuyến Xe
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px 0" }}>
              Vui lòng nhập thông tin xác nhận khi phương tiện đã cập bến an toàn.
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>
                Quãng đường thực tế đã chạy (km)
              </label>
              <input
                type="number"
                required
                min="1"
                value={completionData.finalDistance}
                onChange={(e) => setCompletionData({ ...completionData, finalDistance: Number(e.target.value) })}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 15, fontWeight: 700, boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>
                Tình trạng hàng hóa sau khi trả bến
              </label>
              <select
                value={completionData.cargoCondition}
                onChange={(e) => setCompletionData({ ...completionData, cargoCondition: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, background: "#fff", boxSizing: "border-box" }}
              >
                <option value="Nguyên vẹn">🟢 Hàng hóa nguyên vẹn 100%</option>
                <option value="Hao hụt nhẹ">🟡 Có phát sinh kiểm đếm bổ sung</option>
                <option value="Có sự cố">🔴 Có sự cố phát sinh (ghi chú ở dưới)</option>
              </select>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>
                Ghi chú của Tài xế (nếu có)
              </label>
              <textarea
                rows="3"
                value={completionData.notes}
                onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                placeholder="Nhập phản hồi tình trạng xe, thời gian đến bến..."
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowCompleteModal(false)}
                style={{ padding: "9px 18px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                style={{ padding: "9px 20px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}
              >
                ✅ Hoàn Thành Chuyến
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Barcode Handover Component */}
      {activeTab === "handover" && (
        <BarcodeHandover />
      )}

      {/* TAB 3: Driver Expenses */}
      {activeTab === "expenses" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#0f172a" }}>
              📋 Danh Sách & Khai Báo Chi Phí Chuyến Đi
            </h2>
            <button
              onClick={() => setShowExpenseModal(true)}
              style={{ padding: "9px 16px", background: "#f97316", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}
            >
              ➕ Tạo Yêu Cầu Chi Phí Mới
            </button>
          </div>

          <div style={{ background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", overflowX: "auto", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                  <th style={{ padding: "12px 16px" }}>Loại chi phí</th>
                  <th style={{ padding: "12px 16px" }}>Nội dung diễn giải</th>
                  <th style={{ padding: "12px 16px" }}>Số tiền (VNĐ)</th>
                  <th style={{ padding: "12px 16px" }}>Hóa đơn / Minh chứng</th>
                  <th style={{ padding: "12px 16px" }}>Trạng thái xử lý</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a" }}>{exp.category}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div>{exp.description}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Ngày tạo: {exp.createdAt}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 800, color: "#ea580c" }}>
                      {exp.amount.toLocaleString()} VNĐ
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <img src={exp.receiptImage} alt="Receipt" style={{ width: 45, height: 45, objectFit: "cover", borderRadius: 6, border: "1px solid #e2e8f0" }} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>{getStatusBadge(exp.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* New Expense Modal */}
          {showExpenseModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
              <form onSubmit={handleAddExpense} style={{ background: "#ffffff", padding: 24, borderRadius: 12, width: 450, maxWidth: "100%", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>💵 Khai Báo Chi Phí Mới</h2>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Loại chi phí</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", boxSizing: "border-box" }}
                  >
                    <option value="Phí cầu đường (BOT)">Phí cầu đường (BOT)</option>
                    <option value="Nhiên liệu (Dầu Diesel)">Nhiên liệu (Dầu Diesel)</option>
                    <option value="Phí lưu bến / Bãi xe">Phí lưu bến / Bãi xe</option>
                    <option value="Sửa chữa nhỏ đường trường">Sửa chữa nhỏ đường trường</option>
                  </select>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Số tiền phát sinh (VNĐ)</label>
                  <input
                    type="number"
                    required
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Nội dung / Trạm thu phí / Lý do</label>
                  <textarea
                    rows="2"
                    required
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, boxSizing: "border-box" }}
                    placeholder="VD: Mua vé trạm thu phí Long Thành..."
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Ảnh Hóa đơn / Biên lai minh chứng</label>
                  <img src={newExpense.receiptImage} alt="Receipt preview" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 6, marginBottom: 6 }} />
                  <span style={{ fontSize: 11, color: "#64748b" }}>* Ảnh mẫu tự động gắn kèm chứng minh</span>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setShowExpenseModal(false)} style={{ padding: "8px 16px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 6, cursor: "pointer" }}>Hủy</button>
                  <button type="submit" style={{ padding: "8px 16px", background: "#f97316", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}>Gửi Yêu Cầu Chi Phí</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverPortal;
