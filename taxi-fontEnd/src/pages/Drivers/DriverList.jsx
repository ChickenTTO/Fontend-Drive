import React, { useState, useEffect, useCallback } from 'react';
import './DriverList.css';
import { StatusIcon, ArrowLeftIcon } from '../../components/icons';

const API_BASE = 'https://backend-drive-bgk5.onrender.com/api';

// ----------------- DRIVER DETAIL VIEW -----------------
const DriverDetailView = ({ driver, vehicles, trips, onBack }) => {
  const formatCurrency = val =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  const formatDate = isoStr => new Date(isoStr).toLocaleDateString('vi-VN');

  const driverTrips = Array.isArray(trips) ? trips.filter(t => t.driver === driver._id) : [];
  const completedTrips = driverTrips.filter(t => t.status === 'completed');
  const totalRevenue = completedTrips.reduce((sum, t) => sum + (t.fare || 0), 0);

  const getVehiclePlate = vehicleId => {
    const v = vehicles.find(veh => (veh._id || veh.id) === vehicleId);
    return v ? (v.plateNumber || v.licensePlate) : '---';
  };

  return (
    <div className="driver-page"> {/* Sử dụng chung wrapper để đồng bộ background */}
      <div className="detail-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={onBack} className="back-btn"><ArrowLeftIcon /></button>
          <div className="driver-profile">
            <h2 style={{margin: 0}}>{driver.fullName || driver.name || driver.username}</h2>
            <p style={{margin: '4px 0', color: '#6b7280'}}>SĐT: {driver.phone} {driver.email ? `• ${driver.email}` : ''}</p>
          </div>
        </div>
        <div className="driver-stats">
          <p style={{fontSize: '14px', color: '#6b7280'}}>Tổng doanh thu</p>
          <p style={{fontSize: '20px', fontWeight: 'bold', color: '#2563eb', margin: 0}}>{formatCurrency(totalRevenue)}</p>
          <small>{completedTrips.length} chuyến hoàn thành</small>
        </div>
      </div>

      <div className="detail-content">
        <h3 style={{marginTop:0}}>Lịch sử chuyến đi</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Mã chuyến</th>
                <th>Lộ trình</th>
                <th>Xe</th>
                <th>Cước</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {driverTrips.length > 0 ? driverTrips.map(trip => (
                <tr key={trip._id}>
                  <td>{formatDate(trip.startTime || trip.createdAt)}</td>
                  <td><span style={{fontFamily:'monospace', background:'#f3f4f6', padding:'2px 6px', borderRadius:'4px'}}>{trip.tripCode}</span></td>
                  <td>{trip.startLocation} → {trip.endLocation}</td>
                  <td>{getVehiclePlate(trip.vehicle)}</td>
                  <td>{formatCurrency(trip.fare || 0)}</td>
                  <td>{trip.status}</td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{textAlign:'center', padding: '30px', color: '#9ca3af'}}>Chưa có chuyến đi nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ----------------- MAIN DRIVER LIST -----------------
const DriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({});

  // ... (Giữ nguyên các hàm fetch data và logic xử lý API như cũ)
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) return {};
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      setError('Không tìm thấy Token. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    try {
      const [drvRes, vehRes, tripRes] = await Promise.all([
        fetch(`${API_BASE}/drivers`, { headers }).then(async r => {
          if (r.status === 401) throw new Error('Hết phiên đăng nhập');
          if (!r.ok) throw new Error('Lỗi tải Drivers ' + r.status);
          return r.json();
        }),
        fetch(`${API_BASE}/vehicles`, { headers }).then(r => r.ok ? r.json() : { data: [] }),
        fetch(`${API_BASE}/bookings`, { headers }).then(r => r.ok ? r.json() : { data: [] })
      ]);

      setDrivers(drvRes.data || []);
      setVehicles(vehRes.data || []);
      setTrips(tripRes.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setFormData({ fullName: '', phone: '', email: '' });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (driver, e) => {
    e.stopPropagation();
    setEditingDriver(driver);
    setFormData(driver);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa?')) return;
    try {
      setLoading(true);
      await fetch(`${API_BASE}/drivers/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      setDrivers(prev => prev.filter(d => d._id !== id));
      alert('Xóa thành công!');
    } catch (err) {
      alert('Xóa thất bại');
    } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.phone) return alert('Nhập họ tên và số điện thoại');
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const payload = { ...formData, username: formData.username || formData.phone };
      let res;
      if (editingDriver) {
        res = await fetch(`${API_BASE}/drivers/${editingDriver._id}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
      } else {
        res = await fetch(`${API_BASE}/drivers`, { method: 'POST', headers, body: JSON.stringify(payload) });
      }
      const data = await res.json();
      if (!res.ok) {
        alert('Thất bại: ' + (data.message || 'Lỗi Server'));
        return;
      }
      if (editingDriver) {
        setDrivers(prev => prev.map(d => d._id === editingDriver._id ? { ...d, ...payload } : d));
      } else {
        setDrivers(prev => [...prev, data.data || {}]);
      }
      setIsFormModalOpen(false);
    } catch (err) {
      alert('Thất bại: ' + err.message);
    } finally { setLoading(false); }
  };

  // ... (Kết thúc logic API)

  const filteredDrivers = drivers.filter(d =>
    (d.fullName || d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.phone || '').includes(searchTerm)
  );

  const selectedDriver = drivers.find(d => d._id === selectedDriverId);

  if (selectedDriver)
    return <DriverDetailView driver={selectedDriver} vehicles={vehicles} trips={trips} onBack={() => setSelectedDriverId(null)} />;

  return (
    <div className="driver-page">
      <div className="page-header">
        <h2>Quản lý Tài xế</h2>
        <button className="btn-primary" onClick={handleOpenAdd}>+ Thêm Tài xế</button>
      </div>

      <input 
        className="search-input" 
        type="text" 
        placeholder="Tìm kiếm theo tên hoặc SĐT..." 
        value={searchTerm} 
        onChange={e => setSearchTerm(e.target.value)} 
      />

      {loading && !drivers.length ? (
        <p style={{textAlign:'center', color:'#6b7280'}}>Đang tải dữ liệu...</p>
      ) : error ? (
        <div style={{textAlign:'center', color:'red'}}>{error} <button onClick={fetchData}>Thử lại</button></div>
      ) : (
        <div className="driver-grid">
          {filteredDrivers.map(driver => {
            const driverTrips = Array.isArray(trips) ? trips.filter(t => t.driver === driver._id) : [];
            const completedCount = driverTrips.filter(t => t.status === 'completed').length;
            const totalRevenue = driverTrips.filter(t => t.status === 'completed').reduce((s,t) => s + (t.fare||0),0);
            
            return (
              <div key={driver._id} className="driver-card" onClick={() => setSelectedDriverId(driver._id)}>
                <div className="card-actions">
                  <button className="action-btn edit" title="Sửa" onClick={e => handleOpenEdit(driver,e)}>✎</button>
                  <button className="action-btn delete" title="Xóa" onClick={e => handleDelete(driver._id,e)}>✕</button>
                </div>
                <strong>{driver.fullName || driver.name}</strong>
                <p>📞 {driver.phone}</p>
                <div style={{marginTop: '8px', borderTop:'1px solid #f3f4f6', paddingTop:'8px', display:'flex', justifyContent:'space-between'}}>
                    <span style={{fontSize:'12px', color:'#6b7280'}}>Doanh thu</span>
                    <span style={{fontWeight:'bold', color:'#2563eb'}}>{new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(totalRevenue)}</span>
                </div>
              </div>
            );
          })}
          {filteredDrivers.length === 0 && <p style={{gridColumn:'1/-1', textAlign:'center', color: '#6b7280'}}>Không tìm thấy tài xế nào</p>}
        </div>
      )}

      {/* MODAL FORM */}
      {isFormModalOpen && (
        <div className="modal-overlay" onClick={() => setIsFormModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{editingDriver ? 'Cập nhật thông tin' : 'Thêm tài xế mới'}</h3>
            
            <div className="form-group" style={{marginBottom: '16px'}}>
              <label>Họ và tên <span style={{color:'red'}}>*</span></label>
              <input 
                className="form-input" 
                type="text" 
                placeholder="Ví dụ: Nguyễn Văn A"
                value={formData.fullName || ''} 
                onChange={e => setFormData({...formData, fullName: e.target.value})} 
                autoFocus
              />
            </div>

            <div className="form-group" style={{marginBottom: '16px'}}>
              <label>Số điện thoại <span style={{color:'red'}}>*</span></label>
              <input 
                className="form-input" 
                type="tel" 
                placeholder="Ví dụ: 0912345678"
                value={formData.phone || ''} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input 
                className="form-input" 
                type="email" 
                placeholder="driver@example.com"
                value={formData.email || ''} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setIsFormModalOpen(false)}>Hủy bỏ</button>
              <button className="btn-primary" onClick={handleSubmit}>
                {loading ? 'Đang lưu...' : 'Lưu thông tin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverList;