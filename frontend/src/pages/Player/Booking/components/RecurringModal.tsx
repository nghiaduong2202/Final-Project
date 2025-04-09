import React, { useState, useEffect } from 'react';
import { Modal, Select, InputNumber, Radio, DatePicker, Checkbox, Space, Row, Col } from 'antd';
import { RecurringType } from '@/types/booking.type';
import type { FormInstance } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

interface RecurringModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  recurringType: RecurringType;
  recurrenceFrequency: number;
  recurrenceEndType: 'never' | 'on_date' | 'after_occurrences';
  recurrenceEndDate: dayjs.Dayjs | null;
  recurrenceEndOccurrences: number;
  additionalWeekdays: number[];
  selectedDates: dayjs.Dayjs[];
  handleRecurringTypeChange: (type: RecurringType) => void;
  handleRecurrenceFrequencyChange: (freq: number) => void;
  handleRecurrenceEndTypeChange: (type: 'never' | 'on_date' | 'after_occurrences') => void;
  handleRecurrenceEndDateChange: (date: dayjs.Dayjs | null) => void;
  handleRecurrenceEndOccurrencesChange: (occurrences: number) => void;
  getWeekdayName: (date: dayjs.Dayjs | null) => string;
  form: FormInstance;
  handleAdditionalWeekdaysChange: (weekdays: number[]) => void;
  saveCustomRecurringOption: (label: string) => void;
  generateRecurringDates: (date: dayjs.Dayjs, type: RecurringType) => dayjs.Dayjs[];
}

