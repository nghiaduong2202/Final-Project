import React, { useState, useEffect, useRef } from 'react';
import { 
  Select, Button, Input, DatePicker, Space, Typography, 
  Badge, Card, Modal, Table, Form, TimePicker 
} from 'antd';
import {
  SearchOutlined, LeftOutlined, RightOutlined,
  HistoryOutlined, UserOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { mockBookingHistory } from '@/mocks/booking/bookingData';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface Venue {
  id: number;
  name: string;
}

interface Sport {
  id: number;
  name: string;
}

interface BookingSlot {
  id: string;
  time: string;
  court: string;
  customer: string;
  phone: string;
  status: 'booked' | 'available' | 'pending' | 'maintenance';
  duration: number; // in hours
}

const PlaySchedule: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const isMobile = containerWidth < 768;
  
  // States for dropdowns
  const [venues, setVenues] = useState<Venue[]>([
    { id: 1, name: 'Sân bóng đá Hà Nội' },
    { id: 2, name: 'Sân cầu lông Phạm Kha' }
  ]);
  const [sports, setSports] = useState<Sport[]>([
    { id: 1, name: 'Bóng đá' },
    { id: 2, name: 'Cầu lông' },
    { id: 3, name: 'Tennis' }
  ]);
  const [selectedVenue, setSelectedVenue] = useState<number | null>(1);
  const [selectedSport, setSelectedSport] = useState<number | null>(1);

  // States for search and date
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<BookingSlot | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Mock data for booking slots
  const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>([
    { id: 'bs1', time: '08:00', court: 'Sân 1', customer: 'Nguyễn Văn A', phone: '0901234567', status: 'booked', duration: 1 },
    { id: 'bs2', time: '09:00', court: 'Sân 2', customer: 'Trần Thị B', phone: '0908765432', status: 'booked', duration: 2 },
    { id: 'bs3', time: '10:00', court: 'Sân 3', customer: '', phone: '', status: 'available', duration: 1 },
    { id: 'bs4', time: '14:00', court: 'Sân 1', customer: 'Lê Văn C', phone: '0912345678', status: 'pending', duration: 1 },
    { id: 'bs5', time: '16:00', court: 'Sân 4', customer: '', phone: '', status: 'maintenance', duration: 3 },
  ]);

  // Time slots from 6:00 AM to 22:00 PM with 1-hour intervals
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 6;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Court names
  const courts = ['Sân 1', 'Sân 2', 'Sân 3', 'Sân 4', 'Sân 5', 'Sân 6', 'Sân 7'];

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    // In a real app, this would fetch data from the API    
  }, [selectedVenue, selectedSport, selectedDate]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Filter slots based on search query
    // In a real app, this would trigger an API call
  };

  const handleTodayClick = () => {
    setSelectedDate(dayjs());
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handlePrevDay = () => {
    setSelectedDate(selectedDate.subtract(1, 'day'));
  };

  const handleNextDay = () => {
    setSelectedDate(selectedDate.add(1, 'day'));
  };

  const handleSlotClick = (time: string, court: string) => {
    // Find if there's a booking for this slot
    const slot = bookingSlots.find(
      slot => slot.time === time && slot.court === court
    );
    
    if (slot) {
      setCurrentSlot(slot);
    } else {
      setCurrentSlot({
        id: `new-${time}-${court}`,
        time,
        court,
        customer: '',
        phone: '',
        status: 'available',
        duration: 1
      });
    }
    
    setIsModalVisible(true);
  };

  const getCellStyle = (time: string, court: string) => {
    const slot = bookingSlots.find(
      slot => slot.time === time && slot.court === court
    );
    
    if (!slot) return {};
    
    let backgroundColor = '';
    let color = '';
    
    switch (slot.status) {
      case 'booked':
        backgroundColor = '#d6f5d6';
        color = '#52c41a';
        break;
      case 'pending':
        backgroundColor = '#fff7e6';
        color = '#fa8c16';
        break;
      case 'maintenance':
        backgroundColor = '#fff1f0';
        color = '#f5222d';
        break;
      default:
        backgroundColor = 'white';
    }
    
    return {
      backgroundColor,
      color,
      height: `${slot.duration * 40}px`,
      position: 'relative' as const,
      overflow: 'hidden'
    };
  };

  // Filter bookings for history
  const bookingHistory = mockBookingHistory.filter(booking => 
    booking.facility.id === selectedVenue && booking.sportId === selectedSport
  );

  return (
    <div ref={containerRef} className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <Card className="mb-4 sm:mb-6">
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
              value={selectedVenue || undefined}
              onChange={setSelectedVenue}
              size={isMobile ? "middle" : "large"}
            >
              {venues.map(venue => (
                <Option key={venue.id} value={venue.id}>{venue.name}</Option>
              ))}
            </Select>
            
            <Select
              placeholder="Chọn môn thể thao"
              style={{ width: '100%' }}
              value={selectedSport || undefined}
              onChange={setSelectedSport}
              size={isMobile ? "middle" : "large"}
            >
              {sports.map(sport => (
                <Option key={sport.id} value={sport.id}>{sport.name}</Option>
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
              dataSource={bookingHistory}
              columns={[
                {
                  title: 'Thời gian',
                  dataIndex: 'time',
                  key: 'time',
                  width: isMobile ? '120px' : '150px',
                },
                {
                  title: 'Sân',
                  dataIndex: 'court',
                  key: 'court',
                  width: isMobile ? '80px' : '100px',
                },
                {
                  title: 'Khách hàng',
                  dataIndex: 'customer',
                  key: 'customer',
                  width: isMobile ? '120px' : '150px',
                },
                {
                  title: 'Số điện thoại',
                  dataIndex: 'phone',
                  key: 'phone',
                  width: isMobile ? '120px' : '150px',
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  width: isMobile ? '100px' : '120px',
                  render: (status) => (
                    <Badge 
                      status={status === 'completed' ? 'success' : 'processing'} 
                      text={status === 'completed' ? 'Đã hoàn thành' : 'Đang chờ'}
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
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border text-center" style={{ width: '80px' }}>Thời gian</th>
                    {courts.map(court => (
                      <th key={court} className="p-2 border text-center">{court}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(time => (
                    <tr key={time}>
                      <td className="p-2 border text-center font-medium">{time}</td>
                      {courts.map(court => {
                        const slot = bookingSlots.find(s => s.time === time && s.court === court);
                        return (
                          <td
                            key={`${time}-${court}`}
                            className="p-2 border cursor-pointer hover:bg-gray-50"
                            style={getCellStyle(time, court)}
                            onClick={() => handleSlotClick(time, court)}
                          >
                            {slot && (
                              <div className="p-1">
                                <div className="text-sm font-medium">{slot.customer}</div>
                                <div className="text-xs">{slot.phone}</div>
                                <div className="text-xs mt-1">
                                  <Badge 
                                    status={
                                      slot.status === 'booked' ? 'success' :
                                      slot.status === 'pending' ? 'warning' :
                                      slot.status === 'maintenance' ? 'error' : 'default'
                                    }
                                    text={
                                      slot.status === 'booked' ? 'Đã đặt' :
                                      slot.status === 'pending' ? 'Chờ xác nhận' :
                                      slot.status === 'maintenance' ? 'Bảo trì' : 'Trống'
                                    }
                                  />
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* Booking Modal */}
      <Modal
        title="Đặt sân"
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
              <Text>{currentSlot.court}</Text>
            </div>
            <div className="mb-4">
              <Text strong className="mr-2">Thời gian:</Text>
              <Text>{selectedDate.format('DD/MM/YYYY')} | {currentSlot.time}</Text>
            </div>
            
            {currentSlot.status === 'available' ? (
              <Form layout="vertical">
                <Form.Item label="Thông tin khách hàng" required>
                  <Input placeholder="Họ tên khách hàng" prefix={<UserOutlined />} />
                </Form.Item>
                <Form.Item required>
                  <Input placeholder="Số điện thoại" prefix={<PhoneOutlined />} />
                </Form.Item>
                <Form.Item label="Thời gian">
                  <Space>
                    <TimePicker format="HH:mm" defaultValue={dayjs(currentSlot.time, 'HH:mm')} />
                    <Text>đến</Text>
                    <TimePicker format="HH:mm" defaultValue={dayjs(currentSlot.time, 'HH:mm').add(1, 'hour')} />
                  </Space>
                </Form.Item>
                <Form.Item label="Ghi chú">
                  <Input.TextArea rows={3} placeholder="Nhập ghi chú nếu có" />
                </Form.Item>
              </Form>
            ) : (
              <>
                <div className="mb-4">
                  <Text strong className="mr-2">Trạng thái:</Text>
                  {currentSlot.status === 'booked' && <Badge status="success" text="Đã xác nhận" />}
                  {currentSlot.status === 'pending' && <Badge status="warning" text="Đang chờ xác nhận" />}
                  {currentSlot.status === 'maintenance' && <Badge status="error" text="Bảo trì" />}
                </div>
                {(currentSlot.status === 'booked' || currentSlot.status === 'pending') && (
                  <>
                    <div className="mb-4">
                      <Text strong className="mr-2">Khách hàng:</Text>
                      <Text>{currentSlot.customer}</Text>
                    </div>
                    <div className="mb-4">
                      <Text strong className="mr-2">Số điện thoại:</Text>
                      <Text>{currentSlot.phone}</Text>
                    </div>
                    <div className="mb-4">
                      <Text strong className="mr-2">Thời lượng:</Text>
                      <Text>{currentSlot.duration} giờ</Text>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PlaySchedule;

