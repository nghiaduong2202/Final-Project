// Loại tìm kiếm (Cá nhân/Nhóm)
export type PlaymateSearchType = 'INDIVIDUAL' | 'GROUP';

// Mức độ kỹ năng
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL' | 'ANY';

// Trạng thái tìm kiếm
export type PlaymateStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' ;

// Giới tính ưu tiên
export type GenderPreference = 'MALE' | 'FEMALE' | 'ANY';

// Loại chi phí
export type CostType = 'PER_PERSON' | 'TOTAL' | 'FREE' |'GENDER_BASED';

// Trạng thái đơn đăng ký
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

// Thông tin người tạo/đăng ký
export interface UserInfo {
  name: string;
  avatar?: string;
  gender?: string;
  age?: number;
  phoneNumber?: string;
  email?: string;
}

// Interface cho việc hiển thị danh sách tìm kiếm hoặc hiển thị thông tin chi tiết 
// (PlaymateList và PlaymateManage và PlaymateDetail) 
export interface PlaymateSearch {
  id: number;
  userId: string;
  userInfo: UserInfo;
  sportId: number;
  sportName?: string;
  title: string;
  description?: string;
  image?: string[]; // URL của ảnh
  
  // Thông tin về môn thể thao và kỹ năng
  requiredSkillLevel: SkillLevel; // Trình độ yêu cầu cho người tham gia
  
  // Thông tin địa điểm
  facilityId?: string;
  facilityName?: string;
  location?: string;
  
  // Thông tin thời gian
  date: string;
  startTime: string;
  endTime: string;
  applicationDeadline?: string; // Hạn cuối đăng ký

  communicationDescription?: string; // thông tin liên hệ nếu muốn đính kèm
  playmateSearchType: PlaymateSearchType;
  
  // Thông tin người tham gia
  requiredParticipants: number; // Số người cần thiết
  maximumParticipants?: number; // Số người tối đa
  currentParticipants?: number; // Số người đã đăng ký
  genderPreference?: GenderPreference;
  
  // Thông tin chi phí
  price?: number; // Chi phí chia sẻ nếu có
  costType?: CostType; // Loại chi phí
  costMale?: number;
  costFemale?: number;
  costDetails?: string;

  // Thông tin trạng thái
  status: PlaymateStatus;
  createdAt: string;
  updatedAt: string;
  applications?: PlaymateApplication[];
}

// Thông tin đơn đăng ký tham gia - cho PlaymateManage và PlaymateDetail
export interface PlaymateApplication {
  // Thông tin cơ bản
  id: number;
  playmateSearchId: number; // ID của bài đăng playmate
  userId: string;
  userInfo: UserInfo;
    
  // Thông tin bổ sung về người đăng ký
  message?: string; // Lời nhắn khi đăng ký
  skillLevel?: SkillLevel; // Trình độ kỹ năng  
      
  // Thông tin trạng thái
  status: ApplicationStatus;
  createdAt: string;
  reviewedAt?: string; // Thời gian được duyệt/từ chối
  rejectionReason?: string; // Lý do từ chối
}

// Interface cho form tạo tìm kiếm người chơi cùng (PlaymateCreate)
export interface PlaymateFormData {
  // Thông tin cơ bản
  title: string;
  description?: string;
  image?: File[];
  
  // Thông tin địa điểm và thời gian
  facilityId: string;
  sportId: number;
  date: string;
  startTime: string;
  endTime: string;  
  location?: string;
  applicationDeadline?: string;
  
  // Thông tin chi phí
  price?: number;
  costMale?: number;
  costFemale?: number;
  costType: CostType;
  costDetails?: string;

  // Thông tin người tham gia
  searchType: PlaymateSearchType;
  requiredParticipants: number;
  maximumParticipants?: number;
  genderPreference: GenderPreference;
    
  // Thông tin trình độ kỹ năng
  requiredSkillLevel: SkillLevel[];
  
  // Thông tin liên hệ và quy tắc
  communicationDescription?: string;
  
}

// Interface cho form đăng ký tham gia playmate (Modal popup khi đăng ký)
export interface PlaymateApplicationFormData {
  playmateSearchId: number;
  userId: string;
  skillLevel?: SkillLevel;
  message?: string;
  experienceDetails?: string;  
} 



