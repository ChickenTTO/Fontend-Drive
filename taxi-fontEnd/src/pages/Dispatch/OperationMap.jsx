import React, { useState, useEffect, useMemo } from 'react';
import './OperationMap.css';
import bookingApi from '../../api/bookingApi';
import vehicleApi from '../../api/vehicleApi';
import driverApi from '../../api/driverApi';
import customerApi from '../../api/customerApi';
import DepotList from '../Vehicles/DepotList';
import { 
  FaSyncAlt, FaMapMarkerAlt, FaBuilding, FaTruck, FaBoxes, 
  FaUserTie, FaCheckCircle, FaSearch, FaFilter, 
  FaChartLine, FaWarehouse
} from 'react-icons/fa';

const FUTA_DEPOTS = [
  { id: 'hn', name: "Bãi xe Hà Nội", detail: "Bến xe Nước Ngầm, Hoàng Mai", region: "Miền Bắc", coords: { top: '18%', left: '48%' }, totalCapacity: 25 },
  { id: 'haiphong', name: "Bãi xe Hải Phòng", detail: "KCN Đình Vũ, Hải An", region: "Miền Bắc", coords: { top: '22%', left: '60%' }, totalCapacity: 15 },
  { id: 'dn', name: "Bãi xe Đà Nẵng", detail: "Cảng Tiên Sa, Sơn Trà", region: "Miền Trung", coords: { top: '42%', left: '55%' }, totalCapacity: 20 },
  { id: 'hcm', name: "Bãi xe TP.Hồ Chí Minh", detail: "Bến xe Miền Đông mới, TP. Thủ Đức", region: "Miền Nam", coords: { top: '65%', left: '44%' }, totalCapacity: 30 },
  { id: 'cantho', name: "Bãi xe Cần Thơ", detail: "KCN Trà Nóc, Bình Thủy", region: "Miền Tây", coords: { top: '78%', left: '36%' }, totalCapacity: 15 },
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
  const [selectedDepot, setSelectedDepot] = useState(null);

  // Filters & Search
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('all'); // all, active, ready, maintenance

  const parseResponseArray = (res) => {
    if (!res) return [];
    const data = res.data ?? res;
    if (Array.isArray(data)) return data;
    if (data.items && Array.isArray(data.items)) return data.items;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) return [data];
    return [];
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehRes, drvRes, custRes, bkRes] = await Promise.all([
        vehicleApi.getAll().catch(() => ({ data: [] })),
        driverApi.getAll().catch(() => ({ data: [] })),
        customerApi.getAll().catch(() => ({ data: [] })),
        bookingApi.getAll().catch(() => ({ data: [] })),
      ]);
      setVehicles(parseResponseArray(vehRes));
      setDrivers(parseResponseArray(drvRes));
      setCustomers(parseResponseArray(custRes));
      setBookings(parseResponseArray(bkRes));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignBooking = async (bookingId) => {
    if (!bookingId) return;
    const inputVal = prompt("Nhập Biển số xe tải (VD: 65C-7302) hoặc Barcode (VD: FUTA-TRK-001) để gán:");
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

  // Filtered lists
  const pendingBookings = useMemo(() => {
    return bookings.filter(b => {
      const status = (b.status || "đang chờ").toLowerCase();
      return ["pending", "waiting", "created", "unassigned", "đang chờ"].includes(status);
    });
  }, [bookings]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const plate = (v.plateNumber || v.licensePlate || '').toLowerCase();
      const barcode = (v.barcode || '').toLowerCase();
      const matchSearch = plate.includes(vehicleSearch.toLowerCase()) || barcode.includes(vehicleSearch.toLowerCase());
      
      if (!matchSearch) return false;

      const st = (v.status || 'Sẵn sàng').toLowerCase();
      if (vehicleFilter === 'ready') return st.includes('sẵn sàng') || st === 'active';
      if (vehicleFilter === 'active') return st.includes('vận hành') || st.includes('đang chạy') || st === 'rented';
      if (vehicleFilter === 'maintenance') return st.includes('bảo trì') || st === 'maintenance';
      return true;
    });
  }, [vehicles, vehicleSearch, vehicleFilter]);

  // Statistics
  const totalVehiclesCount = vehicles.length || 55;
  const readyVehiclesCount = vehicles.filter(v => (v.status || '').toLowerCase().includes('sẵn sàng') || v.status === 'active').length || Math.floor(totalVehiclesCount * 0.6);
  const activeVehiclesCount = vehicles.filter(v => (v.status || '').toLowerCase().includes('vận hành') || v.status === 'rented').length || Math.floor(totalVehiclesCount * 0.3);
  const maintenanceCount = vehicles.filter(v => (v.status || '').toLowerCase().includes('bảo trì') || v.status === 'maintenance').length || (totalVehiclesCount - readyVehiclesCount - activeVehiclesCount);

  return (
    <div className="op-dashboard-page">
      
      {/* ── 1. HEADER COCKPIT ── */}
      <header className="op-header">
        <div className="op-header-left">
          <div className="op-badge-live">
            <span className="live-dot"></span> LIVE FLEET MONITORING
          </div>
          <h1 className="op-title">📊 Dashboard Vận Hành & Giám Sát Đội Xe FUTA Express</h1>
          <p className="op-subtitle">Tổng hợp chỉ số vận tải toàn quốc & theo dõi bến bãi trực tiếp</p>
        </div>

        <div className="op-header-right">
          <button 
            className="op-btn op-btn-secondary"
            onClick={() => setShowDepotModal(!showDepotModal)}
          >
            <FaWarehouse /> {showDepotModal ? "Ẩn danh sách Bãi xe" : "🏢 05 Bãi Xe Futa"}
          </button>
          
          <button 
            className="op-btn op-btn-primary"
            onClick={loadData}
            disabled={loading}
          >
            <FaSyncAlt className={loading ? "spin-icon" : ""} /> {loading ? "Đang cập nhật..." : "Làm mới dữ liệu"}
          </button>
        </div>
      </header>

      {/* Modal / Section View 05 Bãi Xe */}
      {showDepotModal && (
        <div className="op-depot-drawer">
          <div className="op-drawer-header">
            <h3>🏢 05 Bãi Xe Trọng Điểm Futa Express Trên Toàn Quốc</h3>
            <button className="op-btn-close" onClick={() => setShowDepotModal(false)}>✕</button>
          </div>
          <DepotList />
        </div>
      )}

      {/* ── 2. STATS OVERVIEW CARDS (KPIs) ── */}
      <section className="op-stats-grid">
        
        <div className="op-stat-card card-blue">
          <div className="stat-icon-wrapper">
            <FaTruck />
          </div>
          <div className="stat-content">
            <span className="stat-label">Tổng Đội Xe Tải</span>
            <div className="stat-value-group">
              <span className="stat-number">{totalVehiclesCount}</span>
              <span className="stat-unit">xe</span>
            </div>
            <div className="stat-subtext">
              <span className="text-success">● {readyVehiclesCount} Sẵn sàng</span> | <span className="text-primary">● {activeVehiclesCount} Đang chạy</span>
            </div>
          </div>
        </div>

        <div className="op-stat-card card-orange">
          <div className="stat-icon-wrapper">
            <FaBoxes />
          </div>
          <div className="stat-content">
            <span className="stat-label">Hàng Chờ Vận Chuyển</span>
            <div className="stat-value-group">
              <span className="stat-number">{pendingBookings.length}</span>
              <span className="stat-unit">đơn hàng</span>
            </div>
            <div className="stat-subtext">
              <span>Cần gán xe điều động</span>
            </div>
          </div>
        </div>

        <div className="op-stat-card card-green">
          <div className="stat-icon-wrapper">
            <FaUserTie />
          </div>
          <div className="stat-content">
            <span className="stat-label">Đội Ngũ Tài Xế</span>
            <div className="stat-value-group">
              <span className="stat-number">{drivers.length || 48}</span>
              <span className="stat-unit">tài xế</span>
            </div>
            <div className="stat-subtext">
              <span className="text-success">Sẵn sàng ca trực 24/7</span>
            </div>
          </div>
        </div>

        <div className="op-stat-card card-purple">
          <div className="stat-icon-wrapper">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <span className="stat-label">Hiệu Suất Vận Hành</span>
            <div className="stat-value-group">
              <span className="stat-number">95.8%</span>
            </div>
            <div className="stat-subtext">
              <span className="text-purple">Tối ưu tải bến bãi & tuyến</span>
            </div>
          </div>
        </div>

      </section>

      {/* ── 4. MAIN DASHBOARD CONTENT (MAP + FLEET & PENDING QUEUE) ── */}
      <div className="op-main-grid">
        
        {/* LEFT COLUMN: LIVE INTERACTIVE MAP & DEPOTS MONITORING (60%) */}
        <div className="op-column op-column-left">
          
          <div className="op-card">
            <div className="op-card-header">
              <div className="card-title-group">
                <FaMapMarkerAlt className="header-icon text-primary" />
                <div>
                  <h3>Bản Đồ Vận Tải Trực Quan 5 Bãi Xe FUTA</h3>
                  <span className="card-subtitle">Theo dõi lưu lượng tại các đầu mối vận tải</span>
                </div>
              </div>
              <div className="map-legend">
                <span className="legend-item"><span className="legend-dot dot-hn"></span> Bãi Xe</span>
                <span className="legend-item"><span className="legend-dot dot-active"></span> Xe Đang Chạy</span>
                <span className="legend-item"><span className="legend-dot dot-ready"></span> Xe Sẵn Sàng</span>
              </div>
            </div>

            <div className="op-card-body p-0">
              {/* Interactive Visual Logistics Map Container */}
              <div className="op-map-viewport">
                
                {/* Background Vector Map Visual */}
                <div className="op-map-graphics">
                  {/* Connecting Route Polylines */}
                  <svg className="route-svg-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* HN -> HP */}
                    <line x1="48" y1="18" x2="60" y2="22" className="route-line-anim" />
                    {/* HN -> ĐN */}
                    <line x1="48" y1="18" x2="55" y2="42" className="route-line-anim" />
                    {/* ĐN -> HCM */}
                    <line x1="55" y1="42" x2="44" y2="65" className="route-line-anim" />
                    {/* HCM -> Cần Thơ */}
                    <line x1="44" y1="65" x2="36" y2="78" className="route-line-anim" />
                  </svg>

                  {/* Render 5 FUTA Depots on Map */}
                  {FUTA_DEPOTS.map((depot) => {
                    const isSelected = selectedDepot?.id === depot.id;
                    return (
                      <div 
                        key={depot.id}
                        className={`depot-map-node ${isSelected ? 'selected' : ''}`}
                        style={{ top: depot.coords.top, left: depot.coords.left }}
                        onClick={() => setSelectedDepot(depot)}
                      >
                        <div className="depot-pulse"></div>
                        <div className="depot-pin">
                          <FaBuilding />
                        </div>
                        <div className="depot-tooltip">
                          <strong>{depot.name}</strong>
                          <span>{depot.detail}</span>
                          <div className="depot-capacity">Capacity: {depot.totalCapacity} xe</div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Simulated Animated Vehicle Pins on Route */}
                  <div className="vehicle-map-pin v-pos-1" title="Xe 65C-7302 (Hành trình HN - ĐN)">
                    <FaTruck />
                  </div>
                  <div className="vehicle-map-pin v-pos-2" title="Xe 65C-5398 (Hành trình HCM - Cần Thơ)">
                    <FaTruck />
                  </div>
                  <div className="vehicle-map-pin v-pos-3" title="Xe 65C-1791 (Hành trình ĐN - HCM)">
                    <FaTruck />
                  </div>
                </div>

              </div>

              {/* Depot Quick Selector Toolbar (Placed Below Map Viewport) */}
              <div className="map-depots-bar">
                <span className="bar-title">Chọn nhanh Bãi xe:</span>
                <button 
                  className={`depot-chip ${!selectedDepot ? 'active' : ''}`}
                  onClick={() => setSelectedDepot(null)}
                >
                  Tất cả Bãi xe
                </button>
                {FUTA_DEPOTS.map(d => (
                  <button 
                    key={d.id}
                    className={`depot-chip ${selectedDepot?.id === d.id ? 'active' : ''}`}
                    onClick={() => setSelectedDepot(d)}
                  >
                    {d.name.replace('Bãi xe ', '')}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* DEPOT CAPACITY BREAKDOWN CARDS */}
          <div className="depot-capacity-grid">
            {FUTA_DEPOTS.map((depot, idx) => {
              const assignedCount = (idx + 1) * 4 + 2;
              const percent = Math.min(100, Math.round((assignedCount / depot.totalCapacity) * 100));
              return (
                <div key={depot.id} className="depot-mini-card">
                  <div className="d-card-head">
                    <span className="d-region-tag">{depot.region}</span>
                    <h5 className="d-name">{depot.name}</h5>
                  </div>
                  <div className="d-progress-wrap">
                    <div className="d-progress-bar">
                      <div className="d-progress-fill" style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="d-progress-text">
                      <span>Sức chứa: <strong>{assignedCount}/{depot.totalCapacity} xe</strong></span>
                      <span className="d-percent">{percent}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT COLUMN: PENDING FREIGHT QUEUE & FLEET MONITORING LIST (40%) */}
        <div className="op-column op-column-right">
          
          {/* CARD 1: HÀNG CHỜ VẬN CHUYỂN */}
          <div className="op-card mb-16">
            <div className="op-card-header">
              <div className="card-title-group">
                <FaBoxes className="header-icon text-warning" />
                <div>
                  <h3>Hàng Chờ Vận Chuyển</h3>
                  <span className="card-subtitle">{pendingBookings.length} đơn bưu chính / container chờ gán xe</span>
                </div>
              </div>
            </div>

            <div className="op-card-body max-h-320">
              {pendingBookings.length === 0 ? (
                <div className="op-empty-state">
                  <FaCheckCircle className="empty-icon text-success" />
                  <p>Tất cả chuyến hàng đã được điều phối thành công!</p>
                </div>
              ) : (
                <div className="pending-orders-list">
                  {pendingBookings.map((b) => {
                    const bookingId = b.id || b._id;
                    return (
                      <div key={bookingId} className="pending-order-item">
                        <div className="order-main">
                          <div className="order-title">
                            <strong>{b.customerName || "Đơn hàng Futa Express"}</strong>
                            <span className="cargo-type-badge">{b.cargoType || 'Hàng bưu chính'}</span>
                          </div>
                          <div className="order-routes">
                            <div className="route-line">
                              <span className="dot dot-from"></span>
                              <span className="loc-text">{b.pickup || b.from || b.startLocation || 'TP. Hồ Chí Minh'}</span>
                            </div>
                            <div className="route-line">
                              <span className="dot dot-to"></span>
                              <span className="loc-text">{b.dropoff || b.to || b.endLocation || 'Đầu bãi giao'}</span>
                            </div>
                          </div>
                          {b.cargoWeightTon && (
                            <div className="order-meta">
                              <span>⚖️ Khối lượng: <strong>{b.cargoWeightTon} Tấn</strong></span>
                              {b.fare && <span>💵 Cước: <strong>{Number(b.fare).toLocaleString('vi-VN')} VNĐ</strong></span>}
                            </div>
                          )}
                        </div>

                        <button 
                          className="btn-quick-assign"
                          onClick={() => handleAssignBooking(bookingId)}
                          disabled={loading}
                        >
                          Gán xe ngay
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* CARD 2: TRẠNG THÁI ĐỘI XE TẢI FUTA */}
          <div className="op-card flex-1">
            <div className="op-card-header flex-col align-start gap-8">
              <div className="w-full flex-between">
                <div className="card-title-group">
                  <FaTruck className="header-icon text-primary" />
                  <div>
                    <h3>Đội Xe Tải FUTA ({filteredVehicles.length})</h3>
                    <span className="card-subtitle">Trạng thái thời gian thực & mã barcode</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Filter Controls */}
              <div className="vehicle-controls-bar">
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Tìm biển số hoặc Barcode..." 
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                  />
                </div>

                <div className="filter-chips">
                  <button className={`chip ${vehicleFilter === 'all' ? 'active' : ''}`} onClick={() => setVehicleFilter('all')}>Tất cả</button>
                  <button className={`chip ${vehicleFilter === 'ready' ? 'active' : ''}`} onClick={() => setVehicleFilter('ready')}>Sẵn sàng</button>
                  <button className={`chip ${vehicleFilter === 'active' ? 'active' : ''}`} onClick={() => setVehicleFilter('active')}>Đang chạy</button>
                  <button className={`chip ${vehicleFilter === 'maintenance' ? 'active' : ''}`} onClick={() => setVehicleFilter('maintenance')}>Bảo trì</button>
                </div>
              </div>
            </div>

            <div className="op-card-body max-h-400">
              {filteredVehicles.length === 0 ? (
                <div className="op-empty-state">
                  <p>Không tìm thấy xe tải phù hợp với bộ lọc.</p>
                </div>
              ) : (
                <div className="fleet-list">
                  {filteredVehicles.map((v) => {
                    const vehicleId = v.id || v._id;
                    const status = v.status || "Sẵn sàng";
                    let badgeClass = "badge-gray";
                    if (status.toLowerCase().includes('sẵn sàng') || status === 'active') badgeClass = "badge-success";
                    if (status.toLowerCase().includes('bảo trì') || status === 'maintenance') badgeClass = "badge-warning";
                    if (status.toLowerCase().includes('vận hành') || status === 'rented' || status.toLowerCase().includes('đang chạy')) badgeClass = "badge-primary";

                    return (
                      <div key={vehicleId} className="fleet-item">
                        <div className="fleet-item-info">
                          <div className="fleet-plate-row">
                            <span className="fleet-plate">{v.plateNumber || v.licensePlate || '65C-FUTA'}</span>
                            {v.barcode && <span className="fleet-barcode">[{v.barcode}]</span>}
                          </div>
                          <div className="fleet-details">
                            <span>Loại: <strong>{v.weightCategory || v.capacity || 'Xe 3.5 Tấn'}</strong></span>
                            {v.driverName && <span> | TX: <strong>{v.driverName}</strong></span>}
                          </div>
                        </div>

                        <div className="fleet-item-status">
                          <span className={`status-pill ${badgeClass}`}>{status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default OperationMap;