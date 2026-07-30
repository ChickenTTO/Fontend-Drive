import React, { useState, useEffect } from 'react';
import './ActiveVehicles.css';
import vehicleApi from '../../api/vehicleApi';
import driverApi from '../../api/driverApi';
import bookingApi from '../../api/bookingApi';
import { 
  StatusIcon, ArrowLeftIcon, UserCircleIcon, 
  MapPinIcon, ClockIcon, PackageIcon 
} from '../../components/icons';

// --- COMPONENT: TRIP CARD ---
const TripCard = ({ trip, isActive, onUpdateStatus, formatCurrency, calculateDuration }) => {
    return (
        <div className="customer-item">
            <div className="customer-top">
                <div className="customer-info">
                    <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                        <UserCircleIcon size={16} color="#2563eb" />
                        <h4>{trip.customerName || trip.cargoType || 'Chuyến xe tải Futa Express'}</h4>
                    </div>
                    <p>{trip.customerPhone ? `📞 ${trip.customerPhone}` : (trip.tripCode ? `Mã: ${trip.tripCode}` : '')}</p>
                </div>
                <div className="trip-fare">
                    {trip.fare || trip.price ? formatCurrency(trip.fare || trip.price) : (trip.cargoWeightTon ? `${trip.cargoWeightTon} Tấn` : '---')}
                </div>
            </div>

            <div className="address-info">
                <div className="address-line start">
                    <span className="address-label">Bãi đi</span>
                    {trip.startLocation || trip.startDepot?.name || trip.pickup || 'Điểm nhận hàng'}
                </div>
                <div className="address-line end">
                    <span className="address-label">Bãi đến</span>
                    {trip.endLocation || trip.endDepot?.name || trip.dropoff || 'Điểm giao hàng'}
                </div>
            </div>

            <div className="trip-meta">
                {calculateDuration(trip) ? (
                    <div className="duration-tag">
                        <ClockIcon size={14} />
                        {calculateDuration(trip)}
                    </div>
                ) : (
                    <div className="duration-tag">{trip.status || 'Đang vận hành'}</div>
                )}

                {isActive ? (
                    <div className="action-buttons">
                        <button 
                            className="btn-action btn-red"
                            onClick={() => {
                                if(window.confirm('Xác nhận hủy chuyến này?')) 
                                    onUpdateStatus(trip._id || trip.id, 'cancelled');
                            }}
                        >
                            Hủy chuyến
                        </button>
                        <button 
                            className="btn-action btn-green"
                            style={{ background: '#16a34a', color: '#ffffff', fontWeight: 700 }}
                            onClick={() => onUpdateStatus(trip._id || trip.id, 'Hoàn tất')}
                        >
                            ✓ Hoàn thành
                        </button>
                    </div>
                ) : (
                    <span style={{
                        fontSize:'12px', fontWeight:'600', 
                        color: (trip.status === 'completed' || trip.status === 'Hoàn tất') ? '#16a34a' : '#dc2626',
                        textTransform: 'capitalize'
                    }}>
                        {(trip.status === 'completed' || trip.status === 'Hoàn tất') ? '✓ Đã hoàn thành' : 'Đã hủy'}
                    </span>
                )}
            </div>
        </div>
    );
};

