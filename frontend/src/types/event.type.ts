// Các giá trị có thể có của trạng thái sự kiện
export type EventStatus = 'active' | 'upcoming' | 'expired';

// Các loại sự kiện
export type EventType = 'TOURNAMENT' | 'DISCOUNT';

// Các loại khuyến mãi
export type DiscountType = 'PERCENT' | 'FIXED_AMOUNT' | 'FREE_SLOT';    

// Các đối tượng áp dụng khuyến mãi
export type TargetUserType = 'ALL' | 'NEW' | 'LOYALTY' | 'CASUAL';

// Trạng thái đăng ký giải đấu
export type RegistrationStatus = 'registration' | 'inProgress' | 'completed';

// Loại đăng ký giải đấu
export type RegistrationType = 'individual' | 'team' | 'both';

// Interface cho giải thưởng trong các sự kiện giải đấu
export interface EventPrize {
  position: number;
  prize: string;
}

// Interface cho nhà tổ chức sự kiện
export interface Organizer {
  id: string;
  name: string;
  logo: string;
}

// Interface cho thông tin liên hệ
export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

// Interface cho sự kiện - bao gồm tất cả các thuộc tính có thể có
export interface Event {
  // Thuộc tính cơ bản
  id?: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status?: EventStatus;
  eventType: EventType;
  facilityId: string;
  image?: string[]; // URL của ảnh
  bannerImage?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
  organizer?: Organizer;
  facilityName?: string;
  facilityAddress?: string;
  sportName?: string;

  // Thuộc tính cho giải đấu
  sportIds?: number[];  
  fieldIds?: number[];  
  maxParticipants?: number;  // Số lượng người tham gia tối đa
  minParticipants?: number; // Số lượng người tham gia tối thiểu để bắt đầu sự kiện
  currentParticipants?: number; // Số lượng người tham gia hiện tại
  registrationType?: RegistrationType; // Loại đăng ký
  registrationEndDate?: string;  // Ngày kết thúc đăng ký
  registrationFee?: number; // Phí đăng ký
  ageLimit?: string; // Giới hạn tuổi
  tournamentFormat?: string[] | string; // Thể thức giải đấu
  tournamentFormatDescription?: string; // Mô tả thể thức giải đấu
  totalPrize?: string; // Tổng giải thưởng
  prizeDescription?: string; // Mô tả giải thưởng
  prizes?: EventPrize[]; // Danh sách giải thưởng
  currentStatus?: RegistrationStatus; // Trạng thái đăng ký
  rulesAndRegulations?: string; // Quy tắc và luật lệ giải đấu
  isFreeRegistration?: boolean; // Có miễn phí đăng ký không
  paymentInstructions?: string; // Hướng dẫn thanh toán
  paymentMethod?: string[] | string; // Phương thức thanh toán
  paymentDeadline?: string; // Ngày hạn thanh toán
  paymentAccountInfo?: string; // Thông tin tài khoản thanh toán
  paymentQrImage?: string; // Hình ảnh QR thanh toán
  registrationProcess?: string; // Quy trình đăng ký

  // Thuộc tính cho khuyến mãi
  discountType?: DiscountType; // Loại khuyến mãi
  discountPercent?: number; // Phần trăm giảm giá
  discountAmount?: number; // Số tiền giảm giá
  freeSlots?: number; // Số lượt đặt sân miễn phí
  minBookingValue?: number; // Giá trị đặt sân tối thiểu
  targetUserType?: TargetUserType; // Đối tượng áp dụng khuyến mãi
  maxUsageCount?: number; // Số lần sử dụng khuyến mãi
  descriptionOfDiscount?: string; // Mô tả khuyến mãi
  contact?: ContactInfo; // Thông tin liên hệ 
}

// Type guard để kiểm tra nếu một sự kiện là giải đấu
export function isTournamentEvent(event: Event): event is Event & { eventType: 'TOURNAMENT' } {
  return event.eventType === 'TOURNAMENT';
}

// Type guard để kiểm tra nếu một sự kiện là khuyến mãi
export function isDiscountEvent(event: Event): event is Event & { eventType: 'DISCOUNT' } {
  return event.eventType === 'DISCOUNT';
}

// Interface cho form tạo/chỉnh sửa sự kiện - thiết kế riêng cho form
export interface EventFormData {
  // Thuộc tính cơ bản
  name: string;
  description: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  eventType: EventType;
  facilityId: string;
  
  // Ảnh và file
  imageFiles: File[]; // File ảnh để upload
  
