import React from 'react';
import { Table, Space, Button, Tag, Tooltip, Modal } from 'antd';
import { EditOutlined, EyeOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Event } from '@/types/event.type';
import { formatDate } from '@/utils/dateUtils';
import type { ColumnsType } from 'antd/es/table';

const { confirm } = Modal;

interface EventTableProps {
  events: Event[];
  loading: boolean;
  onView: (event: Event) => void;
  onEdit: (event: Event) => void;
  onDelete: (eventId: number) => void;
}

const EventTable: React.FC<EventTableProps> = ({
  events,
  loading,
  onView,
  onEdit,
  onDelete
}) => {
  // Helper function để hiển thị trạng thái sự kiện
  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string, text: string }> = {
      active: { color: 'success', text: 'Đang diễn ra' },
      upcoming: { color: 'warning', text: 'Sắp diễn ra' },
      expired: { color: 'error', text: 'Đã kết thúc' }
    };
    
    const statusConfig = config[status] || { color: 'default', text: status };
    return <Tag color={statusConfig.color}>{statusConfig.text}</Tag>;
  };

  // Confirm delete
  const showDeleteConfirm = (event: Event) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa sự kiện này?',
      icon: <ExclamationCircleOutlined />,
      content: `Sự kiện: ${event.name}`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        onDelete(event.id);
      }
    });
  };

  // Table columns
  const columns: ColumnsType<Event> = [
    {
      title: 'Tên sự kiện',
      dataIndex: 'name',
      key: 'name',
      render: (text, event) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-gray-500 text-xs">ID: {event.id}</div>
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (description) => (
        <Tooltip placement="topLeft" title={description}>
          <div className="max-w-[300px] truncate">{description}</div>
        </Tooltip>
      ),
    },
    {
      title: 'Thời gian diễn ra',
      key: 'timeRange',
      render: (_, event) => (
        <div>
          <div>{formatDate(event.startDate)} - </div>
          <div>{formatDate(event.endDate)}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, event) => (
        <Space size="middle">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => onView(event)}
            type="text"
            style={{ color: '#1890ff' }}
            className="hover:bg-blue-50"
          />
          <Button 
            icon={<EditOutlined />} 
            onClick={() => onEdit(event)}
            type="text"
            style={{ color: '#52c41a' }}
            className="hover:bg-green-50"
          />
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() => showDeleteConfirm(event)}
            type="text"
            danger
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={events}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: false,
        showTotal: (total) => `Tổng cộng ${total} sự kiện`
      }}
    />
  );
};

export default EventTable; 