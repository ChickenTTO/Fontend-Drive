import React, { useState, useEffect, useRef, useMemo } from 'react';
// Import file CSS

// Fallback image generator (replace with real AI service later)
const generateImage = async (prompt) => {
  // Return a consistent placeholder image based on prompt
  return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/450`;
};
import './VehicleList.css';
// Import Icons
import { StatusIcon, LoadingSpinner, DotsVerticalIcon, CalendarIcon, XIcon, ArrowLeftIcon, PencilIcon } from '../../components/icons';
import * as vehicleApi from '../../api/vehicleApi';

// --- Components Con (Modals & Views) ---

const VehicleStatsModal = ({ isOpen, onClose, vehicle, reports }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const stats = useMemo(() => {
        if (!vehicle) return { daily: [], totalRevenue: 0, totalDistance: 0 };

        const filteredReports = reports.filter(r => {
            const d = new Date(r.date);
            return r.vehicleId === vehicle.id && 
                   d.getMonth() + 1 === selectedMonth && 
                   d.getFullYear() === selectedYear;
        });

        const sortedReports = filteredReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const totalRevenue = sortedReports.reduce((sum, r) => sum + r.revenue, 0);
        const totalDistance = sortedReports.reduce((sum, r) => sum + r.distance, 0);

        return { daily: sortedReports, totalRevenue, totalDistance };
    }, [vehicle, reports, selectedMonth, selectedYear]);

    if (!isOpen || !vehicle) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-box large">
                <div className="modal-header">
                    <div>
                        <h3 style={{fontSize: '20px', fontWeight: 'bold'}}>Thống kê Doanh thu xe {vehicle.licensePlate}</h3>
                        <p style={{fontSize: '14px', color: '#6b7280', margin: 0}}>{vehicle.type}</p>
                    </div>
                    <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer'}}><XIcon /></button>
                </div>
                
                <div className="modal-body" style={{paddingBottom: 0}}>
                     <div style={{display: 'flex', gap: '16px', marginBottom: '16px'}}>
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="form-select" style={{width: 'auto'}}
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>Tháng {m}</option>
                            ))}
                        </select>
                         <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="form-select" style={{width: 'auto'}}
                        >
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                        </select>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px'}}>
                        <div style={{background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'}}>
                            <p style={{fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '4px'}}>Tổng doanh thu tháng</p>
                            <p style={{fontSize: '24px', fontWeight: 'bold', color: '#2563eb'}}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
                            </p>
                        </div>
                         <div style={{background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'}}>
                            <p style={{fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '4px'}}>Tổng quãng đường</p>
                            <p style={{fontSize: '24px', fontWeight: 'bold', color: '#ea580c'}}>
                                {stats.totalDistance.toLocaleString('vi-VN')} km
                            </p>
                        </div>
                    </div>
                </div>

                <div className="modal-body" style={{background: '#f9fafb', flex: 1}}>
                    <h4 style={{fontWeight: '600', marginBottom: '12px'}}>Chi tiết theo ngày</h4>
                    <div style={{background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden'}}>
                        <table className="stats-table">
                            <thead>
                                <tr>
                                    <th>Ngày</th>
                                    <th style={{textAlign: 'right'}}>Số chuyến</th>
                                    <th style={{textAlign: 'right'}}>Quãng đường</th>
                                    <th style={{textAlign: 'right'}}>Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.daily.map((report) => (
                                    <tr key={report.id}>
                                        <td>{new Date(report.date).toLocaleDateString('vi-VN')}</td>
                                        <td style={{textAlign: 'right'}}>{report.customerTrips + report.cargoTrips}</td>
                                        <td style={{textAlign: 'right'}}>{report.distance} km</td>
                                        <td style={{textAlign: 'right', fontWeight: 'bold', color: '#16a34a'}}>
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(report.revenue)}
                                        </td>
                                    </tr>
                                ))}
                                {stats.daily.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{textAlign: 'center', padding: '24px', color: '#6b7280'}}>
                                            Không có dữ liệu vận hành trong tháng này.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div className="modal-footer">
                     <button onClick={onClose} className="btn-secondary">Đóng</button>
                </div>
            </div>
        </div>
    );
};

const ImageGeneratorModal = ({ isOpen, onClose, onImageGenerated }) => {
  const [prompt, setPrompt] = useState('Một chiếc xe van giao hàng màu trắng hiện đại, nhìn từ bên cạnh, nền sạch');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Câu lệnh không được để trống.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Mock generated image if service fails or isn't real
      let imageUrl;
      try {
          imageUrl = await generateImage(prompt, aspectRatio);
      } catch (e) {
          console.warn("AI Service failed, using mock.", e);
          imageUrl = `https://picsum.photos/seed/${Date.now()}/800/450`;
      }
      onImageGenerated(imageUrl);
      onClose();
    } catch (err) {
      setError(err.message || 'Không thể tạo ảnh. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
            <h3>Tạo ảnh xe bằng AI</h3>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Câu lệnh</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="form-textarea"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tỷ lệ khung hình</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="form-select"
            >
              <option value="16:9">16:9 (Ngang)</option>
              <option value="9:16">9:16 (Dọc)</option>
              <option value="1:1">1:1 (Vuông)</option>
              <option value="4:3">4:3</option>
              <option value="3:4">3:4</option>
            </select>
          </div>
          {error && <p style={{color: '#ef4444', fontSize: '14px'}}>{error}</p>}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">Hủy</button>
          <button onClick={handleGenerate} disabled={isLoading} className="btn-primary">
            {isLoading ? <LoadingSpinner /> : 'Tạo ảnh'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- Delete Confirmation Modal --- */
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, isLoading, vehicle }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <div className="modal-header">
                    <h3>Xác nhận xóa xe</h3>
                </div>
                <div className="modal-body">
                    <p>Bạn có chắc chắn muốn xóa xe <strong>{vehicle?.licensePlate}</strong>? Hành động này sẽ ẩn xe khỏi hệ thống.</p>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn-secondary">Hủy</button>
                    <button onClick={onConfirm} className="btn-primary" disabled={isLoading}>{isLoading ? 'Đang xóa...' : 'Xóa'}</button>
                </div>
            </div>
        </div>
    );
};

