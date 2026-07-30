import React, { useEffect, useState } from "react";
import { expenseApi } from "../../api/handoverApi";
import { freightTripApi } from "../../api/freightTripApi";

export const ExpenseApproval = () => {
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Form claim state for drivers
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [expenseType, setExpenseType] = useState("Phí trạm BOT");
  const [amount, setAmount] = useState(150000);
  const [description, setDescription] = useState("Phí BOT qua trạm Phan Thiết");
  const [receiptImage, setReceiptImage] = useState("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80");

  // Rejection modal state
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Preview image modal
  const [previewImg, setPreviewImg] = useState(null);

  useEffect(() => {
    fetchExpenses();
    fetchTrips();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await expenseApi.getAllExpenses();
      if (res.data?.data) {
        setExpenses(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await freightTripApi.getAllTrips();
      if (res.data?.data) {
        setTrips(res.data.data);
        if (res.data.data.length > 0) setSelectedTripId(res.data.data[0]._id);
      }
    } catch (err) {
      console.error("Error fetching trips:", err);
    }
  };

  const handleCreateClaim = async (e) => {
    e.preventDefault();
    if (!selectedTripId || !amount || !receiptImage) {
      setMessage({ type: "error", text: "Vui lòng chọn chuyến xe, nhập số tiền và đính kèm ảnh hóa đơn!" });
      return;
    }

    try {
      setLoading(true);
      const res = await expenseApi.createExpense({
        tripId: selectedTripId,
        type: expenseType,
        amount: Number(amount),
        description,
        receiptImage
      });

      if (res.data?.success) {
        setMessage({ type: "success", text: res.data.message });
        setShowClaimForm(false);
        fetchExpenses();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Lỗi gửi chi phí hoàn ứng" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setLoading(true);
      const res = await expenseApi.approveExpense(id, "Đã kiểm tra khớp với hóa đơn giấy và Km hành trình.");
      if (res.data?.success) {
        setMessage({ type: "success", text: res.data.message });
        fetchExpenses();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Lỗi phê duyệt chi phí" });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason) return;
    try {
      setLoading(true);
      const res = await expenseApi.rejectExpense(rejectingId, rejectionReason);
      if (res.data?.success) {
        setMessage({ type: "success", text: res.data.message });
        setRejectingId(null);
        setRejectionReason("");
        fetchExpenses();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Lỗi từ chối chi phí" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, color: "#1e293b" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#0f172a" }}>
            🧾 Khai Báo & Đối Soát Chi Phí Đường Trường Futa Express
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 4, margin: 0 }}>
            Tài xế đệ trình chi phí hoàn ứng dọc đường (BOT, Xăng dầu) kèm ảnh hóa đơn ➔ Kế toán đối soát & duyệt trực tuyến.
          </p>
        </div>

        <button
          onClick={() => setShowClaimForm(!showClaimForm)}
          style={{
            padding: "9px 16px",
            background: "#f97316",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          {showClaimForm ? "Đóng Form" : "➕ Tài Xế Đệ Trình Chi Phí"}
        </button>
      </div>

      {message && (
        <div style={{
          padding: "12px 16px",
          borderRadius: 8,
          marginBottom: 16,
          background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
          color: message.type === "success" ? "#166534" : "#991b1b",
          border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`
        }}>
          {message.text}
        </div>
      )}

      {/* Driver Claim Form Modal */}
      {showClaimForm && (
        <form onSubmit={handleCreateClaim} style={{ background: "#ffffff", padding: 18, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: "#ea580c" }}>
            ⛽ Yêu Cầu Hoàn ứng Chi Phí Đường Trường
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>Chọn Chuyến Xe phát sinh</label>
              <select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a" }}
              >
                {trips.map((t) => (
                  <option key={t._id} value={t._id}>[{t.tripCode}] {t.startDepot?.name} ➔ {t.endDepot?.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>Loại Chi phí</label>
              <select
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a" }}
              >
                <option value="Xăng dầu">⛽ Xăng dầu / Dầu Diesel</option>
                <option value="Phí trạm BOT">🛣️ Phí trạm BOT</option>
                <option value="Sửa chữa nhỏ / Vá lốp">🔧 Sửa chữa nhỏ / Vá lốp</option>
                <option value="Chi phí khác">📝 Chi phí khác</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>Số tiền hoàn ứng (VND)</label>
              <input
                type="number"
                step="10000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{ width: "100%", padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>Mô tả chi tiết</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Phí trạm BOT Phan Thiết cho xe tải 7.5t..."
              style={{ width: "100%", padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a" }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>📸 URL Ảnh Hóa đơn / Biên lai giấy</label>
            <input
              type="text"
              value={receiptImage}
              onChange={(e) => setReceiptImage(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ padding: "9px 20px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}
          >
            {loading ? "Đang gửi..." : "Gửi Đệ Trình Cho Kế Toán Phê Duyệt"}
          </button>
        </form>
      )}

      {/* Expenses Table */}
      <div style={{ background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: 14, borderBottom: "1px solid #e2e8f0", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
          📑 Hàng Chờ Phê Duyệt Chi Phí ({expenses.length} khoản đệ trình)
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Đang tải danh sách chi phí...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc", color: "#64748b", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "10px 14px" }}>Chuyến Đi</th>
                <th style={{ padding: "10px 14px" }}>Xe Tải</th>
                <th style={{ padding: "10px 14px" }}>Tài Xế Đệ Trình</th>
                <th style={{ padding: "10px 14px" }}>Loại Chi Phí</th>
                <th style={{ padding: "10px 14px" }}>Số Tiền (VND)</th>
                <th style={{ padding: "10px 14px" }}>Ảnh Hóa Đơn</th>
                <th style={{ padding: "10px 14px" }}>Trạng Thái</th>
                <th style={{ padding: "10px 14px", textAlign: "right" }}>Thao Tác Kế Toán</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => {
                const statusColor = exp.status === "Đã duyệt" ? "#16a34a" : exp.status === "Từ chối" ? "#dc2626" : "#d97706";
                return (
                  <tr key={exp._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: "#ea580c" }}>
                      {exp.trip?.tripCode || "N/A"}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#0f172a" }}>
                      {exp.vehicle?.licensePlate || "N/A"}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#334155" }}>
                      {exp.driver?.fullName || "Tài xế"}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>
                        {exp.type}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: "#0f172a" }}>
                      {exp.amount?.toLocaleString("vi-VN")} đ
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {exp.receiptImage ? (
                        <button
                          onClick={() => setPreviewImg(exp.receiptImage)}
                          style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 4, padding: "2px 8px", fontSize: 12, cursor: "pointer" }}
                        >
                          👁️ Xem Hóa Đơn
                        </button>
                      ) : "Không có"}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ background: `${statusColor}15`, color: statusColor, padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                        {exp.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      {exp.status === "Chờ duyệt" ? (
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleApprove(exp._id)}
                            style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                          >
                            ✓ Duyệt
                          </button>
                          <button
                            onClick={() => setRejectingId(exp._id)}
                            style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                          >
                            ✕ Từ chối
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                          {exp.status === "Đã duyệt" ? `Bởi: ${exp.approvedBy?.fullName || "Kế toán"}` : `Lý do: ${exp.rejectionReason}`}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImg && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "#ffffff", padding: 20, borderRadius: 10, maxWidth: 550, width: "90%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>🧾 Ảnh Hóa Đơn Đối Soát Chi Phí</h3>
              <button onClick={() => setPreviewImg(null)} style={{ background: "none", border: "none", color: "#64748b", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
            <img src={previewImg} alt="Receipt" style={{ width: "100%", maxHeight: 420, objectFit: "contain", borderRadius: 6, border: "1px solid #e2e8f0" }} />
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <form onSubmit={handleConfirmReject} style={{ background: "#ffffff", padding: 20, borderRadius: 10, width: 420, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: 0, fontSize: 16, marginBottom: 10, color: "#dc2626" }}>✕ Nhập Lý Do Từ Chối Chi Phí</h3>
            <textarea
              rows="3"
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="VD: Ảnh hóa đơn bị mờ, không rõ số hóa đơn VAT..."
              style={{ width: "100%", padding: 10, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a", marginBottom: 14 }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setRejectingId(null)} style={{ padding: "7px 14px", background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: 6 }}>Hủy</button>
              <button type="submit" style={{ padding: "7px 14px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700 }}>Xác nhận từ chối</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ExpenseApproval;
