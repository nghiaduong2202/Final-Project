import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Select, Card, Typography, Radio, Modal, Input } from 'antd';
import { PlusOutlined, ArrowRightOutlined, SearchOutlined } from '@ant-design/icons';
import { Event, EventStatus } from '@/types/event.type';
import { mockEvents } from '@/mocks/event/eventData';
import { mockFacilitiesDropdown } from '@/mocks/facility/mockFacilities';
import eventImage from '@/assets/Owner/content/event.png';
import type { RadioChangeEvent } from 'antd';

// Components
import EventTable from './components/EventTable';
import EventDetailModal from './components/EventDetailModal';
import EventEditModal from './components/EventEditModal';

const { Title, Text } = Typography;
const { Option } = Select;

// Local storage key
const SELECTED_FACILITY_KEY = 'owner_selected_facility_id';

const EventManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // States
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'active', label: 'Đang diễn ra' },
    { value: 'upcoming', label: 'Sắp diễn ra' },
    { value: 'expired', label: 'Đã kết thúc' }
  ];

  // Load initial facility from localStorage
  useEffect(() => {
    const savedFacilityId = localStorage.getItem(SELECTED_FACILITY_KEY);
    
    // Kiểm tra xem savedFacilityId có còn hợp lệ không (có tồn tại trong danh sách facilities không)
    const isValidSavedId = savedFacilityId && mockFacilitiesDropdown.some(f => f.id === savedFacilityId);
    
    // Nếu ID trong localStorage không hợp lệ, sử dụng ID đầu tiên trong danh sách
    const initialFacilityId = isValidSavedId ? savedFacilityId : (mockFacilitiesDropdown.length > 0 ? mockFacilitiesDropdown[0].id : '');
    
    if (initialFacilityId) {
      // Nếu ID đã thay đổi, cập nhật lại localStorage
      if (initialFacilityId !== savedFacilityId) {
        localStorage.setItem(SELECTED_FACILITY_KEY, initialFacilityId);
      }
      setSelectedFacilityId(initialFacilityId);
      fetchEvents(initialFacilityId, activeFilter);
    }
  }, []);

  // Fetch events based on selected facility and filter
  const fetchEvents = (facilityId: string, filter: string) => {
    setLoading(true);
    setError(null);
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      try {
        let filteredEvents = mockEvents;
        
        // Filter by facility (in a real implementation)
        if (facilityId) {
          filteredEvents = filteredEvents.filter(event => event.facilityId === facilityId);
        }
        
        // Filter by status if not 'all'
        if (filter !== 'all') {
          filteredEvents = filteredEvents.filter(event => event.status === filter as EventStatus);
        }
        
        setEvents(filteredEvents);
        setLoading(false);
      } catch (error) {
        setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
        setLoading(false);
        console.error('Error fetching events:', error);
      }
    }, 500);
  };

  // Handle facility change
  const handleFacilityChange = (value: string) => {
    setSelectedFacilityId(value);
    localStorage.setItem(SELECTED_FACILITY_KEY, value);
    fetchEvents(value, activeFilter);
  };

  // Handle filter change
  const handleFilterChange = (e: RadioChangeEvent) => {
    const filter = e.target.value;
    setActiveFilter(filter);
    fetchEvents(selectedFacilityId, filter);
  };

  // Navigate to create event page
  const handleCreateEvent = () => {
    navigate('/owner/create-event');
  };

  // Handle delete event
  const handleDeleteEvent = (eventId: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa sự kiện',
      content: 'Bạn có chắc chắn muốn xóa sự kiện này không?',
      onOk: () => {
        // Filter out the deleted event
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        
        // Show success message
        Modal.success({
          title: 'Xóa sự kiện thành công',
          content: 'Sự kiện đã được xóa khỏi hệ thống.'
        });
      }
    });
  };

  // Handle view event details
  const handleViewEvent = (event: Event) => {
    setCurrentEvent(event);
    setDetailModalVisible(true);
  };

  // Handle edit event
  const handleEditEvent = (event: Event) => {
    setCurrentEvent(event);
    setEditModalVisible(true);
  };

  // Handle save updates and handle submitting state
  const handleSaveEvent = (updatedEvent: Event) => {
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update events list
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
      
      setSubmitting(false);
      setEditModalVisible(false);
      
      // Show success message
      Modal.success({
        title: 'Cập nhật thành công',
        content: 'Thông tin sự kiện đã được cập nhật thành công.'
      });
    }, 800);
  };

  // Filter events by search term
  const filteredEvents = events.filter(event => {
    return !searchTerm || 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex flex-col w-full min-h-screen p-6">
      {/* Banner Section */}
      <Card className="mb-8">
        <div className="flex flex-wrap justify-between items-center gap-6">
          <div className="flex-1 min-w-[300px]">
            <Title level={3} className="mb-4">
              Tạo ngay Event để thu hút người chơi đến cơ sở của bạn nào!
            </Title>
            <Text className="block mb-6 text-gray-600">
              Cơ hội tăng đến 43% đơn đặt sân và 28% doanh thu khi tạo Event cho Khách hàng.
            </Text>
            <Button 
              type="primary" 
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreateEvent}
              className="bg-[#cc440a] hover:bg-[#b33a08]"
            >
              Tạo Event ngay! <ArrowRightOutlined />
            </Button>
          </div>
          <div className="flex-shrink-0 w-full max-w-[400px]">
            <img src={eventImage} alt="Event Promotion" className="w-full h-auto rounded-lg" />
          </div>
        </div>
      </Card>

      {/* Event List Section */}
      <Card title="Danh sách sự kiện" className="mb-8">
        {/* Facility selector */}
        <div className="mb-6">
          <Select
            placeholder="Chọn cơ sở của bạn"
            style={{ width: '100%' }}
            value={selectedFacilityId || undefined}
            onChange={handleFacilityChange}
          >
            {mockFacilitiesDropdown.map((facility) => (
              <Option key={facility.id} value={facility.id}>
                {facility.name}
              </Option>
            ))}
          </Select>
        </div>

        {selectedFacilityId ? (
          <>
            {/* Search and filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <Radio.Group 
                  options={filterOptions} 
                  onChange={handleFilterChange}
                  value={activeFilter}
                  optionType="button"
                  className="flex-nowrap"
                />
              </div>
              
              <Input
                placeholder="Tìm kiếm sự kiện"
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: 300, width: '100%' }}
              />
            </div>

            {/* Events Table */}
            <EventTable 
              events={filteredEvents}
              loading={loading}
              onView={handleViewEvent}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
            />
            
            {error && <div className="text-red-500 mt-4">{error}</div>}
          </>
        ) : (
          <div className="text-center py-8">
            <Text className="text-gray-500">Vui lòng chọn cơ sở để xem danh sách sự kiện</Text>
          </div>
        )}
      </Card>

      {/* Event Detail Modal */}
      <EventDetailModal
        visible={detailModalVisible}
        event={currentEvent}
        onClose={() => setDetailModalVisible(false)}
        onEdit={handleEditEvent}
      />

      {/* Event Edit Modal */}
      <EventEditModal
        visible={editModalVisible}
        event={currentEvent}
        onClose={() => setEditModalVisible(false)}
        onSubmit={handleSaveEvent}
        submitting={submitting}
      />
    </div>
  );
};

export default EventManagement; 