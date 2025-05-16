import React, { useState, useEffect } from 'react';
import { Form, Card, InputNumber, Typography, FormInstance, Row, Col, Empty, Tag, Input, Select, Badge, Button } from 'antd';
import { Service } from '@/types/service.type';
import { BookingFormData } from '@/types/booking.type';
import { SearchOutlined, ShoppingCartOutlined, FilterOutlined } from '@ant-design/icons';
import BookingPaymentSummary from './BookingPaymentSummary';
import { AvailableFieldGroup } from '@/types/field.type';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface BookingStepServicesProps {
  form: FormInstance;
  formData: Partial<BookingFormData>;
  services: Service[];
  fieldGroups?: AvailableFieldGroup[];
  formatCurrency: (amount: number) => string;
  calculateTotalPrice: () => number;
  selectedDates?: dayjs.Dayjs[];
}

interface ServiceCardProps {
  service: Service;
  quantity: number;
  onChange: (serviceId: number, quantity: number) => void;
  disabled?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, quantity, onChange, disabled = false }) => {
  const getServiceTypeName = (type: string | undefined): string => {
    switch (type) {
      case 'rental': return 'Cho thuê';     
      case 'coaching': return 'Huấn luyện';
      case 'equipment': return 'Thiết bị';
      default: return 'Khác';
    }
  };

  const getServiceTypeColor = (type: string | undefined): string => {
    switch (type) {
      case 'rental': return '#1890ff';
      case 'coaching': return '#722ed1';
      case 'equipment': return '#faad14';
      default: return '#f5222d';
    }
  };

  // Chuyển đổi đơn vị hiển thị thân thiện hơn
  const formatUnit = (unit: string | undefined): string => {
    if (!unit) return '';
    
    switch (unit.toLowerCase()) {
      case 'quantity': return 'sản phẩm';
      case 'time': return 'giờ';
      default: return unit;
    }
  };

  return (
    <Card 
      hoverable
      className={`h-full ${disabled ? 'opacity-60' : ''}`}
      style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <Text 
            strong 
            className="text-lg line-clamp-1"
            style={{
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              height: '1.5em',
              marginBottom: '4px',              
            }}
            title={service.name}
          >
            {service.name}
          </Text>
          {service.sport && (
            <Tag color="blue" className="ml-2">
              {service.sport.name}
            </Tag>
          )}
        </div>
        <Badge 
          count={getServiceTypeName(service.type)}
          style={{ 
            backgroundColor: getServiceTypeColor(service.type)
          }}
        />
      </div>

      <Paragraph 
        className="text-gray-500 line-clamp-3"
        style={{ 
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          height: '2em',
          marginBottom: '16px'
        }}
        title={service.description}
      >
        {service.description || "Không có mô tả"}
      </Paragraph>

      <div className="mt-auto">
        <div className="text-blue-600 font-semibold text-lg">
          {service.price.toLocaleString('vi-VN')}đ/{formatUnit(service.unit)}
        </div>
        <div className="flex justify-between items-center mt-2">
          <Text type={service.remain && service.remain > 20 ? "success" : service.remain && service.remain > 5 ? "warning" : "danger"}>
            Còn lại: {service.remain}
          </Text>
          <InputNumber
            min={0}
            max={service.remain}
            value={quantity}
            onChange={(value) => onChange(service.id, value || 0)}
            disabled={disabled || (!!service.remain && service.remain <= 0)}
            addonBefore={<ShoppingCartOutlined />}
            className="w-[120px]"
            size="middle"
          />
        </div>
      </div>
    </Card>
  );
};

