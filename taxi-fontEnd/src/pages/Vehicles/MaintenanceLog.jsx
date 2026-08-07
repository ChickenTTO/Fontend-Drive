import React, { useState, useEffect } from "react";
import "./MaintenanceLog.css";
import vehicleApi from "../../api/vehicleApi";
import maintenanceApi from "../../api/maintenanceApi";

const MAINTENANCE_TYPES = [
  "Bảo dưỡng định kỳ",
  "Sửa chữa động cơ / Hộp số",
  "Sửa chữa lốp & phanh",
  "Hệ thống điện & Máy lạnh",
  "Đăng kiểm & Kiểm định",
  "Khác (Sơn gầm, Cưa thùng...)"
];

export const MaintenanceLog = () => {
  // Main states
  const [tickets, setTickets] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [mainViewMode, setMainViewMode] = useState("LIST"); // 'LIST' or 'VEHICLE_HISTORY'
  const [selectedVehicleForHistory, setSelectedVehicleForHistory] = useState("");
  const [loading, setLoading] = useState(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);

  // Form state for Create & Edit
  const [formData, setFormData] = useState({
    licensePlate: "",
    brand: "",
    type: "Bảo dưỡng định kỳ",
    issue: "",
    garage: "Trung tâm Bảo dưỡng Futa Express Q9",
    estimatedCost: 2000000,
    actualCost: 0,
    odometer: 50000,
    status: "Chờ bảo dưỡng",
    partsReplaced: "",
    notes: ""
  });

  // Fetch live tickets and vehicles on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [vehRes, mntRes] = await Promise.all([
        vehicleApi.getAll().catch(() => ({ data: { data: [] } })),
        maintenanceApi.getAll().catch(() => ({ data: { data: [] } }))
      ]);

      const loadedVehicles = vehRes.data?.data || [];
      const loadedTickets = (mntRes.data?.data || []).map(t => ({
        ...t,
        id: t.ticketCode || t._id,
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
      }));

      setVehicles(loadedVehicles);
      setTickets(loadedTickets);

      if (loadedVehicles.length > 0 && loadedVehicles[0].licensePlate) {
        setSelectedVehicleForHistory(loadedVehicles[0].licensePlate);
      }
    } catch (err) {
      console.error('Error loading maintenance real data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Quick helper to format currency
  const formatVND = (num) => (num || 0).toLocaleString("vi-VN") + " VNĐ";

  // ----------------------------------------------------
  // HANDLERS FOR FEATURE 2: Lập phiếu bảo dưỡng
  // ----------------------------------------------------
  const handleOpenCreate = () => {
    const firstVeh = vehicles[0] || { licensePlate: "51C-888.99", brand: "Hino", model: "8T" };
    setFormData({
      licensePlate: firstVeh.licensePlate,
      brand: `${firstVeh.brand || "Xe Tải"} ${firstVeh.model || ""}`.trim(),
      type: "Bảo dưỡng định kỳ",
      issue: "",
      garage: "Trung tâm Bảo dưỡng Futa Express Q9",
      estimatedCost: 2500000,
      actualCost: 0,
      odometer: firstVeh.odometer || 45000,
      status: "Chờ bảo dưỡng",
      partsReplaced: "",
      notes: ""
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.issue) {
      alert("Vui lòng nhập nội dung / sự cố cần bảo dưỡng!");
      return;
    }
    try {
      const res = await maintenanceApi.create(formData);
      if (res.data?.data) {
        const created = {
          ...res.data.data,
          id: res.data.data.ticketCode || res.data.data._id,
          createdAt: new Date().toISOString().slice(0, 10)
        };
        setTickets([created, ...tickets]);
        alert(`✅ Đã lập thành công phiếu bảo dưỡng ${created.id}`);
      } else {
        fetchInitialData();
      }
      setIsCreateOpen(false);
    } catch (err) {
      alert("Lỗi tạo phiếu bảo dưỡng: " + (err.response?.data?.message || err.message));
    }
  };

  // ----------------------------------------------------
  // HANDLERS FOR FEATURE 3: Cập nhật phiếu bảo dưỡng
  // ----------------------------------------------------
  const handleOpenEdit = (ticket) => {
    setActiveTicket(ticket);
    setFormData({ ...ticket });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const targetId = activeTicket?._id || formData._id;
      const res = await maintenanceApi.update(targetId, formData);
      if (res.data?.data) {
        const updated = {
          ...res.data.data,
          id: res.data.data.ticketCode || res.data.data._id,
          createdAt: res.data.data.createdAt ? new Date(res.data.data.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
        };
        setTickets(tickets.map(t => (t._id === targetId || t.id === formData.id) ? updated : t));
      } else {
        fetchInitialData();
      }
      setIsEditOpen(false);
      alert(`✏️ Cập nhật thành công phiếu bảo dưỡng ${formData.ticketCode || formData.id}`);
    } catch (err) {
      alert("Lỗi cập nhật phiếu bảo dưỡng: " + (err.response?.data?.message || err.message));
    }
  };

  // Quick Status Transition Button Action
  const handleQuickStatusChange = async (ticket, nextStatus) => {
    try {
      const isDone = nextStatus === "Hoàn thành";
      const payload = {
        status: nextStatus,
        actualCost: isDone && ticket.actualCost === 0 ? ticket.estimatedCost : ticket.actualCost
      };
      const res = await maintenanceApi.update(ticket._id, payload);
      if (res.data?.data) {
        setTickets(prev => prev.map(t => t._id === ticket._id ? {
          ...res.data.data,
          id: res.data.data.ticketCode || res.data.data._id,
          createdAt: t.createdAt
        } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // HANDLER FOR FEATURE 4: Xem chi tiết phiếu
  // ----------------------------------------------------
  const handleOpenDetail = (ticket) => {
    setActiveTicket(ticket);
    setIsDetailOpen(true);
  };

  // ----------------------------------------------------
  // FILTERING LOGIC (FEATURE 1 & FEATURE 5)
  // ----------------------------------------------------
  const filteredTickets = tickets.filter((t) => {
    // Mode 5 filter: Vehicle History
    if (mainViewMode === "VEHICLE_HISTORY") {
      if (selectedVehicleForHistory && t.licensePlate !== selectedVehicleForHistory) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== "ALL" && t.status !== statusFilter) {
      return false;
    }

    // Search query
    if (search) {
      const q = search.toLowerCase();
      const matchId = t.id.toLowerCase().includes(q);
      const matchPlate = t.licensePlate.toLowerCase().includes(q);
      const matchGarage = t.garage.toLowerCase().includes(q);
      const matchIssue = t.issue.toLowerCase().includes(q);
      const matchType = t.type.toLowerCase().includes(q);
      return matchId || matchPlate || matchGarage || matchIssue || matchType;
    }

    return true;
  });

  // Calculate Metrics
  const totalTicketsCount = tickets.length;
  const pendingCount = tickets.filter((t) => t.status === "Chờ bảo dưỡng").length;
  const doingCount = tickets.filter((t) => t.status === "Đang bảo dưỡng").length;
  const doneCount = tickets.filter((t) => t.status === "Hoàn thành").length;
  const totalCost = tickets.reduce((sum, t) => sum + (t.actualCost || t.estimatedCost || 0), 0);

  // Status Badge JSX helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Chờ bảo dưỡng":
        return <span className="badge-status pending">⏳ Chờ bảo dưỡng</span>;
      case "Đang bảo dưỡng":
        return <span className="badge-status doing">🛠️ Đang bảo dưỡng</span>;
      case "Hoàn thành":
        return <span className="badge-status done">✅ Hoàn thành</span>;
      case "Đã hủy":
        return <span className="badge-status cancelled">❌ Đã hủy</span>;
      default:
        return <span className="badge-status">{status}</span>;
    }
  };

  // Stats for Selected Vehicle in History Mode (Feature 5)
  const vehicleHistoryTickets = tickets.filter((t) => t.licensePlate === selectedVehicleForHistory);
  const vehicleTotalSpent = vehicleHistoryTickets.reduce((sum, t) => sum + (t.actualCost || t.estimatedCost || 0), 0);
  const vehicleLastOdo = vehicleHistoryTickets[0]?.odometer || 0;

  return (
    <div className="maintenance-container">
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="maintenance-header">
        <div>
          <h1 className="maintenance-title">
            🛠️ Quản Lý Bảo Dưỡng Phương Tiện
          </h1>
          <p className="maintenance-subtitle">
            Hệ thống quản lý 5 quy trình bảo trì xe tải Futa Express: Lập phiếu, cập nhật tiến độ, xem chi tiết và tra cứu lịch sử sửa chữa theo từng xe.
          </p>
        </div>
        <button className="btn-create-ticket" onClick={handleOpenCreate}>
          ➕ Lập Phiếu Bảo Dưỡng Mới
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          METRIC CARDS SUMMARY
      ───────────────────────────────────────────────────────────── */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box total">📋</div>
          <div className="metric-info">
            <div className="metric-label">TỔNG PHIẾU BẢO DƯỠNG</div>
            <div className="metric-value">{totalTicketsCount} Phiếu</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box pending">⏳</div>
          <div className="metric-info">
            <div className="metric-label">CHỜ BẢO DƯỠNG</div>
            <div className="metric-value">{pendingCount} Xe</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box doing">🛠️</div>
          <div className="metric-info">
            <div className="metric-label">ĐANG BẢO DƯỠNG</div>
            <div className="metric-value">{doingCount} Xe</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box done">✅</div>
          <div className="metric-info">
            <div className="metric-label">ĐÃ HOÀN THÀNH</div>
            <div className="metric-value">{doneCount} Phiếu</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box cost">💵</div>
          <div className="metric-info">
            <div className="metric-label">TỔNG CHI PHÍ BẢO TRÌ</div>
            <div className="metric-value" style={{ fontSize: "17px", color: "#ea580c" }}>
              {formatVND(totalCost)}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN VIEW MODE TABS (CHỨC NĂNG 1 vs CHỨC NĂNG 5)
      ───────────────────────────────────────────────────────────── */}
      <div className="main-view-tabs">
        <button
          className={`main-tab-btn ${mainViewMode === "LIST" ? "active" : ""}`}
          onClick={() => setMainViewMode("LIST")}
        >
          📋 Chức Năng 1: Danh Sách Phiếu Bảo Dưỡng
        </button>
        <button
          className={`main-tab-btn ${mainViewMode === "VEHICLE_HISTORY" ? "active" : ""}`}
          onClick={() => setMainViewMode("VEHICLE_HISTORY")}
        >
          📜 Chức Năng 5: Lịch Sử Bảo Dưỡng Theo Từng Xe
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CHỨC NĂNG 5 BANNER: VEHICLE SELECTOR & STATS (In Vehicle History mode)
      ───────────────────────────────────────────────────────────── */}
      {mainViewMode === "VEHICLE_HISTORY" && (
        <div className="vehicle-selector-box">
          <label htmlFor="vehicle-history-select">🚛 Chọn Xe Tải Xem Lịch Sử:</label>
          <select
            id="vehicle-history-select"
            className="vehicle-select-dropdown"
            value={selectedVehicleForHistory}
            onChange={(e) => setSelectedVehicleForHistory(e.target.value)}
          >
            {vehicles.map((v) => (
              <option key={v._id || v.licensePlate} value={v.licensePlate}>
                [{v.licensePlate}] {v.brand} {v.model || ""}
              </option>
            ))}
          </select>

          <div className="vehicle-summary-banner">
            <div className="vehicle-summary-item">
              Số đợt bảo dưỡng: <strong>{vehicleHistoryTickets.length} đợt</strong>
            </div>
            <div className="vehicle-summary-item">
              Tổng chi phí bảo dưỡng xe này: <strong>{formatVND(vehicleTotalSpent)}</strong>
            </div>
            <div className="vehicle-summary-item">
              Mốc ODO gần nhất: <strong>{(vehicleLastOdo || 0).toLocaleString()} Km</strong>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CONTROL BAR: SEARCH & STATUS FILTERS
      ───────────────────────────────────────────────────────────── */}
      <div className="control-bar">
        <div className="search-input-box">
          <span className="search-icon-inside">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm theo Mã phiếu, Biển số xe, Gara thực hiện, Hạng mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="status-filter-pills">
          <button
            className={`filter-pill ${statusFilter === "ALL" ? "active" : ""}`}
            onClick={() => setStatusFilter("ALL")}
          >
            Tất cả ({mainViewMode === "VEHICLE_HISTORY" ? vehicleHistoryTickets.length : totalTicketsCount})
          </button>
          <button
            className={`filter-pill ${statusFilter === "Chờ bảo dưỡng" ? "active" : ""}`}
            onClick={() => setStatusFilter("Chờ bảo dưỡng")}
          >
            ⏳ Chờ bảo dưỡng
          </button>
          <button
            className={`filter-pill ${statusFilter === "Đang bảo dưỡng" ? "active" : ""}`}
            onClick={() => setStatusFilter("Đang bảo dưỡng")}
          >
            🛠️ Đang bảo dưỡng
          </button>
          <button
            className={`filter-pill ${statusFilter === "Hoàn thành" ? "active" : ""}`}
            onClick={() => setStatusFilter("Hoàn thành")}
          >
            ✅ Hoàn thành
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CHỨC NĂNG 1 & 5: BẢNG DANH SÁCH PHIẾU BẢO DƯỠNG
      ───────────────────────────────────────────────────────────── */}
      <div className="table-card">
        <table className="maintenance-table">
          <thead>
            <tr>
              <th>Mã Phiếu</th>
              <th>Phương Tiện</th>
              <th>Loại & Nội Dung Bảo Dưỡng</th>
              <th>Gara / Đơn Vị Thực Hiện</th>
              <th>Chi Phí (VNĐ)</th>
              <th>Ngày Tạo / ODO</th>
              {mainViewMode !== "VEHICLE_HISTORY" && <th>Trạng Thái</th>}
              <th style={{ textAlign: "right" }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={mainViewMode === "VEHICLE_HISTORY" ? "7" : "8"} style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                  📭 Không tìm thấy phiếu bảo dưỡng nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredTickets.map((t) => (
                <tr key={t.id}>
                  {/* Mã phiếu */}
                  <td style={{ fontWeight: 800, color: "#2563eb", whiteSpace: "nowrap" }}>
                    {t.id}
                  </td>

                  {/* Phương tiện */}
                  <td>
                    <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "14px" }}>
                      {t.licensePlate}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      {t.brand}
                    </div>
                  </td>

                  {/* Nội dung */}
                  <td style={{ maxWidth: 280 }}>
                    <span className="badge-type">{t.type}</span>
                    <div style={{ marginTop: 4, color: "#334155", fontSize: "13px", lineHeight: "1.4" }}>
                      {t.issue}
                    </div>
                  </td>

                  {/* Gara */}
                  <td>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>{t.garage}</div>
                  </td>

                  {/* Chi phí */}
                  <td>
                    <div style={{ fontWeight: 800, color: "#ea580c" }}>
                      {formatVND(t.actualCost || t.estimatedCost)}
                    </div>
                    {t.actualCost > 0 && t.actualCost !== t.estimatedCost && (
                      <div style={{ fontSize: "11px", color: "#64748b" }}>
                        Dự kiến: {formatVND(t.estimatedCost)}
                      </div>
                    )}
                  </td>

                  {/* Ngày / ODO */}
                  <td style={{ whiteSpace: "nowrap" }}>
                    <div>{t.createdAt}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                      {(t.odometer || 0).toLocaleString()} Km
                    </div>
                  </td>

                  {/* Trạng thái */}
                  {mainViewMode !== "VEHICLE_HISTORY" && (
                    <td>{renderStatusBadge(t.status)}</td>
                  )}

                  {/* Thao tác */}
                  <td>
                    <div className="action-group">
                      {/* Chức năng 4: Xem chi tiết */}
                      <button
                        className="btn-action-icon"
                        title="Xem chi tiết phiếu"
                        onClick={() => handleOpenDetail(t)}
                      >
                        👁️
                      </button>

                      {/* Chức năng 3: Cập nhật phiếu */}
                      <button
                        className="btn-action-icon"
                        title="Chỉnh sửa phiếu bảo dưỡng"
                        onClick={() => handleOpenEdit(t)}
                      >
                        ✏️
                      </button>

                      {/* Quick progress transitions */}
                      {t.status === "Chờ bảo dưỡng" && (
                        <button
                          className="btn-status-quick start"
                          title="Chuyển sang Đang bảo dưỡng"
                          onClick={() => handleQuickStatusChange(t, "Đang bảo dưỡng")}
                        >
                          ▶️ Sửa chữa
                        </button>
                      )}

                      {t.status === "Đang bảo dưỡng" && (
                        <button
                          className="btn-status-quick complete"
                          title="Xác nhận hoàn thành bảo dưỡng"
                          onClick={() => handleQuickStatusChange(t, "Hoàn thành")}
                        >
                          ✅ Hoàn tất
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: LẬP PHIẾU BẢO DƯỠNG MỚI (CHỨC NĂNG 2)
      ───────────────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="mnt-modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div className="mnt-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="mnt-modal-header">
              <h3>📝 Lập Phiếu Bảo Dưỡng Xe Tải</h3>
              <button className="btn-close-modal" onClick={() => setIsCreateOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="mnt-modal-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 4 }}>
                      Chọn Phương Tiện <span style={{ color: "red" }}>*</span>
                    </label>
                    <select
                      className="form-select"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                      value={formData.licensePlate}
                      onChange={(e) => {
                        const selectedVeh = vehicles.find((v) => v.licensePlate === e.target.value);
                        setFormData({
                          ...formData,
                          licensePlate: e.target.value,
                          brand: selectedVeh ? `${selectedVeh.brand || ""} ${selectedVeh.model || ""}` : "Xe Tải"
                        });
                      }}
                    >
                      {vehicles.map((v) => (
                        <option key={v._id || v.licensePlate} value={v.licensePlate}>
                          {v.licensePlate} - {v.brand} {v.model || ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 4 }}>
                      Loại Bảo Dưỡng <span style={{ color: "red" }}>*</span>
                    </label>
                    <select
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      {MAINTENANCE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 4 }}>
                    Nội Dung / Sự Cố Cần Bảo Dưỡng <span style={{ color: "red" }}>*</span>
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Mô tả cụ thể linh kiện hỏng hóc hoặc hạng mục bảo dưỡng định kỳ..."
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13.5 }}
                    value={formData.issue}
                    onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 4 }}>
                      Gara / Đơn Vị Thực Hiện
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Gara Futa Express Q9"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                      value={formData.garage}
                      onChange={(e) => setFormData({ ...formData, garage: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 4 }}>
                      Chi Phí Dự Kiến (VNĐ)
                    </label>
                    <input
                      type="number"
                      step="100000"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontWeight: 700, color: "#ea580c" }}
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData({ ...formData, estimatedCost: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 4 }}>
                      Số ODO Hiện Tại (Km)
                    </label>
                    <input
                      type="number"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                      value={formData.odometer}
                      onChange={(e) => setFormData({ ...formData, odometer: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 4 }}>
                      Ghi Chú Ban Đầu
                    </label>
                    <input
                      type="text"
                      placeholder="Ghi chú hẹn ngày giao xe..."
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="mnt-modal-footer">
                <button type="button" className="btn-action-icon" style={{ width: "auto", padding: "0 16px" }} onClick={() => setIsCreateOpen(false)}>
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn-create-ticket">
                  💾 Lưu & Tạo Phiếu Bảo Dưỡng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: CẬP NHẬT PHIẾU BẢO DƯỠNG (CHỨC NĂNG 3)
      ───────────────────────────────────────────────────────────── */}
      {isEditOpen && activeTicket && (
        <div className="mnt-modal-overlay" onClick={() => setIsEditOpen(false)}>
          <div className="mnt-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="mnt-modal-header">
              <h3>✏️ Cập Nhật Phiếu Bảo Dưỡng {formData.id}</h3>
              <button className="btn-close-modal" onClick={() => setIsEditOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="mnt-modal-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 4 }}>
                      Trạng Thái Phiếu
                    </label>
                    <select
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontWeight: 700 }}
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Chờ bảo dưỡng">⏳ Chờ bảo dưỡng</option>
                      <option value="Đang bảo dưỡng">🛠️ Đang bảo dưỡng</option>
                      <option value="Hoàn thành">✅ Hoàn thành</option>
                      <option value="Đã hủy">❌ Đã hủy</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 4 }}>
                      Loại Bảo Dưỡng
                    </label>
                    <select
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      {MAINTENANCE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 4 }}>
                    Nội Dung / Sự Cố Bảo Dưỡng
                  </label>
                  <textarea
                    rows="2"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                    value={formData.issue}
                    onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 4 }}>
                      Chi Phí Dự Kiến (VNĐ)
                    </label>
                    <input
                      type="number"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData({ ...formData, estimatedCost: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 4 }}>
                      Chi Phí Thực Tế (VNĐ)
                    </label>
                    <input
                      type="number"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontWeight: 800, color: "#ea580c" }}
                      value={formData.actualCost}
                      onChange={(e) => setFormData({ ...formData, actualCost: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 4 }}>
                    Linh Kiện / Phụ Tùng Đã Thay Thế
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Dầu nhớt HD50, Lọc gió động cơ, 2 Vỏ lốp..."
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                    value={formData.partsReplaced}
                    onChange={(e) => setFormData({ ...formData, partsReplaced: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 4 }}>
                    Ghi Chú Kỹ Thuật / Nghiệm Thu
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Ghi chú về tình trạng sau khi chạy thử nghiệm thu..."
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="mnt-modal-footer">
                <button type="button" className="btn-action-icon" style={{ width: "auto", padding: "0 16px" }} onClick={() => setIsEditOpen(false)}>
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn-create-ticket">
                  💾 Lưu Cập Nhật Phiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 4: XEM CHI TIẾT PHIẾU BẢO DƯỠNG (CHỨC NĂNG 4)
      ───────────────────────────────────────────────────────────── */}
      {isDetailOpen && activeTicket && (
        <div className="mnt-modal-overlay" onClick={() => setIsDetailOpen(false)}>
          <div className="mnt-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="mnt-modal-header">
              <h3>👁️ Hồ Sơ Chi Tiết Phiếu: {activeTicket.id}</h3>
              <button className="btn-close-modal" onClick={() => setIsDetailOpen(false)}>✕</button>
            </div>
            <div className="mnt-modal-body">
              {/* TIMELINE PROGRESS STEPPER */}
              <div className="timeline-stepper">
                <div className={`timeline-step ${activeTicket.status !== "" ? "completed" : ""}`}>
                  <div className="step-circle">1</div>
                  <div className="step-label">Lập phiếu ({activeTicket.createdAt})</div>
                </div>

                <div className={`timeline-step ${activeTicket.status === "Đang bảo dưỡng" || activeTicket.status === "Hoàn thành" ? "completed" : ""}`}>
                  <div className="step-circle">2</div>
                  <div className="step-label">Đang sửa chữa</div>
                </div>

                <div className={`timeline-step ${activeTicket.status === "Hoàn thành" ? "completed" : ""}`}>
                  <div className="step-circle">3</div>
                  <div className="step-label">
                    {activeTicket.status === "Hoàn thành" ? `Hoàn tất (${activeTicket.completedDate || "Hôm nay"})` : "Bàn giao xe"}
                  </div>
                </div>
              </div>

              {/* GRID INFO */}
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="label">Biển Số Xe:</div>
                  <div className="val" style={{ color: "#ea580c" }}>{activeTicket.licensePlate}</div>
                </div>

                <div className="detail-item">
                  <div className="label">Dòng Xe (Model):</div>
                  <div className="val">{activeTicket.brand}</div>
                </div>

                <div className="detail-item">
                  <div className="label">Chỉ Số ODO Bảo Dưỡng:</div>
                  <div className="val">{(activeTicket.odometer || 0).toLocaleString()} Km</div>
                </div>

                <div className="detail-item">
                  <div className="label">Trạng Thái Phiếu:</div>
                  <div className="val">{renderStatusBadge(activeTicket.status)}</div>
                </div>

                <div className="detail-item">
                  <div className="label">Gara Thực Hiện:</div>
                  <div className="val">{activeTicket.garage}</div>
                </div>

                <div className="detail-item">
                  <div className="label">Loại Hạng Mục:</div>
                  <div className="val">{activeTicket.type}</div>
                </div>
              </div>

              <div className="detail-section-title">📌 Nội Dung Công Việc & Sự Cố:</div>
              <div style={{ background: "#ffffff", padding: "12px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13.5, color: "#334155" }}>
                {activeTicket.issue}
              </div>

              <div className="detail-section-title">🔧 Linh Kiện & Phụ Tùng Thay Thế:</div>
              <div style={{ background: "#ffffff", padding: "12px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13.5, color: "#334155" }}>
                {activeTicket.partsReplaced || "Chưa ghi nhận linh kiện thay mới."}
              </div>

              <div className="detail-section-title">💵 Chi Phí Bảo Dưỡng:</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#fff7ed", padding: 14, borderRadius: 8, border: "1px solid #fed7aa" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#9a3412" }}>Chi phí dự kiến:</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#c2410c" }}>{formatVND(activeTicket.estimatedCost)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#9a3412" }}>Chi phí thực tế thanh toán:</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#ea580c" }}>
                    {formatVND(activeTicket.actualCost || activeTicket.estimatedCost)}
                  </div>
                </div>
              </div>

              {activeTicket.notes && (
                <>
                  <div className="detail-section-title">📝 Ghi Chú Nghiệm Thu:</div>
                  <div style={{ fontSize: 13, color: "#64748b", fontStyle: "italic" }}>
                    "{activeTicket.notes}"
                  </div>
                </>
              )}
            </div>

            <div className="mnt-modal-footer">
              <button className="btn-action-icon" style={{ width: "auto", padding: "0 20px" }} onClick={() => setIsDetailOpen(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceLog;
