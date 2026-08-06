import React, { useState } from "react";
import { barcodeApi } from "../../api/barcodeApi";
import { handoverApi } from "../../api/handoverApi";

export const BarcodeHandover = () => {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [vehicleData, setVehicleData] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Form states
  const [handoverType, setHandoverType] = useState("CHECK_OUT");
  const [odometerReading, setOdometerReading] = useState(15000);
  const [fuelLiters, setFuelLiters] = useState(70);
  const [generalNotes, setGeneralNotes] = useState("");

  // Photo URLs (Mock/Cloudinary links)
  const [photos, setPhotos] = useState({
    cabin: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
    cargoBox: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80",
    tires: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80"
  });

  const handleScanBarcode = async (e) => {
    e?.preventDefault();
    if (!barcodeInput) {
      setMessage({ type: "error", text: "Vui lòng nhập Mã vạch xe tải (Barcode)!" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      const res = await barcodeApi.scanBarcode(barcodeInput);
      if (res.data?.success) {
        const v = res.data.data.vehicle;
        const t = res.data.data.activeTrip;
        setVehicleData(v);
        setActiveTrip(t);
        setOdometerReading(v.odometer || 15000);
        setFuelLiters(v.fuelLiters || v.fuelLevel || 70);

        if (v.status === "Sẵn sàng") {
          setHandoverType("CHECK_OUT");
        } else {
          setHandoverType("CHECK_IN");
        }

        setMessage({ type: "success", text: `Đã tìm thấy xe ${v.licensePlate} (${v.brand})` });
      }
    } catch (err) {
      setVehicleData(null);
      setActiveTrip(null);
      setMessage({ type: "error", text: err.response?.data?.message || "Không tìm thấy Mã vạch xe" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitHandover = async (e) => {
    e.preventDefault();
    if (!activeTrip) {
      setMessage({ type: "error", text: "Phương tiện này hiện không thuộc chuyến xe active nào để làm biên bản bàn giao!" });
      return;
    }

    try {
      setLoading(true);
      const res = await handoverApi.createHandover({
        type: handoverType,
        tripId: activeTrip._id,
        barcode: vehicleData.barcode,
        odometerReading,
        fuelLiters,
        fuelLevelPercent: fuelLiters,
        photos,
        generalNotes
      });

      if (res.data?.success) {
        setMessage({ type: "success", text: res.data.message });
        handleScanBarcode();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Lỗi tạo biên bản bàn giao điện tử" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, color: "#1e293b" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#0f172a" }}>
          📱 Bàn Giao Xe Điện Tử Qua Mã Vạch
        </h1>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
          Giả lập nhập mã vạch định danh khóa xe, lập biên bản bàn giao điện tử (Handover Form) bắt buộc upload ảnh cabin, thùng xe & lốp xe.
        </p>
      </div>

      {/* Barcode Simulator Input */}
      <div style={{ background: "#ffffff", padding: 18, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#0f172a" }}>🔍 Giả lập Quét / Nhập Mã Vạch (Barcode Simulator)</h3>
        <form onSubmit={handleScanBarcode} style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="Nhập mã vạch xe (VD: FUTA-TRK-001, FUTA-TRK-005)..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            style={{ flex: 1, padding: "9px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a", fontSize: 14 }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "9px 20px", background: "#f97316", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}
          >
            {loading ? "Đang quét..." : "Quét Mã Vạch"}
          </button>
        </form>

        <div style={{ marginTop: 10, display: "flex", gap: 8, fontSize: 12, color: "#64748b" }}>
          <span>Mẫu thử nhanh:</span>
          <button onClick={() => { setBarcodeInput("FUTA-TRK-001"); }} style={{ background: "#f1f5f9", color: "#2563eb", border: "1px solid #cbd5e1", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}>FUTA-TRK-001</button>
          <button onClick={() => { setBarcodeInput("FUTA-TRK-005"); }} style={{ background: "#f1f5f9", color: "#2563eb", border: "1px solid #cbd5e1", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}>FUTA-TRK-005</button>
        </div>
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

      {/* Vehicle Info Card & Handover Form */}
      {vehicleData && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
          {/* Vehicle Info */}
          <div style={{ background: "#ffffff", padding: 18, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: "#ea580c" }}>🚚 Thông tin Phương tiện</h3>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>{vehicleData.licensePlate}</div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>Barcode: <strong>{vehicleData.barcode}</strong></div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>Dòng xe: <strong>{vehicleData.brand} ({vehicleData.model})</strong></div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>Tải trọng: <strong>{vehicleData.weightCategory}</strong></div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>Bãi xe: <strong>{vehicleData.depot?.name}</strong></div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 12 }}>Trạng thái: <strong style={{ color: vehicleData.status === "Sẵn sàng" ? "#16a34a" : "#2563eb" }}>{vehicleData.status}</strong></div>

            {activeTrip && (
              <div style={{ background: "#f8fafc", padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#2563eb", margin: 0, marginBottom: 4 }}>📦 Chuyến xe Active</h4>
                <div style={{ fontSize: 12, color: "#475569" }}>Mã: {activeTrip.tripCode}</div>
                <div style={{ fontSize: 12, color: "#475569" }}>Tuyến: {activeTrip.startDepot?.name} ➔ {activeTrip.endDepot?.name}</div>
                <div style={{ fontSize: 12, color: "#475569" }}>Tài xế: {activeTrip.driver?.fullName}</div>
              </div>
            )}
          </div>

          {/* Electronic Handover Form */}
          <form onSubmit={handleSubmitHandover} style={{ background: "#ffffff", padding: 20, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, borderBottom: "1px solid #f1f5f9", paddingBottom: 8, color: "#0f172a" }}>
              📋 Biên Bản Bàn Giao Xe Điện Tử (Handover Form)
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>Loại giao dịch bàn giao</label>
                <select
                  value={handoverType}
                  onChange={(e) => setHandoverType(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a" }}
                >
                  <option value="CHECK_OUT">CHECK_OUT (Nhận xe bến đi)</option>
                  <option value="CHECK_IN">CHECK_IN (Trả xe về bãi đến)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>Số Km công-tơ-mét hiện tại</label>
                <input
                  type="number"
                  value={odometerReading}
                  onChange={(e) => setOdometerReading(Number(e.target.value))}
                  style={{ width: "100%", padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>
                Số lít nhiên liệu thực tế (Lít)
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="1"
                  value={fuelLiters}
                  onChange={(e) => setFuelLiters(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#f97316", cursor: "pointer" }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={fuelLiters}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0);
                      setFuelLiters(val);
                    }}
                    style={{
                      width: 80,
                      padding: "6px 10px",
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      color: "#0f172a",
                      fontSize: 14,
                      fontWeight: 600,
                      textAlign: "center"
                    }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>Lít</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#ea580c", display: "block", marginBottom: 6 }}>
                📸 Bắt buộc 03 Ảnh Chụp Hiện Trạng Phương Tiện (Minh bạch tài sản):
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>1. Cabin xe</div>
                  <img src={photos.cabin} alt="Cabin" style={{ width: "100%", height: 85, objectFit: "cover", borderRadius: 6, border: "1px solid #e2e8f0" }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>2. Thùng xe</div>
                  <img src={photos.cargoBox} alt="Cargo Box" style={{ width: "100%", height: 85, objectFit: "cover", borderRadius: 6, border: "1px solid #e2e8f0" }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>3. Lốp xe</div>
                  <img src={photos.tires} alt="Tires" style={{ width: "100%", height: 85, objectFit: "cover", borderRadius: 6, border: "1px solid #e2e8f0" }} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: "#475569", fontWeight: 600, display: "block", marginBottom: 4 }}>Ghi chú tình trạng ngoại thất</label>
              <textarea
                rows="2"
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Kiểm tra gương, đèn, áp suất lốp đủ điều kiện xuất bến..."
                style={{ width: "100%", padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !activeTrip}
              style={{
                width: "100%",
                padding: 11,
                background: !activeTrip ? "#94a3b8" : "#16a34a",
                color: "#ffffff",
                border: "none",
                borderRadius: 6,
                fontSize: 15,
                fontWeight: 700,
                cursor: !activeTrip ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Đang gửi..." : "🔒 Khóa Biên Bản & Xác Nhận Bàn Giao Xe"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default BarcodeHandover;
