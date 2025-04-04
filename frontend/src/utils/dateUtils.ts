/**
 * Format a date string to a more readable format
 * @param dateString ISO date string
 * @returns Formatted date string (DD/MM/YYYY)
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Format a date range to display
 * @param startDate ISO date string
 * @param endDate ISO date string
 * @returns Formatted date range string
 */
export const formatDateRange = (startDate: string, endDate: string): string => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Calculate the number of days between now and a given date
 * @param dateString ISO date string
 * @returns Number of days (negative if in the past)
 */
export const getDaysFromNow = (dateString: string): number => {
  const now = new Date();
  const date = new Date(dateString);
  
  // Reset time part for accurate day calculation
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Check if a date is in the future
 * @param dateString ISO date string
 * @returns True if the date is in the future
 */
export const isFutureDate = (dateString: string): boolean => {
  return getDaysFromNow(dateString) > 0;
};

/**
 * Format a datetime string including time
 * @param dateString ISO date string
 * @returns Formatted date and time (DD/MM/YYYY HH:mm)
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 