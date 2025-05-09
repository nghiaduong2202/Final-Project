import { Facility } from '@/types/facility.type';
import { mockFieldGroups } from '@/mocks/field/Groupfield_Field';
import { mockServices } from '@/mocks/service/serviceData';
import { mockEvents } from '@/mocks/event/eventData';
import { mockVouchers } from '@/mocks/voucher/voucherData';

// Mock data cho facility dropdown (cho các select box)
export const mockFacilitiesDropdown = [
  { id: '1', name: 'Sân Bóng Đá Mini Thủ Đô' },
  { id: '2', name: 'CLB Tennis Sài Gòn' },
  { id: '3', name: 'Trung tâm thể thao đa năng Olympic' },
  { id: '4', name: 'Sân Golf Phương Đông' },
  { id: '5', name: 'Sân Futsal Ngôi Sao' },
  { id: '6', name: 'Trung tâm Bơi lội Aqua' },
];
  
// Mock facilities data
export const mockFacilities: Facility[] = [ 
  {
    id: '1',
    name: 'Sân Bóng Đá Mini Thủ Đô',
    description: 'Sân bóng đá mini chất lượng cao với mặt cỏ nhân tạo thế hệ mới, hệ thống chiếu sáng hiện đại và dịch vụ đặt sân trực tuyến dễ dàng.',
    location: '123 Trần Duy Hưng, Cầu Giấy, Hà Nội',
    openTime1: '06:00',
    closeTime1: '08:00',
    openTime2: '09:00',
    closeTime2: '11:00',
    openTime3: '13:00',
    closeTime3: '15:00',
    numberOfShifts: 3,
    sports: [
      { id: 1, name: 'football' },
      { id: 3, name: 'futsal' }
    ],
    status: 'active',
    avgRating: 4.7,
    numberOfRating: 128,
    imagesUrl: [
      'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018',
      'https://images.unsplash.com/photo-1522778526097-ce0a22ceb253'
    ],
    createdAt: '2023-05-15T08:30:00Z',
    updatedAt: '2023-11-20T15:45:00Z',
    certificate: {
      verified: 'https://example.com/certificates/verified-1.pdf',
      temporary: '',
      facilityId: '1'
    },
    licenses: [{
      verified: 'https://example.com/licenses/verified-1.pdf',
      temporary: '',
      facilityId: '1',
      sportId: 1
    }],
    minPrice: 100000,
    maxPrice: 150000,
    fieldGroups: mockFieldGroups.filter(fg => fg.facilityId === '1')
  },
  {
    id: '2',
    name: 'CLB Tennis Sài Gòn',
    description: 'Trung tâm tennis hiện đại với 8 sân tennis tiêu chuẩn quốc tế, dịch vụ đào tạo chuyên nghiệp, câu lạc bộ tennis năng động.',
    location: '456 Điện Biên Phủ, Quận 3, TP. Hồ Chí Minh',
    openTime1: '05:30',
    closeTime1: '11:30',
    openTime2: '14:00',
    closeTime2: '21:30',
    openTime3: '',
    closeTime3: '',
    numberOfShifts: 2,
    sports: [
      { id: 2, name: 'tennis' }
    ],
    status: 'active',
    avgRating: 4.5,
    numberOfRating: 87,
    imagesUrl: [
      'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0',
      'https://images.unsplash.com/photo-1620742820912-8caba7e2c2a7'
    ],
    createdAt: '2023-06-10T10:15:00Z',
    updatedAt: '2023-12-05T09:30:00Z',
    certificate: {
      verified: 'https://example.com/certificates/verified-2.pdf',
      temporary: '',
      facilityId: '2'
    },
    licenses: [{
      verified: 'https://example.com/licenses/verified-2.pdf',
      temporary: '',
      facilityId: '2',
      sportId: 2
    }],
    minPrice: 120000,
    maxPrice: 180000,
    fieldGroups: mockFieldGroups.filter(fg => fg.facilityId === '2')
  },
  {
    id: '3',
    name: 'Trung tâm thể thao đa năng Olympic',
    description: 'Tổ hợp thể thao đa năng với đầy đủ các môn: bóng rổ, cầu lông, bơi lội. Phòng tập hiện đại, huấn luyện viên chuyên nghiệp.',
    location: '789 Bạch Đằng, Hải Châu, Đà Nẵng',
    openTime1: '07:00',
    closeTime1: '22:30',
    openTime2: '',
    closeTime2: '',
    openTime3: '',
    closeTime3: '',
    numberOfShifts: 1,
    sports: [
      { id: 4, name: 'basketball' },
      { id: 5, name: 'badminton' },
      { id: 6, name: 'swimming' }
    ],
    status: 'pending',
    avgRating: 0,
    numberOfRating: 0,
    imagesUrl: [
      'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa',
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd'
    ],
    createdAt: '2023-12-01T14:20:00Z',
    updatedAt: '2023-12-10T11:35:00Z',
    certificate: {
      verified: '',
      temporary: 'https://example.com/certificates/temp-3.pdf',
      facilityId: '3'
    },
    licenses: [{
      verified: '',
      temporary: 'https://example.com/licenses/temp-3.pdf',
      facilityId: '3',
      sportId: 4
    }],
    minPrice: 90000,
    maxPrice: 130000,
    fieldGroups: []
  },
  {
    id: '4',
    name: 'Sân Golf Phương Đông',
    description: 'Sân golf 18 lỗ tiêu chuẩn quốc tế với cảnh quan thiên nhiên tuyệt đẹp, câu lạc bộ sang trọng và dịch vụ cao cấp.',
    location: '246 Lạc Long Quân, Tây Hồ, Hà Nội',
    openTime1: '06:00',
    closeTime1: '18:00',
    openTime2: '',
    closeTime2: '',
    openTime3: '',
    closeTime3: '',
    numberOfShifts: 1,
    sports: [
      { id: 7, name: 'golf' }
    ],
    status: 'unactive',
    avgRating: 4.9,
    numberOfRating: 42,
    imagesUrl: [
      'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa',
      'https://images.unsplash.com/photo-1592919505780-303950717480',
      'https://images.unsplash.com/photo-1580128637456-8ab61a7097e2'
    ],
    createdAt: '2023-07-20T09:45:00Z',
    updatedAt: '2023-12-15T16:20:00Z',
    certificate: {
      verified: 'https://example.com/certificates/verified-4.pdf',
      temporary: '',
      facilityId: '4'
    },
    licenses: [{
      verified: 'https://example.com/licenses/verified-4.pdf',
      temporary: '',
      facilityId: '4',
      sportId: 7
    }],
    minPrice: 350000,
    maxPrice: 500000,
    fieldGroups: []
  },
  {
    id: '5',
    name: 'Sân Futsal Ngôi Sao',
    description: 'Sân futsal trong nhà với mặt sân cao su tổng hợp, điều hòa không khí, hệ thống âm thanh và bảng điểm điện tử hiện đại.',
    location: '135 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    openTime1: '08:00',
    closeTime1: '23:00',
    openTime2: '',
    closeTime2: '',
    openTime3: '',
    closeTime3: '',
    numberOfShifts: 1,
    sports: [
      { id: 3, name: 'futsal' }
    ],
    status: 'unactive',
    avgRating: 4.2,
    numberOfRating: 65,
    imagesUrl: [
      'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa',
      'https://images.unsplash.com/photo-1542652694-40abf526446e',
      'https://images.unsplash.com/photo-1552667466-07770ae110d0'
    ],
    createdAt: '2023-08-05T13:10:00Z',
    updatedAt: '2023-11-25T18:40:00Z',
    certificate: {
      verified: '',
      temporary: 'https://example.com/certificates/temp-5.pdf',
      facilityId: '5'
    },
    licenses: [{
      verified: '',
      temporary: 'https://example.com/licenses/temp-5.pdf',
      facilityId: '5',
      sportId: 3
    }],
    minPrice: 110000,
    maxPrice: 160000,
    fieldGroups: []
  },
  {
    id: '6',
    name: 'Trung tâm Bơi lội Aqua',
    description: 'Trung tâm bơi lội hiện đại với hồ bơi tiêu chuẩn Olympic, hồ bơi trẻ em, và các khóa học bơi cho mọi lứa tuổi.',
    location: '357 Trần Phú, Nha Trang, Khánh Hòa',
    openTime1: '06:30',
    closeTime1: '21:00',
    openTime2: '',
    closeTime2: '',
    openTime3: '',
    closeTime3: '',
    numberOfShifts: 1,
    sports: [
      { id: 6, name: 'swimming' }
    ],
    status: 'active',
    avgRating: 4.6,
    numberOfRating: 93,
    imagesUrl: [
      'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534',
      'https://images.unsplash.com/photo-1519315901367-f34ff9154487',
      'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd'
    ],
    createdAt: '2023-09-15T11:25:00Z',
    updatedAt: '2023-12-20T14:15:00Z',
    certificate: {
      verified: 'https://example.com/certificates/verified-6.pdf',
      temporary: '',
      facilityId: '6'
    },
    licenses: [{
      verified: 'https://example.com/licenses/verified-6.pdf',
      temporary: '',
      facilityId: '6',
      sportId: 6
    }],
    minPrice: 80000,
    maxPrice: 120000,
    fieldGroups: []
  }
];

