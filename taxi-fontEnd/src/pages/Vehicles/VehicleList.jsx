import React, { useState, useEffect } from 'react';
import './VehicleList.css';
// Giả sử các icon này có sẵn, nếu chưa bạn có thể dùng text tạm thời
import { StatusIcon, LoadingSpinner, XIcon } from '../../components/icons'; 
import vehicleApi from '../../api/vehicleApi';

// =================== MODALS ===================

// --- Thêm / Sửa xe ---
const VehicleFormModal = ({ isOpen, onClose, vehicle, onSave }) => {
    const [form, setForm] = useState({
        licensePlate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        seats: 4,
        color: 'Trắng',
        status: 'active'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (vehicle) setForm(vehicle);
        else setForm({ licensePlate: '', brand: '', model: '', year: new Date().getFullYear(), seats: 4, color: 'Trắng', status: 'active' });
    }, [vehicle]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            let res;
            if (vehicle) res = await vehicleApi.update(vehicle.id, form);
            else res = await vehicleApi.create(form);
            onSave(res.data);
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || 'Lưu xe thất bại');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{vehicle ? 'Cập nhật thông tin xe' : 'Thêm xe mới'}</h3>
                    <button onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Biển số xe <span style={{color:'red'}}>*</span></label>
                        <input className="form-input" placeholder="VD: 30A-123.45" value={form.licensePlate} onChange={e => setForm({ ...form, licensePlate: e.target.value })} autoFocus />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Hãng xe</label>
                            <input className="form-input" placeholder="Toyota, Honda..." value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Dòng xe (Model)</label>
                            <input className="form-input" placeholder="Vios, City..." value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Năm SX</label>
                            <input className="form-input" type="number" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Số chỗ</label>
                            <input className="form-input" type="number" value={form.seats} onChange={e => setForm({ ...form, seats: parseInt(e.target.value) || 4 })} />
                        </div>
                    </div>

                    <div className="form-row">
                         <div className="form-group">
                            <label className="form-label">Màu sắc</label>
                            <input className="form-input" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Trạng thái</label>
                            <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="active">🟢 Hoạt động</option>
                                <option value="maintenance">🟠 Bảo dưỡng</option>
                                <option value="rented">🔵 Đang cho thuê</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Hủy bỏ</button>
                    <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu thông tin'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Doanh thu ---
const VehicleStatsModal = ({ isOpen, onClose, vehicle }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !vehicle) return;
        const fetchReports = async () => {
            setLoading(true);
            try {
                const res = await vehicleApi.getRevenue(vehicle.id);
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
    const totalRevenue = reports.reduce((sum, r) => sum + (r.finalPrice || 0), 0);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Doanh thu: {vehicle.licensePlate}</h3>
                    <button onClick={onClose}>✕</button>
                </div>
                <div className="modal-body" style={{textAlign: 'center', padding: '40px 20px'}}>
                    {loading ? <LoadingSpinner /> : (
                        <div>
                            <p style={{color:'#6b7280', marginBottom: '8px'}}>Tổng doanh thu ghi nhận</p>
                            <h2 style={{fontSize: '32px', color: '#2563eb', margin: 0}}>
                                {totalRevenue.toLocaleString('vi-VN')} đ
                            </h2>
                            <p style={{marginTop: '16px', fontSize: '13px', color: '#9ca3af'}}>
                                Dựa trên {reports.length} chuyến đi hoàn thành
                            </p>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn-secondary">Đóng</button>
                </div>
            </div>
        </div>
    );
};

// --- Bảo dưỡng ---
const MaintenanceModal = ({ isOpen, onClose, vehicleId, onSave }) => {
    const [record, setRecord] = useState({ date: '', type: 'periodic', description: '', cost: 0, provider: '', odometer: 0 });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await vehicleApi.addMaintenance(vehicleId, record);
            onSave(res.data);
            onClose();
        } catch (err) {
            alert('Lỗi khi lưu phiếu');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Tạo phiếu bảo dưỡng</h3>
                    <button onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Ngày thực hiện</label>
                            <input className="form-input" type="date" value={record.date} onChange={e => setRecord({...record, date: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Loại bảo dưỡng</label>
                            <select className="form-select" value={record.type} onChange={e => setRecord({...record, type: e.target.value})}>
                                <option value="periodic">Định kỳ</option>
                                <option value="repair">Sửa chữa</option>
                                <option value="inspection">Đăng kiểm</option>
                                <option value="tire">Thay lốp</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Mô tả chi tiết</label>
                        <textarea className="form-textarea" placeholder="Thay dầu, lọc gió..." value={record.description} onChange={e => setRecord({...record, description: e.target.value})} />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Chi phí (VNĐ)</label>
                            <input className="form-input" type="number" value={record.cost} onChange={e => setRecord({...record, cost: parseInt(e.target.value)||0})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Số ODO (km)</label>
                            <input className="form-input" type="number" value={record.odometer} onChange={e => setRecord({...record, odometer: parseInt(e.target.value)||0})} />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Đơn vị thực hiện</label>
                        <input className="form-input" placeholder="Gara A, Hãng xe..." value={record.provider} onChange={e => setRecord({...record, provider: e.target.value})} />
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn-secondary">Hủy</button>
                    <button onClick={handleSubmit} className="btn-primary" disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu phiếu'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Xóa ---
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, vehicle, loading }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" style={{maxWidth: '400px'}} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Xác nhận xóa</h3>
                    <button onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <p>Bạn có chắc muốn xóa xe <b>{vehicle?.licensePlate}</b> khỏi hệ thống?</p>
                    <p style={{fontSize: '13px', color: '#dc2626'}}>Hành động này không thể hoàn tác.</p>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn-secondary">Hủy</button>
                    <button onClick={onConfirm} className="btn-primary" style={{backgroundColor: '#dc2626'}} disabled={loading}>
                        {loading ? 'Đang xóa...' : 'Xóa Vĩnh Viễn'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// =================== MAIN COMPONENT ===================
const Vehicle = ({ onViewOnMap }) => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [statsVehicle, setStatsVehicle] = useState(null);
    const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res = await vehicleApi.getAll();
            setVehicles(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVehicles(); }, []);

    const handleDelete = async () => {
        if (!selectedVehicle) return;
        setIsDeleting(true);
        try {
            await vehicleApi.delete(selectedVehicle.id);
            setVehicles(prev => prev.filter(v => v.id !== selectedVehicle.id));
            setIsDeleteOpen(false);
        } catch (err) {
            alert('Xóa thất bại');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="vehicle-page">
            <VehicleFormModal
                isOpen={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingVehicle(null); }}
                vehicle={editingVehicle}
                onSave={(data) => {
                    if (editingVehicle) setVehicles(prev => prev.map(v => v.id === data.id ? data : v));
                    else setVehicles(prev => [data, ...prev]);
                }}
            />
            <VehicleStatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} vehicle={statsVehicle} />
            <MaintenanceModal
                isOpen={isMaintenanceOpen}
                onClose={() => setIsMaintenanceOpen(false)}
                vehicleId={selectedVehicle?.id}
                onSave={(record) => {
                    setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? {...v, maintenanceHistory: [record, ...(v.maintenanceHistory||[])]} : v));
                }}
            />
            <DeleteConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} vehicle={selectedVehicle} loading={isDeleting} />

            <div className="page-header">
                <h2>Quản lý Xe công ty</h2>
                <button className="btn-primary" onClick={() => setIsFormOpen(true)}>+ Thêm xe mới</button>
            </div>

            {loading ? <LoadingSpinner /> : (
                <div className="vehicle-grid">
                    {vehicles.map(vehicle => (
                        <div key={vehicle.id} className="vehicle-card">
                            <img src={vehicle.imageUrl || 'https://via.placeholder.com/400x300'} alt={vehicle.type} className="vehicle-img" />
                            
                            <div className="vehicle-info">
                                <h3>{vehicle.licensePlate}</h3>
                                <p>{vehicle.brand} {vehicle.model} • {vehicle.year} • {vehicle.seats} chỗ</p>
                                
                                <div className="vehicle-status">
                                    <StatusIcon status={vehicle.status} />
                                    <span>{vehicle.status === 'active' ? 'Hoạt động' : vehicle.status === 'maintenance' ? 'Bảo dưỡng' : 'Đang thuê'}</span>
                                </div>
                            </div>

                            <div className="vehicle-actions">
                                <button className="icon-btn" title="Doanh thu" onClick={() => { setStatsVehicle(vehicle); setIsStatsOpen(true); }}>
                                    💵
                                </button>
                                <button className="icon-btn" title="Bảo dưỡng" onClick={() => { setSelectedVehicle(vehicle); setIsMaintenanceOpen(true); }}>
                                    🔧
                                </button>
                                <button className="icon-btn" title="Vị trí" onClick={() => onViewOnMap(vehicle.id)}>
                                    📍
                                </button>
                                <button className="icon-btn" title="Sửa" onClick={() => { setEditingVehicle(vehicle); setIsFormOpen(true); }}>
                                    ✎
                                </button>
                                <button className="icon-btn delete" title="Xóa" onClick={() => { setSelectedVehicle(vehicle); setIsDeleteOpen(true); }}>
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Vehicle;