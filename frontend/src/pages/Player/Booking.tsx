import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Steps, Card, Row, Col, Select, DatePicker, TimePicker, Radio, Button, InputNumber, Alert, Modal, Divider, Typography, Space, Switch, Calendar, Tag, Tooltip, Checkbox } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, CheckCircleOutlined, ClockCircleOutlined, BankOutlined, WalletOutlined, CreditCardOutlined, CalendarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { BookingFormData, BookingStatus, RecurringType, RecurringConfig, FieldGroupAvailability } from '@/types/booking.type';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = TimePicker;

const WEEKDAYS = [
  { value: 0, label: 'Chủ nhật' },
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' }
];

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { facilityId } = useParams();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes in seconds
  const [formData, setFormData] = useState<Partial<BookingFormData>>({});
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState<dayjs.Dayjs[]>([]);
  const [fieldGroupAvailability, setFieldGroupAvailability] = useState<FieldGroupAvailability[]>([]);
  const [recurringSelectionMode, setRecurringSelectionMode] = useState<'auto' | 'manual'>('auto');
  const [recurringType, setRecurringType] = useState<RecurringType>(RecurringType.DAILY);
  const [selectedWeekday, setSelectedWeekday] = useState<string>('');
  const [additionalWeekdays, setAdditionalWeekdays] = useState<number[]>([]);
  const [isDateSelected, setIsDateSelected] = useState<boolean>(false);

  // Maximum date constraints - 1 month from today
  const maxBookingDate = dayjs().add(1, 'month');

  // Mock data - replace with actual API calls
  const sports = [
    { id: 1, name: 'Football' },
    { id: 2, name: 'Badminton' },
    { id: 3, name: 'Tennis' }
  ];

  const fieldGroups = [
    {
      id: 1,
      name: 'Sân 7 người',
      dimension: '50m x 30m',
      surface: 'Cỏ nhân tạo',
      basePrice: 200000,
      peakStartTime: '17:00',
      peakEndTime: '22:00',
      priceIncrease: 50000
    },
    {
      id: 2,
      name: 'Sân cầu lông',
      dimension: '13.4m x 6.1m',
      surface: 'Sàn gỗ',
      basePrice: 250000,
      peakStartTime: '18:00',
      peakEndTime: '22:00',
      priceIncrease: 50000
    }
  ];

  const services = [
    {
      id: 1,
      name: 'Nước uống',
      price: 15000,
      description: 'Nước suối 500ml',
      remain: 50
    },
    {
      id: 2,
      name: 'Khăn lạnh',
      price: 5000,
      description: 'Khăn lạnh ướt',
      remain: 100
    }
  ];

  useEffect(() => {
    if (currentStep > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentStep]);

  // Auto-generate recurring dates based on selected date and recurring type
  const generateRecurringDates = (baseDate: dayjs.Dayjs, type: RecurringType) => {
    if (!baseDate) return [];
    
    const dates: dayjs.Dayjs[] = [baseDate];
    const endDate = dayjs().add(1, 'month'); // Max 1 month from today
    
    if (type === RecurringType.DAILY) {
      // Generate daily dates for the rest of the week
      let currentDate = baseDate.add(1, 'day');
      
      // Add remaining days of the week after selected date
      while (currentDate.isBefore(endDate) && currentDate.day() !== baseDate.day()) {
        dates.push(currentDate);
        currentDate = currentDate.add(1, 'day');
      }
    } else if (type === RecurringType.WEEKLY) {
      // Generate weekly dates for 1 month
      let currentDate = baseDate.add(1, 'week');
      while (currentDate.isBefore(endDate)) {
        dates.push(currentDate);
        currentDate = currentDate.add(1, 'week');
      }

      // Add additional weekdays if selected
      if (additionalWeekdays.length > 0) {
        const baseDayOfWeek = baseDate.day();
        additionalWeekdays.forEach(weekday => {
          if (weekday !== baseDayOfWeek) {
            let additionalDate = baseDate.day(weekday);
            
            // If we've gone backwards in time, go forward a week
            if (additionalDate.isBefore(baseDate)) {
              additionalDate = additionalDate.add(1, 'week');
            }
            
            // Add recurring instances of this additional weekday
            while (additionalDate.isBefore(endDate)) {
              dates.push(additionalDate);
              additionalDate = additionalDate.add(1, 'week');
            }
          }
        });

        // Sort dates chronologically
        dates.sort((a, b) => a.valueOf() - b.valueOf());
      }
    }
    
    return dates;
  };

  // Handle date change in the main form
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      form.setFieldsValue({ date });
      setIsDateSelected(true);
      setSelectedWeekday(getWeekdayName(date));
      
      // If recurring is already set, update the dates
      if (formData.isRecurring && recurringSelectionMode === 'auto') {
        const newDates = generateRecurringDates(date, recurringType);
        setSelectedDates(newDates);
      }
    } else {
      setIsDateSelected(false);
      setSelectedWeekday('');
    }
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setFormData(prev => ({ ...prev, ...values }));
      setCurrentStep(prev => prev + 1);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmitBooking = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to create booking
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/booking/history');
    } catch {
      setError('Có lỗi xảy ra khi đặt sân. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const handleRecurringChange = (checked: boolean) => {
    if (!isDateSelected && checked) {
      // If no date is selected, show an error and don't proceed
      setError('Vui lòng chọn ngày đặt sân trước khi đặt định kỳ');
      form.setFieldsValue({ isRecurring: false });
      return;
    } else if (error === 'Vui lòng chọn ngày đặt sân trước khi đặt định kỳ') {
      // Clear the error if it's the date selection error
      setError(null);
    }

    form.setFieldsValue({ isRecurring: checked });
    if (checked) {
      // When turning on recurring, auto-populate based on the already selected date
      const selectedDate = form.getFieldValue('date');
      if (selectedDate && recurringSelectionMode === 'auto') {
        const dates = generateRecurringDates(selectedDate, recurringType);
        setSelectedDates(dates);
      }
      setShowRecurringModal(true);
    } else {
      // Clear selected dates when turning off recurring
      setSelectedDates([]);
    }
  };

  const handleRecurringConfigChange = (config: Partial<RecurringConfig>) => {
    form.setFieldsValue({ recurringConfig: config });
  };

  const handleDateSelect = (date: dayjs.Dayjs) => {
    // Only allow dates within 1 month from now
    if (date.isAfter(maxBookingDate)) {
      return;
    }
    
    setSelectedDates(prev => {
      const exists = prev.some(d => d.isSame(date, 'day'));
      if (exists) {
        return prev.filter(d => !d.isSame(date, 'day'));
      }
      return [...prev, date];
    });
  };

  const handleRemoveDate = (dateToRemove: dayjs.Dayjs) => {
    setSelectedDates(prev => prev.filter(date => !date.isSame(dateToRemove, 'day')));
  };

  const handleRecurringTypeChange = (type: RecurringType) => {
    setRecurringType(type);
    
    // Reset additional weekdays when changing type
    setAdditionalWeekdays([]);
    
    if (recurringSelectionMode === 'auto') {
      const selectedDate = form.getFieldValue('date');
      if (selectedDate) {
        const dates = generateRecurringDates(selectedDate, type);
        setSelectedDates(dates);
      }
    }
    
    handleRecurringConfigChange({ type });
  };

  const handleRecurringModeChange = (mode: 'auto' | 'manual') => {
    setRecurringSelectionMode(mode);
    
    if (mode === 'auto') {
      // Reset any manually selected dates
      const selectedDate = form.getFieldValue('date');
      if (selectedDate) {
        const dates = generateRecurringDates(selectedDate, recurringType);
        setSelectedDates(dates);
      }
    } else {
      // If switching to manual, start with the base date
      const selectedDate = form.getFieldValue('date');
      if (selectedDate) {
        setSelectedDates([selectedDate]);
      } else {
        setSelectedDates([]);
      }
    }
  };

  const handleAdditionalWeekdayChange = (weekdayValues: number[]) => {
    // Limit to at most 2 additional weekdays
    if (weekdayValues.length > 2) {
      weekdayValues = weekdayValues.slice(0, 2);
    }
    
    setAdditionalWeekdays(weekdayValues);
    
    // Regenerate dates with the new weekdays
    if (recurringSelectionMode === 'auto') {
      const selectedDate = form.getFieldValue('date');
      if (selectedDate) {
        // First update the state, then regenerate
        setTimeout(() => {
          const dates = generateRecurringDates(selectedDate, recurringType);
          setSelectedDates(dates);
        }, 0);
      }
    }
  };

  const handleRecurringModalOk = () => {
    const config: RecurringConfig = {
      type: recurringType,
      startDate: selectedDates[0],
      endDate: selectedDates[selectedDates.length - 1],
      daysOfWeek: selectedDates.map(d => d.day()),
      daysOfMonth: [] // No longer needed as per requirements
    };
    handleRecurringConfigChange(config);
    setShowRecurringModal(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Get weekday name from date
  const getWeekdayName = (date: dayjs.Dayjs | null): string => {
    if (!date) return '';
    const weekdayIndex = date.day();
    return WEEKDAYS.find(day => day.value === weekdayIndex)?.label || '';
  };

  const calculateTotalPrice = () => {
    const fieldPrice = formData.fieldGroupId ? 
      fieldGroups.find(g => g.id === formData.fieldGroupId)?.basePrice || 0 : 0;
    
    const servicePrice = formData.services?.reduce((total, service) => {
      const serviceInfo = services.find(s => s.id === service.serviceId);
      return total + (serviceInfo?.price || 0) * service.quantity;
    }, 0) || 0;

    const recurringMultiplier = formData.isRecurring && selectedDates.length > 0 ? 
      selectedDates.length : 1;

    return (fieldPrice + servicePrice) * recurringMultiplier;
  };

  const steps = [
    {
      title: 'Thông tin đặt sân',
      content: (
        <Card className="shadow-md">
          <Form
            form={form}
            layout="vertical"
            initialValues={formData}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="sportId"
                  label="Loại hình thể thao"
                  rules={[{ required: true, message: 'Vui lòng chọn loại hình thể thao' }]}
                >
                  <Select placeholder="Chọn loại hình thể thao">
                    {sports.map(sport => (
                      <Option key={sport.id} value={sport.id}>{sport.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="date"
                  label="Ngày đặt sân"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày đặt sân' }]}
                >
                  <div className="flex flex-col">
                    <DatePicker 
                      className="w-full" 
                      format="DD/MM/YYYY"
                      disabledDate={current => {
                        // Disable dates before today or after 1 month from now
                        return (current && current < dayjs().startOf('day')) || 
                               (current && current > maxBookingDate);
                      }}
                      onChange={handleDateChange}
                    />
                    {selectedWeekday && (
                      <div className="mt-1 text-blue-600 text-sm font-semibold">
                        {selectedWeekday}
                      </div>
                    )}
                  </div>
                </Form.Item>
              </Col>
              
              <Col xs={24}>
                <Form.Item
                  name="timeRange"
                  label="Thời gian"
                  rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
                >
                  <RangePicker 
                    className="w-full" 
                    format="HH:mm"
                    minuteStep={30}
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="isRecurring"
                  label={
                    <div className="flex items-center">
                      <span>Đặt sân định kỳ</span>
                      <Tooltip title="Đặt sân định kỳ cho nhiều ngày trong vòng 1 tháng">
                        <InfoCircleOutlined className="ml-2 text-gray-400" />
                      </Tooltip>
                    </div>
                  }
                  valuePropName="checked"
                  tooltip={!isDateSelected ? "Vui lòng chọn ngày đặt sân trước" : ""}
                >
                  <Switch 
                    checkedChildren="Có" 
                    unCheckedChildren="Không"
                    onChange={handleRecurringChange}
                    disabled={!isDateSelected}
                  />
                </Form.Item>
              </Col>

              {formData.isRecurring && (
                <Col xs={24}>
                  <Button
                    type="dashed"
                    icon={<CalendarOutlined />}
                    onClick={() => setShowRecurringModal(true)}
                    className="w-full"
                  >
                    Chọn ngày định kỳ
                  </Button>
                  {selectedDates.length > 0 && (
                    <div className="mt-2">
                      <Text type="secondary">Đã chọn {selectedDates.length} ngày:</Text>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedDates.map(date => (
                          <Tag 
                            key={date.format('YYYY-MM-DD')} 
                            color="blue"
                            closable
                            onClose={() => handleRemoveDate(date)}
                          >
                            {date.format('DD/MM/YYYY')} ({getWeekdayName(date)})
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}
                </Col>
              )}
            </Row>
          </Form>
        </Card>
      )
    },
    {
      title: 'Chọn sân',
      content: (
        <Card className="shadow-md">
          <Form
            form={form}
            layout="vertical"
            initialValues={formData}
          >
            <Form.Item
              name="fieldGroupId"
              label="Loại sân"
              rules={[{ required: true, message: 'Vui lòng chọn loại sân' }]}
            >
              <Radio.Group className="w-full">
                <Space direction="vertical" className="w-full">
                  {fieldGroups.map(group => (
                    <Radio key={group.id} value={group.id} className="w-full">
                      <Card className="w-full mb-2 cursor-pointer hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <Text strong>{group.name}</Text>
                            <div className="text-sm text-gray-500">
                              <div>Kích thước: {group.dimension}</div>
                              <div>Bề mặt: {group.surface}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Text className="text-lg text-blue-600 font-semibold">
                              {formatCurrency(group.basePrice)}/giờ
                            </Text>
                            {group.peakStartTime && group.peakEndTime && group.priceIncrease && (
                              <div className="text-xs text-gray-500">
                                Giờ cao điểm ({group.peakStartTime} - {group.peakEndTime}): 
                                {formatCurrency(group.basePrice + group.priceIncrease)}/giờ
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Form.Item>
          </Form>
        </Card>
      )
    },
    {
      title: 'Dịch vụ',
      content: (
        <Card className="shadow-md">
          <Title level={5} className="mb-4">Dịch vụ đi kèm</Title>
          
          <Form
            form={form}
            layout="vertical"
            initialValues={formData}
          >
            <Form.Item name="services" label="Chọn dịch vụ">
              <div className="space-y-4">
                {services.map(service => (
                  <Card key={service.id} className="w-full">
                    <div className="flex justify-between items-center">
                      <div>
                        <Text strong>{service.name}</Text>
                        <div className="text-sm text-gray-500">{service.description}</div>
                        <div className="text-sm text-gray-500">Còn lại: {service.remain}</div>
                      </div>
                      <InputNumber
                        min={0}
                        max={service.remain}
                        defaultValue={0}
                        onChange={value => {
                          const currentServices = form.getFieldValue('services') || [];
                          const updatedServices = currentServices.filter((s: { serviceId: number }) => s.serviceId !== service.id);
                          if (value && value > 0) {
                            updatedServices.push({ serviceId: service.id, quantity: value });
                          }
                          form.setFieldsValue({ services: updatedServices });
                        }}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </Form.Item>
          </Form>
        </Card>
      )
    },
    {
      title: 'Thanh toán',
      content: (
        <Card className="shadow-md">
          <Form
            form={form}
            layout="vertical"
            initialValues={formData}
          >
            <Form.Item
              name="paymentMethod"
              label="Phương thức thanh toán"
              rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
            >
              <Radio.Group className="w-full">
                <Space direction="vertical" className="w-full">
                  <Radio value="banking" className="w-full">
                    <Card className="w-full mb-2 cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center">
                        <BankOutlined className="text-2xl mr-4 text-blue-600" />
                        <div>
                          <Text strong>Chuyển khoản ngân hàng</Text>
                          <div className="text-sm text-gray-500">
                            Chuyển khoản trực tiếp đến tài khoản ngân hàng của cơ sở
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Radio>
                  
                  <Radio value="momo" className="w-full">
                    <Card className="w-full mb-2 cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center">
                        <WalletOutlined className="text-2xl mr-4 text-pink-600" />
                        <div>
                          <Text strong>Ví MoMo</Text>
                          <div className="text-sm text-gray-500">
                            Thanh toán qua ví điện tử MoMo
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Radio>
                  
                  <Radio value="vnpay" className="w-full">
                    <Card className="w-full mb-2 cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center">
                        <CreditCardOutlined className="text-2xl mr-4 text-blue-600" />
                        <div>
                          <Text strong>VNPay</Text>
                          <div className="text-sm text-gray-500">
                            Thanh toán qua cổng thanh toán VNPay
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Radio>
                  
                  <Radio value="cash" className="w-full">
                    <Card className="w-full mb-2 cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center">
                        <WalletOutlined className="text-2xl mr-4 text-green-600" />
                        <div>
                          <Text strong>Tiền mặt</Text>
                          <div className="text-sm text-gray-500">
                            Thanh toán bằng tiền mặt tại cơ sở
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item label="Mã giảm giá (nếu có)">
              <div className="flex">
                <InputNumber
                  className="flex-1 mr-2"
                  placeholder="Nhập mã giảm giá"
                  onChange={value => form.setFieldsValue({ voucherCode: value })}
                />
                <Button type="primary">Áp dụng</Button>
              </div>
            </Form.Item>
          </Form>
          
          <Divider />
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <Title level={5} className="mb-4">Thông tin đặt sân</Title>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className="mb-2">
                  <Text type="secondary">Loại hình thể thao:</Text>
                  <div>{sports.find(s => s.id === formData.sportId)?.name || '-'}</div>
                </div>
                
                <div className="mb-2">
                  <Text type="secondary">Ngày đặt sân:</Text>
                  <div>
                    {formData.isRecurring ? (
                      <div>
                        <div>Đặt sân định kỳ</div>
                        <div className="text-sm text-gray-500">
                          {selectedDates.length} ngày đã chọn
                        </div>
                      </div>
                    ) : (
                      formData.date ? dayjs(formData.date).format('DD/MM/YYYY') : '-'
                    )}
                  </div>
                </div>
                
                <div className="mb-2">
                  <Text type="secondary">Thời gian:</Text>
                  <div>
                    {formData.timeRange ? 
                      `${dayjs(formData.timeRange[0]).format('HH:mm')} - ${dayjs(formData.timeRange[1]).format('HH:mm')}` 
                      : '-'
                    }
                  </div>
                </div>
              </Col>
              
              <Col xs={24} md={12}>
                <div className="mb-2">
                  <Text type="secondary">Loại sân:</Text>
                  <div>
                    {fieldGroups.find(g => g.id === formData.fieldGroupId)?.name || '-'}
                  </div>
                </div>
                
                <div className="mb-2">
                  <Text type="secondary">Phương thức thanh toán:</Text>
                  <div>
                    {formData.paymentMethod === 'banking' ? 'Chuyển khoản ngân hàng' :
                     formData.paymentMethod === 'momo' ? 'Ví MoMo' :
                     formData.paymentMethod === 'vnpay' ? 'VNPay' :
                     formData.paymentMethod === 'cash' ? 'Tiền mặt' : '-'}
                  </div>
                </div>
              </Col>
            </Row>
            
            <Divider />
            
            <div>
              <Title level={5} className="mb-2">Chi tiết thanh toán</Title>
              
              <div className="flex justify-between mb-2">
                <Text>Giá sân:</Text>
                <Text>
                  {formData.fieldGroupId ? 
                    formatCurrency(fieldGroups.find(g => g.id === formData.fieldGroupId)?.basePrice || 0) 
                    : '-'
                  }
                </Text>
              </div>
              
              {formData.services && formData.services.length > 0 && (
                <div className="flex justify-between mb-2">
                  <Text>Dịch vụ:</Text>
                  <Text>
                    {formatCurrency(
                      formData.services.reduce((total, service) => {
                        const serviceInfo = services.find(s => s.id === service.serviceId);
                        return total + (serviceInfo?.price || 0) * service.quantity;
                      }, 0)
                    )}
                  </Text>
                </div>
              )}
              
              {formData.isRecurring && (
                <div className="flex justify-between mb-2">
                  <Text>Số ngày đặt:</Text>
                  <Text>{selectedDates.length}</Text>
                </div>
              )}
              
              <Divider />
              
              <div className="flex justify-between text-lg font-bold">
                <Text>Tổng cộng:</Text>
                <Text className="text-blue-600">{formatCurrency(calculateTotalPrice())}</Text>
              </div>
            </div>
          </div>
        </Card>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <a onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800">Trang chủ</a>
        <span className="mx-2">/</span>
        <a onClick={() => navigate(`/facility/${facilityId}`)} className="text-blue-600 hover:text-blue-800">Thông tin cơ sở</a>
        <span className="mx-2">/</span>
        <span>Đặt sân</span>
      </div>
      
      {/* Title and Timer */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="m-0">Đặt sân</Title>
        {currentStep > 0 && (
          <div className="flex items-center">
            <ClockCircleOutlined className="mr-2 text-red-500" />
            <Text className="text-red-500">Thời gian còn lại: {formatTime(timeRemaining)}</Text>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          className="mb-4"
          closable
          onClose={() => setError(null)}
        />
      )}
      
      {/* Steps */}
      <Steps
        current={currentStep}
        items={steps.map(item => ({ key: item.title, title: item.title }))}
        className="mb-8"
      />
      
      {/* Step Content */}
      <div className="mb-8">
        {steps[currentStep].content}
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button 
          onClick={handlePrev}
          disabled={currentStep === 0}
          icon={<ArrowLeftOutlined />}
        >
          Quay lại
        </Button>
        
        {currentStep < steps.length - 1 ? (
          <Button 
            type="primary" 
            onClick={handleNext}
            loading={loading}
          >
            Tiếp theo <ArrowRightOutlined />
          </Button>
        ) : (
          <Button 
            type="primary" 
            onClick={() => setShowConfirmModal(true)}
            loading={loading}
          >
            Xác nhận đặt sân <CheckCircleOutlined />
          </Button>
        )}
      </div>
      
      {/* Confirm Modal */}
      <Modal
        title="Xác nhận đặt sân"
        open={showConfirmModal}
        onOk={handleSubmitBooking}
        onCancel={() => setShowConfirmModal(false)}
        confirmLoading={loading}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn đặt sân với thông tin đã chọn?</p>
        <p>Tổng số tiền: <span className="text-blue-600 font-bold">{formatCurrency(calculateTotalPrice())}</span></p>
        {formData.paymentMethod !== 'cash' && (
          <Alert
            message="Lưu ý"
            description="Bạn sẽ được chuyển đến trang thanh toán sau khi xác nhận."
            type="info"
            showIcon
            className="mt-4"
          />
        )}
      </Modal>

      {/* Recurring Modal - Redesigned */}
      <Modal
        title="Đặt sân định kỳ"
        open={showRecurringModal}
        onOk={handleRecurringModalOk}
        onCancel={() => setShowRecurringModal(false)}
        width={800}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <div className="space-y-4">
          <Alert
            message="Lưu ý: Bạn chỉ có thể đặt sân định kỳ trong vòng 1 tháng kể từ ngày hiện tại"
            type="info"
            showIcon
            className="mb-4"
          />

          <div>
            <Text strong>Chọn phương thức:</Text>
            <Radio.Group 
              className="ml-4"
              value={recurringSelectionMode}
              onChange={e => handleRecurringModeChange(e.target.value)}
            >
              <Radio value="auto">Tự động</Radio>
              <Radio value="manual">Tùy chọn</Radio>
            </Radio.Group>
          </div>

          {recurringSelectionMode === 'auto' && (
            <div>
              <Text strong>Chọn loại định kỳ:</Text>
              <Radio.Group 
                className="ml-4"
                value={recurringType}
                onChange={e => handleRecurringTypeChange(e.target.value)}
              >
                <Space direction="vertical">
                  <Radio value={RecurringType.DAILY}>Hàng ngày</Radio>
                  <Radio value={RecurringType.WEEKLY}>Hàng tuần</Radio>
                </Space>
              </Radio.Group>
              
              {recurringType === RecurringType.WEEKLY && (
                <div className="mt-4 ml-4">
                  <Text>Chọn thêm tối đa 2 ngày trong tuần:</Text>
                  <div className="mt-2">
                    <Checkbox.Group
                      options={WEEKDAYS.filter(day => day.value !== form.getFieldValue('date')?.day()).map(day => ({
                        label: day.label,
                        value: day.value
                      }))}
                      value={additionalWeekdays}
                      onChange={handleAdditionalWeekdayChange}
                    />
                  </div>
                  <Text type="secondary" className="block mt-1">
                    Đã chọn: {additionalWeekdays.length} ngày
                  </Text>
                </div>
              )}
            </div>
          )}

          <Divider />

          {recurringSelectionMode === 'auto' ? (
            <div>
              <Text strong>Các ngày đã chọn tự động:</Text>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedDates.map(date => (
                  <Tag key={date.format('YYYY-MM-DD')} color="blue">
                    {date.format('DD/MM/YYYY')} ({getWeekdayName(date)})
                  </Tag>
                ))}
              </div>
              <Text type="secondary" className="block mt-2">
                Các ngày này được tự động tạo dựa trên ngày đặt sân ({form.getFieldValue('date')?.format('DD/MM/YYYY')}) và loại định kỳ bạn đã chọn
              </Text>
            </div>
          ) : (
            <div>
              <Text strong>Chọn ngày thủ công:</Text>
              <div className="mt-2">
                <Calendar
                  fullscreen={false}
                  onSelect={handleDateSelect}
                  disabledDate={current => {
                    // Disable dates before today or after 1 month from now
                    return (current && current < dayjs().startOf('day')) || 
                          (current && current > maxBookingDate);
                  }}
                  dateCellRender={date => {
                    const isSelected = selectedDates.some(d => d.isSame(date, 'day'));
                    const isToday = date.isSame(dayjs(), 'day');
                    return isSelected ? (
                      <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                        {date.date()}
                      </div>
                    ) : isToday ? (
                      <div className="border border-blue-500 text-blue-500 rounded-full w-6 h-6 flex items-center justify-center">
                        {date.date()}
                      </div>
                    ) : null;
                  }}
                />
              </div>
              <div className="mt-4">
                <Text strong>Ngày đã chọn ({selectedDates.length}):</Text>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedDates.map(date => (
                    <Tag 
                      key={date.format('YYYY-MM-DD')} 
                      color="blue"
                      closable
                      onClose={() => {
                        setSelectedDates(prev => prev.filter(d => !d.isSame(date, 'day')));
                      }}
                    >
                      {date.format('DD/MM/YYYY')} ({getWeekdayName(date)})
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default BookingPage;
