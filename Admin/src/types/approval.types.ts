export interface Approval {
    id: string;
    type: 'facility_registration' | 'facility_name_change' | 'business_license';
    status: 'pending' | 'approved' | 'rejected';
    requestedBy: {
      id: string;
      name: string;
      email: string;
    };
    createdAt: string;
    facilityId?: string; // For facility-related approvals
    facilityName?: string; // For facility name change
    details: {
      description: string;
      documents: {
        type: 'business_registration' | 'business_license';
        name: string;
        url: string;
        sportType?: string; // For business licenses
      }[];
      facilityInfo?: {
        name: string;
        address: string;
        description: string;
        images: string[];
        // Add other facility details as needed
      };
    };
    rejectionReason?: string;
  }
  
  export interface ApprovalFilter {
    status?: 'pending' | 'approved' | 'rejected';
    type?: 'facility_registration' | 'facility_name_change' | 'business_license';
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