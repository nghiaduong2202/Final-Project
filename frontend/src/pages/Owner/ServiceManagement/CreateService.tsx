import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Select, InputNumber, Card, Typography, Space, Divider, List, Tag, Modal, message } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { ServiceFormData, ServiceType, ServiceApiRequest } from '@/types/service.type';
import { facilityService } from '@/services/facility.service';
import { FacilityDropdownItem } from '@/services/facility.service';
import { Sport } from '@/types/sport.type';
import { serviceService } from '@/services/service.service';
import { getSportNameInVietnamese } from '@/utils/translateSport';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface CreateServiceProps {
  onCancel?: () => void;
  onSubmit?: (data: ServiceFormData[]) => void;
}

// Định nghĩa interface mở rộng cho Facility bao gồm trường sports
interface ExtendedFacility extends FacilityDropdownItem {
  sports?: Sport[];
}

const CreateService: React.FC<CreateServiceProps> = ({ onCancel, onSubmit }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // Local state
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [servicesList, setServicesList] = useState<ServiceFormData[]>([]);
  const [facilities, setFacilities] = useState<ExtendedFacility[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch facilities khi component mount
  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      try {
        const facilitiesData = await facilityService.getFacilitiesDropdown();
        console.log('Fetched facilities data:', facilitiesData); // Debug log
        setFacilities(facilitiesData);
      } catch (error) {
        console.error('Error fetching facilities:', error);
        message.error('Không thể tải danh sách cơ sở. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFacilities();
  }, []);

  // Handle facility selection và set sports
  const handleFacilitySelect = (value: string) => {
    setSelectedFacilityId(value);
    form.resetFields(['sportId']); // Reset sport field
    
    // Tìm facility được chọn
    const selectedFacility = facilities.find(facility => facility.id === value);
    
    if (selectedFacility && selectedFacility.sports && selectedFacility.sports.length > 0) {
      console.log('Setting sports from selected facility:', selectedFacility.sports);
      setSports(selectedFacility.sports);
    } else {
      console.log('No sports found in the selected facility');
      setSports([]);
      message.warning('Cơ sở này chưa có thông tin về các loại hình thể thao.');
    }
  };

  // Add service to the list
  const handleAddService = () => {
    form.validateFields().then(values => {
      const newService: ServiceFormData = {
        facilityId: selectedFacilityId,
        name: values.name,
        price: values.price,
        description: values.description,
        amount: values.amount,
        sportId: values.sportId,
        unit: values.unit,
        type: values.type
      };
      
      setServicesList(prev => [...prev, newService]);
      
      // Reset form fields except facility and sport
      form.setFieldsValue({
        name: '',
        price: null,
        description: '',
        amount: null,
        unit: undefined,
        type: undefined
      });
    });
  };

  // Remove service from the list
  const handleRemoveService = (index: number) => {
    setServicesList(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedFacilityId) {
      Modal.error({
        title: 'Chưa chọn cơ sở',
        content: 'Vui lòng chọn cơ sở trước khi lưu'
      });
      return;
    }

    if (servicesList.length === 0) {
      Modal.error({
        title: 'Chưa có dịch vụ',
        content: 'Vui lòng thêm ít nhất một dịch vụ'
      });
      return;
    }

    setSubmitting(true);
    
    try {
      // Chuyển đổi sang định dạng API
      const apiRequest: ServiceApiRequest[] = servicesList.map(service => ({
        name: service.name,
        price: service.price,
        description: service.description,
        amount: service.amount,
        sportId: service.sportId,
        unit: service.unit,
        type: service.type
      }));
      
      // Gọi API để tạo dịch vụ
      await serviceService.createServices(selectedFacilityId, apiRequest);
      
      // Thông báo thành công
      message.success(`Đã tạo ${servicesList.length} dịch vụ mới cho cơ sở`);
      
      // Chuyển hướng hoặc callback
      if (onSubmit) {
        onSubmit(servicesList);
      } else {
        navigate('/owner/service-management');
      }
    } catch (error) {
      console.error('Error creating services:', error);
      message.error('Không thể tạo dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/owner/service-management');
    }
  };

  // Get sport name by ID
  const getSportName = (sportId: number) => {
    const sport = sports.find(s => s.id === sportId);
    return sport ? getSportNameInVietnamese(sport.name) : 'Không xác định';
  };

  // Helper function để hiển thị loại dịch vụ
  const getServiceTypeTag = (type: ServiceType) => {
    const config: Record<ServiceType, { color: string, text: string }> = {
      rental: { color: 'blue', text: 'Cho thuê' },
      coaching: { color: 'purple', text: 'Huấn luyện' },
      equipment: { color: 'cyan', text: 'Thiết bị' },
      food: { color: 'green', text: 'Đồ uống/Thực phẩm' },
      other: { color: 'gray', text: 'Khác' },
    };
    return <Tag color={config[type].color}>{config[type].text}</Tag>;
  };

  return (
    <div className="p-6 md:p-8">
      <Card className="mb-8">
        <div className="flex justify-between items-center mb-6">
        
          <Space size="middle">  
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/owner/service-management')}
            type="text"
          />          
            <Title level={3} style={{ margin: 0 }}>Tạo dịch vụ mới</Title>
          </Space>
          
          <Button 
            type="primary" 
            onClick={handleSubmit}
            loading={submitting}
            disabled={servicesList.length === 0}
          >
            Lưu dịch vụ
          </Button>
        </div>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="facilityId"
            label="Cơ sở áp dụng"
            rules={[{ required: true, message: 'Vui lòng chọn cơ sở' }]}
          >
            <Select
              placeholder="Chọn cơ sở của bạn"
              onChange={handleFacilitySelect}
              disabled={submitting || loading}
              loading={loading}
            >
              {facilities.map((facility) => (
                <Option key={facility.id} value={facility.id}>
                  {facility.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedFacilityId && (
            <>
              <Form.Item
                name="sportId"
                label="Loại hình thể thao"
                rules={[{ required: true, message: 'Vui lòng chọn loại hình thể thao' }]}
              >
                <Select 
                  placeholder="Chọn loại hình thể thao" 
                  disabled={submitting || loading}
                  loading={loading}
                  optionLabelProp="label"
                  style={{ width: '100%' }}
                  popupMatchSelectWidth={false}
                >
                  {sports.map((sport) => (
                    <Option 
                      key={sport.id} 
                      value={sport.id} 
                      label={getSportNameInVietnamese(sport.name)}
                    >
                      <div style={{ minWidth: '120px' }}>{getSportNameInVietnamese(sport.name)}</div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="name"
                label="Tên dịch vụ"
                rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ' }]}
              >
                <Input placeholder="Nhập tên dịch vụ" disabled={submitting} />
              </Form.Item>

              <Form.Item
                name="type"
                label="Loại dịch vụ"
                rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ' }]}
              >
                <Select placeholder="Chọn loại dịch vụ" disabled={submitting}>
                  <Option value="rental">Cho thuê</Option>
                  <Option value="coaching">Huấn luyện</Option>
                  <Option value="equipment">Thiết bị</Option>
                  <Option value="food">Đồ uống/Thực phẩm</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả dịch vụ"
              >
                <TextArea 
                  placeholder="Nhập mô tả chi tiết về dịch vụ" 
                  rows={3} 
                  disabled={submitting}
                />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="price"
                  label="Giá dịch vụ"
                  className="flex-1"
                  rules={[{ required: true, message: 'Vui lòng nhập giá dịch vụ' }]}
                >
                  <InputNumber
                    min={0}
                    placeholder="Nhập giá dịch vụ"
                    addonAfter="đ"
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={(value: string | undefined) => {
                      if (!value) return 0;
                      return Number(value.replace(/\./g, ''));
                    }}
                    disabled={submitting}
                  />
                </Form.Item>

                <Form.Item
                  name="unit"
                  label="Đơn vị tính"
                  rules={[{ required: true, message: 'Vui lòng nhập đơn vị tính' }]}
                >
                  <Select placeholder="Chọn đơn vị tính" disabled={submitting}>
                    <Option value="giờ">Giờ</Option>
                    <Option value="ngày">Ngày</Option>
                    <Option value="buổi">Buổi</Option>
                    <Option value="chai">Chai</Option>
                    <Option value="cái">Cái</Option>
                    <Option value="bộ">Bộ</Option>
                  </Select>
                </Form.Item>
              </div>

              <Form.Item
                name="amount"
                label="Số lượng"
                className="flex-1"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
              >
                <InputNumber
                  min={0}
                  placeholder="Nhập số lượng"
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(value: string | undefined) => {
                    if (!value) return 0;
                    return Number(value.replace(/\./g, ''));
                  }}
                  disabled={submitting}
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="dashed" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddService}
                  disabled={submitting}
                  block
                >
                  Thêm dịch vụ vào danh sách
                </Button>
              </Form.Item>
            </>
          )}
        </Form>

        {servicesList.length > 0 && (
          <div className="mt-8">
            <Divider orientation="left">
              <Text strong>Danh sách dịch vụ đã thêm</Text>
            </Divider>
            
            <div className="overflow-x-auto">
              <List
                itemLayout="horizontal"
                dataSource={servicesList}
                renderItem={(service, index) => (
                  <List.Item
                    actions={[
                      <Button 
                        key="delete" 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveService(index)}
                        disabled={submitting}
                      >
                        Xóa
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={service.name}
                      description={
                        <Space direction="vertical" size={1}>
                          <div className="flex gap-1 mt-1">
                            <Tag color="blue">{getSportName(service.sportId)}</Tag>
                            {service.type && getServiceTypeTag(service.type)}
                          </div>
                          <Text type="secondary">Giá: {service.price.toLocaleString()} đ/{service.unit}</Text>
                          <Text type="secondary">Số lượng: {service.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</Text>
                          {service.description && <Text type="secondary">Mô tả: {service.description}</Text>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                style={{ minWidth: '600px' }}
              />
            </div>
            
            <div className="flex justify-end mt-6">
              <Space>
                <Button onClick={handleCancel} disabled={submitting}>
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  onClick={handleSubmit}
                  loading={submitting}
                >
                  Lưu dịch vụ ({servicesList.length})
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CreateService;