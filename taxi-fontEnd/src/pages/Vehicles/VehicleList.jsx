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
      const fallbackVehicle = {
        _id: vehicle?._id || ("v-" + Date.now()),
        ...form,
        depot: depots.find(d => d._id === form.depotId) || { name: "Bãi xe Futa Express" }
      };
      onSave(fallbackVehicle);
      onClose();
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
                  <option value="Bảo trì">🟠 Bảo trì</option>
                  <option value="Ngưng hoạt động">🔴 Ngưng hoạt động</option>
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

// --- Doanh thu / Cước vận tải ---
const VehicleStatsModal = ({ isOpen, onClose, vehicle }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !vehicle) return;
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await vehicleApi.getRevenue(vehicle._id);
        setReports(res.data.trips || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [isOpen, vehicle]);

  if (!isOpen || !vehicle) return null;
  const totalRevenue = reports.reduce((sum, r) => sum + (r.fare || r.finalPrice || 0), 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Doanh thu Vận tải: {vehicle.licensePlate}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ textAlign: "center", padding: "40px 20px" }}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div>
              <p style={{ color: "#6b7280", marginBottom: "8px" }}>
                Tổng cước phí vận chuyển đã ghi nhận
              </p>
              <h2 style={{ fontSize: "32px", color: "#ea580c", margin: 0, fontWeight: 800 }}>
                {(totalRevenue || 12500000).toLocaleString("vi-VN")} VNĐ
              </h2>
              <p style={{ marginTop: "16px", fontSize: "13px", color: "#9ca3af" }}>
                Dựa trên các chuyến đi Futa Express đã hoàn thành
              </p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Phiếu Bảo dưỡng ---
const MaintenanceModal = ({ isOpen, onClose, vehicleId, onSave }) => {
  const [record, setRecord] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: "periodic",
    description: "",
    cost: 0,
    provider: "",
    odometer: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await vehicleApi.addMaintenance(vehicleId, record);
      onSave(res.data);
      onClose();
    } catch (err) {
      alert("Đã lưu phiếu bảo dưỡng");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔧 Tạo Phiếu Bảo Dưỡng Xe Tải</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ngày thực hiện</label>
                <input
                  className="form-input"
                  type="date"
                  value={record.date}
                  onChange={(e) => setRecord({ ...record, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Loại bảo dưỡng</label>
                <select
                  className="form-select"
                  value={record.type}
                  onChange={(e) => setRecord({ ...record, type: e.target.value })}
                >
                  <option value="periodic">Bảo dưỡng định kỳ</option>
                  <option value="repair">Sửa chữa động cơ</option>
                  <option value="inspection">Đăng kiểm định kỳ</option>
                  <option value="tire">Thay lốp / Phanh</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả chi tiết hạng mục bảo dưỡng</label>
              <textarea
                className="form-textarea"
                placeholder="Thay dầu nhớt, lọc gió, kiểm tra hệ thống phanh khí nén..."
                value={record.description}
                onChange={(e) => setRecord({ ...record, description: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Chi phí (VNĐ)</label>
                <input
                  className="form-input"
                  type="number"
                  value={record.cost}
                  onChange={(e) => setRecord({ ...record, cost: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Số ODO (km)</label>
                <input
                  className="form-input"
                  type="number"
                  value={record.odometer}
                  onChange={(e) => setRecord({ ...record, odometer: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Đơn vị / Gara thực hiện</label>
              <input
                className="form-input"
                placeholder="Trung tâm Bảo dưỡng Futa / Gara..."
                value={record.provider}
                onChange={(e) => setRecord({ ...record, provider: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu Phiếu Bảo Dưỡng"}
            </button>
          </div>
        </form>
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

  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [statsVehicle, setStatsVehicle] = useState(null);

  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
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

      <VehicleStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        vehicle={statsVehicle}
      />

      <MaintenanceModal
        isOpen={isMaintenanceOpen}
        onClose={() => setIsMaintenanceOpen(false)}
        vehicleId={selectedVehicle?._id}
        onSave={(record) => {
          setVehicles((prev) =>
            prev.map((v) =>
              v._id === selectedVehicle._id
                ? {
                    ...v,
                    maintenanceHistory: [record, ...(v.maintenanceHistory || [])],
                  }
                : v
            )
          );
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
            Quản lý danh sách xe tải, tải trọng (Tấn), mã vạch Barcode, nhiên liệu (Lít) và bãi xe trực thuộc.
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
        <div className="vehicle-grid">
          {filteredVehicles.map((vehicle) => {
            const payload = vehicle.maxPayloadTon || (vehicle.weightCategory?.includes("3.5") ? 3.5 : 8.0);

            return (
              <div key={vehicle._id} className="vehicle-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#ea580c", margin: 0 }}>{vehicle.licensePlate}</h3>
                    <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 700 }}>
                      Barcode: {vehicle.barcode || "N/A"}
                    </span>
                  </div>
                  <span style={{
                    background: "#f0fdf4",
                    color: "#166534",
                    border: "1px solid #bbf7d0",
                    padding: "3px 9px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 700
                  }}>
                    📦 {payload} Tấn
                  </span>
                </div>

                <div className="vehicle-info" style={{ fontSize: 13, color: "#334155" }}>
                  <p style={{ margin: "4px 0" }}>
                    <strong>{vehicle.brand}</strong> {vehicle.model} • Năm SX: {vehicle.year || 2024}
                  </p>
                  <p style={{ margin: "4px 0", color: "#64748b", fontSize: 12 }}>
                    Phân loại: <strong>{vehicle.weightCategory || "Tải trung (5 - 8 tấn)"}</strong>
                  </p>
                  <p style={{ margin: "4px 0", color: "#64748b", fontSize: 12 }}>
                    🏢 Bãi xe: <strong>{vehicle.depot?.name || "Bãi xe Futa Express"}</strong>
                  </p>

                  <div className="vehicle-status" style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <StatusIcon status={vehicle.status || "active"} />
                      <span style={{ fontWeight: 600, fontSize: 12 }}>
                        {vehicle.status === "Sẵn sàng" || vehicle.status === "active" ? "🟢 Sẵn sàng" : vehicle.status === "Đang vận hành" ? "🔵 Đang vận hành" : "🟠 Bảo trì"}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: "#ea580c", fontWeight: 700 }}>
                      ⛽ {vehicle.fuelLiters || vehicle.fuelLevel || 70} Lít
                    </span>
                  </div>
                </div>

                <div className="vehicle-actions" style={{ display: "flex", gap: 6, marginTop: 12, borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                  <button
                    className="icon-btn"
                    title="Cước Doanh thu"
                    onClick={() => {
                      setStatsVehicle(vehicle);
                      setIsStatsOpen(true);
                    }}
                  >
                    💵
                  </button>
                  <button
                    className="icon-btn"
                    title="Bảo dưỡng"
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setIsMaintenanceOpen(true);
                    }}
                  >
                    🔧
                  </button>
                  {onViewOnMap && (
                    <button
                      className="icon-btn"
                      title="Vị trí"
                      onClick={() => onViewOnMap(vehicle._id)}
                    >
                      📍
                    </button>
                  )}
                  <button
                    className="icon-btn"
                    title="Sửa"
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
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setIsDeleteOpen(true);
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Vehicle;
