/* src/constants/index.js */

export const MOCK_ASSIGNMENTS = [
    {
        id: 'a1',
        type: 'customer',
        customerName: 'Nguyễn Văn A',
        customerPhone: '0901234567',
        pickupAddress: '123 Nguyễn Huệ, Quận 1',
        destinationAddress: 'Sân bay Tân Sơn Nhất',
        pickupLocation: { lat: 10.7769, lng: 106.7009 },
        destinationLocation: { lat: 10.8185, lng: 106.6588 },
        status: 'pending',
        price: 250000,
        pickupTime: '2023-10-27T08:00:00'
    },
    {
        id: 'a2',
        type: 'cargo',
        customerName: 'Cty TNHH ABC',
        customerPhone: '0987654321',
        pickupAddress: 'Kho A, KCN Tân Bình',
        destinationAddress: 'Cảng Cát Lái',
        pickupLocation: { lat: 10.8033, lng: 106.6277 },
        destinationLocation: { lat: 10.7550, lng: 106.7877 },
        recipientName: 'Trần Thị B',
        recipientPhone: '0912345678',
        status: 'assigned',
        price: 1500000,
        pickupTime: '2023-10-27T09:30:00'
    },
    {
        id: 'a3',
        type: 'customer',
        customerName: 'Lê Văn C',
        customerPhone: '0933445566',
        pickupAddress: 'Landmark 81, Bình Thạnh',
        destinationAddress: 'Thảo Điền, Quận 2',
        pickupLocation: { lat: 10.7950, lng: 106.7218 },
        destinationLocation: { lat: 10.8009, lng: 106.7466 },
        status: 'completed',
        price: 120000,
        startTime: '2023-10-26T14:00:00',
        endTime: '2023-10-26T14:30:00',
        paymentMethod: 'cash'
    }
];

const TRUCK_MODELS = ['Hino 300 (2.5 Tấn)', 'Isuzu NPR (7.5 Tấn)', 'Hyundai Mighty (3.5 Tấn)', 'Howo A7 (20 Tấn)', 'Chenglong H7 (15 Tấn)'];
const PROVINCE_CODES = ['29H', '15C', '43C', '51D', '65C'];
const TRUCK_IMAGES = [
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1566008885218-90abf9200ddb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=400&q=80'
];

export const MOCK_VEHICLES = Array.from({ length: 60 }, (_, i) => {
  const idNum = i + 1;
  const seqStr = String(idNum).padStart(3, '0');
  const prov = PROVINCE_CODES[i % PROVINCE_CODES.length];
  const num = 1000 + ((i * 137) % 8999);
  const status = i % 7 === 0 ? 'maintenance' : (i % 5 === 0 ? 'idle' : 'active');

  return {
    id: `v${idNum}`,
    licensePlate: `${prov}-${num}`,
    barcode: `FUTA-TRK-${seqStr}`,
    type: TRUCK_MODELS[i % TRUCK_MODELS.length],
    brand: TRUCK_MODELS[i % TRUCK_MODELS.length].split(' ')[0],
    seats: 3,
    status: status,
    driverId: `d${idNum}`,
    currentDriver: `d${idNum}`,
    location: { lat: 10.7769 + (i * 0.005), lng: 106.7009 + (i * 0.005) },
    imageUrl: TRUCK_IMAGES[i % TRUCK_IMAGES.length],
    maintenanceDate: `2026-0${(i % 9) + 1}-15`,
    odometer: 15000 + (idNum * 320),
    fuelLevel: 85 + (i % 15),
    assignments: [],
    maintenanceHistory: []
  };
});

