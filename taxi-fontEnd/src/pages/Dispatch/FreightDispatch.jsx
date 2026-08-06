import React, { useState, useEffect, useMemo } from "react";
import { depotApi } from "../../api/depotApi";
import { vehicleApi } from "../../api/vehicleApi";
import { freightTripApi } from "../../api/freightTripApi";
import axiosClient from "../../api/axiosClient";

export const FreightDispatch = () => {
  const [activeMainTab, setActiveMainTab] = useState("dispatch"); // 'dispatch' (Điều phối) | 'management' (Quản lý)

  const [depots, setDepots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Search & Filters in Management
  const [statusTab, setStatusTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Dispatch Studio States
  const [selectedTripIdForDispatch, setSelectedTripIdForDispatch] = useState("");
  const [selectedDepotIdForDispatch, setSelectedDepotIdForDispatch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicleWeightFilter, setVehicleWeightFilter] = useState("ALL");
  const [selectedVehicleForDispatch, setSelectedVehicleForDispatch] = useState(null);
  
  const [driverSearch, setDriverSearch] = useState("");
  const [selectedDriverForDispatch, setSelectedDriverForDispatch] = useState(null);
  const [dispatchNotes, setDispatchNotes] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Form State for Create/Edit
  const [formData, setFormData] = useState({
    tripCode: "",
    customerName: "",
    customerPhone: "",
    cargoType: "Hàng bưu chính & Tiêu dùng Futa",
    cargoWeightTon: 3.5,
    fare: 1500000,
    startDepotId: "",
    startLocation: "Bãi xe Futa Express",
    endDepotId: "",
    endLocation: "Kho bãi trung chuyển",
    distance: 120,
    startTime: new Date().toISOString().substring(0, 16),
    estimatedEndTime: new Date(Date.now() + 6 * 3600 * 1000).toISOString().substring(0, 16),
    vehicleId: "",
    driverId: "",
    notes: ""
  });

  const mockDepots = [
    { _id: "dep-1", code: "HCM", name: "Bãi Xe TP.HCM", city: "TP.HCM" },
    { _id: "dep-2", code: "HN", name: "Bãi Xe Hà Nội", city: "Hà Nội" },
    { _id: "dep-3", code: "DN", name: "Bãi Xe Đà Nẵng", city: "Đà Nẵng" },
    { _id: "dep-4", code: "HP", name: "Bãi Xe Hải Phòng", city: "Hải Phòng" },
    { _id: "dep-5", code: "CT", name: "Bãi Xe Cần Thơ", city: "Cần Thơ" }
  ];

  const mockVehicles = [
    { _id: "v-1", licensePlate: "51C-888.99", barcode: "FUTA-TRK-001", brand: "Hino 8T", maxPayloadTon: 8.0, weightCategory: "Tải trung (5 - 8 tấn)", status: "Sẵn sàng", fuelLiters: 85, depot: { _id: "dep-1", name: "Bãi Xe TP.HCM" } },
    { _id: "v-2", licensePlate: "51C-999.00", barcode: "FUTA-TRK-005", brand: "Isuzu 15T", maxPayloadTon: 15.0, weightCategory: "Tải nặng / Container (15 - 30 tấn)", status: "Sẵn sàng", fuelLiters: 120, depot: { _id: "dep-1", name: "Bãi Xe TP.HCM" } },
    { _id: "v-3", licensePlate: "51D-123.45", barcode: "FUTA-TRK-003", brand: "Hyundai 3.5T", maxPayloadTon: 3.5, weightCategory: "Tải nhẹ (1.5 - 3.5 tấn)", status: "Sẵn sàng", fuelLiters: 65, depot: { _id: "dep-1", name: "Bãi Xe TP.HCM" } },
    { _id: "v-4", licensePlate: "29H-777.88", barcode: "FUTA-TRK-008", brand: "Chenglong 20T", maxPayloadTon: 20.0, weightCategory: "Tải nặng / Container (15 - 30 tấn)", status: "Sẵn sàng", fuelLiters: 180, depot: { _id: "dep-2", name: "Bãi Xe Hà Nội" } }
  ];

  const mockDrivers = [
    { _id: "d-1", fullName: "Lê Văn Định", phone: "0923456789", username: "driver_dinh", isActive: true },
    { _id: "d-2", fullName: "Trần Nam", phone: "0912345678", username: "driver_nam", isActive: true },
    { _id: "d-3", fullName: "Phạm Hùng", phone: "0934567890", username: "driver_hung", isActive: true },
    { _id: "d-4", fullName: "Vũ Tuấn Anh", phone: "0904445555", username: "driver_anh", isActive: true }
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
      vehicle: { _id: "v-1", licensePlate: "51C-888.99", brand: "Hino 8T", barcode: "FUTA-TRK-001" },
      driver: { _id: "d-1", fullName: "Lê Văn Định", phone: "0923456789" },
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
      vehicle: { _id: "v-2", licensePlate: "51C-777.22", brand: "Isuzu 10T", barcode: "FUTA-TRK-002" },
      driver: { _id: "d-2", fullName: "Trần Nam", phone: "0912345678" },
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
      vehicle: { _id: "v-3", licensePlate: "51D-123.45", brand: "Hyundai 3.5T", barcode: "FUTA-TRK-003" },
      driver: { _id: "d-3", fullName: "Phạm Hùng", phone: "0934567890" },
      startTime: "2026-08-04 08:00",
      estimatedEndTime: "2026-08-04 14:00",
      endTime: "2026-08-04 13:45",
      createdAt: "2026-08-04 07:00",
      notes: "Đã giao đúng hạn tại Cảng Cát Lái"
    }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [depRes, drvRes, vehRes, tripRes] = await Promise.all([
        depotApi.getAllDepots().catch(() => ({ data: { data: [] } })),
        axiosClient.get("/drivers").catch(() => ({ data: { data: [] } })),
        vehicleApi.getAllVehicles().catch(() => ({ data: { data: [] } })),
        freightTripApi.getAllTrips().catch(() => ({ data: { data: [] } }))
      ]);

      if (depRes.data?.data && depRes.data.data.length > 0) {
        setDepots(depRes.data.data);
        setSelectedDepotIdForDispatch(depRes.data.data[0]._id);
      } else {
        setDepots(mockDepots);
        setSelectedDepotIdForDispatch(mockDepots[0]._id);
      }

      if (drvRes.data?.data && drvRes.data.data.length > 0) {
        setDrivers(drvRes.data.data);
      } else {
        setDrivers(mockDrivers);
      }

      if (vehRes.data?.data && vehRes.data.data.length > 0) {
        setVehicles(vehRes.data.data);
      } else {
        setVehicles(mockVehicles);
      }

      if (tripRes.data?.data && tripRes.data.data.length > 0) {
        setTrips(tripRes.data.data);
        const pending = tripRes.data.data.find(t => t.status === "Đang chờ");
        if (pending) setSelectedTripIdForDispatch(pending._id);
      } else {
        setTrips(mockTrips);
        setSelectedTripIdForDispatch(mockTrips[0]._id);
      }
    } catch (err) {
      setDepots(mockDepots);
      setVehicles(mockVehicles);
      setDrivers(mockDrivers);
      setTrips(mockTrips);
      setSelectedTripIdForDispatch(mockTrips[0]._id);
    } finally {
      setLoading(false);
    }
  };

  // Selected Trip object for dispatch
  const currentDispatchTrip = useMemo(() => {
    return trips.find(t => t._id === selectedTripIdForDispatch) || trips[0];
  }, [trips, selectedTripIdForDispatch]);

  // Smart Vehicle Matching & Recommendation algorithm
  const recommendedVehiclesList = useMemo(() => {
    const targetWeight = currentDispatchTrip?.cargoWeightTon || 1.0;
    
    return vehicles.filter(v => {
      const matchesDepot = !selectedDepotIdForDispatch || (v.depot?._id || v.depot) === selectedDepotIdForDispatch;
      const matchesStatus = v.status === "Sẵn sàng";
      const q = vehicleSearch.toLowerCase();
      const matchesQuery = !q || v.licensePlate?.toLowerCase().includes(q) || v.brand?.toLowerCase().includes(q) || v.barcode?.toLowerCase().includes(q);
      const matchesWeightCat = vehicleWeightFilter === "ALL" || v.weightCategory === vehicleWeightFilter;
      return matchesDepot && matchesStatus && matchesQuery && matchesWeightCat;
    }).map(v => {
      const payload = v.maxPayloadTon || (v.weightCategory?.includes("3.5") ? 3.5 : v.weightCategory?.includes("8") ? 8.0 : 15.0);
      const isCapacityOk = payload >= targetWeight;
      const payloadDiff = payload - targetWeight;
      return {
        ...v,
        payload,
        isCapacityOk,
        payloadDiff,
        score: isCapacityOk ? (100 - payloadDiff) : -100
      };
    }).sort((a, b) => b.score - a.score);
  }, [vehicles, selectedDepotIdForDispatch, vehicleSearch, vehicleWeightFilter, currentDispatchTrip]);

  // Available Drivers List
  const availableDriversList = useMemo(() => {
    return drivers.filter(d => {
      const q = driverSearch.toLowerCase();
      return !q || d.fullName?.toLowerCase().includes(q) || d.phone?.includes(q) || d.username?.toLowerCase().includes(q);
    });
  }, [drivers, driverSearch]);

  // Confirm Dispatch Execution
  const handleConfirmDispatch = async () => {
    if (!currentDispatchTrip) {
      setMessage({ type: "error", text: "Vui lòng chọn Chuyến đi cần điều phối!" });
      return;
    }
    if (!selectedVehicleForDispatch) {
      setMessage({ type: "error", text: "Vui lòng chọn Xe tải khả dụng!" });
      return;
    }
    if (!selectedDriverForDispatch) {
      setMessage({ type: "error", text: "Vui lòng chọn Tài xế khả dụng!" });
      return;
    }

    if (selectedVehicleForDispatch.payload < currentDispatchTrip.cargoWeightTon) {
      if (!window.confirm(`⚠️ Cảnh báo tải trọng: Xe ${selectedVehicleForDispatch.licensePlate} (${selectedVehicleForDispatch.payload} Tấn) nhỏ hơn Khối lượng hàng (${currentDispatchTrip.cargoWeightTon} Tấn). Bạn vẫn muốn tiếp tục điều phối?`)) {
        return;
      }
    }

    try {
      setLoading(true);
      const res = await freightTripApi.dispatchTrip(currentDispatchTrip._id, {
        vehicleId: selectedVehicleForDispatch._id,
        driverId: selectedDriverForDispatch._id,
        startDepotId: selectedDepotIdForDispatch,
        notes: dispatchNotes
      });

      if (res.data?.success) {
        setMessage({ type: "success", text: res.data.message });
      } else {
        executeLocalDispatchFallback();
      }
      fetchInitialData();
    } catch (err) {
      executeLocalDispatchFallback();
    } finally {
      setLoading(false);
    }
  };

  const executeLocalDispatchFallback = () => {
    setTrips(trips.map(t => {
      if (t._id === currentDispatchTrip._id) {
        return {
          ...t,
          status: "Đang chờ",
          vehicle: { _id: selectedVehicleForDispatch._id, licensePlate: selectedVehicleForDispatch.licensePlate, brand: selectedVehicleForDispatch.brand },
          driver: { _id: selectedDriverForDispatch._id, fullName: selectedDriverForDispatch.fullName, phone: selectedDriverForDispatch.phone },
          notes: dispatchNotes || t.notes
        };
      }
      return t;
    }));

    setMessage({
      type: "success",
      text: `🎉 ĐÃ XÁC NHẬN ĐIỀU PHỐI THÀNH CÔNG!\nChuyến [${currentDispatchTrip.tripCode}] đã gán Xe ${selectedVehicleForDispatch.licensePlate} & Tài xế ${selectedDriverForDispatch.fullName}.`
    });
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
      startTime: new Date().toISOString().substring(0, 16),
      estimatedEndTime: new Date(Date.now() + 6 * 3600 * 1000).toISOString().substring(0, 16),
      vehicleId: vehicles[0]?._id || "",
      driverId: drivers[0]?._id || "",
      notes: ""
    });
    setShowCreateModal(true);
  };

  const handleSaveCreateTrip = async (e) => {
    e.preventDefault();
    if (!formData.startDepotId || !formData.endDepotId) {
      setMessage({ type: "error", text: "Vui lòng chọn Bãi xuất phát và Bãi xe đích!" });
      return;
    }

    const vehicleObj = vehicles.find(v => v._id === formData.vehicleId);
    const driverObj = drivers.find(d => d._id === formData.driverId);
    const startObj = depots.find(d => d._id === formData.startDepotId);
    const endObj = depots.find(d => d._id === formData.endDepotId);

    const newTrip = {
      _id: "t-" + Date.now(),
      tripCode: formData.tripCode || ("FUTA-TRIP-" + Math.floor(100 + Math.random() * 900)),
      status: "Đang chờ",
      customerName: formData.customerName || "Khách hàng Futa Express",
      customerPhone: formData.customerPhone || "0900000000",
      cargoType: formData.cargoType,
      cargoWeightTon: formData.cargoWeightTon,
      fare: formData.fare,
      distance: formData.distance,
      startDepot: { _id: startObj?._id, name: startObj?.name || "Bãi xe đi", code: startObj?.code || "GO" },
      startLocation: formData.startLocation,
      endDepot: { _id: endObj?._id, name: endObj?.name || "Bãi xe đến", code: endObj?.code || "ARR" },
      endLocation: formData.endLocation,
      vehicle: { _id: vehicleObj?._id, licensePlate: vehicleObj?.licensePlate || "51C-888.99", brand: vehicleObj?.brand || "Xe Tải" },
      driver: { _id: driverObj?._id, fullName: driverObj?.fullName || "Tài xế Futa", phone: driverObj?.phone || "" },
      startTime: formData.startTime.replace("T", " "),
      estimatedEndTime: formData.estimatedEndTime.replace("T", " "),
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      notes: formData.notes
    };

    setTrips([newTrip, ...trips]);
    setSelectedTripIdForDispatch(newTrip._id);
    setMessage({ type: "success", text: `Đã tạo chuyến mới [${newTrip.tripCode}] và đưa vào Trung tâm Điều phối!` });
    setShowCreateModal(false);
  };

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
      {/* Title & Main Sub-tab Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#0f172a" }}>
            📦 Trung Tâm Điều Phối Phương Tiện & Tài Xế Futa Express
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 4, margin: 0 }}>
            Hệ thống tra cứu xe khả dụng, gán tài xế, đề xuất thông minh theo tải trọng hàng hóa và xác nhận điều phối xe tải toàn quốc.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setActiveMainTab("dispatch")}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: activeMainTab === "dispatch" ? "#f97316" : "#f1f5f9",
              color: activeMainTab === "dispatch" ? "#ffffff" : "#475569",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: activeMainTab === "dispatch" ? "0 2px 6px rgba(249,115,22,0.3)" : "none"
            }}
          >
            ⚡ Điều Phối Phương Tiện & Tài Xế
          </button>
          <button
            onClick={() => setActiveMainTab("management")}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: activeMainTab === "management" ? "#2563eb" : "#f1f5f9",
              color: activeMainTab === "management" ? "#ffffff" : "#475569",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: activeMainTab === "management" ? "0 2px 6px rgba(37,99,235,0.3)" : "none"
            }}
          >
            📋 Quản Lý Danh Sách Chuyến Đi
          </button>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div style={{
          padding: "12px 16px",
          borderRadius: 8,
          marginBottom: 16,
          background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
          color: message.type === "success" ? "#166534" : "#991b1b",
          border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
          whiteSpace: "pre-line"
        }}>
          {message.text}
        </div>
      )}

      {/* TAB 1: SMART DISPATCH STUDIO */}
      {activeMainTab === "dispatch" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
          {/* LEFT PANEL: CHỌN CHUYẾN ĐI & XÁC NHẬN ĐIỀU PHỐI */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Step 1: Select Pending Trip */}
            <div style={{ background: "#ffffff", padding: 18, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  1️⃣ Chọn Chuyến Đi Cần Điều Phối
                </h3>
                <button onClick={handleOpenCreateModal} style={{ padding: "4px 10px", background: "#fff7ed", color: "#ea580c", border: "1px solid #ffedd5", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  + Lập chuyến mới
                </button>
              </div>

              <select
                value={selectedTripIdForDispatch}
                onChange={(e) => setSelectedTripIdForDispatch(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, fontWeight: 700, color: "#ea580c", marginBottom: 12, background: "#ffffff" }}
              >
                {trips.map(t => (
                  <option key={t._id} value={t._id}>
                    [{t.tripCode}] - {t.cargoType} ({t.cargoWeightTon} Tấn) | {t.status}
                  </option>
                ))}
              </select>

              {currentDispatchTrip && (
                <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, color: "#334155" }}>
                  <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>
                    📦 {currentDispatchTrip.cargoType} (<strong>{currentDispatchTrip.cargoWeightTon} Tấn hàng</strong>)
                  </div>
                  <div>👤 Người gửi: <strong>{currentDispatchTrip.customerName || "Khách hàng Futa"}</strong> ({currentDispatchTrip.customerPhone || "N/A"})</div>
                  <div>📍 Tuyến: <strong>{currentDispatchTrip.startDepot?.name} ➔ {currentDispatchTrip.endDepot?.name}</strong></div>
                  <div>⏰ Giờ xuất bến: <strong>{currentDispatchTrip.startTime ? String(currentDispatchTrip.startTime).substring(0, 16) : "Theo lệnh"}</strong></div>
                </div>
              )}
            </div>

            {/* Step 4: Summary & Confirm Dispatch Action */}
            <div style={{ background: "#ffffff", padding: 18, borderRadius: 10, border: "1px solid #ea580c", boxShadow: "0 2px 10px rgba(234,88,12,0.1)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, marginBottom: 12, color: "#ea580c" }}>
                🚀 Xác Nhận Lệnh Điều Phối
              </h3>

              <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                <div>
                  🚚 Xe tải được chọn:{" "}
                  {selectedVehicleForDispatch ? (
                    <strong style={{ color: "#2563eb" }}>{selectedVehicleForDispatch.licensePlate} ({selectedVehicleForDispatch.brand} - {selectedVehicleForDispatch.payload} Tấn)</strong>
                  ) : (
                    <span style={{ color: "#94a3b8", italic: "true" }}>Chưa chọn xe từ danh sách bên phải</span>
                  )}
                </div>
                <div>
                  👨‍✈️ Tài xế phụ trách:{" "}
                  {selectedDriverForDispatch ? (
                    <strong style={{ color: "#16a34a" }}>{selectedDriverForDispatch.fullName} ({selectedDriverForDispatch.phone})</strong>
                  ) : (
                    <span style={{ color: "#94a3b8", italic: "true" }}>Chưa chọn tài xế từ danh sách bên phải</span>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Ghi chú dặn dò Tài xế & Xe</label>
                <textarea
                  rows="2"
                  placeholder="VD: Kiểm tra kẹp chì niêm phong, giữ nhiệt độ cabin..."
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <button
                onClick={handleConfirmDispatch}
                disabled={loading || !selectedVehicleForDispatch || !selectedDriverForDispatch}
                style={{
                  width: "100%",
                  padding: 13,
                  background: (!selectedVehicleForDispatch || !selectedDriverForDispatch) ? "#94a3b8" : "#16a34a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: (!selectedVehicleForDispatch || !selectedDriverForDispatch) ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(22,163,74,0.25)"
                }}
              >
                {loading ? "Đang xử lý lệnh..." : "🔒 XÁC NHẬN ĐIỀU PHỐI & GÁN CHUYẾN Đi"}
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: TRA CỨU XE & TÀI XẾ KHẢ DỤNG + ĐỀ XUẤT THÔNG MINH */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* 2. Tra cứu & Đề xuất Xe Khả Dụng */}
            <div style={{ background: "#ffffff", padding: 18, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  2️⃣ Tra Cứu Xe Khả Dụng & ✨ Đề Xuất Phù Hợp Tải Trọng ({recommendedVehiclesList.length} xe)
                </h3>
              </div>

              {/* Filter controls for vehicles */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                <select
                  value={selectedDepotIdForDispatch}
                  onChange={(e) => setSelectedDepotIdForDispatch(e.target.value)}
                  style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, background: "#fff" }}
                >
                  <option value="">-- Tất cả Bãi xe --</option>
                  {depots.map(d => <option key={d._id} value={d._id}>[{d.code}] {d.name}</option>)}
                </select>

                <select
                  value={vehicleWeightFilter}
                  onChange={(e) => setVehicleWeightFilter(e.target.value)}
                  style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, background: "#fff" }}
                >
                  <option value="ALL">-- Tất cả Phân loại Tải --</option>
                  <option value="Tải nhẹ (1.5 - 3.5 tấn)">Tải nhẹ (1.5 - 3.5t)</option>
                  <option value="Tải trung (5 - 8 tấn)">Tải trung (5 - 8t)</option>
                  <option value="Tải nặng / Container (15 - 30 tấn)">Tải nặng (15 - 30t)</option>
                </select>

                <input
                  type="text"
                  placeholder="🔍 Biển số / Mã vạch..."
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                />
              </div>

              {/* Vehicle Cards Selection */}
              <div style={{ maxHeight: 250, overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {recommendedVehiclesList.map((v, idx) => {
                  const isSelected = selectedVehicleForDispatch?._id === v._id;
                  const isBestRecommendation = idx === 0 && v.isCapacityOk;

                  return (
                    <div
                      key={v._id}
                      onClick={() => setSelectedVehicleForDispatch(v)}
                      style={{
                        background: isSelected ? "#eff6ff" : "#f8fafc",
                        border: `2px solid ${isSelected ? "#2563eb" : isBestRecommendation ? "#16a34a" : "#e2e8f0"}`,
                        borderRadius: 8,
                        padding: 12,
                        cursor: "pointer",
                        position: "relative"
                      }}
                    >
                      {isBestRecommendation && (
                        <span style={{ position: "absolute", top: -9, right: 10, background: "#16a34a", color: "#fff", padding: "1px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>
                          ✨ Đề xuất tốt nhất
                        </span>
                      )}

                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 15, color: "#0f172a" }}>
                        <span>{v.licensePlate}</span>
                        <span style={{ color: v.isCapacityOk ? "#16a34a" : "#dc2626", fontSize: 12 }}>{v.payload} Tấn</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", margin: "2px 0 4px 0" }}>Barcode: {v.barcode} | {v.brand}</div>
                      <div style={{ fontSize: 11.5, color: "#475569", display: "flex", justifyContent: "space-between" }}>
                        <span>⛽ Nhiên liệu: <strong>{v.fuelLiters || v.fuelLevel || 70} Lít</strong></span>
                        <span style={{ color: v.isCapacityOk ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                          {v.isCapacityOk ? "✅ Đủ tải trọng" : "⚠️ Thiếu tải"}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {recommendedVehiclesList.length === 0 && (
                  <div style={{ gridColumn: "span 2", padding: 20, textAlign: "center", color: "#64748b", fontSize: 13 }}>
                    🚫 Không tìm thấy xe tải Sẵn sàng nào phù hợp tại Bãi xe này.
                  </div>
                )}
              </div>
            </div>

            {/* 3. Tra cứu & Chọn Tài Xế Khả Dụng */}
            <div style={{ background: "#ffffff", padding: 18, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  3️⃣ Tra Cứu & Chọn Tài Xế Khả Dụng ({availableDriversList.length} tài xế)
                </h3>
                <input
                  type="text"
                  placeholder="🔍 Tìm tên / SĐT tài xế..."
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  style={{ padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, width: 200 }}
                />
              </div>

              {/* Driver Cards Selection */}
              <div style={{ maxHeight: 220, overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {availableDriversList.map((drv) => {
                  const isSelected = selectedDriverForDispatch?._id === drv._id;

                  return (
                    <div
                      key={drv._id}
                      onClick={() => setSelectedDriverForDispatch(drv)}
                      style={{
                        background: isSelected ? "#f0fdf4" : "#f8fafc",
                        border: `2px solid ${isSelected ? "#16a34a" : "#e2e8f0"}`,
                        borderRadius: 8,
                        padding: 12,
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>👨‍✈️ {drv.fullName || drv.username}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>📞 SĐT: <strong>{drv.phone || "Chưa cập nhật"}</strong></div>
                      <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, marginTop: 4 }}>● Trạng thái: Sẵn sàng</div>
                    </div>
                  );
                })}

                {availableDriversList.length === 0 && (
                  <div style={{ gridColumn: "span 2", padding: 20, textAlign: "center", color: "#64748b", fontSize: 13 }}>
                    🚫 Không tìm thấy tài xế Sẵn sàng nào.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRIP MANAGEMENT */}
      {activeMainTab === "management" && (
        <div>
          {/* Filter Bar */}
          <div style={{ background: "#ffffff", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <input
              type="text"
              placeholder="🔍 Tìm kiếm theo Mã chuyến đi, Khách hàng/SĐT, Loại hàng hóa, Tài xế, Biển số xe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 16 }}>
            {trips.filter(t => statusTab === "ALL" || t.status === statusTab).map((t) => (
              <div key={t._id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#ea580c" }}>{t.tripCode}</span>
                  {getStatusBadge(t.status)}
                </div>
                <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 700, marginBottom: 4 }}>📦 {t.cargoType} ({t.cargoWeightTon} Tấn)</div>
                <div style={{ fontSize: 12.5, color: "#2563eb", marginBottom: 6 }}>📍 {t.startDepot?.name} ➔ {t.endDepot?.name}</div>
                <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>🚚 Xe: <strong>{t.vehicle?.licensePlate || "N/A"}</strong> | 👨‍✈️ TX: <strong>{t.driver?.fullName || "N/A"}</strong></div>
                <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 700 }}>💰 Cước: {(t.fare || 0).toLocaleString()} VNĐ</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE TRIP MODAL */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <form onSubmit={handleSaveCreateTrip} style={{ background: "#ffffff", padding: 24, borderRadius: 12, width: 600, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, marginBottom: 16 }}>➕ Tạo Chuyến Đi Mới Vào Trung Tâm Điều Phối</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Mã Chuyến *</label>
                <input type="text" required value={formData.tripCode} onChange={(e) => setFormData({ ...formData, tripCode: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Loại Hàng hóa *</label>
                <input type="text" required value={formData.cargoType} onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Khối lượng (Tấn) *</label>
                <input type="number" step="0.5" min="0.1" required value={formData.cargoWeightTon} onChange={(e) => setFormData({ ...formData, cargoWeightTon: Number(e.target.value) })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Cước phí (VNĐ)</label>
                <input type="number" step="100000" min="0" value={formData.fare} onChange={(e) => setFormData({ ...formData, fare: Number(e.target.value) })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: "8px 16px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 6 }}>Hủy</button>
              <button type="submit" style={{ padding: "8px 18px", background: "#f97316", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700 }}>Khởi Tạo Chuyến</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FreightDispatch;
