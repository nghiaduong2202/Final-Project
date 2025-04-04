import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Select, Card, Typography, Modal, Input, Radio, message } from 'antd';
import { PlusOutlined, ArrowRightOutlined, SearchOutlined } from '@ant-design/icons';
import { Service, UpdatedServiceValues, ServiceType } from '@/types/service.type';
import { serviceService } from '@/services/service.service';
import { facilityService } from '@/services/facility.service';
import { FacilityDropdownItem } from '@/services/facility.service';
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
  
  const itemsPerPage = 10;

  // Filter options - thay đổi từ status sang type
  const typeFilterOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'rental', label: 'Cho thuê' },
    { value: 'coaching', label: 'Huấn luyện' },
    { value: 'food', label: 'Thức ăn' },
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
        const sportsData = await sportService.getSport();
        if (Array.isArray(sportsData) && sportsData.length > 0) {
          setSports(sportsData);
        }
        
        // Lấy facilityId từ localStorage hoặc sử dụng cơ sở đầu tiên
        const savedFacilityId = localStorage.getItem(SELECTED_FACILITY_KEY);
        const initialFacilityId = savedFacilityId || (facilitiesData.length > 0 ? facilitiesData[0].id : '');
        
        if (initialFacilityId) {
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

  return (
    <div className="p-6 md:p-8">
      {/* Promotional Banner */}
      <Card className="mb-8 overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div className="flex-1">
            <Title level={2} style={{ fontSize: 26 }} className="text-xl md:text-2xl lg:text-3xl">
              Tạo ngay dịch vụ để tăng doanh thu cho cơ sở của bạn!!!
            </Title>
            <Text className="block mb-8 text-gray-600">
              Cơ hội tăng đến 43% đơn đặt sân và 28% doanh thu khi tạo dịch vụ tiện ích cho Khách hàng.
            </Text>
            <Button 
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreateService}
              style={{ background: '#cc440a', display: 'flex', alignItems: 'center', width: 'fit-content' }}
            >
              Tạo dịch vụ ngay <ArrowRightOutlined style={{ marginLeft: 8 }} />
            </Button>
          </div>
          <div className="max-w-md">
            <img 
              src={serviceImage} 
              alt="Service illustration" 
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </Card>

      {/* Service List Section */}
      <Card title="Danh sách dịch vụ" className="mb-8">
        {/* Facility selector */}
        <div className="mb-6">
          <Select
            placeholder="Chọn cơ sở của bạn"
            style={{ width: '100%' }}
            value={selectedFacilityId || undefined}
            onChange={handleFacilitySelect}
            popupMatchSelectWidth={false}
          >
            {facilities.map((facility) => (
              <Option key={facility.id} value={facility.id}>
                {facility.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <Radio.Group 
              options={typeFilterOptions} 
              onChange={e => setTypeFilter(e.target.value)} 
              value={typeFilter}
              optionType="button"
              className="flex-nowrap"
            />
          </div>
          
          <Input
            placeholder="Tìm kiếm dịch vụ"
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: 300, width: '100%' }}
          />
        </div>

        {/* Conditional rendering based on state */}
        {!selectedFacilityId ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg p-6">
            <p className="text-lg text-gray-600 mb-4">Vui lòng chọn cơ sở để xem danh sách dịch vụ</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Đang tải dữ liệu...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg p-6">
            <p className="text-lg text-gray-600 mb-4">Chưa có dịch vụ nào</p>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateService}
            >
              Thêm dịch vụ mới
            </Button>
          </div>
        ) : (
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