const RAW_DRIVER_NAMES = [
  'Lê Văn Tài', 'Phạm Minh Đức', 'Nguyễn Hoàng Nam', 'Trần Quốc Bảo', 'Vũ Tuấn Anh',
  'Đặng Huy Hoàng', 'Bùi Quang Huy', 'Ngô Thành Trung', 'Hoàng Trọng Hiếu', 'Đỗ Minh Trí',
  'Nguyễn Thanh Tùng', 'Lý Văn Hùng', 'Đinh Văn Lâm', 'Trịnh Tấn Phát', 'Võ Văn Kiệt',
  'Dương Hải Đăng', 'Phan Văn Nhật', 'Huỳnh Tấn Đạt', 'Mai Quốc Tuấn', 'Cao Minh Lộc',
  'Nguyễn Hoàng Long', 'Trương Văn Thịnh', 'Hồ Hữu Phước', 'Lâm Quốc Cường', 'Đào Văn Sang',
  'Trần Đình Trọng', 'Nguyễn Tiến Dũng', 'Vũ Văn Thanh', 'Đỗ Duy Mạnh', 'Nguyễn Quang Hải',
  'Phan Văn Đức', 'Nguyễn Công Phượng', 'Lương Xuân Trường', 'Nguyễn Tuấn Anh', 'Phạm Đức Huy',
  'Hà Đức Chinh', 'Nguyễn Văn Toàn', 'Đoàn Văn Hậu', 'Hồ Tấn Tài', 'Bùi Tiến Dũng',
  'Nguyễn Văn Hoàng', 'Trần Nguyên Mạnh', 'Đặng Văn Lâm', 'Nguyễn Thành Chung', 'Bùi Hoàng Việt Anh',
  'Nguyễn Thanh Bình', 'Nhâm Mạnh Dũng', 'Khuất Văn Khang', 'Nguyễn Thái Sơn', 'Phan Tuấn Tài',
  'Nguyễn Văn Tùng', 'Phạm Tuấn Hải', 'Nguyễn Hoàng Đức', 'Nguyễn Đình Bắc', 'Võ Minh Trọng',
  'Bùi Vĩ Hào', 'Nguyễn Văn Trường', 'Nguyễn Thanh Nhàn', 'Trần Nam Hải', 'Lê Nguyên Hoàng'
];

export const MOCK_DRIVERS = RAW_DRIVER_NAMES.map((name, index) => {
    const idNum = index + 1;
    const seqStr = String(idNum).padStart(2, '0');
    const statuses = ['on-shift', 'on-break', 'off-duty'];
    const empTypes = ['staff', 'partner'];
    const status = statuses[index % 3];
    const employmentType = empTypes[index % 2];
    
    return {
        id: `d${idNum}`,
        username: `driver${idNum}`,
        email: `taixe${seqStr}@futaexpress.vn`,
        name: `${name} (Tài xế ${seqStr})`,
        phone: `09033333${seqStr}`,
        status: status,
        vehicleId: `v${idNum}`,
        employmentType: employmentType,
        revenueShare: employmentType === 'partner' ? 70 : undefined,
        licenseExpiry: `202${5 + (index % 3)}-0${(index % 9) + 1}-15`,
        isArchived: false,
        isActive: true
    };
});

export const MOCK_REPORTS = Array.from({ length: 90 }, (_, index) => {
  const dayOffset = index % 30;
  const d = new Date();
  d.setDate(d.getDate() - dayOffset);
  const dateStr = d.toISOString().split('T')[0];
  const drvId = `d${(index % 60) + 1}`;
  const vehId = `v${(index % 60) + 1}`;
  const isCargo = index % 2 === 0;

  return {
    id: `r${index + 1}`,
    date: dateStr,
    driverId: drvId,
    vehicleId: vehId,
    revenue: isCargo ? (3500000 + (index % 10) * 400000) : (1800000 + (index % 8) * 300000),
    distance: 110 + ((index * 13) % 210),
    customerTrips: isCargo ? 0 : (1 + (index % 3)),
    cargoTrips: isCargo ? (1 + (index % 2)) : 0,
    startTime: `${dateStr}T07:00:00`,
    endTime: `${dateStr}T18:00:00`
  };
});

export const MOCK_CUSTOMERS = [
    {
        id: 'c1',
        name: 'Công ty Lương thực FUTA Agrico',
        phone: '0908111222',
        type: 'corporate',
        address: '123 Nguyễn Huệ, Quận 1',
        email: 'agrico@futaexpress.vn',
        notes: 'Khách hàng lớn đối tác vận tải'
    },
    {
        id: 'c2',
        name: 'Tập đoàn Điện tử Samsung Vina',
        phone: '0918222333',
        type: 'corporate',
        address: 'KCN Hiệp Phước, TP.HCM',
        email: 'logistics@samsung.com',
        notes: 'Giao linh kiện điện tử nguyên kho'
    },
    {
        id: 'c3',
        name: 'Tổng kho Bưu chính Express TP.HCM',
        phone: '0938333444',
        type: 'corporate',
        address: 'Tân Bình, TP.HCM',
        email: 'express@futa.vn',
        notes: 'Trung chuyển bưu kiện miền Tây'
    }
];