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

  // Form State
  const [cargoType, setCargoType] = useState("Hàng bưu chính & Tiêu dùng");
  const [cargoWeightTon, setCargoWeightTon] = useState(5.0);
  const [startDepotId, setStartDepotId] = useState("");
  const [endDepotId, setEndDepotId] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [depRes, drvRes, tripRes] = await Promise.all([
        depotApi.getAllDepots(),
        axiosClient.get("/drivers"),
        freightTripApi.getAllTrips()
      ]);

      if (depRes.data?.data) {
        setDepots(depRes.data.data);
        if (depRes.data.data.length >= 2) {
          setStartDepotId(depRes.data.data[0]._id);
          setEndDepotId(depRes.data.data[3]._id || depRes.data.data[1]._id);
        }
      }
      if (drvRes.data?.data) setDrivers(drvRes.data.data);
      if (tripRes.data?.data) setTrips(tripRes.data.data);
    } catch (err) {
      console.error("Error fetching dispatch data:", err);
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
      if (res.data?.data) {
        setVehicles(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedVehicleId(res.data.data[0]._id);
        } else {
          setSelectedVehicleId("");
        }
      }
    } catch (err) {
      console.error("Error filtering vehicles:", err);
    }
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
        fetchMatchingVehicles(startDepotId);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Lỗi tạo chuyến xe tải" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, color: "#1e293b" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#0f172a" }}>
          📦 Điều động Chuyến xe Tải Futa Express
        </h1>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
          Tiếp nhận đơn hàng luân chuyển, tự động gợi ý phương tiện đúng tải trọng đang Sẵn sàng tại bãi và phân công tài xế.
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
            📝 Lập Lệnh Điều động Vận chuyển
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
              <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>Khối lượng (Tấn)</label>
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
                  <option key={d._id} value={d._id}>[{d.code}] {d.name}</option>
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
                <option key={d._id} value={d._id}>[{d.code}] {d.name}</option>
              ))}
            </select>
          </div>

          {/* Vehicle Selection */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>
              🚚 Gợi ý Xe tải Sẵn sàng ({vehicles.length} xe khả dụng tại bãi xuất phát)
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
            <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>👨‍✈️ Phân công Tài xế</label>
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
            <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>Ghi chú hành trình</label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Yêu cầu giao đúng hẹn, niêm phong kẹp chì..."
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
            {loading ? "Đang xử lý..." : "🚀 Phát lệnh & Gán Chuyến Xe Tải"}
          </button>
        </form>

        {/* Right Panel: Active & Recent Trips */}
        <div style={{ background: "#ffffff", padding: 20, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, borderBottom: "1px solid #f1f5f9", paddingBottom: 8, color: "#0f172a" }}>
            📋 Danh sách Chuyến Xe Tải Hiện tại ({trips.length})
          </h3>

          <div style={{ maxHeight: 500, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            {trips.map((t) => {
              const statusColor = t.status === "Đang vận hành" ? "#2563eb" : t.status === "Hoàn tất" ? "#16a34a" : "#d97706";
              return (
                <div key={t._id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: "#ea580c", fontSize: 14 }}>{t.tripCode}</span>
                    <span style={{ background: `${statusColor}15`, color: statusColor, padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                      {t.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "#334155", marginBottom: 4 }}>
                    📦 {t.cargoType} ({t.cargoWeightTon} Tấn)
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                    🚩 Tuyến: <strong>{t.startDepot?.name}</strong> ➔ <strong>{t.endDepot?.name}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", display: "flex", justifyContent: "space-between" }}>
                    <span>🚚 Xe: <strong>{t.vehicle?.licensePlate}</strong></span>
                    <span>👨‍✈️ TX: <strong>{t.driver?.fullName}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreightDispatch;
