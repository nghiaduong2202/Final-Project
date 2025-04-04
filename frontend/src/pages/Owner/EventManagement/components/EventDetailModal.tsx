import React from 'react';
import { Modal, Descriptions, Badge, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Event } from '@/types/event.type';
import { formatDate, formatDateRange } from '@/utils/dateUtils';
import { mockEventDetails } from '@/mocks/event/eventData';

interface EventDetailModalProps {
  visible: boolean;
  event: Event | null;
  onClose: () => void;
  onEdit: (event: Event) => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  visible,
  event,
  onClose,
  onEdit
}) => {
  if (!event) return null;

  // Get the event details from mock data
  const eventDetail = mockEventDetails[event.id];
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      active: 'success',
      upcoming: 'warning',
      expired: 'error'
    };
    return statusMap[status] || 'default';
  };

  // Get status text
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      active: 'Đang diễn ra',
      upcoming: 'Sắp diễn ra',
      expired: 'Đã kết thúc'
    };
    return statusMap[status] || status;
  };

  // Get event type text
  const getEventTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'TOURNAMENT': 'Giải đấu',
      'DISCOUNT': 'Khuyến mãi',
      'SPECIAL_OFFER': 'Ưu đãi đặc biệt'
    };
    return typeMap[type] || type;
  };

  // Get facility name
  const getFacilityName = (facilityId: string) => {
    const facilityMap: Record<string, string> = {
      '1': 'Sân bóng đá Phạm Kha',
      '2': 'Sân Tennis Bình Chánh',
      '3': 'Sân bóng rổ Quận 7',
      '4': 'Sân cầu lông Phạm Kha'
    };
    return facilityMap[facilityId] || 'Không xác định';
  };

  return (
    <Modal
      title="Chi tiết sự kiện"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button 
          key="edit" 
          type="primary" 
          icon={<EditOutlined />} 
          onClick={() => onEdit(event)}
        >
          Chỉnh sửa
        </Button>
      ]}
    >
      <Descriptions bordered column={2} className="mt-4">
        <Descriptions.Item label="Tên sự kiện" span={2}>
          {event.name}
        </Descriptions.Item>
        
        <Descriptions.Item label="Mã sự kiện">
          {event.id}
        </Descriptions.Item>
        
        <Descriptions.Item label="Trạng thái">
          <Badge status={getStatusBadge(event.status) as "success" | "warning" | "error" | "default" | "processing"} text={getStatusText(event.status)} />
        </Descriptions.Item>
        
        <Descriptions.Item label="Thời gian diễn ra" span={2}>
          {formatDateRange(event.startDate, event.endDate)}
        </Descriptions.Item>
        
        <Descriptions.Item label="Mô tả" span={2}>
          {event.description}
        </Descriptions.Item>
        
        {event.eventType && (
          <Descriptions.Item label="Loại sự kiện">
            {getEventTypeText(event.eventType)}
          </Descriptions.Item>
        )}
        
        {event.facilityId && (
          <Descriptions.Item label="Cơ sở">
            {getFacilityName(event.facilityId)}
          </Descriptions.Item>
        )}
        
        {eventDetail?.discountPercent && (
          <Descriptions.Item label="Mức giảm giá">
            {eventDetail.discountPercent}%
          </Descriptions.Item>
        )}
        
        {eventDetail?.conditions && (
          <Descriptions.Item label="Điều kiện áp dụng" span={2}>
            {eventDetail.conditions}
          </Descriptions.Item>
        )}
        
        {eventDetail?.fields && eventDetail.fields.length > 0 && (
          <Descriptions.Item label="Sân tổ chức" span={2}>
            {eventDetail.fields.join(', ')}
          </Descriptions.Item>
        )}
        
        {eventDetail?.maxParticipants && (
          <Descriptions.Item label="Số người tham gia tối đa">
            {eventDetail.maxParticipants}
          </Descriptions.Item>
        )}
        
        {eventDetail?.currentParticipants && (
          <Descriptions.Item label="Số người đã đăng ký">
            {eventDetail.currentParticipants}
          </Descriptions.Item>
        )}
        
        {eventDetail?.registrationEndDate && (
          <Descriptions.Item label="Hạn đăng ký" span={2}>
            {formatDate(eventDetail.registrationEndDate)}
          </Descriptions.Item>
        )}
        
        {eventDetail?.prizes && eventDetail.prizes.length > 0 && (
          <Descriptions.Item label="Giải thưởng" span={2}>
            <ul className="list-disc pl-5">
              {eventDetail.prizes.map((prize, index) => (
                <li key={index}>
                  Giải {prize.position}: {prize.prize}
                </li>
              ))}
            </ul>
          </Descriptions.Item>
        )}
        
        {eventDetail?.activities && eventDetail.activities.length > 0 && (
          <Descriptions.Item label="Các hoạt động" span={2}>
            {eventDetail.activities.join(', ')}
          </Descriptions.Item>
        )}
        
        {eventDetail?.specialServices && eventDetail.specialServices.length > 0 && (
          <Descriptions.Item label="Dịch vụ đặc biệt" span={2}>
            <ul className="list-disc pl-5">
              {eventDetail.specialServices.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </Descriptions.Item>
        )}
        
        <Descriptions.Item label="Thời gian tạo">
          {formatDate(event.createdAt)}
        </Descriptions.Item>
        
        <Descriptions.Item label="Cập nhật lần cuối">
          {formatDate(event.updatedAt)}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default EventDetailModal; 