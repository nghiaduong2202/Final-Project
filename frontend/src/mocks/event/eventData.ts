import { Event, EventDetail } from '@/types/event.type';

// Mock data for events
export const mockEvents: Event[] = [
  {
    id: 1,
    name: 'Giải đấu Tennis mùa hè',
    description: 'Giải đấu tennis dành cho tất cả khách hàng với nhiều phần quà hấp dẫn.',
    startDate: '2024-07-15T08:00:00Z',
    endDate: '2024-07-20T18:00:00Z',
    status: 'upcoming',
    createdAt: '2024-06-20T10:15:00Z',
    updatedAt: '2024-06-20T10:15:00Z',
    facilityId: '2',
    eventType: 'TOURNAMENT',
    image: 'tennis_tournament.jpg'
  },
  {
    id: 2,
    name: 'Khuyến mãi đặt sân sớm',
    description: 'Giảm 20% cho tất cả các đơn đặt sân trước 7 ngày.',
    startDate: '2024-06-01T00:00:00Z',
    endDate: '2024-06-30T23:59:59Z',
    status: 'active',
    createdAt: '2024-05-25T14:30:00Z',
    updatedAt: '2024-05-25T14:30:00Z',
    facilityId: '1',
    eventType: 'DISCOUNT',
    image: 'early_booking_discount.jpg'
  },
  {
    id: 3,
    name: 'Cúp Bóng đá Phạm Kha',
    description: 'Giải đấu bóng đá 5v5 dành cho các đội chơi tại sân Phạm Kha.',
    startDate: '2024-05-10T09:00:00Z',
    endDate: '2024-05-12T18:00:00Z',
    status: 'expired',
    createdAt: '2024-04-15T11:20:00Z',
    updatedAt: '2024-04-15T11:20:00Z',
    facilityId: '1',
    eventType: 'TOURNAMENT',
    image: 'football_cup.jpg'
  },
  {
    id: 4,
    name: 'Ngày hội thể thao gia đình',
    description: 'Chương trình dành cho các gia đình với nhiều hoạt động thể thao và giải trí.',
    startDate: '2024-07-25T08:00:00Z',
    endDate: '2024-07-25T20:00:00Z',
    status: 'upcoming',
    createdAt: '2024-06-18T09:45:00Z',
    updatedAt: '2024-06-18T09:45:00Z',
    facilityId: '2',
    eventType: 'SPECIAL_OFFER',
    image: 'family_sports_day.jpg'
  },
  {
    id: 5,
    name: 'Bạn mới - Ưu đãi lớn',
    description: 'Giảm 30% cho khách hàng đặt sân lần đầu.',
    startDate: '2024-06-15T00:00:00Z',
    endDate: '2024-08-15T23:59:59Z',
    status: 'active',
    createdAt: '2024-06-10T15:40:00Z',
    updatedAt: '2024-06-10T15:40:00Z',
    facilityId: '3',
    eventType: 'DISCOUNT',
    image: 'new_customer_discount.jpg'
  },
  {
    id: 6,
    name: 'Giải đấu Cầu lông Phạm Kha',
    description: 'Giải đấu cầu lông dành cho mọi lứa tuổi với nhiều hạng mục thi đấu.',
    startDate: '2024-06-05T09:00:00Z',
    endDate: '2024-06-07T18:00:00Z',
    status: 'expired',
    createdAt: '2024-05-20T13:25:00Z',
    updatedAt: '2024-05-20T13:25:00Z',
    facilityId: '4',
    eventType: 'TOURNAMENT',
    image: 'badminton_tournament.jpg'
  }
];

// Mock event types
export const mockEventTypes = [
  { id: 'DISCOUNT', name: 'Khuyến mãi' },
  { id: 'TOURNAMENT', name: 'Giải đấu' },
  { id: 'SPECIAL_OFFER', name: 'Ưu đãi đặc biệt' }
];

// Mock additional event data for expanded event model
export const mockEventDetails: Record<number, EventDetail> = {
  1: {
    eventType: 'TOURNAMENT',
    targetSportId: 3, // Tennis
    facilityId: '2',
    image: 'tennis_tournament.jpg',
    fields: ['Field 1', 'Field 2', 'Field 3'],
    maxParticipants: 32,
    currentParticipants: 24,
    registrationEndDate: '2024-07-10T23:59:59Z',
    prizes: [
      { position: 1, prize: 'Cup + 5.000.000 VNĐ' },
      { position: 2, prize: '3.000.000 VNĐ' },
      { position: 3, prize: '1.000.000 VNĐ' }
    ]
  },
  2: {
    eventType: 'DISCOUNT',
    facilityId: '1',
    discountPercent: 20,
    image: 'early_booking_discount.jpg',
    conditions: 'Áp dụng cho đặt sân trước 7 ngày',
    minBookingValue: 0
  },
  3: {
    eventType: 'TOURNAMENT',
    targetSportId: 1, // Bóng đá
    facilityId: '1',
    image: 'football_cup.jpg',
    fields: ['Field 1', 'Field 2'],
    maxParticipants: 16,
    currentParticipants: 16,
    registrationEndDate: '2024-05-05T23:59:59Z',
    prizes: [
      { position: 1, prize: 'Cup + 3.000.000 VNĐ' },
      { position: 2, prize: '2.000.000 VNĐ' },
      { position: 3, prize: '1.000.000 VNĐ' }
    ]
  },
  4: {
    eventType: 'SPECIAL_OFFER',
    facilityId: '2',
    image: 'family_sports_day.jpg',
    activities: ['Tennis', 'Bóng đá', 'Bóng rổ', 'Cầu lông'],
    specialServices: ['Đồ ăn miễn phí', 'Huấn luyện viên hướng dẫn', 'Trò chơi cho trẻ em']
  },
  5: {
    eventType: 'DISCOUNT',
    facilityId: '3',
    discountPercent: 30,
    image: 'new_customer_discount.jpg',
    conditions: 'Chỉ áp dụng cho khách hàng mới',
    minBookingValue: 200000
  },
  6: {
    eventType: 'TOURNAMENT',
    targetSportId: 4, // Cầu lông
    facilityId: '4',
    image: 'badminton_tournament.jpg',
    fields: ['Court 1', 'Court 2', 'Court 3', 'Court 4'],
    maxParticipants: 48,
    currentParticipants: 42,
    registrationEndDate: '2024-06-01T23:59:59Z',
    prizes: [
      { position: 1, prize: 'Cup + 4.000.000 VNĐ' },
      { position: 2, prize: '2.000.000 VNĐ' },
      { position: 3, prize: '1.000.000 VNĐ' }
    ]
  }
};
