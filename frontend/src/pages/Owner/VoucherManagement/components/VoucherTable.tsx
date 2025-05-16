import React from 'react';
import { Table, Button, Tag, Space, Tooltip, Modal } from 'antd';
import { EditOutlined, EyeOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Voucher } from '@/types/voucher.type';
import { getVoucherStatus, formatDiscountValue, formatDateRange, formatCurrency } from '@/utils/voucherUtils';
import type { ColumnsType } from 'antd/es/table';

const { confirm } = Modal;

interface VoucherTableProps {
  vouchers: Voucher[];
  loading: boolean;
  onView: (voucher: Voucher) => void;
  onEdit: (voucher: Voucher) => void;
  onDelete: (voucherId: number) => void;
}

const VoucherTable: React.FC<VoucherTableProps> = ({ 
  vouchers, 
  loading, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  // Render status tag with appropriate color
  const renderStatus = (record: Voucher) => {
    const status = getVoucherStatus(record.startDate, record.endDate);
    const statusConfig = {
      active: { color: 'green', text: 'Đang diễn ra' },
      upcoming: { color: 'blue', text: 'Sắp diễn ra' },
      expired: { color: 'red', text: 'Đã kết thúc' }
    };
    
    return (
      <Tag color={statusConfig[status].color}>
        {statusConfig[status].text}
      </Tag>
    );
  };

  // Handle delete confirmation
  const showDeleteConfirm = (voucher: Voucher) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa voucher này?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p key="name"><strong>Tên voucher:</strong> {voucher.name}</p>
          <p key="code"><strong>Mã voucher:</strong> {voucher.code}</p>
          <p key="type"><strong>Loại giảm giá:</strong> {voucher.voucherType === 'percent' ? 'Giảm theo %' : 'Giảm theo số tiền'}</p>
          <p key="discount"><strong>Giá trị giảm:</strong> {formatDiscountValue(voucher.voucherType, voucher.discount)}</p>
          <p key="note" className="mt-2 text-red-500">Lưu ý: Hành động này không thể hoàn tác.</p>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        onDelete(voucher.id);
      }
    });
  };

  const columns: ColumnsType<Voucher> = [
    {
      title: 'Tên Voucher',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text: string, record: Voucher) => (
        <div>
          <div key={`name-${record.id}`} className="font-medium text-nowrap overflow-hidden text-ellipsis">{text}</div>
          <div key={`code-${record.id}`} className="text-gray-500 text-nowrap overflow-hidden text-ellipsis">{record.code}</div>
        </div>
      ),
    },
    {
      title: 'Loại giảm giá',
      dataIndex: 'voucherType',
      key: 'voucherType',
      width: 150,
      render: (_: unknown, record: Voucher) => (
        <div>
          <div key={`type-${record.id}`}>{record.voucherType === 'percent' ? 'Giảm theo %' : 'Giảm theo số tiền'}</div>
          <div key={`discount-${record.id}`} className="font-medium">{formatDiscountValue(record.voucherType, record.discount)}</div>
        </div>
      ),
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'minPrice',
      key: 'minPrice',
      width: 120,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Giảm tối đa',
      dataIndex: 'maxDiscount',
      key: 'maxDiscount',
      width: 120,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Số lượng',
      key: 'amount',
      width: 100,
      render: (_: unknown, record: Voucher) => (
        <div>
          <div key={`amount-${record.id}`}>Tổng: <span className="font-medium">{record.amount}</span></div>
          <div key={`remain-${record.id}`}>Còn lại: <span className="font-medium">{record.remain}</span></div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 180,
      render: (record: Voucher) => (
        <div>
          {renderStatus(record)}
          <div key={`date-${record.id}`} className="text-gray-500 mt-1">
            {formatDateRange(record.startDate, record.endDate)}
          </div>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right' as const,
      width: 120,
      render: (_: unknown, record: Voucher) => (
        <Space size="middle">
          <Tooltip key={`view-${record.id}`} title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined style={{ color: '#1890ff' }} />} 
              onClick={() => onView(record)} 
              type="text"
            />
          </Tooltip>
          <Tooltip key={`edit-${record.id}`} title="Chỉnh sửa">
            <Button 
              icon={<EditOutlined style={{ color: '#52c41a' }} />} 
              onClick={() => onEdit(record)} 
              type="text"
            />
          </Tooltip>
          <Tooltip key={`delete-${record.id}`} title="Xóa">
            <Button 
              icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} 
              onClick={() => showDeleteConfirm(record)} 
              type="text" 
              danger
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
        dataSource={vouchers.map(voucher => ({...voucher, key: voucher.id}))}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} voucher`,
        }}
        scroll={{ x: 1100 }}
        bordered
      />
    </div>
  );
};

export default VoucherTable; 