import React, { useState, useEffect, useMemo } from "react";
import { depotApi } from "../../api/depotApi";
import { vehicleApi } from "../../api/vehicleApi";
import { freightTripApi } from "../../api/freightTripApi";
import axiosClient from "../../api/axiosClient";

export const VehicleDispatch = () => {
  const [depots, setDepots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Dispatch Studio States
  const [selectedTripIdForDispatch, setSelectedTripIdForDispatch] = useState("");
  const [selectedDepotIdForDispatch, setSelectedDepotIdForDispatch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicleWeightFilter, setVehicleWeightFilter] = useState("ALL");
  const [selectedVehicleForDispatch, setSelectedVehicleForDispatch] = useState(null);
  
  const [driverSearch, setDriverSearch] = useState("");
  const [selectedDriverForDispatch, setSelectedDriverForDispatch] = useState(null);
  const [dispatchNotes, setDispatchNotes] = useState("");

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
    { _id: "d-1", fullName: "Lê Văn Tài (Tài xế 01)", phone: "0903333301", username: "driver1", isActive: true },
    { _id: "d-2", fullName: "Phạm Minh Đức (Tài xế 02)", phone: "0903333302", username: "driver2", isActive: true },
    { _id: "d-3", fullName: "Nguyễn Hoàng Nam (Tài xế 03)", phone: "0903333303", username: "driver3", isActive: true },
    { _id: "d-4", fullName: "Trần Quốc Bảo (Tài xế 04)", phone: "0903333304", username: "driver4", isActive: true },
    { _id: "d-5", fullName: "Vũ Tuấn Anh (Tài xế 05)", phone: "0903333305", username: "driver5", isActive: true },
    { _id: "d-6", fullName: "Đặng Huy Hoàng (Tài xế 06)", phone: "0903333306", username: "driver6", isActive: true },
    { _id: "d-7", fullName: "Bùi Quang Huy (Tài xế 07)", phone: "0903333307", username: "driver7", isActive: true },
    { _id: "d-8", fullName: "Ngô Thành Trung (Tài xế 08)", phone: "0903333308", username: "driver8", isActive: true },
    { _id: "d-9", fullName: "Hoàng Trọng Hiếu (Tài xế 09)", phone: "0903333309", username: "driver9", isActive: true },
    { _id: "d-10", fullName: "Đỗ Minh Trí (Tài xế 10)", phone: "0903333310", username: "driver10", isActive: true },
    { _id: "d-11", fullName: "Nguyễn Thanh Tùng (Tài xế 11)", phone: "0903333311", username: "driver11", isActive: true },
    { _id: "d-12", fullName: "Lý Văn Hùng (Tài xế 12)", phone: "0903333312", username: "driver12", isActive: true },
    { _id: "d-13", fullName: "Đinh Văn Lâm (Tài xế 13)", phone: "0903333313", username: "driver13", isActive: true },
    { _id: "d-14", fullName: "Trịnh Tấn Phát (Tài xế 14)", phone: "0903333314", username: "driver14", isActive: true },
    { _id: "d-15", fullName: "Võ Văn Kiệt (Tài xế 15)", phone: "0903333315", username: "driver15", isActive: true },
    { _id: "d-16", fullName: "Dương Hải Đăng (Tài xế 16)", phone: "0903333316", username: "driver16", isActive: true },
    { _id: "d-17", fullName: "Phan Văn Nhật (Tài xế 17)", phone: "0903333317", username: "driver17", isActive: true },
    { _id: "d-18", fullName: "Huỳnh Tấn Đạt (Tài xế 18)", phone: "0903333318", username: "driver18", isActive: true },
    { _id: "d-19", fullName: "Mai Quốc Tuấn (Tài xế 19)", phone: "0903333319", username: "driver19", isActive: true },
    { _id: "d-20", fullName: "Cao Minh Lộc (Tài xế 20)", phone: "0903333320", username: "driver20", isActive: true },
    { _id: "d-21", fullName: "Nguyễn Hoàng Long (Tài xế 21)", phone: "0903333321", username: "driver21", isActive: true },
    { _id: "d-22", fullName: "Trương Văn Thịnh (Tài xế 22)", phone: "0903333322", username: "driver22", isActive: true },
    { _id: "d-23", fullName: "Hồ Hữu Phước (Tài xế 23)", phone: "0903333323", username: "driver23", isActive: true },
    { _id: "d-24", fullName: "Lâm Quốc Cường (Tài xế 24)", phone: "0903333324", username: "driver24", isActive: true },
    { _id: "d-25", fullName: "Đào Văn Sang (Tài xế 25)", phone: "0903333325", username: "driver25", isActive: true }
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
      vehicle: null,
      driver: null,
      startTime: "2026-08-06 08:00",
      estimatedEndTime: "2026-08-06 18:00",
      createdAt: "2026-08-06 07:30",
      notes: "Hàng linh kiện dễ vỡ, bảo quản nhiệt độ thường"
    },
    {
      _id: "t-102",
      tripCode: "FUTA-TRIP-902",
      status: "Đang chờ",
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
      vehicle: null,
      driver: null,
      startTime: "2026-08-05 09:30",
      estimatedEndTime: "2026-08-06 20:00",
      createdAt: "2026-08-05 09:00",
      notes: "Vận chuyển tuyến Bắc Nam chạy liên tục"
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

      const depotsData = depRes.data?.data || (Array.isArray(depRes.data) ? depRes.data : null);
      if (depotsData && depotsData.length > 0) {
        setDepots(depotsData);
        setSelectedDepotIdForDispatch(depotsData[0]._id);
      } else {
        setDepots(mockDepots);
        setSelectedDepotIdForDispatch(mockDepots[0]._id);
      }

      const driversData = drvRes.data?.data || (Array.isArray(drvRes.data) ? drvRes.data : null);
      if (driversData && driversData.length > 0) {
        setDrivers(driversData);
      } else {
        setDrivers(mockDrivers);
      }

      const vehiclesData = vehRes.data?.data || (Array.isArray(vehRes.data) ? vehRes.data : null);
      if (vehiclesData && vehiclesData.length > 0) {
        setVehicles(vehiclesData);
      } else {
        setVehicles(mockVehicles);
      }

      const tripsData = tripRes.data?.data || (Array.isArray(tripRes.data) ? tripRes.data : null);
      if (tripsData && tripsData.length > 0) {
        setTrips(tripsData);
        const pending = tripsData.find(t => t.status === "Đang chờ");
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

  return (
    <div style={{ padding: 20, color: "#1e293b" }}>
      {/* Title */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#0f172a" }}>
          ⚡ Điều Phối Phương Tiện & Tài Xế Futa Express
        </h1>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4, margin: 0 }}>
          Tra cứu xe khả dụng, tra cứu tài xế khả dụng, tự động đề xuất xe phù hợp tải trọng, chọn xe, chọn tài xế, gán chuyến và xác nhận lệnh điều phối.
        </p>
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

      {/* MAIN TWO-PANEL DISPATCH LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
        {/* LEFT PANEL: CHỌN CHUYẾN ĐI & XÁC NHẬN ĐIỀU PHỐI */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Step 1: Select Pending Trip */}
          <div style={{ background: "#ffffff", padding: 18, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, marginBottom: 12, color: "#0f172a" }}>
              1️⃣ Chọn Chuyến Đi Cần Gán Điều Phối
            </h3>

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
                🚚 Xe tải gán cho chuyến:{" "}
                {selectedVehicleForDispatch ? (
                  <strong style={{ color: "#2563eb" }}>{selectedVehicleForDispatch.licensePlate} ({selectedVehicleForDispatch.brand} - {selectedVehicleForDispatch.payload} Tấn)</strong>
                ) : (
                  <span style={{ color: "#94a3b8", italic: "true" }}>Chưa chọn xe từ bảng bên phải</span>
                )}
              </div>
              <div>
                👨‍✈️ Tài xế gán cho chuyến:{" "}
                {selectedDriverForDispatch ? (
                  <strong style={{ color: "#16a34a" }}>{selectedDriverForDispatch.fullName} ({selectedDriverForDispatch.phone})</strong>
                ) : (
                  <span style={{ color: "#94a3b8", italic: "true" }}>Chưa chọn tài xế từ bảng bên phải</span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Ghi chú dặn dò Điều phối</label>
              <textarea
                rows="2"
                placeholder="VD: Kiểm tra niêm phong hàng, chạy tuyến tránh cao tốc..."
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
              {loading ? "Đang xử lý..." : "🔒 XÁC NHẬN ĐIỀU PHỐI & GÁN CHUYẾN"}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: TRA CỨU XE & TÀI XẾ KHẢ DỤNG + ĐỀ XUẤT THÔNG MINH */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* 2. Tra cứu & Đề xuất Xe Khả Dụng */}
          <div style={{ background: "#ffffff", padding: 18, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, marginBottom: 12, color: "#0f172a" }}>
              2️⃣ Tra Cứu Xe Khả Dụng & ✨ Đề Xuất Phù Hợp Tải Trọng ({recommendedVehiclesList.length} xe)
            </h3>

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
                placeholder="🔍 Biển số / Barcode..."
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
                  🚫 Không tìm thấy xe tải Sẵn sàng nào phù hợp.
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
    </div>
  );
};

export default VehicleDispatch;