// Mock data for facility verification history
export const mockVerificationHistory: {facilityId: string; history: VerificationHistoryItem[]}[] = [
  {
    facilityId: '1',
    history: [
      {
        id: '101',
        field: 'name',
        oldValue: 'Sân Bóng Đá Mini Hà Nội',
        newValue: 'Sân Bóng Đá Mini Thủ Đô',
        requestDate: '2023-10-10T09:15:00Z',
        status: 'approved',
        updatedDate: '2023-10-12T11:30:00Z',
        note: 'Thay đổi tên cơ sở đã được chấp thuận',
        facilityId: '1'
      },
      {
        id: '102',
        field: 'location',
        oldValue: '115 Trần Duy Hưng, Cầu Giấy, Hà Nội',
        newValue: '123 Trần Duy Hưng, Cầu Giấy, Hà Nội',
        requestDate: '2023-09-05T14:20:00Z',
        status: 'approved',
        updatedDate: '2023-09-07T10:45:00Z',
        note: 'Cập nhật địa chỉ chính xác',
        facilityId: '1'
      }
    ]
  },
  {
    facilityId: '3',
    history: [
      {
        id: '301',
        field: 'certificate',
        oldValue: '',
        newValue: 'certificate-upload.pdf',
        requestDate: '2023-12-01T15:30:00Z',
        status: 'pending',
        updatedDate: '',
        note: 'Đang chờ xác thực giấy chứng nhận',
        facilityId: '3'
      }
    ]
  },
  {
    facilityId: '5',
    history: [
      {
        id: '501',
        field: 'license',
        oldValue: '',
        newValue: 'license-upload.pdf',
        requestDate: '2023-11-20T08:45:00Z',
        status: 'rejected',
        updatedDate: '2023-11-22T16:10:00Z',
        note: 'Giấy phép không hợp lệ, vui lòng cung cấp bản có công chứng',
        facilityId: '5'
      }
    ]
  }
];

// Helper functions to connect with existing mock data from other modules
// These functions use ID patterns to simulate relationships between modules

// Helper function to get facility field groups
export const getFacilityFieldGroups = (facilityId: string) => {
  return mockFieldGroups.filter(fieldGroup => fieldGroup.facilityId === facilityId);
};

// Helper function to get facility services
export const getFacilityServices = (facilityId: string) => {
  return mockServices.filter(service => service.facilityId === facilityId);
};

// Helper function to get facility vouchers
export const getFacilityVouchers = (facilityId: string) => {
  return mockVouchers.filter(voucher => voucher.facilityId === facilityId);
};

// Helper function to get facility events
export const getFacilityEvents = (facilityId: string) => {
  return mockEvents.filter(event => event.facilityId === facilityId);
};


// Get verification history items by facilityId
export const getFacilityVerificationHistory = (facilityId: string): VerificationHistoryItem[] => {
  return mockVerificationHistory.find(item => item.facilityId === facilityId)?.history || [];
};

