import api from "./api";

// Dashboard service for fetching dashboard data
const dashboardService = {
  /**
   * Get dashboard data for a specific month and year
   * @param month - The month to get data for
   * @param year - The year to get data for
   * @param facilityId - Optional facility ID to filter data
   */
  async getDashboardData(month: number, year: number, facilityId?: string) {
    const url = "/payment/monthly-report";
    const params = facilityId ? { facility: facilityId } : {};
    const data = { month, year };
    
    const response = await api.post(url, data, { params });
    return response.data;
  }
};

export default dashboardService;
  