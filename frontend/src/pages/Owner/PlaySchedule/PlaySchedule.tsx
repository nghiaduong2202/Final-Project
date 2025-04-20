import React, { useState, useEffect, useRef } from 'react';
import { 
  Select, Button, Input, DatePicker, Space, Typography, 
  Badge, Card, Modal, Table, message
} from 'antd';
import {
  SearchOutlined, LeftOutlined, RightOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { facilityService, FacilityDropdownItem } from '@/services/facility.service';
import bookingService from '@/services/booking.service';

const { Title, Text } = Typography;
const { Option } = Select;

// Storage key for selected facility
const SELECTED_FACILITY_KEY = 'owner_selected_facility_play_schedule';

// Interfaces for API responses
interface FieldType {
  id: number;
  name: string;
  status: string;
}

interface FieldGroupType {
  id: string;
  name: string;
  fields: FieldType[];
}

interface FacilityType {
  id: string;
  name: string;
  openTime1: string;
  closeTime1: string;
  openTime2: string | null;
  closeTime2: string | null;
  openTime3: string | null;
  closeTime3: string | null;
  numberOfShifts: number;
  fieldGroups: FieldGroupType[];
}

interface BookingScheduleItem {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  payment: {
    id: string;
    fieldPrice: number;
    servicePrice: number | null;
    discount: number | null;
    status: string;
  };
  player?: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  field: {
    id: number;
    name: string;
    status: string;
  };
}

interface SlotInfo {
  time: string;
  field: string;
  fieldId: number;
  booking: BookingScheduleItem | null;
}

const PlaySchedule: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const isMobile = containerWidth < 768;
  
  // States for data
  const [facilities, setFacilities] = useState<FacilityDropdownItem[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<FacilityType | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [fieldGroups, setFieldGroups] = useState<FieldGroupType[]>([]);
  const [selectedFieldGroup, setSelectedFieldGroup] = useState<FieldGroupType | null>(null);
  const [selectedFieldGroupId, setSelectedFieldGroupId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // States for search and date
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<SlotInfo | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // Booking data
  const [bookingSchedule, setBookingSchedule] = useState<BookingScheduleItem[]>([]);
  
  // Generate time slots based on facility operating hours (30 min intervals)
  const generateTimeSlots = () => {
    if (!selectedFacility) return [];
    
    const timeSlots: string[] = [];
    
    // Helper function to add time slots for a given time range
    const addTimeSlotsForRange = (startTime: string, endTime: string) => {
      if (!startTime || !endTime) return;
      
      const start = dayjs(`2023-01-01 ${startTime}`);
      const end = dayjs(`2023-01-01 ${endTime}`);
      
      let current = start;
      while (current.isBefore(end) || current.isSame(end)) {
        timeSlots.push(current.format('HH:mm'));
        current = current.add(30, 'minute');
      }
    };
    
    // Add time slots for each operating time range
    addTimeSlotsForRange(selectedFacility.openTime1, selectedFacility.closeTime1);
    
    if (selectedFacility.openTime2 && selectedFacility.closeTime2) {
      addTimeSlotsForRange(selectedFacility.openTime2, selectedFacility.closeTime2);
    }
    
    if (selectedFacility.openTime3 && selectedFacility.closeTime3) {
      addTimeSlotsForRange(selectedFacility.openTime3, selectedFacility.closeTime3);
    }
    
    return timeSlots;
  };
  
  const timeSlots = generateTimeSlots();

  // Fetch facilities on component mount
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const facilityList = await facilityService.getFacilitiesDropdown();
        setFacilities(facilityList);
        
        // Get saved facility ID from localStorage or use the first one
        const savedFacilityId = localStorage.getItem(SELECTED_FACILITY_KEY);
        const isValidSavedId = savedFacilityId && facilityList.some(f => f.id === savedFacilityId);
        const initialFacilityId = isValidSavedId ? savedFacilityId : (facilityList.length > 0 ? facilityList[0].id : '');
        
        if (initialFacilityId) {
          setSelectedFacilityId(initialFacilityId);
          localStorage.setItem(SELECTED_FACILITY_KEY, initialFacilityId);
          await fetchFacilityDetails(initialFacilityId);
        }
      } catch (error) {
        console.error('Error fetching facilities:', error);
        message.error('Không thể tải danh sách cơ sở. Vui lòng thử lại sau.');
      }
    };
    
    fetchFacilities();
    
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Fetch facility details when selected facility changes
  const fetchFacilityDetails = async (facilityId: string) => {
    try {
      setLoading(true);
      const facilityDetails = await facilityService.getFacilityById(facilityId);
      setSelectedFacility(facilityDetails as unknown as FacilityType);
      
      // Set field groups from facility data
      if (facilityDetails && facilityDetails.fieldGroups) {
        setFieldGroups(facilityDetails.fieldGroups as unknown as FieldGroupType[]);
        
        // Select the first field group by default
        if (facilityDetails.fieldGroups.length > 0) {
          const firstFieldGroup = facilityDetails.fieldGroups[0];
          setSelectedFieldGroup(firstFieldGroup as unknown as FieldGroupType);
          setSelectedFieldGroupId(firstFieldGroup.id);
          
          // Fetch booking schedule for this field group
          await fetchBookingSchedule(firstFieldGroup.id, selectedDate.format('YYYY-MM-DD'));
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching facility details:', error);
      message.error('Không thể tải thông tin cơ sở. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Fetch booking schedule when field group or date changes
  const fetchBookingSchedule = async (fieldGroupId: string, date: string) => {
    try {
      setLoading(true);
      const bookings = await bookingService.getBookingSchedule(fieldGroupId, date);
      setBookingSchedule(bookings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching booking schedule:', error);
      message.error('Không thể tải lịch đặt sân. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Handle facility selection change
  const handleFacilityChange = async (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    localStorage.setItem(SELECTED_FACILITY_KEY, facilityId);
    await fetchFacilityDetails(facilityId);
  };

  // Handle field group selection change
  const handleFieldGroupChange = async (fieldGroupId: string) => {
    setSelectedFieldGroupId(fieldGroupId);
    const fieldGroup = fieldGroups.find(fg => fg.id === fieldGroupId) || null;
    setSelectedFieldGroup(fieldGroup);
    
    // Fetch booking schedule for this field group
    if (fieldGroupId) {
      await fetchBookingSchedule(fieldGroupId, selectedDate.format('YYYY-MM-DD'));
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleTodayClick = async () => {
    const today = dayjs();
    setSelectedDate(today);
    if (selectedFieldGroupId) {
      await fetchBookingSchedule(selectedFieldGroupId, today.format('YYYY-MM-DD'));
    }
  };

  const handleDateChange = async (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
      if (selectedFieldGroupId) {
        await fetchBookingSchedule(selectedFieldGroupId, date.format('YYYY-MM-DD'));
      }
    }
  };

  const handlePrevDay = async () => {
    const prevDay = selectedDate.subtract(1, 'day');
    setSelectedDate(prevDay);
    if (selectedFieldGroupId) {
      await fetchBookingSchedule(selectedFieldGroupId, prevDay.format('YYYY-MM-DD'));
    }
  };

  const handleNextDay = async () => {
    const nextDay = selectedDate.add(1, 'day');
    setSelectedDate(nextDay);
    if (selectedFieldGroupId) {
      await fetchBookingSchedule(selectedFieldGroupId, nextDay.format('YYYY-MM-DD'));
    }
  };

  const handleSlotClick = (time: string, fieldName: string, fieldId: number) => {
    // Get the time index
    const timeIndex = timeSlots.findIndex(t => t === time);
    
    // Get calendar data
    const calendarData = prepareCalendarData();
    
    // Find field data
    const fieldData = calendarData.find(data => data.fieldId === fieldId);
    
    if (!fieldData) {
      // Field not found, create empty slot info
      setCurrentSlot({
        time,
        field: fieldName,
        fieldId,
        booking: null
      });
    } else {
      // Check if this time slot has a booking
      // We need to check if this time index is within any booking's range
      const bookingData = fieldData.bookings.find(
        b => timeIndex >= b.startSlotIndex && timeIndex < b.endSlotIndex
      );
      
      if (bookingData) {
        // Slot has a booking
        setCurrentSlot({
          time,
          field: fieldName,
          fieldId,
          booking: bookingData.booking
        });
      } else {
        // Empty slot
        setCurrentSlot({
          time,
          field: fieldName,
          fieldId,
          booking: null
        });
      }
    }
    
    setIsModalVisible(true);
  };

  // Update the prepareCalendarData function
  const prepareCalendarData = () => {
    if (!selectedFieldGroup || !timeSlots.length) return [];

    // Helper function to convert time string to minutes for comparison
    const timeToMinutes = (timeString: string) => {
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Initialize calendar data structure
    const calendarData = selectedFieldGroup.fields.map(field => {
      return {
        fieldId: field.id,
        fieldName: field.name,
        bookings: [] as {
          booking: BookingScheduleItem;
          startSlotIndex: number;
          endSlotIndex: number;
          rowSpan: number;
        }[]
      };
    });

    // Process bookings for each field
    bookingSchedule.forEach(booking => {
      // Find field in our calendar data
      const fieldData = calendarData.find(data => data.fieldId === booking.field.id);
      if (!fieldData) return;

      // Find time slot indices for this booking
      const startIndex = timeSlots.findIndex(time => time === booking.startTime.substring(0, 5));
      let endIndex = timeSlots.findIndex(time => time === booking.endTime.substring(0, 5));
      
      // If end time is not exactly on a time slot, find the nearest slot before
      if (endIndex === -1) {
        // Find the slot just before the end time
        const endTimeMinutes = timeToMinutes(booking.endTime.substring(0, 5));
        endIndex = timeSlots.findIndex((time, index) => {
          const slotMinutes = timeToMinutes(time);
          const nextSlotMinutes = index < timeSlots.length - 1 ? timeToMinutes(timeSlots[index + 1]) : Infinity;
          return slotMinutes <= endTimeMinutes && nextSlotMinutes > endTimeMinutes;
        });
      }

      // If we couldn't find valid indices, skip this booking
      if (startIndex === -1 || endIndex === -1) return;

      // Calculate number of rows this booking spans
      const rowSpan = endIndex - startIndex;
      
      // Add booking to field data
      fieldData.bookings.push({
        booking,
        startSlotIndex: startIndex,
        endSlotIndex: endIndex,
        rowSpan: rowSpan > 0 ? rowSpan : 1
      });
    });

    return calendarData;
  };

  return (
    <div ref={containerRef} className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <Card className="mb-4 sm:mb-6" loading={loading}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
          <Title level={4} className="m-0 text-lg sm:text-xl">Lịch đặt sân</Title>
          <Button
            type="primary"
            icon={<HistoryOutlined />}
            onClick={() => setShowHistory(!showHistory)}
            size={isMobile ? "middle" : "large"}
          >
            {showHistory ? 'Xem lịch' : 'Lịch sử đặt sân'}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 sm:mb-6">
          <Space direction="vertical" size="middle" className="flex-grow" style={{ maxWidth: '100%' }}>
            <Select
              placeholder="Chọn cơ sở hoạt động"
              style={{ width: '100%' }}
              value={selectedFacilityId || undefined}
              onChange={handleFacilityChange}
              size={isMobile ? "middle" : "large"}
            >
              {facilities.map(facility => (
                <Option key={facility.id} value={facility.id}>{facility.name}</Option>
              ))}
            </Select>
            
            <Select
              placeholder="Chọn nhóm sân"
              style={{ width: '100%' }}
              value={selectedFieldGroupId || undefined}
              onChange={handleFieldGroupChange}
              size={isMobile ? "middle" : "large"}
            >
              {fieldGroups.map(fieldGroup => (
                <Option key={fieldGroup.id} value={fieldGroup.id}>{fieldGroup.name}</Option>
              ))}
            </Select>
          </Space>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <Input
            placeholder="Tìm kiếm tên người chơi"
            prefix={<SearchOutlined />}
            style={{ maxWidth: '100%' }}
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            size={isMobile ? "middle" : "large"}
            className="flex-grow"
          />
          
          <Space className="flex flex-wrap justify-center sm:justify-end gap-2">
            <Button onClick={handleTodayClick} size={isMobile ? "middle" : "large"}>
              Hôm nay
            </Button>
            
            <Space size="small">
              <Button icon={<LeftOutlined />} onClick={handlePrevDay} size={isMobile ? "middle" : "large"} />
              <DatePicker 
                value={selectedDate}
                onChange={handleDateChange}
                size={isMobile ? "middle" : "large"}
                style={{ width: isMobile ? '120px' : '140px' }}
              />
              <Button icon={<RightOutlined />} onClick={handleNextDay} size={isMobile ? "middle" : "large"} />
            </Space>
          </Space>
        </div>

        {showHistory ? (
          <div className="overflow-x-auto -mx-4 px-4 sm:-mx-0 sm:px-0">
            <Table
              dataSource={bookingSchedule}
              rowKey="id"
              columns={[
                {
                  title: 'Thời gian',
                  key: 'time',
                  width: isMobile ? '120px' : '150px',
                  render: (record) => `${record.startTime} - ${record.endTime}`
                },
                {
                  title: 'Sân',
                  dataIndex: ['field', 'name'],
                  key: 'field',
                  width: isMobile ? '80px' : '100px',
                },
                {
                  title: 'Người đặt',
                  key: 'player',
                  width: isMobile ? '120px' : '150px',
                  render: (record) => record.player ? record.player.name : 'N/A',
                },
                {
                  title: 'Giá tiền',
                  dataIndex: ['payment', 'fieldPrice'],
                  key: 'price',
                  width: isMobile ? '100px' : '120px',
                  render: (price) => price ? `${price.toLocaleString()} đ` : 'N/A'
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  width: isMobile ? '100px' : '120px',
                  render: (status) => (
                    <Badge 
                      status={
                        status === 'completed' ? 'success' : 
                        status === 'cancelled' ? 'error' : 'processing'
                      } 
                      text={
                        status === 'completed' ? 'Đã hoàn thành' : 
                        status === 'cancelled' ? 'Đã hủy' : 'Đang chờ'
                      }
                    />
                  ),
                },
                {
                  title: 'Thanh toán',
                  dataIndex: ['payment', 'status'],
                  key: 'payment',
                  width: isMobile ? '100px' : '120px',
                  render: (paymentStatus) => (
                    <Badge 
                      status={paymentStatus === 'paid' ? 'success' : 'warning'} 
                      text={paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    />
                  ),
                },
              ]}
              pagination={{
                pageSize: isMobile ? 5 : 10,
                showSizeChanger: false,
                size: isMobile ? "small" : "default"
              }}
              size={isMobile ? "small" : "middle"}
            />
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4 sm:-mx-0 sm:px-0">
            <div className="min-w-[650px]">
              {selectedFieldGroup && (
                <>
                  <div className="mb-2 text-sm text-gray-500">
                    Lịch đặt sân ngày {selectedDate.format('DD/MM/YYYY')}
                  </div>
                  <div className="relative overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="p-2 border text-center" style={{ width: '80px', minWidth: '80px', position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 10 }}>Thời gian</th>
                          {selectedFieldGroup.fields.map(field => (
                            <th key={field.id} className="p-2 border text-center" style={{ width: isMobile ? '120px' : '150px', minWidth: isMobile ? '120px' : '150px' }}>
                              {field.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {timeSlots.map((time, timeIndex) => {
                          // Get preprocessed calendar data
                          const calendarData = prepareCalendarData();
                          
                          return (
                            <tr key={time}>
                              <td className="p-2 border text-center font-medium" style={{ position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 5 }}>
                                {time}
                              </td>
                              {calendarData.map(fieldData => {
                                // Check if this time slot has the start of a booking
                                const bookingData = fieldData.bookings.find(b => b.startSlotIndex === timeIndex);

                                // Check if this time slot is in the middle of a booking (should be skipped as it's rowspan'd)
                                const isInBookingSpan = fieldData.bookings.some(
                                  b => timeIndex > b.startSlotIndex && timeIndex < b.endSlotIndex
                                );

                                // If this time slot is in the middle of a booking, don't render a cell
                                if (isInBookingSpan) return null;
                                
                                if (bookingData) {
                                  // This is the start of a booking, render a cell with rowSpan
                                  const { booking, rowSpan } = bookingData;
                                  return (
                                    <td
                                      key={`${time}-${fieldData.fieldId}`}
                                      className="p-2 border cursor-pointer hover:bg-gray-50"
                                      style={{
                                        backgroundColor: booking.status === 'completed' ? '#d6f5d6' : 
                                                        booking.status === 'cancelled' ? '#fff1f0' : 
                                                        '#fff7e6',
                                        color: booking.status === 'completed' ? '#52c41a' : 
                                              booking.status === 'cancelled' ? '#f5222d' : 
                                              '#fa8c16',
                                        position: 'relative',
                                        overflow: 'hidden'
                                      }}
                                      rowSpan={rowSpan || 1}
                                      onClick={() => handleSlotClick(time, fieldData.fieldName, fieldData.fieldId)}
                                    >
                                      <div className="p-1">
                                        <div className="text-sm font-medium">
                                          {booking.player ? booking.player.name : 'Đã đặt'}
                                        </div>
                                        {booking.player && (
                                          <div className="text-xs">{booking.player.phoneNumber}</div>
                                        )}
                                        <div className="text-xs mt-1">
                                          <div className="flex items-center gap-1">
                                            <div className={`w-2 h-2 rounded-full ${
                                              booking.status === 'completed' ? 'bg-green-500' :
                                              booking.status === 'cancelled' ? 'bg-red-500' : 
                                              'bg-orange-500'
                                            }`}></div>
                                            <span>
                                              {booking.status === 'completed' ? 'Đã hoàn thành' :
                                              booking.status === 'cancelled' ? 'Đã hủy' : 'Đang chờ'}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="text-xs mt-1">
                                          {booking.startTime.substring(0, 5)} - {booking.endTime.substring(0, 5)}
                                        </div>
                                      </div>
                                    </td>
                                  );
                                }
                                
                                // Empty cell (no booking)
                                return (
                                  <td
                                    key={`${time}-${fieldData.fieldId}`}
                                    className="p-2 border cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSlotClick(time, fieldData.fieldName, fieldData.fieldId)}
                                  />
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Booking Modal */}
      <Modal
        title="Thông tin đặt sân"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={isMobile ? '95%' : 600}
        styles={{ body: { padding: isMobile ? '16px' : '24px' } }}
      >
        {currentSlot && (
          <div>
            <div className="mb-4">
              <Text strong className="mr-2">Sân:</Text>
              <Text>{currentSlot.field}</Text>
            </div>
            <div className="mb-4">
              <Text strong className="mr-2">Thời gian:</Text>
              <Text>{selectedDate.format('DD/MM/YYYY')} | {currentSlot.time}</Text>
            </div>
            
            {currentSlot.booking ? (
              <>
                <div className="mb-4">
                  <Text strong className="mr-2">Trạng thái:</Text>
                  <Badge 
                    status={
                      currentSlot.booking.status === 'completed' ? 'success' : 
                      currentSlot.booking.status === 'cancelled' ? 'error' : 'warning'
                    } 
                    text={
                      currentSlot.booking.status === 'completed' ? 'Đã hoàn thành' : 
                      currentSlot.booking.status === 'cancelled' ? 'Đã hủy' : 'Đang chờ'
                    }
                  />
                </div>
                {currentSlot.booking.player && (
                  <>
                    <div className="mb-4">
                      <Text strong className="mr-2">Người đặt:</Text>
                      <Text>{currentSlot.booking.player.name}</Text>
                    </div>
                    <div className="mb-4">
                      <Text strong className="mr-2">Số điện thoại:</Text>
                      <Text>{currentSlot.booking.player.phoneNumber}</Text>
                    </div>
                  </>
                )}
                <div className="mb-4">
                  <Text strong className="mr-2">Thanh toán:</Text>
                  <Badge 
                    status={currentSlot.booking.payment?.status === 'paid' ? 'success' : 'warning'} 
                    text={currentSlot.booking.payment?.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  />
                </div>
                <div className="mb-4">
                  <Text strong className="mr-2">Giá tiền:</Text>
                  <Text>{currentSlot.booking.payment?.fieldPrice?.toLocaleString()} đ</Text>
                </div>
              </>
            ) : (
              <div className="mb-4">
                <Text strong>Chưa có người đặt</Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PlaySchedule;