const MaintenanceModal = ({ isOpen, onClose, onSave }) => {
    const [record, setRecord] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'periodic',
        description: '',
        cost: 0,
        provider: '',
        odometer: 0
    });

    const handleSubmit = () => {
        if (record.description && record.cost && record.provider) {
            onSave({
                ...record,
                id: `m${Date.now()}`
            });
            setRecord({ date: new Date().toISOString().split('T')[0], type: 'periodic', description: '', cost: 0, provider: '', odometer: 0 });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <div className="modal-header">
                    <h3>Thêm Phiếu Bảo Dưỡng</h3>
                </div>
                <div className="modal-body">
                    <div className="form-row">
                        <div className="form-group">
                             <label className="form-label">Ngày thực hiện</label>
                             <input type="date" value={record.date} onChange={e => setRecord({...record, date: e.target.value})} className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Loại</label>
                            <select value={record.type} onChange={e => setRecord({...record, type: e.target.value})} className="form-select">
                                <option value="periodic">Định kỳ</option>
                                <option value="repair">Sửa chữa</option>
                                <option value="inspection">Đăng kiểm</option>
                                <option value="tire">Thay lốp</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                         <label className="form-label">Mô tả công việc</label>
                         <textarea rows={3} value={record.description} onChange={e => setRecord({...record, description: e.target.value})} className="form-textarea" placeholder="Chi tiết sửa chữa..." />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Chi phí (VNĐ)</label>
                            <input type="number" value={record.cost} onChange={e => setRecord({...record, cost: parseInt(e.target.value)})} className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Số ODO (km)</label>
                            <input type="number" value={record.odometer} onChange={e => setRecord({...record, odometer: parseInt(e.target.value)})} className="form-input" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Đơn vị thực hiện</label>
                        <input type="text" value={record.provider} onChange={e => setRecord({...record, provider: e.target.value})} className="form-input" placeholder="Gara A, Đại lý B..." />
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn-secondary">Hủy</button>
                    <button onClick={handleSubmit} className="btn-primary">Lưu phiếu</button>
                </div>
            </div>
        </div>
    );
};

