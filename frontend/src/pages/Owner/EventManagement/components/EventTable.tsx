import React from 'react';
import { Table, Tag, Button, Space, Tooltip, Dropdown, Menu } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, MoreOutlined, TeamOutlined } from '@ant-design/icons';
import { Event, EventStatus } from '@/types/event.type';
import dayjs from 'dayjs';

interface EventTableProps {
  events: Event[];
  loading: boolean;
  onView: (event: Event) => void;
  onEdit: (event: Event) => void;
  onDelete: (eventId: number) => void;
  onManageRegistrations: (event: Event) => void;
  getRegistrationBadge?: (eventId: number) => React.ReactNode;
}

const EventTable: React.FC<EventTableProps> = ({ 
  events, 
  loading, 
  onView, 
  onEdit, 
  onDelete, 
  onManageRegistrations,
  getRegistrationBadge
}) => {
  const getStatusTag = (status: EventStatus) => {
    switch (status) {
      case 'active':
        return <Tag color="green">Đang diễn ra</Tag>;
      case 'upcoming':
        return <Tag color="blue">Sắp diễn ra</Tag>;
      case 'expired':
        return <Tag color="gray">Đã kết thúc</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getEventTypeTag = (type: string) => {
    switch (type) {
      case 'TOURNAMENT':
        return <Tag color="volcano">Giải đấu</Tag>;
      case 'DISCOUNT':
        return <Tag color="purple">Khuyến mãi</Tag>;
      default:
        return <Tag color="default">{type}</Tag>;
    }
  };

  const formatDate = (date: string) => {
    return dayjs(date).format('DD/MM/YYYY HH:mm');
  };

  const columns = [
    {
      title: 'Tên sự kiện',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Event) => (
        <Space>
          <span className="font-medium">{text}</span>
          {getRegistrationBadge && record.id !== undefined && getRegistrationBadge(record.id)}
        </Space>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'eventType',
      key: 'eventType',
      render: (type: string) => getEventTypeTag(type)
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Chi tiết',
      key: 'details',
      render: (_: unknown, record: Event) => {
        if (record.eventType === 'TOURNAMENT') {
          return (
            <Space>
              {record.isFreeRegistration ? 
                <Tag color="green">Miễn phí</Tag> : 
                <Tag color="orange">{record.registrationFee?.toLocaleString('vi-VN')} đ</Tag>
              }
              {record.maxParticipants && (
                <Tag color="blue">{record.currentParticipants || 0}/{record.maxParticipants}</Tag>
              )}
            </Space>
          );
        } else if (record.eventType === 'DISCOUNT') {
          return (
            <Space>
              {record.discountType === 'PERCENT' && record.discountPercent && (
                <Tag color="purple">Giảm {record.discountPercent}%</Tag>
              )}
              {record.discountType === 'FIXED_AMOUNT' && record.discountAmount && (
                <Tag color="purple">Giảm {record.discountAmount.toLocaleString('vi-VN')} đ</Tag>
              )}
              {record.discountType === 'FREE_SLOT' && record.freeSlots && (
                <Tag color="purple">Tặng {record.freeSlots} lượt</Tag>
              )}
              {record.targetUserType && (
                <Tag color="cyan">{formatTargetUserType(record.targetUserType)}</Tag>
              )}
            </Space>
          );
        } 
        return null;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: EventStatus) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: Event) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => onView(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => onEdit(record)}
              disabled={record.status === 'expired'}
            />
          </Tooltip>
          <Dropdown
            overlay={
              <Menu>
                {record.eventType === 'TOURNAMENT' && (
                  <Menu.Item 
                    key="registrations" 
                    icon={<TeamOutlined />}
                    onClick={() => onManageRegistrations(record)}
                  >
                    Quản lý đăng ký
                  </Menu.Item>
                )}
                <Menu.Item 
                  key="delete" 
                  icon={<DeleteOutlined />} 
                  danger
                  onClick={() => onDelete(record.id!)}
                >
                  Xóa
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // Format target user type for display
  const formatTargetUserType = (type: string) => {
    switch (type) {
      case 'ALL': return 'Tất cả';
      case 'NEW': return 'Khách mới';
      case 'LOYALTY': return 'Khách VIP';
      case 'CASUAL': return 'Khách thường';
      default: return type;
    }
  };

  return (
    <Table
      columns={columns}
      dataSource={events.map(event => ({ ...event, key: event.id }))}
      loading={loading}
      pagination={{ pageSize: 10 }}
      rowClassName="py-3"
      className="bg-white rounded-lg shadow-sm"
    />
  );
};

export default EventTable; 