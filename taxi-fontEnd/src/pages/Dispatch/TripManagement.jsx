import React, { useState, useEffect } from "react";
import { depotApi } from "../../api/depotApi";
import { freightTripApi } from "../../api/freightTripApi";

export const TripManagement = () => {
  const [trips, setTrips] = useState([]);
  const [depots, setDepots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Filters & Tabs
  const [statusTab, setStatusTab] = useState("ALL"); // ALL | Đang chờ | Đang vận hành | Hoàn thành | Đã hủy
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Form State for Create/Edit
  const [formData, setFormData] = useState({
    tripCode: "",
    customerName: "",
    customerPhone: "",
    cargoType: "Hàng bưu chính & Tiêu dùng Futa",
    cargoWeightTon: 3.5,
    fare: 2500000,
    startDepotId: "",
    startLocation: "Bãi xe Futa Express",
    endDepotId: "",
    endLocation: "Kho bãi trung chuyển",
    distance: 120,
    status: "Đang chờ",
    startTime: new Date().toISOString().substring(0, 16),
    estimatedEndTime: new Date(Date.now() + 6 * 3600 * 1000).toISOString().substring(0, 16),
    notes: "",
    cancelReason: ""
  });

  const mockDepots = [
    { _id: "dep-1", code: "HCM", name: "Bãi Xe TP.HCM", city: "TP.HCM" },
    { _id: "dep-2", code: "HN", name: "Bãi Xe Hà Nội", city: "Hà Nội" },
    { _id: "dep-3", code: "DN", name: "Bãi Xe Đà Nẵng", city: "Đà Nẵng" },
    { _id: "dep-4", code: "HP", name: "Bãi Xe Hải Phòng", city: "Hải Phòng" },
    { _id: "dep-5", code: "CT", name: "Bãi Xe Cần Thơ", city: "Cần Thơ" }
  ];

  const mockTrips = [
    {
      _id: "t-101",
      tripCode: "FUTA-TRIP-901",
      status: "Đang chờ",
      customerName: "Công ty Điện tử Samsung",
      customerPhone: "0908889999",
      cargoType: "Linh kiện điện tử & Máy móc nhẹ",
      cargoWeightTon: 5.5,
      fare: 3500000,
      distance: 180,
      startDepot: { _id: "dep-1", name: "Bãi Xe TP.HCM", code: "HCM", city: "TP.HCM" },
      startLocation: "Kho Samsung Q9, TP.HCM",
      endDepot: { _id: "dep-3", name: "Bãi Xe Đà Nẵng", code: "DN", city: "Đà Nẵng" },
      endLocation: "KCN Hòa Khánh, Đà Nẵng",
      vehicle: { licensePlate: "51C-888.99", brand: "Hino 8T" },
      driver: { fullName: "Lê Văn Định", phone: "0923456789" },
      startTime: "2026-08-06 08:00",
      estimatedEndTime: "2026-08-06 18:00",
      createdAt: "2026-08-06 07:30",
      notes: "Hàng linh kiện dễ vỡ, bảo quản nhiệt độ thường"
    },
    {
      _id: "t-102",
      tripCode: "FUTA-TRIP-902",
      status: "Đang vận hành",
      customerName: "Kho Vận Futa Express HCM",
      customerPhone: "0912345678",
      cargoType: "Bưu chính Express & Hàng tiêu dùng",
      cargoWeightTon: 8.0,
      fare: 8500000,
      distance: 1150,
      startDepot: { _id: "dep-1", name: "Bãi Xe TP.HCM", code: "HCM", city: "TP.HCM" },
      startLocation: "Bến xe Miền Đông mới",
      endDepot: { _id: "dep-2", name: "Bãi Xe Hà Nội", code: "HN", city: "Hà Nội" },
      endLocation: "Bến xe Nước Ngầm, Hà Nội",
      vehicle: { licensePlate: "51C-777.22", brand: "Isuzu 10T" },
      driver: { fullName: "Trần Nam", phone: "0912345678" },
      startTime: "2026-08-05 09:30",
      estimatedEndTime: "2026-08-06 20:00",
      createdAt: "2026-08-05 09:00",
      notes: "Vận chuyển tuyến Bắc Nam chạy liên tục"
    },
    {
      _id: "t-103",
      tripCode: "FUTA-TRIP-899",
      status: "Hoàn thành",
      customerName: "Tập đoàn May Mặc Việt Tiến",
      customerPhone: "0934567890",
      cargoType: "Hàng may mặc xuất khẩu",
      cargoWeightTon: 3.5,
      fare: 2200000,
      distance: 160,
      startDepot: { _id: "dep-5", name: "Bãi Xe Cần Thơ", code: "CT", city: "Cần Thơ" },
      startLocation: "KCN Trà Nóc, Cần Thơ",
      endDepot: { _id: "dep-1", name: "Bãi Xe TP.HCM", code: "HCM", city: "TP.HCM" },
      endLocation: "Cảng Cát Lái, TP.HCM",
      vehicle: { licensePlate: "51D-123.45", brand: "Hyundai 3.5T" },
      driver: { fullName: "Phạm Hùng", phone: "0934567890" },
      startTime: "2026-08-04 08:00",
      estimatedEndTime: "2026-08-04 14:00",
      endTime: "2026-08-04 13:45",
      createdAt: "2026-08-04 07:00",
      notes: "Đã giao đúng hạn tại Cảng Cát Lái"
    },
    {
      _id: "t-104",
      tripCode: "FUTA-TRIP-888",
      status: "Đã hủy",
      customerName: "Nông Sản Miền Tây",
      customerPhone: "0988777666",
      cargoType: "Trái cây tươi đóng thùng",
      cargoWeightTon: 4.0,
      fare: 1800000,
      distance: 140,
      startDepot: { _id: "dep-5", name: "Bãi Xe Cần Thơ", code: "CT", city: "Cần Thơ" },
      startLocation: "Chợ đầu mối Cần Thơ",
      endDepot: { _id: "dep-1", name: "Bãi Xe TP.HCM", code: "HCM", city: "TP.HCM" },
      endLocation: "Chợ đầu mối Thủ Đức",
      vehicle: { licensePlate: "65C-555.66", brand: "Hino 5T" },
      driver: { fullName: "Vũ Tuấn Anh", phone: "0904445555" },
      startTime: "2026-08-03 06:00",
      estimatedEndTime: "2026-08-03 11:00",
      createdAt: "2026-08-02 18:00",
      cancelReason: "Khách hàng hủy đơn / thay đổi kế hoạch thu hoạch",
      notes: "Hủy do đối tác thay đổi kế hoạch thu hoạch"
    }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [depRes, tripRes] = await Promise.all([
        depotApi.getAllDepots().catch(() => ({ data: { data: [] } })),
        freightTripApi.getAllTrips().catch(() => ({ data: { data: [] } }))
      ]);

      const realDepots = depRes.data?.data || depRes.data;
      const realTrips = tripRes.data?.data || tripRes.data;

      setDepots(Array.isArray(realDepots) ? realDepots : []);
      setTrips(Array.isArray(realTrips) ? realTrips : []);
    } catch (err) {
      console.error("Error fetching trips/depots:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    const autoCode = "FUTA-TRIP-" + Math.floor(100 + Math.random() * 900);
    setFormData({
      tripCode: autoCode,
      customerName: "",
      customerPhone: "",
      cargoType: "Hàng bưu chính & Tiêu dùng Futa",
      cargoWeightTon: 3.5,
      fare: 2500000,
      startDepotId: depots[0]?._id || "",
      startLocation: "Bãi xe Futa Express",
      endDepotId: depots[1]?._id || depots[0]?._id || "",
      endLocation: "Kho bãi trung chuyển",
      distance: 150,
      status: "Đang chờ",
      startTime: new Date().toISOString().substring(0, 16),
      estimatedEndTime: new Date(Date.now() + 6 * 3600 * 1000).toISOString().substring(0, 16),
      notes: "",
      cancelReason: ""
    });
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (trip, e) => {
    e?.stopPropagation();
    setSelectedTrip(trip);
    setFormData({
      tripCode: trip.tripCode || "",
      customerName: trip.customerName || "",
      customerPhone: trip.customerPhone || "",
      cargoType: trip.cargoType || "",
      cargoWeightTon: trip.cargoWeightTon || 1.0,
      fare: trip.fare || 0,
      startDepotId: trip.startDepot?._id || trip.startDepot || (depots[0]?._id || ""),
      startLocation: trip.startLocation || "",
      endDepotId: trip.endDepot?._id || trip.endDepot || (depots[1]?._id || depots[0]?._id || ""),
      endLocation: trip.endLocation || "",
      distance: trip.distance || 0,
      status: trip.status || "Đang chờ",
      startTime: trip.startTime ? String(trip.startTime).replace(" ", "T").substring(0, 16) : new Date().toISOString().substring(0, 16),
      estimatedEndTime: trip.estimatedEndTime ? String(trip.estimatedEndTime).replace(" ", "T").substring(0, 16) : "",
      notes: trip.notes || "",
      cancelReason: trip.cancelReason || ""
    });
    setShowEditModal(true);
  };

  const handleOpenDetailModal = (trip, e) => {
    e?.stopPropagation();
    setSelectedTrip(trip);
    setShowDetailModal(true);
  };

  const handleOpenCancelModal = (trip, e) => {
    e?.stopPropagation();
    setSelectedTrip(trip);
    setShowCancelModal(true);
  };

  const handleSaveCreateTrip = async (e) => {
    e.preventDefault();
    if (!formData.startDepotId || !formData.endDepotId) {
      setMessage({ type: "error", text: "Vui lòng chọn Bãi xuất phát và Bãi xe đích!" });
      return;
    }
    if (formData.startDepotId === formData.endDepotId) {
      setMessage({ type: "error", text: "Bãi xe xuất phát và Bãi xe đích không được trùng nhau!" });
      return;
    }

    try {
      setLoading(true);
      const res = await freightTripApi.createTrip(formData);
      const tripCode = res.data?.data?.tripCode || formData.tripCode;
      setMessage({ type: "success", text: `Đã lưu Chuyến đi [${tripCode}] thành công vào Database!` });
      setShowCreateModal(false);
      fetchInitialData();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setMessage({ type: "error", text: "Lỗi lưu chuyến đi: " + errMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEditTrip = async (e) => {
    e.preventDefault();
    if (!selectedTrip) return;

    try {
      setLoading(true);
      await freightTripApi.updateTrip(selectedTrip._id, formData);
      setMessage({ type: "success", text: `✏️ Đã cập nhật thành công thông tin chuyến đi [${selectedTrip.tripCode}]!` });
      setShowEditModal(false);
      fetchInitialData();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setMessage({ type: "error", text: "Lỗi cập nhật chuyến đi: " + errMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async (reason) => {
    if (!selectedTrip) return;
    try {
      setLoading(true);
      await freightTripApi.cancelTrip(selectedTrip._id);
      setMessage({ type: "success", text: `🚫 Đã HỦY chuyến đi [${selectedTrip.tripCode}] thành công! Lý do: ${reason}` });
      setShowCancelModal(false);
      setShowDetailModal(false);
      fetchInitialData();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setMessage({ type: "error", text: "Lỗi hủy chuyến đi: " + errMsg });
    } finally {
      setLoading(false);
    }
  };

  // Filter trips
  const filteredTrips = trips.filter(t => {
    const matchesTab = statusTab === "ALL" || t.status === statusTab;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      t.tripCode?.toLowerCase().includes(q) ||
      t.customerName?.toLowerCase().includes(q) ||
      t.customerPhone?.includes(q) ||
      t.cargoType?.toLowerCase().includes(q) ||
      t.driver?.fullName?.toLowerCase().includes(q) ||
      t.vehicle?.licensePlate?.toLowerCase().includes(q) ||
      t.startDepot?.name?.toLowerCase().includes(q) ||
      t.endDepot?.name?.toLowerCase().includes(q);
    return matchesTab && matchesQuery;
  });

  // KPI counters
  const totalCount = trips.length;
  const pendingCount = trips.filter(t => t.status === "Đang chờ").length;
  const operatingCount = trips.filter(t => t.status === "Đang vận hành").length;
  const completedCount = trips.filter(t => t.status === "Hoàn thành").length;
  const cancelledCount = trips.filter(t => t.status === "Đã hủy").length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Đang chờ":
        return <span style={{ background: "#fef3c7", color: "#d97706", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>⏳ Đang chờ</span>;
      case "Đang vận hành":
        return <span style={{ background: "#dbeafe", color: "#2563eb", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>🚚 Đang vận hành</span>;
      case "Hoàn thành":
        return <span style={{ background: "#dcfce7", color: "#16a34a", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>✅ Hoàn thành</span>;
      case "Đã hủy":
        return <span style={{ background: "#fef2f2", color: "#dc2626", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>❌ Đã hủy</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 20, color: "#1e293b" }}>
      {/* Title & Top Action */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#0f172a" }}>
            📦 Quản Lý Chuyến Đi Vận Tải Futa Express
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 4, margin: 0 }}>
            Hệ thống quản lý cốt lõi: Tạo lệnh vận chuyển mới (Hàng hóa, Lộ trình, Lịch trình), Xem danh sách, Tìm kiếm, Cập nhật sửa đổi & Hủy chuyến đi.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          style={{
            background: "#f97316",
            color: "#ffffff",
            border: "none",
            borderRadius: 8,
            padding: "11px 20px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 2px 8px rgba(249,115,22,0.3)"
          }}
        >
          ➕ Tạo Chuyến Đi Mới
        </button>
      </div>

      {/* Message Banner */}
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

      {/* KPI Counters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        <div onClick={() => setStatusTab("ALL")} style={{ background: "#ffffff", padding: "12px 16px", borderRadius: 8, border: `2px solid ${statusTab === "ALL" ? "#2563eb" : "#e2e8f0"}`, cursor: "pointer" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Tất cả Chuyến</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{totalCount}</div>
        </div>
        <div onClick={() => setStatusTab("Đang chờ")} style={{ background: "#ffffff", padding: "12px 16px", borderRadius: 8, border: `2px solid ${statusTab === "Đang chờ" ? "#d97706" : "#e2e8f0"}`, cursor: "pointer" }}>
          <div style={{ fontSize: 12, color: "#d97706", fontWeight: 600 }}>⏳ Đang chờ</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#d97706", marginTop: 2 }}>{pendingCount}</div>
        </div>
        <div onClick={() => setStatusTab("Đang vận hành")} style={{ background: "#ffffff", padding: "12px 16px", borderRadius: 8, border: `2px solid ${statusTab === "Đang vận hành" ? "#2563eb" : "#e2e8f0"}`, cursor: "pointer" }}>
          <div style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>🚚 Đang vận hành</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#2563eb", marginTop: 2 }}>{operatingCount}</div>
        </div>
        <div onClick={() => setStatusTab("Hoàn thành")} style={{ background: "#ffffff", padding: "12px 16px", borderRadius: 8, border: `2px solid ${statusTab === "Hoàn thành" ? "#16a34a" : "#e2e8f0"}`, cursor: "pointer" }}>
          <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>✅ Hoàn thành (Lịch sử)</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#16a34a", marginTop: 2 }}>{completedCount}</div>
        </div>
        <div onClick={() => setStatusTab("Đã hủy")} style={{ background: "#ffffff", padding: "12px 16px", borderRadius: 8, border: `2px solid ${statusTab === "Đã hủy" ? "#dc2626" : "#e2e8f0"}`, cursor: "pointer" }}>
          <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}>❌ Đã hủy (Lịch sử)</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#dc2626", marginTop: 2 }}>{cancelledCount}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ background: "#ffffff", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo Mã chuyến đi, Khách hàng/SĐT, Loại hàng hóa, Tài xế, Biển số xe, Bãi đi/đến..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14 }}
        />
      </div>

      {/* Trips Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 16 }}>
        {filteredTrips.map((t) => (
          <div
            key={t._id}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              padding: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
              <div>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#ea580c" }}>{t.tripCode}</span>
                {t.customerName && (
                  <span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>
                    • {t.customerName} ({t.customerPhone || "N/A"})
                  </span>
                )}
              </div>
              {getStatusBadge(t.status)}
            </div>

            <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 700, marginBottom: 6 }}>
              📦 Hàng hóa: <span style={{ fontWeight: 600, color: "#334155" }}>{t.cargoType}</span> ({t.cargoWeightTon} Tấn)
            </div>

            <div style={{ background: "#f8fafc", padding: 10, borderRadius: 6, border: "1px solid #e2e8f0", marginBottom: 10 }}>
              <div style={{ fontSize: 12.5, color: "#2563eb", fontWeight: 700, marginBottom: 3 }}>
                📍 Lộ trình: [{t.startDepot?.code || "ĐI"}] {t.startDepot?.name || "Bãi đi"} ➔ [{t.endDepot?.code || "ĐẾN"}] {t.endDepot?.name || "Bãi đến"}
              </div>
              <div style={{ fontSize: 11.5, color: "#64748b" }}>
                Điểm đi: {t.startLocation || "Bãi xe"} | Điểm đến: {t.endLocation || "Bãi xe"} | Cự cự: <strong>{t.distance || 0} km</strong>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12, color: "#475569", marginBottom: 10 }}>
              <div>🚚 Xe tải: <strong>{t.vehicle?.licensePlate || "Chưa gán điều phối"}</strong></div>
              <div>👨‍✈️ Tài xế: <strong>{t.driver?.fullName || "Chưa gán điều phối"}</strong></div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: 8, marginBottom: 10 }}>
              <span>⏰ Xuất bến: <strong>{t.startTime ? String(t.startTime).substring(0, 16) : "Theo kế hoạch"}</strong></span>
              <span>🏁 Dự kiến: <strong>{t.estimatedEndTime ? String(t.estimatedEndTime).substring(0, 16) : "N/A"}</strong></span>
            </div>

            {t.cancelReason && t.status === "Đã hủy" && (
              <div style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", padding: "6px 10px", borderRadius: 6, marginBottom: 10, border: "1px solid #fecaca" }}>
                🚫 <strong>Lý do hủy:</strong> {t.cancelReason}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>
                💰 Cước: {(t.fare || 0).toLocaleString()} VNĐ
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={(e) => handleOpenDetailModal(t, e)}
                  style={{ padding: "5px 10px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >
                  👁️ Chi tiết
                </button>
                {t.status !== "Đã hủy" && (
                  <button
                    onClick={(e) => handleOpenEditModal(t, e)}
                    style={{ padding: "5px 10px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    ✏️ Sửa
                  </button>
                )}
                {(t.status === "Đang chờ" || t.status === "Đang vận hành") && (
                  <button
                    onClick={(e) => handleOpenCancelModal(t, e)}
                    style={{ padding: "5px 10px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    🚫 Hủy
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTrips.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: "#64748b", background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", marginTop: 20 }}>
          🔍 Không tìm thấy Chuyến đi nào phù hợp.
        </div>
      )}

      {/* CREATE TRIP MODAL */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <form onSubmit={handleSaveCreateTrip} style={{ background: "#ffffff", padding: 24, borderRadius: 12, width: 640, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0, marginBottom: 16, color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: 10 }}>
              📝 Nhập Thông Tin & Tạo Lệnh Vận Chuyển Mới
            </h2>

            {/* Section 1: Trip Info & Customer */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ea580c", marginBottom: 8 }}>1. Thông tin Chuyến đi & Khách hàng</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Mã Chuyến *</label>
                  <input type="text" required value={formData.tripCode} onChange={(e) => setFormData({ ...formData, tripCode: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, fontWeight: 700, color: "#ea580c" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Tên Khách/Đơn vị gửi *</label>
                  <input type="text" required placeholder="Công ty A / Anh Nam" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>SĐT Liên hệ *</label>
                  <input type="text" required placeholder="0901234567" value={formData.customerPhone} onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
                </div>
              </div>
            </div>

            {/* Section 2: Cargo & Financials */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ea580c", marginBottom: 8 }}>2. Thông tin Hàng hóa & Cước phí</div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Loại Hàng hóa *</label>
                  <input type="text" required placeholder="VD: Linh kiện, Hàng may mặc..." value={formData.cargoType} onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Khối lượng (Tấn) *</label>
                  <input type="number" step="0.5" min="0.1" required value={formData.cargoWeightTon} onChange={(e) => setFormData({ ...formData, cargoWeightTon: Number(e.target.value) })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Cước phí (VNĐ)</label>
                  <input type="number" step="100000" min="0" value={formData.fare} onChange={(e) => setFormData({ ...formData, fare: Number(e.target.value) })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, fontWeight: 700, color: "#16a34a" }} />
                </div>
              </div>
            </div>

            {/* Section 3: Route */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ea580c", marginBottom: 8 }}>3. Lộ trình Chuyến đi</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Bãi Xe Xuất Phát *</label>
                  <select value={formData.startDepotId} onChange={(e) => setFormData({ ...formData, startDepotId: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}>
                    {depots.map(d => <option key={d._id} value={d._id}>[{d.code}] {d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Bãi Xe Đích Đến *</label>
                  <select value={formData.endDepotId} onChange={(e) => setFormData({ ...formData, endDepotId: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}>
                    {depots.map(d => <option key={d._id} value={d._id}>[{d.code}] {d.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Địa chỉ Điểm đi</label>
                  <input type="text" value={formData.startLocation} onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Địa chỉ Điểm đến</label>
                  <input type="text" value={formData.endLocation} onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Quãng đường (km)</label>
                  <input type="number" min="0" value={formData.distance} onChange={(e) => setFormData({ ...formData, distance: Number(e.target.value) })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
                </div>
              </div>
            </div>

            {/* Section 4: Schedule */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ea580c", marginBottom: 8 }}>4. Lịch trình Chuyến đi</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Giờ Xuất bến dự kiến *</label>
                  <input type="datetime-local" required value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Giờ Đến dự kiến *</label>
                  <input type="datetime-local" required value={formData.estimatedEndTime} onChange={(e) => setFormData({ ...formData, estimatedEndTime: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Ghi chú dặn dò</label>
              <textarea rows="2" placeholder="Lưu ý bảo quản hàng hóa..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: "9px 18px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 6, cursor: "pointer" }}>Hủy</button>
              <button type="submit" style={{ padding: "9px 20px", background: "#f97316", color: "#ffffff", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}>💾 Lưu Chuyến Đi</button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT TRIP MODAL */}
      {showEditModal && selectedTrip && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <form onSubmit={handleSaveEditTrip} style={{ background: "#ffffff", padding: 24, borderRadius: 12, width: 640, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0, marginBottom: 16, color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: 10 }}>
              ✏️ Cập Nhật Thông Tin Chuyến Đi [{selectedTrip.tripCode}]
            </h2>

            {/* Section 1: Trip Status & Customer */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ea580c", marginBottom: 8 }}>1. Trạng thái & Khách hàng</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Trạng Thái Chuyến</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, fontWeight: 700 }}
                  >
                    <option value="Đang chờ">⏳ Đang chờ</option>
                    <option value="Đang vận hành">🚚 Đang vận hành</option>
                    <option value="Hoàn thành">✅ Hoàn thành</option>
                    <option value="Đã hủy">❌ Đã hủy</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Khách hàng gửi *</label>
                  <input type="text" required value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>SĐT Liên hệ *</label>
                  <input type="text" required value={formData.customerPhone} onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
                </div>
              </div>
            </div>

            {/* Section 2: Cargo & Financials */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ea580c", marginBottom: 8 }}>2. Thông tin Hàng hóa & Cước phí</div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Loại hàng hóa</label>
                  <input type="text" value={formData.cargoType} onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Khối lượng (Tấn)</label>
                  <input type="number" step="0.5" value={formData.cargoWeightTon} onChange={(e) => setFormData({ ...formData, cargoWeightTon: Number(e.target.value) })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Cước phí (VNĐ)</label>
                  <input type="number" step="100000" min="0" value={formData.fare} onChange={(e) => setFormData({ ...formData, fare: Number(e.target.value) })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, fontWeight: 700, color: "#16a34a" }} />
                </div>
              </div>
            </div>

            {/* Section 3: Route */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ea580c", marginBottom: 8 }}>3. Lộ trình Chuyến đi</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Bãi Xe Xuất Phát</label>
                  <select value={formData.startDepotId} onChange={(e) => setFormData({ ...formData, startDepotId: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}>
                    {depots.map(d => <option key={d._id} value={d._id}>[{d.code}] {d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Bãi Xe Đích Đến</label>
                  <select value={formData.endDepotId} onChange={(e) => setFormData({ ...formData, endDepotId: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}>
                    {depots.map(d => <option key={d._id} value={d._id}>[{d.code}] {d.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Địa chỉ Điểm đi</label>
                  <input type="text" value={formData.startLocation} onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Địa chỉ Điểm đến</label>
                  <input type="text" value={formData.endLocation} onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Quãng đường (km)</label>
                  <input type="number" min="0" value={formData.distance} onChange={(e) => setFormData({ ...formData, distance: Number(e.target.value) })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
                </div>
              </div>
            </div>

            {/* Section 4: Schedule */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ea580c", marginBottom: 8 }}>4. Lịch trình Chuyến đi</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Giờ Xuất bến dự kiến</label>
                  <input type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Giờ Đến dự kiến</label>
                  <input type="datetime-local" value={formData.estimatedEndTime} onChange={(e) => setFormData({ ...formData, estimatedEndTime: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Ghi chú dặn dò</label>
              <textarea rows="2" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }} />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: "9px 18px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 6, cursor: "pointer" }}>Hủy bỏ</button>
              <button type="submit" style={{ padding: "9px 20px", background: "#2563eb", color: "#ffffff", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}>💾 Lưu Cập Nhật</button>
            </div>
          </form>
        </div>
      )}

      {/* CANCEL TRIP CONFIRMATION MODAL */}
      {showCancelModal && selectedTrip && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#ffffff", padding: 24, borderRadius: 12, width: 480, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, marginBottom: 10, color: "#dc2626" }}>
              🚫 Xác Nhận Hủy Chuyến Đi [{selectedTrip.tripCode}]
            </h3>
            <p style={{ fontSize: 13.5, color: "#475569", marginBottom: 14 }}>
              Bạn có chắc chắn muốn HỦY chuyến vận chuyển <strong>{selectedTrip.tripCode}</strong> ({selectedTrip.customerName || "Khách hàng"})?
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                Vui lòng chọn lý do hủy chuyến <span style={{ color: "red" }}>*</span>
              </label>
              <select
                id="cancel-reason-select"
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
              >
                <option value="Khách hàng hủy đơn / thay đổi kế hoạch">Khách hàng hủy đơn / thay đổi kế hoạch</option>
                <option value="Không có xe / tài xế phù hợp">Không có xe / tài xế phù hợp</option>
                <option value="Sự cố phương tiện hỏng hóc">Sự cố phương tiện hỏng hóc</option>
                <option value="Thời tiết / Lộ trình không đảm bảo">Thời tiết / Lộ trình không đảm bảo</option>
                <option value="Lý do vận hành khác">Lý do vận hành khác</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{ padding: "8px 16px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 6, cursor: "pointer" }}
              >
                Quay lại
              </button>
              <button
                onClick={() => {
                  const selectEl = document.getElementById("cancel-reason-select");
                  const reasonVal = selectEl?.value || "Đã hủy bởi điều hành viên";
                  handleConfirmCancel(reasonVal);
                }}
                style={{ padding: "8px 18px", background: "#dc2626", color: "#ffffff", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}
              >
                🚫 Xác Nhận Hủy Chuyến
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL TRIP MODAL */}
      {showDetailModal && selectedTrip && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#ffffff", padding: 24, borderRadius: 12, width: 560, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, borderBottom: "1px solid #f1f5f9", paddingBottom: 10 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#ea580c" }}>📋 Chi Tiết Chuyến Đi {selectedTrip.tripCode}</h2>
                <span style={{ fontSize: 12, color: "#64748b" }}>Khởi tạo: {selectedTrip.createdAt}</span>
              </div>
              {getStatusBadge(selectedTrip.status)}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5, color: "#334155" }}>
              <div><strong>👤 Người/Đơn vị gửi hàng:</strong> {selectedTrip.customerName || "N/A"} ({selectedTrip.customerPhone || "N/A"})</div>
              <div><strong>📦 Loại hàng hóa:</strong> {selectedTrip.cargoType} (<strong>{selectedTrip.cargoWeightTon} Tấn</strong>)</div>
              <div><strong>💰 Cước phí vận chuyển:</strong> <span style={{ color: "#16a34a", fontWeight: 700 }}>{(selectedTrip.fare || 0).toLocaleString()} VNĐ</span></div>

              <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", marginTop: 4 }}>
                <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 4 }}>📍 Tuyến & Lộ trình:</div>
                <div>Điểm xuất phát: <strong>{selectedTrip.startDepot?.name || "Bãi xe đi"}</strong> ({selectedTrip.startLocation || "Tại bãi"})</div>
                <div>Điểm trả hàng: <strong>{selectedTrip.endDepot?.name || "Bãi xe đến"}</strong> ({selectedTrip.endLocation || "Tại bãi"})</div>
                <div>Quãng đường dự kiến: <strong>{selectedTrip.distance || 0} km</strong></div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div>🚚 <strong>Xe tải:</strong> {selectedTrip.vehicle?.licensePlate || "Chưa điều phối"}</div>
                <div>👨‍✈️ <strong>Tài xế:</strong> {selectedTrip.driver?.fullName || "Chưa điều phối"}</div>
              </div>

              <div><strong>⏰ Xuất bến dự kiến:</strong> {selectedTrip.startTime ? String(selectedTrip.startTime).substring(0, 16) : "N/A"}</div>
              <div><strong>🏁 Đến dự kiến:</strong> {selectedTrip.estimatedEndTime ? String(selectedTrip.estimatedEndTime).substring(0, 16) : "N/A"}</div>

              {selectedTrip.cancelReason && (
                <div style={{ background: "#fef2f2", padding: 10, borderRadius: 6, border: "1px solid #fecaca", color: "#991b1b" }}>
                  🚫 <strong>Lý do hủy chuyến:</strong> {selectedTrip.cancelReason}
                </div>
              )}

              {selectedTrip.notes && (
                <div style={{ background: "#fff7ed", padding: 10, borderRadius: 6, border: "1px solid #ffedd5", color: "#c2410c" }}>
                  📝 <strong>Ghi chú:</strong> {selectedTrip.notes}
                </div>
              )}
            </div>

            <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8 }}>
                {selectedTrip.status !== "Đã hủy" && (
                  <button
                    onClick={(e) => {
                      setShowDetailModal(false);
                      handleOpenEditModal(selectedTrip, e);
                    }}
                    style={{ padding: "8px 14px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}
                  >
                    ✏️ Sửa Chuyến
                  </button>
                )}
                {(selectedTrip.status === "Đang chờ" || selectedTrip.status === "Đang vận hành") && (
                  <button
                    onClick={(e) => {
                      setShowDetailModal(false);
                      handleOpenCancelModal(selectedTrip, e);
                    }}
                    style={{ padding: "8px 14px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}
                  >
                    🚫 Hủy Chuyến
                  </button>
                )}
              </div>
              <button onClick={() => setShowDetailModal(false)} style={{ padding: "8px 18px", background: "#334155", color: "#ffffff", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripManagement;
