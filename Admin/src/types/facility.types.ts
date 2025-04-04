export interface Facility {
    id: string;
    name: string;
    owner: {
      id: string;
      name: string;
    };
    address: string;
    sportType: string;
    status: string;
    description?: string;
    phone?: string;
    email?: string;
    openTime?: string;
    closeTime?: string;
    image: string;
    createdAt: string;
    updatedAt?: string;
  }
  
  export interface FacilitiesState {
    facilities: Facility[];
    selectedFacility: Facility | null;
    loading: boolean;
    error: string | null;
    totalFacilities: number;
  }
  
  export interface FacilityFilter {
    sportType?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }