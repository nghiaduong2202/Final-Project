import { FieldGroupFormData } from "./field.type";
import { Sport } from "./sport.type";
import { Service } from "./service.type";
import { Event } from "./event.type";
import { Voucher } from "./voucher.type";
import { FieldGroup } from "./field.type";


// Cấu trúc cơ bản của một cơ sở
export interface Facility {
    id: string;
    name: string;
    description: string;
    location: string;
    openTime1: string;
    closeTime1: string;
    openTime2: string;
    closeTime2: string;
    openTime3: string;
    closeTime3: string;
    numberOfShifts: number;
    sports: Sport[];
    status: 'pending' | 'active' | 'unactive' | 'closed' | 'banned';
    avgRating: number;
    numberOfRatings: number;
    imagesUrl: string[];
    createdAt: string;
    updatedAt: string;
    certificate: Certificate;
    licenses: Licenses[];
    // Các trường có thể có thêm từ API chi tiết
    fieldGroups?: FieldGroup[];
    services?: Service[];
    events?: Event[];
    vouchers?: Voucher[];
    verificationHistory?: VerificationHistoryItem[];
    owner?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
    };
    minPrice: number;
    maxPrice: number;
  }

  // Type cho thông tin cơ bản khi tạo mới cơ sở
export interface FacilityInfo {
    name: string;
    description: string;
    openTime1: string;
    closeTime1: string;
    openTime2?: string;
    closeTime2?: string;
    openTime3?: string;
    closeTime3?: string;
    numberOfShifts: number;
    city: string;
    provinceCode: string;
    district: string;
    districtCode: string;
    ward: string;
    wardCode: string;
    location: string;
    detailAddress?: string;
  }
  
// Type cho form data khi tạo mới cơ sở - cấu trúc 4 bước
export interface FacilityFormData {
    // Step 1: Basic facility info
    facilityInfo: FacilityInfo;
    
    // Step 2: Facility images
    imageFiles: File[];
    
    // Step 3: Field groups
    fieldGroups: FieldGroupFormData[];
    selectedSports: Sport[];
    
    // Step 4: Verification documents
    certificateFile: File | null;
    licenseFiles: {
      sportId: number;
      file: File;
    }[];
  }

  // Type liên quan đến xác thực - chỉ dùng cho hiển thị
export interface Certificate {
    verified: string;
    temporary: string;    
    facilityId?: string;
  }

  export interface Licenses {
    verified: string;
    temporary: string;
    facilityId?: string;
    sportId?: number;
  }

  export interface VerificationHistoryItem {
    id: string;
    facilityId: string;
    field: string;
    oldValue: string;
    newValue: string;
    status: 'approved' | 'pending' | 'rejected';
    requestDate: string;
    updatedDate?: string;
    note?: string;
  }


  export interface Province {
    code: string | number;
    name: string;
    division_type: string;
    codename: string;
    phone_code: number;
    districts: District[];
  }
  
  export interface District {
    code: string | number;
    name: string;
    division_type: string;
    codename: string;
    province_code: number;
    wards: Ward[];
  }
  
  export interface Ward {
    code: string | number;
    name: string;
    division_type: string;
    codename: string;
    district_code: number;
  }

  // State interface
export interface FacilityState {
    // Facility details
    facility: Facility;    
    isLoading: boolean;
    error: string | null;
  }

// Interface cho việc chuyển đổi trạng thái
export interface FacilityStatusChange {
  facilityId: string;
  newStatus: 'active' | 'unactive';
  note?: string;
}