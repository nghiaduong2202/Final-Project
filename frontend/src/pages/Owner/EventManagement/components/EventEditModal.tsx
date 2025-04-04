import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, Spin, InputNumber } from 'antd';
import { Event, EventType } from '@/types/event.type';
import { mockEventTypes, mockEventDetails } from '@/mocks/event/eventData';
import { mockFacilitiesDropdown } from '@/mocks/facility/mockFacilities';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface EventEditModalProps {
  visible: boolean;
  event: Event | null;
  onClose: () => void;
  onSubmit: (values: Event) => void;
  submitting: boolean;
}

const EventEditModal: React.FC<EventEditModalProps> = ({
  visible,
  event,
  onClose,
  onSubmit,
  submitting
}) => {
  const [form] = Form.useForm();
  const [selectedEventType, setSelectedEventType] = useState<EventType | undefined>(undefined);

  // Reset form when event changes
  useEffect(() => {
    if (event) {
      const eventDetail = mockEventDetails[event.id];
      setSelectedEventType(event.eventType);
      
      form.setFieldsValue({
        name: event.name,
        description: event.description,
        dateRange: [dayjs(event.startDate), dayjs(event.endDate)],
        status: event.status,
        facilityId: event.facilityId,
        eventType: event.eventType,
        
        // Event type specific fields
        ...(event.eventType === 'DISCOUNT' && {
          discountPercent: eventDetail?.discountPercent,
          conditions: eventDetail?.conditions,
          minBookingValue: eventDetail?.minBookingValue
        }),
        
        ...(event.eventType === 'TOURNAMENT' && {
          maxParticipants: eventDetail?.maxParticipants,
          registrationEndDate: eventDetail?.registrationEndDate ? dayjs(eventDetail.registrationEndDate) : undefined,
          fields: eventDetail?.fields
        }),
        
        ...(event.eventType === 'SPECIAL_OFFER' && {
          activities: eventDetail?.activities,
          specialServices: eventDetail?.specialServices
        })
      });
    } else {
      form.resetFields();
      setSelectedEventType(undefined);
    }
  }, [form, event, visible]);

  const handleEventTypeChange = (value: EventType) => {
    setSelectedEventType(value);
    form.validateFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [startDate, endDate] = values.dateRange;

      const updatedEvent: Event = {
        ...event!,
        name: values.name,
        description: values.description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: values.status,
        facilityId: values.facilityId,
        eventType: values.eventType as EventType,
        updatedAt: new Date().toISOString()
      };

      // Also need to update the event details in a real application
      // Here we're just updating the event basic info
      onSubmit(updatedEvent);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  if (!event) return null;

  // Event type specific fields
  const renderEventTypeFields = () => {
    if (!selectedEventType) return null;
    
    switch(selectedEventType) {
      case 'DISCOUNT':
        return (
          <>
            <Form.Item
              name="discountPercent"
              label="Phần trăm giảm giá"
              rules={[{ required: true, message: 'Vui lòng nhập phần trăm giảm giá!' }]}
            >
              <InputNumber 
                min={1} 
                max={100} 
                style={{ width: '100%' }} 
                placeholder="Nhập phần trăm giảm giá (1-100)"
              />
            </Form.Item>
            <Form.Item
              name="conditions"
              label="Điều kiện áp dụng"
            >
              <TextArea rows={3} placeholder="Nhập điều kiện áp dụng (nếu có)" />
            </Form.Item>
            <Form.Item
              name="minBookingValue"
              label="Giá trị đặt sân tối thiểu"
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }} 
                placeholder="Nhập giá trị đặt sân tối thiểu (0 = không có)"
              />
            </Form.Item>
          </>
        );
      case 'TOURNAMENT':
        return (
          <>
            <Form.Item
              name="maxParticipants"
              label="Số người tham gia tối đa"
              rules={[{ required: true, message: 'Vui lòng nhập số người tham gia tối đa!' }]}
            >
              <InputNumber 
                min={2} 
                style={{ width: '100%' }} 
                placeholder="Nhập số người tham gia tối đa"
              />
            </Form.Item>
            <Form.Item
              name="registrationEndDate"
              label="Hạn đăng ký"
              rules={[{ required: true, message: 'Vui lòng chọn hạn đăng ký!' }]}
            >
              <DatePicker 
                showTime 
                format="DD/MM/YYYY HH:mm" 
                style={{ width: '100%' }}
                placeholder="Chọn hạn đăng ký"
              />
            </Form.Item>
            <Form.Item
              name="fields"
              label="Sân tổ chức"
              rules={[{ required: true, message: 'Vui lòng chọn ít nhất một sân!' }]}
            >
              <Select mode="tags" style={{ width: '100%' }} placeholder="Nhập các sân tổ chức">
                <Option value="Field 1">Sân 1</Option>
                <Option value="Field 2">Sân 2</Option>
                <Option value="Field 3">Sân 3</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="prizes"
              label="Giải thưởng"
            >
              <TextArea rows={3} placeholder="Nhập thông tin giải thưởng (VD: Giải nhất: 5.000.000 VNĐ)" />
            </Form.Item>
          </>
        );
      case 'SPECIAL_OFFER':
        return (
          <>
            <Form.Item
              name="activities"
              label="Các hoạt động"
              rules={[{ required: true, message: 'Vui lòng nhập ít nhất một hoạt động!' }]}
            >
              <Select mode="tags" style={{ width: '100%' }} placeholder="Nhập các hoạt động">
                <Option value="Bóng đá">Bóng đá</Option>
                <Option value="Tennis">Tennis</Option>
                <Option value="Bóng rổ">Bóng rổ</Option>
                <Option value="Cầu lông">Cầu lông</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="specialServices"
              label="Dịch vụ đặc biệt"
              rules={[{ required: true, message: 'Vui lòng nhập ít nhất một dịch vụ đặc biệt!' }]}
            >
              <Select mode="tags" style={{ width: '100%' }} placeholder="Nhập các dịch vụ đặc biệt">
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
    <Modal
      title="Chỉnh sửa sự kiện"
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={handleSubmit}
        >
          Lưu thay đổi
        </Button>
      ]}
    >
      <Spin spinning={submitting}>
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Tên sự kiện"
            rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện!' }]}
          >
            <Input placeholder="Nhập tên sự kiện" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả sự kiện!' }]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả sự kiện" />
          </Form.Item>

          <Form.Item
            name="facilityId"
            label="Cơ sở áp dụng"
            rules={[{ required: true, message: 'Vui lòng chọn cơ sở áp dụng!' }]}
          >
            <Select placeholder="Chọn cơ sở áp dụng">
              {mockFacilitiesDropdown.map(facility => (
                <Option key={facility.id} value={facility.id}>
                  {facility.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="eventType"
            label="Loại sự kiện"
            rules={[{ required: true, message: 'Vui lòng chọn loại sự kiện!' }]}
          >
            <Select 
              placeholder="Chọn loại sự kiện"
              onChange={handleEventTypeChange}
            >
              {mockEventTypes.map(type => (
                <Option key={type.id} value={type.id}>
                  {type.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {renderEventTypeFields()}

          <Form.Item
            name="dateRange"
            label="Thời gian diễn ra"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian diễn ra!' }]}
          >
            <RangePicker 
              showTime 
              format="DD/MM/YYYY HH:mm" 
              style={{ width: '100%' }}
              placeholder={['Thời gian bắt đầu', 'Thời gian kết thúc']}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Đang diễn ra</Option>
              <Option value="upcoming">Sắp diễn ra</Option>
              <Option value="expired">Đã kết thúc</Option>
            </Select>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default EventEditModal; 