  // Thuộc tính cho giải đấu
  sportIds?: number[];  
  fieldIds?: number[];  
  maxParticipants?: number;
  minParticipants?: number;
  registrationType?: RegistrationType;
  registrationEndDate?: string; 
  registrationFee?: number;
  ageLimit?: string;
  tournamentFormat?: string[] | string;
  tournamentFormatDescription?: string;
  totalPrize?: string;
  prizeDescription?: string;
  prizes?: EventPrize[];
  rulesAndRegulations?: string;
  isFreeRegistration?: boolean;
  paymentInstructions?: string;
  paymentMethod?: string[] | string;
  paymentDeadline?: string;
  paymentAccountInfo?: string;
  paymentQrImage?: string;
  registrationProcess?: string;

  // Thuộc tính cho khuyến mãi
  discountType?: DiscountType;
  discountPercent?: number;
  discountAmount?: number;
  freeSlots?: number;
  minBookingValue?: number;
  targetUserType?: TargetUserType;
  maxUsageCount?: number;
  descriptionOfDiscount?: string;
}


// Interface cho trạng thái sự kiện trong store
export interface EventState {
  events: Event[];
  eventDetails: Record<number, Event>;
  isLoading: boolean;
  error: string | null;
  selectedFacilityId: string | null;
}

// Interface mở rộng cho hiển thị Event trong danh sách
export interface DisplayEvent
  extends Omit<Event, 'discountType' | 'targetUserType'> {
  // Derived từ facilityId → hiển thị
  facilityName: string;
  facilityAddress: string;

  // Lọc / hiển thị môn chính
  sportName?: string;

  // ––––– TOURNAMENT –––––
  currentParticipants?: number;   // live số người/phần trăm
  maxParticipants?: number;
  registrationEndDate?: string;   // ISO date để show deadline
  isFreeRegistration?: boolean;   // show badge "Miễn phí"
  registrationFee?: number;       // nếu không miễn phí
  tournamentFormat?: string[] | string;
  totalPrize?: string;
  prizes?: EventPrize[];

  // ––––– DISCOUNT –––––
  discountType?: DiscountType;      // 'PERCENT' | 'FIXED_AMOUNT' | 'FREE_SLOT'
  discountPercent?: number;         // khi discountType === 'PERCENT'
  discountAmount?: number;          // khi discountType === 'FIXED_AMOUNT'
  freeSlots?: number;               // khi discountType === 'FREE_SLOT'
  minBookingValue?: number;
  targetUserType?: TargetUserType;  // 'ALL' | 'NEW' | 'LOYALTY'
  maxUsageCount?: number;
  descriptionOfDiscount?: string;   // label ngắn gọn hiển thị

  // Nếu cần filter / tag
  sportIds?: number[];
  fieldIds?: number[];
}

// Trạng thái phê duyệt đăng ký
export type RegistrationApprovalStatus = 'pending' | 'approved' | 'rejected';

// Trạng thái thanh toán
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

// Thứ hai: model trả về từ server, đã có id, ngày giờ, trạng thái, metadata duyệt và thanh toán
export interface EventRegistration {
  id: string;
  userId: string; // ID của người đăng ký
  
  // Gốc là những gì user gửi
  eventId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  teamName?: string;
  teamMembers?: Array<{ name: string; email?: string; phone?: string }>;
  notes?: string;

  // Tự động do hệ thống thêm
  registrationDate: string;                  // khi user submit
  status: RegistrationApprovalStatus;        // 'pending' | 'approved' | 'rejected'

  // Nếu sự kiện có thu phí
  paymentStatus?: PaymentStatus;             // 'pending' | 'paid' | 'refunded'
  paymentMethod?: string;                    // bank / momo /…
  paymentProof?: string;                     // URL chứng từ
  paymentDate?: string;

  // Quá trình duyệt của admin
  approvedBy?: string;                       // adminId
  approvedDate?: string;
  rejectionReason?: string;
}

// Dùng làm payload khi user submit form đăng ký (kèm payment nếu có)
export interface EventRegistrationInput {
  // Khóa liên kết tới sự kiện
  eventId: number;

  // Thông tin người đăng ký
  userName: string;
  userEmail: string;
  userPhone: string;

  // Nếu đăng ký theo đội
  teamName?: string;
  teamMembers?: Array<{
    name: string;
    email?: string;
    phone?: string;
  }>;

  notes?: string;   // ghi chú thêm từ user

  // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
  // Phần payment (chỉ yêu cầu khi event.isFreeRegistration === false)
  paymentMethod?: string;    // e.g. 'bank', 'momo', 'vnpay'…
  paymentProofFile?: File;   // cho phép upload hình chụp biên lai/chứng từ
}

