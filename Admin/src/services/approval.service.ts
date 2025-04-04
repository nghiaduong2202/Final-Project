import { ApprovalFilter } from '@/types/approval.types';
import { mockApprovals, getApprovalsByStatus, getApprovalsByFacilityId } from '@/mocks/approval/mockApprovals';

export const approvalService = {
  async getApprovals(filter: ApprovalFilter = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredApprovals = [...mockApprovals];

    // Apply filters
    if (filter.status) {
      filteredApprovals = getApprovalsByStatus(filter.status);
    }

    if (filter.type) {
      filteredApprovals = filteredApprovals.filter(approval => approval.type === filter.type);
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filteredApprovals = filteredApprovals.filter(approval => 
        approval.facilityName?.toLowerCase().includes(searchLower) ||
        approval.requestedBy.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: filteredApprovals.slice(start, end),
      total: filteredApprovals.length,
      page,
      limit
    };
  },
  
  async approveRequest(approvalId: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const approval = mockApprovals.find(a => a.id === approvalId);
    if (!approval) {
      throw new Error('Approval not found');
    }

    approval.status = 'approved';
    return approval;
  },
  
  async rejectRequest(approvalId: string, reason: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const approval = mockApprovals.find(a => a.id === approvalId);
    if (!approval) {
      throw new Error('Approval not found');
    }

    approval.status = 'rejected';
    approval.rejectionReason = reason;
    return approval;
  },
  
  async getApprovalById(approvalId: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const approval = mockApprovals.find(a => a.id === approvalId);
    if (!approval) {
      throw new Error('Approval not found');
    }

    return approval;
  },

  async verifyDocument(approvalId: string, documentId: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const approval = mockApprovals.find(a => a.id === approvalId);
    if (!approval) {
      throw new Error('Approval not found');
    }

    const document = approval.details.documents.find(d => d.url === documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // In a real implementation, we would update the document status
    // For mock data, we'll just return success
    return { success: true };
  },

  async getFacilityApprovals(facilityId: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return getApprovalsByFacilityId(facilityId);
  }
};