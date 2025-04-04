import React from 'react';
import { Modal, Button, Typography, Tag, Divider, Descriptions } from 'antd';
import { Service } from '@/types/service.type';
import { formatPrice } from '@/utils/statusUtils';
import { getSportNameInVietnamese } from '@/utils/translateSport';

const { Text } = Typography;

interface ServiceDetailModalProps {
  visible: boolean;
  service: Service | null;
  onClose: () => void;
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  visible,
  service,
  onClose
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

  return (
    <Modal
      title="Chi tiết dịch vụ"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>
      ]}
      width={600}
    >
      {service && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <Text strong className="text-lg">{service.name}</Text>
              <div className="mt-1 flex gap-1">
                <Tag color="blue">{service.sport ? getSportNameInVietnamese(service.sport.name) : 'Không xác định'}</Tag>
                {getServiceTypeTag(service.type)}
              </div>
            </div>
            <div className="text-right">
              <Text strong className="text-lg text-red-500">{formatPrice(service.price)}/{service.unit}</Text>
              <div className="mt-1">
                <Text type="secondary">Tổng: {service.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} sản phẩm</Text>
              </div>
            </div>
          </div>
          
          <Divider />
          
          <div>
            <Text strong>Mô tả dịch vụ:</Text>
            <p className="mt-1">{service.description || 'Không có mô tả'}</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md">
            <Text strong>Thông tin bổ sung:</Text>
            <Descriptions column={2}>
              <Descriptions.Item label="Loại dịch vụ">
                <Tag color={getServiceTypeTag(service.type).props.color}>
                  {getServiceTypeTag(service.type).props.children}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Phân loại">
                <Tag color="blue">
                  {service.sport ? getSportNameInVietnamese(service.sport.name) : 'Không xác định'}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Tổng">
                <strong>
                  {service.amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  {service.unit && ` ${service.unit}`}
                </strong>
              </Descriptions.Item>

              <Descriptions.Item label="Đơn giá">
                <strong className="text-orange-500">{formatPrice(service.price)}</strong>
              </Descriptions.Item>

              <Descriptions.Item label="Số lượng đã đặt">
                <strong>
                  {service.bookedCount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') || '0'}
                  {service.unit && ` ${service.unit}`}
                </strong>
              </Descriptions.Item>

              <Descriptions.Item label="Đang sử dụng trong ngày">
                <strong>
                  {service.bookedCountOnDate?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') || '0'}
                  {service.unit && ` ${service.unit}`}
                </strong>
              </Descriptions.Item>
            </Descriptions>
          </div>
          
          <div className="pt-2">
            <Text type="secondary">
              * Lưu ý: Quản lý đầy đủ thông tin dịch vụ để tăng hiệu quả kinh doanh
            </Text>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ServiceDetailModal; 