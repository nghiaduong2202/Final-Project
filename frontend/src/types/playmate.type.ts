// Loại tìm kiếm (Cá nhân/Nhóm)
export type PlaymateSearchType = 'INDIVIDUAL' | 'GROUP';

// Mức độ kỹ năng
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL' | 'ANY' | 'any';

// Trạng thái tìm kiếm
export type PlaymateStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | 'pending' | 'accepted' | 'rejected';

// Giới tính ưu tiên
export type GenderPreference = 'MALE' | 'FEMALE' | 'ANY' | 'male' | 'female' | 'any';

// Loại chi phí
export type CostType ='TOTAL' | 'FREE' |'GENDER_BASED' | 'perPerson' | 'total' | 'free' | 'genderBased';

// Trạng thái đơn đăng ký
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'pending' | 'accepted' | 'rejected';

// Thông tin người tạo/đăng ký
export interface UserInfo {
  id?: string;
  name: string;
  avatar?: string;
  avatarUrl?: string;
  gender?: string;
  age?: number;
  phoneNumber?: string;
  email?: string;
}

// Booking slot interface
export interface BookingSlot {
  id: number;
  date: string;
  booking: {
    id: string;
    startTime: string;
    endTime: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    player?: UserInfo;
  };
}

// Interface cho Participant 
export interface Participant {
  playmateId: string;
  playerId: string;
  status: ApplicationStatus;
  skillLevel: SkillLevel;
  note?: string;
}

// Interface API PlaymateSearch response
export interface ApiPlaymateSearch {
  id: string;
  title: string;
  imagesUrl: string[];
  bookingSlot: BookingSlot;
  desciption?: string;
  additionalInfo?: string;
  costType: string;
  totalCost?: number;
  maleCost?: number;
  femaleCost?: number;
  detailOfCost?: string;
  isTeam: boolean;
  minParticipant: number;
  maxParticipant: number;
  genderPreference: string;
  skillLevel: string;
  participants: Participant[];
  createdAt: string;
}

// Interface cho việc hiển thị danh sách tìm kiếm hoặc hiển thị thông tin chi tiết 
// (PlaymateList và PlaymateManage và PlaymateDetail) 
export interface PlaymateSearch {
  id: string;
  userId: string;
  userInfo: UserInfo;
  sportId?: number;
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
  updatedAt?: string;
  applications?: PlaymateApplication[];
  
  // Thông tin booking slot
  bookingSlotId?: number;
  bookingSlot?: BookingSlot;
  
  // Các trường mới từ API
  participants?: Participant[];
}

// Thông tin đơn đăng ký tham gia - cho PlaymateManage và PlaymateDetail
export interface PlaymateApplication {
  // Thông tin cơ bản
  id: number | string;
  playmateId: string;
  playmateSearchId?: number;
  playerId: string;
  userId?: string;
  userInfo?: UserInfo;
    
  // Thông tin bổ sung về người đăng ký
  note?: string;
  message?: string;
  skillLevel?: SkillLevel;
      
  // Thông tin trạng thái
  status: ApplicationStatus;
  createdAt?: string;
  reviewedAt?: string; // Thời gian được duyệt/từ chối
  rejectionReason?: string; // Lý do từ chối
  
  // Thông tin search nếu lấy từ api my-register
  search?: {
    id: string;
    title: string;
    sportId?: number;
    sportName?: string;
    date?: string;
    timeStart?: string;
    timeEnd?: string;
    location?: string;
    creator?: UserInfo;
  };
}

// Interface cho form tạo tìm kiếm người chơi cùng (PlaymateCreate)
export interface PlaymateFormData {
  // Thông tin cơ bản
  title: string;
  description?: string;
  imagesUrl?: string[];
  
  // Booking slot id mới
  bookingSlotId: number;
  
  // Thông tin chi phí
  costType: string;
  totalCost?: number;
  maleCost?: number;
  femaleCost?: number;
  detailOfCost?: string;

  // Thông tin người tham gia
  isTeam: boolean;
  minParticipant: number;
  maxParticipant?: number;
  genderPreference: string;
    
  // Thông tin trình độ kỹ năng
  skillLevel: string;
  
  // Thông tin liên hệ và quy tắc
  additionalInfor?: string;
}

// Interface cho form đăng ký tham gia playmate (Modal popup khi đăng ký)
export interface PlaymateApplicationFormData {
  playmateId: string;
  skillLevel: string;
  note?: string;
} 

// Interface cho action chấp nhận/từ chối đơn đăng ký
export interface PlaymateActionRequest {
  playerId: string;
  playmateId: string;
}

// Các hàm chuyển đổi giữa API response và UI model
export const mapApiToPlaymateSearch = (api: ApiPlaymateSearch): PlaymateSearch => {
  return {
    id: api.id,
    userId: api.bookingSlot.booking.player?.id || '',
    userInfo: {
      id: api.bookingSlot.booking.player?.id,
      name: api.bookingSlot.booking.player?.name || 'Unknown',
      avatar: api.bookingSlot.booking.player?.avatarUrl,
      phoneNumber: api.bookingSlot.booking.player?.phoneNumber,
      email: api.bookingSlot.booking.player?.email
    },
    title: api.title,
    description: api.desciption || undefined,
    image: api.imagesUrl,
    requiredSkillLevel: (api.skillLevel.toUpperCase() as SkillLevel) || 'ANY',
    location: api.additionalInfo || undefined,
    date: api.bookingSlot.date.split('T')[0],
    startTime: api.bookingSlot.booking.startTime,
    endTime: api.bookingSlot.booking.endTime,
    communicationDescription: api.additionalInfo,
    playmateSearchType: api.isTeam ? 'GROUP' : 'INDIVIDUAL',
    requiredParticipants: api.minParticipant,
    maximumParticipants: api.maxParticipant,
    currentParticipants: api.participants.filter(p => p.status === 'accepted').length + 1, // +1 for creator
    genderPreference: (api.genderPreference.toUpperCase() as GenderPreference),
    price: api.costType === 'total' ? api.totalCost : undefined,
    costType: mapCostType(api.costType),
    costMale: api.maleCost,
    costFemale: api.femaleCost,
    costDetails: api.detailOfCost,
    status: 'ACTIVE', // Default to active
    createdAt: api.createdAt,
    bookingSlotId: api.bookingSlot.id,
    bookingSlot: api.bookingSlot,
    participants: api.participants
  };
};

// Map cost type from API to UI
const mapCostType = (apiCostType: string): CostType => {
  switch(apiCostType.toLowerCase()) {    
    case 'total': return 'total';
    case 'free': return 'free';
    case 'genderbased': return 'genderBased';
    default: return apiCostType as CostType;
  }
};



