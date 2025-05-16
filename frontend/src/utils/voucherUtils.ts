/**
 * Functions to handle voucher-related operations
 */

/**
 * Determine the voucher status based on start and end dates
 * @param startDate - Voucher start date
 * @param endDate - Voucher end date
 * @returns 'active' | 'upcoming' | 'expired'
 */
export const getVoucherStatus = (startDate: string, endDate: string): 'active' | 'upcoming' | 'expired' => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) {
    return 'upcoming';
  } else if (now > end) {
    return 'expired';
  } else {
    return 'active';
  }
};

/**
 * Format discount value based on voucher type
 * @param type - 'cash' or 'percent'
 * @param value - Discount amount
 * @returns Formatted string
 */
export const formatDiscountValue = (type: 'cash' | 'percent', value: number): string => {
  return type === 'cash' 
    ? `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ` 
    : `${value}%`;
};

/**
 * Format date for display
 * @param dateString - ISO date string
 * @returns Formatted date (DD/MM/YYYY)
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

/**
 * Format date range for display
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range
 */
export const formatDateRange = (startDate: string, endDate: string): string => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Format currency in VND
 * @param value - Numeric value
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) {
    return '0đ';
  }
  return `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ`;
};

/**
 * Get status color for display
 * @param status - Voucher status
 * @returns CSS color class
 */
export const getStatusColor = (status: 'active' | 'upcoming' | 'expired'): string => {
  const colors = {
    active: 'text-green-500',
    upcoming: 'text-blue-500',
    expired: 'text-red-500'
  };
  return colors[status];
}; 