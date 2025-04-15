export interface Approval {
    id: string;
    type: 'facility' | 'facility_name' | 'certificate' | 'license';
    status: 'pending' | 'approved' | 'rejected';
    name: string | null;
    certifiacte: string | null;
    license: string | null;
    sport: {
      id: number;
      name: string;
    } | null;
    note: string | null;
    createdAt: string;
    updatedAt: string;
    facility?: {
      id: string;
      name: string;
      description: string;
      openTime1: string;
      closeTime1: string;
      openTime2: string | null;
      closeTime2: string | null;
      openTime3: string | null;
      closeTime3: string | null;
      numberOfShifts: number;
      location: string;
      status: string;
      avgRating: number;
      numberOfRating: number;
      imagesUrl: string[];
      createdAt: string;
      updatedAt: string;
      certificate?: {
        facilityId: string;
        verified: string | null;
        temporary: string | null;
      };
      licenses?: Array<{
        facilityId: string;
        sportId: number;
        verified: string | null;
        temporary?: string | null;
      }>;
    };
  }
  
  export interface ApprovalFilter {
    status?: 'pending' | 'approved' | 'rejected';
    type?: 'facility' | 'facility_name' | 'certificate' | 'license';
    search?: string;
    page?: number;
    limit?: number;
  }
  
  export interface ApprovalState {
    approvals: Approval[];
    selectedApproval: Approval | null;
    loading: boolean;
    error: string | null;
    totalApprovals: number;
  }