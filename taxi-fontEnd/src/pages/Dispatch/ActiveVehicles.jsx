import React, { useState, useEffect } from 'react';
import './ActiveVehicles.css';


import { StatusIcon, ChatIcon, CarIcon, ArrowLeftIcon, UserCircleIcon, PackageIcon, MapPinIcon, ClockIcon } from '../../components/icons'; 


const VehicleDetailView = ({ 
    vehicle, 
    driver, 
    onBack, 
    onUpdateStatus, 
    onUpdatePaymentMethod 
}) => {
    // Lọc chuyến đang phục vụ (đã gán, đã gọi, trên xe)
    const customersOnBoard = vehicle.assignments?.filter(a => ['assigned', 'called', 'in-progress'].includes(a.status)) || [];
    
    // Lọc chuyến đã hoàn thành
    const completedToday = vehicle.assignments?.filter(a => a.status === 'completed') || [];

    // Tính tổng doanh thu chuyến hoàn thành
    const completedRevenue = completedToday.reduce((sum, a) => sum + (a.price || 0), 0);

    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    // Render các nút chọn thanh toán
    const renderPaymentOptions = (assignment) => {
        const methods = [
            { key: 'cash', label: 'Tiền mặt' },
            { key: 'transfer', label: 'Chuyển khoản' },
            { key: 'dispatcher', label: 'Điều xe thu' },
            { key: 'other', label: 'Khác' },
        ];

        return (
            <div className="payment-section">
                <p style={{fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '8px', fontWeight: 500}}>Xác nhận thanh toán:</p>
                <div className="payment-methods">
                    {methods.map((method) => {
                        const isSelected = assignment.paymentMethod === method.key;
                        return (
                            <button
                                key={method.key}
                                onClick={() => onUpdatePaymentMethod(assignment.id, method.key)}
                                className={`btn-payment ${isSelected ? 'selected' : ''}`}
                            >
                                {method.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const calculateDuration = (a) => {
        if (a.status !== 'completed' || !a.startTime || !a.endTime) return null;
        const start = new Date(a.startTime).getTime();
        const end = new Date(a.endTime).getTime();
        const diffMs = end - start;
        if (diffMs < 0) return null;
        
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        
        if (hours > 0) return `${hours}h ${mins}p`;
        return `${mins} phút`;
    };

    const renderCustomerList = (assignments, emptyMsg, isActiveList) => (
        <div className="customer-list">
            {assignments.length > 0 ? (
                assignments.map(a => (
                    <div key={a.id} className="customer-item">
                        <div className="customer-top">
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                {a.type === 'customer' ? <UserCircleIcon /> : <PackageIcon />}
                                <div className="customer-name">
                                    <h4>{a.customerName}</h4>
                                    <p>{a.customerPhone}</p>
                                </div>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px'}}>
                                {a.price && <span style={{fontSize: '12px', fontWeight: 'bold', color: '#16a34a'}}>{formatCurrency(a.price)}</span>}
                                <span className={`status-badge ${a.status}`}>
                                    {a.status === 'in-progress' ? 'Trên xe' : a.status === 'assigned' ? 'Đã gán' : a.status === 'called' ? 'Đã gọi' : a.status === 'completed' ? 'Hoàn thành' : a.status}
                                </span>
                            </div>
                        </div>
                        
                        <div className="address-info">
                            <div className="address-line">
                                <span className="address-label">Đón:</span>
                                <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{a.pickupAddress}</span>
                            </div>
                            <div className="address-line">
                                <span className="address-label">Trả:</span>
                                <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{a.destinationAddress}</span>
                            </div>
                        </div>

                         {!isActiveList && calculateDuration(a) && (
                            <div style={{marginTop: '8px', display: 'flex', alignItems: 'center', fontSize: '12px', color: '#6b7280'}}>
                                <ClockIcon />
                                <span style={{marginLeft: '4px'}}>Thời gian: <b>{calculateDuration(a)}</b></span>
                            </div>
                        )}
                        
                        {isActiveList ? (
                            <div className="action-buttons">
                                <button 
                                    onClick={() => onUpdateStatus(a.id, 'cancelled')}
                                    className="btn-action btn-red"
                                >
                                    Huỷ
                                </button>
                                
                                {a.status !== 'called' && a.status !== 'in-progress' && (
                                     <button 
                                        onClick={() => onUpdateStatus(a.id, 'called')}
                                        className="btn-action btn-teal"
                                    >
                                        Đã gọi hẹn
                                    </button>
                                )}
                                
                                {a.status !== 'in-progress' && (
                                    <button 
                                        onClick={() => onUpdateStatus(a.id, 'in-progress')}
                                        className="btn-action btn-blue"
                                    >
                                        Đã đón khách
                                    </button>
                                )}

                                <button 
                                    onClick={() => onUpdateStatus(a.id, 'incident')}
                                    className="btn-action btn-orange"
                                >
                                    Sự cố
                                </button>
                                
                                <button 
                                    onClick={() => onUpdateStatus(a.id, 'completed')}
                                    className="btn-action btn-green"
                                >
                                    Hoàn thành
                                </button>
                            </div>
                        ) : (
                            /* Khu vực chọn thanh toán cho chuyến đã xong */
                            renderPaymentOptions(a)
                        )}
                    </div>
                ))
            ) : (
                <p style={{textAlign: 'center', fontStyle: 'italic', color: '#9ca3af', padding: '16px'}}>{emptyMsg}</p>
            )}
        </div>
    );

    return (
        <div className="detail-view">
            <div className="detail-header">
                <button onClick={onBack} className="back-btn">
                    <ArrowLeftIcon />
                </button>
                <div>
                    <h2 style={{fontSize: '20px', fontWeight: 'bold', margin: 0}}>{vehicle.licensePlate}</h2>
                    <div style={{display: 'flex', gap: '8px', fontSize: '14px', color: '#6b7280', alignItems: 'center'}}>
                        <span>{driver?.name || 'Chưa gán tài xế'}</span>
                        <span>•</span>
                        <StatusIcon status={vehicle.status} />
                        <span style={{textTransform: 'capitalize'}}>{vehicle.status}</span>
                    </div>
                </div>
            </div>

            <div className="detail-layout">
                {/* Cột trái: Bản đồ */}
                <div className="map-column">
                    <div className="section-header">
                         <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <MapPinIcon /> Vị trí hiện tại
                         </div>
                         <span style={{fontSize: '12px', fontWeight: 'normal', color: '#6b7280'}}>
                            {vehicle.location.lat.toFixed(4)}, {vehicle.location.lng.toFixed(4)}
                         </span>
                    </div>
                    <div className="map-container">
                        {/* Component Map - Tắt tương tác để chỉ view */}
                        <GoogleMap 
                            vehicles={[vehicle]} 
                            selectedVehicleId={vehicle.id}
                            onMarkerClick={() => {}}
                            center={vehicle.location}
                            zoom={15}
                            assignmentsForRoutes={[]}
                            editingLocationFor={null}
                            onMapClickForLocation={() => {}}
                            newAssignmentLocations={{}}
                        />
                    </div>
                </div>

                {/* Cột phải: Thông tin khách */}
                <div className="info-column">
                    {/* Khách đang phục vụ */}
                    <div className="info-card">
                         <div className="info-header blue">
                            <span>Khách đang phục vụ</span>
                            <span className="badge-count">{customersOnBoard.length}</span>
                        </div>
                        <div className="info-body">
                            {renderCustomerList(customersOnBoard, 'Hiện không có khách.', true)}
                        </div>
                    </div>

                    {/* Khách đã hoàn thành */}
                    <div className="info-card" style={{flex: 1}}>
                         <div className="info-header green">
                            <span>Khách đã hoàn thành</span>
                            <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                <span style={{fontSize: '14px'}}>{formatCurrency(completedRevenue)}</span>
                                <span className="badge-count">{completedToday.length}</span>
                            </div>
                        </div>
                        <div className="info-body">
                            {renderCustomerList(completedToday, 'Chưa có chuyến hoàn thành.', false)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
const ActiveVehicles = ({ 
    vehicles, 
    setVehicles, 
    drivers, 
    initialVehicleId, 
    onClearInitialVehicleId 
}) => {
    const [detailVehicleId, setDetailVehicleId] = useState(null);

    useEffect(() => {
        if (!initialVehicleId) return;
        const t = setTimeout(() => {
            setDetailVehicleId(initialVehicleId);
            if (onClearInitialVehicleId) onClearInitialVehicleId();
        }, 0);
        return () => clearTimeout(t);
    }, [initialVehicleId, onClearInitialVehicleId]);



    const handleUpdateAssignmentStatus = (vehicleId, assignmentId, newStatus) => {
        const nowIso = new Date().toISOString();
        setVehicles(prevVehicles => prevVehicles.map(v => {
            if (v.id === vehicleId && v.assignments) {
                if (newStatus === 'cancelled') {
                    // Xóa chuyến
                    return {
                        ...v,
                        assignments: v.assignments.filter(a => a.id !== assignmentId)
                    };
                }
                return {
                    ...v,
                    assignments: v.assignments.map(a => {
                        if (a.id === assignmentId) {
                            const updates = { status: newStatus };
                            // Set thời gian bắt đầu
                            if (newStatus === 'in-progress' && !a.startTime) {
                                updates.startTime = nowIso;
                            }
                            // Set thời gian kết thúc
                            if (newStatus === 'completed') {
                                updates.endTime = nowIso;
                            }
                            return { ...a, ...updates };
                        }
                        return a;
                    })
                };
            }
            return v;
        }));
    };

    const handleUpdatePaymentMethod = (vehicleId, assignmentId, method) => {
        setVehicles(prevVehicles => prevVehicles.map(v => {
            if (v.id === vehicleId && v.assignments) {
                return {
                    ...v,
                    assignments: v.assignments.map(a => 
                        a.id === assignmentId ? { ...a, paymentMethod: method } : a
                    )
                };
            }
            return v;
        }));
    };

    const getRevenueAndTripsStats = (vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        let todayRevenue = 0;
        let todayTrips = 0;

        if (vehicle && vehicle.assignments) {
            // Doanh thu chỉ tính các chuyến COMPLETED
            const completedAssignments = vehicle.assignments.filter(a => a.status === 'completed');
            todayRevenue = completedAssignments.reduce((sum, a) => sum + (a.price || 0), 0);

            // Số chuyến tính cả active và completed
            vehicle.assignments.forEach(a => {
                if (['assigned', 'called', 'in-progress', 'completed', 'incident'].includes(a.status)) {
                    todayTrips += 1;
                }
            });
        }

        return { todayRevenue, todayTrips };
    };

    const activeVehiclesToday = vehicles.filter(v => {
        const stats = getRevenueAndTripsStats(v.id);
        return v.status === 'active' || stats.todayTrips > 0;
    }).sort((a, b) => getRevenueAndTripsStats(b.id).todayTrips - getRevenueAndTripsStats(a.id).todayTrips);

    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    const getDriverName = (driverId) => drivers.find(d => d.id === driverId)?.name || 'Chưa gán';
    const getDriverPhone = (driverId) => drivers.find(d => d.id === driverId)?.phone || '';

    // Nếu đang xem chi tiết 1 xe
    const selectedVehicle = vehicles.find(v => v.id === detailVehicleId);
    if (selectedVehicle) {
        return (
            <VehicleDetailView 
                vehicle={selectedVehicle} 
                driver={drivers.find(d => d.id === selectedVehicle.driverId)}
                onBack={() => setDetailVehicleId(null)}
                onUpdateStatus={(assignmentId, status) => handleUpdateAssignmentStatus(selectedVehicle.id, assignmentId, status)}
                onUpdatePaymentMethod={(assignmentId, method) => handleUpdatePaymentMethod(selectedVehicle.id, assignmentId, method)}
            />
        );
    }

    // Màn hình chính: Danh sách xe
    return (
        <div className="active-vehicles-container">
            <div className="page-header">
                <h2>Giám sát Xe 24/24</h2>
                <p>Danh sách các xe đang hoạt động và có phát sinh chuyến trong ngày hôm nay.</p>
            </div>
            
            <div className="vehicle-grid">
                {activeVehiclesToday.length > 0 ? (
                    activeVehiclesToday.map(vehicle => {
                        const stats = getRevenueAndTripsStats(vehicle.id);
                        const driverName = getDriverName(vehicle.driverId);
                        const driverPhone = getDriverPhone(vehicle.driverId);
                        
                        return (
                            <div 
                                key={vehicle.id} 
                                onClick={() => setDetailVehicleId(vehicle.id)}
                                className="vehicle-card"
                            >
                                <div className="card-header">
                                    <h3>{vehicle.licensePlate}</h3>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                                        <StatusIcon status={vehicle.status} />
                                        <span style={{fontSize: '12px', color: '#6b7280', textTransform: 'capitalize'}}>{vehicle.status}</span>
                                    </div>
                                </div>
                                
                                <div className="card-body">
                                    <div className="driver-info">
                                        <p className="label">Tài xế</p>
                                        <p className="name">{driverName}</p>
                                        {driverPhone && <p className="phone">{driverPhone}</p>}
                                    </div>

                                    <div className="stats-grid">
                                        <div className="stat-box blue">
                                            <p className="title">Số khách</p>
                                            <p className="value">{stats.todayTrips}</p>
                                        </div>
                                        <div className="stat-box green">
                                            <p className="title">Doanh thu</p>
                                            <p className="value" title={formatCurrency(stats.todayRevenue)}>
                                                {formatCurrency(stats.todayRevenue)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6b7280'}}>
                        <p style={{fontSize: '18px'}}>Không có xe nào hoạt động hôm nay.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveVehicles;