// Cấu trúc cơ bản của một cơ sở
export interface BookingSlot {
  id: number;
  date: string;
}

export interface AdditionalService {
  id: string;
  name: string;
  price: number;
  amount: number;
}

export interface Player {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
  gender: string | null;
  dob: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface review {
    id: string;
    rating: number;
    comment: string;
    imageUrl: File[];
    feedback: string;
    reviewAt: string;
    feedbackAt: string;
    facilityId?: string;
    booking?: {
      id: string;
      startTime: string;
      endTime: string;      
      createdAt: string;
      updatedAt: string;
      status?: string;
      player?: Player;
      bookingSlots?: BookingSlot[];
      additionalServices?: AdditionalService[];
    };    
  }

export interface ReviewData {    
    rating: number;
    comment: string;
    bookingId: string;    
}
  
// Type cho form data khi tạo mới cơ sở - cấu trúc 4 bước
export interface ReviewFormData {
    data: ReviewData;
    imageUrl: File[];
  }
