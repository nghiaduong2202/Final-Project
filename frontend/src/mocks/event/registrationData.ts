import { EventRegistration } from '@/types/event.type';

// Dữ liệu mẫu cho các đăng ký tham gia sự kiện
export const mockEventRegistrations: EventRegistration[] = [
  {
    id: 'reg-001',
    userId: '64ee35ec-b755-4045-90c4-c0f1e2a5be79',
    eventId: 1, // Giải đấu Tennis mùa hè
    userName: 'Nguyễn Văn A',
    userEmail: 'nguyenvana@example.com',
    userPhone: '0901234567',
    registrationDate: '2025-06-15T10:00:00Z',
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'bank',
    notes: 'Tôi muốn tham gia với một người bạn, có thể xếp lịch vào buổi chiều được không?'
  },
  {
    id: 'reg-002',
    userId: '64ee35ec-b755-4045-90c4-c0f1e2a5be79',
    eventId: 4, // Giải đấu Tennis mùa hè
    userName: 'Trần Thị B',
    userEmail: 'tranthib@example.com',
    userPhone: '0912345678',
    registrationDate: '2025-06-14T15:30:00Z',
    status: 'approved',
    paymentStatus: 'paid',
    paymentMethod: 'bank',
    paymentProof: 'https://via.placeholder.com/300x400?text=Payment+Proof',
    paymentDate: '2025-06-14T16:45:00Z',
    approvedBy: 'owner-001',
    approvedDate: '2025-06-15T09:30:00Z'
  },
  {
    id: 'reg-003',
    userId: 'user-003',
    eventId: 3, // Cúp Bóng đá Phạm Kha
    userName: 'Lê Văn C',
    userEmail: 'levanc@example.com',
    userPhone: '0923456789',
    registrationDate: '2025-04-20T08:45:00Z',
    status: 'rejected',
    paymentStatus: 'refunded',
    paymentMethod: 'momo',
    paymentProof: 'https://via.placeholder.com/300x400?text=Payment+Proof',
    paymentDate: '2025-04-20T09:15:00Z',
    approvedBy: 'owner-002',
    approvedDate: '2025-04-21T10:00:00Z',
    rejectionReason: 'Đội bóng đã đủ số lượng, không thể đăng ký thêm.'
  },
  {
    id: 'reg-004',
    userId: 'user-004',
    eventId: 3, // Cúp Bóng đá Phạm Kha
    userName: 'Phạm Thị D',
    userEmail: 'phamthid@example.com',
    userPhone: '0934567890',
    registrationDate: '2025-04-19T14:00:00Z',
    status: 'approved',
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    paymentDate: '2025-04-19T14:30:00Z',
    approvedBy: 'owner-002',
    approvedDate: '2025-04-19T15:00:00Z',
    teamName: 'FC Phạm Kha',
    teamMembers: [
      { name: 'Phạm Thị D', email: 'phamthid@example.com', phone: '0934567890' },
      { name: 'Nguyễn Văn E', email: 'nguyenvane@example.com', phone: '0945678901' },
      { name: 'Trần Văn F', email: 'tranvanf@example.com', phone: '0956789012' },
      { name: 'Lê Thị G', email: 'lethig@example.com', phone: '0967890123' },
      { name: 'Hoàng Văn H', email: 'hoangvanh@example.com', phone: '0978901234' }
    ]
  },
  {
    id: 'reg-005',
    userId: 'user-005',
    eventId: 6, // Giải đấu Cầu lông Phạm Kha
    userName: 'Vũ Thị I',
    userEmail: 'vuthii@example.com',
    userPhone: '0989012345',
    registrationDate: '2024-05-25T10:15:00Z',
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'zalopay',
    notes: 'Đây là lần đầu tôi tham gia giải đấu cầu lông, mong được hướng dẫn thêm.'
  },
  {
    id: 'reg-006',
    userId: 'user-006',
    eventId: 6, // Giải đấu Cầu lông Phạm Kha
    userName: 'Đặng Văn K',
    userEmail: 'dangvank@example.com',
    userPhone: '0990123456',
    registrationDate: '2024-05-24T16:30:00Z',
    status: 'approved',
    paymentStatus: 'paid',
    paymentMethod: 'bank',
    paymentProof: 'https://via.placeholder.com/300x400?text=Payment+Proof',
    paymentDate: '2024-05-24T17:00:00Z',
    approvedBy: 'owner-001',
    approvedDate: '2024-05-25T09:00:00Z'
  }
];

// Function lấy đăng ký theo ID sự kiện
export const getRegistrationsByEventId = (eventId: number): EventRegistration[] => {
  return mockEventRegistrations.filter(reg => reg.eventId === eventId);
};

// Function lấy đăng ký theo ID người dùng (player)
export const getRegistrationsByUserId = (userId: string): EventRegistration[] => {
  return mockEventRegistrations.filter(reg => reg.userId === userId);
};

// Function lấy số lượng đăng ký theo từng trạng thái
export const getRegistrationCountsByStatus = (eventId: number) => {
  const registrations = getRegistrationsByEventId(eventId);
  
  return {
    total: registrations.length,
    pending: registrations.filter(reg => reg.status === 'pending').length,
    approved: registrations.filter(reg => reg.status === 'approved').length,
    rejected: registrations.filter(reg => reg.status === 'rejected').length
  };
}; 