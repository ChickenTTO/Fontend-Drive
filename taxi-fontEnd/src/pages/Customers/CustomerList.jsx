import React, { useState, useEffect } from 'react';
import './CustomerList.css';
import { XIcon } from '../../components/icons';

const CustomerList = ({ customers, setCustomers, vehicles }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', type: 'regular', notes: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) return {};
        return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    };

    // === Fetch customers từ API ===
    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/customers', {
                headers: getAuthHeaders()
            });

            if (!res.ok) {
                console.error('Fetch failed', res.status, res.statusText);
                return;
            }

            const data = await res.json();
            const customerList = Array.isArray(data) ? data : (data.data || []);
            setCustomers(customerList);
        } catch (err) {
            console.error('Lỗi load customers', err);
        } finally {
            setLoading(false);
        }
    };

    // === Thêm / sửa khách ===
    const handleOpenModal = (customer) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                name: customer.name || '',
                phone: customer.phone || '',
                email: customer.email || '',
                address: customer.address || '',
                type: customer.isVIP ? 'vip' : 'regular',
                notes: customer.notes || ''
            });
        } else {
            setEditingCustomer(null);
            setFormData({ name: '', phone: '', email: '', address: '', type: 'regular', notes: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.phone || !formData.phone.trim()) {
            alert('Vui lòng nhập Số điện thoại khách hàng!');
            return;
        }

        try {
            const url = editingCustomer
                ? `http://localhost:5000/api/customers/${editingCustomer._id || editingCustomer.id}`
                : `http://localhost:5000/api/customers`;

            const method = editingCustomer ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                alert(data.message || 'Lỗi lưu thông tin khách hàng');
                return;
            }

            const savedCustomer = data.data || data;

            if (editingCustomer) {
                setCustomers(prev =>
                    prev.map(c => (c._id === savedCustomer._id || c.id === savedCustomer.id ? savedCustomer : c))
                );
            } else {
                setCustomers(prev => [savedCustomer, ...prev]);
            }

            setIsModalOpen(false);
            fetchCustomers();
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối server');
        }
    };

    // === Xóa khách ===
    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/customers/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (res.ok) {
                setCustomers(prev => prev.filter(c => c._id !== id && c.id !== id));
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(errData.message || 'Xóa thất bại');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối server');
        }
    };

    const filteredCustomers = Array.isArray(customers)
        ? customers.filter(c => {
            const nameMatch = c && c.name ? c.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
            const phoneMatch = c && c.phone ? c.phone.includes(searchTerm) : false;
            return nameMatch || phoneMatch;
        })
        : [];

    const formatCurrency = (value) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

    const getCustomerStats = (customer) => {
        const realAssignments = [];
        if (Array.isArray(vehicles)) {
            vehicles.forEach(v => {
                if (v.assignments) {
                    v.assignments.forEach(a => {
                        if (a.customerPhone === customer.phone) realAssignments.push(a);
                    });
                }
            });
        }
        const totalTrips = customer.totalTrips || realAssignments.length;
        const totalRevenue = customer.totalSpent || realAssignments.reduce((sum, a) => sum + (a.price || 0), 0);
        return { totalTrips, totalRevenue };
    };

    return (
        <div className="customer-page">
            <div className="page-header">
                <h2>Quản lý Khách hàng</h2>
                <button onClick={() => handleOpenModal()} className="btn-primary">+ Thêm Khách hàng</button>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="table-container">
                <div className="table-wrapper">
                    <table className="customer-table">
                        <thead>
                            <tr>
                                <th>Tên khách hàng</th>
                                <th>Số điện thoại</th>
                                <th style={{textAlign:'center'}}>Số cuốc</th>
                                <th style={{textAlign:'right'}}>Tổng doanh thu</th>
                                <th style={{textAlign:'right'}}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{textAlign:'center', padding:'20px', color:'#6b7280'}}>
                                        Đang tải danh sách khách hàng...
                                    </td>
                                </tr>
                            ) : filteredCustomers.length > 0 ? filteredCustomers.map(customer => {
                                const stats = getCustomerStats(customer);
                                return (
                                    <tr key={customer.id || customer._id}>
                                        <td>
                                            <strong>{customer.name || 'Khách hàng'}</strong>
                                            {customer.isVIP && <span style={{ marginLeft: 6, background: '#fef3c7', color: '#d97706', fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>VIP</span>}
                                        </td>
                                        <td>{customer.phone}</td>
                                        <td style={{textAlign:'center'}}>{stats.totalTrips}</td>
                                        <td style={{textAlign:'right', color:'#16a34a'}}>{formatCurrency(stats.totalRevenue)}</td>
                                        <td style={{textAlign:'right'}}>
                                            <button onClick={() => handleOpenModal(customer)} className="btn-icon btn-edit">Sửa</button>
                                            <button onClick={() => handleDelete(customer._id || customer.id)} className="btn-icon btn-delete">Xóa</button>
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan={5} style={{textAlign:'center', padding:'20px', color:'#6b7280'}}>
                                        Không tìm thấy khách hàng nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingCustomer ? 'Sửa thông tin khách' : 'Thêm khách hàng'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="btn-close"><XIcon /></button>
                        </div>
                        <div className="modal-body">
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                                Tên khách hàng
                            </label>
                            <input type="text" placeholder="Nhập tên khách hàng" value={formData.name} onChange={e => setFormData({...formData, name:e.target.value})} className="form-input" />
                            
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, marginTop: 8 }}>
                                Số điện thoại <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input type="tel" placeholder="Nhập số điện thoại (Bắt buộc)" value={formData.phone} onChange={e => setFormData({...formData, phone:e.target.value})} className="form-input" required />
                            
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, marginTop: 8 }}>
                                Địa chỉ
                            </label>
                            <input type="text" placeholder="Địa chỉ giao hàng / nhận hàng" value={formData.address} onChange={e => setFormData({...formData, address:e.target.value})} className="form-input" />
                            
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, marginTop: 8 }}>
                                Email
                            </label>
                            <input type="email" placeholder="Email (Tuỳ chọn)" value={formData.email} onChange={e => setFormData({...formData, email:e.target.value})} className="form-input" />
                            
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, marginTop: 8 }}>
                                Phân loại khách
                            </label>
                            <select value={formData.type} onChange={e => setFormData({...formData, type:e.target.value})} className="form-select">
                                <option value="regular">Khách thường</option>
                                <option value="vip">Khách VIP</option>
                                <option value="corporate">Doanh nghiệp đối tác</option>
                            </select>
                            
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, marginTop: 8 }}>
                                Ghi chú
                            </label>
                            <textarea placeholder="Ghi chú thêm..." value={formData.notes} onChange={e => setFormData({...formData, notes:e.target.value})} className="form-textarea" />
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
};

export default CustomerList;
