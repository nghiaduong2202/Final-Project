import { ApprovalFilter } from '@/types/approval.types';
import apiClient from './api.service';

export const approvalService = {
  async getApprovals(filter: ApprovalFilter = {}) {
    try {
      // API không hỗ trợ filter, lấy tất cả dữ liệu
      const response = await apiClient.get('/approval/all');
      
      return {
        data: response.data,
        total: response.data.length,
        page: filter.page || 1,
        limit: filter.limit || 10
      };
    } catch (error) {
      console.error('Error fetching approvals:', error);
      throw error;
    }
  },
  
  async approveRequest(approvalId: string) {
    try {
      const response = await apiClient.post(`/approval/${approvalId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  },
  
  async rejectRequest(approvalId: string, reason: string) {
    try {
      const response = await apiClient.post(`/approval/${approvalId}/reject`, { note: reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  },
  
  async getApprovalById(approvalId: string) {
    try {
      const response = await apiClient.get(`/approval/${approvalId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting approval:', error);
      throw error;
    }
  },

  // async verifyDocument(approvalId: string, documentId: string) {
  //   // Simulate API delay
  //   await new Promise(resolve => setTimeout(resolve, 500));

  //   const approval = mockApprovals.find(a => a.id === approvalId);
  //   if (!approval) {
  //     throw new Error('Approval not found');
  //   }

  //   const document = approval.details.documents.find(d => d.url === documentId);
  //   if (!document) {
  //     throw new Error('Document not found');
  //   }

  //   // In a real implementation, we would update the document status
  //   // For mock data, we'll just return success
  //   return { success: true };
  // },

  // async getFacilityApprovals(facilityId: string) {
  //   try {
  //     const response = await apiClient.get(`/facility/${facilityId}/approvals`);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error getting facility approvals:', error);
  //     throw error;
  //   }
  // }
};