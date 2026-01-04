import React, { useState, useEffect } from 'react';
import './OperationMap.css';
import bookingApi from '../../api/bookingApi';
import vehicleApi from '../../api/vehicleApi';
import driverApi from '../../api/driverApi';
import customerApi from '../../api/customerApi';
import { 
  FaPlus, FaMinus, FaSyncAlt, FaMapMarkerAlt, FaUser, FaPhone 
} from 'react-icons/fa'; // Import thêm icon

const OperationMap = ({
  vehicles: initialVehicles = [],
  setVehicles: setVehiclesProp,
  drivers: initialDrivers = [],
  customers: initialCustomers = [],
  reports: initialReports = [],
  setReports: setReportsProp,
}) => {
  // ... (Giữ nguyên phần state và useEffect load data như cũ) ...
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [customers, setCustomers] = useState(initialCustomers);
  const [bookings, setBookings] = useState(initialReports);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    from: "",
    to: "",
    type: "Chở khách",
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
      setError(null);
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
        if (mounted) setError("Không thể tải dữ liệu.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // ... (Giữ nguyên handleCreateTrip và handleAssignBooking như cũ) ...
  const handleCreateTrip = async () => {
    // ... logic tạo chuyến cũ của bạn ...
    if (!form.customerName.trim()) { alert("Vui lòng nhập tên khách hàng"); return; }
    if (!form.customerPhone.trim()) { alert("Vui lòng nhập số điện thoại"); return; }
    if (!form.from.trim()) { alert("Vui lòng nhập điểm đi"); return; }
    if (!form.to.trim()) { alert("Vui lòng nhập điểm đến"); return; }
    if (!form.driver) { alert("⚠️ Vui lòng chọn tài xế (bắt buộc)"); return; }
    if (!form.vehicle) { alert("⚠️ Vui lòng chọn xe (bắt buộc)"); return; }

    const tripCode = `TRIP-${Date.now()}`;
    const basePayload = {
      tripCode,
      startLocation: form.from.trim(),
      endLocation: form.to.trim(),
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      status: "ongoing",
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
      setForm({ ...form, customerName: "", customerPhone: "", from: "", to: "", price: "", pickupTime: "", driver: "", vehicle: "" });
      alert("Tạo chuyến thành công!");
    } catch (err) {
      alert("Tạo chuyến thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBooking = async (bookingId) => {
    if (!bookingId) return;
    const vehicleId = prompt("Nhập ID xe để gán:");
    if (!vehicleId?.trim()) return;
    try {
        setLoading(true);
        const res = await bookingApi.assignDriver(bookingId, { vehicleId: vehicleId.trim() });
        const updated = res?.data?.data ?? res?.data ?? res;
        setBookings(prev => prev.map(b => (b._id === bookingId || b.id === bookingId) ? { ...b, ...updated, status: 'assigned' } : b));
        alert("Gán xe thành công!");
    } catch(err) {
        alert("Gán xe thất bại");
    } finally {
        setLoading(false);
    }
  };


  const pendingBookings = bookings.filter(b => {
    const status = b.status?.toLowerCase() || "pending";
    return ["pending", "waiting", "created", "unassigned"].includes(status);
  });

  return (
    <div className="dashboard-container">
      <main className="main-content">
        <div className="grid-container">
          
          {/* CỘT 1: TẠO CHUYẾN ĐI MỚI */}
          <div className="card">
            <div className="card-header">
              <h3>Tạo Chuyến đi</h3>
              <a href="#" className="link-action" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>
                <FaSyncAlt /> Làm mới
              </a>
            </div>
            <div className="card-body">
              <form className="trip-form" onSubmit={(e) => { e.preventDefault(); handleCreateTrip(); }}>
                
                <div style={{display:'flex', gap:'10px'}}>
                    <div style={{flex:1}}>
                        <input className="form-input" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} placeholder="Tên khách hàng *" required />
                    </div>
                    <div style={{flex:1}}>
                        <input className="form-input" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} placeholder="SĐT *" required />
                    </div>
                </div>

                <div style={{position:'relative'}}>
                    <FaMapMarkerAlt style={{position:'absolute', top:'12px', left:'10px', color:'#2563eb'}} />
                    <input className="form-input" style={{paddingLeft:'30px'}} value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} placeholder="Điểm đón khách *" required />
                </div>
                
                <div style={{position:'relative'}}>
                    <FaMapMarkerAlt style={{position:'absolute', top:'12px', left:'10px', color:'#ef4444'}} />
                    <input className="form-input" style={{paddingLeft:'30px'}} value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} placeholder="Điểm trả khách *" required />
                </div>

                <div style={{display:'flex', gap:'10px'}}>
                    <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                        <option value="Chở khách">Chở khách</option>
                        <option value="Giao hàng">Giao hàng</option>
                    </select>
                    <input className="form-input" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Cước (VNĐ)" />
                </div>

                <div className="form-group-label">Thời gian đón</div>
                <input className="form-input" type="datetime-local" value={form.pickupTime} onChange={e => setForm({ ...form, pickupTime: e.target.value })} />

                <div className="form-group-label">Điều phối ngay (Bắt buộc)</div>
                <select className="form-select" value={form.driver} onChange={e => setForm({ ...form, driver: e.target.value })} required>
                  <option value="">-- Chọn tài xế --</option>
                  {drivers.map(d => <option key={d.id || d._id} value={d.id || d._id}>{d.fullName || d.name || d.phone}</option>)}
                </select>

                <select className="form-select" value={form.vehicle} onChange={e => setForm({ ...form, vehicle: e.target.value })} required>
                  <option value="">-- Chọn xe --</option>
                  {vehicles.map(v => <option key={v.id || v._id} value={v.id || v._id}>{v.plateNumber || v.licensePlate}</option>)}
                </select>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Đang xử lý..." : "Tạo Lệnh Điều Phối"}
                </button>
              </form>
            </div>
          </div>

          {/* CỘT 2: DANH SÁCH CHỜ GÁN */}
          <div className="card">
            <div className="card-header">
              <h3>Hàng chờ ({pendingBookings.length})</h3>
            </div>
            <div className="card-body">
              <div className="info-section">
                {pendingBookings.length === 0 ? (
                  <div className="empty-state">
                    <p>Hiện không có chuyến nào đang chờ.</p>
                  </div>
                ) : (
                  <div className="pending-list">
                    {pendingBookings.map((b) => {
                      const bookingId = b.id || b._id;
                      return (
                        <div key={bookingId} className="pending-item">
                          <div className="customer-info">
                            <strong>{b.customerName || "Khách vãng lai"}</strong>
                            <div className="route-info">
                              <span>📍 Đón: {b.pickup || b.from || b.startLocation}</span>
                              <span>🚩 Trả: {b.dropoff || b.to || b.endLocation}</span>
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

          {/* CỘT 3: BẢN ĐỒ & XE */}
          <div className="card">
            <div className="card-header">
              <h3>Bản đồ & Xe ({vehicles.length})</h3>
            </div>
            <div className="card-body">
              <div className="map-preview">
                <div className="map-overlay-text">Live Map View</div>
              </div>

              <div className="list-section">
                <h4>Trạng thái đội xe</h4>
                {vehicles.length === 0 ? (
                  <div className="empty-state">
                    <p>Chưa có dữ liệu xe.</p>
                  </div>
                ) : (
                  <ul className="vehicle-list-ul">
                    {vehicles.map((v) => {
                      const vehicleId = v.id || v._id;
                      const status = v.status || "available";
                      let statusClass = "offline";
                      if(status === 'active') statusClass = "active";
                      if(status === 'maintenance') statusClass = "maintenance";
                      if(status === 'rented') statusClass = "rented";

                      return (
                        <li key={vehicleId} className="vehicle-item-li">
                          <div>
                            <span className={`status-dot ${statusClass}`}></span>
                            <span className="vehicle-name">{v.plateNumber || v.licensePlate}</span>
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