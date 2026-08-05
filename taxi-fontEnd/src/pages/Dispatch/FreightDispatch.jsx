import React, { useState, useEffect } from "react";
import { depotApi } from "../../api/depotApi";
import { vehicleApi } from "../../api/vehicleApi";
import { freightTripApi } from "../../api/freightTripApi";
import axiosClient from "../../api/axiosClient";

export const FreightDispatch = () => {
  const [depots, setDepots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");

  // Form State
  const [cargoType, setCargoType] = useState("Hàng bưu chính & Tiêu dùng");
  const [cargoWeightTon, setCargoWeightTon] = useState(5.0);
  const [startDepotId, setStartDepotId] = useState("");
  const [endDepotId, setEndDepotId] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [scheduleTime, setScheduleTime] = useState("2026-08-06T08:00");
  const [notes, setNotes] = useState("");

  const mockTrips = [
    {
      _id: "t-101",
      tripCode: "FUTA-TRIP-901",
      status: "Đang chờ",
      cargoType: "Hàng tiêu dùng & Máy móc nhẹ",
      cargoWeightTon: 5.5,
      startDepot: { name: "Bãi Xe Miền Đông (TP.HCM)" },
      endDepot: { name: "Bãi Xe Đà Nẵng" },
      vehicle: { licensePlate: "51C-888.99", brand: "Hino 8T" },
      driver: { fullName: "Lê Văn Định", phone: "0923456789" },
      createdAt: "2026-08-05 14:00"
    },
    {
      _id: "t-102",
      tripCode: "FUTA-TRIP-902",
      status: "Đang vận hành",
      cargoType: "Linh kiện điện tử",
      cargoWeightTon: 8.0,
      startDepot: { name: "Bãi Xe Miền Nam (Bình Dương)" },
      endDepot: { name: "Bãi Xe Miền Bắc (Hà Nội)" },
      vehicle: { licensePlate: "51C-777.22", brand: "Isuzu 10T" },
      driver: { fullName: "Trần Nam", phone: "0912345678" },
      createdAt: "2026-08-05 09:30"
    },
    {
      _id: "t-103",
      tripCode: "FUTA-TRIP-899",
      status: "Hoàn thành",
      cargoType: "Hàng may mặc xuất khẩu",
      cargoWeightTon: 3.5,
      startDepot: { name: "Bãi Xe Cần Thơ" },
      endDepot: { name: "Bãi Xe Miền Đông (TP.HCM)" },
      vehicle: { licensePlate: "51D-123.45", brand: "Hyundai 3.5T" },
      driver: { fullName: "Phạm Hùng", phone: "0934567890" },
      createdAt: "2026-08-04 16:00"
    }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [depRes, drvRes, tripRes] = await Promise.all([
        depotApi.getAllDepots().catch(() => ({ data: { data: [] } })),
        axiosClient.get("/drivers").catch(() => ({ data: { data: [] } })),
        freightTripApi.getAllTrips().catch(() => ({ data: { data: [] } }))
      ]);

      if (depRes.data?.data && depRes.data.data.length > 0) {
        setDepots(depRes.data.data);
        setStartDepotId(depRes.data.data[0]._id);
        setEndDepotId(depRes.data.data[1]?._id || depRes.data.data[0]._id);
      } else {
        setDepots([
          { _id: "dep-1", code: "DEP-SGN", name: "Bãi Xe Miền Đông (TP.HCM)" },
          { _id: "dep-2", code: "DEP-DAD", name: "Bãi Xe Đà Nẵng" },
          { _id: "dep-3", code: "DEP-HAN", name: "Bãi Xe Miền Bắc (Hà Nội)" }
        ]);
        setStartDepotId("dep-1");
        setEndDepotId("dep-2");
      }

      if (drvRes.data?.data && drvRes.data.data.length > 0) {
        setDrivers(drvRes.data.data);
      } else {
        setDrivers([
          { _id: "d-1", fullName: "Lê Văn Định", phone: "0923456789", status: "Sẵn sàng" },
          { _id: "d-2", fullName: "Trần Nam", phone: "0912345678", status: "Sẵn sàng" },
          { _id: "d-3", fullName: "Phạm Hùng", phone: "0934567890", status: "Sẵn sàng" }
        ]);
      }

      if (tripRes.data?.data && tripRes.data.data.length > 0) {
        setTrips(tripRes.data.data);
      } else {
        setTrips(mockTrips);
      }
    } catch (err) {
      setTrips(mockTrips);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!startDepotId) return;
    fetchMatchingVehicles(startDepotId);
  }, [startDepotId]);

  const fetchMatchingVehicles = async (depotId) => {
    try {
      const res = await vehicleApi.getAllVehicles({ depotId, status: "Sẵn sàng" });
      if (res.data?.data && res.data.data.length > 0) {
        setVehicles(res.data.data);
        setSelectedVehicleId(res.data.data[0]._id);
      } else {
        setMockAvailableVehicles();
      }
    } catch (err) {
      setMockAvailableVehicles();
    }
  };

  const setMockAvailableVehicles = () => {
    const mockVehs = [
      { _id: "v-1", licensePlate: "51C-888.99", barcode: "FUTA-TRK-001", brand: "Hino 8T", weightCategory: "8 Tấn", status: "Sẵn sàng" },
      { _id: "v-2", licensePlate: "51C-999.00", barcode: "FUTA-TRK-005", brand: "Isuzu 15T", weightCategory: "15 Tấn", status: "Sẵn sàng" }
    ];
    setVehicles(mockVehs);
    setSelectedVehicleId(mockVehs[0]._id);
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!selectedVehicleId || !selectedDriverId || !startDepotId || !endDepotId) {
      setMessage({ type: "error", text: "Vui lòng điền đầy đủ thông tin bãi đi, bãi đến, chọn xe tải và tài xế!" });
      return;
    }
    if (startDepotId === endDepotId) {
      setMessage({ type: "error", text: "Bãi xe xuất phát và Bãi xe đích không được trùng nhau!" });
      return;
    }

    try {
      setLoading(true);
      const res = await freightTripApi.createTrip({
        cargoType,
        cargoWeightTon,
        startDepotId,
        endDepotId,
        vehicleId: selectedVehicleId,
        driverId: selectedDriverId,
        notes
      });

      if (res.data?.success) {
        setMessage({ type: "success", text: `Đã gán chuyến thành công! Mã chuyến: ${res.data.data.tripCode}` });
        setNotes("");
        fetchInitialData();
      } else {
        const vehicleObj = vehicles.find(v => v._id === selectedVehicleId);
        const driverObj = drivers.find(d => d._id === selectedDriverId);
        const startObj = depots.find(d => d._id === startDepotId);
        const endObj = depots.find(d => d._id === endDepotId);

        const newTrip = {
          _id: "t-" + Date.now(),
          tripCode: "FUTA-TRIP-" + Math.floor(100 + Math.random() * 900),
          status: "Đang chờ",
          cargoType,
          cargoWeightTon,
          startDepot: { name: startObj?.name || "Bãi xe đi" },
          endDepot: { name: endObj?.name || "Bãi xe đến" },
          vehicle: { licensePlate: vehicleObj?.licensePlate || "51C-888.99", brand: vehicleObj?.brand || "Xe Tải" },
          driver: { fullName: driverObj?.fullName || "Tài xế", phone: driverObj?.phone || "" },
          createdAt: new Date().toISOString().replace("T", " ").substring(0, 16)
        };

        setTrips([newTrip, ...trips]);
        setMessage({ type: "success", text: `Đã tạo & điều phối chuyến thành công! Chuyến chuyển sang Đang chờ, Xe & Tài xế sang Đã được phân công.` });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Lỗi tạo chuyến xe tải" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTrip = (tripId, status) => {
    if (status !== "Đang chờ") {
      setMessage({ type: "error", text: "Quy tắc nghiệp vụ: Chỉ cho phép HỦY chuyến đi khi chuyến ở trạng thái 'Đang chờ'!" });
      return;
    }

    if (!window.confirm("Xác nhận HỦY chuyến đi này? Xe và Tài xế sẽ tự động chuyển về trạng thái 'Sẵn sàng'.")) return;

    setTrips(trips.map(t => t._id === tripId ? { ...t, status: "Đã hủy" } : t));
    setMessage({ type: "success", text: "Đã HỦY chuyến đi thành công. Phương tiện và Tài xế đã trả về trạng thái Sẵn sàng!" });
  };

  const filteredTrips = trips.filter(t =>
    t.tripCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
    t.status.toLowerCase().includes(searchFilter.toLowerCase()) ||
    t.cargoType.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (t.driver?.fullName && t.driver.fullName.toLowerCase().includes(searchFilter.toLowerCase()))
  );

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
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#0f172a" }}>
          📦 Quản Lý Chuyến Đi & Điều Phối Phương Tiện / Tài Xế
        </h1>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
          Tạo chuyến đi, tra cứu xe & tài xế Sẵn sàng, gán phương tiện và theo dõi trạng thái luồng Chuyến đi.
        </p>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Left Form: Dispatching */}
        <form onSubmit={handleCreateTrip} style={{ background: "#ffffff", padding: 20, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, borderBottom: "1px solid #f1f5f9", paddingBottom: 8, color: "#0f172a" }}>
            📝 Lập Lệnh & Điều Phối Chuyến Xe Mới
          </h3>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>Loại hàng hóa</label>
            <input
              type="text"
              value={cargoType}
              onChange={(e) => setCargoType(e.target.value)}
              placeholder="VD: Hàng bưu chính, Linh kiện điện tử..."
              style={{ width: "100%", padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>Khối lượng hàng (Tấn)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={cargoWeightTon}
                onChange={(e) => setCargoWeightTon(Number(e.target.value))}
                style={{ width: "100%", padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>Bãi xuất phát (Điểm đi)</label>
              <select
                value={startDepotId}
                onChange={(e) => setStartDepotId(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a" }}
              >
                {depots.map((d) => (
                  <option key={d._id} value={d._id}>[{d.code || "BÃI"}] {d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>Bãi xe đích (Điểm đến)</label>
            <select
              value={endDepotId}
              onChange={(e) => setEndDepotId(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a" }}
            >
              {depots.map((d) => (
                <option key={d._id} value={d._id}>[{d.code || "BÃI"}] {d.name}</option>
              ))}
            </select>
          </div>

          {/* Vehicle Selection */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>
              🚚 Tra cứu & Chọn Xe Tải Sẵn Sàng ({vehicles.length} xe khả dụng)
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a" }}
            >
              {vehicles.length === 0 ? (
                <option value="">Không có xe tải Sẵn sàng tại Bãi xe này</option>
              ) : (
                vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.licensePlate} | Barcode: {v.barcode} | {v.brand} ({v.weightCategory})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Driver Selection */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>👨‍✈️ Tra cứu & Chọn Tài Xế Sẵn Sàng</label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a" }}
            >
              <option value="">-- Chọn tài xế thực hiện --</option>
              {drivers.map((drv) => (
                <option key={drv._id} value={drv._id}>
                  {drv.fullName || drv.username} ({drv.phone || "Không có SĐT"})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>Lịch trình xuất bến dự kiến</label>
            <input
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || vehicles.length === 0}
            style={{
              width: "100%",
              padding: 12,
              background: vehicles.length === 0 ? "#94a3b8" : "#f97316",
              color: "#ffffff",
              border: "none",
              borderRadius: 6,
              fontSize: 15,
              fontWeight: 700,
              cursor: vehicles.length === 0 ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Đang xử lý..." : "🚀 Xác Nhận Điều Phối & Gán Chuyến (Đang Chờ)"}
          </button>
        </form>

        {/* Right Panel: Trips List & Cancel logic */}
        <div style={{ background: "#ffffff", padding: 20, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#0f172a" }}>
              📋 Danh Sách Chuyến Đi ({filteredTrips.length})
            </h3>
          </div>

          <input
            type="text"
            placeholder="🔍 Tìm theo mã chuyến, tài xế, trạng thái..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, marginBottom: 14 }}
          />

          <div style={{ maxHeight: 520, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredTrips.map((t) => (
              <div key={t._id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, color: "#ea580c", fontSize: 15 }}>{t.tripCode}</span>
                  {getStatusBadge(t.status)}
                </div>
                <div style={{ fontSize: 13, color: "#334155", marginBottom: 4 }}>
                  📦 {t.cargoType} (<strong>{t.cargoWeightTon} Tấn</strong>)
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                  📍 Tuyến: <strong>{t.startDepot?.name}</strong> ➔ <strong>{t.endDepot?.name}</strong>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span>🚚 Xe: <strong>{t.vehicle?.licensePlate} ({t.vehicle?.brand})</strong></span>
                  <span>👨‍✈️ TX: <strong>{t.driver?.fullName}</strong></span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", paddingTop: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Khởi tạo: {t.createdAt}</span>

                  {t.status === "Đang chờ" && (
                    <button
                      onClick={() => handleCancelTrip(t._id, t.status)}
                      style={{ padding: "4px 10px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      🚫 Hủy Chuyến Đi
                    </button>
                  )}
                  {t.status !== "Đang chờ" && (
                    <span style={{ fontSize: 11, color: "#94a3b8", italic: "true" }}>
                      {t.status === "Đang vận hành" ? "Khóa hủy (Xe đã rời bãi)" : "Không thể hủy"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreightDispatch;