const HandoverModal = ({ isOpen, onClose, data, vehicleName }) => {
    const [activeAction, setActiveAction] = useState('receive');
    
    // Mock state
    const [fuel, setFuel] = useState(85);
    const [odo, setOdo] = useState(0);
    const [notes, setNotes] = useState('');
    const [cleanliness, setCleanliness] = useState('Sạch');

    useEffect(() => {
        if (!isOpen) return;
        const t = setTimeout(() => {
            setActiveAction('receive');
            setNotes('');
        }, 0);
        return () => clearTimeout(t);
    }, [isOpen]);

    if (!isOpen || !data) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <div className="modal-header">
                     <div>
                        <h3>Thông tin Bàn giao xe</h3>
                        <p style={{fontSize: '14px', color: '#6b7280', margin: 0}}>{vehicleName} • {new Date(data.date).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <button onClick={onClose} style={{background: 'none', border: 'none', cursor: 'pointer'}}><XIcon /></button>
                </div>

                <div className="modal-body">
                    <div className="handover-toggle">
                         <button 
                            onClick={() => setActiveAction('receive')}
                            className={`toggle-btn ${activeAction === 'receive' ? 'receive active' : 'inactive'}`}
                        >
                            NHẬN XE (Bắt đầu)
                        </button>
                        <button 
                             onClick={() => setActiveAction('return')}
                            className={`toggle-btn ${activeAction === 'return' ? 'return active' : 'inactive'}`}
                        >
                            TRẢ XE (Kết thúc)
                        </button>
                    </div>

                     <div style={{background: '#eff6ff', padding: '12px', borderRadius: '6px', border: '1px solid #bfdbfe', marginBottom: '16px'}}>
                        <p style={{fontWeight: '600', color: '#374151', margin: 0}}>Tài xế: {data.driverName}</p>
                        <p style={{fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0'}}>Thời gian: {data.timeRange}</p>
                     </div>

                     <div className="form-group">
                        <label className="form-label">Số Km (ODO)</label>
                        <input 
                            type="number" 
                            className="form-input" 
                            placeholder="Nhập số ODO..."
                            value={odo || ''}
                            onChange={(e) => setOdo(parseInt(e.target.value))}
                        />
                     </div>

                     <div className="form-group">
                        <label className="form-label">Mức nhiên liệu (%)</label>
                        <input 
                            type="range" 
                            min="0" max="100" 
                            style={{width: '100%'}}
                            value={fuel}
                            onChange={(e) => setFuel(parseInt(e.target.value))}
                        />
                        <div className="range-container">
                            <span>0%</span>
                            <span className="range-val">{fuel}%</span>
                            <span>100%</span>
                        </div>
                     </div>

                     <div className="form-group">
                        <label className="form-label">Tình trạng vệ sinh</label>
                        <select 
                            value={cleanliness} 
                            onChange={(e) => setCleanliness(e.target.value)}
                            className="form-select"
                        >
                            <option>Sạch</option>
                            <option>Bình thường</option>
                            <option>Bẩn (Cần rửa)</option>
                        </select>
                     </div>

                     <div className="form-group">
                        <label className="form-label">Ghi chú / Hư hại</label>
                        <textarea 
                            rows={3} 
                            className="form-textarea"
                            placeholder="Mô tả trầy xước, sự cố..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                     </div>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn-secondary">Đóng</button>
                    <button 
                        onClick={() => { alert('Đã lưu thông tin bàn giao!'); onClose(); }} 
                        className="btn-primary"
                        style={{backgroundColor: activeAction === 'receive' ? '#2563eb' : '#16a34a'}}
                    >
                        Lưu {activeAction === 'receive' ? 'Nhận xe' : 'Trả xe'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const VehicleDetailView = ({ vehicle, onBack, onUpdateVehicle, reports, drivers }) => {
    const [activeTab, setActiveTab] = useState('history');
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    
    // State for Handover Modal
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    const historyData = useMemo(() => {
        const formatTime = (isoString) => {
             if (!isoString) return '--:--';
             return new Date(isoString).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
        };

        if (vehicle.assignments && vehicle.assignments.length > 0) {
            return vehicle.assignments
                .filter(a => a.status === 'completed')
                .map(a => {
                    const currentDriver = drivers.find(d => d.id === vehicle.driverId);
                    return {
                        id: a.id,
                        date: a.endTime ? a.endTime.split('T')[0] : 'N/A',
                        timeRange: `${formatTime(a.startTime)} - ${formatTime(a.endTime)}`,
                        desc: `Chuyến: ${a.pickupAddress} -> ${a.destinationAddress}`,
                        driverName: currentDriver ? currentDriver.name : 'Tài xế hiện tại',
                        distance: 'N/A', 
                        revenue: a.price || 0
                    };
                })
                .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        
        return reports
            .filter(r => r.vehicleId === vehicle.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(r => {
                const driver = drivers.find(d => d.id === r.driverId);
                return {
                    id: r.id,
                    date: r.date,
                    timeRange: r.startTime && r.endTime ? `${formatTime(r.startTime)} - ${formatTime(r.endTime)}` : 'Cả ngày',
                    desc: `Hoạt động ngày: ${r.customerTrips} khách, ${r.cargoTrips} hàng`,
                    driverName: driver ? driver.name : 'Chưa xác định',
                    distance: `${r.distance} km`,
                    revenue: r.revenue
                };
            });
    }, [vehicle, reports, drivers]);

    const handleAddMaintenance = (record) => {
        const updatedVehicle = {
            ...vehicle,
            maintenanceHistory: [record, ...(vehicle.maintenanceHistory || [])]
        };
        onUpdateVehicle(updatedVehicle);
    };

    return (
        <div className="detail-container">
            <MaintenanceModal 
                isOpen={isMaintenanceModalOpen} 
                onClose={() => setIsMaintenanceModalOpen(false)} 
                onSave={handleAddMaintenance} 
            />

            <HandoverModal 
                isOpen={!!selectedHistoryItem}
                onClose={() => setSelectedHistoryItem(null)}
                data={selectedHistoryItem}
                vehicleName={vehicle.licensePlate}
            />

            {/* Header */}
            <div className="detail-header">
                <button onClick={onBack} className="back-btn">
                    <ArrowLeftIcon />
                </button>
                <div style={{flex: 1}}>
                    <h2 style={{fontSize: '20px', fontWeight: 'bold', margin: 0}}>{vehicle.licensePlate}</h2>
                    <p style={{fontSize: '14px', color: '#6b7280', margin: 0}}>{vehicle.type} - {vehicle.seats} ghế</p>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <StatusIcon status={vehicle.status} />
                    <span style={{textTransform: 'capitalize', fontSize: '14px', fontWeight: '500'}}>{vehicle.status}</span>
                </div>
            </div>

            <div className="detail-content">
                <div className="tabs-container">
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    >
                        Lịch sử lái xe
                    </button>
                    <button
                        onClick={() => setActiveTab('maintenance')}
                        className={`tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`}
                    >
                        Bảo dưỡng & Sửa chữa
                    </button>
                </div>

                <div className="content-card">
                    {activeTab === 'history' && (
                        <div style={{padding: '16px', flex: 1, overflowY: 'auto'}}>
                            <h3 style={{fontWeight: 'bold', fontSize: '16px', marginBottom: '16px'}}>Nhật ký hoạt động</h3>
                            <div>
                                {historyData.length > 0 ? (
                                    historyData.map((item) => (
                                        <div 
                                            key={item.id} 
                                            onClick={() => setSelectedHistoryItem(item)}
                                            className="history-item"
                                        >
                                            <div className="history-top">
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    <span className="history-date">
                                                        {new Date(item.date).toLocaleDateString('vi-VN')}
                                                    </span>
                                                    <span className="history-time">
                                                        {item.timeRange}
                                                    </span>
                                                </div>
                                                <div style={{textAlign: 'right'}}>
                                                    <span className="history-price">{formatCurrency(item.revenue)}</span>
                                                </div>
                                            </div>
                                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                                <div style={{fontSize: '12px', fontWeight: '600', color: '#2563eb'}}>TX: {item.driverName}</div>
                                                <span style={{fontSize: '12px', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', color: '#4b5563'}}>{item.distance}</span>
                                            </div>
                                            <p className="history-desc" style={{marginTop: '4px'}}>{item.desc}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{textAlign: 'center', color: '#6b7280', padding: '24px'}}>Chưa có lịch sử chuyến đi nào.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'maintenance' && (
                        <div style={{padding: '16px', flex: 1, overflowY: 'auto'}}>
                            <div className="maintenance-header">
                                <h3 style={{fontWeight: 'bold', fontSize: '16px', margin: 0}}>Lịch sử bảo dưỡng</h3>
                                <button onClick={() => setIsMaintenanceModalOpen(true)} className="btn-primary" style={{fontSize: '12px'}}>
                                    <PencilIcon /> Thêm phiếu mới
                                </button>
                            </div>
                            
                            <div>
                                {vehicle.maintenanceHistory && vehicle.maintenanceHistory.length > 0 ? (
                                    vehicle.maintenanceHistory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                                        <div key={record.id} className="maintenance-item">
                                            <div style={{flex: 1}}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                                                    <span style={{fontSize: '14px', fontWeight: 'bold', background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px'}}>{new Date(record.date).toLocaleDateString('vi-VN')}</span>
                                                    <span className={`maintenance-tag ${
                                                        record.type === 'periodic' ? 'tag-periodic' :
                                                        record.type === 'repair' ? 'tag-repair' :
                                                        'tag-inspection'
                                                    }`}>
                                                        {record.type === 'periodic' ? 'Định kỳ' : record.type === 'repair' ? 'Sửa chữa' : record.type === 'inspection' ? 'Đăng kiểm' : 'Lốp'}
                                                    </span>
                                                </div>
                                                <p style={{fontWeight: '500', color: '#111827', margin: '0 0 4px 0'}}>{record.description}</p>
                                                <p style={{fontSize: '13px', color: '#6b7280', margin: 0}}>Tại: {record.provider} {record.odometer ? `• ODO: ${record.odometer} km` : ''}</p>
                                            </div>
                                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
                                                <span style={{fontSize: '16px', fontWeight: 'bold', color: '#dc2626'}}>{formatCurrency(record.cost)}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db'}}>
                                        <p style={{color: '#6b7280'}}>Chưa có hồ sơ bảo dưỡng nào.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const VehicleList = ({ vehicles, setVehicles, onViewOnMap, reports, initialVehicleId, onClearInitialVehicleId, drivers }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [statsVehicle, setStatsVehicle] = useState(null);
  const [formData, setFormData] = useState({});
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // State chuyển sang Detail View
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState(null);
  
  const menuRef = useRef(null);

  useEffect(() => {
    if (!initialVehicleId) return;
    const t = setTimeout(() => {
        setSelectedVehicleForDetail(initialVehicleId);
        if (onClearInitialVehicleId) onClearInitialVehicleId();
    }, 0);
    return () => clearTimeout(t);
  }, [initialVehicleId, vehicles, onClearInitialVehicleId]);

  const initialFormState = {
    licensePlate: '',
    type: 'Sedan',
    seats: 4,
    status: 'idle',
    maintenanceDate: '',
    imageUrl: ''
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData(initialFormState);
    setIsFormModalOpen(true);
  };
  
  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle);
    setOpenMenuId(null);
    setIsFormModalOpen(true);
  };

  const openStatsModal = (vehicle) => {
      setStatsVehicle(vehicle);
      setIsStatsModalOpen(true);
      setOpenMenuId(null);
  };

  const handleFormSubmit = () => {
    if (editingVehicle) {
      setVehicles(vehicles.map(v => v.id === editingVehicle.id ? { ...v, ...formData } : v));
    } else {
      const vehicleToAdd = {
          id: `v${Date.now()}`,
          location: { lat: 34.05, lng: -118.25 }, // Default location
          route: [],
          maintenanceHistory: [],
          ...formData
      };
      setVehicles([...vehicles, vehicleToAdd]);
    }
    setIsFormModalOpen(false);
  };

  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteVehicle = (vehicle) => {
    setOpenMenuId(null);
    setDeletingVehicle(vehicle);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteVehicle = async () => {
    if (!deletingVehicle) return;
    try {
      setIsDeleting(true);
      // Call backend delete (soft delete)
      try {
        await vehicleApi.deleteVehicle(deletingVehicle.id);
      } catch (err) {
        // If API fails, proceed with client-side removal to keep UX responsive
        console.warn('API delete failed, falling back to client-side only.', err);
        throw err;
      }

      setVehicles(prev => prev.filter(v => v.id !== deletingVehicle.id));
      setIsDeleteModalOpen(false);
      setDeletingVehicle(null);
      alert('Xóa xe thành công');
    } catch (err) {
      alert('Không thể xóa xe: ' + (err.message || 'Lỗi máy chủ'));
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleViewLocation = (vehicleId) => {
    onViewOnMap(vehicleId);
    setOpenMenuId(null);
  };

  const handleFormDataChange = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  }

  const handleUpdateVehicle = (updatedVehicle) => {
      setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
  };

  // Render Logic
  const selectedVehicleObj = vehicles.find(v => v.id === selectedVehicleForDetail);

  if (selectedVehicleObj) {
      return (
          <VehicleDetailView 
            vehicle={selectedVehicleObj} 
            onBack={() => setSelectedVehicleForDetail(null)} 
            onUpdateVehicle={handleUpdateVehicle}
            reports={reports}
            drivers={drivers}
          />
      );
  }

  return (
    <div className="vehicle-page">
       <ImageGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onImageGenerated={(url) => setFormData(v => ({ ...v, imageUrl: url }))}
      />
      
      <VehicleStatsModal 
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        vehicle={statsVehicle}
        reports={reports}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeletingVehicle(null); }}
        onConfirm={confirmDeleteVehicle}
        isLoading={isDeleting}
        vehicle={deletingVehicle}
      />

      <div className="page-header">
        <h2>Quản lý Xe công ty</h2>
        <button onClick={openAddModal} className="btn-primary">
          Thêm Xe
        </button>
      </div>

      <div className="vehicle-grid">
        {vehicles.map((vehicle) => (
          <div 
            key={vehicle.id} 
            className="vehicle-card"
            onClick={() => setSelectedVehicleForDetail(vehicle.id)}
          >
            <div 
                className="card-menu-btn"
                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === vehicle.id ? null : vehicle.id); }}
            >
                <DotsVerticalIcon />
            </div>

            {/* Visible delete button (outside dropdown) */}
            <button
                className="card-delete-btn"
                onClick={(e) => { e.stopPropagation(); handleDeleteVehicle(vehicle); }}
                title="Xóa xe"
            >
                <XIcon />
            </button>

            {openMenuId === vehicle.id && (
                <div ref={menuRef} className="card-menu-dropdown" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setSelectedVehicleForDetail(vehicle.id)} className="menu-item" style={{fontWeight: 'bold'}}>Xem chi tiết & Bảo dưỡng</button>
                    <button onClick={() => openStatsModal(vehicle)} className="menu-item">Xem doanh thu</button>
                    <button onClick={() => openEditModal(vehicle)} className="menu-item">Chỉnh sửa thông tin</button>
                    <button onClick={() => handleViewLocation(vehicle.id)} className="menu-item">Xem vị trí</button>
                    <button onClick={() => handleDeleteVehicle(vehicle)} className="menu-item danger">Xóa xe</button>
                </div>
            )}

            <img src={vehicle.imageUrl || 'https://via.placeholder.com/400x300?text=Car'} alt={vehicle.type} className="vehicle-img" />
            <div className="vehicle-info">
              <h3 className="vehicle-plate">{vehicle.licensePlate}</h3>
              <p className="vehicle-desc">{vehicle.type} - {vehicle.seats} ghế</p>
              <div className="vehicle-status">
                <StatusIcon status={vehicle.status} />
                <span>{vehicle.status}</span>
              </div>
              <p className="vehicle-maintenance">Bảo dưỡng kế tiếp: {vehicle.maintenanceDate || 'Chưa đặt'}</p>
            </div>
          </div>
        ))}
      </div>

      {isFormModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
                <h3>{editingVehicle ? 'Chỉnh sửa thông tin xe' : 'Thêm Xe Mới'}</h3>
                <button onClick={() => setIsFormModalOpen(false)} style={{background:'none', border:'none', cursor:'pointer'}}><XIcon /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                  <label className="form-label">Biển số xe</label>
                  <input type="text" placeholder="59A-123.45" value={formData.licensePlate || ''} onChange={(e) => handleFormDataChange('licensePlate', e.target.value)} className="form-input" />
              </div>
              <div className="form-group">
                  <label className="form-label">Loại xe</label>
                  <input type="text" placeholder="VD: Sedan, SUV..." value={formData.type || ''} onChange={(e) => handleFormDataChange('type', e.target.value)} className="form-input" />
              </div>
              <div className="form-group">
                  <label className="form-label">Số ghế</label>
                  <input type="number" placeholder="4" value={formData.seats || ''} onChange={(e) => handleFormDataChange('seats', parseInt(e.target.value) || 0)} className="form-input" />
              </div>
              <div className="form-group">
                  <label className="form-label">Bảo dưỡng kế tiếp</label>
                  <input type="date" value={formData.maintenanceDate || ''} onChange={(e) => handleFormDataChange('maintenanceDate', e.target.value)} className="form-input" />
              </div>
               <div className="form-group">
                 <label className="form-label">Hình ảnh</label>
                 <div style={{display: 'flex', gap: '8px'}}>
                     <input type="text" placeholder="URL hình ảnh" value={formData.imageUrl || ''} onChange={(e) => handleFormDataChange('imageUrl', e.target.value)} className="form-input" />
                      <button onClick={() => setIsGeneratorOpen(true)} className="btn-primary" style={{whiteSpace: 'nowrap'}}>
                        Dùng AI
                      </button>
                 </div>
               </div>
               {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" style={{marginTop: '8px', borderRadius: '6px', width: '100%', maxHeight: '160px', objectFit: 'contain'}}/>}
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsFormModalOpen(false)} className="btn-secondary">Hủy</button>
              <button onClick={handleFormSubmit} className="btn-primary">{editingVehicle ? 'Lưu thay đổi' : 'Thêm'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleList;