import React from 'react';
import { Modal, Tag } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Service, UpdatedServiceValues } from '@/types/service.type';
import { formatPrice } from '@/utils/statusUtils';

interface ServiceConfirmModalProps {
  visible: boolean;
  service: Service | null;
  updatedValues: UpdatedServiceValues | null;
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
}

const ServiceConfirmModal: React.FC<ServiceConfirmModalProps> = ({
  visible,
  service,
  updatedValues,
  onConfirm,
  onCancel,
  submitting
}) => {
  // Helper function để hiển thị loại dịch vụ
  const getServiceTypeTag = (type: string) => {
    const config: Record<string, { color: string, text: string }> = {
      rental: { color: 'blue', text: 'Cho thuê' },
      coaching: { color: 'purple', text: 'Huấn luyện' },
      equipment: { color: 'cyan', text: 'Thiết bị' },
      food: { color: 'green', text: 'Đồ uống/Thực phẩm' },
      other: { color: 'gray', text: 'Khác' },
    };
    const typeConfig = config[type] || { color: 'default', text: type };
    return <Tag color={typeConfig.color}>{typeConfig.text}</Tag>;
  };

  if (!service || !updatedValues) return null;

  // Lấy tên môn thể thao từ ID
  const getSportName = (sportId: number): string => {
    // Trong thực tế, đây sẽ là một lookup từ danh sách sports
    // Nhưng vì chúng ta không có props sports, nên chỉ hiển thị ID
    return `ID: ${sportId}`;
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ExclamationCircleOutlined style={{ marginRight: '8px' }} />
          <span>Xác nhận cập nhật dịch vụ</span>
        </div>
      }
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Cập nhật"
      okType="primary"
      cancelText="Hủy"
      confirmLoading={submitting}
    >
      <div>
        <p>Bạn có chắc chắn muốn cập nhật dịch vụ này với thông tin mới?</p>
        <div className="bg-gray-50 p-3 mt-2 rounded-md">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p><strong>Tên cũ:</strong></p>
              <p className="text-gray-500">{service.name}</p>
            </div>
            <div>
              <p><strong>Tên mới:</strong></p>
              <p className="text-blue-500">{updatedValues.name}</p>
            </div>
            
            <div>
              <p><strong>Loại hình cũ:</strong></p>
              <p className="text-gray-500">{service.sport?.name || 'Không xác định'}</p>
            </div>
            <div>
              <p><strong>Loại hình mới:</strong></p>
              <p className="text-blue-500">{getSportName(updatedValues.sportId)}</p>
            </div>
            
            <div>
              <p><strong>Loại dịch vụ cũ:</strong></p>
              <p className="text-gray-500">{getServiceTypeTag(service.type)}</p>
            </div>
            <div>
              <p><strong>Loại dịch vụ mới:</strong></p>
              <p className="text-blue-500">{getServiceTypeTag(updatedValues.type)}</p>
            </div>
            
            <div>
              <p><strong>Giá cũ:</strong></p>
              <p className="text-gray-500">{formatPrice(service.price)}/{service.unit}</p>
            </div>
            <div>
              <p><strong>Giá mới:</strong></p>
              <p className="text-blue-500">{formatPrice(updatedValues.price)}/{updatedValues.unit}</p>
            </div>
            
            <div>
              <p><strong>Số lượng cũ:</strong></p>
              <p className="text-gray-500">{service.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</p>
            </div>
            <div>
              <p><strong>Số lượng mới:</strong></p>
              <p className="text-blue-500">{updatedValues.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</p>
            </div>
          </div>
          
          {updatedValues.description !== service.description && (
            <div className="mt-2">
              <p><strong>Mô tả mới:</strong></p>
              <p className="text-blue-500">{updatedValues.description || 'Không có mô tả'}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ServiceConfirmModal; 