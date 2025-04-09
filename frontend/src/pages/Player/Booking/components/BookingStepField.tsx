import React, { useState } from 'react';
import { Form, Card, Radio, Space, FormInstance, Typography, Divider, Tag, Tooltip, Badge, Empty, Row, Col } from 'antd';
import { FieldGroup } from '@/types/field.type';
import { BookingFormData } from '@/types/booking.type';
import { 
  InfoCircleOutlined, 
  EnvironmentOutlined, TeamOutlined, FieldTimeOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface BookingStepFieldProps {
  form: FormInstance;
  formData: Partial<BookingFormData>;
  fieldGroups: FieldGroup[];
  formatCurrency: (amount: number) => string;
}

const BookingStepField: React.FC<BookingStepFieldProps> = ({
  form,
  formData,
  fieldGroups,
  formatCurrency
}) => {
  const [selectedFieldGroup, setSelectedFieldGroup] = useState<FieldGroup | null>(
    formData.fieldGroupId ? fieldGroups.find(g => String(g.id) === String(formData.fieldGroupId)) || null : null
  );

  const renderPriceInfo = (fieldGroup: FieldGroup) => {
    const prices = [];

    // Base price
    prices.push(
      <div key="base" className="flex justify-between">
        <span>Giá cơ bản:</span>
        <span className="font-medium">{formatCurrency(fieldGroup.basePrice)}/giờ</span>
      </div>
    );

    // Peak time prices
    if (fieldGroup.peakStartTime1 && fieldGroup.peakEndTime1 && fieldGroup.priceIncrease1) {
      prices.push(
        <div key="peak1" className="flex justify-between text-orange-500">
          <span>
            <FieldTimeOutlined className="mr-1" />
            Cao điểm ({fieldGroup.peakStartTime1}-{fieldGroup.peakEndTime1}):
          </span>
          <span className="font-medium">{formatCurrency(fieldGroup.basePrice + fieldGroup.priceIncrease1)}/giờ</span>
        </div>
      );
    }

    if (fieldGroup.peakStartTime2 && fieldGroup.peakEndTime2 && fieldGroup.priceIncrease2) {
      prices.push(
        <div key="peak2" className="flex justify-between text-orange-500">
          <span>
            <FieldTimeOutlined className="mr-1" />
            Cao điểm ({fieldGroup.peakStartTime2}-{fieldGroup.peakEndTime2}):
          </span>
          <span className="font-medium">{formatCurrency(fieldGroup.basePrice + fieldGroup.priceIncrease2)}/giờ</span>
        </div>
      );
    }

    if (fieldGroup.peakStartTime3 && fieldGroup.peakEndTime3 && fieldGroup.priceIncrease3) {
      prices.push(
        <div key="peak3" className="flex justify-between text-orange-500">
          <span>
            <FieldTimeOutlined className="mr-1" />
            Cao điểm ({fieldGroup.peakStartTime3}-{fieldGroup.peakEndTime3}):
          </span>
          <span className="font-medium">{formatCurrency(fieldGroup.basePrice + fieldGroup.priceIncrease3)}/giờ</span>
        </div>
      );
    }

    return (
      <div className="space-y-1 bg-gray-50 p-3 rounded-md mt-2">
        {prices}
      </div>
    );
  };

  const renderFieldList = (fieldGroup: FieldGroup) => {
    if (!fieldGroup.fields || fieldGroup.fields.length === 0) {
      return <Empty description="Không có sân" />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
        {fieldGroup.fields.map(field => (
          <Card 
            key={field.id} 
            size="small" 
            className={`transition-all duration-200 border ${field.status === 'active' ? 'border-green-400' : 'border-red-300'}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <Text strong>{field.name}</Text>
              </div>
              <Badge 
                status={field.status === 'active' ? 'success' : 'error'} 
                text={field.status === 'active' ? 'Khả dụng' : 'Đã đóng'}
              />
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const handleFieldGroupChange = (fieldGroupId: string) => {
    const selected = fieldGroups.find(g => String(g.id) === String(fieldGroupId)) || null;
    setSelectedFieldGroup(selected);
    
    // When changing field group, update form value
    form.setFieldsValue({ fieldGroupId });
  };

  return (
    <Card className="shadow-md">
      {fieldGroups.length === 0 ? (
        <Empty description="Không có sân nào phù hợp" />
      ) : (
        <Form
          form={form}
          layout="vertical"
          initialValues={formData}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Title level={5} className="mb-4">Chọn loại sân</Title>
              <Form.Item
                name="fieldGroupId"
                rules={[{ required: true, message: 'Vui lòng chọn loại sân' }]}
              >
                <Radio.Group 
                  className="w-full"
                  onChange={(e) => handleFieldGroupChange(e.target.value)}
                >
                  <Space direction="vertical" className="w-full">
                    {fieldGroups.map(group => (
                      <Radio key={group.id} value={group.id} className="w-full">
                        <Card 
                          className={`w-full mb-2 cursor-pointer hover:bg-gray-50 transition-all ${
                            selectedFieldGroup && String(selectedFieldGroup.id) === String(group.id) 
                              ? 'border-blue-500 shadow-sm' 
                              : 'border-gray-200'
                          }`}
                          bodyStyle={{ padding: '12px' }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <Text strong className="text-lg">{group.name}</Text>
                              <div className="text-sm text-gray-600 mt-1">
                                <div className="flex items-center">
                                  <EnvironmentOutlined className="mr-1" />
                                  <span>Kích thước: {group.dimension}</span>
                                </div>
                                <div className="flex items-center mt-1">
                                  <TeamOutlined className="mr-1" />
                                  <span>Bề mặt: {group.surface}</span>
                                </div>
                              </div>
                              <div className="mt-2">
                                {group.sports && group.sports.map(sport => (
                                  <Tag color="blue" key={sport.id}>{sport.name}</Tag>
                                ))}
                              </div>
                            </div>
                            <div className="text-right min-w-[100px]">
                              <div className="text-lg text-blue-600 font-semibold">
                                {formatCurrency(group.basePrice)}/giờ
                              </div>
                              <Tooltip 
                                title="Xem chi tiết giá" 
                                className="cursor-help text-blue-500 mt-1 inline-block"
                              >
                                <InfoCircleOutlined /> Chi tiết giá
                              </Tooltip>
                            </div>
                          </div>
                        </Card>
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              {selectedFieldGroup && (
                <div className="bg-gray-50 p-4 rounded-lg h-full">
                  <Title level={5}>Thông tin chi tiết</Title>
                  <Paragraph className="mb-4">
                    <strong>{selectedFieldGroup.name}</strong> - Xem chi tiết các sân có thể sử dụng
                  </Paragraph>
                  
                  {renderPriceInfo(selectedFieldGroup)}
                  
                  <Divider />
                  
                  <Title level={5}>Danh sách sân</Title>
                  {renderFieldList(selectedFieldGroup)}
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <Text type="secondary">
                      <InfoCircleOutlined className="mr-2" />
                      Sân sẽ được tự động phân bổ dựa trên lịch đặt hiện tại khi xác nhận đặt sân
                    </Text>
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </Form>
      )}
    </Card>
  );
};

export default BookingStepField; 