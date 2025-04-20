import React from 'react';
import { Table, Space, Button, Tooltip, Tag, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Service, ServiceType, UnitEnum } from '@/types/service.type';
import { formatPrice } from '@/utils/statusUtils';
import { getSportNameInVietnamese } from '@/utils/translateSport';

const { Text } = Typography;

interface ServiceTableProps {
  services: Service[];
  loading: boolean;
  onDelete: (serviceId: string) => void;
  onView: (service: Service) => void;
  onEdit: (service: Service) => void;
  pagination: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
    showSizeChanger: boolean;
  };
}

const ServiceTable: React.FC<ServiceTableProps> = ({
  services,
  loading,
  onDelete,
  onView,
  onEdit,
  pagination
}) => {
  // Helper function để hiển thị loại dịch vụ
  const getServiceTypeTag = (type: string) => {
    const config: Record<string, { color: string, text: string }> = {
      rental: { color: 'blue', text: 'Cho thuê' },
      coaching: { color: 'purple', text: 'Huấn luyện' },
      equipment: { color: 'cyan', text: 'Thiết bị' },
      other: { color: 'gray', text: 'Khác' },
    };
    const typeConfig = config[type] || { color: 'default', text: type };
    return <Tag color={typeConfig.color}>{typeConfig.text}</Tag>;
  };

  // Helper function to display unit
  const displayUnit = (unit: string | UnitEnum | undefined) => {
    if (!unit) return '';
    
    if (unit === UnitEnum.TIME) {
      return 'giờ';
    } else if (unit === UnitEnum.QUANTITY) {
      return 'sản phẩm';
    } 
    
    return unit;
  };

  // Table columns
  const columns = [
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Loại hình',
      dataIndex: ['sport', 'name'],
      key: 'sport',
      render: (text: string) => (
        <Tag color="blue" style={{ borderRadius: '4px', padding: '2px 8px' }}>
          {text ? getSportNameInVietnamese(text) : 'Không xác định'}
        </Tag>
      ),
    },
    {
      title: 'Loại dịch vụ',
      dataIndex: 'type',
      key: 'type',
      render: (type: ServiceType) => getServiceTypeTag(type),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number, record: Service) => (
        <div>
          {formatPrice(price)}/{displayUnit(record.unit)}
        </div>
      ),
    },
    {
      title: 'Số lượng',
      key: 'inventory',
      render: (record: Service) => (
        <div>
          <div>Tổng: {record.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</div>
          {record.bookedCount && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              Đã đặt: {record.bookedCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: Service) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              onClick={() => onView(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#52c41a' }} />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
              onClick={() => onDelete(record.id.toString())}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <Table
        columns={columns}
        dataSource={services}
        rowKey="id"
        pagination={pagination}
        loading={loading}
        scroll={{ x: 1100 }}
      />
    </div>
  );
};

export default ServiceTable; 