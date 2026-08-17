import React, { useEffect, useState } from 'react';
import { depotApi } from '../../api/depotApi';

export const DepotList = ({ onSelectDepot }) => {
    const [depots, setDepots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    // Search and filter states
    const [search, setSearch] = useState('');
    const [cityFilter, setCityFilter] = useState('ALL');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingDepot, setEditingDepot] = useState(null); // null = Add new, object = Edit

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        city: '',
        address: '',
        area: 10000,
        totalCapacity: 20
    });

    const mockDepots = [
        { _id: 'dep-1', code: 'HN', name: 'Bãi xe Hà Nội', city: 'Hà Nội', address: 'Bến xe Nước Ngầm, Hoàng Mai, Hà Nội', area: 15000, totalCapacity: 25, stats: { totalVehicles: 11, readyVehicles: 10, operatingVehicles: 1, maintenanceVehicles: 0, byWeight: { light: 4, medium: 4, heavy: 3 } } },
        { _id: 'dep-2', code: 'HP', name: 'Bãi xe Hải Phòng', city: 'Hải Phòng', address: 'Khu công nghiệp Đình Vũ, Hải An, Hải Phòng', area: 10000, totalCapacity: 15, stats: { totalVehicles: 11, readyVehicles: 11, operatingVehicles: 0, maintenanceVehicles: 0, byWeight: { light: 4, medium: 4, heavy: 3 } } },
        { _id: 'dep-3', code: 'DN', name: 'Bãi xe Đà Nẵng', city: 'Đà Nẵng', address: 'Cảng Tiên Sa, Sơn Trà, Đà Nẵng', area: 12000, totalCapacity: 20, stats: { totalVehicles: 11, readyVehicles: 11, operatingVehicles: 0, maintenanceVehicles: 0, byWeight: { light: 4, medium: 4, heavy: 3 } } },
        { _id: 'dep-4', code: 'HCM', name: 'Bãi xe TP.Hồ Chí Minh', city: 'TP.HCM', address: 'Bến xe Miền Đông mới, TP. Thủ Đức, TP.HCM', area: 20000, totalCapacity: 30, stats: { totalVehicles: 11, readyVehicles: 10, operatingVehicles: 1, maintenanceVehicles: 0, byWeight: { light: 4, medium: 4, heavy: 3 } } },
        { _id: 'dep-5', code: 'CT', name: 'Bãi xe Cần Thơ', city: 'Cần Thơ', address: 'Khu công nghiệp Trà Nóc, Bình Thủy, Cần Thơ', area: 8000, totalCapacity: 12, stats: { totalVehicles: 11, readyVehicles: 11, operatingVehicles: 0, maintenanceVehicles: 0, byWeight: { light: 4, medium: 4, heavy: 3 } } }
    ];

    useEffect(() => {
        fetchDepots();
    }, []);

    const fetchDepots = async () => {
        try {
            setLoading(true);
            const res = await depotApi.getAllDepots();
            const realDepots = res.data?.data || res.data;
            setDepots(Array.isArray(realDepots) ? realDepots : []);
        } catch (err) {
            console.error('Error fetching depots:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingDepot(null);
        setFormData({
            code: '',
            name: '',
            city: '',
            address: '',
            area: 10000,
            totalCapacity: 20
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (depot, e) => {
        e.stopPropagation();
        setEditingDepot(depot);
        setFormData({
            code: depot.code || '',
            name: depot.name || '',
            city: depot.city || '',
            address: depot.address || '',
            area: depot.area || 10000,
            totalCapacity: depot.totalCapacity || 20
        });
        setShowModal(true);
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        if (!formData.code || !formData.name || !formData.city || !formData.address) {
            setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ các trường thông tin bắt buộc!' });
            return;
        }

        try {
            if (editingDepot) {
                await depotApi.updateDepot(editingDepot._id, formData);
                setMessage({ type: 'success', text: `Đã cập nhật Bãi xe "${formData.name}" thành công!` });
            } else {
                await depotApi.createDepot(formData);
                setMessage({ type: 'success', text: `Đã thêm mới Bãi xe "${formData.name}" thành công!` });
            }
            setShowModal(false);
            fetchDepots();
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu Bãi xe.';
            setMessage({ type: 'error', text: `Lỗi: ${errMsg}` });
            fetchDepots();
            setShowModal(false);
        }
    };

    const handleDeleteDepot = async (depot, e) => {
        e.stopPropagation();
        if (!window.confirm(`Bạn có chắc chắn muốn xóa Bãi xe "${depot.name}" [${depot.code}]?`)) return;

        try {
            await depotApi.deleteDepot(depot._id);
            setMessage({ type: 'success', text: `Đã xóa Bãi xe "${depot.name}" thành công!` });
            fetchDepots();
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Không thể xóa Bãi xe này.';
            setMessage({ type: 'error', text: `Lỗi: ${errMsg}` });
            fetchDepots();
        }
    };

    // Filter depots
    const filteredDepots = depots.filter(d => {
        const matchesSearch = d.name?.toLowerCase().includes(search.toLowerCase()) ||
            d.code?.toLowerCase().includes(search.toLowerCase()) ||
            d.city?.toLowerCase().includes(search.toLowerCase()) ||
            d.address?.toLowerCase().includes(search.toLowerCase());
        const matchesCity = cityFilter === 'ALL' || d.city === cityFilter;
        return matchesSearch && matchesCity;
    });

    const uniqueCities = Array.from(new Set(depots.map(d => d.city).filter(Boolean)));

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Đang tải thông tin Bãi xe...</div>;

    return (
        <div style={{ padding: '10px 0' }}>
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                        🏢 Quản Lý Bãi Xe Futa Express
                    </h2>
                    <p style={{ color: '#64748b', fontSize: 13, marginTop: 4, margin: 0 }}>
                        Thêm mới, chỉnh sửa thông tin, theo dõi dung lượng sức chứa và phân bổ xe theo bãi trên toàn quốc.
                    </p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    style={{
                        background: '#f97316',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 18px',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 2px 6px rgba(249,115,22,0.3)'
                    }}
                >
                    ➕ Thêm Bãi Xe Mới
                </button>
            </div>

            {/* Notification message */}
            {message && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    marginBottom: 16,
                    background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: message.type === 'success' ? '#166534' : '#991b1b',
                    border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                }}>
                    {message.text}
                </div>
            )}

            {/* Search & Filter Bar */}
            <div style={{ background: '#ffffff', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', gap: 12, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm theo tên bãi, mã bãi, thành phố, địa chỉ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: 1, padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14 }}
                />
                <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14, background: '#ffffff' }}
                >
                    <option value="ALL">-- Tất cả Thành phố --</option>
                    {uniqueCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
            </div>

            {/* Depot Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: 18 }}>
                {filteredDepots.map((depot) => {
                    const stats = depot.stats || {};
                    const readyCount = stats.readyVehicles || 0;
                    const operatingCount = stats.operatingVehicles || 0;
                    const maintenanceCount = stats.maintenanceVehicles || 0;
                    const totalVehicles = stats.totalVehicles || 0;

                    return (
                        <div
                            key={depot._id}
                            style={{
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 10,
                                padding: 18,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                            onClick={() => onSelectDepot && onSelectDepot(depot._id)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <div>
                                    <span style={{
                                        background: '#eff6ff',
                                        color: '#2563eb',
                                        padding: '3px 9px',
                                        borderRadius: 4,
                                        fontSize: 12,
                                        fontWeight: 700
                                    }}>
                                        [{depot.code}] {depot.city}
                                    </span>
                                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginTop: 6, marginBottom: 2 }}>
                                        {depot.name}
                                    </h3>
                                </div>
                                <span style={{
                                    background: '#fff7ed',
                                    color: '#ea580c',
                                    border: '1px solid #ffedd5',
                                    padding: '4px 10px',
                                    borderRadius: 20,
                                    fontSize: 12,
                                    fontWeight: 700
                                }}>
                                    {totalVehicles} / {depot.totalCapacity} Xe
                                </span>
                            </div>

                            <p style={{ color: '#64748b', fontSize: 12.5, marginBottom: 10 }}>
                                📍 {depot.address}
                            </p>

                            <div style={{ fontSize: 12, color: '#475569', marginBottom: 14 }}>
                                📐 Diện tích: <strong>{(depot.area || 10000).toLocaleString()} m²</strong>
                            </div>

                            {/* Status Counts Mini Box */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, background: '#f8fafc', padding: 10, borderRadius: 8, marginBottom: 14, border: '1px solid #f1f5f9' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#16a34a' }}>{readyCount}</div>
                                    <div style={{ fontSize: 11, color: '#64748b' }}>Sẵn sàng</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#2563eb' }}>{operatingCount}</div>
                                    <div style={{ fontSize: 11, color: '#64748b' }}>Đang chạy</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#d97706' }}>{maintenanceCount}</div>
                                    <div style={{ fontSize: 11, color: '#64748b' }}>Bảo trì</div>
                                </div>
                            </div>

                            {/* Action bar (Edit / Delete) */}
                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: 12, color: '#64748b' }}>
                                    🚚 <strong>{stats.byWeight?.light || 0}</strong> nhẹ | 🚛 <strong>{stats.byWeight?.medium || 0}</strong> trung | 🚜 <strong>{stats.byWeight?.heavy || 0}</strong> nặng
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                        onClick={(e) => handleOpenEditModal(depot, e)}
                                        style={{
                                            padding: '5px 10px',
                                            background: '#f1f5f9',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: '#2563eb',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ✏️ Sửa
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteDepot(depot, e)}
                                        style={{
                                            padding: '5px 10px',
                                            background: '#fef2f2',
                                            border: '1px solid #fecaca',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: '#dc2626',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🗑️ Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredDepots.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: '#64748b', background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0', marginTop: 20 }}>
                    🔍 Không tìm thấy Bãi xe nào phù hợp với bộ lọc.
                </div>
            )}

            {/* Create / Edit Depot Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <form onSubmit={handleSubmitForm} style={{ background: '#ffffff', padding: 24, borderRadius: 12, width: 460, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, marginBottom: 16, color: '#0f172a' }}>
                            {editingDepot ? '✏️ Chỉnh Sửa Thông Tin Bãi Xe' : '➕ Thêm Bãi Xe Mới'}
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginBottom: 12 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Mã Bãi Xe *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="VD: SG, BD, VT..."
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, textTransform: 'uppercase' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Tên Bãi Xe *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="VD: Bãi xe Tân Bình"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Thành Phố / Tỉnh *</label>
                            <input
                                type="text"
                                required
                                placeholder="VD: TP.HCM, Bình Dương, Đồng Nai..."
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }}
                            />
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Địa Chỉ Chi Tiết *</label>
                            <input
                                type="text"
                                required
                                placeholder="VD: 123 QL1A, An Phú Đông, Quận 12..."
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Diện Tích (m²)</label>
                                <input
                                    type="number"
                                    min="100"
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Sức Chứa Tối Đa (Xe)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.totalCapacity}
                                    onChange={(e) => setFormData({ ...formData, totalCapacity: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer' }}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                style={{ padding: '8px 16px', background: '#f97316', color: '#ffffff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
                            >
                                {editingDepot ? 'Lưu Cập Nhật' : 'Tạo Bãi Xe'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default DepotList;
