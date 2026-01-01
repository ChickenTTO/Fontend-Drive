import React, { useState, useEffect, useMemo } from 'react';
import './DriverList.css';
// Import Icons giả định
import { StatusIcon, XIcon, ClockIcon, CalendarIcon, ArrowLeftIcon, UserCircleIcon, CarIcon, PencilIcon, ArchiveIcon } from '../../components/icons';

// --- Specialized Handover Form Modal (Form Nhận/Trả xe) ---
const HandoverFormModal = ({
    isOpen,
    onClose,
    type,
    driver,
    vehicles,
    onSubmit
}) => {
    const [selectedVehicleId, setSelectedVehicleId] = useState(driver.vehicleId || '');
    const [odo, setOdo] = useState('');
    const [fuel, setFuel] = useState(100);
    const [notes, setNotes] = useState('');
    
    // State cho Form NHẬN XE
    const [receiveDocs, setReceiveDocs] = useState({
        dangKy: false, // Cà vẹt
        baoHiem: false,
        dangKiem: false,
        lenhVanChuyen: false
    });
    const [receiveCondition, setReceiveCondition] = useState({
        voXe: '', // Trầy xước móp méo
        noiThat: 'Sạch',
        denCoi: 'Hoạt động tốt'
    });
    const [receiveTools, setReceiveTools] = useState({
        lopDuPhong: false,
        kichLop: false,
        binhCuuHoa: false,
        theThuPhi: false
    });

    // State cho Form TRẢ XE
    const [returnCondition, setReturnCondition] = useState({
        veSinhBenNgoai: 'Sạch',
        veSinhNoiThat: 'Sạch',
        hutBui: false
    });
    const [returnIssues, setReturnIssues] = useState({
        hasIssue: 'Không',
        description: ''
    });

    useEffect(() => {
        if (!isOpen) return;
        const t = setTimeout(() => {
            // Reset form base
            setSelectedVehicleId(driver.vehicleId || '');
            setOdo('');
            setFuel(type === 'receive' ? 100 : 50); 
            setNotes('');
            
            // Reset Receive specific
            setReceiveDocs({ dangKy: false, baoHiem: false, dangKiem: false, lenhVanChuyen: false });
            setReceiveCondition({ voXe: '', noiThat: 'Sạch', denCoi: 'Hoạt động tốt' });
            setReceiveTools({ lopDuPhong: false, kichLop: false, binhCuuHoa: false, theThuPhi: false });

            // Reset Return specific
            setReturnCondition({ veSinhBenNgoai: 'Sạch', veSinhNoiThat: 'Sạch', hutBui: false });
            setReturnIssues({ hasIssue: 'Không', description: '' });
        }, 0);
        return () => clearTimeout(t);
    }, [isOpen, type, driver]);

    const handleSubmit = () => {
        if (!selectedVehicleId) {
            alert('Vui lòng chọn xe');
            return;
        }
        if (!odo) {
            alert('Vui lòng nhập số ODO');
            return;
        }

        const data = {
            type,
            date: new Date().toISOString(),
            vehicleId: selectedVehicleId,
            odo,
            fuel,
            notes,
            details: type === 'receive' 
                ? { docs: receiveDocs, condition: receiveCondition, tools: receiveTools } 
                : { condition: returnCondition, issues: returnIssues }
        };
        onSubmit(data);
        onClose();
    };

    if (!isOpen) return null;

    const title = type === 'receive' ? 'Phiếu Nhận Xe (Đầu ca)' : 'Phiếu Trả Xe (Cuối ca)';
    const headerClass = type === 'receive' ? 'modal-header colored blue' : 'modal-header colored orange';

    return (
        <div className="modal-overlay">
            <div className="modal-content lg">
                {/* Header */}
                <div className={headerClass}>
                    <div>
                        <h2 style={{fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0'}}>{title}</h2>
                        <p style={{fontSize: '14px', opacity: 0.9, margin: 0}}>Vui lòng điền chính xác thông tin để đảm bảo quyền lợi khi giao nhận phương tiện.</p>
                    </div>
                    <button onClick={onClose} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}><XIcon /></button>
                </div>

                <div className="modal-body" style={{background: '#f3f4f6'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                        
                        {/* --- COMMON SECTION --- */}
                        <div className="driver-card" style={{padding: '20px', border: 'none'}}>
                            <div className="form-group">
                                <label className="form-label">Tài xế thực hiện <span style={{color: 'red'}}>*</span></label>
                                <input type="text" value={driver.name} disabled className="form-input" style={{background: '#f3f4f6', color: '#6b7280'}} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Biển kiểm soát xe <span style={{color: 'red'}}>*</span></label>
                                <select 
                                    value={selectedVehicleId} 
                                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="">-- Chọn xe --</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.licensePlate} - {v.type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Số Km trên đồng hồ (ODO) <span style={{color: 'red'}}>*</span></label>
                                <input 
                                    type="number" 
                                    placeholder="Nhập số ODO..." 
                                    value={odo} 
                                    onChange={(e) => setOdo(e.target.value)}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Mức nhiên liệu hiện tại (%) <span style={{color: 'red'}}>*</span></label>
                                <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                                    <input 
                                        type="range" 
                                        min="0" max="100" 
                                        value={fuel} 
                                        onChange={(e) => setFuel(parseInt(e.target.value))}
                                        style={{flex: 1}}
                                    />
                                    <span style={{fontWeight: 'bold', color: '#2563eb', fontSize: '18px', width: '60px', textAlign: 'right'}}>{fuel}%</span>
                                </div>
                            </div>
                        </div>

                        {/* --- RECEIVE SPECIFIC --- */}
                        {type === 'receive' && (
                            <>
                                {/* Giấy tờ */}
                                <div className="driver-card" style={{padding: '20px', border: 'none'}}>
                                    <label className="form-label" style={{marginBottom: '16px'}}>Kiểm tra giấy tờ xe <span style={{color: 'red'}}>*</span></label>
                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                                        {Object.keys(receiveDocs).map(key => (
                                             <label key={key} style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', background: '#fff'}}>
                                                <input type="checkbox" checked={receiveDocs[key]} onChange={e => setReceiveDocs({...receiveDocs, [key]: e.target.checked})} style={{width: '20px', height: '20px'}} />
                                                <span>
                                                    {key === 'dangKy' ? 'Đăng ký xe (Cà vẹt)' : 
                                                     key === 'baoHiem' ? 'Bảo hiểm bắt buộc' : 
                                                     key === 'dangKiem' ? 'Giấy đăng kiểm' : 'Lệnh vận chuyển'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Tình trạng xe */}
                                <div className="driver-card" style={{padding: '20px', border: 'none'}}>
                                    <label className="form-label" style={{marginBottom: '16px'}}>Tình trạng xe khi nhận</label>
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                                        <div>
                                            <span style={{fontSize: '14px', color: '#6b7280', display: 'block', marginBottom: '4px'}}>Tình trạng vỏ xe</span>
                                            <textarea 
                                                rows={2}
                                                value={receiveCondition.voXe}
                                                onChange={e => setReceiveCondition({...receiveCondition, voXe: e.target.value})}
                                                className="form-textarea"
                                                placeholder="Ghi rõ vị trí trầy xước (nếu có), hoặc ghi 'Ổn'"
                                            />
                                        </div>
                                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                            <div>
                                                 <span style={{fontSize: '14px', color: '#6b7280', display: 'block', marginBottom: '4px'}}>Vệ sinh nội thất</span>
                                                 <select 
                                                    value={receiveCondition.noiThat} 
                                                    onChange={e => setReceiveCondition({...receiveCondition, noiThat: e.target.value})}
                                                    className="form-select"
                                                >
                                                    <option>Sạch</option>
                                                    <option>Bình thường</option>
                                                    <option>Bẩn</option>
                                                </select>
                                            </div>
                                             <div>
                                                 <span style={{fontSize: '14px', color: '#6b7280', display: 'block', marginBottom: '4px'}}>Đèn, Còi, Xi-nhan</span>
                                                 <select 
                                                    value={receiveCondition.denCoi} 
                                                    onChange={e => setReceiveCondition({...receiveCondition, denCoi: e.target.value})}
                                                    className="form-select"
                                                >
                                                    <option>Hoạt động tốt</option>
                                                    <option>Có lỗi</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* --- RETURN SPECIFIC --- */}
                        {type === 'return' && (
                            <>
                                 {/* Vệ sinh */}
                                <div className="driver-card" style={{padding: '20px', border: 'none'}}>
                                    <label className="form-label" style={{marginBottom: '16px'}}>Tình trạng vệ sinh xe <span style={{color: 'red'}}>*</span></label>
                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                         <div>
                                            <span style={{fontSize: '14px', color: '#6b7280', display: 'block', marginBottom: '4px'}}>Bên ngoài</span>
                                            <select 
                                                value={returnCondition.veSinhBenNgoai} 
                                                onChange={e => setReturnCondition({...returnCondition, veSinhBenNgoai: e.target.value})}
                                                className="form-select"
                                            >
                                                <option>Sạch (Đã rửa)</option>
                                                <option>Bình thường</option>
                                                <option>Bẩn (Chưa rửa)</option>
                                            </select>
                                         </div>
                                          <div>
                                            <span style={{fontSize: '14px', color: '#6b7280', display: 'block', marginBottom: '4px'}}>Nội thất</span>
                                            <select 
                                                value={returnCondition.veSinhNoiThat} 
                                                onChange={e => setReturnCondition({...returnCondition, veSinhNoiThat: e.target.value})}
                                                className="form-select"
                                            >
                                                <option>Sạch</option>
                                                <option>Có rác/Bẩn</option>
                                            </select>
                                         </div>
                                    </div>
                                    <div style={{marginTop: '12px'}}>
                                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                            <input type="checkbox" checked={returnCondition.hutBui} onChange={e => setReturnCondition({...returnCondition, hutBui: e.target.checked})} style={{width: '18px', height: '18px'}} />
                                            <span>Đã hút bụi sàn xe</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Sự cố */}
                                <div className="driver-card" style={{padding: '20px', border: 'none'}}>
                                    <label className="form-label" style={{marginBottom: '16px'}}>Sự cố / Hư hỏng phát sinh <span style={{color: 'red'}}>*</span></label>
                                    <div style={{display: 'flex', gap: '32px', marginBottom: '16px'}}>
                                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                            <input 
                                                type="radio" 
                                                name="hasIssue" 
                                                checked={returnIssues.hasIssue === 'Không'} 
                                                onChange={() => setReturnIssues({...returnIssues, hasIssue: 'Không'})} 
                                                style={{width: '18px', height: '18px'}} 
                                            />
                                            <span style={{fontWeight: 500}}>Không có</span>
                                        </label>
                                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                            <input 
                                                type="radio" 
                                                name="hasIssue" 
                                                checked={returnIssues.hasIssue === 'Có'} 
                                                onChange={() => setReturnIssues({...returnIssues, hasIssue: 'Có'})} 
                                                style={{width: '18px', height: '18px'}} 
                                            />
                                            <span style={{fontWeight: 500}}>Có sự cố</span>
                                        </label>
                                    </div>
                                    {returnIssues.hasIssue === 'Có' && (
                                        <textarea 
                                            rows={3} 
                                            placeholder="Mô tả chi tiết sự cố, va quệt, đèn báo lỗi..."
                                            value={returnIssues.description}
                                            onChange={e => setReturnIssues({...returnIssues, description: e.target.value})}
                                            className="form-textarea"
                                            style={{borderColor: '#fca5a5', background: '#fef2f2'}}
                                        />
                                    )}
                                </div>
                            </>
                        )}

                        {/* Ghi chú chung */}
                        <div className="driver-card" style={{padding: '20px', border: 'none'}}>
                            <label className="form-label">Ghi chú khác (Nếu có)</label>
                            <textarea 
                                rows={2} 
                                value={notes} 
                                onChange={(e) => setNotes(e.target.value)}
                                className="form-textarea" 
                                placeholder="Các ghi chú khác..."
                            />
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} style={{padding: '10px 24px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontWeight: 500}}>Hủy bỏ</button>
                    <button onClick={handleSubmit} style={{padding: '10px 32px', borderRadius: '6px', border: 'none', background: type === 'receive' ? '#2563eb' : '#ea580c', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}>
                        GỬI PHIẾU
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Schedule Registration Modal (Đăng ký lịch chạy cho Partner) ---
const ScheduleRegistrationModal = ({ isOpen, onClose, onSubmit }) => {
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('07:00');
    const [endTime, setEndTime] = useState('17:00');
    const [area, setArea] = useState('');

    const handleSubmit = () => {
        if (!date || !startTime || !endTime) {
            alert('Vui lòng nhập đầy đủ thời gian.');
            return;
        }
        onSubmit({
            date,
            startTime,
            endTime,
            area,
            status: 'pending'
        });
        setDate('');
        setArea('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content md">
                <div className="modal-header colored purple">
                    <h3 style={{margin: 0, fontWeight: 'bold'}}>Đăng ký lịch chạy</h3>
                    <button onClick={onClose} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}><XIcon /></button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Ngày đăng ký</label>
                        <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}} className="form-group">
                        <div>
                            <label className="form-label">Giờ bắt đầu</label>
                            <input type="time" className="form-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                        </div>
                        <div>
                            <label className="form-label">Giờ kết thúc</label>
                            <input type="time" className="form-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Khu vực hoạt động dự kiến</label>
                        <input type="text" placeholder="Ví dụ: Quận 1, Sân bay..." className="form-input" value={area} onChange={(e) => setArea(e.target.value)} />
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn-secondary" style={{padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white'}}>Hủy</button>
                    <button onClick={handleSubmit} style={{padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#9333ea', color: 'white', fontWeight: 'bold'}}>Gửi đăng ký</button>
                </div>
            </div>
        </div>
    );
};

// --- Payment Confirmation Modal ---
const PaymentConfirmationModal = ({
    isOpen,
    onClose,
    report,
    driverName,
    vehiclePlate,
    onConfirm,
    currentStatus
}) => {
    const [cashAmount, setCashAmount] = useState(0);
    const [cashRecipient, setCashRecipient] = useState('');
    const [transferAmount, setTransferAmount] = useState(0);

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    
    // Giả lập tính toán
    const totalRevenue = report.revenue;
    const dispatcherCollected = Math.round(totalRevenue * 0.4); 
    const driverCollected = totalRevenue - dispatcherCollected;
    const expenses = 50000; 
    const netRemittance = driverCollected - expenses; 

    useEffect(() => {
        if (!isOpen) return;
        const t = setTimeout(() => {
            setCashAmount(0);
            setCashRecipient('');
            setTransferAmount(netRemittance > 0 ? netRemittance : 0);
        }, 0);
        return () => clearTimeout(t);
    }, [isOpen, netRemittance]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content lg">
                <div className="modal-header colored green">
                    <div>
                        <h2 style={{fontSize: '20px', fontWeight: 'bold', margin: 0}}>Phiếu Thanh Toán / Nộp Lệnh</h2>
                        <p style={{fontSize: '14px', opacity: 0.9, margin: 0}}>Ngày: {new Date(report.date).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <button onClick={onClose} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}><XIcon /></button>
                </div>

                <div className="modal-body">
                    <div style={{background: '#f9fafb', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', marginBottom: '24px'}}>
                        <div>
                            <p style={{fontSize: '12px', color: '#6b7280', margin: 0}}>Tài xế</p>
                            <p style={{fontSize: '16px', fontWeight: 'bold', margin: 0}}>{driverName}</p>
                        </div>
                        <div style={{textAlign: 'right'}}>
                            <p style={{fontSize: '12px', color: '#6b7280', margin: 0}}>Biển số xe</p>
                            <p style={{fontSize: '16px', fontWeight: 'bold', margin: 0}}>{vehiclePlate}</p>
                        </div>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px'}}>
                            <span style={{fontWeight: 500}}>1. Tổng doanh thu trong ngày</span>
                            <span style={{fontWeight: 'bold', color: '#2563eb', fontSize: '18px'}}>{formatCurrency(totalRevenue)}</span>
                        </div>
                        
                        <div style={{paddingLeft: '16px', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', color: '#4b5563'}}>
                                <span>- Lái xe thu</span>
                                <span style={{fontWeight: 500, color: '#111827'}}>{formatCurrency(driverCollected)}</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', color: '#4b5563'}}>
                                <span>- Điều xe thu</span>
                                <span style={{fontWeight: 500, color: '#111827'}}>{formatCurrency(dispatcherCollected)}</span>
                            </div>
                        </div>

                        <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', paddingTop: '8px'}}>
                            <span style={{fontWeight: 500}}>2. Chi phí phát sinh (Xăng/Cầu đường)</span>
                            <span style={{fontWeight: 'bold', color: '#ef4444', fontSize: '16px'}}>-{formatCurrency(expenses)}</span>
                        </div>

                        <div style={{background: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '1px solid #bbf7d0'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <span style={{fontWeight: 'bold', color: '#166534', textTransform: 'uppercase'}}>3. Thực nộp về công ty</span>
                                <span style={{fontWeight: 'bold', color: '#15803d', fontSize: '24px'}}>{formatCurrency(netRemittance)}</span>
                            </div>
                            <p style={{fontSize: '12px', color: '#16a34a', fontStyle: 'italic', marginTop: '4px'}}>* Số tiền tài xế cần chuyển khoản hoặc nộp tiền mặt về kế toán.</p>
                        </div>

                        {/* Handover Methods */}
                        <div style={{marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb'}}>
                             <h4 style={{fontWeight: 'bold', margin: '0 0 12px 0'}}>4. Hình thức bàn giao</h4>
                             
                             <div className="form-group">
                                 <label className="form-label">1. Tiền mặt (Người nhận)</label>
                                 <div style={{display: 'flex', gap: '8px'}}>
                                     <input 
                                        type="text" 
                                        placeholder="Tên người nhận tiền..."
                                        value={cashRecipient}
                                        onChange={(e) => setCashRecipient(e.target.value)}
                                        className="form-input"
                                        disabled={currentStatus !== 'pending'}
                                        style={{flex: 1}}
                                     />
                                     <input 
                                        type="number" 
                                        placeholder="Số tiền"
                                        value={cashAmount || ''}
                                        onChange={(e) => setCashAmount(Number(e.target.value))}
                                        className="form-input"
                                        style={{width: '150px', textAlign: 'right', fontWeight: 'bold'}}
                                        disabled={currentStatus !== 'pending'}
                                     />
                                 </div>
                             </div>

                             <div className="form-group">
                                 <label className="form-label">2. Chuyển khoản</label>
                                 <div style={{display: 'flex', gap: '8px'}}>
                                     <div style={{flex: 1, padding: '10px', background: '#f3f4f6', borderRadius: '6px', fontSize: '14px', color: '#6b7280', fontStyle: 'italic'}}>
                                         STK Công ty (Mặc định)
                                     </div>
                                     <input 
                                        type="number" 
                                        placeholder="Số tiền"
                                        value={transferAmount || ''}
                                        onChange={(e) => setTransferAmount(Number(e.target.value))}
                                        className="form-input"
                                        style={{width: '150px', textAlign: 'right', fontWeight: 'bold'}}
                                        disabled={currentStatus !== 'pending'}
                                     />
                                 </div>
                             </div>

                             <div style={{display: 'flex', justifyContent: 'flex-end', fontSize: '12px', gap: '8px', marginTop: '8px', alignItems: 'center'}}>
                                <span style={{color: '#6b7280'}}>Tổng nhập: {formatCurrency(cashAmount + transferAmount)}</span>
                                {(cashAmount + transferAmount) !== netRemittance ? (
                                    <span style={{color: '#ef4444', fontWeight: 'bold'}}>
                                        (Lệch: {formatCurrency((cashAmount + transferAmount) - netRemittance)})
                                    </span>
                                ) : (
                                    <span style={{color: '#15803d', fontWeight: 'bold', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px'}}>
                                       Khớp ✓
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer" style={{display: 'flex', gap: '16px'}}>
                    <button 
                        onClick={() => onConfirm('driver')}
                        disabled={currentStatus !== 'pending'}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 'bold', color: 'white', border: 'none', cursor: currentStatus === 'pending' ? 'pointer' : 'not-allowed',
                            background: currentStatus === 'pending' ? '#2563eb' : '#d1d5db'
                        }}
                    >
                        Tài xế đã xác nhận ✓
                    </button>
                    
                    <button 
                        onClick={() => onConfirm('accountant')}
                        disabled={currentStatus !== 'driver_confirmed'}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 'bold', color: 'white', border: 'none', cursor: currentStatus === 'driver_confirmed' ? 'pointer' : 'not-allowed',
                            background: currentStatus === 'driver_confirmed' ? '#16a34a' : '#d1d5db'
                        }}
                    >
                        Kế toán đã duyệt ✓
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Driver Detail View Component ---
const DriverDetailView = ({ driver, vehicles, reports, onBack }) => {
    const [activeTab, setActiveTab] = useState('schedule');
    const [showHandoverModal, setShowHandoverModal] = useState(false);
    const [handoverType, setHandoverType] = useState('receive');
    const [selectedPaymentReport, setSelectedPaymentReport] = useState(null);
    const [paymentStatuses, setPaymentStatuses] = useState({});
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [myShifts, setMyShifts] = useState([
        { id: 's1', date: '2024-06-25', startTime: '07:00', endTime: '18:00', area: 'Quận 1', status: 'approved' },
        { id: 's2', date: '2024-06-26', startTime: '08:00', endTime: '17:00', area: 'Sân bay', status: 'pending' },
    ]);
    const [localHandoverHistory, setLocalHandoverHistory] = useState([]);

    const driverHistory = useMemo(() => {
        const history = [...reports, ...localHandoverHistory]
            .filter(r => r.driverId === driver.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return history;
    }, [driver, reports, localHandoverHistory]);

    // --- KPI & Salary Logic ---
    const salaryAndKPI = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const monthReports = driverHistory.filter(r => {
            const d = new Date(r.date);
            return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
        });

        const totalRevenue = monthReports.reduce((sum, r) => sum + r.revenue, 0);
        const workDays = monthReports.length;
        const totalTrips = monthReports.reduce((sum, r) => sum + r.customerTrips + r.cargoTrips, 0);

        const standardWorkDays = 26;
        const fullBaseSalary = 5000000;
        
        const commissionRate = driver.employmentType === 'partner' 
            ? (driver.revenueShare || 70) / 100 
            : 0.15; 
            
        const fixedAllowance = 2000000;
        const kpiTarget = 50000000;
        const kpiBonus = 1000000;
        const attendanceBonus = 1000000;
        const deductions = 200000;

        let actualBaseSalary = 0;
        let commission = 0;
        let allowance = 0;
        let achievedKpiBonus = 0;
        let achievedAttendanceBonus = 0;
        let totalSalary = 0;

        if (driver.employmentType === 'partner') {
            commission = totalRevenue * commissionRate;
            totalSalary = commission - deductions;
        } else {
            actualBaseSalary = Math.round((workDays / standardWorkDays) * fullBaseSalary);
            commission = totalRevenue * commissionRate;
            achievedKpiBonus = totalRevenue >= kpiTarget ? kpiBonus : 0;
            achievedAttendanceBonus = workDays >= standardWorkDays ? attendanceBonus : 0;
            allowance = fixedAllowance;
            totalSalary = actualBaseSalary + commission + allowance + achievedKpiBonus + achievedAttendanceBonus - deductions;
        }
        
        const kpiProgress = Math.min((totalRevenue / kpiTarget) * 100, 100);

        return {
            month: currentMonth,
            year: currentYear,
            totalRevenue,
            workDays,
            totalTrips,
            kpiTarget,
            kpiProgress,
            salaryDetails: {
                standardWorkDays,
                fullBaseSalary,
                actualBaseSalary,
                commission,
                commissionRate: commissionRate * 100,
                allowance,
                achievedKpiBonus,
                achievedAttendanceBonus,
                deductions,
                totalSalary
            }
        };
    }, [driverHistory, driver.employmentType, driver.revenueShare]);

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    const formatDate = (isoStr) => new Date(isoStr).toLocaleDateString('vi-VN');
    
    const getVehiclePlate = (vehicleId) => {
        const v = vehicles.find(veh => veh.id === vehicleId);
        return v ? v.licensePlate : 'Xe đã xóa';
    };

    const handleOpenHandover = (type) => {
        setHandoverType(type);
        setShowHandoverModal(true);
    };

    const handleHandoverSubmit = (data) => {
        const newReport = {
            id: `h${Date.now()}`,
            date: data.date,
            driverId: driver.id,
            vehicleId: data.vehicleId,
            distance: 0, 
            customerTrips: 0,
            cargoTrips: 0,
            revenue: 0,
            startTime: data.type === 'receive' ? data.date : undefined,
            endTime: data.type === 'return' ? data.date : undefined,
        };
        
        setLocalHandoverHistory(prev => [newReport, ...prev]);
        alert(`${data.type === 'receive' ? 'Nhận' : 'Trả'} xe thành công! Dữ liệu đã được lưu.`);
    };

    const handleConfirmPayment = (role) => {
        if (!selectedPaymentReport) return;
        
        const currentStatus = paymentStatuses[selectedPaymentReport.id] || 'pending';
        let newStatus = currentStatus;

        if (role === 'driver' && currentStatus === 'pending') {
            newStatus = 'driver_confirmed';
        } else if (role === 'accountant' && currentStatus === 'driver_confirmed') {
            newStatus = 'completed';
        }

        setPaymentStatuses(prev => ({
            ...prev,
            [selectedPaymentReport.id]: newStatus
        }));
    };

    const handleRegisterShift = (shift) => {
        const newShift = {
            id: `s${Date.now()}`,
            date: shift.date,
            startTime: shift.startTime,
            endTime: shift.endTime,
            area: shift.area || '',
            status: 'pending'
        };
        setMyShifts(prev => [...prev, newShift]);
        alert('Đã gửi đăng ký lịch chạy!');
    };

    return (
        <div className="detail-view">
            <HandoverFormModal 
                isOpen={showHandoverModal}
                onClose={() => setShowHandoverModal(false)}
                type={handoverType}
                driver={driver}
                vehicles={vehicles}
                onSubmit={handleHandoverSubmit}
            />

            <PaymentConfirmationModal
                isOpen={!!selectedPaymentReport}
                onClose={() => setSelectedPaymentReport(null)}
                report={selectedPaymentReport || { revenue: 0, date: new Date().toISOString() }}
                driverName={driver.name}
                vehiclePlate={selectedPaymentReport ? getVehiclePlate(selectedPaymentReport.vehicleId) : ''}
                onConfirm={handleConfirmPayment}
                currentStatus={selectedPaymentReport ? (paymentStatuses[selectedPaymentReport.id] || 'pending') : 'pending'}
            />

            <ScheduleRegistrationModal 
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                onSubmit={handleRegisterShift}
            />

            {/* Header */}
            <div className="detail-header">
                <div className="detail-top">
                    <button onClick={onBack} className="back-btn"><ArrowLeftIcon /></button>
                    <div className="driver-profile">
                        <h2 className="driver-name">
                            {driver.name}
                            <StatusIcon status={driver.status} />
                        </h2>
                        <div className="driver-meta">
                             <div className="driver-meta-item">
                                <UserCircleIcon /> 
                                <span>SĐT: <b>{driver.phone}</b></span>
                            </div>
                            <div className="driver-meta-item">
                                <CalendarIcon />
                                <span>Ngày sinh: <b>01/01/1985</b></span>
                            </div>
                             <div className="driver-meta-item">
                                <span>SĐT Người thân: <b>{driver.relativePhone1 || 'Chưa cập nhật'}</b></span>
                            </div>
                        </div>
                    </div>
                     <div className="driver-stats">
                        <p className="stat-title">Tổng Doanh Thu (Tháng)</p>
                        <p className="stat-value">{formatCurrency(salaryAndKPI.totalRevenue)}</p>
                        <span className={`badge ${driver.status === 'on-shift' ? 'green' : 'yellow'}`}>
                            {driver.status.replace('-', ' ')}
                        </span>
                    </div>
                </div>

                <div className="tabs-nav">
                    <button onClick={() => setActiveTab('schedule')} className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}>Lịch hoạt động</button>
                    <button onClick={() => setActiveTab('handover')} className={`tab-btn ${activeTab === 'handover' ? 'active' : ''}`}>Bàn giao hàng ngày</button>
                    <button onClick={() => setActiveTab('payment')} className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}>Thanh toán hàng ngày</button>
                    <button onClick={() => setActiveTab('salary')} className={`tab-btn ${activeTab === 'salary' ? 'active' : ''}`}>Lương & KPI</button>
                </div>
            </div>

            {/* Content */}
            <div className="detail-content">
                
                {activeTab === 'schedule' && (
                    <div className="schedule-container">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <h3 style={{fontSize: '18px', fontWeight: 'bold', margin: 0}}>Lịch làm việc đã đăng ký</h3>
                            {driver.employmentType === 'partner' && (
                                <button 
                                    onClick={() => setShowScheduleModal(true)}
                                    style={{padding: '8px 16px', background: '#9333ea', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}
                                >
                                    <ClockIcon /> Đăng ký lịch chạy
                                </button>
                            )}
                        </div>

                        <div className="schedule-list">
                            {myShifts.length > 0 ? (
                                myShifts.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(shift => (
                                    <div key={shift.id} className="shift-item">
                                        <div>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px'}}>
                                                <span style={{fontSize: '16px', fontWeight: 'bold'}}>{new Date(shift.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
                                                <span className={`badge ${shift.status === 'approved' ? 'green' : shift.status === 'rejected' ? 'red' : 'yellow'}`}>
                                                    {shift.status === 'approved' ? 'Đã duyệt' : shift.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                                                </span>
                                            </div>
                                            <div style={{fontSize: '14px', color: '#4b5563', display: 'flex', gap: '16px'}}>
                                                <span>⏰ {shift.startTime} - {shift.endTime}</span>
                                                <span>📍 {shift.area || 'Toàn thành phố'}</span>
                                            </div>
                                        </div>
                                        {shift.status === 'pending' && (
                                            <button style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500}}>Hủy đăng ký</button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div style={{textAlign: 'center', padding: '40px', color: '#6b7280'}}>Chưa có lịch làm việc nào.</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'handover' && (
                     <div className="handover-landing">
                        <div className="handover-grid">
                            <button onClick={() => handleOpenHandover('receive')} className="handover-btn receive">
                                <div className="icon-circle blue"><CarIcon /></div>
                                <h3 style={{fontSize: '20px', fontWeight: 'bold', color: '#1d4ed8', margin: '0 0 8px 0'}}>NHẬN XE (ĐẦU CA)</h3>
                                <p style={{color: '#6b7280', margin: 0}}>Khai báo tình trạng xe, giấy tờ và trang thiết bị trước khi bắt đầu làm việc.</p>
                            </button>

                            <button onClick={() => handleOpenHandover('return')} className="handover-btn return">
                                <div className="icon-circle orange"><ArchiveIcon /></div>
                                <h3 style={{fontSize: '20px', fontWeight: 'bold', color: '#c2410c', margin: '0 0 8px 0'}}>TRẢ XE (KẾT CA)</h3>
                                <p style={{color: '#6b7280', margin: 0}}>Chốt chỉ số ODO, xăng, tình trạng vệ sinh và báo cáo sự cố sau khi kết thúc ca.</p>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'payment' && (
                    <div style={{overflowX: 'auto'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                            <thead style={{background: '#f9fafb'}}>
                                <tr>
                                    <th style={{padding: '12px 24px', textAlign: 'left', fontSize: '12px', color: '#6b7280'}}>Ngày</th>
                                    <th style={{padding: '12px 24px', textAlign: 'right', fontSize: '12px', color: '#6b7280'}}>Doanh thu tổng</th>
                                    <th style={{padding: '12px 24px', textAlign: 'right', fontSize: '12px', color: '#6b7280'}}>Thực nộp</th>
                                    <th style={{padding: '12px 24px', textAlign: 'center', fontSize: '12px', color: '#6b7280'}}>Trạng thái</th>
                                    <th style={{padding: '12px 24px', textAlign: 'right', fontSize: '12px', color: '#6b7280'}}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {driverHistory.map((report) => {
                                    const dispatcherCollected = Math.round(report.revenue * 0.4);
                                    const driverCollected = report.revenue - dispatcherCollected;
                                    const expenses = 50000;
                                    const netRemittance = driverCollected - expenses;
                                    const status = paymentStatuses[report.id] || 'pending';

                                    return (
                                        <tr key={report.id} style={{borderBottom: '1px solid #e5e7eb'}}>
                                            <td style={{padding: '16px 24px'}}>{formatDate(report.date)}</td>
                                            <td style={{padding: '16px 24px', textAlign: 'right', fontWeight: 500, color: '#2563eb'}}>{formatCurrency(report.revenue)}</td>
                                            <td style={{padding: '16px 24px', textAlign: 'right', fontWeight: 'bold', color: '#16a34a'}}>{formatCurrency(netRemittance)}</td>
                                            <td style={{padding: '16px 24px', textAlign: 'center'}}>
                                                <span className={`badge ${status === 'completed' ? 'green' : status === 'driver_confirmed' ? 'blue' : 'yellow'}`}>
                                                    {status === 'completed' ? 'Đã duyệt' : status === 'driver_confirmed' ? 'Chờ duyệt' : 'Chờ xác nhận'}
                                                </span>
                                            </td>
                                            <td style={{padding: '16px 24px', textAlign: 'right'}}>
                                                <button onClick={() => setSelectedPaymentReport(report)} style={{color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}>Chi tiết</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'salary' && (
                    <div className="salary-container">
                        <div className="kpi-grid">
                            <div className="kpi-card">
                                <p className="stat-title">Tháng {salaryAndKPI.month}/{salaryAndKPI.year}</p>
                                <p className="stat-value">{formatCurrency(salaryAndKPI.totalRevenue)}</p>
                                <p style={{fontSize: '12px', color: '#9ca3af', margin: 0}}>Doanh thu đạt được</p>
                            </div>
                            <div className="kpi-card">
                                <p className="stat-title">Số chuyến</p>
                                <p className="stat-value" style={{color: '#1f2937'}}>{salaryAndKPI.totalTrips}</p>
                                <p style={{fontSize: '12px', color: '#9ca3af', margin: 0}}>Chuyến đi thành công</p>
                            </div>
                            <div className="kpi-card">
                                <p className="stat-title">Ngày công</p>
                                <p className="stat-value" style={{color: '#1f2937'}}>{salaryAndKPI.workDays}/{salaryAndKPI.salaryDetails.standardWorkDays}</p>
                                <p style={{fontSize: '12px', color: '#9ca3af', margin: 0}}>Ngày hoạt động</p>
                            </div>
                            <div className="kpi-card">
                                <p className="stat-title">Đạt KPI</p>
                                <div style={{width: '100%', background: '#e5e7eb', height: '10px', borderRadius: '5px', marginTop: '8px', overflow: 'hidden'}}>
                                    <div style={{width: `${salaryAndKPI.kpiProgress}%`, background: '#16a34a', height: '100%'}}></div>
                                </div>
                                <p style={{fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0'}}>Mục tiêu: {formatCurrency(salaryAndKPI.kpiTarget)}</p>
                            </div>
                        </div>

                        <div className="salary-slip">
                            <div className="slip-header">
                                Phiếu Lương Tạm Tính (Tháng {salaryAndKPI.month})
                            </div>
                            <table className="slip-table">
                                <tbody>
                                    {driver.employmentType === 'staff' && (
                                        <tr>
                                            <td>
                                                <div style={{fontWeight: 500}}>1. Lương cứng</div>
                                                <div style={{fontSize: '12px', color: '#6b7280'}}>({salaryAndKPI.workDays} công / {salaryAndKPI.salaryDetails.standardWorkDays} * {formatCurrency(salaryAndKPI.salaryDetails.fullBaseSalary)})</div>
                                            </td>
                                            <td style={{textAlign: 'right', fontWeight: 'bold'}}>{formatCurrency(salaryAndKPI.salaryDetails.actualBaseSalary)}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td>
                                            <div style={{fontWeight: 500}}>{driver.employmentType === 'partner' ? '1. Phần trăm doanh thu' : '2. Hoa hồng doanh thu'} ({salaryAndKPI.salaryDetails.commissionRate}%)</div>
                                            <div style={{fontSize: '12px', color: '#6b7280'}}>Trên tổng DT: {formatCurrency(salaryAndKPI.totalRevenue)}</div>
                                        </td>
                                        <td style={{textAlign: 'right', fontWeight: 'bold', color: '#16a34a'}}>{formatCurrency(salaryAndKPI.salaryDetails.commission)}</td>
                                    </tr>
                                    {driver.employmentType === 'staff' && (
                                        <>
                                            <tr>
                                                <td style={{fontWeight: 500}}>3. Phụ cấp cố định</td>
                                                <td style={{textAlign: 'right', fontWeight: 'bold'}}>{formatCurrency(salaryAndKPI.salaryDetails.allowance)}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div style={{fontWeight: 500}}>4. Thưởng đạt KPI doanh thu</div>
                                                    <div style={{fontSize: '12px', color: '#6b7280'}}>{salaryAndKPI.totalRevenue >= salaryAndKPI.kpiTarget ? 'Đạt' : 'Chưa đạt'}</div>
                                                </td>
                                                <td style={{textAlign: 'right', fontWeight: 'bold', color: salaryAndKPI.salaryDetails.achievedKpiBonus > 0 ? '#16a34a' : '#9ca3af'}}>
                                                    {formatCurrency(salaryAndKPI.salaryDetails.achievedKpiBonus)}
                                                </td>
                                            </tr>
                                        </>
                                    )}
                                    <tr style={{background: '#fef2f2'}}>
                                        <td style={{fontWeight: 500}}>{driver.employmentType === 'partner' ? '2. Khấu trừ (Phí quản lý/BH)' : '6. Khấu trừ (Công đoàn/BHXH)'}</td>
                                        <td style={{textAlign: 'right', fontWeight: 'bold', color: '#dc2626'}}>-{formatCurrency(salaryAndKPI.salaryDetails.deductions)}</td>
                                    </tr>
                                    <tr style={{background: '#f3f4f6'}}>
                                        <td style={{fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase'}}>Tổng thực nhận</td>
                                        <td style={{textAlign: 'right', fontSize: '20px', fontWeight: 'bold', color: '#2563eb'}}>{formatCurrency(salaryAndKPI.salaryDetails.totalSalary)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Component ---
const DriverList = ({ drivers, setDrivers, vehicles, setVehicles, reports }) => {
    const [selectedDriverId, setSelectedDriverId] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [formData, setFormData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const handleOpenAdd = () => {
        setEditingDriver(null);
        setFormData({ status: 'off-duty', employmentType: 'staff' });
        setIsFormModalOpen(true);
    };

    const handleOpenEdit = (driver, e) => {
        e.stopPropagation();
        setEditingDriver(driver);
        setFormData(driver);
        setIsFormModalOpen(true);
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        if (window.confirm('Bạn có chắc chắn muốn xóa tài xế này?')) {
            setDrivers(prev => prev.filter(d => d.id !== id));
            setVehicles(prev => prev.map(v => v.driverId === id ? { ...v, driverId: undefined, status: 'idle' } : v));
        }
    };

    const handleSubmit = () => {
        if (editingDriver) {
            setDrivers(prev => prev.map(d => d.id === editingDriver.id ? { ...d, ...formData } : d));
        } else {
            const newDriver = {
                ...formData,
                id: `d${Date.now()}`,
                isArchived: false,
                name: formData.name || 'Tài xế mới',
                phone: formData.phone || '',
                status: 'off-duty',
                licenseExpiry: formData.licenseExpiry || ''
            };
            setDrivers(prev => [...prev, newDriver]);
        }
        setIsFormModalOpen(false);
    };

    const filteredDrivers = drivers.filter(d =>
        !d.isArchived && (
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.phone.includes(searchTerm)
        ));

    const selectedDriver = drivers.find(d => d.id === selectedDriverId);

    if (selectedDriver) {
        return (
            <DriverDetailView
                driver={selectedDriver}
                vehicles={vehicles}
                reports={reports}
                onBack={() => setSelectedDriverId(null)}
            />
        );
    }

    return (
        <div className="driver-page">
            <div className="page-header">
                <h2>Quản lý Tài xế</h2>
                <button onClick={handleOpenAdd} style={{padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 500, cursor: 'pointer'}}>
                    Thêm Tài xế
                </button>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Tìm kiếm tài xế (Tên, SĐT)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="driver-grid">
                {filteredDrivers.map(driver => (
                    <div
                        key={driver.id}
                        onClick={() => setSelectedDriverId(driver.id)}
                        className="driver-card"
                    >
                        <div className="card-actions">
                            <button onClick={(e) => handleOpenEdit(driver, e)} className="action-btn edit"><PencilIcon /></button>
                            <button onClick={(e) => handleDelete(driver.id, e)} className="action-btn delete"><XIcon /></button>
                        </div>

                        <div className="card-header">
                            <div className="avatar-placeholder"><UserCircleIcon /></div>
                            <div>
                                <h3>{driver.name}</h3>
                                <p>{driver.phone}</p>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="info-row">
                                <span className="info-label">Trạng thái:</span>
                                <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                                    <StatusIcon status={driver.status} />
                                    <span className="info-value" style={{textTransform: 'capitalize'}}>{driver.status.replace('-', ' ')}</span>
                                </div>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Loại hình:</span>
                                <span className="info-value">{driver.employmentType === 'partner' ? 'Đối tác' : 'Nhân viên'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Xe hiện tại:</span>
                                <span className="info-value">
                                    {driver.vehicleId ? vehicles.find(v => v.id === driver.vehicleId)?.licensePlate : 'Chưa nhận xe'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isFormModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content md" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{margin: 0, fontSize: '18px'}}>{editingDriver ? 'Sửa thông tin tài xế' : 'Thêm tài xế mới'}</h3>
                            <button onClick={() => setIsFormModalOpen(false)} style={{background:'none', border:'none', cursor:'pointer'}}><XIcon /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Họ và tên</label>
                                <input type="text" className="form-input" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Số điện thoại</label>
                                <input type="tel" className="form-input" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div className="form-group">
                                    <label className="form-label">Loại hình</label>
                                    <select className="form-select" value={formData.employmentType || 'staff'} onChange={e => setFormData({ ...formData, employmentType: e.target.value })}>
                                        <option value="staff">Nhân viên</option>
                                        <option value="partner">Đối tác</option>
                                    </select>
                                </div>
                                {formData.employmentType === 'partner' && (
                                    <div className="form-group">
                                        <label className="form-label">Tỷ lệ chia sẻ (%)</label>
                                        <input type="number" className="form-input" value={formData.revenueShare || 70} onChange={e => setFormData({ ...formData, revenueShare: Number(e.target.value) })} />
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Hạn bằng lái</label>
                                <input type="date" className="form-input" value={formData.licenseExpiry || ''} onChange={e => setFormData({ ...formData, licenseExpiry: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">SĐT Người thân (Khẩn cấp)</label>
                                <input type="text" className="form-input" value={formData.relativePhone1 || ''} onChange={e => setFormData({ ...formData, relativePhone1: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Gán xe (Tuỳ chọn)</label>
                                <select className="form-select" value={formData.vehicleId || ''} onChange={e => setFormData({ ...formData, vehicleId: e.target.value || undefined })}>
                                    <option value="">-- Chưa gán --</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.licensePlate} - {v.type} {v.driverId && v.driverId !== editingDriver?.id ? '(Đã có TX)' : ''}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setIsFormModalOpen(false)} style={{padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>Hủy</button>
                            <button onClick={handleSubmit} style={{padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>Lưu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverList;