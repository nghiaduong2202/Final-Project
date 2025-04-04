import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Select, InputNumber, Card, Typography, Space, Divider, List, Tag, Modal, DatePicker, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { EventFormData, EventType } from '@/types/event.type';
import { mockFacilitiesDropdown } from '@/mocks/facility/mockFacilities';
import { mockEventTypes } from '@/mocks/event/eventData';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// Local storage key
const SELECTED_FACILITY_KEY = 'owner_selected_facility_id';

// Mock sports data
const mockSports = [
  { id: 1, name: 'Bóng đá' },
  { id: 2, name: 'Bóng rổ' },
  { id: 3, name: 'Tennis' },
  { id: 4, name: 'Cầu lông' }
];

interface CreateEventProps {
  onCancel?: () => void;
  onSubmit?: (data: EventFormData[]) => void;
}

const CreateEvent: React.FC<CreateEventProps> = ({ onCancel, onSubmit }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // Local state
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [selectedEventType, setSelectedEventType] = useState<EventType | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [eventsList, setEventsList] = useState<EventFormData[]>([]);
  
  // Fetch initial facility from localStorage
  useEffect(() => {
    const savedFacilityId = localStorage.getItem(SELECTED_FACILITY_KEY);
    if (savedFacilityId) {
      setSelectedFacilityId(savedFacilityId);
      form.setFieldsValue({ facilityId: savedFacilityId });
    }
  }, [form]);
  
  // Handle facility selection
  const handleFacilitySelect = (value: string) => {
    setSelectedFacilityId(value);
    localStorage.setItem(SELECTED_FACILITY_KEY, value);
  };

  // Handle event type change
  const handleEventTypeChange = (value: EventType) => {
    setSelectedEventType(value);
    // Reset specific fields when event type changes
    form.setFieldsValue({
      targetSportId: undefined,
      fields: undefined,
      maxParticipants: undefined,
      registrationEndDate: undefined,
      prizes: undefined,
      discountPercent: undefined,
      conditions: undefined,
      minBookingValue: undefined,
      activities: undefined,
      specialServices: undefined
    });
  };

  // Add event to the list
  const handleAddEvent = () => {
    form.validateFields().then(values => {
      const newEvent: EventFormData = {
        name: values.name,
        description: values.description,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        status: values.status || 'upcoming',
        facilityId: selectedFacilityId,
        eventType: values.eventType,
        // Add type-specific fields
        ...(values.eventType === 'TOURNAMENT' && {
          targetSportId: values.targetSportId,
          fields: values.fields,
          maxParticipants: values.maxParticipants,
          registrationEndDate: values.registrationEndDate?.toISOString(),
          prizes: values.prizes
        }),
        ...(values.eventType === 'DISCOUNT' && {
          discountPercent: values.discountPercent,
          conditions: values.conditions,
          minBookingValue: values.minBookingValue
        }),
        ...(values.eventType === 'SPECIAL_OFFER' && {
          activities: values.activities,
          specialServices: values.specialServices
        })
      };
      
      setEventsList(prev => [...prev, newEvent]);
      
      // Reset form fields except facility
      form.setFieldsValue({
        name: '',
        description: '',
        dateRange: undefined,
        eventType: undefined,
        status: 'upcoming',
        // Reset type-specific fields
        targetSportId: undefined,
        fields: undefined,
        maxParticipants: undefined,
        registrationEndDate: undefined,
        prizes: undefined,
        discountPercent: undefined,
        conditions: undefined,
        minBookingValue: undefined,
        activities: undefined,
        specialServices: undefined
      });
      
      // Reset selectedEventType
      setSelectedEventType(undefined);
    });
  };

  // Remove event from the list
  const handleRemoveEvent = (index: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa sự kiện',
      content: 'Bạn có chắc chắn muốn xóa sự kiện này khỏi danh sách?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        setEventsList(prev => prev.filter((_, i) => i !== index));
      }
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedFacilityId) {
      Modal.error({
        title: 'Chưa chọn cơ sở',
        content: 'Vui lòng chọn cơ sở trước khi lưu'
      });
      return;
    }

    if (eventsList.length === 0) {
      Modal.error({
        title: 'Chưa có sự kiện',
        content: 'Vui lòng thêm ít nhất một sự kiện'
      });
      return;
    }

    setSubmitting(true);
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      // Success message
      Modal.success({
        title: 'Tạo sự kiện thành công',
        content: `Đã tạo ${eventsList.length} sự kiện mới cho cơ sở ${mockFacilitiesDropdown.find(f => f.id === selectedFacilityId)?.name || ''}`,
        onOk: () => {
          if (onSubmit) {
            onSubmit(eventsList);
          } else {
            navigate('/owner/event-management');
          }
        }
      });
      
      setSubmitting(false);
    }, 1000);
  };

  // Handle Cancel
  const handleCancel = () => {
    if (eventsList.length > 0) {
      Modal.confirm({
        title: 'Hủy tạo sự kiện',
        content: `Bạn đã thêm ${eventsList.length} sự kiện vào danh sách. Bạn có chắc chắn muốn hủy?`,
        okText: 'Có, hủy tạo sự kiện',
        cancelText: 'Không, tiếp tục',
        onOk() {
          if (onCancel) {
            onCancel();
          } else {
            navigate('/owner/event-management');
          }
        }
      });
    } else {
      if (onCancel) {
        onCancel();
      } else {
        navigate('/owner/event-management');
      }
    }
  };

  // Get sport name by ID
  const getSportName = (sportId: number) => {
    const sport = mockSports.find(s => s.id === sportId);
    return sport ? sport.name : 'Không xác định';
  };

  // Helper function để hiển thị loại sự kiện
  const getEventTypeTag = (type: EventType) => {
    const config: Record<EventType, { color: string, text: string }> = {
      TOURNAMENT: { color: 'blue', text: 'Giải đấu' },
      DISCOUNT: { color: 'green', text: 'Khuyến mãi' },
      SPECIAL_OFFER: { color: 'purple', text: 'Ưu đãi đặc biệt' },
    };
    return <Tag color={config[type].color}>{config[type].text}</Tag>;
  };

  // Render specific fields based on event type
  const renderEventTypeFields = () => {
    if (!selectedEventType) return null;
    
    switch (selectedEventType) {
      case 'TOURNAMENT':
        return (
          <>
            <Form.Item
              name="targetSportId"
              label="Loại hình thể thao"
              rules={[{ required: true, message: 'Vui lòng chọn loại hình thể thao' }]}
            >
              <Select 
                placeholder="Chọn loại hình thể thao" 
                disabled={submitting}
                optionLabelProp="label"
                style={{ width: '100%' }}
                popupMatchSelectWidth={false}
              >
                {mockSports.map((sport) => (
                  <Option 
                    key={sport.id} 
                    value={sport.id} 
                    label={sport.name}
                  >
                    <div style={{ minWidth: '120px' }}>{sport.name}</div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="fields"
              label="Các sân tổ chức"
              rules={[{ required: true, message: 'Vui lòng chọn các sân tổ chức' }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn các sân tổ chức"
                disabled={submitting}
              >
                <Option value="Field 1">Sân 1</Option>
                <Option value="Field 2">Sân 2</Option>
                <Option value="Field 3">Sân 3</Option>
                <Option value="Field 4">Sân 4</Option>
              </Select>
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="maxParticipants"
                label="Số lượng tham gia tối đa"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng tham gia tối đa' }]}
              >
                <InputNumber
                  min={1}
                  placeholder="Nhập số lượng"
                  style={{ width: '100%' }}
                  disabled={submitting}
                />
              </Form.Item>

              <Form.Item
                name="registrationEndDate"
                label="Hạn đăng ký"
                rules={[{ required: true, message: 'Vui lòng chọn hạn đăng ký' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  disabled={submitting}
                />
              </Form.Item>
            </div>

            <Form.List name="prizes">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="flex gap-4 mb-4">
                      <Form.Item
                        {...restField}
                        name={[name, 'position']}
                        rules={[{ required: true, message: 'Vui lòng nhập vị trí' }]}
                      >
                        <InputNumber
                          min={1}
                          placeholder="Vị trí"
                          style={{ width: '100px' }}
                          disabled={submitting}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'prize']}
                        rules={[{ required: true, message: 'Vui lòng nhập giải thưởng' }]}
                      >
                        <Input
                          placeholder="Giải thưởng"
                          disabled={submitting}
                        />
                      </Form.Item>
                      <Button type="link" onClick={() => remove(name)} disabled={submitting}>
                        Xóa
                      </Button>
                    </div>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Thêm giải thưởng
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </>
        );

      case 'DISCOUNT':
        return (
          <>
            <Form.Item
              name="discountPercent"
              label="Phần trăm giảm giá"
              rules={[{ required: true, message: 'Vui lòng nhập phần trăm giảm giá' }]}
            >
              <InputNumber
                min={0}
                max={100}
                placeholder="Nhập phần trăm giảm giá"
                style={{ width: '100%' }}
                disabled={submitting}
              />
            </Form.Item>

            <Form.Item
              name="conditions"
              label="Điều kiện áp dụng"
              rules={[{ required: true, message: 'Vui lòng nhập điều kiện áp dụng' }]}
            >
              <TextArea
                placeholder="Nhập điều kiện áp dụng"
                rows={3}
                disabled={submitting}
              />
            </Form.Item>

            <Form.Item
              name="minBookingValue"
              label="Giá trị đơn hàng tối thiểu"
              rules={[{ required: true, message: 'Vui lòng nhập giá trị đơn hàng tối thiểu' }]}
            >
              <InputNumber
                min={0}
                placeholder="Nhập giá trị đơn hàng tối thiểu"
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={(value: string | undefined) => {
                  if (!value) return 0;
                  return Number(value.replace(/\./g, ''));
                }}
                disabled={submitting}
              />
            </Form.Item>
          </>
        );

      case 'SPECIAL_OFFER':
        return (
          <>
            <Form.Item
              name="activities"
              label="Các hoạt động"
              rules={[{ required: true, message: 'Vui lòng chọn các hoạt động' }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn các hoạt động"
                disabled={submitting}
              >
                <Option value="Tennis">Tennis</Option>
                <Option value="Bóng đá">Bóng đá</Option>
                <Option value="Bóng rổ">Bóng rổ</Option>
                <Option value="Cầu lông">Cầu lông</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="specialServices"
              label="Dịch vụ đặc biệt"
              rules={[{ required: true, message: 'Vui lòng chọn các dịch vụ đặc biệt' }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn các dịch vụ đặc biệt"
                disabled={submitting}
              >
                <Option value="Đồ ăn miễn phí">Đồ ăn miễn phí</Option>
                <Option value="Huấn luyện viên hướng dẫn">Huấn luyện viên hướng dẫn</Option>
                <Option value="Trò chơi cho trẻ em">Trò chơi cho trẻ em</Option>
              </Select>
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 md:p-8">
      <Card className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <Space size="middle">  
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleCancel}
              type="text"
            />          
            <Title level={3} style={{ margin: 0 }}>Tạo sự kiện mới</Title>
          </Space>
          
          <Button 
            type="primary" 
            onClick={handleSubmit}
            loading={submitting}
            disabled={eventsList.length === 0}
          >
            Lưu sự kiện
          </Button>
        </div>

        <Divider />

        <Spin spinning={submitting}>
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            initialValues={{ status: 'upcoming' }}
          >
            <Form.Item
              name="facilityId"
              label="Cơ sở áp dụng"
              rules={[{ required: true, message: 'Vui lòng chọn cơ sở' }]}
            >
              <Select
                placeholder="Chọn cơ sở của bạn"
                onChange={handleFacilitySelect}
                disabled={submitting}
                value={selectedFacilityId || undefined}
              >
                {mockFacilitiesDropdown.map((facility) => (
                  <Option key={facility.id} value={facility.id}>
                    {facility.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedFacilityId && (
              <>
                <Form.Item
                  name="name"
                  label="Tên sự kiện"
                  rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện' }]}
                >
                  <Input placeholder="Nhập tên sự kiện" disabled={submitting} />
                </Form.Item>

                <Form.Item
                  name="eventType"
                  label="Loại sự kiện"
                  rules={[{ required: true, message: 'Vui lòng chọn loại sự kiện' }]}
                >
                  <Select 
                    placeholder="Chọn loại sự kiện" 
                    disabled={submitting}
                    onChange={handleEventTypeChange}
                  >
                    {mockEventTypes.map((type) => (
                      <Option key={type.id} value={type.id}>
                        {type.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="dateRange"
                  label="Thời gian diễn ra"
                  rules={[{ required: true, message: 'Vui lòng chọn thời gian diễn ra' }]}
                >
                  <RangePicker
                    style={{ width: '100%' }}
                    disabled={submitting}
                  />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Mô tả sự kiện"
                >
                  <TextArea 
                    placeholder="Nhập mô tả chi tiết về sự kiện" 
                    rows={3} 
                    disabled={submitting}
                  />
                </Form.Item>

                <Form.Item
                  name="status"
                  label="Trạng thái"
                  initialValue="upcoming"
                >
                  <Select placeholder="Chọn trạng thái" disabled={submitting}>
                    <Option value="upcoming">Sắp diễn ra</Option>
                    <Option value="active">Đang diễn ra</Option>
                    <Option value="expired">Đã kết thúc</Option>
                  </Select>
                </Form.Item>

                {/* Render event type specific fields */}
                {renderEventTypeFields()}

                <Form.Item>
                  <Button 
                    type="dashed" 
                    icon={<PlusOutlined />} 
                    onClick={handleAddEvent}
                    disabled={submitting}
                    block
                  >
                    Thêm sự kiện vào danh sách
                  </Button>
                </Form.Item>
              </>
            )}
          </Form>
        </Spin>

        {eventsList.length > 0 && (
          <div className="mt-8">
            <Divider orientation="left">
              <Text strong>Danh sách sự kiện đã thêm ({eventsList.length})</Text>
            </Divider>
            
            <div className="overflow-x-auto">
              <List
                itemLayout="horizontal"
                dataSource={eventsList}
                renderItem={(event, index) => (
                  <List.Item
                    actions={[
                      <Button 
                        key="delete" 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveEvent(index)}
                        disabled={submitting}
                      >
                        Xóa
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={event.name}
                      description={
                        <Space direction="vertical" size={1}>
                          <div className="flex gap-1 mt-1">
                            {event.eventType && getEventTypeTag(event.eventType)}
                          </div>
                          <Text type="secondary">
                            Thời gian: {dayjs(event.startDate).format('DD/MM/YYYY')} - {dayjs(event.endDate).format('DD/MM/YYYY')}
                          </Text>
                          {event.description && <Text type="secondary">Mô tả: {event.description}</Text>}
                          {event.eventType === 'TOURNAMENT' && (
                            <>
                              <Text type="secondary">Loại hình: {getSportName(event.targetSportId || 0)}</Text>
                              <Text type="secondary">Số lượng tham gia tối đa: {event.maxParticipants}</Text>
                            </>
                          )}
                          {event.eventType === 'DISCOUNT' && (
                            <>
                              <Text type="secondary">Giảm giá: {event.discountPercent}%</Text>
                              <Text type="secondary">Điều kiện: {event.conditions}</Text>
                            </>
                          )}
                          {event.eventType === 'SPECIAL_OFFER' && (
                            <>
                              <Text type="secondary">Hoạt động: {event.activities?.join(', ')}</Text>
                              <Text type="secondary">Dịch vụ đặc biệt: {event.specialServices?.join(', ')}</Text>
                            </>
                          )}
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
                  Lưu sự kiện ({eventsList.length})
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CreateEvent; 