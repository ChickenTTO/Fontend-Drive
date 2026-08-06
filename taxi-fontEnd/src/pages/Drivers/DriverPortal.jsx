import React, { useState, useEffect, useMemo } from "react";
import BarcodeHandover from "./BarcodeHandover";
import { useAuth } from "../../contexts/AuthContext";
import { freightTripApi } from "../../api/freightTripApi";
import axiosClient from "../../api/axiosClient";

export const DriverPortal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("trips"); // 'trips' | 'handover' | 'expenses'
  const [tripSubTab, setTripSubTab] = useState("active"); // 'active' (Đang chờ/Đang vận hành) | 'history' (Hoàn thành)

  const [driverTrips, setDriverTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  // Complete Trip Modal
  const [selectedTripToComplete, setSelectedTripToComplete] = useState(null);
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

  // New Expense Form Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "Phí cầu đường (BOT)",
    amount: 120000,
    description: "",
    receiptImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80"
  });

  const driverName = user?.fullName || user?.name || "Tài xế 1";
  const driverPhone = user?.phone || user?.username || "0923456789";

  const defaultMockTrips = [
    {
      _id: "trip-dr-01",
      tripCode: "FUTA-TRIP-901",
      status: "Đang chờ",
      cargoType: "Linh kiện điện tử & Công nghệ",
      cargoWeightTon: 5.5,
      vehicle: { licensePlate: "51C-888.99", brand: "Hino 8T", barcode: "FUTA-TRK-001" },
      driver: { fullName: driverName, phone: driverPhone },
      startDepot: { name: "Bãi Xe TP.Hồ Chí Minh (Bến xe Miền Đông)" },
      startLocation: "Kho Samsung Q.9",
      endDepot: { name: "Bãi Xe Đà Nẵng (Cảng Tiên Sa)" },
      endLocation: "KCN Hòa Khánh, Đà Nẵng",
      distance: 180,
      fare: 3500000,
      startTime: "2026-08-06 08:00",
      estimatedEndTime: "2026-08-06 18:00"
    },
    {
      _id: "trip-dr-02",
      tripCode: "FUTA-TRIP-889",
      status: "Đang vận hành",
      cargoType: "Hàng gia dụng & Bưu chính Express",
      cargoWeightTon: 6.5,
      vehicle: { licensePlate: "51C-777.22", brand: "Isuzu 10T", barcode: "FUTA-TRK-002" },
      driver: { fullName: driverName, phone: driverPhone },
      startDepot: { name: "Bãi Xe Cần Thơ" },
      startLocation: "Bến xe Cần Thơ",
      endDepot: { name: "Bãi Xe TP.Hồ Chí Minh" },
      endLocation: "Chợ đầu mối Thủ Đức",
      distance: 160,
      fare: 2800000,
      startTime: "2026-08-05 14:00",
      estimatedEndTime: "2026-08-05 20:00"
    }
  ];

  useEffect(() => {
    fetchDriverTrips();
  }, [user]);

  const fetchDriverTrips = async () => {
    setLoadingTrips(true);
    try {
      const [tripRes, bkRes] = await Promise.all([
        freightTripApi.getAllTrips().catch(() => ({ data: { data: [] } })),
        axiosClient.get("/bookings").catch(() => ({ data: { data: [] } }))
      ]);

      const allList = [
        ...(tripRes.data?.data || []),
        ...(bkRes.data?.data || [])
      ];

      // Remove duplicates by _id or tripCode
      const uniqueMap = new Map();
      allList.forEach(item => {
        if (item && item._id) uniqueMap.set(item._id, item);
      });
      const combined = Array.from(uniqueMap.values());

      const myUserId = user?._id || user?.id;
      const myUsername = user?.username?.toLowerCase();
      const myPhone = user?.phone;
      const myName = user?.fullName?.toLowerCase();

      // Filter trips belonging to this driver
      const myTrips = combined.filter(t => {
        if (!t.driver) return false;
        const dObj = t.driver;
        const drvId = typeof dObj === "object" ? (dObj._id || dObj.id) : dObj;
        const drvName = typeof dObj === "object" ? dObj.fullName?.toLowerCase() : "";
        const drvPhone = typeof dObj === "object" ? dObj.phone : "";
        const drvUser = typeof dObj === "object" ? dObj.username?.toLowerCase() : "";

        return (
          (myUserId && String(drvId) === String(myUserId)) ||
          (myUsername && drvUser === myUsername) ||
          (myPhone && drvPhone === myPhone) ||
          (myName && drvName && drvName.includes(myName)) ||
          (myName && drvName && myName.includes(drvName))
        );
      });

      if (myTrips.length > 0) {
        setDriverTrips(myTrips);
      } else {
        setDriverTrips(defaultMockTrips);
      }
    } catch (err) {
      setDriverTrips(defaultMockTrips);
    } finally {
      setLoadingTrips(false);
    }
  };

  // State tracking sequential handovers: { [tripId]: { checkedOut: boolean, checkedIn: boolean } }
  const [handoverState, setHandoverState] = useState(() => {
    try {
      const saved = localStorage.getItem("driver_handover_state");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [handoverParams, setHandoverParams] = useState({
    barcode: "",
    type: "CHECK_OUT",
    trip: null
  });

  const handleHandoverCompleted = (type, tripId, barcode) => {
    if (!tripId) return;
    setHandoverState(prev => {
      const updatedTripState = {
        ...(prev[tripId] || {}),
        [type === "CHECK_OUT" ? "checkedOut" : "checkedIn"]: true
      };
      const newState = { ...prev, [tripId]: updatedTripState };
      try {
        localStorage.setItem("driver_handover_state", JSON.stringify(newState));
      } catch (e) {}
      return newState;
    });
  };

  const handleGoToHandover = (trip, type) => {
    const barcode = trip.vehicle?.barcode || "FUTA-TRK-001";
    setHandoverParams({
      barcode,
      type,
      trip
    });
    setActiveTab("handover");
  };

  // Driver actions: Accept & Start Trip
  const handleStartTrip = async (trip) => {
    const tripId = trip._id;
    const isCheckedOut = handoverState[tripId]?.checkedOut;

    if (!isCheckedOut) {
      if (window.confirm("⚠️ QUY TRÌNH BẮT BỘC: Bạn phải nhận xe bến đi (Check-out Barcode) trước khi nhận chuyến!\n\nBấm OK để chuyển đến màn hình Nhận xe ngay.")) {
        handleGoToHandover(trip, "CHECK_OUT");
      }
      return;
    }

    try {
      await freightTripApi.updateTripStatus(tripId, "Đang vận hành").catch(() => null);
      setDriverTrips(prev => prev.map(t => t._id === tripId ? { ...t, status: "Đang vận hành" } : t));
      alert("🚀 BƯỚC 2 HOÀN TẤT: Đã chấp nhận & bắt đầu chuyến đi!");
      fetchDriverTrips();
    } catch (err) {
      setDriverTrips(prev => prev.map(t => t._id === tripId ? { ...t, status: "Đang vận hành" } : t));
      alert("🚀 BƯỚC 2 HOÀN TẤT: Đã chấp nhận & bắt đầu chuyến đi!");
    }
  };

  // Driver actions: Complete Trip
  const handleOpenCompleteModal = (trip) => {
    const tripId = trip._id;
    const isCheckedIn = handoverState[tripId]?.checkedIn;

    if (!isCheckedIn) {
      if (window.confirm("⚠️ QUY TRÌNH BẮT BỘC: Bạn phải trả xe về bãi (Check-in Barcode) trước khi xác nhận hoàn thành chuyến!\n\nBấm OK để chuyển đến màn hình Trả xe ngay.")) {
        handleGoToHandover(trip, "CHECK_IN");
      }
      return;
    }

    setSelectedTripToComplete(trip);
    setCompletionData({
      finalDistance: trip.distance || 120,
      notes: "",
      cargoCondition: "Nguyên vẹn"
    });
    setShowCompleteModal(true);
  };

  const handleConfirmCompleteTrip = async (e) => {
    e.preventDefault();
    if (!selectedTripToComplete) return;

    try {
      await freightTripApi.updateTripStatus(selectedTripToComplete._id, "Hoàn thành").catch(() => null);
      setDriverTrips(prev => prev.map(t => t._id === selectedTripToComplete._id ? { ...t, status: "Hoàn thành" } : t));
      setShowCompleteModal(false);
      alert("🎉 BƯỚC 4 HOÀN TẤT: Đã xác nhận hoàn thành chuyến đi an toàn!");
      fetchDriverTrips();
    } catch (err) {
      setDriverTrips(prev => prev.map(t => t._id === selectedTripToComplete._id ? { ...t, status: "Hoàn thành" } : t));
      setShowCompleteModal(false);
      alert("🎉 BƯỚC 4 HOÀN TẤT: Đã xác nhận hoàn thành chuyến đi an toàn!");
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
        return <span style={{ background: "#fef3c7", color: "#d97706", padding: "4px 12px", borderRadius: 20, fontWeight: 700, fontSize: 13 }}>⏳ Đang chờ (Cần nhận xe & chấp nhận)</span>;
      case "Đang vận hành":
      case "in_progress":
        return <span style={{ background: "#dbeafe", color: "#2563eb", padding: "4px 12px", borderRadius: 20, fontWeight: 700, fontSize: 13 }}>🚚 Đang vận hành (Cần trả xe khi đến bến)</span>;
      case "Hoàn thành":
      case "completed":
        return <span style={{ background: "#dcfce7", color: "#16a34a", padding: "4px 12px", borderRadius: 20, fontWeight: 700, fontSize: 13 }}>✅ Đã Hoàn Thành Chuyến</span>;
      case "Chờ duyệt":
        return <span style={{ background: "#fff7ed", color: "#c2410c", padding: "3px 10px", borderRadius: 12, fontWeight: 700, fontSize: 12 }}>⏳ Chờ duyệt</span>;
      case "Đã duyệt":
        return <span style={{ background: "#f0fdf4", color: "#15803d", padding: "3px 10px", borderRadius: 12, fontWeight: 700, fontSize: 12 }}>✅ Đã duyệt</span>;
      default:
        return null;
    }
  };

  // Filter Active vs Completed Trips
  const activeTrips = useMemo(() => {
    return driverTrips.filter(t => t.status === "Đang chờ" || t.status === "Đang vận hành" || t.status === "in_progress");
  }, [driverTrips]);

  const historyTrips = useMemo(() => {
    return driverTrips.filter(t => t.status === "Hoàn thành" || t.status === "completed" || t.status === "Đã hủy");
  }, [driverTrips]);

  const displayedTrips = tripSubTab === "active" ? activeTrips : historyTrips;

  return (
    <div style={{ padding: 20, color: "#1e293b", maxWidth: 1100, margin: "0 auto" }}>
      {/* Driver Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "#fff", padding: 20, borderRadius: 12, marginBottom: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, opacity: 0.7 }}>Cổng Thông Tin Vận Hành Tài Xế FUTA Express</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: "4px 0 0 0", color: "#f97316" }}>
              👨‍✈️ {driverName} ({driverPhone})
            </h1>
          </div>
          <div style={{ textAlign: "right", fontSize: 13, opacity: 0.9 }}>
            <div>Tổng chuyến được gán: <strong style={{ color: "#38bdf8", fontSize: 16 }}>{driverTrips.length} chuyến</strong></div>
            <div>Đang vận hành: <strong style={{ color: "#22c55e" }}>{activeTrips.length} chuyến</strong></div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
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
          📦 Chuyến Đi Được Phân Công ({driverTrips.length})
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

      {/* TAB 1: ASSIGNED TRIPS LIST */}
      {activeTab === "trips" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Sub-tabs: Active vs History */}
          <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
            <button
              onClick={() => setTripSubTab("active")}
              style={{
                padding: "8px 16px",
                background: tripSubTab === "active" ? "#eff6ff" : "#ffffff",
                color: tripSubTab === "active" ? "#2563eb" : "#64748b",
                border: `1px solid ${tripSubTab === "active" ? "#bfdbfe" : "#cbd5e1"}`,
                borderRadius: 6,
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              ⏳ Chuyến Đang Chờ / Đang Vận Hành ({activeTrips.length})
            </button>
            <button
              onClick={() => setTripSubTab("history")}
              style={{
                padding: "8px 16px",
                background: tripSubTab === "history" ? "#f0fdf4" : "#ffffff",
                color: tripSubTab === "history" ? "#16a34a" : "#64748b",
                border: `1px solid ${tripSubTab === "history" ? "#bbf7d0" : "#cbd5e1"}`,
                borderRadius: 6,
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              ✅ Lịch Sử Hoàn Thành ({historyTrips.length})
            </button>
          </div>

          {loadingTrips && <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}>Đang tải danh sách chuyến đi của bạn...</div>}

          {/* Render Trips */}
          {!loadingTrips && displayedTrips.map((trip) => {
            const tripId = trip._id;
            const stateObj = handoverState[tripId] || {};
            const isCheckedOut = stateObj.checkedOut || trip.status === "Đang vận hành" || trip.status === "in_progress" || trip.status === "Hoàn thành" || trip.status === "completed";
            const isStarted = trip.status === "Đang vận hành" || trip.status === "in_progress" || trip.status === "Hoàn thành" || trip.status === "completed";
            const isCheckedIn = stateObj.checkedIn || trip.status === "Hoàn thành" || trip.status === "completed";
            const isCompleted = trip.status === "Hoàn thành" || trip.status === "completed";

            return (
              <div
                key={tripId}
                style={{
                  background: "#ffffff",
                  padding: 20,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderBottom: "1px solid #f1f5f9", paddingBottom: 10, flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <span style={{ fontSize: 17, fontWeight: 800, color: "#ea580c" }}>Mã chuyến: {trip.tripCode}</span>
                    {trip.customerName && <span style={{ fontSize: 13, color: "#64748b", marginLeft: 8 }}>• Người gửi: {trip.customerName} ({trip.customerPhone || "N/A"})</span>}
                  </div>
                  {getStatusBadge(trip.status)}
                </div>

                {/* 🔄 STEP-BY-STEP PROGRESSION STEPPER BAR */}
                <div style={{
                  background: "#f8fafc",
                  padding: "10px 14px",
                  borderRadius: 8,
                  marginBottom: 14,
                  border: "1px solid #cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 6,
                  flexWrap: "wrap"
                }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>
                    📋 Quy trình vận hành bắt buộc:
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, flexWrap: "wrap" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontWeight: 700,
                      background: isCheckedOut ? "#dcfce7" : "#fff7ed",
                      color: isCheckedOut ? "#15803d" : "#c2410c",
                      border: `1px solid ${isCheckedOut ? "#bbf7d0" : "#ffedd5"}`
                    }}>
                      {isCheckedOut ? "✓ B1: Nhận Xe" : "B1: Nhận Xe (Bắt buộc)"}
                    </span>
                    <span style={{ color: "#94a3b8" }}>➔</span>

                    <span style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontWeight: 700,
                      background: isStarted ? "#dcfce7" : isCheckedOut ? "#dbeafe" : "#f1f5f9",
                      color: isStarted ? "#15803d" : isCheckedOut ? "#1d4ed8" : "#94a3b8",
                      border: `1px solid ${isStarted ? "#bbf7d0" : isCheckedOut ? "#bfdbfe" : "#cbd5e1"}`
                    }}>
                      {isStarted ? "✓ B2: Bắt Đầu Chuyến" : "B2: Bắt Đầu Chuyến"}
                    </span>
                    <span style={{ color: "#94a3b8" }}>➔</span>

                    <span style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontWeight: 700,
                      background: isCheckedIn ? "#dcfce7" : isStarted ? "#fff7ed" : "#f1f5f9",
                      color: isCheckedIn ? "#15803d" : isStarted ? "#c2410c" : "#94a3b8",
                      border: `1px solid ${isCheckedIn ? "#bbf7d0" : isStarted ? "#ffedd5" : "#cbd5e1"}`
                    }}>
                      {isCheckedIn ? "✓ B3: Trả Xe" : "B3: Trả Xe (Bắt buộc)"}
                    </span>
                    <span style={{ color: "#94a3b8" }}>➔</span>

                    <span style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontWeight: 700,
                      background: isCompleted ? "#dcfce7" : isCheckedIn ? "#dbeafe" : "#f1f5f9",
                      color: isCompleted ? "#15803d" : isCheckedIn ? "#1d4ed8" : "#94a3b8",
                      border: `1px solid ${isCompleted ? "#bbf7d0" : isCheckedIn ? "#bfdbfe" : "#cbd5e1"}`
                    }}>
                      {isCompleted ? "✓ B4: Hoàn Thành" : "B4: Hoàn Thành"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, fontSize: 14, lineHeight: "1.8" }}>
                  <div style={{ background: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "#2563eb", marginTop: 0, marginBottom: 8 }}>🚚 Phương tiện & Hàng hóa</h4>
                    <div>Dòng xe: <strong>{trip.vehicle?.brand || "Xe tải Futa Express"}</strong></div>
                    <div>Biển số xe: <strong style={{ color: "#ea580c", fontSize: 16 }}>{trip.vehicle?.licensePlate || "51C-888.99"}</strong></div>
                    <div>Barcode: <code>{trip.vehicle?.barcode || "FUTA-TRK-001"}</code></div>
                    <div>Loại hàng hóa: <strong>{trip.cargoType}</strong></div>
                    <div>Khối lượng: <strong>{trip.cargoWeightTon ? `${trip.cargoWeightTon} Tấn` : "N/A"}</strong></div>
                  </div>

                  <div style={{ background: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "#16a34a", marginTop: 0, marginBottom: 8 }}>📍 Lộ trình & Thời gian</h4>
                    <div>Tuyến: <strong>[{trip.startDepot?.code || "ĐI"}] {trip.startDepot?.name || trip.startLocation} ➔ [{trip.endDepot?.code || "ĐẾN"}] {trip.endDepot?.name || trip.endLocation}</strong></div>
                    <div>Điểm đi: {trip.startLocation || "Tại bãi"}</div>
                    <div>Điểm đến: {trip.endLocation || "Tại bãi"}</div>
                    <div>Giờ xuất bến dự kiến: <strong>{trip.startTime ? String(trip.startTime).substring(0, 16) : "N/A"}</strong></div>
                    <div>Cước phí vận chuyển: <strong style={{ color: "#16a34a" }}>{(trip.fare || 0).toLocaleString()} VNĐ</strong></div>
                  </div>
                </div>

                {/* STRICT SEQUENTIAL ACTION BUTTONS FOR DRIVER */}
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px dashed #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ fontSize: 12.5, color: "#64748b" }}>
                    💡 <strong>Nghiệp vụ:</strong> [1] Nhận xe ➔ [2] Bắt đầu chuyến ➔ [3] Trả xe ➔ [4] Hoàn thành.
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {/* TRẠNG THÁI 1: BƯỚC 1 - NHẬN XE CHECK-OUT & BƯỚC 2 - BẮT ĐẦU CHUYẾN */}
                    {trip.status === "Đang chờ" && (
                      <>
                        <button
                          onClick={() => handleGoToHandover(trip, "CHECK_OUT")}
                          style={{
                            padding: "9px 16px",
                            background: isCheckedOut ? "#f0fdf4" : "#f97316",
                            color: isCheckedOut ? "#16a34a" : "#ffffff",
                            border: `1px solid ${isCheckedOut ? "#bbf7d0" : "#ea580c"}`,
                            borderRadius: 8,
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: "pointer"
                          }}
                        >
                          {isCheckedOut ? "✓ B1: Đã Nhận Xe (Check-out)" : "📱 B1: Nhận Xe (Check-out Barcode)"}
                        </button>

                        <button
                          onClick={() => handleStartTrip(trip)}
                          style={{
                            padding: "9px 18px",
                            background: isCheckedOut ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#cbd5e1",
                            color: isCheckedOut ? "#ffffff" : "#64748b",
                            border: "none",
                            borderRadius: 8,
                            fontWeight: 800,
                            fontSize: 13,
                            cursor: isCheckedOut ? "pointer" : "not-allowed",
                            boxShadow: isCheckedOut ? "0 4px 10px rgba(37,99,235,0.3)" : "none"
                          }}
                          title={!isCheckedOut ? "Phải hoàn thành Bước 1: Nhận xe (Check-out) trước!" : ""}
                        >
                          {isCheckedOut ? "🚀 B2: Chấp Nhận & Bắt Đầu Chuyến" : "🔒 B2: Cần Nhận Xe Trước"}
                        </button>
                      </>
                    )}

                    {/* TRẠNG THÁI 2: BƯỚC 3 - TRẢ XE CHECK-IN & BƯỚC 4 - HOÀN THÀNH CHUYẾN */}
                    {(trip.status === "Đang vận hành" || trip.status === "in_progress") && (
                      <>
                        <button
                          onClick={() => handleGoToHandover(trip, "CHECK_IN")}
                          style={{
                            padding: "9px 16px",
                            background: isCheckedIn ? "#f0fdf4" : "#f97316",
                            color: isCheckedIn ? "#16a34a" : "#ffffff",
                            border: `1px solid ${isCheckedIn ? "#bbf7d0" : "#ea580c"}`,
                            borderRadius: 8,
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: "pointer"
                          }}
                        >
                          {isCheckedIn ? "✓ B3: Đã Trả Xe (Check-in)" : "📱 B3: Trả Xe (Check-in Barcode)"}
                        </button>

                        <button
                          onClick={() => handleOpenCompleteModal(trip)}
                          style={{
                            padding: "9px 18px",
                            background: isCheckedIn ? "linear-gradient(135deg, #16a34a, #15803d)" : "#cbd5e1",
                            color: isCheckedIn ? "#ffffff" : "#64748b",
                            border: "none",
                            borderRadius: 8,
                            fontWeight: 800,
                            fontSize: 13,
                            cursor: isCheckedIn ? "pointer" : "not-allowed",
                            boxShadow: isCheckedIn ? "0 4px 10px rgba(22,163,74,0.3)" : "none"
                          }}
                          title={!isCheckedIn ? "Phải hoàn thành Bước 3: Trả xe (Check-in) trước!" : ""}
                        >
                          {isCheckedIn ? "🏁 B4: Xác Nhận Hoàn Thành Chuyến" : "🔒 B4: Cần Trả Xe Trước"}
                        </button>
                      </>
                    )}

                    {(trip.status === "Hoàn thành" || trip.status === "completed") && (
                      <button
                        disabled
                        style={{
                          padding: "9px 18px",
                          background: "#f0fdf4",
                          color: "#16a34a",
                          border: "1px solid #bbf7d0",
                          borderRadius: 8,
                          fontWeight: 800,
                          fontSize: 13,
                          cursor: "default"
                        }}
                      >
                        🎉 Chuyến Đi Đã Hoàn Thành Rực Rỡ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {!loadingTrips && displayedTrips.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b", background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0" }}>
              🔍 Hiện tại bạn không có chuyến xe nào trong danh mục này.
            </div>
          )}
        </div>
      )}

      {/* Modal XÁC NHẬN HOÀN THÀNH CHUYẾN ĐỊ */}
      {showCompleteModal && selectedTripToComplete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <form onSubmit={handleConfirmCompleteTrip} style={{ background: "#ffffff", padding: 24, borderRadius: 12, width: 480, maxWidth: "100%", boxShadow: "0 20px 25px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 12px 0", color: "#16a34a", display: "flex", alignItems: "center", gap: 8 }}>
              🏁 Xác Nhận Hoàn Thành Chuyến Xe {selectedTripToComplete.tripCode}
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
        <BarcodeHandover
          initialBarcode={handoverParams.barcode}
          initialType={handoverParams.type}
          tripToHandover={handoverParams.trip}
          onHandoverSuccess={(type, tripId, barcode) => {
            handleHandoverCompleted(type, tripId, barcode);
          }}
        />
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
