import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Select, Card, Typography, Modal, Input, Tabs, Tag, Empty, Row, Col, Badge } from 'antd';
import { PlusOutlined, SearchOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import { Event, EventType } from '@/types/event.type';
import { mockEvents } from '@/mocks/event/eventData';
import { mockFacilitiesDropdown } from '@/mocks/facility/mockFacilities';
import { getRegistrationCountsByStatus } from '@/mocks/event/registrationData';

// Components
import EventTable from './components/EventTable';
import EventDetailModal from './components/EventDetailModal';
import EventEditModal from './components/EventEditModal';
import RegistrationManagement from './components/RegistrationManagement';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Local storage key
const SELECTED_FACILITY_KEY = 'owner_selected_facility_id';

const EventManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // States
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<EventType | 'all'>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Registration management
  const [activeTab, setActiveTab] = useState<string>('events');
  const [registrationManagementVisible, setRegistrationManagementVisible] = useState<boolean>(false);
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState<Event | null>(null);

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'active', label: 'Đang diễn ra' },
    { value: 'upcoming', label: 'Sắp diễn ra' },
    { value: 'expired', label: 'Đã kết thúc' }
  ];

  // Event type filter options
  const eventTypeOptions = [
    { value: 'all', label: 'Tất cả loại' },
    { value: 'TOURNAMENT', label: 'Giải đấu' },
    { value: 'DISCOUNT', label: 'Khuyến mãi' }
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
      setSelectedFacility(initialFacilityId);
      fetchEvents();
    }
  }, []);

  const fetchEvents = useCallback(() => {
    setLoading(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      let filteredEvents = [...mockEvents];
      
      // Filter by facility if selected
      if (selectedFacility) {
        filteredEvents = filteredEvents.filter(event => event.facilityId === selectedFacility);
      }
      
      // Apply status filter
      if (filter !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.status === filter);
      }
      
      // Apply event type filter
      if (eventTypeFilter !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.eventType === eventTypeFilter);
      }
      
      // Apply search filter
      if (search) {
        const lowerCaseSearch = search.toLowerCase();
        filteredEvents = filteredEvents.filter(
          event => 
            event.name.toLowerCase().includes(lowerCaseSearch) || 
            event.description.toLowerCase().includes(lowerCaseSearch)
        );
      }
      
      setEvents(filteredEvents);
      setLoading(false);
    }, 500);
  }, [selectedFacility, filter, eventTypeFilter, search]);
  
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle facility change
  const handleFacilityChange = (value: string | null) => {
    setSelectedFacility(value);
  };

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilter(value);
  };

  // Handle event type filter change
  const handleEventTypeFilterChange = (value: EventType | 'all') => {
    setEventTypeFilter(value);
  };

  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
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
    setSelectedEvent(event);
    setDetailModalVisible(true);
  };

  // Handle edit event
  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setEditModalVisible(true);
  };

  // Handle save updates and handle submitting state
  const handleSaveEvent = (updatedEvent: Event) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update events list
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
      
      setLoading(false);
      setEditModalVisible(false);
      
      // Show success message
      Modal.success({
        title: 'Cập nhật thành công',
        content: 'Thông tin sự kiện đã được cập nhật thành công.'
      });
    }, 800);
  };

  // New function for managing registrations
  const handleManageRegistrations = (event: Event) => {
    setSelectedEventForRegistration(event);
    setRegistrationManagementVisible(true);
    setActiveTab('registrations');
  };

  // Get registration count badge for an event
  const getRegistrationBadge = (eventId: number) => {
    const counts = getRegistrationCountsByStatus(eventId);
    if (counts.total === 0) return null;
    
    return (
      <Badge count={counts.pending} size="small">
        <Tag color="blue" style={{ marginLeft: 8 }}>
          <TeamOutlined /> {counts.total} đăng ký
        </Tag>
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="event-management-tabs"
      >
        <TabPane
          tab={
            <span>
              <CalendarOutlined />
              Danh sách sự kiện
            </span>
          }
          key="events"
        >
          {/* Banner for creating new events */}
          <Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <Row align="middle" justify="space-between">
              <Col>
                <Title level={4} className="m-0">Quản lý sự kiện</Title>
                <Text>Tạo và quản lý các sự kiện của cơ sở thể thao của bạn</Text>
              </Col>
              <Col>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleCreateEvent}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Tạo sự kiện mới
                </Button>
              </Col>
            </Row>
          </Card>
          
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={6} lg={5}>
                <Text strong>Cơ sở:</Text>
                <Select
                  placeholder="Chọn cơ sở"
                  style={{ width: '100%', marginTop: 8 }}
                  onChange={handleFacilityChange}
                  allowClear
                  value={selectedFacility}
                >
                  {mockFacilitiesDropdown.map(facility => (
                    <Option key={facility.id} value={facility.id}>
                      {facility.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              
              <Col xs={24} sm={12} md={6} lg={5}>
                <Text strong>Trạng thái:</Text>
                <Select
                  placeholder="Chọn trạng thái"
                  style={{ width: '100%', marginTop: 8 }}
                  onChange={handleFilterChange}
                  value={filter}
                >
                  {filterOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Col>
              
              <Col xs={24} sm={12} md={6} lg={5}>
                <Text strong>Loại sự kiện:</Text>
                <Select
                  placeholder="Chọn loại sự kiện"
                  style={{ width: '100%', marginTop: 8 }}
                  onChange={handleEventTypeFilterChange}
                  value={eventTypeFilter}
                >
                  {eventTypeOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Col>
              
              <Col xs={24} sm={12} md={6} lg={9}>
                <Text strong>Tìm kiếm:</Text>
                <Input 
                  placeholder="Tìm kiếm theo tên sự kiện" 
                  onChange={handleSearchChange}
                  value={search}
                  prefix={<SearchOutlined />}
                  style={{ marginTop: 8 }}
                />
              </Col>
            </Row>
          </div>
          
          {/* Events Table */}
          {events.length > 0 ? (
            <EventTable 
              events={events}
              loading={loading}
              onView={handleViewEvent}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onManageRegistrations={handleManageRegistrations}
              getRegistrationBadge={getRegistrationBadge}
            />
          ) : (
            <Empty 
              description="Không tìm thấy sự kiện nào" 
              className="bg-white p-8 rounded-lg shadow-sm"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <TeamOutlined />
              Quản lý đăng ký
            </span>
          }
          key="registrations"
        >
          {selectedEventForRegistration ? (
            <RegistrationManagement 
              visible={registrationManagementVisible}
              event={selectedEventForRegistration}
              onClose={() => {
                setRegistrationManagementVisible(false);
                setActiveTab('events');
                setSelectedEventForRegistration(null);
              }}
            />
          ) : (
            <Card className="text-center p-6">
              <Empty 
                description="Vui lòng chọn một sự kiện để quản lý đăng ký" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
              <Button 
                type="primary" 
                onClick={() => setActiveTab('events')}
                className="mt-4"
              >
                Quay lại danh sách sự kiện
              </Button>
            </Card>
          )}
        </TabPane>
      </Tabs>
      
      {/* Event Detail Modal */}
      <EventDetailModal 
        visible={detailModalVisible}
        event={selectedEvent}
        onClose={() => setDetailModalVisible(false)}
        onEdit={handleEditEvent}
      />
      
      {/* Event Edit Modal */}
      <EventEditModal 
        visible={editModalVisible}
        event={selectedEvent}
        onClose={() => setEditModalVisible(false)}
        onSubmit={handleSaveEvent}
        submitting={loading}
      />
    </div>
  );
};

export default EventManagement; 