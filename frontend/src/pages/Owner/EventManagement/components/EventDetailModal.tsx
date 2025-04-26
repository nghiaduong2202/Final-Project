import React from 'react';
import { Modal, Descriptions, Badge, Button, Image, Tag, Divider, Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Event, EventStatus, DiscountType, TargetUserType } from '@/types/event.type';
import dayjs from 'dayjs';

interface EventDetailModalProps {
  visible: boolean;
  event: Event | null;
  onClose: () => void;
  onEdit: (event: Event) => void;
}

// Mock sports data
const mockSports: Record<number, string> = {
  1: 'Bóng đá',
  2: 'Bóng rổ',
  3: 'Tennis',
  4: 'Cầu lông'
};

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  visible,
  event,
  onClose,
  onEdit
}) => {
  if (!event) return null;
  
  // Get status badge color
  const getStatusBadge = (status: EventStatus) => {
    const statusMap: Record<string, string> = {
      active: 'success',
      upcoming: 'warning',
      expired: 'error'
    };
    return statusMap[status] || 'default';
  };

  // Get status text
  const getStatusText = (status: EventStatus) => {
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
      'DISCOUNT': 'Khuyến mãi'
    };
    return typeMap[type] || type;
  };

  // Format date time
  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    return `${formatDateTime(startDate)} - ${formatDateTime(endDate)}`;
  };

  // Format discount type
  const formatDiscountType = (type: DiscountType) => {
    const typeMap: Record<string, string> = {
      'PERCENT': 'Giảm theo phần trăm',
      'AMOUNT': 'Giảm theo số tiền',
      'FREE_SLOT': 'Tặng lượt đặt sân'
    };
    return typeMap[type] || type;
  };

  // Format target user type
  const formatTargetUserType = (type: TargetUserType) => {
    const typeMap: Record<string, string> = {
      'ALL': 'Tất cả khách hàng',
      'NEW': 'Khách hàng mới',
      'LOYALTY': 'Khách hàng thân thiết',
      'CASUAL': 'Khách hàng thông thường'
    };
    return typeMap[type] || type;
  };

  // Get sport names from sport IDs
  const getSportNames = (sportIds?: number[]) => {
    if (!sportIds || sportIds.length === 0) return 'Không xác định';
    return sportIds.map(id => mockSports[id] || `Môn thể thao ${id}`).join(', ');
  };

  // Format tournament type
  const formatTournamentType = (types?: string[] | string) => {
    if (!types) return 'Không xác định';
    
    if (Array.isArray(types)) {
      const formatMap: Record<string, string> = {
        'knockout': 'Loại trực tiếp',
        'roundRobin': 'Vòng tròn',
        'hybrid': 'Kết hợp',
        'other': 'Khác'
      };
      
      return types.map(type => formatMap[type] || type).join(', ');
    }
    
    return types;
  };

  // Format registration type
  const formatRegistrationType = (type?: string) => {
    const typeMap: Record<string, string> = {
      'individual': 'Đăng ký cá nhân',
      'team': 'Đăng ký theo đội',
      'both': 'Cả cá nhân và đội'
    };
    return type ? typeMap[type] || type : 'Không xác định';
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
          disabled={event.status === 'expired'}
        >
          Chỉnh sửa
        </Button>
      ]}
    >
      {/* Event Image */}
      {event.image && event.image.length > 0 && (
        <div className="mb-4">
          <Image
            src={event.bannerImage || event.image[0]}
            alt={event.name}
            style={{ maxHeight: 300, width: '100%', objectFit: 'cover' }}
          />
          {event.image.length > 1 && (
            <div className="mt-2">
              <Space size={[8, 8]} wrap>
                {event.image.slice(1).map((img, index) => (
                  <Image
                    key={index}
                    src={img}
                    alt={`${event.name} ${index + 2}`}
                    width={80}
                    height={60}
                    style={{ objectFit: 'cover' }}
                  />
                ))}
              </Space>
            </div>
          )}
        </div>
      )}

      <Descriptions bordered column={2} className="mt-4">
        <Descriptions.Item label="Tên sự kiện" span={2}>
          {event.name}
        </Descriptions.Item>
        
        <Descriptions.Item label="Mã sự kiện">
          {event.id}
        </Descriptions.Item>
        
        <Descriptions.Item label="Trạng thái">
          <Badge status={getStatusBadge(event.status || 'upcoming') as "success" | "warning" | "error" | "default" | "processing"} text={getStatusText(event.status || 'upcoming')} />
        </Descriptions.Item>
        
        <Descriptions.Item label="Thời gian diễn ra" span={2}>
          {formatDateRange(event.startDate, event.endDate)}
        </Descriptions.Item>
        
        <Descriptions.Item label="Loại sự kiện">
          {getEventTypeText(event.eventType)}
        </Descriptions.Item>
        
        <Descriptions.Item label="Cơ sở">
          {event.facilityName || 'Không xác định'}
        </Descriptions.Item>
        
        <Descriptions.Item label="Mô tả" span={2}>
          {event.description}
        </Descriptions.Item>
        
        {event.location && (
          <Descriptions.Item label="Vị trí cụ thể" span={2}>
            {event.location}
          </Descriptions.Item>
        )}

        <Divider orientation="left">Chi tiết theo loại sự kiện</Divider>
        
        {/* Tournament specific fields */}
        {event.eventType === 'TOURNAMENT' && (
          <>
            {event.sportIds && (
              <Descriptions.Item label="Môn thể thao">
                {getSportNames(event.sportIds)}
              </Descriptions.Item>
            )}
            
            {event.registrationType && (
              <Descriptions.Item label="Hình thức đăng ký">
                {formatRegistrationType(event.registrationType)}
              </Descriptions.Item>
            )}

            {event.tournamentFormat && (
              <Descriptions.Item label="Thể thức thi đấu" span={2}>
                {formatTournamentType(event.tournamentFormat)}
              </Descriptions.Item>
            )}

            {event.tournamentFormatDescription && (
              <Descriptions.Item label="Mô tả thể thức" span={2}>
                {event.tournamentFormatDescription}
              </Descriptions.Item>
            )}
            
            {event.maxParticipants && (
              <Descriptions.Item label="Số người tham gia tối đa">
                {event.maxParticipants}
              </Descriptions.Item>
            )}

            {event.minParticipants && (
              <Descriptions.Item label="Số người tham gia tối thiểu">
                {event.minParticipants}
              </Descriptions.Item>
            )}
            
            {event.currentParticipants !== undefined && (
              <Descriptions.Item label="Số người đã đăng ký">
                {event.currentParticipants}
              </Descriptions.Item>
            )}
            
            {event.registrationEndDate && (
              <Descriptions.Item label="Hạn đăng ký" span={2}>
                {formatDateTime(event.registrationEndDate)}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Phí đăng ký">
              {event.isFreeRegistration ? 
                <Tag color="green">Miễn phí</Tag> : 
                `${event.registrationFee?.toLocaleString('vi-VN')} VNĐ`
              }
            </Descriptions.Item>

            {event.ageLimit && (
              <Descriptions.Item label="Giới hạn độ tuổi">
                {event.ageLimit}
              </Descriptions.Item>
            )}
            
            {event.totalPrize && (
              <Descriptions.Item label="Tổng giải thưởng" span={2}>
                {event.totalPrize}
              </Descriptions.Item>
            )}

            {event.prizeDescription && (
              <Descriptions.Item label="Mô tả giải thưởng" span={2}>
                {event.prizeDescription}
              </Descriptions.Item>
            )}
            
            {event.prizes && event.prizes.length > 0 && (
              <Descriptions.Item label="Chi tiết giải thưởng" span={2}>
                <ul className="list-disc pl-5">
                  {event.prizes.map((prize, index) => (
                    <li key={index}>
                      Giải {prize.position}: {prize.prize}
                    </li>
                  ))}
                </ul>
              </Descriptions.Item>
            )}

            {event.rulesAndRegulations && (
              <Descriptions.Item label="Luật thi đấu và quy định" span={2}>
                {event.rulesAndRegulations}
              </Descriptions.Item>
            )}

            {/* Payment information for tournaments */}
            {!event.isFreeRegistration && event.paymentMethod && (
              <>
                <Divider orientation="left">Thông tin thanh toán</Divider>
                
                <Descriptions.Item label="Phương thức thanh toán" span={2}>
                  {Array.isArray(event.paymentMethod) ? event.paymentMethod.join(', ') : event.paymentMethod}
                </Descriptions.Item>
                
                {event.paymentInstructions && (
                  <Descriptions.Item label="Hướng dẫn thanh toán" span={2}>
                    {event.paymentInstructions}
                  </Descriptions.Item>
                )}
                
                {event.paymentDeadline && (
                  <Descriptions.Item label="Hạn thanh toán">
                    {formatDateTime(event.paymentDeadline)}
                  </Descriptions.Item>
                )}
                
                {event.paymentAccountInfo && (
                  <Descriptions.Item label="Thông tin tài khoản" span={2}>
                    {event.paymentAccountInfo}
                  </Descriptions.Item>
                )}
                
                {event.paymentQrImage && (
                  <Descriptions.Item label="Mã QR thanh toán" span={2}>
                    <Image
                      src={event.paymentQrImage}
                      alt="QR Code thanh toán"
                      width={200}
                    />
                  </Descriptions.Item>
                )}
              </>
            )}
          </>
        )}

        {/* Discount specific fields */}
        {event.eventType === 'DISCOUNT' && (
          <>
            {event.discountType && (
              <Descriptions.Item label="Loại khuyến mãi">
                {formatDiscountType(event.discountType)}
              </Descriptions.Item>
            )}
            
            {event.targetUserType && (
              <Descriptions.Item label="Đối tượng áp dụng">
                {formatTargetUserType(event.targetUserType)}
              </Descriptions.Item>
            )}
            
            {event.discountType === 'PERCENT' && event.discountPercent && (
              <Descriptions.Item label="Phần trăm giảm giá">
                {event.discountPercent}%
              </Descriptions.Item>
            )}
            
            {event.discountType === 'FIXED_AMOUNT' && event.discountAmount && (
              <Descriptions.Item label="Số tiền giảm giá">
                {event.discountAmount.toLocaleString('vi-VN')} VNĐ
              </Descriptions.Item>
            )}
            
            {event.discountType === 'FREE_SLOT' && event.freeSlots && (
              <Descriptions.Item label="Số lượt đặt sân miễn phí">
                {event.freeSlots} lượt
              </Descriptions.Item>
            )}
            
            {event.minBookingValue !== undefined && (
              <Descriptions.Item label="Giá trị đặt sân tối thiểu">
                {event.minBookingValue > 0 ? 
                  `${event.minBookingValue.toLocaleString('vi-VN')} VNĐ` : 
                  'Không giới hạn'
                }
              </Descriptions.Item>
            )}
            
            {event.maxUsageCount !== undefined && (
              <Descriptions.Item label="Số lần sử dụng tối đa">
                {event.maxUsageCount > 0 ? event.maxUsageCount : 'Không giới hạn'}
              </Descriptions.Item>
            )}
            
            {event.descriptionOfDiscount && (
              <Descriptions.Item label="Mô tả khuyến mãi" span={2}>
                {event.descriptionOfDiscount}
              </Descriptions.Item>
            )}
          </>
        )}
        
        {/* Contact Information */}
        {event.contact && (
          <>
            <Divider orientation="left">Thông tin liên hệ</Divider>
            <Descriptions.Item label="Người liên hệ">
              {event.contact.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {event.contact.email}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại" span={2}>
              {event.contact.phone}
            </Descriptions.Item>
          </>
        )}
        
        {/* Organizer Information */}
        {event.organizer && (
          <>
            <Divider orientation="left">Thông tin nhà tổ chức</Divider>
            <Descriptions.Item label="Tên nhà tổ chức" span={2}>
              {event.organizer.name}
            </Descriptions.Item>
            {event.organizer.logo && (
              <Descriptions.Item label="Logo" span={2}>
                <Image 
                  src={event.organizer.logo} 
                  alt={event.organizer.name}
                  width={100}
                />
              </Descriptions.Item>
            )}
          </>
        )}
        
        {/* Creation and update times */}
        <Divider orientation="left">Thông tin quản trị</Divider>
        <Descriptions.Item label="Ngày tạo">
          {event.createdAt ? formatDateTime(event.createdAt) : 'Không xác định'}
        </Descriptions.Item>
        <Descriptions.Item label="Cập nhật lần cuối">
          {event.updatedAt ? formatDateTime(event.updatedAt) : 'Không xác định'}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default EventDetailModal; 