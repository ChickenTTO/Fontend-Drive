import React, { useEffect, useState } from 'react';
import { depotApi } from '../../api/depotApi';

export const DepotList = ({ onSelectDepot }) => {
    const [depots, setDepots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDepots();
    }, []);

    const fetchDepots = async () => {
        try {
            setLoading(true);
            const res = await depotApi.getAllDepots();
            if (res.data && res.data.data) {
                setDepots(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching depots:', err);
            setError('Không thể tải thông tin 05 Bãi xe Futa Express.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Đang tải thông tin 05 bãi xe...</div>;
    if (error) return <div style={{ padding: 20, color: '#dc2626' }}>{error}</div>;

    return (
        <div style={{ padding: '10px 0' }}>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                    🏢 Hệ thống 05 Bãi xe Trọng điểm Futa Express
                </h2>
                <p style={{ color: '#64748b', fontSize: 13, marginTop: 4, margin: 0 }}>
                    Quản lý dung lượng bãi xe, tổng số phương tiện và tỷ lệ xe trống theo từng dòng tải trọng trên toàn quốc.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                {depots.map((depot) => {
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
                                cursor: 'pointer'
                            }}
                            onClick={() => onSelectDepot && onSelectDepot(depot._id)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#f97316';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(249,115,22,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <div>
                                    <span style={{ 
                                        background: '#eff6ff', 
                                        color: '#2563eb', 
                                        padding: '2px 8px', 
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

                            <p style={{ color: '#64748b', fontSize: 12, marginBottom: 14 }}>
                                📍 {depot.address}
                            </p>

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

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569' }}>
                                <span>🚚 Tải nhẹ: <strong>{stats.byWeight?.light || 0}</strong></span>
                                <span>🚛 Tải trung: <strong>{stats.byWeight?.medium || 0}</strong></span>
                                <span>🚜 Tải nặng: <strong>{stats.byWeight?.heavy || 0}</strong></span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DepotList;
