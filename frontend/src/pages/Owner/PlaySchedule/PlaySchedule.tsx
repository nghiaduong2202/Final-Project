import React, { useState, useEffect, useRef } from 'react';
import { 
  Table, Card, Tag, Button, Modal, Space, Tabs, Select, 
  DatePicker, Input, Badge, Row, Col, Statistic, Avatar, Empty, notification, Tooltip, Popover,
  message
} from 'antd';
import type { TabsProps } from 'antd';
import type { ColumnType } from 'antd/lib/table';
import { 
  EyeOutlined, CloseCircleOutlined, SearchOutlined, 
  InfoCircleOutlined, CalendarOutlined, FilterOutlined, ReloadOutlined,
  CheckCircleOutlined, HistoryOutlined, ClockCircleOutlined, SyncOutlined,
  LeftOutlined, RightOutlined, TableOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import bookingService from '@/services/booking.service';
import { getSportNameInVietnamese } from '@/utils/translateSport';
import { sportService } from '@/services/sport.service';
import { FacilityDropdownItem, facilityService } from '@/services/facility.service';

const { RangePicker } = DatePicker;
const { Option } = Select;

// Thêm interfaces cho calendar view
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

interface PlayerType {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
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
    refund: number;
    refundedPoint: number;
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

interface Facility {
  id: string;
  name: string;
  description: string;
  location: string;
  status: string;
  avgRating: number;
  numberOfRating: number;
  imagesUrl: string[];
  fieldGroups: FieldGroup[];
}

interface FieldGroup {
  id: string;
  name: string;
  dimension: string;
  surface: string;
  basePrice: number;
}

interface Sport {
  id: number;
  name: string;
}

interface Field {
  id: number;
  name: string;
  status: string;
}

interface BookingSlot {
  id: number;
  date: string;
  status: string;
  field: Field;
  booking?: {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    player?: PlayerType;
  };
}

interface Payment {
  id: string;
  fieldPrice: number;
  servicePrice: number | null;
  discount: number | null;
  refund: number;
  refundedPoint: number;
  updatedAt: string;
}


interface BookingData {
  id: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  sport: Sport;
  bookingSlots: BookingSlot[];
  payment: Payment;
  player?: PlayerType;
}

interface BookingHistoryItem {
  facility: Facility;
  booking: BookingData;
}

// Định nghĩa kiểu dữ liệu cho BookingSummaryCard
interface BookingSummaryData {
  total: number;
  upcoming: number;
  completed: number;
  canceled: number;
  inProgress: number;
}

// Key cho localStorage
const SELECTED_FACILITY_KEY = 'owner_selected_facility_id';

// Tách thành component riêng để dễ quản lý
const BookingSummaryCard = ({ data }: { data: BookingSummaryData }) => {
  return (
    <Row gutter={[16, 16]} className="mb-6">
      <Col xs={24} sm={12} lg={6}>
        <Card className="summary-card hover:shadow-md transition-all" hoverable>
          <Statistic
            title={<span className="font-medium">Tổng lượt đặt sân</span>}
            value={data.total}
            prefix={<HistoryOutlined className="text-blue-500" />}
            valueStyle={{ color: '#1890ff', fontWeight: 600 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="summary-card hover:shadow-md transition-all" hoverable>
          <Statistic
            title={<span className="font-medium">Sắp diễn ra</span>}
            value={data.upcoming}
            prefix={<ClockCircleOutlined className="text-orange-500" />}
            valueStyle={{ color: '#fa8c16', fontWeight: 600 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="summary-card hover:shadow-md transition-all" hoverable>
          <Statistic
            title={<span className="font-medium">Hoàn thành</span>}
            value={data.completed}
            prefix={<CheckCircleOutlined className="text-green-500" />}
            valueStyle={{ color: '#52c41a', fontWeight: 600 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="summary-card hover:shadow-md transition-all" hoverable>
          <Statistic
            title={<span className="font-medium">Đã hủy/Hoàn tiền</span>}
            value={data.canceled}
            prefix={<CloseCircleOutlined className="text-red-500" />}
            valueStyle={{ color: '#ff4d4f', fontWeight: 600 }}
          />
        </Card>
      </Col>
    </Row>
  );
};

// Lấy ngày hiển thị dựa vào trạng thái và danh sách ngày
const getDisplayDate = (dates: string[], status: string, bookingSlots: BookingSlot[]): string => {
  // Sắp xếp các ngày theo thứ tự tăng dần
  const sortedDates = [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  // Nếu chỉ có một ngày, trả về ngày đó
  if (sortedDates.length === 1) {
    return sortedDates[0];
  }
  
  // Xác định ngày hiển thị dựa vào trạng thái
  const today = dayjs();
  
  if (status === 'upcoming') {
    // Tìm slot sắp tới gần nhất
    const upcomingSlots = bookingSlots.filter(slot => slot.status === 'upcoming');
    if (upcomingSlots.length > 0) {
      // Sắp xếp theo ngày gần nhất
      const sortedUpcomingSlots = [...upcomingSlots].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      return sortedUpcomingSlots[0].date;
    }
  } else if (status === 'in_progress') {
    // Tìm ngày đang diễn ra (ngày hiện tại)
    const currentDate = sortedDates.find(date => dayjs(date).isSame(today, 'day'));
    if (currentDate) {
      return currentDate;
    }
    
    // Nếu không có ngày nào trùng với ngày hiện tại, tìm slot sắp tới gần nhất
    const upcomingSlots = bookingSlots.filter(slot => slot.status === 'upcoming');
    if (upcomingSlots.length > 0) {
      const sortedUpcomingSlots = [...upcomingSlots].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      return sortedUpcomingSlots[0].date;
    }
  } else if (status === 'completed') {
    // Tìm ngày đã hoàn thành cuối cùng
    const completedSlots = bookingSlots.filter(slot => slot.status === 'done');
    if (completedSlots.length > 0) {
      const sortedCompletedSlots = [...completedSlots].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() // Sắp xếp giảm dần
      );
      return sortedCompletedSlots[0].date;
    }
  } else if (status === 'canceled') {
    // Với trạng thái đã hủy, hiển thị ngày cuối cùng
    return sortedDates[sortedDates.length - 1];
  }
  
  // Mặc định trả về ngày đầu tiên
  return sortedDates[0];
};

// Add a BookingDate component to display multiple dates
const BookingDates = ({ dates, status, bookingSlots }: { dates: string[], status: string, bookingSlots: BookingSlot[] }) => {
  // Nếu chỉ có một ngày, hiển thị ngày đó
  if (dates.length === 1) {
    return <span>{dayjs(dates[0]).format('DD/MM/YYYY')}</span>;
  }

  // Sắp xếp các ngày theo thứ tự tăng dần
  const sortedDates = [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  // Xác định ngày hiển thị dựa vào trạng thái
  const displayDate = getDisplayDate(sortedDates, status, bookingSlots);
  
  // Hiển thị popover cho tất cả các ngày
  const content = (
    <div className="p-1">
      {sortedDates.map((date, index) => {
        // Tìm slot tương ứng với ngày này
        const slot = bookingSlots.find(s => s.date === date);
        const slotStatus = slot ? slot.status : 'unknown';
        
        // Xác định màu sắc dựa trên trạng thái của slot
        let statusColor = 'default';
        if (slotStatus === 'done') statusColor = 'green';
        else if (slotStatus === 'upcoming') statusColor = 'blue';
        else if (slotStatus === 'canceled') statusColor = 'red';
        
        return (
          <div key={index} className="mb-1 last:mb-0">
            <Tag color={date === displayDate ? statusColor : "default"}>
              {`${index + 1}: ${dayjs(date).format('DD/MM/YYYY')}`}
              {date === displayDate && <span className="ml-1">(Hiển thị)</span>}
              {slotStatus !== 'unknown' && (
                <span className={`ml-1 ${slotStatus === 'done' ? 'text-green-500' : slotStatus === 'upcoming' ? 'text-blue-500' : 'text-red-500'}`}>
                  [{slotStatus === 'done' ? 'Hoàn thành' : slotStatus === 'upcoming' ? 'Sắp diễn ra' : 'Đã hủy'}]
                </span>
              )}
            </Tag>
          </div>
        );
      })}
    </div>
  );

  return (
    <Popover
      content={content}
      title="Lịch định kỳ"
      trigger="hover"
      placement="bottom"
    >
      <span className="cursor-pointer hover:text-blue-500">
        {dayjs(displayDate).format('DD/MM/YYYY')} <span className="font-medium text-blue-500 ml-1">[{dates.length}]</span>
      </span>
    </Popover>
  );
};

const PlaySchedule: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const isMobile = containerWidth < 768;
  
  // Local state
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState<FacilityDropdownItem[]>([]);

  const [filterLoading, setFilterLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filterTimeRange, setFilterTimeRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [searchText, setSearchText] = useState('');
  const [sportFilter, setSportFilter] = useState<number | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  
  // Thêm state cho bookings từ API
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  
  // State cho booking statistics
  const [bookingStats, setBookingStats] = useState<BookingSummaryData>({
    total: 0,
    upcoming: 0,
    completed: 0,
    canceled: 0,
    inProgress: 0
  });

  // State để lưu trạng thái unread của các tab
  const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({
    all: 0,
    upcoming: 0,
    in_progress: 0,
    completed: 0,
    canceled: 0
  });

  // State để lưu lịch sử booking đã load
  const [loadedBookingIds, setLoadedBookingIds] = useState<Set<string>>(new Set());

  // Cache kết quả getBookingDisplayStatus để tránh tính toán lại
  const displayStatusCache = React.useRef(new Map<string, string>()).current;

  // Thêm state cho modal chi tiết booking
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<BookingHistoryItem | null>(null);
  
  // State cho calendar view
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [selectedFacility, setSelectedFacility] = useState<FacilityType | null>(null);
  const [fieldGroups, setFieldGroups] = useState<FieldGroupType[]>([]);
  const [selectedFieldGroup, setSelectedFieldGroup] = useState<FieldGroupType | null>(null);
  const [selectedFieldGroupId, setSelectedFieldGroupId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [isSlotModalVisible, setIsSlotModalVisible] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<SlotInfo | null>(null);
  const [bookingSchedule, setBookingSchedule] = useState<BookingScheduleItem[]>([]);
  
  // Update container width for responsive design
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

  // Handle facility change
  const handleFacilityChange = (value: string) => {
    setSelectedFacilityId(value);
    localStorage.setItem(SELECTED_FACILITY_KEY, value);
    fetchBookings(value, false);
    
    // Also fetch facility details for calendar view
    if (viewMode === 'calendar') {
      fetchFacilityDetails(value);
    }
  };

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

  const handleDateChange = async (date: dayjs.Dayjs | null) => {
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

  const handleTodayClick = async () => {
    const today = dayjs();
    setSelectedDate(today);
    if (selectedFieldGroupId) {
      await fetchBookingSchedule(selectedFieldGroupId, today.format('YYYY-MM-DD'));
    }
  };

  // Toggle between table and calendar view
  const toggleViewMode = () => {
    if (viewMode === 'table') {
      setViewMode('calendar');
      // If switching to calendar, fetch facility details if not already loaded
      if (!selectedFacility && selectedFacilityId) {
        fetchFacilityDetails(selectedFacilityId);
      }
    } else {
      setViewMode('table');
    }
  };

  // Lấy danh sách cơ sở từ API
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const facilityList = await facilityService.getFacilitiesDropdown();
        setFacilities(facilityList);

        // Lấy facilityId từ localStorage
        const savedFacilityId = localStorage.getItem(SELECTED_FACILITY_KEY);
        
        // Kiểm tra xem savedFacilityId có còn hợp lệ không (có tồn tại trong danh sách facilities không)
        const isValidSavedId = savedFacilityId && facilityList.some(f => f.id === savedFacilityId);
        
        // Nếu ID trong localStorage không hợp lệ, sử dụng ID đầu tiên trong danh sách
        const initialFacilityId = isValidSavedId ? savedFacilityId : (facilityList.length > 0 ? facilityList[0].id : '');
        
        if (initialFacilityId) {
          // Nếu ID đã thay đổi, cập nhật lại localStorage
          if (initialFacilityId !== savedFacilityId) {
            localStorage.setItem(SELECTED_FACILITY_KEY, initialFacilityId);
          }
          setSelectedFacilityId(initialFacilityId);
          fetchBookings(initialFacilityId, true);
        }
      } catch (err) {
        console.error('Error fetching facilities:', err);
        message.error('Không thể tải danh sách cơ sở. Vui lòng thử lại sau.');
      }
    };

    fetchFacilities();
  }, []);

  // Fetch data khi component được mount hoặc khi selectedFacilityId thay đổi
  useEffect(() => {
    if (selectedFacilityId) {
      // Khi component được mount lần đầu, không tính là có booking mới
      const isFirstLoad = loadedBookingIds.size === 0;
      fetchBookings(selectedFacilityId, isFirstLoad);
    }
  }, [selectedFacilityId]);

  // Tách API calls để cải thiện hiệu suất
  const fetchSports = async () => {
    try {
      const sportsData: Sport[] = await sportService.getSport();
      setSports(sportsData);
    } catch (error) {
      console.error('Error fetching sports:', error);
    }
  };

  // Gọi API để lấy dữ liệu
  const fetchBookings = async (facilityId: string, isFirstLoad = false) => {
    if (!facilityId) return;
    
    setLoading(true);
    
    try {
      // Gọi API lấy thông tin sports song song với bookings
      fetchSports();
      
      const bookingsData: BookingHistoryItem[] = await bookingService.getBookingOwner(facilityId);
      
      // Cập nhật bookings
      setBookings(bookingsData);
      
      // Cập nhật thống kê
      updateBookingStats(bookingsData);
      
      // Xử lý booking mới
      if (!isFirstLoad) {
        processNewBookings(bookingsData);
      }
      
      // Lưu lại danh sách booking đã load
      setLoadedBookingIds(new Set(bookingsData.map(item => item.booking.id)));
      
    } catch (error) {
      console.error('Error fetching bookings:', error);
      notification.error({
        message: 'Không thể tải dữ liệu',
        description: 'Đã xảy ra lỗi khi tải lịch đặt sân. Vui lòng thử lại sau.'
      });
    } finally {
      setLoading(false);
    }
  };

  

  // Tách xử lý booking mới để cải thiện hiệu suất
  const processNewBookings = (bookingsData: BookingHistoryItem[]) => {
    // Tính toán booking mới bằng cách so sánh với loadedBookingIds
    const newBookings = bookingsData.filter((item: BookingHistoryItem) => 
      !loadedBookingIds.has(item.booking.id)
    );
    
    // Cập nhật số lượng unread cho mỗi tab dựa trên booking mới
    if (newBookings.length > 0) {
      const newUnreadCounts = { ...unreadCounts };
      
      // Cập nhật số lượng cho tab tất cả
      newUnreadCounts.all += newBookings.length;
      
      // Tạo Map để cache kết quả getBookingDisplayStatus
      const statusCache = new Map<string, string>();
      
      // Cập nhật số lượng cho các tab khác
      newBookings.forEach((item: BookingHistoryItem) => {
        // Cache kết quả để tránh tính toán lại
        let status = statusCache.get(item.booking.id);
        if (!status) {
          status = getBookingDisplayStatus(item);
          statusCache.set(item.booking.id, status);
        }
        
        if (status === 'upcoming') newUnreadCounts.upcoming += 1;
        else if (status === 'in_progress') newUnreadCounts.in_progress += 1;
        else if (status === 'completed') newUnreadCounts.completed += 1;
        else if (status === 'canceled') newUnreadCounts.canceled += 1;
      });
      
      setUnreadCounts(newUnreadCounts);
    }
  };

  // Xử lý khi chuyển tab
  const handleTabChange = (tabKey: string) => {
    // Cập nhật tab đang active
    setActiveTab(tabKey);
    
    // Đặt số lượng unread của tab này về 0
    setUnreadCounts(prev => ({
      ...prev,
      [tabKey]: 0
    }));
    
    // Nếu xem tab tất cả, reset tất cả các tab khác
    if (tabKey === 'all') {
      setUnreadCounts({
        all: 0,
        upcoming: 0,
        in_progress: 0,
        completed: 0,
        canceled: 0
      });
    }
  };

  // Lấy số lượng booking chưa đọc cho mỗi tab
  const getUnreadCount = (tabKey: string) => {
    return unreadCounts[tabKey] || 0;
  };

  // Cấu hình tabs
  const tabs: TabsProps['items'] = [
    {
      key: 'all',
      label: (
        <Badge count={getUnreadCount('all')} offset={[10, 0]}>
          Tất cả
        </Badge>
      ),
    },
    {
      key: 'upcoming',
      label: (
        <Badge count={getUnreadCount('upcoming')} offset={[10, 0]}>
          Sắp diễn ra
        </Badge>
      ),
    },
    {
      key: 'in_progress',
      label: (
        <Badge count={getUnreadCount('in_progress')} offset={[10, 0]}>
          Đang diễn ra
        </Badge>
      ),
    },
    {
      key: 'completed',
      label: (
        <Badge count={getUnreadCount('completed')} offset={[10, 0]}>
          Hoàn thành
        </Badge>
      ),
    },
    {
      key: 'canceled',
      label: (
        <Badge count={getUnreadCount('canceled')} offset={[10, 0]}>
          Đã hủy
        </Badge>
      ),
    },
  ];

  // Cập nhật thống kê booking
  const updateBookingStats = (bookingsData: BookingHistoryItem[]) => {
    const total = bookingsData.length;
    
    // Đếm số lượng booking theo từng trạng thái hiển thị
    let upcoming = 0;
    let completed = 0;
    let canceled = 0;
    let inProgress = 0;
    
    bookingsData.forEach(item => {
      const status = getBookingDisplayStatus(item);
      if (status === 'upcoming') upcoming++;
      else if (status === 'completed') completed++;
      else if (status === 'canceled') canceled++;
      else if (status === 'in_progress') inProgress++;
    });
    
    setBookingStats({
      total,
      upcoming,
      completed,
      canceled,
      inProgress
    });
  };

  // Hàm render trạng thái booking dựa theo thời gian
  const renderBookingStatusByTime = (record: BookingHistoryItem) => {
    const displayStatus = getBookingDisplayStatus(record);
    let color = 'default';
    let text = 'Không xác định';
    let icon = <InfoCircleOutlined />;

    switch (displayStatus) {
      case 'upcoming':
        color = 'blue';
        text = 'Sắp diễn ra';
        icon = <ClockCircleOutlined />;
        break;
      case 'in_progress':
        color = 'processing';
        text = 'Đang diễn ra';
        icon = <SyncOutlined spin />;
        break;
      case 'completed':
        color = 'green';
        text = 'Hoàn thành';
        icon = <CheckCircleOutlined />;
        break;
      case 'canceled':
        color = 'red';
        text = 'Đã hủy';
        icon = <CloseCircleOutlined />;
        break;
    }

    // Display for refunded points and refund information
    const hasRefund = record.booking.payment.refund > 0;
    const hasRefundedPoints = record.booking.payment.refundedPoint > 0;

    // If it's canceled and has refund points OR used refunded points, show both
    if (displayStatus === 'canceled' && hasRefund) {
      return (
        <>
          <Tag icon={icon} color={color}>
            {text}
          </Tag>
          <Tooltip title={`Đã hoàn ${record.booking.payment.refund} điểm tích lũy`}>
            <Tag color="green" className="ml-1">+{record.booking.payment.refund} điểm</Tag>
          </Tooltip>
        </>
      );
    }

    // If it has used refunded points, display that info too
    if (hasRefundedPoints) {
      return (
        <>
          <Tag icon={icon} color={color}>
            {text}
          </Tag>
          <Tooltip title={`Đã sử dụng ${record.booking.payment.refundedPoint} điểm tích lũy`}>
            <Tag color="orange" className="ml-1">-{record.booking.payment.refundedPoint} điểm</Tag>
          </Tooltip>
        </>
      );
    }

    return (
      <Tag icon={icon} color={color}>
        {text}
      </Tag>
    );
  };
 

  // Lọc dữ liệu theo tab đang chọn và các filter
  const applyFilters = () => {
    setFilterLoading(true);
    
    // Giả lập delay API
    setTimeout(() => {
      setFilterLoading(false);
      setFilterVisible(false);
    }, 300); // Giảm thời gian delay xuống
  };
  
  // Reset các filter
  const resetFilters = () => {
    setFilterTimeRange(null);
    setSearchText('');
    setSportFilter(null);
    
    // Giả lập delay API
    setFilterLoading(true);
    setTimeout(() => {
      setFilterLoading(false);
      setFilterVisible(false);
    }, 300); // Giảm thời gian delay xuống
  };


  // Xác định trạng thái booking dựa vào thời gian và status
  const getBookingDisplayStatus = (item: BookingHistoryItem): string => {
    // Kiểm tra cache trước
    const cacheKey = item.booking.id;
    if (displayStatusCache.has(cacheKey)) {
      return displayStatusCache.get(cacheKey)!;
    }
    
    // Nếu booking đã bị hủy, luôn hiển thị là canceled
    if (item.booking.status === 'canceled') {
      displayStatusCache.set(cacheKey, 'canceled');
      return 'canceled';
    }
    
    const today = dayjs();
    
    // Lấy tất cả các ngày đặt sân
    const bookingSlots = item.booking.bookingSlots;
    const startTime = item.booking.startTime;
    const endTime = item.booking.endTime;
    
    // Kiểm tra xem tất cả các slot đã hoàn thành chưa
    const allSlotsDone = bookingSlots.every(slot => slot.status === 'done');
    if (allSlotsDone) {
      displayStatusCache.set(cacheKey, 'completed');
      return 'completed';
    }
    
    // Kiểm tra nếu có bất kỳ slot nào đang diễn ra (thời gian hiện tại nằm trong khoảng thời gian đặt sân)
    const hasInProgressSlot = bookingSlots.some(slot => {
      const slotDate = dayjs(slot.date);
      const slotStartTime = slotDate
        .hour(parseInt(startTime.split(':')[0]))
        .minute(parseInt(startTime.split(':')[1]));
      const slotEndTime = slotDate
        .hour(parseInt(endTime.split(':')[0]))
        .minute(parseInt(endTime.split(':')[1]));
      
      return today.isAfter(slotStartTime) && today.isBefore(slotEndTime) && slot.status === 'upcoming';
    });
    
    if (hasInProgressSlot) {
      displayStatusCache.set(cacheKey, 'in_progress');
      return 'in_progress';
    }
    
    // Kiểm tra xem có slot nào sắp diễn ra không
    const hasUpcomingSlot = bookingSlots.some(slot => slot.status === 'upcoming');
    if (hasUpcomingSlot) {
      displayStatusCache.set(cacheKey, 'upcoming');
      return 'upcoming';
    }
    
    // Mặc định là đã hoàn thành nếu không rơi vào các trường hợp trên
    displayStatusCache.set(cacheKey, 'completed');
    return 'completed';
  };

  // Memoize filteredBookings để tránh tính toán lại khi component re-render
  const filteredBookings = React.useMemo(() => {
    return bookings.filter(item => {
      // Lấy trạng thái hiển thị
      const displayStatus = getBookingDisplayStatus(item);
      
      // Lọc theo tab
      if (activeTab !== 'all') {
        if (activeTab === 'upcoming' && displayStatus !== 'upcoming') return false;
        if (activeTab === 'in_progress' && displayStatus !== 'in_progress') return false;
        if (activeTab === 'completed' && displayStatus !== 'completed') return false;
        if (activeTab === 'canceled' && !['canceled', 'refunded'].includes(item.booking.status)) return false;
      }

      // Lọc theo khoảng thời gian
      if (filterTimeRange) {
        const bookingDate = dayjs(item.booking.bookingSlots[0]?.date);
        if (!bookingDate.isBetween(filterTimeRange[0], filterTimeRange[1], null, '[]')) {
          return false;
        }
      }

      // Lọc theo text
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        if (
          !item.booking.id.toLowerCase().includes(searchLower) &&
          !item.facility.name.toLowerCase().includes(searchLower) &&
          !item.booking.sport.name.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Lọc theo môn thể thao
      if (sportFilter && item.booking.sport.id !== sportFilter) {
        return false;
      }

      return true;
    });
  }, [bookings, activeTab, filterTimeRange, searchText, sportFilter]);

  // Memoize columns để tránh tính toán lại
  const columns = React.useMemo<ColumnType<BookingHistoryItem>[]>(() => [
    {
      title: 'Mã đặt sân',
      dataIndex: ['booking', 'id'],
      key: 'id',
      render: (id: string) => (
        <Button type="link">
          #{id.substring(0, 8)}
        </Button>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'player',
      render: (_: unknown, record: BookingHistoryItem) => {
        // Get player info from bookingSlots if available
        const playerInfo = record.booking.bookingSlots[0]?.booking?.player || record.booking.player;
        
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar size="small" src={`https://ui-avatars.com/api/?name=${playerInfo?.name || 'User'}&background=random`} style={{ marginRight: 8 }} />
            <div>
              <div>{playerInfo?.name || `Khách hàng #${record.booking.id.substring(0, 4)}`}</div>
              {playerInfo?.phoneNumber && (
                <div className="text-xs text-gray-500">{playerInfo.phoneNumber}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Nhóm sân',
      key: 'field',
      render: (_: unknown, record: BookingHistoryItem) => {
        const fieldGroupName = record.facility.fieldGroups[0]?.name || '';
        const isRecurring = record.booking.bookingSlots.length > 1;
        
        return (
          <div>
            <div>{fieldGroupName}</div>
            {isRecurring && (
              <div style={{ marginTop: 4 }}>
                <Tag color="purple">Định kỳ</Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Thời gian',
      key: 'time',
      defaultSortOrder: 'ascend',
      sorter: (a: BookingHistoryItem, b: BookingHistoryItem) => {
        // Sắp xếp theo ngày đầu tiên của mỗi booking
        const datesA = a.booking.bookingSlots.map(slot => slot.date);
        const datesB = b.booking.bookingSlots.map(slot => slot.date);
        
        // Lấy ngày sớm nhất cho mỗi booking để so sánh
        const earliestA = new Date(Math.min(...datesA.map(d => new Date(d).getTime())));
        const earliestB = new Date(Math.min(...datesB.map(d => new Date(d).getTime())));
        
        return earliestA.getTime() - earliestB.getTime();
      },
      sortDirections: ['ascend', 'descend'] as const,
      render: (_: unknown, record: BookingHistoryItem) => {
        // Lấy danh sách các ngày đặt sân
        const bookingDates = record.booking.bookingSlots.map(slot => slot.date);
        
        return (
          <div>
            <div>
              <CalendarOutlined style={{ marginRight: 8 }} />
              <BookingDates dates={bookingDates} status={getBookingDisplayStatus(record)} bookingSlots={record.booking.bookingSlots} />
              <span style={{ marginLeft: 8 }}>{record.booking.startTime.substring(0, 5)} - {record.booking.endTime.substring(0, 5)}</span>
            </div>
            <div style={{ marginLeft: 16, marginTop: 4 }}>
              {renderBookingStatusByTime(record)}             
            </div>
          </div>
        );
      },
    },
    {
      title: 'Môn thể thao',
      key: 'sport',
      dataIndex: ['booking', 'sport', 'name'],
      render: (name: string) => (
        <Tag color="blue">
          {getSportNameInVietnamese(name)}
        </Tag>
      ),
    },
    {
      title: 'Tổng tiền',
      key: 'totalPrice',
      render: (_: unknown, record: BookingHistoryItem) => formatCurrency(calculateTotalPrice(record)),
      sorter: (a: BookingHistoryItem, b: BookingHistoryItem) => 
        calculateTotalPrice(a) - calculateTotalPrice(b),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: BookingHistoryItem) => {
        return (
          <Space size="small" onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Xem chi tiết">
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  viewBookingDetail(record);
                }}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ], []);

  // Tính tổng tiền từ payment
  const calculateTotalPrice = (item: BookingHistoryItem): number => {
    const fieldPrice = item.booking.payment?.fieldPrice || 0;
    const servicePrice = item.booking.payment?.servicePrice || 0;
    const discount = item.booking.payment?.discount || 0;
    // Tính toán giá trị từ điểm tích lũy đã sử dụng (chuyển đổi điểm sang tiền)
    const refundedPointValue = item.booking.payment?.refundedPoint || 0;
    
    return fieldPrice + servicePrice - discount - refundedPointValue*1000;
  };

  // Chuyển sang trang chi tiết booking
  const viewBookingDetail = (record: BookingHistoryItem) => {
    setCurrentBooking(record);
    setDetailModalVisible(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

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

  // Handle slot click in calendar view
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
    
    setIsSlotModalVisible(true);
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
    <div ref={containerRef} className="w-full px-4 py-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Facility Dropdown */}
        <Card className="mb-6 shadow-sm rounded-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-semibold mb-1">Chọn cơ sở</h2>
              <p className="text-gray-500 text-sm">Xem lịch đặt sân cho cơ sở của bạn</p>
            </div>
            <div className="w-full md:w-1/2 lg:w-1/3">
              <Select
                placeholder="Chọn cơ sở của bạn"
                style={{ width: '100%' }}
                value={selectedFacilityId || undefined}
                onChange={handleFacilityChange}
                popupMatchSelectWidth={false}
                size="large"
                className="facility-select"
                loading={facilities.length === 0}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => 
                  (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                }
              >
                {facilities.map((facility) => (
                  <Select.Option key={facility.id} value={facility.id}>
                    {facility.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </Card>
          
        <div className="flex justify-end mb-6">
          <Space>
            <Button 
              icon={<FilterOutlined />} 
              onClick={() => setFilterVisible(!filterVisible)}
              className="flex items-center"
            >
              Bộ lọc
            </Button>
            <Button
              icon={viewMode === 'table' ? <CalendarOutlined /> : <TableOutlined />}
              onClick={toggleViewMode}
              className="flex items-center"
            >
              {viewMode === 'table' ? 'Xem lịch' : 'Xem bảng'}
            </Button>
            <Button 
              type="primary"
              icon={<ReloadOutlined />} 
              onClick={() => {
                if (viewMode === 'table') {  
                  if (selectedFacilityId) {
                    fetchBookings(selectedFacilityId, false);
                  }
                } else {
                  if (selectedFieldGroupId) {
                    fetchBookingSchedule(selectedFieldGroupId, selectedDate.format('YYYY-MM-DD')); 
                  }
                }
              }}
              loading={loading}
              className="flex items-center"
            >
              Làm mới
            </Button>
          </Space>
        </div>

        {/* Thêm thống kê booking */}
        {viewMode === 'table' && <BookingSummaryCard data={bookingStats} />}

        {/* Bộ lọc nâng cao */}
        {viewMode === 'table' && filterVisible && (
          <Card className="mb-6 shadow-sm rounded-lg" title={<span className="font-semibold">Bộ lọc nâng cao</span>}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div className="mb-2 font-medium">Khoảng thời gian</div>
                <RangePicker 
                  style={{ width: '100%' }} 
                  value={filterTimeRange}
                  onChange={(dates) => setFilterTimeRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                  placeholder={['Từ ngày', 'Đến ngày']}
                  className="w-full"
                />
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-2 font-medium">Tìm kiếm</div>
                <Input
                  placeholder="Tìm theo mã, tên sân, môn thể thao..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full"
                />
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-2 font-medium">Môn thể thao</div>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Chọn môn thể thao"
                  value={sportFilter}
                  onChange={(value) => setSportFilter(value)}
                  allowClear
                  className="w-full"
                >
                  {sports.map(sport => (
                    <Option key={sport.id} value={sport.id}>
                      {getSportNameInVietnamese(sport.name)}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} className="text-right">
                <Space>
                  <Button onClick={resetFilters}>
                    Đặt lại
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={applyFilters}
                    loading={filterLoading}
                  >
                    Áp dụng
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        {/* Calendar View Controls */}
        {viewMode === 'calendar' && (
          <Card className="mb-6 shadow-sm rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
              <Space direction="vertical" size="middle" className="flex-grow" style={{ maxWidth: '100%' }}>
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

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
              <Input
                placeholder="Tìm kiếm tên người chơi"
                prefix={<SearchOutlined />}
                style={{ maxWidth: '100%' }}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
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
          </Card>
        )}

        {/* Table booking */}
        {viewMode === 'table' && (
          <Card className="shadow-sm rounded-lg">
            <Tabs 
              activeKey={activeTab} 
              onChange={handleTabChange} 
              items={tabs}
              className="mb-3 font-medium"
              tabBarStyle={{ marginBottom: 16, fontWeight: 500 }}
            />
            
            <Table
              columns={columns}
              dataSource={filteredBookings}
              rowKey={(record) => record.booking.id}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} lượt đặt sân`,
                className: "pagination-custom"
              }}
              rowClassName="hover:bg-gray-50 cursor-pointer transition-colors"
              onRow={(record) => ({
                onClick: (e) => {
                  // Ngăn chặn sự kiện click khi người dùng click vào cột thao tác (chứa các button)
                  const target = e.target as HTMLElement;
                  // Kiểm tra xem phần tử được click hoặc cha của nó có phải là button hay không
                  if (target.closest('button') || target.closest('.ant-space')) {
                    return;
                  }
                  viewBookingDetail(record);
                }
              })}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <span className="text-gray-500">
                        Không có dữ liệu đặt sân nào{' '}
                        {activeTab !== 'all' ? 'trong trạng thái này' : ''}
                      </span>
                    }
                  />
                ),
              }}
              className="custom-table"
            />
          </Card>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <Card className="shadow-sm rounded-lg">
            <div className="mb-2 text-sm text-gray-500">
              Lịch đặt sân ngày {selectedDate.format('DD/MM/YYYY')}
            </div>
            <div className="relative overflow-x-auto">
              {selectedFieldGroup ? (
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
                                    color: booking.status === 'completed' ? '#377916' : 
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
              ) : (
                <Empty description="Vui lòng chọn nhóm sân để xem lịch" />
              )}
            </div>
          </Card>
        )}

        {/* Modal chi tiết booking */}
        <Modal
          title={<span className="text-lg font-semibold">Chi tiết đặt sân</span>}
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>
          ]}
          width={800}
        >
          {currentBooking && (
            <div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card size="small" title="Thông tin đặt sân" className="h-full">
                    <p><strong>Mã đặt sân:</strong> #{currentBooking.booking.id}</p>
                    <p><strong>Trạng thái:</strong> {renderBookingStatusByTime(currentBooking)}</p>
                    <p><strong>Ngày đặt:</strong> {dayjs(currentBooking.booking.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                    <p><strong>Môn thể thao:</strong> {getSportNameInVietnamese(currentBooking.booking.sport.name)}</p>
                    <p><strong>Thời gian:</strong> {currentBooking.booking.startTime.substring(0, 5)} - {currentBooking.booking.endTime.substring(0, 5)}</p>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card size="small" title="Thông tin thanh toán" className="h-full">
                    <p><strong>Giá sân:</strong> {formatCurrency(currentBooking.booking.payment.fieldPrice)}</p>
                    <p><strong>Giá dịch vụ:</strong> {formatCurrency(currentBooking.booking.payment.servicePrice || 0)}</p>
                    <p><strong>Giảm giá:</strong> {formatCurrency(currentBooking.booking.payment.discount || 0)}</p>
                    <p><strong>Điểm sử dụng:</strong> {currentBooking.booking.payment.refundedPoint || 0} điểm</p>
                    <p><strong>Tổng tiền:</strong> <span className="text-lg font-bold text-green-600">{formatCurrency(calculateTotalPrice(currentBooking))}</span></p>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card size="small" title="Thông tin khách hàng" className="h-full">
                    {(() => {
                      // Get player info from bookingSlots if available
                      const playerInfo = currentBooking.booking.bookingSlots[0]?.booking?.player || currentBooking.booking.player;
                      
                      return (
                        <>
                          <p><strong>Tên khách hàng:</strong> {playerInfo?.name || 'Không có thông tin'}</p>
                          <p><strong>Số điện thoại:</strong> {playerInfo?.phoneNumber || 'Không có thông tin'}</p>
                          <p><strong>Email:</strong> {playerInfo?.email || 'Không có thông tin'}</p>
                        </>
                      );
                    })()}
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card size="small" title="Lịch đặt sân">
                    <Table
                      dataSource={currentBooking.booking.bookingSlots}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      columns={[
                        {
                          title: 'Ngày',
                          dataIndex: 'date',
                          key: 'date',
                          render: (date) => dayjs(date).format('DD/MM/YYYY'),
                        },
                        {
                          title: 'Sân',
                          dataIndex: ['field', 'name'],
                          key: 'field',
                        },
                        {
                          title: 'Trạng thái',
                          dataIndex: 'status',
                          key: 'status',
                          render: (status) => {
                            let color = 'default';
                            let text = 'Không xác định';
                            
                            if (status === 'done') {
                              color = 'green';
                              text = 'Hoàn thành';
                            } else if (status === 'upcoming') {
                              color = 'blue';
                              text = 'Sắp diễn ra';
                            } else if (status === 'canceled') {
                              color = 'red';
                              text = 'Đã hủy';
                            }
                            
                            return <Tag color={color}>{text}</Tag>;
                          },
                        },
                      ]}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Modal>

        {/* Booking Slot Modal */}
        <Modal
          title="Thông tin đặt sân"
          open={isSlotModalVisible}
          onCancel={() => setIsSlotModalVisible(false)}
          footer={null}
          width={isMobile ? '95%' : 600}
        >
          {currentSlot && (
            <div>
              <div className="mb-4">
                <strong className="mr-2">Sân:</strong>
                <span>{currentSlot.field}</span>
              </div>
              <div className="mb-4">
                <strong className="mr-2">Thời gian:</strong>
                <span>{selectedDate.format('DD/MM/YYYY')} | {currentSlot.time}</span>
              </div>
              
              {currentSlot.booking ? (
                <>
                  {/* <div className="mb-4">
                    <strong className="mr-2">Trạng thái:</strong>
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
                  </div> */}
                  
                  {currentSlot.booking.player && (
                    <div>
                      <div className="mb-4">
                        <strong className="mr-2">Người đặt:</strong>
                        <span>{currentSlot.booking.player.name}</span>
                      </div>
                      <div className="mb-4">
                        <strong className="mr-2">Số điện thoại:</strong>
                        <span>{currentSlot.booking.player.phoneNumber}</span>
                      </div>
                      <div className="mb-4">
                        <strong className="mr-2">Email:</strong>
                        <span>{currentSlot.booking.player.email}</span>
                      </div>
                    </div>
                  )}
                                   
                  <div className="mb-4">
                    <strong className="mr-2">Giá tiền:</strong>
                    <span>{currentSlot.booking.payment?.fieldPrice?
                    currentSlot.booking.payment?.fieldPrice+
                    (currentSlot.booking.payment?.servicePrice||0)-
                    (currentSlot.booking.payment?.discount||0)-
                    (currentSlot.booking.payment?.refund||0)
                    :0
                    .toLocaleString()} đ</span>
                  </div>
                </>
              ) : (
                <div className="mb-4">
                  <strong>Chưa có người đặt</strong>
                </div>
              )}
            </div>
          )}
        </Modal>

        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Lưu ý: Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua hotline: 0976302-xxx</p>
        </div>
      </div>
    </div>
  );
};

export default PlaySchedule;

