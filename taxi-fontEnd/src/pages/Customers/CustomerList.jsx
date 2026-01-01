import React, { useState } from 'react';
import './CustomerList.css';
import { XIcon } from '../../components/icons';

const CustomerList = ({ customers, setCustomers, vehicles }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [viewingHistoryCustomer, setViewingHistoryCustomer] = useState(null);
    const [formData, setFormData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const calculateDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return '';
        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();
        const diffMs = end - start;
        if (diffMs < 0) return '';
        
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        
        if (hours > 0) return `${hours}h ${mins}p`;
        return `${mins} phút`;
    };

    const getCustomerStats = (customer) => {
        // 1. Lấy dữ liệu thực từ xe (vehicles prop)
        const realAssignments = [];
        vehicles.forEach(v => {
            if (v.assignments) {
                v.assignments.forEach(a => {
                    if (a.customerPhone === customer.phone) {
                        realAssignments.push(a);
                    }
                });
            }
        });


        const mockHistory = [];
        let mockRevenue = 0;
        let mockTrips = 0;


        if (customer.id === 'c1') {
            mockTrips = 12;
            mockRevenue = 4500000;
            mockHistory.push({ 
                date: '2024-06-15', 
                pickup: '15 P. Ngô Quyền, Hoàn Kiếm',
                destination: 'Sân bay Nội Bài', 
                price: 350000, 
                status: 'completed',
                duration: '45 phút'
            });
            mockHistory.push({ 
                date: '2024-06-10', 
                pickup: '15 P. Ngô Quyền, Hoàn Kiếm',
                destination: 'KCN Thăng Long', 
                price: 200000, 
                status: 'completed',
                duration: '35 phút'
            });
        } else if (customer.id === 'c3') {
            mockTrips = 45;
            mockRevenue = 15200000;
             mockHistory.push({ 
                 date: '2024-06-18', 
                 pickup: 'KCN Yên Phong, Bắc Ninh',
                 destination: 'Cảng Hải Phòng', 
                 price: 1500000, 
                 status: 'completed',
                 duration: '1h 45p'
             });
        }

        // Kết hợp dữ liệu thật và giả
        const combinedHistory = [
            ...realAssignments.map(a => ({
                date: a.pickupTime ? a.pickupTime.split('T')[0] : new Date().toISOString().split('T')[0],
                pickup: a.pickupAddress,
                destination: a.destinationAddress,
                price: a.price || 0,
                status: a.status,
                duration: calculateDuration(a.startTime, a.endTime)
            })),
            ...mockHistory
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const realRevenue = realAssignments.reduce((sum, a) => sum + (a.price || 0), 0);

        return {
            totalTrips: mockTrips + realAssignments.length,
            totalRevenue: mockRevenue + realRevenue,
            history: combinedHistory
        };
    };

    const handleOpenModal = (customer) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData(customer);
        } else {
            setEditingCustomer(null);
            setFormData({ type: 'regular' });
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (editingCustomer) {
            setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...formData } : c));
        } else {
            const newCustomer = {
                ...formData,
                id: `c${Date.now()}`,
            };
            setCustomers(prev => [...prev, newCustomer]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
            setCustomers(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleViewHistory = (customer) => {
        setViewingHistoryCustomer({ customer, stats: getCustomerStats(customer) });
        setIsHistoryModalOpen(true);
    };

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.phone.includes(searchTerm)
    );

    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    return (
        <div className="customer-page">
            {/* Header */}
            <div className="page-header">
                <h2>Quản lý Khách hàng</h2>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="btn-primary"
                >
                    Thêm Khách hàng
                </button>
            </div>

            {/* Search Bar */}
            <div className="search-container">
                <input 
                    type="text" 
                    placeholder="Tìm kiếm theo tên hoặc số điện thoại..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Table */}
            <div className="table-container">
                <div className="table-wrapper">
                    <table className="customer-table">
                        <thead>
                            <tr>
                                <th>Tên khách hàng</th>
                                <th>Số điện thoại</th>
                                <th>Lịch sử đặt xe</th>
                                <th style={{textAlign: 'center'}}>Số cuốc</th>
                                <th style={{textAlign: 'right'}}>Tổng doanh thu</th>
                                <th style={{textAlign: 'right'}}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer) => {
                                    const stats = getCustomerStats(customer);
                                    const lastTrip = stats.history.length > 0 ? stats.history[0] : null;

                                    return (
                                        <tr key={customer.id}>
                                            <td>
                                                <div style={{fontWeight: 'bold', color: '#111827'}}>{customer.name}</div>
                                            </td>
                                            <td style={{color: '#6b7280'}}>
                                                {customer.phone}
                                            </td>
                                            <td>
                                                {lastTrip ? (
                                                    <div className="col-trip-history">
                                                        <span className="trip-destination" title={lastTrip.destination}>{lastTrip.destination}</span>
                                                        <span className="trip-date">{new Date(lastTrip.date).toLocaleDateString('vi-VN')}</span>
                                                        <button onClick={() => handleViewHistory(customer)} className="view-detail-link">
                                                            Xem chi tiết ({stats.history.length})
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{color: '#9ca3af', fontStyle: 'italic'}}>Chưa có dữ liệu</span>
                                                )}
                                            </td>
                                            <td style={{textAlign: 'center', fontWeight: 'bold'}}>
                                                {stats.totalTrips}
                                            </td>
                                            <td style={{textAlign: 'right', fontWeight: 'bold', color: '#16a34a'}}>
                                                {formatCurrency(stats.totalRevenue)}
                                            </td>
                                            <td style={{textAlign: 'right'}}>
                                                <button onClick={() => handleOpenModal(customer)} className="btn-icon btn-edit">
                                                    Sửa
                                                </button>
                                                <button onClick={() => handleDelete(customer.id)} className="btn-icon btn-delete">
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{padding: '24px', textAlign: 'center', color: '#6b7280'}}>
                                        Không tìm thấy khách hàng nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* History Modal */}
            {isHistoryModalOpen && viewingHistoryCustomer && (
                <div className="modal-overlay">
                     <div className="modal-content large">
                        <div className="modal-header">
                            <div>
                                <h3>Lịch sử di chuyển: {viewingHistoryCustomer.customer.name}</h3>
                                <p style={{fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0'}}>{viewingHistoryCustomer.customer.phone}</p>
                            </div>
                            <button onClick={() => setIsHistoryModalOpen(false)} className="btn-close"><XIcon /></button>
                        </div>
                        <div className="modal-body">
                            <table className="customer-table">
                                <thead>
                                    <tr>
                                        <th>Ngày</th>
                                        <th>Điểm đón</th>
                                        <th>Điểm trả</th>
                                        <th style={{textAlign: 'center'}}>Thời gian</th>
                                        <th style={{textAlign: 'center'}}>Trạng thái</th>
                                        <th style={{textAlign: 'right'}}>Giá tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewingHistoryCustomer.stats.history.length > 0 ? (
                                        viewingHistoryCustomer.stats.history.map((trip, idx) => (
                                            <tr key={idx}>
                                                <td style={{whiteSpace: 'nowrap'}}>
                                                    {new Date(trip.date).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td style={{maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={trip.pickup}>
                                                    {trip.pickup}
                                                </td>
                                                <td style={{maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={trip.destination}>
                                                    {trip.destination}
                                                </td>
                                                <td style={{textAlign: 'center'}}>
                                                    {trip.duration || '--'}
                                                </td>
                                                <td style={{textAlign: 'center'}}>
                                                    <span className={`badge ${trip.status === 'completed' ? 'completed' : 'other'}`}>
                                                        {trip.status === 'completed' ? 'Hoàn thành' : trip.status}
                                                    </span>
                                                </td>
                                                <td style={{textAlign: 'right', fontWeight: '500'}}>
                                                    {formatCurrency(trip.price)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={6} style={{textAlign: 'center', padding: '20px', color: '#6b7280'}}>Chưa có lịch sử chuyến đi.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setIsHistoryModalOpen(false)} className="btn-secondary">Đóng</button>
                        </div>
                     </div>
                </div>
            )}

            {/* Edit/Create Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingCustomer ? 'Sửa thông tin khách' : 'Thêm khách hàng'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="btn-close"><XIcon /></button>
                        </div>
                        <div className="modal-body">
                            <input 
                                type="text" 
                                placeholder="Tên khách hàng" 
                                value={formData.name || ''} 
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="form-input"
                            />
                            <input 
                                type="tel" 
                                placeholder="Số điện thoại" 
                                value={formData.phone || ''} 
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                className="form-input"
                            />
                            <input 
                                type="text" 
                                placeholder="Địa chỉ" 
                                value={formData.address || ''} 
                                onChange={e => setFormData({...formData, address: e.target.value})}
                                className="form-input"
                            />
                             <input 
                                type="email" 
                                placeholder="Email (Tuỳ chọn)" 
                                value={formData.email || ''} 
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="form-input"
                            />
                            <select 
                                value={formData.type || 'regular'}
                                onChange={e => setFormData({...formData, type: e.target.value})}
                                className="form-select"
                            >
                                <option value="regular">Khách thường</option>
                                <option value="vip">Khách VIP</option>
                                <option value="corporate">Doanh nghiệp</option>
                            </select>
                            <textarea 
                                placeholder="Ghi chú" 
                                value={formData.notes || ''} 
                                onChange={e => setFormData({...formData, notes: e.target.value})}
                                className="form-textarea"
                            />
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setIsModalOpen(false)} className="btn-secondary">Hủy</button>
                            <button onClick={handleSave} className="btn-primary">Lưu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomerList;