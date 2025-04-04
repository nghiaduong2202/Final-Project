import { Sport } from "./sport.type";

// Type aliases để sử dụng ở nhiều nơi
export type ServiceType = 'rental' | 'coaching' | 'equipment' | 'food' | 'other';

export interface Service {
    id: number;
    name: string;
    price: number;
    description: string;
    amount: number;
    sport: Sport;
    unit?: string;
    type: ServiceType;
    facilityId?: string;
    bookedCount?: number;
    bookedCountOnDate?: number;
}
  
export interface ServiceFormData {
  name: string;
  price: number;
  description: string;
  amount: number;
  sportId: number;
  unit?: string;
  type: ServiceType;
  facilityId?: string;
}

// Interface cho request API tạo dịch vụ
export interface ServiceApiRequest {
  name: string;
  price: number;
  description: string;
  amount: number;
  sportId: number;
  type: ServiceType;
  facilityId?: string;
}

// Interface để định nghĩa kiểu dữ liệu cho giá trị form cập nhật
export interface UpdatedServiceValues {
  name: string;
  description: string;
  price: number;
  amount: number;
  sportId: number;
  type: ServiceType;
  unit?: string;
  facilityId?: string;
}
  
export interface ServiceState {
  services: Service[];
  isLoading: boolean;
  error: string | null;
  selectedFacilityId: string | null;
}

//   export interface BookingService {
//     id: number;
//     bookingId: number;
//     serviceId: number;
//     quantity: number;
//     startTime?: Date;
//     endTime?: Date;
//     status: 'pending' | 'active' | 'completed' | 'cancelled';
//     notes?: string;
//   }