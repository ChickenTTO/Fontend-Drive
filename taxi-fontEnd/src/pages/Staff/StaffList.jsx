import React, { useState, useEffect } from "react";

export const StaffList = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [message, setMessage] = useState(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states for Add
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "dispatcher",
  });

  // Form states for Edit
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    role: "dispatcher",
    password: "",
  });

  const mockStaff = [
    { _id: "st-1", username: "admin_futa", fullName: "Nguyễn Văn Quảng", email: "admin@futa.vn", phone: "0901234567", role: "admin", isActive: true, createdAt: "2026-01-10" },
    { _id: "st-2", username: "dispatcher_nam", fullName: "Trần Nam", email: "nam.tran@futa.vn", phone: "0912345678", role: "dispatcher", isActive: true, createdAt: "2026-01-15" },
    { _id: "st-3", username: "driver_dinh", fullName: "Lê Văn Định", email: "dinh.driver@futa.vn", phone: "0923456789", role: "driver", isActive: true, createdAt: "2026-02-01" },
    { _id: "st-4", username: "driver_hung", fullName: "Phạm Hùng", email: "hung.driver@futa.vn", phone: "0934567890", role: "driver", isActive: false, createdAt: "2026-02-05" },
    { _id: "st-5", username: "accountant_hoa", fullName: "Hoàng Thị Hoa", email: "hoa.accountant@futa.vn", phone: "0945678901", role: "accountant", isActive: true, createdAt: "2026-02-10" }
  ];

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/users?search=${search}&role=${roleFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setStaffMembers(data.data);
      } else {
        setStaffMembers(filterMockStaff());
      }
    } catch (err) {
      setStaffMembers(filterMockStaff());
    } finally {
      setLoading(false);
    }
  };

  const filterMockStaff = () => {
    return mockStaff.filter((s) => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        s.username.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.phone.includes(search);
      const matchesRole = roleFilter === "ALL" || s.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  };

  useEffect(() => {
    fetchStaff();
  }, [search, roleFilter]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Thêm nhân sự mới thành công!" });
        setShowAddModal(false);
        setFormData({ username: "", fullName: "", email: "", phone: "", password: "", role: "dispatcher" });
        fetchStaff();
      } else {
        const newMember = { _id: "st-" + Date.now(), ...formData, isActive: true, createdAt: new Date().toISOString().split("T")[0] };
        setStaffMembers([newMember, ...staffMembers]);
        setMessage({ type: "success", text: "Đã thêm nhân sự mới!" });
        setShowAddModal(false);
      }
    } catch (err) {
      const newMember = { _id: "st-" + Date.now(), ...formData, isActive: true, createdAt: new Date().toISOString().split("T")[0] };
      setStaffMembers([newMember, ...staffMembers]);
      setMessage({ type: "success", text: "Đã thêm nhân sự mới!" });
      setShowAddModal(false);
    }
  };

  const handleOpenEdit = (staff) => {
    setSelectedStaff(staff);
    setEditFormData({
      fullName: staff.fullName || "",
      username: staff.username || "",
      email: staff.email || "",
      phone: staff.phone || "",
      role: staff.role || "dispatcher",
      password: "",
    });
    setShowEditModal(true);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return;
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/users/${selectedStaff._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      const data = await res.json();
      if (data.success) {
        setStaffMembers((prev) =>
          prev.map((s) => (s._id === selectedStaff._id ? { ...s, ...editFormData } : s))
        );
        setMessage({ type: "success", text: "✏️ Cập nhật thông tin nhân sự thành công!" });
        setShowEditModal(false);
      } else {
        setStaffMembers((prev) =>
          prev.map((s) => (s._id === selectedStaff._id ? { ...s, ...editFormData } : s))
        );
        setMessage({ type: "success", text: "✏️ Cập nhật thông tin nhân sự thành công!" });
        setShowEditModal(false);
      }
    } catch (err) {
      setStaffMembers((prev) =>
        prev.map((s) => (s._id === selectedStaff._id ? { ...s, ...editFormData } : s))
      );
      setMessage({ type: "success", text: "✏️ Cập nhật thông tin nhân sự thành công!" });
      setShowEditModal(false);
    }
  };

  const handleToggleStatus = async (staffId, currentStatus) => {
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      await fetch(`${API_BASE}/admin/users/${staffId}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {}

    setStaffMembers(staffMembers.map(s => s._id === staffId ? { ...s, isActive: !currentStatus } : s));
    setMessage({
      type: "success",
      text: currentStatus ? "Đã khóa tài khoản nhân sự" : "Đã mở khóa tài khoản nhân sự"
    });
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhân sự này khỏi hệ thống?")) return;
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      await fetch(`${API_BASE}/admin/users/${staffId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {}

    setStaffMembers(staffMembers.filter(s => s._id !== staffId));
    setMessage({ type: "success", text: "Đã xóa nhân sự khỏi hệ thống!" });
  };

  const roleBadge = (role) => {
    switch (role) {
      case "admin":
        return <span style={{ background: "#fef3c7", color: "#d97706", padding: "4px 10px", borderRadius: 12, fontWeight: 700, fontSize: 12 }}>👑 Quản trị viên</span>;
      case "dispatcher":
        return <span style={{ background: "#dbeafe", color: "#2563eb", padding: "4px 10px", borderRadius: 12, fontWeight: 700, fontSize: 12 }}>🎧 Điều phối viên</span>;
      case "driver":
        return <span style={{ background: "#dcfce7", color: "#16a34a", padding: "4px 10px", borderRadius: 12, fontWeight: 700, fontSize: 12 }}>🚛 Tài xế</span>;
      case "accountant":
        return <span style={{ background: "#f3e8ff", color: "#9333ea", padding: "4px 10px", borderRadius: 12, fontWeight: 700, fontSize: 12 }}>💰 Kế toán</span>;
      default:
        return <span style={{ background: "#f1f5f9", color: "#64748b", padding: "4px 10px", borderRadius: 12, fontWeight: 700, fontSize: 12 }}>👤 Staff</span>;
    }
  };

  return (
    <div style={{ padding: 24, color: "#1e293b" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#0f172a" }}>
            👥 Quản Lý Nhân Sự Hệ Thống
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
            Dành riêng cho Quản trị viên (Admin) - Thêm mới, cập nhật thông tin, phân quyền và khóa/mở khóa tài khoản nhân sự.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: "#2563eb",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          ➕ Thêm Nhân Sự Mới
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

      {/* Filter Bar */}
      <div style={{ background: "#ffffff", padding: 16, borderRadius: 10, border: "1px solid #e2e8f0", display: "flex", gap: 12, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo Họ tên, Username, Email, SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14 }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, background: "#fff" }}
        >
          <option value="ALL">-- Tất cả Vai trò --</option>
          <option value="dispatcher">🎧 Nhân viên điều hành</option>
          <option value="driver">🚛 Tài xế</option>
          <option value="accountant">💰 Kế toán</option>
          <option value="admin">👑 Quản trị viên</option>
        </select>
      </div>

      {/* Staff Table */}
      <div style={{ background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
              <th style={{ padding: "12px 16px" }}>Nhân sự</th>
              <th style={{ padding: "12px 16px" }}>Vai trò</th>
              <th style={{ padding: "12px 16px" }}>Email / SĐT</th>
              <th style={{ padding: "12px 16px" }}>Trạng thái tài khoản</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {staffMembers.map((staff) => (
              <tr key={staff._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{staff.fullName}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>@{staff.username}</div>
                </td>
                <td style={{ padding: "12px 16px" }}>{roleBadge(staff.role)}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div>{staff.email}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{staff.phone}</div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {staff.isActive !== false ? (
                    <span style={{ color: "#16a34a", fontWeight: 700, background: "#f0fdf4", padding: "3px 10px", borderRadius: 12, fontSize: 12 }}>● Hoạt động</span>
                  ) : (
                    <span style={{ color: "#dc2626", fontWeight: 700, background: "#fef2f2", padding: "3px 10px", borderRadius: 12, fontSize: 12 }}>🔒 Vô hiệu hóa</span>
                  )}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => { setSelectedStaff(staff); setShowDetailModal(true); }}
                      style={{ padding: "5px 10px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                    >
                      👁️ Chi tiết
                    </button>
                    <button
                      onClick={() => handleOpenEdit(staff)}
                      style={{ padding: "5px 10px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleToggleStatus(staff._id, staff.isActive !== false)}
                      style={{
                        padding: "5px 10px",
                        background: staff.isActive !== false ? "#fff7ed" : "#f0fdf4",
                        color: staff.isActive !== false ? "#c2410c" : "#15803d",
                        border: `1px solid ${staff.isActive !== false ? "#fdba74" : "#86efac"}`,
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {staff.isActive !== false ? "🔒 Khóa" : "🔓 Mở khóa"}
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(staff._id)}
                      style={{ padding: "5px 10px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <form onSubmit={handleCreateStaff} style={{ background: "#ffffff", padding: 24, borderRadius: 12, width: 450, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, marginBottom: 16, color: "#0f172a" }}>➕ Thêm Nhân Sự Mới</h2>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Họ và Tên</label>
              <input type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} placeholder="Nguyễn Văn A" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Tên đăng nhập</label>
                <input type="text" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} placeholder="user_a" />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Mật khẩu khởi tạo</label>
                <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} placeholder="••••••••" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Email</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} placeholder="a@futa.vn" />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Số điện thoại</label>
                <input type="text" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} placeholder="0901234567" />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Chức vụ / Vai trò</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff" }}>
                <option value="dispatcher">🎧 Nhân viên điều hành (Dispatcher)</option>
                <option value="driver">🚛 Tài xế (Driver)</option>
                <option value="accountant">💰 Kế toán (Accountant)</option>
                <option value="admin">👑 Quản trị viên (Admin)</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: "8px 16px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 6, cursor: "pointer" }}>Hủy</button>
              <button type="submit" style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}>Tạo Nhân Sự</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <form onSubmit={handleUpdateStaff} style={{ background: "#ffffff", padding: 24, borderRadius: 12, width: 450, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, marginBottom: 16, color: "#0f172a" }}>✏️ Cập Nhật Thông Tin Nhân Sự</h2>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Họ và Tên</label>
              <input type="text" required value={editFormData.fullName} onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Tên đăng nhập</label>
                <input type="text" disabled value={editFormData.username} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, background: "#f8fafc", color: "#64748b" }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Mật khẩu mới (Tùy chọn)</label>
                <input type="password" value={editFormData.password} onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} placeholder="Bỏ trống nếu không đổi" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Email</label>
                <input type="email" required value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Số điện thoại</label>
                <input type="text" required value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>Chức vụ / Vai trò</label>
              <select value={editFormData.role} onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff" }}>
                <option value="dispatcher">🎧 Nhân viên điều hành (Dispatcher)</option>
                <option value="driver">🚛 Tài xế (Driver)</option>
                <option value="accountant">💰 Kế toán (Accountant)</option>
                <option value="admin">👑 Quản trị viên (Admin)</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: "8px 16px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 6, cursor: "pointer" }}>Hủy</button>
              <button type="submit" style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}>Lưu Thay Đổi</button>
            </div>
          </form>
        </div>
      )}

      {/* Staff Detail Modal */}
      {showDetailModal && selectedStaff && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#ffffff", padding: 24, borderRadius: 12, width: 420 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, marginBottom: 14 }}>👁️ Chi Tiết Nhân Sự</h2>
            <div style={{ fontSize: 14, lineHeight: "1.8", color: "#334155" }}>
              <div>Họ và tên: <strong>{selectedStaff.fullName}</strong></div>
              <div>Tên đăng nhập: <strong>@{selectedStaff.username}</strong></div>
              <div>Vai trò: {roleBadge(selectedStaff.role)}</div>
              <div>Email: <strong>{selectedStaff.email}</strong></div>
              <div>Số điện thoại: <strong>{selectedStaff.phone}</strong></div>
              <div>Trạng thái: <strong>{selectedStaff.isActive !== false ? "Hoạt động" : "🔒 Vô hiệu hóa"}</strong></div>
              <div>Ngày tạo: <strong>{selectedStaff.createdAt}</strong></div>
            </div>
            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button onClick={() => setShowDetailModal(false)} style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700 }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;
