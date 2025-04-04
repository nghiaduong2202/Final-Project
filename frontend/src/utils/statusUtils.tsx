import { Tag } from 'antd';
import React from 'react';

// Format price to VND
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'VND' }).format(price)
    // Xóa dấu phẩy thập phân và hai số 0 sau dấu phẩy
    .replace(/,00/g, '')
    // Xóa khoảng trắng giữa số và đơn vị tiền tệ
    .replace(/\s/g, '');
};

// Format time from "HH:MM:SS" to "HH:MM"
export const formatTime = (time?: string): string => {
  return time ? time.substring(0, 5) : '';
};

// Get status color and text
export const getStatusTag = (status: string): React.ReactNode => {
  const config: Record<string, { color: string, text: string }> = {
    active: { color: 'success', text: 'Đang hoạt động' },
    closed: { color: 'error', text: 'Đang đóng cửa' },
  };
  const statusConfig = config[status] || { color: 'default', text: status };
  return <Tag color={statusConfig.color}>{statusConfig.text}</Tag>;
}; 