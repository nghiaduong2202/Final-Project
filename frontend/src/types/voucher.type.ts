export interface Voucher {
    id: number;
    name: string;
    code?: string;
    startDate: string;
    endDate: string;
    voucherType: 'cash' | 'percent';
    discount: number;
    minPrice: number;
    maxDiscount: number;
    amount: number;
    remain: number;
    facilityId: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface VoucherData {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    voucherType: 'cash' | 'percent';
    discount: number;
    minPrice: number;
    maxDiscount: number;
    amount: number;
    remain: number;
    createdAt: string;
    updatedAt: string;
    facility: {
      id: string;
      name: string;
      description: string;
      imagesUrl: string[];
      status?: string;
      location?: string;
      avgRating?: number;
    };
  }

  export interface VoucherFormData {
    name: string;
    code?: string;
    startDate: string;
    endDate: string;
    voucherType: 'cash' | 'percent';
    discount: number;
    minPrice: number;
    maxDiscount: number;
    amount: number;
    // facilityId: string;
  }

  export interface VoucherFilter {
    facilityId?: string;
    status?: 'active' | 'upcoming' | 'expired';
  }

  export interface VoucherState {
    vouchers: Voucher[];
    isLoading: boolean;
    error: string | null;
    selectedFacilityId: string | null;
  }