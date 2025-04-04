import React from 'react';
import { Modal, Typography, Row, Col, Card, Tag, Table } from 'antd';
import { FieldGroup } from '@/types/field.type';
import { getStatusTag, formatPrice, formatTime } from '@/utils/statusUtils';
import { getSportNameInVietnamese } from '@/utils/translateSport';

const { Title, Text } = Typography;

interface FieldGroupDetailProps {
  open: boolean;
  onClose: () => void;
  fieldGroup: FieldGroup | null;
}

const FieldGroupDetail: React.FC<FieldGroupDetailProps> = ({ open, onClose, fieldGroup }) => {
  if (!fieldGroup) return null;

  // Columns for the fields table
  const columns = [
    { 
      title: 'Tên sân', 
      dataIndex: 'name', 
      key: 'name',
      width: '70%'
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      width: '30%',
      align: 'right' as const,
      render: (status: string) => getStatusTag(status),
    }
  ];

  // Render peak times
  const renderPeakTimes = () => {
    const peakTimes = [];
    
    if (fieldGroup?.peakStartTime1 && fieldGroup?.peakEndTime1) {
      peakTimes.push(
        <Row key="peak1" className="mb-2 p-2 bg-gray-50 rounded">
          <Col span={16}>
            <Text strong>{formatTime(fieldGroup.peakStartTime1)} - {formatTime(fieldGroup.peakEndTime1)}</Text>
          </Col>
          <Col span={8} className="text-right">
            <Text type="success">+{formatPrice(fieldGroup.priceIncrease1)}</Text>
          </Col>
        </Row>
      );
    }
    
    if (fieldGroup?.peakStartTime2 && fieldGroup?.peakEndTime2 && fieldGroup?.priceIncrease2) {
      peakTimes.push(
        <Row key="peak2" className="mb-2 p-2 bg-gray-50 rounded">
          <Col span={16}>
            <Text strong>{formatTime(fieldGroup.peakStartTime2)} - {formatTime(fieldGroup.peakEndTime2)}</Text>
          </Col>
          <Col span={8} className="text-right">
            <Text type="success">+{formatPrice(fieldGroup.priceIncrease2)}</Text>
          </Col>
        </Row>
      );
    }
    
    if (fieldGroup?.peakStartTime3 && fieldGroup?.peakEndTime3 && fieldGroup?.priceIncrease3) {
      peakTimes.push(
        <Row key="peak3" className="mb-2 p-2 bg-gray-50 rounded">
          <Col span={16}>
            <Text strong>{formatTime(fieldGroup.peakStartTime3)} - {formatTime(fieldGroup.peakEndTime3)}</Text>
          </Col>
          <Col span={8} className="text-right">
            <Text type="success">+{formatPrice(fieldGroup.priceIncrease3)}</Text>
          </Col>
        </Row>
      );
    }
    
    if (peakTimes.length === 0) {
      return <Text type="secondary">Không có giờ cao điểm</Text>;
    }
    
    return peakTimes;
  };

  return (
    <Modal
      title={<Title level={4}>Chi tiết nhóm sân: {fieldGroup.name}</Title>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{ top: 20 }}
      styles={{ 
        body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }
      }}
    >
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div className="mb-4">
              <Text strong className="block mb-1">Kích thước:</Text>
              <Text>{fieldGroup.dimension}</Text>
            </div>
            
            <div className="mb-4">
              <Text strong className="block mb-1">Mặt sân:</Text>
              <Text>{fieldGroup.surface}</Text>
            </div>
            
            <div className="mb-4">
              <Text strong className="block mb-1">Giá sân cơ bản:</Text>
              <Text className="text-lg font-semibold text-blue-600">{formatPrice(fieldGroup.basePrice)}</Text>
            </div>
          </Col>
          
          <Col span={12}>
            <div className="mb-4">
              <Text strong className="block mb-1">Loại hình sân:</Text>
              <div className="mt-1">
                {fieldGroup.sports.map(sport => (
                  <Tag 
                    key={sport.id}
                    color="blue" 
                    style={{ margin: '2px', borderRadius: '4px', padding: '4px 10px' }}
                  >
                    {getSportNameInVietnamese(sport.name)}
                  </Tag>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Card className="mb-4">
        <Row className="mb-2" justify="space-between" align="middle">
          <Col>
            <Title level={5} style={{ margin: 0 }}>
              Giờ cao điểm 
              {fieldGroup.peakStartTime1 && (
                <span style={{ color: '#1890ff', fontSize: '14px', marginLeft: '8px' }}>
                  [{
                    [
                      fieldGroup.peakStartTime1, 
                      fieldGroup.peakStartTime2, 
                      fieldGroup.peakStartTime3
                    ].filter(Boolean).length
                  }]
                </span>
              )}
            </Title>
          </Col>
        </Row>
        <div className="mt-3">
          {renderPeakTimes()}
        </div>
      </Card>

      <Card>
        <Row className="mb-2" justify="space-between" align="middle">
          <Col>
            <Title level={5} style={{ margin: 0 }}>Danh sách sân ({fieldGroup.fields.length})</Title>
          </Col>
        </Row>
        <Table 
          columns={columns} 
          dataSource={fieldGroup.fields} 
          pagination={false} 
          rowKey="id"
          className="mt-3"
          size="middle"
          bordered={false}
        />
      </Card>
    </Modal>
  );
};

export default FieldGroupDetail; 