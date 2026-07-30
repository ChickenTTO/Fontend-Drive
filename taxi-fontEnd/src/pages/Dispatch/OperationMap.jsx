import React, { useState, useEffect } from 'react';
import './OperationMap.css';
import bookingApi from '../../api/bookingApi';
import vehicleApi from '../../api/vehicleApi';
import driverApi from '../../api/driverApi';
import customerApi from '../../api/customerApi';
import DepotList from '../Vehicles/DepotList';
import { 
  FaSyncAlt, FaMapMarkerAlt, FaBuilding 
} from 'react-icons/fa';

const FUTA_DEPOTS = [
  "Bãi xe Hà Nội (Bến xe Nước Ngầm, Hoàng Mai)",
  "Bãi xe Hải Phòng (KCN Đình Vũ, Hải An)",
  "Bãi xe Đà Nẵng (Cảng Tiên Sa, Sơn Trà)",
  "Bãi xe TP.Hồ Chí Minh (Bến xe Miền Đông mới, TP. Thủ Đức)",
  "Bãi xe Cần Thơ (KCN Trà Nóc, Bình Thủy)"
];

const OperationMap = ({
  vehicles: initialVehicles = [],
  setVehicles: setVehiclesProp,
  drivers: initialDrivers = [],
  customers: initialCustomers = [],
  reports: initialReports = [],
  setReports: setReportsProp,
}) => {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [customers, setCustomers] = useState(initialCustomers);
  const [bookings, setBookings] = useState(initialReports);
  const [loading, setLoading] = useState(false);
  const [showDepotModal, setShowDepotModal] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    from: "Bãi xe TP.Hồ Chí Minh (Bến xe Miền Đông mới, TP. Thủ Đức)",
    to: "",
    cargoType: "Hàng bưu chính & Tiêu dùng",
    cargoWeightTon: 3.5,
    price: "",
    pickupTime: "",
    driver: "",
    vehicle: "",
  });

  const parseResponseArray = (res) => {
    if (!res) return [];
    const data = res.data ?? res;
    if (Array.isArray(data)) return data;
    if (data.items && Array.isArray(data.items)) return data.items;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) return [data];
    return [];
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [vehRes, drvRes, custRes, bkRes] = await Promise.all([
          vehicleApi.getAll().catch(() => ({ data: [] })),
          driverApi.getAll().catch(() => ({ data: [] })),
          customerApi.getAll().catch(() => ({ data: [] })),
          bookingApi.getAll().catch(() => ({ data: [] })),
        ]);
        if (!mounted) return;
        setVehicles(parseResponseArray(vehRes));
        setDrivers(parseResponseArray(drvRes));
        setCustomers(parseResponseArray(custRes));
        setBookings(parseResponseArray(bkRes));
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleCreateTrip = async () => {
    if (!form.customerName.trim()) { alert("Vui lòng nhập tên người/đơn vị gửi hàng"); return; }
    if (!form.customerPhone.trim()) { alert("Vui lòng nhập số điện thoại liên hệ"); return; }
    if (!form.from.trim()) { alert("Vui lòng nhập bãi đi / điểm nhận hàng"); return; }
    if (!form.to.trim()) { alert("Vui lòng nhập điểm giao hàng / điểm đến"); return; }
    if (!form.driver) { alert("⚠️ Vui lòng chọn tài xế (bắt buộc)"); return; }
    if (!form.vehicle) { alert("⚠️ Vui lòng chọn xe tải (bắt buộc)"); return; }

    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const tripCode = `FUTA-${dateStr}-${randomNum}`;

    const basePayload = {
      tripCode,
      cargoType: form.cargoType,
      cargoWeightTon: Number(form.cargoWeightTon) || 1.0,
      startLocation: form.from.trim(),
      endLocation: form.to.trim(),
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      status: "Đang chờ",
      driver: form.driver,
      vehicle: form.vehicle,
    };

    if (form.price) basePayload.fare = Number(form.price);
    if (form.pickupTime) basePayload.startTime = new Date(form.pickupTime).toISOString();

    try {
      setLoading(true);
      const res = await bookingApi.create(basePayload);
      const created = res?.data?.data ?? res?.data ?? res;
      setBookings(prev => [created, ...prev]);
      setForm({
        ...form,
        customerName: "",
        customerPhone: "",
        from: "Bãi xe TP.Hồ Chí Minh (Bến xe Miền Đông mới, TP. Thủ Đức)",
        to: "",
        price: "",
        pickupTime: "",
        driver: "",
        vehicle: ""
      });
      alert("🚀 Tạo chuyến xe tải Futa Express thành công!");
    } catch (err) {
      alert("Tạo chuyến thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBooking = async (bookingId) => {
    if (!bookingId) return;
    const inputVal = prompt("Nhập Biển số xe tải (VD: 65C-2608) hoặc Mã vạch Barcode (VD: FUTA-TRK-001) để gán:");
    if (!inputVal?.trim()) return;
    try {
        setLoading(true);
        const res = await bookingApi.assignDriver(bookingId, { vehicleId: inputVal.trim() });
        if (res?.data?.success || res?.status === 200) {
          alert(`✅ Gán xe ${inputVal} cho chuyến xe thành công!`);
          const bkRes = await bookingApi.getAll();
          setBookings(parseResponseArray(bkRes));
        }
    } catch(err) {
        alert("Gán xe thất bại: " + (err.response?.data?.message || err.message));
    } finally {
        setLoading(false);
    }
  };

  const pendingBookings = bookings.filter(b => {
    const status = b.status?.toLowerCase() || "pending";
    return ["pending", "waiting", "created", "unassigned", "đang chờ"].includes(status);
  });

  return (
    <div className="dashboard-container" style={{ width: "100%", height: "100%" }}>
      <main className="main-content" style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16, height: "100%", overflowY: "auto" }}>
        
        {/* Top Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '12px 18px', borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a' }}>🗺️ Bản đồ Vận hành & Điều phối Vận tải</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0, marginTop: 2 }}>Điều động xe tải giữa 05 bãi xe trọng điểm Futa Express trên toàn quốc</p>
          </div>
          <button
            onClick={() => setShowDepotModal(!showDepotModal)}
            style={{
              padding: '8px 14px',
              background: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              borderRadius: 6,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <FaBuilding /> {showDepotModal ? "Ẩn Bãi Xe" : "🏢 Xem 05 Bãi Xe Futa"}
          </button>
        </div>

        {showDepotModal && (
          <div style={{ background: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #cbd5e1' }}>
            <DepotList />
          </div>
        )}

        {/* 3-Column Layout */}
        <div className="grid-container" style={{ flex: 1 }}>
          
          {/* CỘT 1: TẠO CHUYẾN ĐI VẬN TẢI FUTA */}
          <div className="card">
            <div className="card-header">
              <h3>📦 Điều Động Chuyến Xe Tải Futa Express</h3>
              <a href="#" className="link-action" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>
                <FaSyncAlt /> Làm mới
              </a>
            </div>
            <div className="card-body">
              <form className="trip-form" onSubmit={(e) => { e.preventDefault(); handleCreateTrip(); }}>
                
                <div style={{display:'flex', gap:'10px'}}>
                    <div style={{flex:1}}>
                        <input className="form-input" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} placeholder="Người gửi hàng / Đối tác *" required />
                    </div>
                    <div style={{flex:1}}>
                        <input className="form-input" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} placeholder="SĐT người gửi *" required />
                    </div>
                </div>

                {/* Điểm xuất phát (Có gợi ý 05 Bãi xe Futa) */}
                <div style={{position:'relative'}}>
                    <FaMapMarkerAlt style={{position:'absolute', top:'12px', left:'10px', color:'#2563eb'}} />
                    <input 
                      className="form-input" 
                      style={{paddingLeft:'30px'}} 
                      list="depot-list-from"
                      value={form.from} 
                      onChange={e => setForm({ ...form, from: e.target.value })} 
                      placeholder="Gõ hoặc chọn Bãi xe xuất phát *" 
                      required 
                    />
                    <datalist id="depot-list-from">
                      {FUTA_DEPOTS.map((d, idx) => <option key={idx} value={d} />)}
                    </datalist>
                </div>
                
                {/* Điểm kết thúc (Tự do nhập địa chỉ bất kỳ) */}
                <div style={{position:'relative'}}>
                    <FaMapMarkerAlt style={{position:'absolute', top:'12px', left:'10px', color:'#ef4444'}} />
                    <input 
                      className="form-input" 
                      style={{paddingLeft:'30px'}} 
                      value={form.to} 
                      onChange={e => setForm({ ...form, to: e.target.value })} 
                      placeholder="Nhập địa điểm giao hàng / điểm đến *" 
                      required 
                    />
                </div>

                <div style={{display:'flex', gap:'10px'}}>
                    <select className="form-select" style={{flex: 1.5}} value={form.cargoType} onChange={e => setForm({ ...form, cargoType: e.target.value })}>
                        <option value="Hàng bưu chính & Tiêu dùng">📦 Hàng bưu chính & Tiêu dùng</option>
                        <option value="Linh kiện điện tử & Công nghệ">⚡ Linh kiện điện tử & Công nghệ</option>
                        <option value="Hàng nông sản & Thực phẩm">🌾 Hàng nông sản & Thực phẩm</option>
                        <option value="Vận chuyển Container & Hàng nặng">🚛 Vận chuyển Container / Hàng nặng</option>
                    </select>
                    <input className="form-input" style={{flex: 1}} type="number" step="0.5" value={form.cargoWeightTon} onChange={e => setForm({ ...form, cargoWeightTon: e.target.value })} placeholder="Khối lượng (Tấn)" />
                </div>

                <div>
                  <div className="form-group-label" style={{marginBottom: 4}}>Thời gian xuất bến</div>
                  <input className="form-input" type="datetime-local" value={form.pickupTime} onChange={e => setForm({ ...form, pickupTime: e.target.value })} />
                </div>

                <div>
                  <div className="form-group-label" style={{marginBottom: 4}}>Cước phí vận tải (VNĐ)</div>
                  <input 
                    className="form-input" 
                    type="number" 
                    style={{ width: '100%', fontSize: '14px', fontWeight: 600, color: '#15803d' }}
                    value={form.price} 
                    onChange={e => setForm({ ...form, price: e.target.value })} 
                    placeholder="Nhập cước phí (VNĐ) - Ví dụ: 15000000" 
                  />
                </div>

                <div className="form-group-label">Điều phối ngay (Bắt buộc)</div>
                <select className="form-select" value={form.driver} onChange={e => setForm({ ...form, driver: e.target.value })} required>
                  <option value="">-- Chọn tài xế --</option>
                  {drivers.map(d => <option key={d.id || d._id} value={d.id || d._id}>{d.fullName || d.name || d.phone}</option>)}
                </select>

                <select className="form-select" value={form.vehicle} onChange={e => setForm({ ...form, vehicle: e.target.value })} required>
                  <option value="">-- Chọn xe tải (Biển số / Barcode) --</option>
                  {vehicles.map(v => (
                    <option key={v.id || v._id} value={v.id || v._id}>
                      {v.plateNumber || v.licensePlate} {v.barcode ? `| Barcode: ${v.barcode}` : ''} {v.weightCategory ? `(${v.weightCategory})` : ''}
                    </option>
                  ))}
                </select>

                <button type="submit" className="btn-primary" disabled={loading} style={{ background: '#f97316', borderColor: '#ea580c' }}>
                  {loading ? "Đang xử lý..." : "🚀 Tạo Lệnh Điều Phối Vận Tải"}
                </button>
              </form>
            </div>
          </div>

          {/* CỘT 2: DANH SÁCH CHỜ GÁN */}
          <div className="card">
            <div className="card-header">
              <h3>Hàng chờ vận chuyển ({pendingBookings.length})</h3>
            </div>
            <div className="card-body">
              <div className="info-section">
                {pendingBookings.length === 0 ? (
                  <div className="empty-state">
                    <p>Hiện không có chuyến xe nào đang chờ.</p>
                  </div>
                ) : (
                  <div className="pending-list">
                    {pendingBookings.map((b) => {
                      const bookingId = b.id || b._id;
                      return (
                        <div key={bookingId} className="pending-item">
                          <div className="customer-info">
                            <strong>{b.customerName || "Đơn hàng Futa Express"} ({b.cargoType || 'Hàng hóa'})</strong>
                            <div className="route-info">
                              <span>📍 Bãi đi: {b.pickup || b.from || b.startLocation}</span>
                              <span>🚩 Bãi đến: {b.dropoff || b.to || b.endLocation}</span>
                            </div>
                          </div>
                          <button 
                            className="btn-assign"
                            onClick={() => handleAssignBooking(bookingId)}
                            disabled={loading}
                          >
                            Gán xe thủ công
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CỘT 3: BẢN ĐỒ & XE TẢI */}
          <div className="card">
            <div className="card-header">
              <h3>Bản đồ & Xe Tải ({vehicles.length})</h3>
            </div>
            <div className="card-body">
              <div className="map-preview">
                <div className="map-overlay-text">Live Map View - Futa Fleet</div>
              </div>

              <div className="list-section">
                <h4>Trạng thái đội xe tải (50-60 xe)</h4>
                {vehicles.length === 0 ? (
                  <div className="empty-state">
                    <p>Chưa có dữ liệu xe tải.</p>
                  </div>
                ) : (
                  <ul className="vehicle-list-ul">
                    {vehicles.map((v) => {
                      const vehicleId = v.id || v._id;
                      const status = v.status || "Sẵn sàng";
                      let statusClass = "offline";
                      if(status === 'active' || status === 'Sẵn sàng') statusClass = "active";
                      if(status === 'maintenance' || status === 'Đang bảo trì') statusClass = "maintenance";
                      if(status === 'rented' || status === 'Đang vận hành') statusClass = "rented";

                      return (
                        <li key={vehicleId} className="vehicle-item-li">
                          <div>
                            <span className={`status-dot ${statusClass}`}></span>
                            <span className="vehicle-name">{v.plateNumber || v.licensePlate}</span>
                            {v.barcode && <span style={{ fontSize: 11, color: '#f97316', marginLeft: 6 }}>[{v.barcode}]</span>}
                          </div>
                          <span className="status-text">{status}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default OperationMap;