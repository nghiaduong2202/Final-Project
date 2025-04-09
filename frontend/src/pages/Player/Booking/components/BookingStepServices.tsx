import React, { useState } from 'react';
import { Form, Card, InputNumber, Typography, FormInstance, Row, Col, Divider, Empty, Tag, Input, Select, Badge, Button } from 'antd';
import { Service } from '@/types/service.type';
import { BookingFormData } from '@/types/booking.type';
import { SearchOutlined, ShoppingCartOutlined, TagOutlined, FilterOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface BookingStepServicesProps {
  form: FormInstance;
  formData: Partial<BookingFormData>;
  services: Service[];
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
      case 'food': return 'Thức ăn';
      case 'coaching': return 'Huấn luyện';
      case 'equipment': return 'Thiết bị';
      default: return 'Khác';
    }
  };

  const getServiceTypeColor = (type: string | undefined): string => {
    switch (type) {
      case 'rental': return '#1890ff';
      case 'food': return '#52c41a';
      case 'coaching': return '#722ed1';
      case 'equipment': return '#faad14';
      default: return '#f5222d';
    }
  };

  return (
    <Card 
      hoverable
      className={`h-full ${disabled ? 'opacity-60' : ''}`}
      bodyStyle={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <Text strong className="text-lg">{service.name}</Text>
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

      <Paragraph className="text-gray-500 flex-grow">
        {service.description}
      </Paragraph>

      <div className="mt-2">
        <div className="text-blue-600 font-semibold text-lg">
          {service.price.toLocaleString('vi-VN')}đ/{service.unit}
        </div>
        <div className="flex justify-between items-center mt-2">
          <Text type={service.amount > 20 ? "success" : service.amount > 5 ? "warning" : "danger"}>
            Còn lại: {service.amount}
          </Text>
          <InputNumber
            min={0}
            max={service.amount}
            value={quantity}
            onChange={(value) => onChange(service.id, value || 0)}
            disabled={disabled || service.amount <= 0}
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
  services
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');
  const [sportFilter, setSportFilter] = useState<string>('all');

  // Tất cả các loại thể thao từ danh sách dịch vụ
  const sportOptions = Array.from(
    new Set(
      services
        .filter(s => s.sport)
        .map(s => JSON.stringify({ id: s.sport.id, name: s.sport.name }))
    )
  ).map(sport => JSON.parse(sport));

  // Các loại dịch vụ
  const serviceTypeOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'rental', label: 'Cho thuê' },
    { value: 'food', label: 'Thức ăn' },
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
    
    const sportMatch = sportFilter === 'all' || 
      (service.sport && service.sport.id.toString() === sportFilter);
    
    return searchMatch && typeMatch && sportMatch;
  });

  // Lấy số lượng đã chọn cho mỗi dịch vụ
  const getServiceQuantity = (serviceId: number): number => {
    if (!Array.isArray(formData.services)) return 0;
    const service = formData.services.find(s => s.serviceId === serviceId);
    return service ? service.quantity : 0;
  };

  // Cập nhật số lượng dịch vụ
  const handleQuantityChange = (serviceId: number, quantity: number) => {
    const currentServices = Array.isArray(form.getFieldValue('services')) ? 
      form.getFieldValue('services') : [];
    
    const updatedServices = currentServices.filter(
      (s: { serviceId: number }) => s.serviceId !== serviceId
    );
    
    if (quantity > 0) {
      updatedServices.push({ serviceId, quantity });
    }
    
    form.setFieldsValue({ services: updatedServices });
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
    setSportFilter('all');
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
              <Col xs={24} sm={8} md={6}>
                <Input
                  placeholder="Tìm kiếm dịch vụ"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Col>
              
              <Col xs={24} sm={8} md={6}>
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
              
              <Col xs={24} sm={8} md={6}>
                <Select
                  placeholder="Loại thể thao"
                  value={sportFilter}
                  onChange={value => setSportFilter(value)}
                  style={{ width: '100%' }}
                  suffixIcon={<TagOutlined />}
                >
                  <Option value="all">Tất cả thể thao</Option>
                  {sportOptions.map((sport) => (
                    <Option key={sport.id} value={sport.id.toString()}>{sport.name}</Option>
                  ))}
                </Select>
              </Col>
              
              <Col xs={24} sm={24} md={6} className="text-right">
                <Button onClick={resetFilters}>Đặt lại bộ lọc</Button>
              </Col>
            </Row>
          </div>
        </Col>
        
        <Col span={24}>
          <Form
            form={form}
            layout="vertical"
            initialValues={formData}
          >
            <Form.Item name="services" hidden>
              <Input />
            </Form.Item>
            
            {filteredServices.length === 0 ? (
              <Empty description="Không tìm thấy dịch vụ nào" />
            ) : (
              <Row gutter={[16, 16]}>
                {filteredServices.map(service => (
                  <Col xs={24} sm={12} md={8} lg={6} key={service.id}>
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
        
        {selectedServiceCount > 0 && (
          <Col span={24}>
            <Divider />
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <Text strong>Bạn đã chọn {selectedServiceCount} dịch vụ</Text>
                  <div className="text-gray-500 text-sm">
                    Bạn có thể điều chỉnh số lượng bất kỳ lúc nào
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-600">Tổng chi phí:</div>
                  <div className="text-xl font-bold text-blue-600">
                    {totalCost.toLocaleString('vi-VN')}đ
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default BookingStepServices; 