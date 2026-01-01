import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, CartesianGrid, XAxis, YAxis,
  BarChart, Bar
} from 'recharts';
import './Reports.css';


import { XIcon, CarIcon, UserCircleIcon, CalendarIcon, PencilIcon } from '../../components/icons';



const ReportDetailModal = ({ report, driver, vehicle, onClose }) => {
  if (!report) return null;

  const data = [
      { name: 'Khách', value: report.customerTrips },
      { name: 'Hàng', value: report.cargoTrips },
  ];
  const COLORS = ['#3b82f6', '#f59e0b']; // Blue & Yellow

  const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  return (
      <div className="modal-overlay">
          <div className="modal-content">
              <div className="modal-header">
                  <div>
                    <h3 style={{fontSize: '20px', fontWeight: 'bold', margin: 0}}>Chi tiết Hoạt động</h3>
                    <p style={{fontSize: '14px', color: '#6b7280', margin: 0}}>Ngày {new Date(report.date).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer', color:'#6b7280'}}>
                      <XIcon />
                  </button>
              </div>
              <div className="modal-body">
                  <div className="detail-grid">
                      <div className="space-y-6">
                        <div className="info-card">
                             <div className="info-row">
                                <div className="icon-circle blue">
                                    <UserCircleIcon />
                                </div>
                                <div>
                                    <p style={{fontSize:'10px', textTransform:'uppercase', fontWeight:'600', color:'#6b7280'}}>Tài xế</p>
                                    <p style={{fontSize:'18px', fontWeight:'500'}}>{driver?.name || 'Không xác định'}</p>
                                    <p style={{fontSize:'14px', color:'#6b7280'}}>{driver?.phone}</p>
                                </div>
                            </div>
                            <div className="info-row">
                                 <div className="icon-circle green">
                                    <CarIcon />
                                </div>
                                <div>
                                    <p style={{fontSize:'10px', textTransform:'uppercase', fontWeight:'600', color:'#6b7280'}}>Phương tiện</p>
                                    <p style={{fontSize:'18px', fontWeight:'500'}}>{vehicle?.licensePlate || 'Không xác định'}</p>
                                    <p style={{fontSize:'14px', color:'#6b7280'}}>{vehicle?.type}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="stats-mini-grid">
                            <div className="stat-mini-box">
                                <p className="stat-mini-title">Doanh thu</p>
                                <p className="stat-mini-val primary">
                                    {formatCurrency(report.revenue)}
                                </p>
                            </div>
                             <div className="stat-mini-box">
                                <p className="stat-mini-title">Quãng đường</p>
                                <p className="stat-mini-val orange">
                                    {report.distance} km
                                </p>
                            </div>
                        </div>
                      </div>

                      <div className="pie-chart-container">
                          <h4 style={{fontWeight: '600', marginBottom: '16px'}}>Phân loại Chuyến đi</h4>
                           <div style={{width: '100%', height: '200px'}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                           </div>
                          <div className="legend-container">
                              <div className="legend-item">
                                  <span className="dot" style={{backgroundColor: '#3b82f6'}}></span>
                                  <span>{report.customerTrips} Chở khách</span>
                              </div>
                              <div className="legend-item">
                                  <span className="dot" style={{backgroundColor: '#f59e0b'}}></span>
                                  <span>{report.cargoTrips} Giao hàng</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
               <div className="modal-footer">
                  <button onClick={onClose} className="btn-filter">
                      Đóng
                  </button>
              </div>
          </div>
      </div>
  )
}

const ManualReportModal = ({ isOpen, onClose, onSave, drivers, vehicles }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        driverId: '',
        vehicleId: '',
        distance: 0,
        customerTrips: 0,
        cargoTrips: 0,
        revenue: 0
    });

    const handleSubmit = () => {
        if (!formData.driverId || !formData.vehicleId) {
            alert('Vui lòng chọn tài xế và xe.');
            return;
        }
        
        const newReport = {
            id: `mr-${Date.now()}`,
            ...formData,
            startTime: `${formData.date}T08:00:00`,
            endTime: `${formData.date}T18:00:00`
        };
        
        onSave(newReport);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            driverId: '',
            vehicleId: '',
            distance: 0,
            customerTrips: 0,
            cargoTrips: 0,
            revenue: 0
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header primary">
                    <h3 style={{fontSize: '18px', fontWeight: 'bold', margin: 0}}>Tạo Báo cáo Thủ công</h3>
                    <button onClick={onClose} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}><XIcon /></button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Ngày báo cáo</label>
                        <input 
                            type="date" 
                            value={formData.date} 
                            onChange={e => setFormData({...formData, date: e.target.value})}
                            className="form-input"
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Tài xế</label>
                            <select 
                                value={formData.driverId} 
                                onChange={e => setFormData({...formData, driverId: e.target.value})}
                                className="form-input"
                            >
                                <option value="">-- Chọn tài xế --</option>
                                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Xe</label>
                            <select 
                                value={formData.vehicleId} 
                                onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                                className="form-input"
                            >
                                <option value="">-- Chọn xe --</option>
                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Quãng đường (km)</label>
                        <input 
                            type="number" 
                            min="0"
                            value={formData.distance} 
                            onChange={e => setFormData({...formData, distance: parseInt(e.target.value) || 0})}
                            className="form-input"
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Số chuyến khách</label>
                            <input 
                                type="number" 
                                min="0"
                                value={formData.customerTrips} 
                                onChange={e => setFormData({...formData, customerTrips: parseInt(e.target.value) || 0})}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Số chuyến hàng</label>
                            <input 
                                type="number" 
                                min="0"
                                value={formData.cargoTrips} 
                                onChange={e => setFormData({...formData, cargoTrips: parseInt(e.target.value) || 0})}
                                className="form-input"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Doanh thu (VNĐ)</label>
                        <input 
                            type="number" 
                            min="0"
                            value={formData.revenue} 
                            onChange={e => setFormData({...formData, revenue: parseInt(e.target.value) || 0})}
                            className="form-input"
                            style={{fontWeight: 'bold', color: '#16a34a'}}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn-cancel">Hủy</button>
                    <button onClick={handleSubmit} className="btn-save">Lưu báo cáo</button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const Reports = ({ reports, setReports, drivers, vehicles }) => {
  const [dateOffset, setDateOffset] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Logic xử lý dữ liệu biểu đồ
  const { startDate, endDate, chartData } = useMemo(() => {
    const end = new Date();
    end.setDate(end.getDate() - dateOffset * 14);
    const start = new Date(end);
    start.setDate(end.getDate() - 13);
    
    const filteredReports = reports.filter(r => {
      const reportDate = new Date(r.date);
      return reportDate >= start && reportDate <= end;
    });

    const dataByDate = {};
    
    const dateCursor = new Date(start);
    while(dateCursor <= end) {
        const dateString = dateCursor.toISOString().split('T')[0];
        const shortDate = `${dateCursor.getDate()}/${dateCursor.getMonth() + 1}`;
        dataByDate[dateString] = { date: shortDate, fullDate: dateString };
        dateCursor.setDate(dateCursor.getDate() + 1);
    }

    filteredReports.forEach(report => {
      if (!dataByDate[report.date]) return;

      const driver = drivers.find(d => d.id === report.driverId);
      const vehicle = vehicles.find(v => v.id === report.vehicleId);

      if (driver) {
        dataByDate[report.date][`${driver.name}_revenue`] = (dataByDate[report.date][`${driver.name}_revenue`] || 0) + report.revenue;
        dataByDate[report.date][`${driver.name}_customerTrips`] = (dataByDate[report.date][`${driver.name}_customerTrips`] || 0) + report.customerTrips;
        dataByDate[report.date][`${driver.name}_cargoTrips`] = (dataByDate[report.date][`${driver.name}_cargoTrips`] || 0) + report.cargoTrips;
      }
      if (vehicle) {
        dataByDate[report.date][`${vehicle.licensePlate}_distance`] = (dataByDate[report.date][`${vehicle.licensePlate}_distance`] || 0) + report.distance;
        dataByDate[report.date][`${vehicle.licensePlate}_revenue`] = (dataByDate[report.date][`${vehicle.licensePlate}_revenue`] || 0) + report.revenue;
      }
    });

    return { startDate: start, endDate: end, chartData: Object.values(dataByDate) };
  }, [reports, drivers, vehicles, dateOffset]);

  // Logic thống kê tháng
  const monthlyStats = useMemo(() => {
    const stats = {};
    
    vehicles.forEach(v => {
        stats[v.id] = { revenue: 0, distance: 0, trips: 0, vehicle: v };
    });

    reports.forEach(r => {
        const d = new Date(r.date);
        if (d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear) {
            if (stats[r.vehicleId]) {
                stats[r.vehicleId].revenue += r.revenue;
                stats[r.vehicleId].distance += r.distance;
                stats[r.vehicleId].trips += (r.customerTrips + r.cargoTrips);
            }
        }
    });

    return Object.values(stats).sort((a, b) => b.revenue - a.revenue);
  }, [reports, vehicles, selectedMonth, selectedYear]);

  const handlePointClick = (data, id, type) => {
    let date = '';
    if (data?.payload?.fullDate) {
        date = data.payload.fullDate;
    } else if (data?.fullDate) {
        date = data.fullDate;
    }
    
    if (date) {
        const report = reports.find(r => 
            r.date === date && 
            (type === 'driver' ? r.driverId === id : r.vehicleId === id)
        );
        if (report) setSelectedReport(report);
    }
  };

  const handleCreateManualReport = (newReport) => {
      setReports(prev => [...prev, newReport]);
  };

  const driverColors = ['#8884d8', '#82ca9d', '#ffc658'];
  const vehicleColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  const activeDrivers = drivers.filter(d => !d.isArchived);
  const activeVehicles = vehicles;

  return (
    <div className="reports-page">
      {selectedReport && (
        <ReportDetailModal 
            report={selectedReport} 
            driver={drivers.find(d => d.id === selectedReport.driverId)}
            vehicle={vehicles.find(v => v.id === selectedReport.vehicleId)}
            onClose={() => setSelectedReport(null)}
        />
      )}

      <ManualReportModal 
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSave={handleCreateManualReport}
        drivers={drivers}
        vehicles={vehicles}
      />

      {/* Section: Biểu đồ Hàng ngày */}
      <div>
        <div className="page-header">
            <div className="page-title">
                <h2>Báo cáo Hàng Ngày</h2>
                <p>
                    Hiển thị dữ liệu từ {startDate.toLocaleDateString('vi-VN')} đến {endDate.toLocaleDateString('vi-VN')}
                </p>
            </div>
            <div className="controls-group">
                <button 
                    onClick={() => setIsManualModalOpen(true)} 
                    className="btn-create-report"
                >
                    <PencilIcon /> Tạo báo cáo
                </button>
                <button onClick={() => setDateOffset(dateOffset + 1)} className="btn-filter">
                    « 2 tuần trước
                </button>
                <button onClick={() => setDateOffset(0)} disabled={dateOffset === 0} className="btn-filter">
                    Hiện tại
                </button>
                <button onClick={() => setDateOffset(dateOffset - 1)} disabled={dateOffset === 0} className="btn-filter">
                    2 tuần sau »
                </button>
            </div>
        </div>
        
        <div className="charts-grid">
            <div className="chart-card">
                <h3 className="chart-title">Doanh thu theo Tài xế (VNĐ)</h3>
                <p className="chart-subtitle">Nhấn vào điểm biểu đồ để xem chi tiết</p>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => `${Number(value) / 1000000}tr`} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        {activeDrivers.map((driver, index) => (
                            <Line 
                                key={driver.id} 
                                type="monotone" 
                                dataKey={`${driver.name}_revenue`} 
                                name={driver.name} 
                                stroke={driverColors[index % driverColors.length]} 
                                strokeWidth={2}
                                activeDot={{ r: 6, onClick: (props) => handlePointClick(props, driver.id, 'driver'), cursor: 'pointer' }}
                            />
                        ))}
                    </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card">
                <h3 className="chart-title">Doanh thu theo Xe (VNĐ)</h3>
                 <p className="chart-subtitle">Nhấn vào cột để xem chi tiết</p>
                 <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="date" />
                            <YAxis tickFormatter={(value) => `${Number(value) / 1000000}tr`} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            {activeVehicles.map((vehicle, index) => (
                                <Bar
                                    key={`${vehicle.id}-rev`}
                                    dataKey={`${vehicle.licensePlate}_revenue`}
                                    name={vehicle.licensePlate}
                                    fill={vehicleColors[index % vehicleColors.length]}
                                    stackId="revenue"
                                    onClick={(data) => handlePointClick(data, vehicle.id, 'vehicle')}
                                    cursor="pointer"
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card">
                <h3 className="chart-title">Số lượng Chuyến (Khách/Hàng)</h3>
                <p className="chart-subtitle">Nhấn vào cột để xem chi tiết</p>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {activeDrivers.map((driver, index) => (
                            <Bar 
                                key={`${driver.id}-customer`} 
                                stackId={driver.id} 
                                dataKey={`${driver.name}_customerTrips`} 
                                name={`${driver.name} - Khách`} 
                                fill={driverColors[index % driverColors.length]} 
                                onClick={(data) => handlePointClick(data, driver.id, 'driver')}
                                cursor="pointer"
                            />
                        ))}
                        {activeDrivers.map((driver, index) => (
                            <Bar 
                                key={`${driver.id}-cargo`} 
                                stackId={driver.id} 
                                dataKey={`${driver.name}_cargoTrips`} 
                                name={`${driver.name} - Hàng`} 
                                fill={driverColors[index % driverColors.length]} 
                                fillOpacity={0.6} 
                                onClick={(data) => handlePointClick(data, driver.id, 'driver')}
                                cursor="pointer"
                            />
                        ))}
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card">
                <h3 className="chart-title">Quãng đường đi của từng xe (km)</h3>
                <p className="chart-subtitle">Nhấn vào điểm biểu đồ để xem chi tiết</p>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toFixed(1)} km`} />
                        <Legend />
                        {activeVehicles.map((vehicle, index) => (
                            <Line 
                                key={vehicle.id} 
                                type="monotone" 
                                dataKey={`${vehicle.licensePlate}_distance`} 
                                name={vehicle.licensePlate} 
                                stroke={vehicleColors[index % vehicleColors.length]} 
                                strokeWidth={2} 
                                activeDot={{ r: 6, onClick: (props) => handlePointClick(props, vehicle.id, 'vehicle'), cursor: 'pointer' }}
                            />
                        ))}
                    </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </div>

      {/* Section: Thống kê Tháng */}
      <div className="monthly-section">
        <div className="section-header">
            <div className="section-title">
                <div className="icon-box">
                    <CalendarIcon />
                </div>
                <h2 style={{fontSize: '24px', fontWeight: 'bold', margin: 0}}>Quản lý Doanh thu Tháng</h2>
            </div>
            <div className="month-selectors">
                <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="form-select"
                >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>Tháng {m}</option>
                    ))}
                </select>
                 <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="form-select"
                >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                </select>
            </div>
        </div>

        <div className="table-container">
            <div style={{overflowX: 'auto'}}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th scope="col">Xe</th>
                            <th scope="col">Loại xe</th>
                            <th scope="col" className="text-right">Tổng chuyến</th>
                            <th scope="col" className="text-right">Tổng quãng đường</th>
                            <th scope="col" className="text-right">Tổng doanh thu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyStats.map((stat) => (
                            <tr key={stat.vehicle.id}>
                                <td className="vehicle-cell">
                                    <img className="vehicle-img" src={stat.vehicle.imageUrl || 'https://via.placeholder.com/40'} alt="" />
                                    <div>
                                        <div className="vehicle-info-plate">{stat.vehicle.licensePlate}</div>
                                        <div className="vehicle-info-status">{stat.vehicle.status}</div>
                                    </div>
                                </td>
                                <td>
                                    {stat.vehicle.type}
                                </td>
                                <td className="text-right">
                                    {stat.trips}
                                </td>
                                <td className="text-right">
                                    {stat.distance.toLocaleString('vi-VN')} km
                                </td>
                                <td className="text-right font-bold text-primary">
                                    {formatCurrency(stat.revenue)}
                                </td>
                            </tr>
                        ))}
                         {monthlyStats.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{textAlign: 'center', padding: '32px', color: '#6b7280'}}>
                                    Không có dữ liệu báo cáo cho tháng này.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                         <tr>
                            <td colSpan={2}>TỔNG CỘNG</td>
                            <td className="text-right">
                                {monthlyStats.reduce((acc, curr) => acc + curr.trips, 0)}
                            </td>
                            <td className="text-right">
                                {monthlyStats.reduce((acc, curr) => acc + curr.distance, 0).toLocaleString('vi-VN')} km
                            </td>
                            <td className="text-right text-primary">
                                {formatCurrency(monthlyStats.reduce((acc, curr) => acc + curr.revenue, 0))}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;