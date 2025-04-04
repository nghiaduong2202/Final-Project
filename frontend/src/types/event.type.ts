// Các giá trị có thể có của trạng thái sự kiện
export type EventStatus = 'active' | 'upcoming' | 'expired';

// Các loại sự kiện
export type EventType = 'TOURNAMENT' | 'DISCOUNT' | 'SPECIAL_OFFER';

// Interface chính cho sự kiện
export interface Event {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  facilityId?: string;
  eventType?: EventType;
  image?: string;
}

// Interface cho giải thưởng trong các sự kiện giải đấu
export interface EventPrize {
  position: number;
  prize: string;
}

// Interface cho chi tiết sự kiện dựa trên loại
export interface EventDetail {
  eventType: EventType;
  facilityId: string;
  image: string;
  targetSportId?: number;
  fields?: string[];
  maxParticipants?: number;
  currentParticipants?: number;
  registrationEndDate?: string;
  prizes?: EventPrize[];
  discountPercent?: number;
  conditions?: string;
  minBookingValue?: number;
  activities?: string[];
  specialServices?: string[];
}

// Interface cho form tạo/chỉnh sửa sự kiện
export interface EventFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  facilityId?: string;
  eventType?: EventType;
  // Các trường tùy theo loại sự kiện
  targetSportId?: number;
  fields?: string[];
  maxParticipants?: number;
  registrationEndDate?: string;
  prizes?: EventPrize[];
  discountPercent?: number;
  conditions?: string;
  minBookingValue?: number;
  activities?: string[];
  specialServices?: string[];
  image?: string;
}

// Interface cho bộ lọc sự kiện
export interface EventFilter {
  facilityId?: string;
  status?: EventStatus;
  eventType?: EventType;
}

// Interface cho trạng thái sự kiện trong store
export interface EventState {
  events: Event[];
  eventDetails: Record<number, EventDetail>;
  isLoading: boolean;
  error: string | null;
  selectedFacilityId: string | null;
}

// Interface cho response từ API lấy danh sách sự kiện
export interface EventsResponse {
  success: boolean;
  data: {
    events: Event[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    }
  }
}

// Interface cho response từ API lấy chi tiết sự kiện
export interface EventDetailResponse {
  success: boolean;
  data: Event & EventDetail;
}