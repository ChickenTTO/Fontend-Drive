import React, { useState, useEffect } from 'react';
import './CustomerList.css';
import { XIcon } from '../../components/icons';

const CustomerList = ({ customers, setCustomers, vehicles }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', type: 'regular', notes: '' });
    const [searchTerm, setSearchTerm] = useState('');

    // === Fetch customers từ API ===
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await fetch('https://backend-drive-bgk5.onrender.com/api/customers', {
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!res.ok) {
                    console.error('Fetch failed', res.status, res.statusText);
                    setCustomers([]);
                    return;
                }

                const data = await res.json();
                // Nếu backend trả object { success: true, data: [...] }, lấy data
                setCustomers(Array.isArray(data) ? data : data.data || []);
            } catch (err) {
                console.error('Lỗi load customers', err);
                setCustomers([]);
            }
        };

        fetchCustomers();
    }, [setCustomers]);

    // === Thêm / sửa khách ===
    const handleOpenModal = (customer) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData(customer);
        } else {
            setEditingCustomer(null);
            setFormData({ name: '', phone: '', email: '', address: '', type: 'regular', notes: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const url = editingCustomer
                ? `https://backend-drive-bgk5.onrender.com/api/customers/${editingCustomer._id || editingCustomer.id}`
                : `https://backend-drive-bgk5.onrender.com/api/customers`;

            const method = editingCustomer ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                alert(errData.message || 'Lỗi lưu khách hàng');
                return;
            }

            const data = await res.json();
            if (editingCustomer) {
                setCustomers(prev =>
                    prev.map(c => (c._id === data._id || c.id === data.id ? data : c))
                );
            } else {
                setCustomers(prev => [...prev, data]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối server');
        }
    };

    // === Xóa khách ===
    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) return;

        try {
            const res = await fetch(`https://backend-drive-bgk5.onrender.com/api/customers/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                setCustomers(prev => prev.filter(c => c._id !== id && c.id !== id));
            } else {
                alert('Xóa thất bại');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối server');
        }
    };

    // === Lọc khách hàng theo tìm kiếm ===
    const filteredCustomers = Array.isArray(customers)
        ? customers.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm)
        )
        : [];

    const formatCurrency = (value) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    // === Tính số cuốc & doanh thu từ vehicles (nếu cần) ===
    const getCustomerStats = (customer) => {
        const realAssignments = [];
        vehicles.forEach(v => {
            if (v.assignments) {
                v.assignments.forEach(a => {
                    if (a.customerPhone === customer.phone) realAssignments.push(a);
                });
            }
        });
        const totalTrips = realAssignments.length;
        const totalRevenue = realAssignments.reduce((sum, a) => sum + (a.price || 0), 0);
        return { totalTrips, totalRevenue };
    };

    return (
        <div className="customer-page">
            <div className="page-header">
                <h2>Quản lý Khách hàng</h2>
                <button onClick={() => handleOpenModal()} className="btn-primary">Thêm Khách hàng</button>
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
                            {filteredCustomers.length > 0 ? filteredCustomers.map(customer => {
                                const stats = getCustomerStats(customer);
                                return (
                                    <tr key={customer.id || customer._id}>
                                        <td>{customer.name}</td>
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
                            <input type="text" placeholder="Tên khách hàng" value={formData.name} onChange={e => setFormData({...formData, name:e.target.value})} className="form-input" />
                            <input type="tel" placeholder="Số điện thoại" value={formData.phone} onChange={e => setFormData({...formData, phone:e.target.value})} className="form-input" />
                            <input type="text" placeholder="Địa chỉ" value={formData.address} onChange={e => setFormData({...formData, address:e.target.value})} className="form-input" />
                            <input type="email" placeholder="Email (Tuỳ chọn)" value={formData.email} onChange={e => setFormData({...formData, email:e.target.value})} className="form-input" />
                            <select value={formData.type} onChange={e => setFormData({...formData, type:e.target.value})} className="form-select">
                                <option value="regular">Khách thường</option>
                                <option value="vip">Khách VIP</option>
                                <option value="corporate">Doanh nghiệp</option>
                            </select>
                            <textarea placeholder="Ghi chú" value={formData.notes} onChange={e => setFormData({...formData, notes:e.target.value})} className="form-textarea" />
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