const BookingStepServices: React.FC<BookingStepServicesProps> = ({
  form,
  formData,
  services,
  fieldGroups = [],
  formatCurrency,
  calculateTotalPrice,
  selectedDates = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');

  // Lấy services từ form data, nếu không có thì khởi tạo mảng rỗng
  const [selectedServices, setSelectedServices] = useState<{ serviceId: number; quantity: number }[]>(
    formData.services || []
  );

  // Cập nhật form khi component mount
  useEffect(() => {
    if (formData.services) {
      form.setFieldsValue({ services: formData.services });
    }
  }, [form, formData.services]);

  // Các loại dịch vụ
  const serviceTypeOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'rental', label: 'Cho thuê' },
    { value: 'coaching', label: 'Huấn luyện' },
    { value: 'equipment', label: 'Thiết bị' },
    { value: 'other', label: 'Khác' }
  ];

  // Lọc dịch vụ theo tìm kiếm và bộ lọc
  const filteredServices = services.filter(service => {
    const searchMatch = !searchTerm || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const typeMatch = serviceTypeFilter === 'all' || service.type === serviceTypeFilter;
    
    return searchMatch && typeMatch;
  });

  const handleQuantityChange = (serviceId: number, quantity: number) => {
    // Tạo bản sao của selectedServices hiện tại
    const updatedServices = [...selectedServices];
    
    // Tìm index của service trong mảng
    const serviceIndex = updatedServices.findIndex(s => s.serviceId === serviceId);
    
    if (serviceIndex >= 0) {
      // Nếu service đã tồn tại, cập nhật quantity
      if (quantity === 0) {
        // Nếu quantity = 0, xóa service khỏi mảng
        updatedServices.splice(serviceIndex, 1);
      } else {
        updatedServices[serviceIndex].quantity = quantity;
      }
    } else if (quantity > 0) {
      // Nếu service chưa tồn tại và quantity > 0, thêm mới
      updatedServices.push({ serviceId, quantity });
    }

    // Cập nhật state local
    setSelectedServices(updatedServices);
    
    // Cập nhật form value ngay lập tức
    form.setFieldsValue({ services: updatedServices });
  };

  const getServiceQuantity = (serviceId: number): number => {
    const service = selectedServices.find(s => s.serviceId === serviceId);
    return service ? service.quantity : 0;
  };

  // Tính tổng chi phí dịch vụ
  const calculateTotalServiceCost = (): number => {
    if (!Array.isArray(formData.services) || formData.services.length === 0) return 0;
    
    return formData.services.reduce((total, service) => {
      const serviceInfo = services.find(s => s.id === service.serviceId);
      return total + (serviceInfo?.price || 0) * service.quantity;
    }, 0);
  };

  const totalCost = calculateTotalServiceCost();
  const selectedServiceCount = Array.isArray(formData.services) ? formData.services.length : 0;

  const resetFilters = () => {
    setSearchTerm('');
    setServiceTypeFilter('all');
  };

  return (
    <Card className="shadow-md">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div className="flex justify-between items-center flex-wrap mb-4">
            <Title level={5} className="mb-0">Dịch vụ đi kèm</Title>
            
            {selectedServiceCount > 0 && (
              <div className="flex items-center">
                <Badge count={selectedServiceCount} className="mr-2" />
                <Text strong>
                  Tổng chi phí: <span className="text-blue-600">{totalCost.toLocaleString('vi-VN')}đ</span>
                </Text>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder="Tìm kiếm dịch vụ"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Select
                  placeholder="Loại dịch vụ"
                  value={serviceTypeFilter}
                  onChange={value => setServiceTypeFilter(value)}
                  style={{ width: '100%' }}
                  suffixIcon={<FilterOutlined />}
                >
                  {serviceTypeOptions.map(type => (
                    <Option key={type.value} value={type.value}>{type.label}</Option>
                  ))}
                </Select>
              </Col>
              
              <Col xs={24} sm={24} md={8} className="text-right">
                <Button onClick={resetFilters}>Đặt lại bộ lọc</Button>
              </Col>
            </Row>
          </div>
        </Col>
        
        <Col xs={24} md={16}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              services: formData.services || []
            }}
          >
            <Form.Item name="services" style={{ display: 'none' }}>
              <input type="hidden" />
            </Form.Item>
            
            {filteredServices.length === 0 ? (
              <Empty description="Không tìm thấy dịch vụ nào" />
            ) : (
              <Row gutter={[16, 16]}>
                {filteredServices.map(service => (
                  <Col xs={24} sm={12} md={8} key={service.id} className="flex">
                    <ServiceCard
                      service={service}
                      quantity={getServiceQuantity(service.id)}
                      onChange={handleQuantityChange}
                      disabled={service.amount <= 0}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Form>
        </Col>
        
        <Col xs={24} md={8}>
          {/* Payment Summary */}
          <div className="mb-6">
            <BookingPaymentSummary 
              step={3}
              fieldGroup={formData.fieldGroupId ? 
                fieldGroups.find(g => String(g.id) === String(formData.fieldGroupId)) : 
                undefined}
              services={selectedServices}
              allServices={services}
              startTime={formData.timeRange?.[0]?.format('HH:mm:ss')}
              endTime={formData.timeRange?.[1]?.format('HH:mm:ss')}
              selectedDates={selectedDates.length > 0 ? selectedDates : (formData.date ? [formData.date] : [])}
              formatCurrency={formatCurrency}
              calculateTotalPrice={calculateTotalPrice}
            />
          </div>
                   
        </Col>
      </Row>
    </Card>
  );
};

export default BookingStepServices; 