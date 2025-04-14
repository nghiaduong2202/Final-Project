import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tag, 
  Button, 
  Tooltip, 
  Modal, 
  message, 
  Empty, 
  Input, 
  Card, 
  Row, 
  Col, 
  Pagination,
  Spin,
  Tabs
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  EnvironmentOutlined,
  StarOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { Facility } from '@/types/facility.type';
import { getSportNameInVietnamese } from '@/utils/translateSport';
import { facilityService } from '@/services/facility.service';
import FacilityDetail from './components/FacilityDetail';
import FacilityEdit from './components/FacilityEdit';
import OperatingHoursDisplay from '@/components/shared/OperatingHoursDisplay';

const FacilityManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // Local state
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  
  // Thêm tham chiếu cho container width để tính toán số cột
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Theo dõi width của container để điều chỉnh giao diện
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
  
  // Fetch facilities on component mount
  useEffect(() => {
    // Chỉ gọi API khi thay đổi trang, pageSize hoặc searchQuery
    fetchFacilities(currentPage, pageSize, searchQuery);
  }, [currentPage, pageSize, searchQuery]);
  
  // Theo dõi thay đổi của activeFilter để lọc dữ liệu từ facilities
  useEffect(() => {
    filterFacilitiesByStatus();
  }, [activeFilter, facilities]);
  
  // Hàm filter facilities theo status ở phía client
  const filterFacilitiesByStatus = () => {
    if (!facilities || facilities.length === 0) return;
    if (activeFilter === 'all') {
      setFilteredFacilities(facilities);
    } else {
      const filtered = facilities.filter(facility => facility.status === activeFilter);
      setFilteredFacilities(filtered);
    }
  };
  
  const fetchFacilities = async (page: number, pageSize: number, query: string = '') => {
    try {
      setLoading(true);
      // Get the userId from localStorage to fetch facilities for this owner
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        message.error('Không thể xác định người dùng hiện tại, vui lòng đăng nhập lại');
        return;
      }            
      // Gọi API không có tham số status để lấy tất cả dữ liệu
      const response = await facilityService.getMyFacilities(page, pageSize, 'all', query);      
      // Kiểm tra xem response có dữ liệu không
      if (!response.data && !Array.isArray(response)) {
        setFacilities([]);
        setFilteredFacilities([]);
        setTotalItems(0);
        return;
      }      
      // Lưu tất cả dữ liệu vào state facilities
      const facilitiesData = response.data || response;      
      setFacilities(facilitiesData);
      setTotalItems(response.total || facilitiesData.length);
      
      // Filter dữ liệu theo activeFilter hiện tại ngay sau khi nhận được dữ liệu mới
      if (activeFilter === 'all') {
        setFilteredFacilities(facilitiesData);
      } else {
        const filtered = facilitiesData.filter(facility => facility.status === activeFilter);
        setFilteredFacilities(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch facilities:', error);  
      message.error('Không thể tải danh sách cơ sở');
      setFacilities([]);
      setFilteredFacilities([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const filterButtons = [
    { id: 'all', label: 'Tất cả cơ sở' },
    { id: 'active', label: 'Đang hoạt động' },
    { id: 'unactive', label: 'Đang đóng cửa' },
    { id: 'pending', label: 'Đang chờ phê duyệt' },
    { id: 'rejected', label: 'Đã bị từ chối' }
  ];
  
  // Generate tab items for Tabs component
  const tabItems = filterButtons.map(button => ({
    key: button.id,
    label: button.label
  }));
  
  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi filter
  };
  
  const handleCreateFacility = () => {
    navigate('/owner/create-facility');
  };
  
  const handleViewDetail = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    setDetailModalVisible(true);
  };
  
  const handleEditFacility = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    setEditModalVisible(true);
  };
  
  const showDeleteConfirm = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    setDeleteModalVisible(true);
  };
  
  const handleDeleteFacility = async () => {
    if (!selectedFacilityId) return;
    
    try {
      setDeleteLoading(true);
      await facilityService.deleteFacility(selectedFacilityId);
      message.success('Cơ sở đã được xóa thành công');
      fetchFacilities(currentPage, pageSize, searchQuery);
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Failed to delete facility:', error);
      message.error('Không thể xóa cơ sở');
    } finally {
      setDeleteLoading(false);
      setSelectedFacilityId(null);
    }
  };
  
  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedFacilityId(null);
  };
  
  const closeEditModal = (updated: boolean = false) => {
    setEditModalVisible(false);
    setSelectedFacilityId(null);
    if (updated) {
      fetchFacilities(currentPage, pageSize, searchQuery);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'success';
      case 'unactive': return 'default';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };
  
  const getStatusText = (status: string) => {
    switch(status) {
      case 'active': return 'Đang hoạt động';
      case 'unactive': return 'Đang đóng cửa';
      case 'pending': return 'Đang chờ phê duyệt';
      case 'rejected': return 'Đã bị từ chối';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div ref={containerRef} className="max-w-7xl mx-auto">
        {/* Header with Title - Responsive text size */}
        <div className="mb-4 md:mb-8">          
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Quản lý tất cả các cơ sở của bạn</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-2">Quản lý, theo dõi và cập nhật thông tin các cơ sở thể thao của bạn</p>
        </div>

        {/* Search and Add Button - Better stacking on mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-2 md:mt-4 mb-4 md:mb-8 gap-3">
          <div className="flex-grow max-w-full sm:max-w-md">
            <Input
              placeholder="Tìm kiếm cơ sở theo tên, địa chỉ..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              size={containerWidth < 640 ? "middle" : "large"}
            />
          </div>
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreateFacility}
            size={containerWidth < 640 ? "middle" : "large"}
            className="bg-blue-500 w-full sm:w-auto"
          >
            Thêm cơ sở mới
          </Button>
        </div>
        
        {/* Filter Tabs - Responsive scrollable on mobile */}
        <div className="mb-4 md:mb-8 overflow-x-auto -mx-3 px-3 pb-1">
          <div className="min-w-max">
            <Tabs 
              activeKey={activeFilter} 
              onChange={handleFilterClick}
              type="card"
              className="facility-filter-tabs"
              items={tabItems}
              size={containerWidth < 768 ? "small" : "middle"}
            />
          </div>
        </div>
        
        {/* Facility Cards Grid - Dynamic columns based on screen size */}
        {loading ? (
          <div className="flex justify-center items-center h-64 flex-col">
            <Spin size="large" />
            <div className="mt-3">Đang tải dữ liệu...</div>
          </div>
        ) : filteredFacilities.length > 0 ? (
          <>
            <Row gutter={[16, 16]} className="facility-cards-grid">
              {filteredFacilities.map((facility) => (
                <Col key={facility.id} xs={24} sm={12} lg={8} xl={8}>
                  <Card 
                    hoverable
                    className="h-full shadow-sm hover:shadow-md transition-shadow"
                    cover={
                      <div className="h-40 sm:h-48 overflow-hidden relative">
                        {facility.imagesUrl && facility.imagesUrl.length > 0 ? (
                          <img 
                            src={facility.imagesUrl[0]} 
                            alt={facility.name} 
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                            loading="lazy" // Cải thiện performance
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <Tag color={getStatusColor(facility.status)}>
                            {getStatusText(facility.status)}
                          </Tag>
                        </div>
                      </div>
                    }
                    styles={{ 
                      body: { padding: containerWidth < 640 ? '12px' : '16px' }
                    }}
                    actions={[
                      <Tooltip title="Xem chi tiết">
                        <Button 
                          type="text" 
                          icon={<EyeOutlined style={{ color: '#1890ff' }} />} 
                          onClick={() => handleViewDetail(facility.id)}
                        />
                      </Tooltip>,
                      <Tooltip title="Chỉnh sửa">
                        <Button 
                          type="text" 
                          icon={<EditOutlined style={{ color: '#52c41a' }} />} 
                          onClick={() => handleEditFacility(facility.id)}
                        />
                      </Tooltip>,
                      <Tooltip title="Xóa">
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />} 
                          onClick={() => showDeleteConfirm(facility.id)}
                        />
                      </Tooltip>
                    ]}
                  >
                    <div className="p-1 sm:p-2">
                      {/* Tên cơ sở */}
                      <h3 className="text-base sm:text-lg font-semibold line-clamp-2 mb-1 sm:mb-2">{facility.name}</h3>
                      
                      {/* Giờ hoạt động */}
                      <div className="flex items-center text-gray-500 mb-1 sm:mb-2 text-xs sm:text-sm">
                        <OperatingHoursDisplay facility={facility} />
                        
                        {/* Rating */}
                        <div className="ml-auto flex items-center">
                          <StarOutlined className="text-yellow-500 mr-1" />
                          <span className="font-medium">{facility.avgRating.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      {/* Môn thể thao */}
                      <div className="mb-2 sm:mb-3">
                        <div className="flex flex-wrap gap-1">
                          {facility.sports && facility.sports.slice(0, containerWidth < 380 ? 2 : 4).map((sport) => (
                            <Tag key={sport.id} color="blue" className="text-xs sm:text-sm">{getSportNameInVietnamese(sport.name)}</Tag>
                          ))}
                          {facility.sports && facility.sports.length > (containerWidth < 380 ? 2 : 4) && (
                            <Tag className="text-xs sm:text-sm">+{facility.sports.length - (containerWidth < 380 ? 2 : 4)}</Tag>
                          )}
                        </div>
                      </div>
                      
                      {/* Địa chỉ */}
                      <div className="flex items-start mb-2 sm:mb-3 text-gray-600">
                        <EnvironmentOutlined className="mr-1 sm:mr-2 mt-1 flex-shrink-0 text-xs sm:text-sm" />
                        <p className="line-clamp-2 text-xs sm:text-sm">{facility.location}</p>
                      </div>
                      
                      {/* Khoảng giá */}
                      <div className="flex items-center text-blue-600 font-medium text-xs sm:text-sm">
                        <DollarOutlined className="mr-1 sm:mr-2 text-green-600" />
                        {facility.minPrice !== undefined && facility.maxPrice !== undefined ? (
                          <>
                            <span className="text-blue-600 font-medium">
                              {facility.minPrice.toLocaleString('vi-VN', { useGrouping: true }).replace(/,/g, '.')}đ - {facility.maxPrice.toLocaleString('vi-VN', { useGrouping: true }).replace(/,/g, '.')}đ
                            </span>
                            <span className="text-gray-500 text-xs ml-1">/giờ</span>
                          </>
                        ) : facility.fieldGroups && facility.fieldGroups.length > 0 ? (
                          <>
                            <span className="text-blue-600 font-medium">
                              {Math.min(...facility.fieldGroups.map(g => g.basePrice)).toLocaleString('vi-VN', { useGrouping: true }).replace(/,/g, '.')}đ - {Math.max(...facility.fieldGroups.map(g => g.basePrice)).toLocaleString('vi-VN', { useGrouping: true }).replace(/,/g, '.')}đ
                            </span>
                            <span className="text-gray-500 text-xs ml-1">/giờ</span>
                          </>
                        ) : (
                          <span className="text-gray-500">Chưa có thông tin giá</span>
                        )}
                      </div>
                                             
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            
            {/* Pagination - Responsive size and options */}
            <div className="mt-6 sm:mt-8 flex justify-center overflow-x-auto py-2">
              <Pagination 
                current={currentPage}
                total={totalItems}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={containerWidth >= 640}
                pageSizeOptions={['9', '18', '36']}
                showTotal={(total) => containerWidth >= 640 ? `Tổng cộng ${total} cơ sở` : `${total} cơ sở`}
                size={containerWidth < 640 ? "small" : "default"}
                className="responsive-pagination"
              />
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-12">
            <Empty 
              description={
                <span className="text-gray-500 text-sm sm:text-base">
                  {searchQuery 
                    ? "Không tìm thấy cơ sở phù hợp với tìm kiếm của bạn" 
                    : activeFilter !== 'all'
                      ? `Không có cơ sở nào trong trạng thái "${getStatusText(activeFilter)}"`
                      : "Bạn chưa có cơ sở nào. Hãy bắt đầu bằng việc thêm cơ sở mới!"
                  }
                </span>
              }
              styles={{ image: { height: containerWidth < 640 ? 80 : 100 } }}
            >
              {!searchQuery && activeFilter === 'all' && facilities.length === 0 && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleCreateFacility}
                  className="mt-4"
                  size={containerWidth < 640 ? "middle" : "large"}
                >
                  Thêm cơ sở mới
                </Button>
              )}
            </Empty>
          </div>
        )}
        
        {/* Modal styles - Cải thiện trải nghiệm trên mobile */}
        <Modal
          title={null}
          open={detailModalVisible}
          onCancel={closeDetailModal}
          footer={null}
          width={containerWidth < 768 ? '95%' : 900}
          style={{ top: containerWidth < 768 ? 10 : 20 }}
          styles={{ body: { padding: 0 } }}
          destroyOnClose
        >
          {selectedFacilityId && (
            <FacilityDetail 
              facilityId={selectedFacilityId} 
              onClose={closeDetailModal}
              onEdit={() => {
                closeDetailModal();
                handleEditFacility(selectedFacilityId);
              }}
            />
          )}
        </Modal>
        
        <Modal
          title={null}
          open={editModalVisible}
          onCancel={() => closeEditModal()}
          footer={null}
          width={containerWidth < 768 ? '95%' : 800}
          style={{ top: containerWidth < 768 ? 10 : 20 }}
          styles={{ body: { padding: 0 } }}
          destroyOnClose
        >
          {selectedFacilityId && (
            <FacilityEdit 
              facilityId={selectedFacilityId} 
              onClose={(updated) => closeEditModal(updated)}
            />
          )}
        </Modal>
        
        <Modal
          title="Xác nhận xóa cơ sở"
          open={deleteModalVisible}
          onCancel={() => setDeleteModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setDeleteModalVisible(false)}>
              Hủy bỏ
            </Button>,
            <Button 
              key="delete" 
              type="primary" 
              danger 
              loading={deleteLoading}
              onClick={handleDeleteFacility}
            >
              Xóa
            </Button>,
          ]}
          width={containerWidth < 480 ? '90%' : 'auto'}
        >
          <p className="text-sm sm:text-base">Bạn có chắc chắn muốn xóa cơ sở này không? Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến cơ sở.</p>
        </Modal>
      </div>
    </div>
  );
};

export default FacilityManagement;