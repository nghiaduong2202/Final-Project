import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Select, Card, Typography, Modal, Input, Radio, message } from 'antd';
import { PlusOutlined, ArrowRightOutlined, SearchOutlined } from '@ant-design/icons';
import { Service, UpdatedServiceValues, ServiceType } from '@/types/service.type';
import { serviceService } from '@/services/service.service';
import { facilityService, FacilityDropdownItem } from '@/services/facility.service';
import serviceImage from '@/assets/Owner/content/service.png';
import { formatPrice } from '@/utils/statusUtils';
import { sportService } from '@/services/sport.service';
import { Sport } from '@/types/sport.type';
import { getSportNameInVietnamese } from '@/utils/translateSport';

// Component imports
import ServiceTable from './components/ServiceTable';
import ServiceDetailModal from './components/ServiceDetailModal';
import ServiceEditModal from './components/ServiceEditModal';
import ServiceConfirmModal from './components/ServiceConfirmModal';

const { Title, Text } = Typography;
const { Option } = Select;

// Key lưu trữ trong localStorage
const SELECTED_FACILITY_KEY = 'owner_selected_facility_id';

const ServiceManagement: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  
  // Local state
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [facilities, setFacilities] = useState<FacilityDropdownItem[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  
  // Trạng thái cho modal chỉnh sửa dịch vụ
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [updatedValues, setUpdatedValues] = useState<UpdatedServiceValues | null>(null);

  // Theo dõi kích thước màn hình
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    // Cập nhật ban đầu
    updateWidth();

    // Theo dõi thay đổi kích thước
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  const itemsPerPage = containerWidth < 640 ? 5 : 10;

  // Filter options - thay đổi từ status sang type
  const typeFilterOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'rental', label: 'Cho thuê' },
    { value: 'coaching', label: 'Huấn luyện' },
    { value: 'equipment', label: 'Thiết bị' },
    { value: 'other', label: 'Khác' }
  ];

  // Fetch facilities và thể thao khi component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch danh sách cơ sở
        const facilitiesData = await facilityService.getFacilitiesDropdown();
        setFacilities(facilitiesData);
        
        // Fetch danh sách thể thao
        // Đổi lấy danh sách thể thao từ api thành lấy từ getfacility
        const sportsData = await sportService.getSport();
        if (Array.isArray(sportsData) && sportsData.length > 0) {
          setSports(sportsData);
        }
        
        // Lấy facilityId từ localStorage
        const savedFacilityId = localStorage.getItem(SELECTED_FACILITY_KEY);
        
        // Kiểm tra xem savedFacilityId có còn hợp lệ không (có tồn tại trong danh sách facilities không)
        const isValidSavedId = savedFacilityId && facilitiesData.some(f => f.id === savedFacilityId);
        
        // Nếu ID trong localStorage không hợp lệ, sử dụng ID đầu tiên trong danh sách
        const initialFacilityId = isValidSavedId ? savedFacilityId : (facilitiesData.length > 0 ? facilitiesData[0].id : '');
        
        if (initialFacilityId) {
          // Nếu ID đã thay đổi, cập nhật lại localStorage
          if (initialFacilityId !== savedFacilityId) {
            localStorage.setItem(SELECTED_FACILITY_KEY, initialFacilityId);
          }
          setSelectedFacilityId(initialFacilityId);
          fetchServices(initialFacilityId);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        message.error('Không thể tải dữ liệu ban đầu. Vui lòng thử lại sau.');
        setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
      }
    };
    
    fetchInitialData();
  }, []);

  // Handle facility selection
  const handleFacilitySelect = (value: string) => {
    setSelectedFacilityId(value);
    localStorage.setItem(SELECTED_FACILITY_KEY, value);
    fetchServices(value);
  };

  // Fetch services based on facility ID
  const fetchServices = async (facilityId: string = selectedFacilityId) => {
    if (!facilityId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const servicesData = await serviceService.getServicesByFacility(facilityId);
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
      message.error('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Filter services based on search term and type
  const filteredServices = services.filter(service => {
    // Filter by search term
    const searchMatch = 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (service.sport && service.sport.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by type
    const typeMatch = typeFilter === 'all' || service.type === typeFilter as ServiceType;
    
    return searchMatch && typeMatch;
  });

  // Pagination logic
  const totalServices = filteredServices.length;
  const currentServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle delete service
  const handleDeleteService = (serviceId: string) => {
    const serviceToDelete = services.find(service => service.id.toString() === serviceId);
    
    if (!serviceToDelete) return;
    
    Modal.confirm({
      title: 'Xác nhận xóa dịch vụ',
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa dịch vụ sau đây?</p>
          <div className="bg-gray-50 p-3 mt-2 rounded-md">
            <p><strong>Tên dịch vụ:</strong> {serviceToDelete.name}</p>
            <p><strong>Loại hình:</strong> {serviceToDelete.sport?.name || ''}</p>
            <p><strong>Giá:</strong> {formatPrice(serviceToDelete.price)}</p>
            <p><strong>Số lượng hiện có:</strong> {serviceToDelete.amount}</p>
          </div>
          <p className="mt-2 text-red-500">Lưu ý: Hành động này không thể hoàn tác.</p>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      width: containerWidth < 480 ? '95%' : 520,
      onOk: async () => {
        try {
          await serviceService.deleteService(serviceToDelete.id);
          
          // Update local state
          setServices(prevServices => prevServices.filter(service => service.id !== serviceToDelete.id));
          
          message.success('Xóa dịch vụ thành công');
        } catch (error) {
          console.error('Error deleting service:', error);
          message.error('Không thể xóa dịch vụ. Vui lòng thử lại sau.');
        }
      }
    });
  };

  // Navigate to create service page
  const handleCreateService = () => {
    navigate('/owner/create-service');
  };

  // Mở modal xem chi tiết dịch vụ
  const handleViewService = (service: Service) => {
    setCurrentService(service);
    setViewModalVisible(true);
  };

  // Mở modal chỉnh sửa dịch vụ
  const handleEditService = (service: Service) => {
    setCurrentService(service);
    setEditModalVisible(true);
  };

  // Trước khi cập nhật, lưu giá trị mới và hiển thị popup xác nhận
  const handleConfirmUpdate = (values: UpdatedServiceValues) => {
    setUpdatedValues(values);
  };

  // Xử lý cập nhật dịch vụ
  const handleUpdateService = async () => {
    if (!currentService || !updatedValues) return;
    
    setSubmitting(true);
    
    try {
      // Call API to update service
      await serviceService.updateService(currentService.id, updatedValues);
      
      // Update the service in local state
      const updatedService: Service = {
        ...currentService,
        name: updatedValues.name,
        description: updatedValues.description,
        price: updatedValues.price,
        amount: updatedValues.amount,
        unit: updatedValues.unit,
        type: updatedValues.type,
        sport: {
          id: updatedValues.sportId,
          name: getSportName(updatedValues.sportId)
        }
      };
      
      setServices(prevServices => 
        prevServices.map(service => 
          service.id === currentService.id ? updatedService : service
        )
      );
      
      setSubmitting(false);
      setCurrentService(null);
      setUpdatedValues(null);
      setEditModalVisible(false);
      
      message.success('Cập nhật dịch vụ thành công');
    } catch (error) {
      console.error('Error updating service:', error);
      message.error('Không thể cập nhật dịch vụ. Vui lòng thử lại sau.');
      setSubmitting(false);
    }
  };


  // Lấy tên thể thao từ ID
  const getSportName = (sportId: number): string => {
    const sport = sports.find(s => s.id === sportId);
    return sport ? getSportNameInVietnamese(sport.name) : 'Không xác định';
  };

  // Hủy cập nhật
  const handleCancelUpdate = () => {
    setCurrentService(null);
    setUpdatedValues(null);
    setEditModalVisible(false);
  };

  const isMobile = containerWidth <= 768;

  return (
    <div ref={containerRef} className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Promotional Banner */}
      <Card className="mb-4 md:mb-8 overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between gap-4 md:gap-8">
          <div className="flex-1">
            <Title level={2} className="text-lg sm:text-xl md:text-2xl lg:text-3xl !m-0 mb-2 sm:mb-4">
              Tạo ngay dịch vụ để tăng doanh thu cho cơ sở của bạn!!!
            </Title>
            <Text className="block mb-4 sm:mb-8 text-gray-600 text-sm sm:text-base">
              Cơ hội tăng đến 43% đơn đặt sân và 28% doanh thu khi tạo dịch vụ tiện ích cho Khách hàng.
            </Text>
            <Button 
              type="primary"
              size={isMobile ? "middle" : "large"}
              icon={<PlusOutlined />}
              onClick={handleCreateService}
              style={{ background: '#cc440a', display: 'flex', alignItems: 'center', width: 'fit-content' }}
            >
              Tạo dịch vụ ngay <ArrowRightOutlined style={{ marginLeft: 8 }} />
            </Button>
          </div>
          <div className="lg:max-w-md max-w-xs mx-auto lg:mx-0">
            <img 
              src={serviceImage} 
              alt="Service illustration" 
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </Card>

      {/* Service List Section */}
      <Card title="Danh sách dịch vụ" className="mb-4 md:mb-8">
        {/* Facility selector */}
        <div className="mb-4 md:mb-6">
          <Select
            placeholder="Chọn cơ sở của bạn"
            style={{ width: '100%' }}
            value={selectedFacilityId || undefined}
            onChange={handleFacilitySelect}
            popupMatchSelectWidth={false}
            size={isMobile ? "middle" : "large"}
          >
            {facilities.map((facility) => (
              <Option key={facility.id} value={facility.id}>
                {facility.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3 md:gap-4">
          <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="min-w-max">
              <Radio.Group 
                options={typeFilterOptions} 
                onChange={e => setTypeFilter(e.target.value)} 
                value={typeFilter}
                optionType="button"
                size={isMobile ? "small" : "middle"}
                className="flex-nowrap"
              />
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <Input
              placeholder="Tìm kiếm dịch vụ"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-[300px]"
              size={isMobile ? "middle" : "large"}
            />
          </div>
        </div>

        {/* Conditional rendering based on state */}
        {!selectedFacilityId ? (
          <div className="flex flex-col items-center justify-center h-40 sm:h-64 bg-white rounded-lg p-4 md:p-6">
            <p className="text-base md:text-lg text-gray-600 mb-4 text-center">Vui lòng chọn cơ sở để xem danh sách dịch vụ</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm md:text-base">
            {error}
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-40 sm:h-64">
            <p className="text-base md:text-lg">Đang tải dữ liệu...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 sm:h-64 bg-white rounded-lg p-4 md:p-6">
            <p className="text-base md:text-lg text-gray-600 mb-4 text-center">Chưa có dịch vụ nào</p>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateService}
              size={isMobile ? "middle" : "large"}
            >
              Thêm dịch vụ mới
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4 sm:-mx-0 sm:px-0">
            <div className="min-w-[650px]">
              <ServiceTable
                services={currentServices}
                loading={loading}
                onDelete={handleDeleteService}
                onView={handleViewService}
                onEdit={handleEditService}
                pagination={{
                  current: currentPage,
                  total: totalServices,
                  pageSize: itemsPerPage,
                  onChange: (page: number) => setCurrentPage(page),
                  showSizeChanger: false
                }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Service Detail Modal */}
      {currentService && (
        <ServiceDetailModal
          visible={viewModalVisible}
          service={currentService}
          onClose={() => {
            setViewModalVisible(false);
            setCurrentService(null);
          }}
        />
      )}

      {/* Service Edit Modal */}
      {currentService && (
        <ServiceEditModal
          visible={editModalVisible}
          service={currentService}
          sports={sports}
          onCancel={handleCancelUpdate}
          onSubmit={handleConfirmUpdate}
        />
      )}

      {/* Service Confirmation Modal */}
      {currentService && updatedValues && (
        <ServiceConfirmModal
          visible={!!updatedValues}
          service={currentService}
          updatedValues={updatedValues}
          onConfirm={handleUpdateService}
          onCancel={() => setUpdatedValues(null)}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default ServiceManagement;