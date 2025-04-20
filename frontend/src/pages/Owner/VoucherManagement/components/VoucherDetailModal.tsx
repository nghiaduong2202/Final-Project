import React from 'react';
import { Modal, Descriptions, Badge } from 'antd';
import { Voucher } from '@/types/voucher.type';
import { 
  getVoucherStatus, 
  formatDiscountValue, 
  formatDate, 
  formatCurrency 
} from '@/utils/voucherUtils';

interface VoucherDetailModalProps {
  visible: boolean;
  voucher: Voucher | null;
  onClose: () => void;
}

const VoucherDetailModal: React.FC<VoucherDetailModalProps> = ({ 
  visible, 
  voucher, 
  onClose 
}) => {
  if (!voucher) return null;

  // Get status with proper format
  const status = getVoucherStatus(voucher.startDate, voucher.endDate);
  const statusConfig = {
    active: { color: 'green', text: 'Đang diễn ra' },
    upcoming: { color: 'blue', text: 'Sắp diễn ra' },
    expired: { color: 'red', text: 'Đã kết thúc' }
  };

  return (
    <Modal
      title="Chi tiết voucher"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Tên voucher" span={2}>
          {voucher.name}
        </Descriptions.Item>
        
        {/* <Descriptions.Item label="Mã voucher">
          {voucher.code}
        </Descriptions.Item> */}
        
        <Descriptions.Item label="Trạng thái">
          <Badge 
            status={statusConfig[status].color as 'success' | 'processing' | 'error'} 
            text={statusConfig[status].text} 
          />
        </Descriptions.Item>
        
        <Descriptions.Item label="Loại giảm giá">
          {voucher.voucherType === 'percent' ? 'Giảm theo %' : 'Giảm theo số tiền'}
        </Descriptions.Item>
        
        <Descriptions.Item label="Giá trị giảm">
          {formatDiscountValue(voucher.voucherType, voucher.discount)}
        </Descriptions.Item>
        
        <Descriptions.Item label="Ngày bắt đầu">
          {formatDate(voucher.startDate)}
        </Descriptions.Item>
        
        <Descriptions.Item label="Ngày kết thúc">
          {formatDate(voucher.endDate)}
        </Descriptions.Item>
        
        <Descriptions.Item label="Đơn tối thiểu">
          {formatCurrency(voucher.minPrice)}
        </Descriptions.Item>
        
        <Descriptions.Item label="Giảm tối đa">
          {formatCurrency(voucher.maxDiscount)}
        </Descriptions.Item>
        
        <Descriptions.Item label="Tổng số lượng">
          {voucher.amount}
        </Descriptions.Item>
        
        <Descriptions.Item label="Còn lại">
          {voucher.remain}
        </Descriptions.Item>
        
        <Descriptions.Item label="Ngày tạo" span={2}>
          {new Date(voucher.createdAt).toLocaleString('vi-VN')}
        </Descriptions.Item>
        
        <Descriptions.Item label="Cập nhật lần cuối" span={2}>
          {new Date(voucher.updatedAt).toLocaleString('vi-VN')}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default VoucherDetailModal; 