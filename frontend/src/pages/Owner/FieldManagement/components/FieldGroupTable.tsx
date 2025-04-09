import React from 'react';
import { Table, Space, Button, Tooltip, Tag, Typography, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { FieldGroup, Field } from '@/types/field.type';
import { getStatusTag, formatPrice, formatTime } from '@/utils/statusUtils';
import { getSportNameInVietnamese } from '@/utils/translateSport';

const { Text } = Typography;

interface FieldGroupTableProps {
  fieldGroups: FieldGroup[];
  onViewFieldGroup: (id: string) => void;
  onEditFieldGroup: (id: string) => void;
  onDeleteFieldGroup: (id: string) => void;
  onAddField: (fieldGroupId: string) => void;
  onToggleFieldStatus: (fieldGroupId: string, fieldId: string, status: 'active' | 'closed') => void;
  onDeleteField: (fieldGroupId: string, fieldId: string) => void;
}

const FieldGroupTable: React.FC<FieldGroupTableProps> = ({
  fieldGroups,
  onViewFieldGroup,
  onEditFieldGroup,
  onDeleteFieldGroup,
  onAddField,
  onToggleFieldStatus,
  onDeleteField
}) => {
  // Render peak time information
  const renderPeakTimes = (fieldGroup: FieldGroup) => {
    const peakTimes = [];
    
    if (fieldGroup.peakStartTime1 && fieldGroup.peakEndTime1) {
      peakTimes.push(
        <div key="peak1">
          {formatTime(fieldGroup.peakStartTime1)} - {formatTime(fieldGroup.peakEndTime1)}: {formatPrice(fieldGroup.priceIncrease1)}
        </div>
      );
    }
    
    if (fieldGroup.peakStartTime2 && fieldGroup.peakEndTime2 && fieldGroup.priceIncrease2) {
      peakTimes.push(
        <div key="peak2">
          {formatTime(fieldGroup.peakStartTime2)} - {formatTime(fieldGroup.peakEndTime2)}: {formatPrice(fieldGroup.priceIncrease2)}
        </div>
      );
    }
    
    if (fieldGroup.peakStartTime3 && fieldGroup.peakEndTime3 && fieldGroup.priceIncrease3) {
      peakTimes.push(
        <div key="peak3">
          {formatTime(fieldGroup.peakStartTime3)} - {formatTime(fieldGroup.peakEndTime3)}: {formatPrice(fieldGroup.priceIncrease3)}
        </div>
      );
    }
    
    if (peakTimes.length === 0) {
      return <span>-</span>;
    }
    
    // Display dropdown with peak times
    return (
      <Dropdown
        menu={{
          items: peakTimes.map((time, index) => ({
            key: `peak-${index}`,
            label: <div>{time}</div>,
          })),
        }}
        placement="bottomLeft"
        arrow
      >
        <Button type="link" style={{ padding: '0', height: 'auto' }}>
          {peakTimes[0]} <span style={{ color: '#1890ff', fontWeight: 'bold' }}>[{peakTimes.length}]</span>
        </Button>
      </Dropdown>
    );
  };

  // Render sports information
  const renderSports = (fieldGroup: FieldGroup) => {
    const sports = fieldGroup.sports;
    
    if (sports.length === 0) {
      return <span>-</span>;
    }
    
    if (sports.length === 1) {
      return (
        <Tag 
          color="blue" 
          style={{ margin: '2px', borderRadius: '4px', padding: '2px 8px' }}
        >
          {getSportNameInVietnamese(sports[0].name)}
        </Tag>
      );
    }
    
    // Display dropdown for multiple sports
    return (
      <Dropdown
        menu={{
          items: sports.map(sport => ({
            key: `sport-${sport.id}`,
            label: (
              <Tag 
                color="blue" 
                style={{ margin: '2px', borderRadius: '4px', padding: '2px 8px' }}
              >
                {getSportNameInVietnamese(sport.name)}
              </Tag>
            ),
          })),
        }}
        placement="bottomLeft"
        arrow
      >
        <Button type="link" style={{ padding: '0', height: 'auto' }}>
          <Tag 
            color="purple" 
            style={{ margin: '2px', borderRadius: '4px', padding: '2px 8px' }}
          >
            Tổng hợp <span style={{ color: 'purple', fontWeight: 'bold', marginLeft: '4px' }}>[{sports.length}]</span>
          </Tag>
        </Button>
      </Dropdown>
    );
  };

  // Columns for main table
  const columns = [
    {
      title: 'Tên nhóm sân',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Kích thước',
      dataIndex: 'dimension',
      key: 'dimension',
    },
    {
      title: 'Mặt sân',
      dataIndex: 'surface',
      key: 'surface',
    },
    {
      title: 'Giá sân',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (price: number) => formatPrice(price),
    },
    {
      title: 'Giờ cao điểm',
      key: 'peakTimes',
      render: (record: FieldGroup) => renderPeakTimes(record),
    },
    {
      title: 'Loại hình sân',
      key: 'sports',
      render: (record: FieldGroup) => renderSports(record),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (record: FieldGroup) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined style={{ color: '#1890ff' }} />} 
              onClick={(e) => {
                e.stopPropagation();
                onViewFieldGroup(record.id);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: '#52c41a' }} />} 
              onClick={(e) => {
                e.stopPropagation();
                onEditFieldGroup(record.id);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} 
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFieldGroup(record.id);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Define the expandable row rendering
  const expandedRowRender = (record: FieldGroup) => {
    const fieldColumns = [
      { 
        title: 'Tên sân', 
        dataIndex: 'name', 
        key: 'name' 
      },
      { 
        title: 'Trạng thái', 
        dataIndex: 'status', 
        key: 'status',
        render: (status: string) => getStatusTag(status),
      },
      {
        title: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Thao tác</span>
            <Button 
              type="primary" 
              size="small"
              icon={<PlusCircleOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                onAddField(record.id);
              }}
            >
              Thêm sân
            </Button>
          </div>
        ),
        key: 'action',
        render: (text: string, field: Field) => (
          <Space>
            <Button 
              type={field.status === 'active' ? 'default' : 'primary'} 
              size="small"
              danger={field.status === 'active'}
              style={{ width: '100px' }}
              onClick={() => onToggleFieldStatus(record.id, field.id, field.status)}
            >
              {field.status === 'active' ? 'Đóng sân' : 'Mở sân'}
            </Button>
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              style={{ width: '100px' }}
              onClick={() => onDeleteField(record.id, field.id)}
            >
              Xóa sân
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <Table 
        columns={fieldColumns} 
        dataSource={record.fields} 
        pagination={false} 
        rowKey="id"
      />
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table
        columns={columns}
        dataSource={fieldGroups}
        rowKey="id"
        expandable={{
          expandedRowRender,
          expandRowByClick: true,
        }}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1100 }}
      />
    </div>
  );
};

export default FieldGroupTable; 