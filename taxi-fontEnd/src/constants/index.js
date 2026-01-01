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

export const MOCK_VEHICLES = [
    {
        id: 'v1',
        licensePlate: '59A-123.45',
        type: 'Sedan',
        seats: 4,
        status: 'active',
        driverId: 'd1',
        location: { lat: 10.7769, lng: 106.7009 },
        imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80',
        maintenanceDate: '2023-12-01',
        assignments: [MOCK_ASSIGNMENTS[1]],
        maintenanceHistory: []
    },
    {
        id: 'v2',
        licensePlate: '59A-678.90',
        type: 'SUV',
        seats: 7,
        status: 'idle',
        driverId: 'd2',
        location: { lat: 10.7626, lng: 106.6602 },
        imageUrl: 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&w=400&q=80',
        maintenanceDate: '2023-11-15',
        assignments: [],
        maintenanceHistory: []
    },
    {
        id: 'v3',
        licensePlate: '59B-112.23',
        type: 'Van',
        seats: 16,
        status: 'maintenance',
        driverId: undefined,
        location: { lat: 10.8033, lng: 106.6277 },
        imageUrl: 'https://images.unsplash.com/photo-1566008885218-90abf9200ddb?auto=format&fit=crop&w=400&q=80',
        maintenanceDate: '2023-10-25',
        assignments: [],
        maintenanceHistory: []
    },
    {
        id: 'v4',
        licensePlate: '59A-999.99',
        type: 'Luxury',
        seats: 4,
        status: 'active',
        driverId: 'd3',
        location: { lat: 10.7950, lng: 106.7218 },
        imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80',
        maintenanceDate: '2024-01-10',
        assignments: [MOCK_ASSIGNMENTS[2]],
        maintenanceHistory: []
    }
];

export const MOCK_DRIVERS = [
    {
        id: 'd1',
        name: 'Trần Văn Tài',
        phone: '0909111222',
        status: 'on-shift',
        vehicleId: 'v1',
        employmentType: 'staff',
        licenseExpiry: '2025-06-30',
        isArchived: false
    },
    {
        id: 'd2',
        name: 'Nguyễn Thị Mai',
        phone: '0909333444',
        status: 'on-break',
        vehicleId: 'v2',
        employmentType: 'partner',
        revenueShare: 70,
        licenseExpiry: '2024-12-15',
        isArchived: false
    },
    {
        id: 'd3',
        name: 'Phạm Quốc Hùng',
        phone: '0909555666',
        status: 'on-shift',
        vehicleId: 'v4',
        employmentType: 'staff',
        licenseExpiry: '2026-01-20',
        isArchived: false
    },
    {
        id: 'd4',
        name: 'Lê Thanh Tùng',
        phone: '0909777888',
        status: 'off-duty',
        vehicleId: undefined,
        employmentType: 'partner',
        revenueShare: 65,
        licenseExpiry: '2024-08-10',
        isArchived: false
    }
];

export const MOCK_REPORTS = [
    {
        id: 'r1',
        date: '2023-10-26',
        driverId: 'd1',
        vehicleId: 'v1',
        revenue: 4500000,
        distance: 210,
        customerTrips: 15,
        cargoTrips: 2,
        startTime: '2023-10-26T07:00:00',
        endTime: '2023-10-26T19:00:00'
    },
    {
        id: 'r2',
        date: '2023-10-26',
        driverId: 'd2',
        vehicleId: 'v2',
        revenue: 3200000,
        distance: 150,
        customerTrips: 8,
        cargoTrips: 5,
        startTime: '2023-10-26T08:00:00',
        endTime: '2023-10-26T17:00:00'
    }
];

export const MOCK_CUSTOMERS = [
    {
        id: 'c1',
        name: 'Nguyễn Văn A',
        phone: '0901234567',
        type: 'regular',
        address: '123 Nguyễn Huệ, Quận 1',
        email: 'nguyenvana@example.com',
        notes: 'Khách hay đi buổi sáng'
    },
    {
        id: 'c2',
        name: 'Cty TNHH ABC',
        phone: '0987654321',
        type: 'corporate',
        address: 'Kho A, KCN Tân Bình',
        email: 'contact@abc-logistics.com',
        notes: 'Thanh toán công nợ cuối tháng'
    },
    {
        id: 'c3',
        name: 'Lê Văn C',
        phone: '0933445566',
        type: 'vip',
        address: 'Landmark 81, Bình Thạnh',
        email: 'levanc@vip.com',
        notes: 'Yêu cầu xe sang'
    }
];