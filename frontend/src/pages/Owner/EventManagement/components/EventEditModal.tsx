import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, Spin, InputNumber, Switch, Divider } from 'antd';
import { Event, EventType, DiscountType } from '@/types/event.type';
import { mockFacilitiesDropdown } from '@/mocks/facility/mockFacilities';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Mock sports data that will be used in events
const mockSports = [
  { id: 1, name: 'Bóng đá' },
  { id: 2, name: 'Bóng rổ' },
  { id: 3, name: 'Tennis' },
  { id: 4, name: 'Cầu lông' }
];

// Mock event types
const mockEventTypes = [
  { id: 'DISCOUNT', name: 'Khuyến mãi' },
  { id: 'TOURNAMENT', name: 'Giải đấu' }
];

// Mock tournament formats
const tournamentFormats = [
  { value: 'knockout', label: 'Loại trực tiếp' },
  { value: 'roundRobin', label: 'Vòng tròn' },
  { value: 'hybrid', label: 'Kết hợp' },
  { value: 'other', label: 'Khác' }
];

// Mock registration types
const registrationTypes = [
  { value: 'individual', label: 'Cá nhân' },
  { value: 'team', label: 'Đội' },
  { value: 'both', label: 'Cả cá nhân và đội' }
];

// Mock payment methods
const paymentMethods = [
  { value: 'bankTransfer', label: 'Chuyển khoản ngân hàng' },
  { value: 'cash', label: 'Tiền mặt' },
  { value: 'QR', label: 'Quét mã QR' },
  { value: 'wallet', label: 'Ví điện tử' }
];

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
  const [isFreeRegistration, setIsFreeRegistration] = useState<boolean>(false);
  const [selectedDiscountType, setSelectedDiscountType] = useState<DiscountType | undefined>(undefined);

  // Reset form when event changes
  useEffect(() => {
    if (event) {
      setSelectedEventType(event.eventType);
      setIsFreeRegistration(event.isFreeRegistration || false);
      setSelectedDiscountType(event.discountType);
      
      form.setFieldsValue({
        name: event.name,
        description: event.description,
        dateRange: [dayjs(event.startDate), dayjs(event.endDate)],
        status: event.status,
        facilityId: event.facilityId,
        eventType: event.eventType,
        
        // Tournament specific fields
        ...(event.eventType === 'TOURNAMENT' && {
          sportIds: event.sportIds,
          fieldIds: event.fieldIds,
          maxParticipants: event.maxParticipants,
          minParticipants: event.minParticipants,
          registrationType: event.registrationType,
          registrationEndDate: event.registrationEndDate ? dayjs(event.registrationEndDate) : undefined,
          isFreeRegistration: event.isFreeRegistration,
          registrationFee: event.registrationFee,
          ageLimit: event.ageLimit,
          tournamentFormat: event.tournamentFormat,
          tournamentFormatDescription: event.tournamentFormatDescription,
          totalPrize: event.totalPrize,
          prizeDescription: event.prizeDescription,
          rulesAndRegulations: event.rulesAndRegulations,
          paymentMethod: event.paymentMethod,
          paymentInstructions: event.paymentInstructions,
          paymentDeadline: event.paymentDeadline ? dayjs(event.paymentDeadline) : undefined,
          paymentAccountInfo: event.paymentAccountInfo
        }),
        
        // Discount specific fields
        ...(event.eventType === 'DISCOUNT' && {
          discountType: event.discountType,
          discountPercent: event.discountPercent,
          discountAmount: event.discountAmount,
          freeSlots: event.freeSlots,
          minBookingValue: event.minBookingValue,
          targetUserType: event.targetUserType,
          maxUsageCount: event.maxUsageCount,
          descriptionOfDiscount: event.descriptionOfDiscount
        })
      });
    } else {
      form.resetFields();
      setSelectedEventType(undefined);
      setIsFreeRegistration(false);
      setSelectedDiscountType(undefined);
    }
  }, [form, event, visible]);

  const handleEventTypeChange = (value: EventType) => {
    setSelectedEventType(value);
    form.validateFields();
  };

  const handleFreeRegistrationChange = (checked: boolean) => {
    setIsFreeRegistration(checked);
    if (checked) {
      form.setFieldsValue({ registrationFee: 0 });
    }
  };

  const handleDiscountTypeChange = (value: DiscountType) => {
    setSelectedDiscountType(value);
    
    // Reset discount values based on the type
    if (value === 'PERCENT') {
      form.setFieldsValue({ discountAmount: undefined, freeSlots: undefined });
    } else if (value === 'FIXED_AMOUNT') {
      form.setFieldsValue({ discountPercent: undefined, freeSlots: undefined });
    } else if (value === 'FREE_SLOT') {
      form.setFieldsValue({ discountPercent: undefined, discountAmount: undefined });
    }
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
        eventType: values.eventType,
        updatedAt: new Date().toISOString()
      };

      // Add tournament specific fields
      if (values.eventType === 'TOURNAMENT') {
        Object.assign(updatedEvent, {
          sportIds: values.sportIds,
          fieldIds: values.fieldIds,
          maxParticipants: values.maxParticipants,
          minParticipants: values.minParticipants,
          registrationType: values.registrationType,
          registrationEndDate: values.registrationEndDate ? values.registrationEndDate.toISOString() : undefined,
          isFreeRegistration: values.isFreeRegistration,
          registrationFee: values.isFreeRegistration ? 0 : values.registrationFee,
          ageLimit: values.ageLimit,
          tournamentFormat: values.tournamentFormat,
          tournamentFormatDescription: values.tournamentFormatDescription,
          totalPrize: values.totalPrize,
          prizeDescription: values.prizeDescription,
          rulesAndRegulations: values.rulesAndRegulations
        });

        // Add payment information only if not free
        if (!values.isFreeRegistration) {
          Object.assign(updatedEvent, {
            paymentMethod: values.paymentMethod,
            paymentInstructions: values.paymentInstructions,
            paymentDeadline: values.paymentDeadline ? values.paymentDeadline.toISOString() : undefined,
            paymentAccountInfo: values.paymentAccountInfo
          });
        }
      } 
      // Add discount specific fields
      else if (values.eventType === 'DISCOUNT') {
        Object.assign(updatedEvent, {
          discountType: values.discountType,
          targetUserType: values.targetUserType,
          minBookingValue: values.minBookingValue,
          maxUsageCount: values.maxUsageCount,
          descriptionOfDiscount: values.descriptionOfDiscount
        });

        // Add discount type specific fields
        if (values.discountType === 'PERCENT') {
          updatedEvent.discountPercent = values.discountPercent;
        } else if (values.discountType === 'AMOUNT') {
          updatedEvent.discountAmount = values.discountAmount;
        } else if (values.discountType === 'FREE_SLOT') {
          updatedEvent.freeSlots = values.freeSlots;
        }
      }
      
      onSubmit(updatedEvent);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  if (!event) return null;

  // Tournament specific fields
  const renderTournamentFields = () => {
    return (
      <>
        <Form.Item
          name="sportIds"
          label="Môn thể thao"
          rules={[{ required: true, message: 'Vui lòng chọn môn thể thao!' }]}
        >
          <Select mode="multiple" placeholder="Chọn môn thể thao">
            {mockSports.map(sport => (
              <Option key={sport.id} value={sport.id}>
                {sport.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="fieldIds"
          label="Sân thi đấu"
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất một sân!' }]}
        >
          <Select mode="multiple" placeholder="Chọn sân thi đấu">
            <Option value={1}>Sân 1</Option>
            <Option value={2}>Sân 2</Option>
            <Option value={3}>Sân 3</Option>
            <Option value={4}>Sân 4</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="registrationType"
          label="Hình thức đăng ký"
          rules={[{ required: true, message: 'Vui lòng chọn hình thức đăng ký!' }]}
        >
          <Select placeholder="Chọn hình thức đăng ký">
            {registrationTypes.map(type => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="maxParticipants"
          label="Số người tham gia tối đa"
          rules={[{ required: true, message: 'Vui lòng nhập số người tham gia tối đa!' }]}
        >
          <InputNumber min={2} style={{ width: '100%' }} placeholder="Nhập số người tham gia tối đa" />
        </Form.Item>

        <Form.Item
          name="minParticipants"
          label="Số người tham gia tối thiểu"
        >
          <InputNumber min={2} style={{ width: '100%' }} placeholder="Nhập số người tham gia tối thiểu" />
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
          name="ageLimit"
          label="Giới hạn độ tuổi"
        >
          <Input placeholder="Ví dụ: 18+, U16, Học sinh THPT..." />
        </Form.Item>

        <Form.Item
          name="tournamentFormat"
          label="Thể thức thi đấu"
          rules={[{ required: true, message: 'Vui lòng chọn thể thức thi đấu!' }]}
        >
          <Select 
            mode="multiple" 
            placeholder="Chọn thể thức thi đấu"
          >
            {tournamentFormats.map(format => (
              <Option key={format.value} value={format.value}>
                {format.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="tournamentFormatDescription"
          label="Mô tả thể thức thi đấu"
        >
          <TextArea rows={3} placeholder="Mô tả chi tiết thể thức thi đấu" />
        </Form.Item>

        <Form.Item
          name="isFreeRegistration"
          label="Miễn phí đăng ký"
          valuePropName="checked"
        >
          <Switch onChange={handleFreeRegistrationChange} />
        </Form.Item>
        
        {!isFreeRegistration && (
          <Form.Item
            name="registrationFee"
            label="Phí đăng ký"
            rules={[{ required: !isFreeRegistration, message: 'Vui lòng nhập phí đăng ký!' }]}
          >
            <InputNumber 
              min={0} 
              style={{ width: '100%' }} 
              placeholder="Nhập phí đăng ký (VNĐ)"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(value: string | undefined) => {
                  if (!value) return 0;
                  return Number(value.replace(/\./g, ''));
                }}
            />
          </Form.Item>
        )}

        <Form.Item
          name="totalPrize"
          label="Tổng giải thưởng"
        >
          <Input placeholder="Ví dụ: 10.000.000 VNĐ + Cup vô địch" />
        </Form.Item>
        
        <Form.Item
          name="prizeDescription"
          label="Mô tả giải thưởng"
        >
          <TextArea rows={2} placeholder="Mô tả chi tiết giải thưởng" />
        </Form.Item>

        <Form.Item
          name="rulesAndRegulations"
          label="Luật thi đấu và quy định"
        >
          <TextArea rows={4} placeholder="Nhập luật thi đấu và các quy định" />
        </Form.Item>

        {!isFreeRegistration && (
          <>
            <Divider orientation="left">Thông tin thanh toán</Divider>

            <Form.Item
              name="paymentMethod"
              label="Phương thức thanh toán"
              rules={[{ required: !isFreeRegistration, message: 'Vui lòng chọn phương thức thanh toán!' }]}
            >
              <Select 
                mode="multiple" 
                placeholder="Chọn phương thức thanh toán"
              >
                {paymentMethods.map(method => (
                  <Option key={method.value} value={method.value}>
                    {method.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="paymentInstructions"
              label="Hướng dẫn thanh toán"
            >
              <TextArea rows={2} placeholder="Hướng dẫn cách thức thanh toán" />
            </Form.Item>

            <Form.Item
              name="paymentDeadline"
              label="Hạn thanh toán"
            >
              <DatePicker 
                showTime 
                format="DD/MM/YYYY HH:mm" 
                style={{ width: '100%' }}
                placeholder="Chọn hạn thanh toán"
              />
            </Form.Item>

            <Form.Item
              name="paymentAccountInfo"
              label="Thông tin tài khoản"
            >
              <TextArea rows={2} placeholder="Số tài khoản, chủ tài khoản, ngân hàng..." />
            </Form.Item>
          </>
        )}
      </>
    );
  };

  // Discount specific fields
  const renderDiscountFields = () => {
    return (
      <>
        <Form.Item
          name="discountType"
          label="Loại khuyến mãi"
          rules={[{ required: true, message: 'Vui lòng chọn loại khuyến mãi!' }]}
        >
          <Select 
            placeholder="Chọn loại khuyến mãi"
            onChange={handleDiscountTypeChange}
          >
            <Option value="PERCENT">Giảm theo phần trăm</Option>
            <Option value="AMOUNT">Giảm theo số tiền</Option>
            <Option value="FREE_SLOT">Tặng lượt đặt sân</Option>
          </Select>
        </Form.Item>

        {selectedDiscountType === 'PERCENT' && (
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
        )}

        {selectedDiscountType === 'FIXED_AMOUNT' && (
          <Form.Item
            name="discountAmount"
            label="Số tiền giảm giá"
            rules={[{ required: true, message: 'Vui lòng nhập số tiền giảm giá!' }]}
          >
            <InputNumber 
              min={1000} 
              style={{ width: '100%' }} 
              placeholder="Nhập số tiền giảm giá (VNĐ)"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(value: string | undefined) => {
                  if (!value) return 0;
                  return Number(value.replace(/\./g, ''));
                }}
            />
          </Form.Item>
        )}

        {selectedDiscountType === 'FREE_SLOT' && (
          <Form.Item
            name="freeSlots"
            label="Số lượt đặt sân miễn phí"
            rules={[{ required: true, message: 'Vui lòng nhập số lượt đặt sân miễn phí!' }]}
          >
            <InputNumber 
              min={1} 
              style={{ width: '100%' }} 
              placeholder="Nhập số lượt đặt sân miễn phí"
            />
          </Form.Item>
        )}

        <Form.Item
          name="targetUserType"
          label="Đối tượng áp dụng"
          rules={[{ required: true, message: 'Vui lòng chọn đối tượng áp dụng!' }]}
        >
          <Select placeholder="Chọn đối tượng áp dụng">
            <Option value="ALL">Tất cả khách hàng</Option>
            <Option value="NEW">Khách hàng mới</Option>
            <Option value="LOYALTY">Khách hàng thân thiết</Option>
            <Option value="CASUAL">Khách hàng thông thường</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="minBookingValue"
          label="Giá trị đặt sân tối thiểu"
        >
          <InputNumber 
            min={0} 
            style={{ width: '100%' }} 
            placeholder="Nhập giá trị đặt sân tối thiểu (VNĐ)"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            parser={(value: string | undefined) => {
            if (!value) return 0;
            return Number(value.replace(/\./g, ''));
            }}
          />
        </Form.Item>

        <Form.Item
          name="maxUsageCount"
          label="Số lần sử dụng tối đa"
          help="Để 0 nếu không giới hạn số lần sử dụng"
        >
          <InputNumber 
            min={0} 
            style={{ width: '100%' }} 
            placeholder="Nhập số lần sử dụng tối đa"
          />
        </Form.Item>

        <Form.Item
          name="descriptionOfDiscount"
          label="Mô tả khuyến mãi"
        >
          <TextArea rows={3} placeholder="Mô tả chi tiết về khuyến mãi" />
        </Form.Item>
      </>
    );
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
          requiredMark={true}
          validateMessages={{ required: '${label} không được để trống!' }}
        >
          {/* Basic event information */}
          <Form.Item
            name="name"
            label="Tên sự kiện"
            rules={[{ required: true }]}
          >
            <Input placeholder="Nhập tên sự kiện" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true }]}
          >
            <TextArea rows={3} placeholder="Nhập mô tả sự kiện" />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Thời gian diễn ra"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian diễn ra!' }]}
          >
            <RangePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Đang diễn ra</Option>
              <Option value="upcoming">Sắp diễn ra</Option>
              <Option value="expired">Đã kết thúc</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="facilityId"
            label="Cơ sở"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn cơ sở">
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
            rules={[{ required: true }]}
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

          {/* Event type specific fields */}
          {selectedEventType && (
            <Divider orientation="left">Thông tin chi tiết</Divider>
          )}

          {selectedEventType === 'TOURNAMENT' && renderTournamentFields()}
          {selectedEventType === 'DISCOUNT' && renderDiscountFields()}
          
        </Form>
      </Spin>
    </Modal>
  );
};

export default EventEditModal; 