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
    unit: 'giờ',
    type: 'rental',
    bookedCountOnDate: 10,
    facilityId: '1',
    bookedCount: 120,
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
    unit: 'giờ',
    type: 'rental',
    bookedCountOnDate: 10,
    facilityId: '1',
    bookedCount: 95,
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
    unit: 'chai',
    type: 'food',
    bookedCountOnDate: 10,
    facilityId: '3',
    bookedCount: 210,
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
    unit: 'giờ',
    type: 'rental',
    facilityId: '2',
    bookedCountOnDate: 15,
    bookedCount: 180,
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
    unit: 'giờ',
    type: 'rental',
    facilityId: '2',
    bookedCountOnDate: 30,
    bookedCount: 250,
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
    unit: 'buổi',
    type: 'coaching',
    facilityId: '2',
    bookedCountOnDate: 2,
    bookedCount: 45,
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
    unit: 'buổi',
    type: 'other',
    facilityId: '1',
    bookedCountOnDate: 3,
    bookedCount: 78,
  }
];
