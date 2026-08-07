import React, { useState, useEffect } from "react";
import "./VehicleList.css";
import { StatusIcon, LoadingSpinner } from "../../components/icons";
import vehicleApi from "../../api/vehicleApi";
import { depotApi } from "../../api/depotApi";

// =================== MODALS ===================

// --- Thêm / Sửa xe tải Futa Express ---
const VehicleFormModal = ({ isOpen, onClose, vehicle, onSave, depots = [] }) => {
  const [form, setForm] = useState({
    licensePlate: "",
    barcode: "",
    brand: "Hino",
    model: "FG8JT7A",
    year: new Date().getFullYear(),
    maxPayloadTon: 8.0,
    weightCategory: "Tải trung (5 - 8 tấn)",
    depotId: "",
    fuelLiters: 80,
    status: "Sẵn sàng",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setForm({
        _id: vehicle._id,
        licensePlate: vehicle.licensePlate || "",
        barcode: vehicle.barcode || "",
        brand: vehicle.brand || "Hino",
        model: vehicle.model || "Tải",
        year: vehicle.year || new Date().getFullYear(),
        maxPayloadTon: vehicle.maxPayloadTon || (vehicle.weightCategory?.includes("3.5") ? 3.5 : 8.0),
        weightCategory: vehicle.weightCategory || "Tải trung (5 - 8 tấn)",
        depotId: vehicle.depot?._id || vehicle.depot || (depots[0]?._id || ""),
        fuelLiters: vehicle.fuelLiters || vehicle.fuelLevel || 80,
        status: vehicle.status || "Sẵn sàng",
      });
    } else {
      setForm({
        licensePlate: "",
        barcode: "FUTA-TRK-" + Math.floor(100 + Math.random() * 900),
        brand: "Hino",
        model: "FG8JT7A",
        year: new Date().getFullYear(),
        maxPayloadTon: 8.0,
        weightCategory: "Tải trung (5 - 8 tấn)",
        depotId: depots[0]?._id || "",
        fuelLiters: 80,
        status: "Sẵn sàng",
      });
    }
  }, [vehicle, isOpen, depots]);

  // Automatic Weight Category matching based on Payload Ton
  const handlePayloadChange = (val) => {
    const tons = parseFloat(val) || 0;
    let cat = "Tải trung (5 - 8 tấn)";
    if (tons <= 3.5) cat = "Tải nhẹ (1.5 - 3.5 tấn)";
    else if (tons <= 8.0) cat = "Tải trung (5 - 8 tấn)";
    else cat = "Tải nặng / Container (15 - 30 tấn)";

    setForm(prev => ({
      ...prev,
      maxPayloadTon: tons,
      weightCategory: cat
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.licensePlate || !form.barcode) {
      alert("Vui lòng nhập Biển số xe và Mã vạch (Barcode) xe tải!");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (vehicle) {
        res = await vehicleApi.update(vehicle._id, form);
      } else {
        res = await vehicleApi.create(form);
      }

      if (res.data?.data) {
        onSave(res.data.data);
        alert(vehicle ? "✏️ Cập nhật thông tin xe thành công!" : "🚛 Thêm xe tải mới thành công!");
      } else {
        const fallbackVehicle = {
          _id: vehicle?._id || ("v-" + Date.now()),
          ...form,
          depot: depots.find(d => d._id === form.depotId) || { name: "Bãi xe Futa Express" }
        };
        onSave(fallbackVehicle);
      }

      onClose();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      if (errMsg && !errMsg.includes("Network Error")) {
        alert("Lỗi: " + errMsg);
      } else {
        const fallbackVehicle = {
          _id: vehicle?._id || ("v-" + Date.now()),
          ...form,
          depot: depots.find(d => d._id === form.depotId) || { name: "Bãi xe Futa Express" }
        };
        onSave(fallbackVehicle);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3>{vehicle ? "✏️ Cập Nhật Xe Tải Futa Express" : "🚛 Thêm Xe Tải Mới"}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Biển Số Xe <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  className="form-input"
                  required
                  placeholder="VD: 51C-888.99"
                  value={form.licensePlate}
                  onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Mã Vạch Barcode <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  className="form-input"
                  required
                  placeholder="VD: FUTA-TRK-001"
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Hãng Xe</label>
                <input
                  className="form-input"
                  placeholder="Hino, Isuzu, Hyundai..."
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Dòng Xe (Model)</label>
                <input
                  className="form-input"
                  placeholder="FG8JT7A, NPR85K..."
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Năm SX</label>
                <input
                  className="form-input"
                  type="number"
                  min="2000"
                  max="2030"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 2026 })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Tải Trọng Tối Đa (Tấn) <span style={{ color: "#ea580c", fontWeight: 700 }}>*</span>
                </label>
                <input
                  className="form-input"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="50"
                  required
                  placeholder="VD: 3.5, 8.0, 15.0..."
                  value={form.maxPayloadTon}
                  onChange={(e) => handlePayloadChange(e.target.value)}
                  style={{ fontWeight: 700, color: "#ea580c" }}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phân Loại Tải Trọng</label>
                <select
                  className="form-select"
                  value={form.weightCategory}
                  onChange={(e) => setForm({ ...form, weightCategory: e.target.value })}
                >
                  <option value="Tải nhẹ (1.5 - 3.5 tấn)">🚚 Tải nhẹ (1.5 - 3.5 tấn)</option>
                  <option value="Tải trung (5 - 8 tấn)">🚛 Tải trung (5 - 8 tấn)</option>
                  <option value="Tải nặng / Container (15 - 30 tấn)">🚜 Tải nặng / Container (15 - 30 tấn)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nhiên Liệu Khởi Tạo (Lít)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  max="500"
                  value={form.fuelLiters}
                  onChange={(e) => setForm({ ...form, fuelLiters: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Bãi Xe Trực Thuộc</label>
                <select
                  className="form-select"
                  value={form.depotId}
                  onChange={(e) => setForm({ ...form, depotId: e.target.value })}
                >
                  {depots.map(d => (
                    <option key={d._id} value={d._id}>[{d.code}] {d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Trạng Thái Xe</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Sẵn sàng">🟢 Sẵn sàng</option>
                  <option value="Đang vận hành">🔵 Đang vận hành</option>
                  <option value="Đang bảo trì">🟠 Đang bảo trì</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ background: "#f97316", border: "none" }}>
              {loading ? "Đang lưu..." : "Lưu Thông Tin Xe Tải"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Modal Xem chi tiết xe tải ---
const VehicleDetailModal = ({ isOpen, onClose, vehicle, onEdit }) => {
  if (!isOpen || !vehicle) return null;
  const payload = vehicle.maxPayloadTon || (vehicle.weightCategory?.includes("3.5") ? 3.5 : 8.0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <h3>🚛 Chi Tiết Xe Tải: <span style={{ color: "#ea580c" }}>{vehicle.licensePlate}</span></h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div style={{ background: "#fff7ed", padding: 14, borderRadius: 8, border: "1px solid #fed7aa" }}>
              <div style={{ fontSize: 12, color: "#9a3412", fontWeight: 600 }}>Biển Số Xe</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#ea580c" }}>{vehicle.licensePlate}</div>
            </div>
            <div style={{ background: "#eff6ff", padding: 14, borderRadius: 8, border: "1px solid #bfdbfe" }}>
              <div style={{ fontSize: 12, color: "#1e40af", fontWeight: 600 }}>Mã Vạch Barcode</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#2563eb" }}>{vehicle.barcode || "N/A"}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, fontSize: 14, color: "#334155" }}>
            <div style={{ padding: "10px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Hãng sản xuất</span>
              <strong style={{ fontSize: 15, color: "#0f172a" }}>{vehicle.brand || "N/A"}</strong>
            </div>

            <div style={{ padding: "10px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Dòng xe (Model)</span>
              <strong style={{ fontSize: 15, color: "#0f172a" }}>{vehicle.model || "N/A"}</strong>
            </div>

            <div style={{ padding: "10px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Năm sản xuất</span>
              <strong style={{ fontSize: 15, color: "#0f172a" }}>{vehicle.year || 2024}</strong>
            </div>

            <div style={{ padding: "10px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Tải trọng tối đa</span>
              <strong style={{ fontSize: 15, color: "#ea580c" }}>📦 {payload} Tấn</strong>
            </div>

            <div style={{ padding: "10px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Phân loại tải trọng</span>
              <strong style={{ fontSize: 14, color: "#334155" }}>{vehicle.weightCategory || "Tải trung (5 - 8 tấn)"}</strong>
            </div>

            <div style={{ padding: "10px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Nhiên liệu hiện tại</span>
              <strong style={{ fontSize: 15, color: "#ea580c" }}>⛽ {vehicle.fuelLiters || vehicle.fuelLevel || 70} Lít</strong>
            </div>

            <div style={{ padding: "10px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", gridColumn: "span 2" }}>
              <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Bãi xe trực thuộc</span>
              <strong style={{ fontSize: 15, color: "#0f172a" }}>🏢 {vehicle.depot?.name || "Bãi xe Futa Express"}</strong>
            </div>

            <div style={{ padding: "10px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", gridColumn: "span 2" }}>
              <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Trạng thái vận hành</span>
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                {vehicle.status === "Sẵn sàng" || vehicle.status === "active" ? "🟢 Sẵn sàng hoạt động" : vehicle.status === "Đang vận hành" ? "🔵 Đang chở hàng vận hành" : "🟠 Đang sửa chữa / bảo trì"}
              </span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Đóng
          </button>
          <button
            className="btn-primary"
            style={{ background: "#f97316", border: "none" }}
            onClick={() => {
              onClose();
              onEdit(vehicle);
            }}
          >
            ✏️ Chỉnh Sửa Thông Tin
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Xóa xe ---
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, vehicle, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: "400px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Xác nhận xóa xe tải</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p>
            Bạn có chắc muốn xóa xe tải <b>{vehicle?.licensePlate}</b> [{vehicle?.barcode}] khỏi hệ thống?
          </p>
          <p style={{ fontSize: "13px", color: "#dc2626" }}>
            Hành động này không thể hoàn tác.
          </p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="btn-primary"
            style={{ backgroundColor: "#dc2626" }}
            disabled={loading}
          >
            {loading ? "Đang xóa..." : "Xóa Vĩnh Viễn"}
          </button>
        </div>
      </div>
    </div>
  );
};

// =================== MAIN COMPONENT ===================
const Vehicle = ({ onViewOnMap }) => {
  const [vehicles, setVehicles] = useState([]);
  const [depots, setDepots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const mockDepots = [
    { _id: "dep-1", code: "HCM", name: "Bãi Xe TP.HCM", city: "TP.HCM" },
    { _id: "dep-2", code: "HN", name: "Bãi Xe Hà Nội", city: "Hà Nội" },
    { _id: "dep-3", code: "DN", name: "Bãi Xe Đà Nẵng", city: "Đà Nẵng" },
    { _id: "dep-4", code: "HP", name: "Bãi Xe Hải Phòng", city: "Hải Phòng" },
    { _id: "dep-5", code: "CT", name: "Bãi Xe Cần Thơ", city: "Cần Thơ" }
  ];

  const mockVehicles = [
    { _id: "v-1", licensePlate: "51C-888.99", barcode: "FUTA-TRK-001", brand: "Hino", model: "8T", year: 2024, maxPayloadTon: 8.0, weightCategory: "Tải trung (5 - 8 tấn)", status: "Sẵn sàng", fuelLiters: 85, depot: { name: "Bãi Xe TP.HCM" } },
    { _id: "v-2", licensePlate: "51C-999.00", barcode: "FUTA-TRK-005", brand: "Isuzu", model: "15T", year: 2025, maxPayloadTon: 15.0, weightCategory: "Tải nặng / Container (15 - 30 tấn)", status: "Sẵn sàng", fuelLiters: 120, depot: { name: "Bãi Xe TP.HCM" } },
    { _id: "v-3", licensePlate: "51D-123.45", barcode: "FUTA-TRK-003", brand: "Hyundai", model: "3.5T", year: 2023, maxPayloadTon: 3.5, weightCategory: "Tải nhẹ (1.5 - 3.5 tấn)", status: "Sẵn sàng", fuelLiters: 65, depot: { name: "Bãi Xe Cần Thơ" } },
    { _id: "v-4", licensePlate: "29H-777.88", barcode: "FUTA-TRK-008", brand: "Chenglong", model: "20T", year: 2025, maxPayloadTon: 20.0, weightCategory: "Tải nặng / Container (15 - 30 tấn)", status: "Sẵn sàng", fuelLiters: 180, depot: { name: "Bãi Xe Hà Nội" } }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [vehRes, depRes] = await Promise.all([
        vehicleApi.getAll().catch(() => ({ data: { data: [] } })),
        depotApi.getAllDepots().catch(() => ({ data: { data: [] } }))
      ]);

      if (depRes.data?.data && depRes.data.data.length > 0) setDepots(depRes.data.data);
      else setDepots(mockDepots);

      if (vehRes.data?.data && vehRes.data.data.length > 0) setVehicles(vehRes.data.data);
      else setVehicles(mockVehicles);
    } catch (err) {
      setDepots(mockDepots);
      setVehicles(mockVehicles);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVehicle) return;
    setIsDeleting(true);
    try {
      await vehicleApi.delete(selectedVehicle._id);
      setVehicles((prev) => prev.filter((v) => v._id !== selectedVehicle._id));
      setIsDeleteOpen(false);
    } catch (err) {
      setVehicles((prev) => prev.filter((v) => v._id !== selectedVehicle._id));
      setIsDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredVehicles = vehicles.filter(v =>
    v.licensePlate?.toLowerCase().includes(search.toLowerCase()) ||
    v.barcode?.toLowerCase().includes(search.toLowerCase()) ||
    v.brand?.toLowerCase().includes(search.toLowerCase()) ||
    v.weightCategory?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="vehicle-page">
      <VehicleFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingVehicle(null);
        }}
        vehicle={editingVehicle}
        depots={depots}
        onSave={(data) => {
          if (editingVehicle) {
            setVehicles((prev) => prev.map((v) => (v._id === data._id ? data : v)));
          } else {
            setVehicles((prev) => [data, ...prev]);
          }
        }}
      />

      <VehicleDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        vehicle={selectedVehicle}
        onEdit={(v) => {
          setEditingVehicle(v);
          setIsFormOpen(true);
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        vehicle={selectedVehicle}
        loading={isDeleting}
      />

      {/* Page Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#0f172a" }}>🚚 Quản Lý Đội Xe Tải Futa Express</h2>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 4, margin: 0 }}>
            Danh sách đơn giản phương tiện. Nhấn "Xem thêm" để xem chi tiết đầy đủ thông tin từng xe.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setIsFormOpen(true)} style={{ background: "#f97316", border: "none", padding: "10px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
          ➕ Thêm Xe Tải Mới
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ background: "#ffffff", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 20 }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo Biển số xe, Mã vạch Barcode, Hãng xe, Phân loại tải trọng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14 }}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="vehicle-table-card" style={{ background: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 13, color: "#64748b", textTransform: "uppercase" }}>
                <th style={{ padding: "12px 16px" }}>Biển Số & Barcode</th>
                <th style={{ padding: "12px 16px" }}>Hãng & Dòng Xe</th>
                <th style={{ padding: "12px 16px" }}>Tải Trọng</th>
                <th style={{ padding: "12px 16px" }}>Trạng Thái</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "30px 16px", color: "#94a3b8" }}>
                    📭 Không tìm thấy phương tiện nào.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => {
                  const payload = vehicle.maxPayloadTon || (vehicle.weightCategory?.includes("3.5") ? 3.5 : 8.0);
                  return (
                    <tr key={vehicle._id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: 14 }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 800, color: "#ea580c" }}>{vehicle.licensePlate}</div>
                        <div style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>{vehicle.barcode || "N/A"}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{vehicle.brand} {vehicle.model}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>Năm SX: {vehicle.year || 2024}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                          📦 {payload} Tấn
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>
                          {vehicle.status === "Sẵn sàng" || vehicle.status === "active" ? "🟢 Sẵn sàng" : vehicle.status === "Đang vận hành" ? "🔵 Đang vận hành" : "🟠 Đang bảo trì"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
                          <button
                            style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setIsDetailOpen(true);
                            }}
                          >
                            👁️ Xem thêm
                          </button>
                          <button
                            className="icon-btn"
                            title="Sửa"
                            style={{ width: 34, height: 34 }}
                            onClick={() => {
                              setEditingVehicle(vehicle);
                              setIsFormOpen(true);
                            }}
                          >
                            ✎
                          </button>
                          <button
                            className="icon-btn delete"
                            title="Xóa"
                            style={{ width: 34, height: 34 }}
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setIsDeleteOpen(true);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Vehicle;