// --- VIEW: DETAIL ---
const VehicleDetailView = ({ vehicle, driver, trips, onBack, onUpdateTripStatus }) => {
  const getVehicleId = (v) => typeof v === 'object' && v !== null ? (v._id || v.id) : v;
  const currentVehicleId = vehicle._id || vehicle.id;

  const vehicleTrips = trips.filter(t => getVehicleId(t.vehicle) === currentVehicleId);

  const activeTrips = vehicleTrips.filter(t => 
    ['ongoing', 'Đang vận hành', 'Đang chạy', 'in_transit', 'assigned', 'Đang chờ'].includes(t.status)
  );

  const completedTrips = vehicleTrips.filter(t => 
    ['completed', 'Hoàn tất'].includes(t.status)
  );

  const totalRevenue = completedTrips.reduce((sum, t) => sum + (t.fare || t.price || 0), 0);

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const calculateDuration = (trip) => {
    if (!trip.startTime && !trip.createdAt) return null;
    const startTimeMs = new Date(trip.startTime || trip.createdAt).getTime();
    const endTimeMs = trip.endTime ? new Date(trip.endTime).getTime() : Date.now();
    const diffMs = endTimeMs - startTimeMs;
    if (diffMs < 0) return null;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return hours > 0 ? `${hours}h ${mins}p` : `${mins} phút`;
  };

  return (
    <div className="detail-view">
      <div className="detail-header">
        <button onClick={onBack} className="back-btn"><ArrowLeftIcon /></button>
        <div>
          <h2 style={{margin:0, fontSize:'20px', fontWeight:'700'}}>{vehicle.plateNumber || vehicle.licensePlate} {vehicle.barcode ? `[${vehicle.barcode}]` : ''}</h2>
          <div style={{display:'flex', gap:'8px', fontSize:'14px', color:'#6b7280', marginTop:'4px'}}>
             <span>{driver?.name || driver?.fullName || 'Chưa gán tài xế'}</span>
             <span>•</span>
             <span>{driver?.phone || '---'}</span>
          </div>
        </div>
        <div style={{marginLeft:'auto', textAlign:'right'}}>
            <span style={{fontSize:'12px', color:'#6b7280', display:'block'}}>Tổng doanh thu chuyến</span>
            <span style={{fontSize:'20px', fontWeight:'700', color:'#2563eb'}}>{formatCurrency(totalRevenue)}</span>
        </div>
      </div>

      <div className="detail-layout">
        {/* CỘT CHUYẾN ĐANG CHẠY */}
        <div className="info-card" style={{borderColor: '#bfdbfe'}}>
            <div className="info-header blue">
                <h3><PackageIcon size={18} /> Chuyến đang chạy / Đã gán ({activeTrips.length})</h3>
                <span className="badge-count" style={{color:'#1d4ed8'}}>{activeTrips.length}</span>
            </div>
            <div className="info-body">
                {activeTrips.length > 0 ? activeTrips.map(trip => (
                    <TripCard 
                        key={trip._id || trip.id} 
                        trip={trip} 
                        isActive={true}
                        onUpdateStatus={onUpdateTripStatus}
                        formatCurrency={formatCurrency}
                        calculateDuration={calculateDuration}
                    />
                )) : (
                    <div className="empty-state">
                        <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" width="48" alt="empty" style={{opacity:0.5}} />
                        <p>Xe đang rảnh, chưa có chuyến nào đang chạy.</p>
                    </div>
                )}
            </div>
        </div>

        {/* CỘT LỊCH SỬ HOÀN THÀNH */}
        <div className="info-card">
            <div className="info-header green">
                <h3><ClockIcon size={18} /> Lịch sử hoàn thành ({completedTrips.length})</h3>
                <span className="badge-count" style={{color:'#15803d'}}>{completedTrips.length}</span>
            </div>
            <div className="info-body">
                {completedTrips.length > 0 ? completedTrips.map(trip => (
                    <TripCard 
                        key={trip._id || trip.id} 
                        trip={trip} 
                        isActive={false}
                        formatCurrency={formatCurrency}
                        calculateDuration={calculateDuration}
                    />
                )) : (
                    <div className="empty-state">
                        <p>Chưa có chuyến hoàn thành nào.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN VIEW ---
const ActiveVehicles = ({ initialVehicleId, onClearInitialVehicleId }) => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailVehicleId, setDetailVehicleId] = useState(null);

  const parseArray = (res) => {
    if (!res) return [];
    const data = res.data ?? res;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehRes, drvRes, tripRes] = await Promise.all([
        vehicleApi.getAll().catch(() => ({ data: [] })),
        driverApi.getAll().catch(() => ({ data: [] })),
        bookingApi.getAll().catch(() => ({ data: [] }))
      ]);
      setVehicles(parseArray(vehRes));
      setDrivers(parseArray(drvRes));
      setTrips(parseArray(tripRes));
    } catch (err) {
      setError('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialVehicleId) return;
    const t = setTimeout(() => {
      setDetailVehicleId(initialVehicleId);
      if (onClearInitialVehicleId) onClearInitialVehicleId();
    }, 0);
    return () => clearTimeout(t);
  }, [initialVehicleId, onClearInitialVehicleId]);

  const handleUpdateTripStatus = async (tripId, newStatus) => {
    try {
      setLoading(true);
      const updateData = { status: newStatus };
      if (newStatus === 'completed' || newStatus === 'Hoàn tất') {
        updateData.status = 'Hoàn tất';
        updateData.endTime = new Date().toISOString();
      }
      
      await bookingApi.update(tripId, updateData);
      alert(`✅ Đã cập nhật chuyến xe sang trạng thái: "${newStatus}"!`);
      loadData();
    } catch (err) {
      alert('Lỗi cập nhật: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getVehicleId = (v) => typeof v === 'object' && v !== null ? (v._id || v.id) : v;

  const getVehicleStats = (vId) => {
    const vehicleTrips = trips.filter(t => getVehicleId(t.vehicle) === vId);
    const todayTrips = vehicleTrips.filter(t => ['ongoing', 'Đang vận hành', 'Đang chạy', 'completed', 'Hoàn tất', 'assigned', 'Đang chờ'].includes(t.status)).length;
    const todayRevenue = vehicleTrips.filter(t => ['completed', 'Hoàn tất'].includes(t.status)).reduce((sum, t) => sum + (t.fare || t.price || 0), 0);
    return { todayTrips, todayRevenue, vehicleTrips };
  };

  // Hiển thị tất cả đội xe hoặc các xe có chuyến
  const activeVehicles = Array.isArray(vehicles) ? vehicles : [];

  const selectedVehicle = vehicles.find(v => (v._id || v.id) === detailVehicleId);

  if (selectedVehicle) {
    const driver = drivers.find(d => (d._id || d.id) === (selectedVehicle.driver || selectedVehicle.driverId));
    return (
      <VehicleDetailView 
        vehicle={selectedVehicle} 
        driver={driver} 
        trips={trips}
        onBack={() => setDetailVehicleId(null)}
        onUpdateTripStatus={handleUpdateTripStatus}
      />
    );
  }

  if (loading && vehicles.length === 0) return <div style={{padding:'40px', textAlign:'center'}}>Đang tải dữ liệu...</div>;
  if (error) return <div style={{color:'red', textAlign:'center', padding:'20px'}}>{error}</div>;

  return (
    <div className="active-vehicles-container">
      <div className="page-header">
        <h2>Giám sát 24/24 & Quản lý Chuyến</h2>
        <p>Theo dõi trạng thái đội xe tải và cập nhật hoàn thành chuyến đi trực tuyến.</p>
      </div>

      <div className="vehicle-grid">
        {activeVehicles.length > 0 ? activeVehicles.map(vehicle => {
          const vehicleId = vehicle._id || vehicle.id;
          const stats = getVehicleStats(vehicleId);
          const driver = drivers.find(d => (d._id || d.id) === (vehicle.driver || vehicle.driverId));
          const plateNumber = vehicle.plateNumber || vehicle.licensePlate || 'N/A';

          return (
            <div key={vehicleId} onClick={() => setDetailVehicleId(vehicleId)} className="vehicle-card" style={{ cursor: 'pointer' }}>
              <div className="card-header">
                <h3>{plateNumber} {vehicle.barcode ? <span style={{ fontSize: 12, color: '#f97316' }}>[{vehicle.barcode}]</span> : ''}</h3>
                <div className={`status-badge-sm ${vehicle.status}`}>
                  <StatusIcon status={vehicle.status} size={10} />
                  <span>{vehicle.status || 'Sẵn sàng'}</span>
                </div>
              </div>
              <div className="card-body">
                <div className="driver-info">
                    <span className="driver-label">Tài xế</span>
                    <span className="driver-name">{driver?.name || driver?.fullName || '---'}</span>
                    <span className="driver-phone">📞 {driver?.phone || '---'}</span>
                </div>
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="label">Số chuyến</span>
                        <span className="value">{stats.todayTrips}</span>
                    </div>
                    <div className="stat-item">
                        <span className="label">Doanh thu</span>
                        <span className="value money">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(stats.todayRevenue)}
                        </span>
                    </div>
                </div>
                <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: '#2563eb', fontWeight: 600 }}>
                  👉 Bấm để xem chi tiết & Hoàn thành chuyến ➔
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="empty-state" style={{gridColumn: '1/-1'}}>
             <p>Chưa có dữ liệu xe.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveVehicles;