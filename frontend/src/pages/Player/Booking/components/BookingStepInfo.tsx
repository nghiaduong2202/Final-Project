import React, { useState, useEffect } from 'react';
import { Form, Card, Col, Select, DatePicker, TimePicker, Tag, FormInstance, Button, Space, Typography, Divider, message } from 'antd';
import { CalendarOutlined, InfoCircleOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { RecurringType, BookingFormData } from '@/types/booking.type';
import { getSportNameInVietnamese } from '@/utils/translateSport';
import OperatingHoursDisplay from '@/components/shared/OperatingHoursDisplay';

const { Option } = Select;
const { RangePicker } = TimePicker;
const { Text } = Typography;

interface BookingStepInfoProps {
  form: FormInstance;
  formData: Partial<BookingFormData>;
  sports: { id: number; name: string }[];
  handleDateChange: (date: dayjs.Dayjs | null) => void;
  selectedWeekday: string;
  selectedDates: dayjs.Dayjs[];
  setSelectedDates: (dates: dayjs.Dayjs[]) => void;
  setShowRecurringModal: (show: boolean) => void;
  setRecurringType: (type: RecurringType) => void;
  generateRecurringDates: (date: dayjs.Dayjs, type: RecurringType) => dayjs.Dayjs[];
  getWeekdayName: (date: dayjs.Dayjs | null) => string;
  maxBookingDate: dayjs.Dayjs;
  customRecurringOptions?: { value: string; label: string; type: RecurringType }[];
  onRecurringOptionChange?: (value: string) => void;
  validateTimeRange?: (rule: unknown, timeRange: [dayjs.Dayjs, dayjs.Dayjs] | null) => Promise<void>;
  operatingTimes?: {
    openTime1: string | null;
    closeTime1: string | null;
    openTime2: string | null;
    closeTime2: string | null;
    openTime3: string | null;
    closeTime3: string | null;
  };
}

const BookingStepInfo: React.FC<BookingStepInfoProps> = ({
  form,
  formData,
  sports,
  handleDateChange,
  selectedWeekday,
  selectedDates,
  setSelectedDates,
  setShowRecurringModal,
  setRecurringType,
  generateRecurringDates,
  getWeekdayName,
  maxBookingDate,
  customRecurringOptions,
  onRecurringOptionChange,
  validateTimeRange,
  operatingTimes
}) => {
  const [showAllDates, setShowAllDates] = useState(false);
  const [recurringOption, setRecurringOption] = useState(formData.recurringOption || 'none');
  const [timeRangeSelected, setTimeRangeSelected] = useState(false);
  const [displayTimeRange, setDisplayTimeRange] = useState<dayjs.Dayjs[] | null>(
    formData.timeRange && Array.isArray(formData.timeRange) ? formData.timeRange : null
  );
  
  // Update local state when form value changes
  useEffect(() => {
    if (formData.recurringOption) {
      setRecurringOption(formData.recurringOption);
    }
  }, [formData.recurringOption]);
  
  // Set timeRangeSelected state when timeRange is present in formData
  useEffect(() => {
    if (formData.timeRange && Array.isArray(formData.timeRange) && 
        formData.timeRange.length === 2 && 
        formData.timeRange[0] && formData.timeRange[1]) {
      setTimeRangeSelected(true);
      setDisplayTimeRange(formData.timeRange);
    }
  }, [formData.timeRange]);
  
  // Ensure dates are shown immediately after selection
  useEffect(() => {
    // When navigating back to this step or when form data changes
    if (formData.date) {
      const selectedDate = dayjs(formData.date);
      
      // If we don't have this date in selectedDates yet, add it
      if (!selectedDates.some(d => d.isSame(selectedDate, 'day'))) {
        if (formData.isRecurring && formData.recurringConfig?.type) {
          // For recurring bookings, regenerate all dates
          generateRecurringDates(selectedDate, formData.recurringConfig.type);
        } else {
          // For non-recurring, just set the single date
          setSelectedDates([selectedDate]);
        }
      }
    }
  }, [formData.date, formData.isRecurring, formData.recurringConfig]);

  // Add a useEffect hook to update selectedDates whenever the date changes
  useEffect(() => {
    const currentDate = form.getFieldValue('date');
    if (currentDate && (!selectedDates.length || !selectedDates.some(d => d.isSame(currentDate, 'day')))) {
      // Add the currently selected date to selectedDates if it's not already there
      setSelectedDates([currentDate]);
    }
  }, [form, selectedDates, setSelectedDates]);

  // Format date for display
  const formatDate = (date: dayjs.Dayjs): string => {
    return `${date.format('DD/MM/YYYY')} (${getWeekdayName(date)})`;
  };

  // Format time range for display
  const formatTimeRange = (timeRange: dayjs.Dayjs[]): string => {
    if (timeRange.length >= 2 && timeRange[0] && timeRange[1]) {
      return `${timeRange[0].format('HH:mm')} - ${timeRange[1].format('HH:mm')}`;
    }
    return '';
  };

  // Check if both date and time range are selected
  const isDateAndTimeSelected = (): boolean => {
    const date = form.getFieldValue('date');
    // Use both the form value and the timeRangeSelected state for more reliability
    return !!date && timeRangeSelected;
  };

  // Group selected dates by month for more organized display
  const groupDatesByMonth = (): Record<string, dayjs.Dayjs[]> => {
    const groups: Record<string, dayjs.Dayjs[]> = {};
    
    selectedDates.forEach(date => {
      const monthKey = date.format('MM/YYYY');
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(date);
    });
    
    return groups;
  };

  // Generate a summary of selected dates
  const getDatesSummary = (): JSX.Element => {
    if (!selectedDates.length) {
      return (
        <div className="text-gray-500 italic">
          Chưa có ngày nào được chọn. Vui lòng chọn ngày và loại lặp lại.
        </div>
      );
    }
    
    const groups = groupDatesByMonth();
    const monthNames = Object.keys(groups);
    
    if (showAllDates) {
      return (
        <div className="space-y-3">
          {displayTimeRange && displayTimeRange.length === 2 && (
            <div className="mb-3">
              <Text strong className="flex items-center">
                <ClockCircleOutlined className="mr-2 text-blue-500" /> 
                Thời gian chơi: <span className="text-blue-600 ml-1">{formatTimeRange(displayTimeRange)}</span>
              </Text>
            </div>
          )}
          {monthNames.map(month => (
            <div key={month}>
              <div className="font-medium text-gray-700 mb-1">Tháng {month}</div>
              <div className="flex flex-wrap gap-2">
                {groups[month].map(date => (
                  <Tag 
                    key={date.format('YYYY-MM-DD')} 
                    color="blue"
                  >
                    {date.format('DD/MM')} ({getWeekdayName(date)})
                  </Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      // Hiển thị tóm tắt nếu không mở rộng
      const firstDate = selectedDates[0];
      const lastDate = selectedDates[selectedDates.length - 1];
      
      return (
        <div>
          {displayTimeRange && displayTimeRange.length === 2 && (
            <div className="my-3">
              <Text strong className="flex items-center">
                <ClockCircleOutlined className="mr-2 text-blue-500" /> 
                Thời gian chơi: <span className="text-blue-600 ml-1">{formatTimeRange(displayTimeRange)}</span>
              </Text>
            </div>
          )}
          
          <div className="text-gray-700 grid grid-cols-2 gap-2 mb-3">
            <div><Text strong>Bắt đầu:</Text> <Text className="text-blue-600">{formatDate(firstDate)}</Text></div>
            {selectedDates.length > 1 && <div><Text strong>Kết thúc:</Text> <Text className="text-blue-600">{formatDate(lastDate)}</Text></div>}
            <div className="col-span-2 mt-1"><Text strong>Tổng số ngày:</Text> <Text className="text-blue-600">{selectedDates.length}</Text></div>
          </div>
          
          {selectedDates.length > 1 && (
            <>
              <Divider className="my-2" />
              <div className="flex flex-wrap gap-2">
                {selectedDates.slice(0, 5).map(date => (
                  <Tag 
                    key={date.format('YYYY-MM-DD')} 
                    color="blue"
                  >
                    {date.format('DD/MM')} ({getWeekdayName(date)})
                  </Tag>
                ))}
                {selectedDates.length > 5 && (
                  <Tag color="default">+{selectedDates.length - 5} ngày khác</Tag>
                )}
              </div>
            </>
          )}
        </div>
      );
    }
  };

  // Handle recurring option change
  const handleRecurringOptionChange = (value: string) => {
    const selectedDate = form.getFieldValue('date');
    
    // Only validate date selection for options other than "none"
    if (value !== 'none' && !selectedDate) {
      message.error('Vui lòng chọn ngày đặt sân trước khi đặt định kỳ');
      return; // Don't change the value if validation fails
    }
    
    if (value === 'custom') {
      // For "Tùy chỉnh...", just open the modal without changing the stored option
      setShowRecurringModal(true);
      return; // Don't update the select value to keep the previous selection
    }
    
    // Update local state first
    setRecurringOption(value);
    
    // Then update form value
    form.setFieldsValue({ recurringOption: value });
    
    // Notify parent component if callback is provided
    if (onRecurringOptionChange) {
      onRecurringOptionChange(value);
    }
    
    if (value === 'none') {
      // For "Không lặp lại", set isRecurring false and keep only the selected date
      form.setFieldsValue({ isRecurring: false });
      if (selectedDate) {
        setSelectedDates([selectedDate]);
      }
    } else if (value.startsWith('custom_')) {
      // For saved custom options, just update isRecurring
      form.setFieldsValue({ isRecurring: true });
    } else {
      // For other preset options, set isRecurring true
      form.setFieldsValue({ isRecurring: true });
      
      // Apply preset recurring patterns
      let type = RecurringType.NONE;
      switch(value) {
        case 'daily':
          type = RecurringType.DAILY;
          break;
        case 'weekly':
          type = RecurringType.WEEKLY;
          break;
        case 'same_week':
          type = RecurringType.SAME_WEEK;
          break;
      }
      
      setRecurringType(type);
      generateRecurringDates(selectedDate, type);
    }
  };

  // DatePicker onChange handler
  const handleDatePickerChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      // Call the parent component's date change handler
      handleDateChange(date);
      
      // Apply the appropriate date generation based on current recurring option
      if (recurringOption === 'none') {
        // For non-recurring, just set this single date
        setSelectedDates([date]);
      } else {
        // For recurring options, re-apply the current recurring pattern to the new date
        let type = RecurringType.NONE;
        switch(recurringOption) {
          case 'daily':
            type = RecurringType.DAILY;
            break;
          case 'weekly':
            type = RecurringType.WEEKLY;
            break;
          case 'same_week':
            type = RecurringType.SAME_WEEK;
            break;
          case 'custom':
            // For custom, we need to reopen the modal or use existing configuration
            if (formData.recurringConfig?.type) {
              type = formData.recurringConfig.type;
            }
            break;
        }
        
        if (type !== RecurringType.NONE) {
          setRecurringType(type);
          // Generate new dates based on the changed date but with the same pattern
          generateRecurringDates(date, type);
        }
      }
    } else {
      // Display error if date is cleared while having recurring option selected
      if (recurringOption !== 'none') {
        message.error('Không thể xóa ngày khi đã chọn đặt sân định kỳ');
      }
    }
  };
  
  // Time range picker handler
  const handleTimeRangeChange = (times: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    // Mark time range as selected when valid times are chosen
    if (times && times[0] && times[1]) {
      setTimeRangeSelected(true);
      // Filter out any null values and ensure we have valid dayjs objects
      const validTimes = [times[0], times[1]].filter(Boolean) as dayjs.Dayjs[];
      setDisplayTimeRange(validTimes);
      
      // Validate if time range is at least 30 minutes
      const startTime = times[0];
      const endTime = times[1];
      const durationMinutes = endTime.diff(startTime, 'minute');
      
      if (durationMinutes < 30) {
        message.error('Thời gian đặt sân tối thiểu là 30 phút');
      }
      
      // Trigger form validation to update UI state
      form.validateFields(['timeRange']).catch(() => {
        // Ignore validation errors
      });
    } else {
      setTimeRangeSelected(false);
      setDisplayTimeRange(null);
    }
  };

  return (
    <Card className="shadow-md">
      <Form
        form={form}
        layout="vertical"
        initialValues={formData}
        onValuesChange={(changedValues) => {
          // Update UI immediately when date or time changes
          if (changedValues.date) {
            handleDateChange(changedValues.date);
          }
          
          // Update local state when the form value changes
          if (changedValues.recurringOption) {
            setRecurringOption(changedValues.recurringOption);
          }
        }}
      >
        <Col span={24}>
          <Form.Item
            name="sportId"
            label="Loại hình thể thao"
            rules={[{ required: true, message: 'Vui lòng chọn loại hình thể thao' }]}
          >
            <Select placeholder="Chọn loại hình thể thao">
              {sports.map(sport => (
                <Option key={sport.id} value={sport.id}>{getSportNameInVietnamese(sport.name)}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        
        <Col span={24}>
          <Card className="border border-gray-200 shadow-sm">
            <h5 className="text-lg font-medium mb-3">Chọn thời gian</h5>
            
            <Form.Item
              name="date"
              label="Ngày đặt sân"
              rules={[{ required: true, message: 'Vui lòng chọn ngày đặt sân' }]}
              tooltip={{
                title: 'Bạn có thể đặt sân trước tối đa 30 ngày kể từ hôm nay.',
                icon: <InfoCircleOutlined />
              }}
              style={{
                marginBottom: '0px'
              }}
            >
              <DatePicker 
                className="w-full" 
                format="DD/MM/YYYY"
                disabledDate={current => {
                  return (current && current < dayjs().startOf('day')) || 
                         (current && current > maxBookingDate);
                }}
                onChange={handleDatePickerChange}
              />
            </Form.Item>            
            {selectedWeekday && (
              <div className="mb-4 ml-2 text-blue-600 text-sm font-semibold">
                {selectedWeekday}
              </div>
            )}
            
            <Form.Item
              name="timeRange"
              label="Thời gian chơi"
              rules={[
                { required: true, message: 'Vui lòng chọn thời gian' },
                ...(validateTimeRange ? [{ validator: validateTimeRange }] : [])
              ]}
            >
              <RangePicker 
                className="w-full" 
                format="HH:mm"
                minuteStep={30}
                onChange={handleTimeRangeChange}
              />
            </Form.Item>
            
            {/* Hiển thị thông tin giờ hoạt động của cơ sở */}
            {operatingTimes && operatingTimes.openTime1 && operatingTimes.closeTime1 && (
              <div className="text-gray-500 text-xs mb-4">
                <OperatingHoursDisplay 
                  facility={operatingTimes as any} 
                  showIcon={true}
                  className="text-gray-600"
                />
                <div className="mt-1 text-xs italic">
                  <InfoCircleOutlined className="mr-1" />
                  Bạn chỉ có thể đặt sân trong khung giờ hoạt động của cơ sở
                </div>
              </div>
            )}
            
            <Form.Item
              label="Đặt sân định kỳ"
              tooltip={{
                title: 'Đặt sân định kỳ cho nhiều ngày (tối đa 30 ngày kể từ ngày đặt sân đầu tiên).',
                icon: <InfoCircleOutlined />
              }}
            >
              <Select 
                value={recurringOption}
                onChange={handleRecurringOptionChange}
              >
                <Option value="none">Không lặp lại</Option>
                <Option value="daily">Hàng ngày (tối đa 30 ngày)</Option>
                <Option value="weekly">Hàng tuần vào {selectedWeekday || 'ngày đã chọn'}</Option>
                <Option value="same_week">Mọi ngày trong tuần này</Option>
                {customRecurringOptions?.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
                <Option value="custom">Tùy chỉnh...</Option>
              </Select>
              
              {/* Hidden form field to store the value */}
              <Form.Item name="recurringOption" hidden>
                <input />
              </Form.Item>
            </Form.Item>
            
            {/* Only show selected dates section when both date and time range are selected */}
            {isDateAndTimeSelected() && selectedDates.length > 0 && (
              <div className="mt-4 bg-blue-50 p-3 rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold flex items-center">
                    <CalendarOutlined className="mr-2 text-blue-600" />
                    Lịch đặt sân                    
                  </span>
                  <Space>
                    {showAllDates ? (
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => setShowAllDates(false)}
                      >
                        Thu gọn
                      </Button>
                    ) : selectedDates.length > 5 && (
                      <Button 
                        type="link" 
                        size="small" 
                        icon={<EyeOutlined />}
                        onClick={() => setShowAllDates(true)}
                      >
                        Xem tất cả
                      </Button>
                    )}
                  </Space>
                </div>
                
                {getDatesSummary()}
                
                <div className="text-xs text-gray-500 mt-4">
                  <InfoCircleOutlined className="mr-1" /> 
                  Tối đa 30 ngày kể từ ngày đặt sân đầu tiên. Ngày đầu tiên đặt sân không được vượt quá 30 ngày so với thời điểm hiện tại.
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Hidden form item for isRecurring */}
        <Form.Item name="isRecurring" hidden>
          <input type="checkbox" />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default BookingStepInfo; 