const RecurringModal: React.FC<RecurringModalProps> = ({
  visible,
  onOk,
  onCancel,
  recurringType,
  recurrenceFrequency,
  recurrenceEndType,
  recurrenceEndDate,
  recurrenceEndOccurrences,
  additionalWeekdays,
  selectedDates,
  handleRecurringTypeChange,
  handleRecurrenceFrequencyChange,
  handleRecurrenceEndTypeChange,
  handleRecurrenceEndDateChange,
  handleRecurrenceEndOccurrencesChange,
  getWeekdayName,
  form,
  handleAdditionalWeekdaysChange,
  saveCustomRecurringOption,
  generateRecurringDates
}) => {
  const [localRecurringType, setLocalRecurringType] = useState<'daily' | 'weekly'>(
    recurringType === RecurringType.DAILY ? 'daily' : 'weekly'
  );
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>(additionalWeekdays);
  const [customLabel, setCustomLabel] = useState('');

  useEffect(() => {
    // Initialize the local state based on recurringType
    setLocalRecurringType(recurringType === RecurringType.DAILY ? 'daily' : 'weekly');
    
    // Get the base date from the form
    const baseDate = form.getFieldValue('date');
    
    // If we're in weekly mode and have a base date, ensure its weekday is included
    if (recurringType === RecurringType.WEEKLY && baseDate) {
      const baseDayOfWeek = baseDate.day();
      
      // Create a new array that includes both the existing weekdays and the base day
      if (!additionalWeekdays.includes(baseDayOfWeek)) {
        const updatedWeekdays = [...additionalWeekdays, baseDayOfWeek];
        setSelectedWeekdays(updatedWeekdays);
        // We don't call handleAdditionalWeekdaysChange here to avoid side effects
      } else {
        setSelectedWeekdays(additionalWeekdays);
      }
    } else {
      // For other recurring types, just use the additionalWeekdays directly
      setSelectedWeekdays(additionalWeekdays);
    }
    
    // Generate the custom label
    updateCustomLabel();
  }, [recurringType, additionalWeekdays, recurrenceFrequency, form]);

  // Update the actual recurring type when local type changes
  const handleLocalTypeChange = (type: 'daily' | 'weekly') => {
    setLocalRecurringType(type);
    const newRecurringType = type === 'daily' ? RecurringType.DAILY : RecurringType.WEEKLY;
    handleRecurringTypeChange(newRecurringType);
    
    // Regenerate dates with the new type
    const baseDate = form.getFieldValue('date');
    if (baseDate) {
      generateRecurringDates(baseDate, newRecurringType);
    }
    
    updateCustomLabel();
  };

  // Handle weekday selection for weekly recurrence
  const handleWeekdayChange = (checkedValues: number[]) => {
    // Get the base date from the form
    const currentBaseDate = form.getFieldValue('date');
    
    if (currentBaseDate) {
      const baseDayOfWeek = currentBaseDate.day();
      
      // If the base day is being unchecked, add it back
      if (!checkedValues.includes(baseDayOfWeek)) {
        checkedValues.push(baseDayOfWeek);
      }
    }
    
    // Update state and notify parent component
    setSelectedWeekdays(checkedValues);
    handleAdditionalWeekdaysChange(checkedValues);
    
    // Regenerate dates with the updated weekdays
    if (currentBaseDate) {
      generateRecurringDates(currentBaseDate, localRecurringType === 'daily' ? RecurringType.DAILY : RecurringType.WEEKLY);
    }
    
    updateCustomLabel();
  };

  // Update handleFrequencyChange to handle null values
  const handleFrequencyChange = (value: number | null) => {
    handleRecurrenceFrequencyChange(value || 1);
    
    // Regenerate dates with the new frequency
    const baseDate = form.getFieldValue('date');
    if (baseDate) {
      generateRecurringDates(baseDate, localRecurringType === 'daily' ? RecurringType.DAILY : RecurringType.WEEKLY);
    }
    
    updateCustomLabel();
  };

  // Generate the label for the custom recurring option
  const updateCustomLabel = () => {
    const frequency = recurrenceFrequency;
    let label = '';
    
    if (localRecurringType === 'daily') {
      if (frequency === 1) {
        label = 'Hàng ngày';
      } else {
        label = `${frequency} ngày một lần`;
      }
    } else { // weekly
      if (frequency === 1) {
        if (selectedWeekdays.length > 0) {
          const weekdayNames = selectedWeekdays.map(day => {
            const date = dayjs().day(day);
            return getWeekdayName(date);
          }).join(', ');
          label = `Hàng tuần vào ${weekdayNames}`;
        } else {
          const baseDate = form.getFieldValue('date');
          label = `Hàng tuần vào ${getWeekdayName(baseDate)}`;
        }
      } else {
        if (selectedWeekdays.length > 0) {
          const weekdayNames = selectedWeekdays.map(day => {
            const date = dayjs().day(day);
            return getWeekdayName(date);
          }).join(', ');
          label = `${frequency} tuần một lần vào ${weekdayNames}`;
        } else {
          const baseDate = form.getFieldValue('date');
          label = `${frequency} tuần một lần vào ${getWeekdayName(baseDate)}`;
        }
      }
    }
    
    setCustomLabel(label);
  };

  // Handle OK button click
  const handleOk = () => {
    // Save the custom label to be used as a new option
    saveCustomRecurringOption(customLabel);
    onOk();
  };

  // Update the recurrence end type handler
  const handleEndTypeChange = (value: 'never' | 'on_date' | 'after_occurrences') => {
    handleRecurrenceEndTypeChange(value);
    
    // Regenerate dates with the new end type
    const baseDate = form.getFieldValue('date');
    if (baseDate) {
      generateRecurringDates(baseDate, localRecurringType === 'daily' ? RecurringType.DAILY : RecurringType.WEEKLY);
    }
  };

  // Update the recurrence end date handler
  const handleEndDateChange = (date: dayjs.Dayjs | null) => {
    handleRecurrenceEndDateChange(date);
    
    // Regenerate dates with the new end date
    const baseDate = form.getFieldValue('date');
    if (baseDate && date) {
      generateRecurringDates(baseDate, localRecurringType === 'daily' ? RecurringType.DAILY : RecurringType.WEEKLY);
    }
  };

  // Update handleOccurrencesChange to handle null values
  const handleOccurrencesChange = (value: number | null) => {
    handleRecurrenceEndOccurrencesChange(value || 1);
    
    // Regenerate dates with the new occurrences
    const baseDate = form.getFieldValue('date');
    if (baseDate) {
      generateRecurringDates(baseDate, localRecurringType === 'daily' ? RecurringType.DAILY : RecurringType.WEEKLY);
    }
  };

  // Add a function to display selected dates
  const getDatesSummary = (): JSX.Element => {
    if (selectedDates.length === 0) {
      return <div className="text-gray-500">Chưa có ngày nào được chọn</div>;
    }

    const firstDate = selectedDates[0];
    const lastDate = selectedDates[selectedDates.length - 1];
    
    return (
      <div className="text-gray-700">
        <div className="mb-1"><span className="font-medium">Bắt đầu:</span> {firstDate.format('DD/MM/YYYY')} ({getWeekdayName(firstDate)})</div>
        {selectedDates.length > 1 && (
          <div className="mb-1"><span className="font-medium">Kết thúc:</span> {lastDate.format('DD/MM/YYYY')} ({getWeekdayName(lastDate)})</div>
        )}
        <div><span className="font-medium">Tổng số ngày:</span> {selectedDates.length}</div>
      </div>
    );
  };

  return (
    <Modal
      title="Lặp lại tùy chỉnh"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
      okText="Xong"
      cancelText="Hủy"
    >
      <div className="space-y-4">
        <div className="flex flex-col space-y-4">
          {/* Recurrence Frequency */}
          <div className="flex items-center pb-4 border-b">
            <span className="mr-2">Lặp lại mỗi</span>
            <InputNumber 
              min={1} 
              max={30} 
              value={recurrenceFrequency} 
              onChange={handleFrequencyChange}
              className="w-16 mx-2"
            />
            <Select 
              value={localRecurringType} 
              onChange={handleLocalTypeChange}
              style={{ width: 120 }}
            >
              <Option value="daily">ngày</Option>
              <Option value="weekly">tuần</Option>
            </Select>
          </div>
          
          {/* Weekly options - only show if weekly is selected */}
          {localRecurringType === 'weekly' && (
            <div className="pt-2 pb-4 border-b">
              <div className="mb-2">Lặp lại vào</div>
              <Checkbox.Group 
                value={selectedWeekdays}
                onChange={handleWeekdayChange}
              >
                <Row className="flex flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 0].map(day => {
                    const baseDate = form.getFieldValue('date');
                    const isBaseDateWeekday = baseDate && baseDate.day() === day;
                    const weekdayLabel = day === 0 ? 'Chủ nhật' : `Thứ ${day + 1}`;
                    
                    return (
                      <Col span={8} key={day}>
                        <Checkbox 
                          value={day} 
                          disabled={isBaseDateWeekday}
                        >
                          {weekdayLabel} {isBaseDateWeekday && '(ngày đã chọn)'}
                        </Checkbox>
                      </Col>
                    );
                  })}
                </Row>
              </Checkbox.Group>
            </div>
          )}
          
          {/* Recurrence End */}
          <div className="pt-2">
            <div className="mb-2">Kết thúc</div>
            <Radio.Group 
              value={recurrenceEndType}
              onChange={e => handleEndTypeChange(e.target.value)}
            >
              <Space direction="vertical">
                <Radio value="never">Không bao giờ</Radio>
                <Radio value="on_date">
                  <Space>
                    Vào ngày
                    <DatePicker
                      format="DD/MM/YYYY"
                      value={recurrenceEndDate}
                      onChange={handleEndDateChange}
                      disabledDate={current => 
                        current && (
                          current < dayjs().startOf('day') || 
                          current > dayjs().add(60, 'day')
                        )
                      }
                      disabled={recurrenceEndType !== 'on_date'}
                    />
                  </Space>
                </Radio>
                <Radio value="after_occurrences">
                  <Space>
                    Sau
                    <InputNumber
                      min={1}
                      max={30}
                      value={recurrenceEndOccurrences}
                      onChange={value => handleOccurrencesChange(value || 1)}
                      disabled={recurrenceEndType !== 'after_occurrences'}
                    />
                    lần xuất hiện
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </div>

          {/* Preview section */}
          <div className="pt-4 mt-4 border-t">
            <div className="text-sm text-gray-500 mb-2">Khi hoàn thành, một mục mới sẽ được tạo:</div>
            <div className="font-medium bg-blue-50 p-2 rounded">
              {customLabel}
            </div>
          </div>

          {/* Add a date summary section */}
          {selectedDates.length > 0 && (
            <div className="pt-4 mt-4 border-t">
              <div className="text-sm text-gray-500 mb-2">Các ngày đã chọn:</div>
              {getDatesSummary()}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RecurringModal; 