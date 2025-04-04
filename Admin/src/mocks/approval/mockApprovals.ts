import { Approval } from '@/types/approval.types';
import { mockFacilities } from '@/mocks/facility/mockFacilities';
import { mockVerificationHistory } from '@/mocks/facility/mockFacilities';

// Mock data for approvals
export const mockApprovals: Approval[] = [
  {
    id: '1',
    type: 'facility_registration',
    status: 'pending',
    requestedBy: {
      id: '101',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com'
    },
    createdAt: '2024-03-15T08:30:00Z',
    facilityId: '1',
    facilityName: 'Sân Bóng Đá Mini Thủ Đô',
    details: {
      description: 'Yêu cầu đăng ký cơ sở mới với đầy đủ giấy tờ',
      documents: [
        {
          type: 'business_registration',
          name: 'Giấy chứng nhận đăng ký doanh nghiệp',
          url: 'https://example.com/certificates/verified-1.pdf'
        },
        {
          type: 'business_license',
          name: 'Giấy phép kinh doanh môn thể thao',
          url: 'https://example.com/licenses/verified-1.pdf',
          sportType: 'Bóng đá'
        }
      ],
      facilityInfo: {
        name: 'Sân Bóng Đá Mini Thủ Đô',
        address: '123 Trần Duy Hưng, Cầu Giấy, Hà Nội',
        description: 'Sân bóng đá mini chất lượng cao với mặt cỏ nhân tạo thế hệ mới, hệ thống chiếu sáng hiện đại và dịch vụ đặt sân trực tuyến dễ dàng.',
        images: [
          'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa',
          'https://images.unsplash.com/photo-1574629810360-7efbbe195018',
          'https://images.unsplash.com/photo-1522778526097-ce0a22ceb253'
        ]
      }
    }
  },
  {
    id: '2',
    type: 'facility_name_change',
    status: 'pending',
    requestedBy: {
      id: '102',
      name: 'Trần Thị B',
      email: 'tranthib@example.com'
    },
    createdAt: '2024-03-14T09:15:00Z',
    facilityId: '2',
    facilityName: 'CLB Tennis Sài Gòn',
    details: {
      description: 'Yêu cầu thay đổi tên cơ sở',
      documents: [
        {
          type: 'business_registration',
          name: 'Giấy chứng nhận đăng ký doanh nghiệp mới',
          url: 'https://example.com/certificates/new-name.pdf'
        }
      ],
      facilityInfo: {
        name: 'CLB Tennis Sài Gòn',
        address: '456 Lê Lợi, Quận 1, TP.HCM',
        description: 'Trung tâm tennis chuyên nghiệp với nhiều sân đạt tiêu chuẩn quốc tế',
        images: [
          'https://example.com/images/tennis-club-1.jpg',
          'https://example.com/images/tennis-club-2.jpg'
        ]
      }
    }
  },
  {
    id: '3',
    type: 'business_license',
    status: 'pending',
    requestedBy: {
      id: '103',
      name: 'Lê Văn C',
      email: 'levanc@example.com'
    },
    createdAt: '2024-03-13T14:45:00Z',
    facilityId: '3',
    facilityName: 'Trung tâm thể thao đa năng Olympic',
    details: {
      description: 'Yêu cầu thêm giấy phép kinh doanh môn thể thao mới',
      documents: [
        {
          type: 'business_license',
          name: 'Giấy phép kinh doanh môn thể thao',
          url: 'https://example.com/licenses/swimming-license.pdf',
          sportType: 'Bơi lội'
        }
      ],
      facilityInfo: {
        name: 'Trung tâm thể thao đa năng Olympic',
        address: '789 Nguyễn Văn Linh, Quận 7, TP.HCM',
        description: 'Trung tâm thể thao đa năng với nhiều môn thể thao khác nhau',
        images: [
          'https://example.com/images/olympic-center-1.jpg',
          'https://example.com/images/olympic-center-2.jpg'
        ]
      }
    }
  },
  {
    id: '4',
    type: 'facility_registration',
    status: 'approved',
    requestedBy: {
      id: '104',
      name: 'Hoàng Văn D',
      email: 'hoangvand@example.com'
    },
    createdAt: '2024-03-12T16:20:00Z',
    facilityId: '4',
    facilityName: 'Sân Golf Phương Đông',
    details: {
      description: 'Yêu cầu đăng ký cơ sở mới với đầy đủ giấy tờ',
      documents: [
        {
          type: 'business_registration',
          name: 'Giấy chứng nhận đăng ký doanh nghiệp',
          url: 'https://example.com/certificates/golf-club.pdf'
        },
        {
          type: 'business_license',
          name: 'Giấy phép kinh doanh môn thể thao',
          url: 'https://example.com/licenses/golf-license.pdf',
          sportType: 'Golf'
        }
      ],
      facilityInfo: {
        name: 'Sân Golf Phương Đông',
        address: '321 Đường Lê Văn Lương, Quận 7, TP.HCM',
        description: 'Sân golf 18 lỗ đạt tiêu chuẩn quốc tế',
        images: [
          'https://example.com/images/golf-club-1.jpg',
          'https://example.com/images/golf-club-2.jpg'
        ]
      }
    }
  },
  {
    id: '5',
    type: 'business_license',
    status: 'rejected',
    requestedBy: {
      id: '105',
      name: 'Phạm Thị E',
      email: 'phamthie@example.com'
    },
    createdAt: '2024-03-11T11:10:00Z',
    facilityId: '5',
    facilityName: 'Sân Futsal Ngôi Sao',
    details: {
      description: 'Yêu cầu thêm giấy phép kinh doanh môn thể thao mới',
      documents: [
        {
          type: 'business_license',
          name: 'Giấy phép kinh doanh môn thể thao',
          url: 'https://example.com/licenses/futsal-license.pdf',
          sportType: 'Futsal'
        }
      ],
      facilityInfo: {
        name: 'Sân Futsal Ngôi Sao',
        address: '654 Đường 3/2, Quận 10, TP.HCM',
        description: 'Sân futsal chuyên nghiệp với nhiều sân đạt tiêu chuẩn',
        images: [
          'https://example.com/images/futsal-1.jpg',
          'https://example.com/images/futsal-2.jpg'
        ]
      }
    },
    rejectionReason: 'Giấy phép không hợp lệ, vui lòng cung cấp bản có công chứng'
  }
];

// Helper function to get approvals by status
export const getApprovalsByStatus = (status: Approval['status']) => {
  return mockApprovals.filter(approval => approval.status === status);
};

// Helper function to get approvals by type
export const getApprovalsByType = (type: Approval['type']) => {
  return mockApprovals.filter(approval => approval.type === type);
};

// Helper function to get approvals by facility ID
export const getApprovalsByFacilityId = (facilityId: string) => {
  return mockApprovals.filter(approval => approval.facilityId === facilityId);
}; 