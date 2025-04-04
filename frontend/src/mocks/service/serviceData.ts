import { Service } from '@/types/service.type';

// Mock data for services
export const mockServices: Service[] = [
  {
    id: 1,
    name: 'Thuê áo đấu',
    price: 50000,
    description: 'Áo đấu chất lượng cao, nhiều size và màu sắc',
    amount: 50,
    sport: {
      id: 1,
      name: 'Bóng đá'
    },
    status: 'available',
    unit: 'giờ',
    serviceType: 'rental',
    facilityId: '1',
    inUseCount: 10,
    bookedCount: 120,
    lastUpdated: new Date('2023-10-15'),
    popularityScore: 85
  },
  {
    id: 2,
    name: 'Thuê giày',
    price: 70000,
    description: 'Giày đá bóng chuyên dụng, nhiều size',
    amount: 30,
    sport: {
      id: 1,
      name: 'Bóng đá'
    },
    status: 'available',
    unit: 'giờ',
    serviceType: 'rental',
    facilityId: '1',
    inUseCount: 8,
    bookedCount: 95,
    lastUpdated: new Date('2023-10-12'),
    popularityScore: 75
  },
  {
    id: 3,
    name: 'Nước uống thể thao',
    price: 15000,
    description: 'Nước uống bổ sung ion và khoáng chất',
    amount: 100,
    sport: {
      id: 2,
      name: 'Bóng rổ'
    },
    status: 'available',
    unit: 'chai',
    serviceType: 'food',
    facilityId: '3',
    inUseCount: 0,
    bookedCount: 210,
    lastUpdated: new Date('2023-10-20'),
    popularityScore: 90
  },
  {
    id: 4,
    name: 'Thuê vợt tennis',
    price: 80000,
    description: 'Vợt tennis chuyên nghiệp',
    amount: 20,
    sport: {
      id: 3,
      name: 'Tennis'
    },
    status: 'low_stock',
    unit: 'giờ',
    serviceType: 'rental',
    facilityId: '2',
    inUseCount: 15,
    bookedCount: 180,
    lastUpdated: new Date('2023-10-18'),
    popularityScore: 92
  },
  {
    id: 5,
    name: 'Thuê bóng tennis',
    price: 25000,
    description: 'Bóng tennis chất lượng cao',
    amount: 120,
    sport: {
      id: 3,
      name: 'Tennis'
    },
    status: 'available',
    unit: 'giờ',
    serviceType: 'rental',
    facilityId: '2',
    inUseCount: 30,
    bookedCount: 250,
    lastUpdated: new Date('2023-10-19'),
    popularityScore: 88
  },
  {
    id: 6,
    name: 'Dịch vụ phân tích kỹ thuật',
    price: 200000,
    description: 'Phân tích kỹ thuật chơi của bạn thông qua video',
    amount: 10,
    sport: {
      id: 3,
      name: 'Tennis'
    },
    status: 'available',
    unit: 'buổi',
    serviceType: 'coaching',
    facilityId: '2',
    inUseCount: 2,
    bookedCount: 45,
    lastUpdated: new Date('2023-10-05'),
    popularityScore: 70
  },
  {
    id: 7,
    name: 'Dịch vụ massage',
    price: 150000,
    description: 'Massage thư giãn sau khi chơi thể thao',
    amount: 5,
    sport: {
      id: 4,
      name: 'Bóng đá'
    },
    status: 'low_stock',
    unit: 'buổi',
    serviceType: 'other',
    facilityId: '1',
    inUseCount: 3,
    bookedCount: 78,
    lastUpdated: new Date('2023-10-10'),
    popularityScore: 65
  }
];
