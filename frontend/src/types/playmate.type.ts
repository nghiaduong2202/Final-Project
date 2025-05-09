// Loại tìm kiếm (Cá nhân/Nhóm)
export type PlaymateSearchType = 'individual' | 'group';

// Mức độ kỹ năng
export type SkillLevel = 'newbie' | 'intermediate' | 'advance' | 'professional' | 'any';

// Giới tính ưu tiên
export type GenderPreference = 'male' | 'female' | 'any';

// Loại chi phí
export type CostType = 'total' | 'free' | 'gender';

// Trạng thái đơn đăng ký
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

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
  field?: {
    id: number;
    name: string;
    status: string;
    fieldGroup?: {
      id: string;
      name: string;
      dimension: string;
      surface: string;
      facility?: {
        id: string;
        name: string;
        description: string;
        location: string;
        status: string;
        imagesUrl: string[];
      }
    }
  };
  booking: {
    id: string;
    startTime: string;
    endTime: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    player?: UserInfo;
    sport?: {
      id: number;
      name: string;
    };
  };
}

// Interface cho Participant 
export interface Participant {
  playmateId: string;
  playerId: string;
  status: ApplicationStatus;
  skillLevel: SkillLevel;
  note?: string;
  player?: {
    id: string;
    name: string;
    email: string;
    password: string;
    phoneNumber?: string;
    avatarUrl?: string | null;
    gender?: string | null;
    dob?: string | null;
    bankAccount?: string | null;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
  };
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
  status: boolean;
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

// Interface for updating playmate search
export interface UpdatePlaymateFormData {
  playmateId: string; 
  title?: string;
  description?: string;
  imagesUrl?: string[];
  bookingSlotId?: number;
  costType?: string;
  totalCost?: number;
  maleCost?: number;
  femaleCost?: number;
  detailOfCost?: string;
  isTeam?: boolean;
  minParticipant?: number;
  maxParticipant?: number;
  genderPreference?: string;
  skillLevel?: string;
  additionalInfor?: string;
}

// Interface cho action chấp nhận/từ chối đơn đăng ký
export interface PlaymateActionRequest {
  playerId: string;
  playmateId: string;
}

// Các hàm chuyển đổi giữa API response và UI model
export const mapApiToPlaymateSearch = (api: ApiPlaymateSearch): PlaymateSearch => {
  try {
       
    if (!api) {
      console.error('Empty API response in mapApiToPlaymateSearch');
      throw new Error('Invalid API response format');
    }
    
    // Xử lý trường skillLevel an toàn
    let skillLevel: SkillLevel = 'any';
    if (api.skillLevel) {
      const lowerSkill = api.skillLevel.toLowerCase();
      if (['newbie', 'intermediate', 'advance', 'professional', 'any'].includes(lowerSkill)) {
        skillLevel = lowerSkill as SkillLevel;
      }
    }
    
    // Xử lý trường genderPreference an toàn
    let genderPref: GenderPreference = 'any';
    if (api.genderPreference) {
      const lowerGender = api.genderPreference.toLowerCase();
      if (['male', 'female', 'any'].includes(lowerGender)) {
        genderPref = lowerGender as GenderPreference;
      }
    }
    
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
      requiredSkillLevel: skillLevel,
      location: api.additionalInfo || undefined,
      date: api.bookingSlot.date.split('T')[0],
      startTime: api.bookingSlot.booking.startTime,
      endTime: api.bookingSlot.booking.endTime,
      communicationDescription: api.additionalInfo,
      playmateSearchType: api.isTeam ? 'group' : 'individual',
      requiredParticipants: api.minParticipant,
      maximumParticipants: api.maxParticipant,
      currentParticipants: api.participants.filter(p => p.status === 'accepted' || p.status === 'pending').length,
      genderPreference: genderPref,
      price: api.costType === 'total' ? api.totalCost : undefined,
      costType: mapCostType(api.costType),
      costMale: api.maleCost,
      costFemale: api.femaleCost,
      costDetails: api.detailOfCost,
      status: true, // Default to active
      createdAt: api.createdAt,
      bookingSlotId: api.bookingSlot.id,
      bookingSlot: api.bookingSlot,
      participants: api.participants
    };
  } catch (error) {
    console.error('Error mapping API response:', error);
    console.error('API data:', api);
    
    // Trả về dữ liệu tối thiểu để tránh lỗi ứng dụng
    return {
      id: api?.id || 'unknown-id',
      userId: '',
      userInfo: { name: 'Unknown' },
      title: api?.title || 'Không có tiêu đề',
      requiredSkillLevel: 'any',
      date: new Date().toISOString().split('T')[0],
      startTime: '00:00:00',
      endTime: '00:00:00',
      playmateSearchType: 'individual',
      requiredParticipants: 1,
      status: true,
      createdAt: new Date().toISOString()
    };
  }
};

// Map cost type from API to UI
const mapCostType = (apiCostType: string): CostType => {
  switch(apiCostType.toLowerCase()) {    
    case 'total': return 'total';
    case 'free': return 'free';
    case 'gender': return 'gender';
    default: return apiCostType as CostType;
  }
};



