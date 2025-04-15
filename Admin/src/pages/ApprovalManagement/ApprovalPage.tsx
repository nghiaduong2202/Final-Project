import React, { useState, useEffect, useRef } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Tag, 
  message, 
  Card, 
  Tabs, 
  Modal, 
  Image, 
  Pagination,
  Spin,
  Empty
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { approvalService } from '@/services/approval.service';
import { Approval } from '@/types/approval.types';
import { ColumnType } from 'antd/es/table';
import { getSportNameInVietnamese } from '@/utils/translateSport';

const { Option } = Select;

const ApprovalPage: React.FC = () => {
  // UI responsive reference
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Approval data states
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [filteredApprovals, setFilteredApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  
  // Modal states
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);

  // Monitor container width for responsive design
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

  // Fetch approvals on component mount
  useEffect(() => {
    fetchApprovals();
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [approvals, activeTab, filterType, searchQuery, currentPage, pageSize]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await approvalService.getApprovals();
      setApprovals(response.data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
      message.error('Không thể tải danh sách yêu cầu phê duyệt');
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!approvals.length) {
      setFilteredApprovals([]);
      setTotalItems(0);
      return;
    }

    // Filter by status (tab)
    let result = approvals;
    if (activeTab !== 'all') {
      result = result.filter(approval => approval.status === activeTab);
    }

    // Filter by type
    if (filterType) {
      result = result.filter(approval => approval.type === filterType);
    }

    // Filter by search query (search in facility name)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(approval => 
        approval.facility?.name?.toLowerCase().includes(query)
      );
    }

    // Update total for pagination
    setTotalItems(result.length);

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedResult = result.slice(startIndex, startIndex + pageSize);

    setFilteredApprovals(paginatedResult);
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when search changes
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterType(null);
    setCurrentPage(1);
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(true);
      await approvalService.approveRequest(id);
      message.success('Đã phê duyệt yêu cầu thành công');
      
      // Cập nhật trạng thái approval trực tiếp trong state thay vì gọi lại API
      setApprovals(prevApprovals => 
        prevApprovals.map(item => 
          item.id === id ? { ...item, status: 'approved' } : item
        )
      );
      
      // Đóng modal chi tiết nếu đang mở
      if (detailsModalVisible && selectedApprovalId === id) {
        setDetailsModalVisible(false);
      }

      // Đóng modal xác nhận
      setConfirmModalVisible(false);
      setConfirmAction(null);
    } catch (error) {
      console.error('Error approving request:', error);
      message.error('Không thể phê duyệt yêu cầu. Vui lòng thử lại sau');
      // Nếu có lỗi, tải lại toàn bộ dữ liệu
      fetchApprovals();
    } finally {
      setActionLoading(false);
    }
  };


  const confirmReject = async () => {
    if (!selectedApprovalId || !rejectReason.trim()) {
      message.warning('Vui lòng nhập lý do từ chối');
      return;
    }
    
    try {
      setActionLoading(true);
      await approvalService.rejectRequest(selectedApprovalId, rejectReason);
      message.success('Đã từ chối yêu cầu thành công');
      
      // Cập nhật trạng thái approval trực tiếp trong state
      setApprovals(prevApprovals => 
        prevApprovals.map(item => 
          item.id === selectedApprovalId 
            ? { ...item, status: 'rejected', note: rejectReason } 
            : item
        )
      );
      
      setRejectModalVisible(false);
      setRejectReason('');
      
      // Đóng modal chi tiết nếu đang mở
      if (detailsModalVisible && selectedApprovalId === selectedApproval?.id) {
        setDetailsModalVisible(false);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      message.error('Không thể từ chối yêu cầu. Vui lòng thử lại sau');
      // Nếu có lỗi, tải lại toàn bộ dữ liệu
      fetchApprovals();
    } finally {
      setActionLoading(false);
      setSelectedApprovalId(null);
    }
  };

  const handleViewDetails = (approval: Approval) => {
    setSelectedApproval(approval);
    setSelectedApprovalId(approval.id);
    setDetailsModalVisible(true);
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    console.log('Handling page change to:', page, pageSize);
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
    
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // No need to call fetchApprovals() here as it will be triggered by the useEffect
  };

  const getApprovalTypeText = (type: string) => {
    switch (type) {
      case 'facility':
        return 'Đăng ký cơ sở mới';
      case 'facility_name':
        return 'Thay đổi tên cơ sở';
      case 'certificate':
        return 'Giấy chứng nhận';
      case 'license':
        return 'Giấy phép kinh doanh';
      default:
        return type;
    }
  };

  const getApprovalStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Đã phê duyệt';
      case 'pending': return 'Đang chờ';
      case 'rejected': return 'Đã từ chối';
      default: return 'Không xác định';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'processing';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getApprovalTypeColor = (type: string) => {
    switch (type) {
      case 'facility': return 'blue';
      case 'facility_name': return 'orange';
      case 'certificate': return 'green';
      case 'license': return 'purple';
      default: return 'default';
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Loại yêu cầu',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getApprovalTypeColor(type)}>
          {getApprovalTypeText(type)}
        </Tag>
      ),
    },
    {
      title: 'Cơ sở',
      key: 'facility',
      render: (record: Approval) => (
        <div>
          <div className="font-medium">{record.facility?.name || 'N/A'}</div>
          
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (record: Approval) => (
        <Tag color={getApprovalStatusColor(record.status)}>
          {getApprovalStatusText(record.status)}
        </Tag>
      ),
      className: 'hidden md:table-cell'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
      className: 'hidden lg:table-cell'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (record: Approval) => (
        <Button
          type="primary"
          size={containerWidth < 768 ? "small" : "middle"}
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          className="w-full"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  // Tab items for the approval status filter
  const tabItems = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Đang chờ' },
    { key: 'approved', label: 'Đã duyệt' },
    { key: 'rejected', label: 'Đã từ chối' }    
  ];

  // Handle tab change
  const handleTabChange = (activeKey: string) => {
    setActiveTab(activeKey);
    setCurrentPage(1); // Reset to first page on tab change
  };

  // Handle filter type change
  const handleFilterTypeChange = (value: string | null) => {
    setFilterType(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const showConfirmModal = (action: 'approve' | 'reject', id: string) => {
    setSelectedApprovalId(id);
    setConfirmAction(action);
    setConfirmModalVisible(true);
  };

  const handleConfirmAction = () => {
    if (confirmAction === 'approve' && selectedApprovalId) {
      handleApprove(selectedApprovalId);
    } else if (confirmAction === 'reject' && selectedApprovalId) {
      setConfirmModalVisible(false);
      setRejectModalVisible(true);
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        {/* Header with Title */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Quản lý phê duyệt</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-2">
            Quản lý và xử lý các yêu cầu phê duyệt từ chủ cơ sở
          </p>
        </div>
        
        {/* Filter Tabs */}
        <div className="mb-4 md:mb-6 overflow-x-auto -mx-3 px-3">
          <Tabs 
            activeKey={activeTab}
            onChange={handleTabChange}
            items={tabItems}
            type="card"
            className="approval-filter-tabs"
            size={containerWidth < 768 ? "small" : "middle"}
          />
        </div>
        
        {/* Search and Filter */}
        <Card 
          className="mb-6 shadow-sm" 
          styles={{ body: { padding: containerWidth < 576 ? 12 : 16 } }}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <Input
              placeholder="Tìm kiếm theo tên cơ sở..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onPressEnter={handleSearch}
              className="flex-grow"
              allowClear
              size={containerWidth < 768 ? "middle" : "large"}
            />
            
            <Select
              placeholder="Loại yêu cầu"
              allowClear
              className="w-full sm:w-44 md:w-56"
              onChange={handleFilterTypeChange}
              value={filterType}
              size={containerWidth < 768 ? "middle" : "large"}
            >
              <Option value="facility">Đăng ký cơ sở mới</Option>
              <Option value="facility_name">Thay đổi tên cơ sở</Option>
              <Option value="certificate">Giấy chứng nhận</Option>
              <Option value="license">Giấy phép kinh doanh</Option>
            </Select>
            
            <div className="flex gap-2">
              <Button 
                icon={<SearchOutlined />} 
                type="primary"
                className="bg-blue-500 sm:w-auto"
                size={containerWidth < 768 ? "middle" : "large"}
                onClick={handleSearch}
              >
                {containerWidth < 576 ? '' : 'Tìm kiếm'}
              </Button>
              
              <Button 
                icon={<ReloadOutlined />}
                size={containerWidth < 768 ? "middle" : "large"}
                onClick={() => {
                  resetFilters();
                  fetchApprovals();
                }}
              >
                {containerWidth < 576 ? '' : 'Làm mới'}
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Approval Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64 flex-col">
            <Spin size="large" />
            <div className="mt-3">Đang tải dữ liệu...</div>
          </div>
        ) : filteredApprovals.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table
              columns={columns as ColumnType<Approval>[]}
              dataSource={filteredApprovals}
              rowKey="id"
              pagination={false}
              rowClassName="hover:bg-gray-50"
              scroll={{ x: 'max-content' }}
              size={containerWidth < 768 ? "small" : "middle"}
            />
            
            {/* Pagination */}
            <div className="py-4 px-4 border-t border-gray-100 flex justify-center overflow-x-auto">
              <Pagination 
                current={currentPage}
                total={totalItems}
                pageSize={pageSize}
                onChange={(page, pageSize) => {
                  console.log('Page change:', page, pageSize);
                  handlePageChange(page, pageSize);
                }}
                onShowSizeChange={(current, size) => {
                  console.log('Page size change:', current, size);
                  setPageSize(size);
                  setCurrentPage(1); // Reset to first page when changing page size
                  fetchApprovals();
                }}
                showSizeChanger={containerWidth >= 640}
                pageSizeOptions={['10', '20', '50']}
                showTotal={(total) => containerWidth >= 640 ? `Tổng cộng ${total} yêu cầu` : `${total} yêu cầu`}
                size={containerWidth < 640 ? "small" : "default"}
                className="responsive-pagination"
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-12">
            <Empty 
              description={
                <span className="text-gray-500 text-sm sm:text-base">
                  {searchQuery || filterType 
                    ? "Không tìm thấy yêu cầu phê duyệt phù hợp với điều kiện tìm kiếm" 
                    : `Không có yêu cầu phê duyệt nào ${
                        activeTab === 'pending' ? 'đang chờ xử lý' : 
                        activeTab === 'approved' ? 'đã được phê duyệt' : 'đã bị từ chối'
                      }`
                  }
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
        
        {/* Modal Chi tiết yêu cầu */}
        <Modal
          title={null}
          open={detailsModalVisible}
          onCancel={() => setDetailsModalVisible(false)}
          width={containerWidth < 768 ? '95%' : 800}
          style={{ top: containerWidth < 768 ? 10 : 20 }}
          footer={null}
          destroyOnClose
        >
          {selectedApproval && (
            <div className="approval-detail-modal">
              {/* Header với trạng thái */}
              <div className="flex flex-col border-b pb-4 mb-6 mt-8">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold mb-1">Chi tiết yêu cầu phê duyệt</h2>
                  <div className="text-gray-500 text-sm text-right mt-1">
                    <div>Ngày tạo: {new Date(selectedApproval.createdAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Tag color={getApprovalTypeColor(selectedApproval.type)}>
                    {getApprovalTypeText(selectedApproval.type)}
                  </Tag>
                  <Tag color={getApprovalStatusColor(selectedApproval.status)}>
                    {getApprovalStatusText(selectedApproval.status)}
                  </Tag>
                </div>
              </div>

              {/* Nội dung chi tiết phân loại theo từng loại yêu cầu */}
              <div className="mb-6">
                {/* 1. Loại yêu cầu: Đăng ký cơ sở mới */}
                {selectedApproval.type === 'facility' && (
                  <div className="space-y-6">
                    {/* Thông tin cơ bản về cơ sở */}
                    <Card 
                      title={<div className="font-bold">Thông tin cơ sở</div>} 
                      className="shadow-sm" 
                      styles={{ body: { padding: 16 } }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-gray-500 mb-1">Tên cơ sở</div>
                          <div className="font-medium text-lg">{selectedApproval.facility?.name}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Địa chỉ</div>
                          <div>{selectedApproval.facility?.location}</div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-gray-500 mb-1">Mô tả</div>
                          <div>{selectedApproval.facility?.description || 'Không có mô tả'}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Giờ mở cửa</div>
                          <div>
                            {selectedApproval.facility?.openTime1 && selectedApproval.facility?.closeTime1 && (
                              <div>Ca 1: {selectedApproval.facility.openTime1.substring(0, 5)} - {selectedApproval.facility.closeTime1.substring(0, 5)}</div>
                            )}
                            {selectedApproval.facility?.openTime2 && selectedApproval.facility?.closeTime2 && (
                              <div>Ca 2: {selectedApproval.facility.openTime2.substring(0, 5)} - {selectedApproval.facility.closeTime2.substring(0, 5)}</div>
                            )}
                            {selectedApproval.facility?.openTime3 && selectedApproval.facility?.closeTime3 && (
                              <div>Ca 3: {selectedApproval.facility.openTime3.substring(0, 5)} - {selectedApproval.facility.closeTime3.substring(0, 5)}</div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Trạng thái cơ sở</div>
                          <Tag color={
                            selectedApproval.facility?.status === 'active' ? 'success' :
                            selectedApproval.facility?.status === 'pending' ? 'warning' :
                            selectedApproval.facility?.status === 'closed' ? 'default' : 'error'
                          }>
                            {selectedApproval.facility?.status === 'active' ? 'Đang hoạt động' :
                            selectedApproval.facility?.status === 'pending' ? 'Đang chờ phê duyệt' :
                            selectedApproval.facility?.status === 'closed' ? 'Đang đóng cửa' :
                            selectedApproval.facility?.status === 'unactive' ? 'Đã bị từ chối' : 'Đã bị cấm'}
                          </Tag>
                        </div>
                      </div>
                    </Card>

                    {/* Giấy chứng nhận */}
                    {selectedApproval.facility?.certificate && (
                      <Card 
                        title={<div className="font-bold">Giấy chứng nhận</div>} 
                        className="shadow-sm" 
                        styles={{ body: { padding: 16 } }}
                      >
                        <div className="flex justify-center bg-gray-50 p-3 rounded-lg">
                          <Image
                            src={selectedApproval.facility.certificate.verified || selectedApproval.facility.certificate.temporary || ''}
                            alt="Giấy chứng nhận"
                            style={{ maxHeight: '300px' }}
                            className="rounded shadow-sm"
                          />
                        </div>
                      </Card>
                    )}

                    {/* Giấy phép kinh doanh */}
                    <Card 
                      title={<div className="font-bold">Giấy phép kinh doanh</div>} 
                      className="shadow-sm" 
                      styles={{ body: { padding: 16 } }}
                    >
                      {selectedApproval.facility?.licenses && selectedApproval.facility.licenses.length > 0 ? (
                        <div className="space-y-4">
                          {selectedApproval.facility.licenses.map((license, index) => (
                            <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="text-gray-500 mb-1">Môn thể thao</div>
                                  <Tag color="blue">{license.sportId}</Tag>
                                </div>
                                {license.verified && (
                                  <Tag color="success">Đã xác thực</Tag>
                                )}
                              </div>
                              {license.verified && (
                                <div className="flex justify-center bg-gray-50 p-3 rounded-lg mt-2">
                                  <Image
                                    src={license.verified}
                                    alt={`Giấy phép kinh doanh ${index + 1}`}
                                    style={{ maxHeight: '200px' }}
                                    className="rounded shadow-sm"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500 italic text-center py-4">Không có thông tin giấy phép kinh doanh</div>
                      )}
                    </Card>

                    {/* Hình ảnh cơ sở */}
                    {selectedApproval.facility?.imagesUrl && selectedApproval.facility.imagesUrl.length > 0 && (
                      <Card 
                        title={<div className="font-bold">Hình ảnh cơ sở</div>} 
                        className="shadow-sm" 
                        styles={{ body: { padding: 16 } }}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {selectedApproval.facility.imagesUrl.map((image, index) => (
                            <div key={index} className="aspect-video relative overflow-hidden rounded">
                              <Image
                                src={image}
                                alt={`Hình ảnh cơ sở ${index + 1}`}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                )}

                {/* 2. Loại yêu cầu: Thay đổi tên cơ sở */}
                {selectedApproval.type === 'facility_name' && (
                  <div className="space-y-6">
                    <Card 
                      title={<div className="font-bold">Thông tin thay đổi tên</div>} 
                      className="shadow-sm" 
                      styles={{ body: { padding: 16 } }}
                    >
                      <div className="grid gap-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 p-4 bg-gray-50 rounded-lg">
                          <div className="md:w-1/2">
                            <div className="text-gray-500 mb-1">Tên cũ</div>
                            <div className="font-medium line-through">{selectedApproval.facility?.name}</div>
                          </div>
                          <div className="hidden md:block w-8 text-center text-gray-400">→</div>
                          <div className="md:w-1/2">
                            <div className="text-gray-500 mb-1">Tên mới</div>
                            <div className="font-medium text-green-700">{selectedApproval.name}</div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-gray-500 mb-1">Địa chỉ</div>
                          <div>{selectedApproval.facility?.location}</div>
                        </div>
                      </div>
                    </Card>

                    {/* Thông tin giấy chứng nhận nếu có */}
                    {selectedApproval.certifiacte && (
                      <Card 
                        title={<div className="font-bold">Giấy tờ đính kèm</div>} 
                        className="shadow-sm" 
                        styles={{ body: { padding: 16 } }}
                      >
                        <div className="flex justify-center bg-gray-50 p-3 rounded-lg">
                          <Image
                            src={selectedApproval.certifiacte}
                            alt="Giấy tờ đính kèm"
                            style={{ maxHeight: '300px' }}
                            className="rounded shadow-sm"
                          />
                        </div>
                      </Card>
                    )}
                  </div>
                )}

                {/* 3. Loại yêu cầu: Giấy chứng nhận */}
                {selectedApproval.type === 'certificate' && (
                  <div className="space-y-6">
                    <Card 
                      title={<div className="font-bold">Thông tin cơ sở</div>} 
                      className="shadow-sm" 
                      styles={{ body: { padding: 16 } }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-gray-500 mb-1">Tên cơ sở</div>
                          <div className="font-medium">{selectedApproval.facility?.name}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Địa chỉ</div>
                          <div>{selectedApproval.facility?.location}</div>
                        </div>
                      </div>
                    </Card>

                    {/* Giấy chứng nhận hiện tại và mới */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Giấy chứng nhận hiện tại */}
                      {selectedApproval.facility?.certificate?.verified && (
                        <Card 
                          title={<div className="font-bold">Giấy chứng nhận hiện tại</div>} 
                          className="shadow-sm h-full" 
                          styles={{ body: { padding: 16 } }}
                        >
                          <div className="flex justify-center bg-gray-50 p-3 rounded-lg h-full">
                            <Image
                              src={selectedApproval.facility.certificate.verified}
                              alt="Giấy chứng nhận hiện tại"
                              className="rounded shadow-sm"
                            />
                          </div>
                        </Card>
                      )}

                      {/* Giấy chứng nhận mới */}
                      {selectedApproval.certifiacte && (
                        <Card 
                          title={<div className="font-bold">Giấy chứng nhận mới</div>} 
                          className="shadow-sm h-full" 
                          styles={{ body: { padding: 16 } }}
                        >
                          <div className="flex justify-center bg-gray-50 p-3 rounded-lg h-full">
                            <Image
                              src={selectedApproval.certifiacte}
                              alt="Giấy chứng nhận mới"
                              className="rounded shadow-sm"
                            />
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Loại yêu cầu: Giấy phép kinh doanh */}
                {selectedApproval.type === 'license' && (
                  <div className="space-y-6">
                    <Card 
                      title={<div className="font-bold">Thông tin giấy phép kinh doanh</div>} 
                      className="shadow-sm" 
                      styles={{ body: { padding: 16 } }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-gray-500 mb-1">Tên cơ sở</div>
                          <div className="font-medium">{selectedApproval.facility?.name}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Môn thể thao</div>
                          <div className="font-medium">
                            <Tag color="blue">{getSportNameInVietnamese(selectedApproval.sport?.name || '')}</Tag>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-gray-500 mb-1">Địa chỉ</div>
                          <div>{selectedApproval.facility?.location}</div>
                        </div>
                      </div>
                    </Card>

                    {/* Giấy phép hiện tại và mới */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Giấy phép hiện tại */}
                      {selectedApproval.facility?.licenses && selectedApproval.facility.licenses.length > 0 && 
                       selectedApproval.sport && selectedApproval.facility.licenses.some(
                         license => license.sportId === selectedApproval.sport?.id && license.verified
                       ) && (
                        <Card 
                          title={<div className="font-bold">Giấy phép hiện tại</div>} 
                          className="shadow-sm h-full" 
                          styles={{ body: { padding: 16 } }}
                        >
                          <div className="flex justify-center bg-gray-50 p-3 rounded-lg h-full">
                            <Image
                              src={
                                selectedApproval.facility.licenses.find(
                                  license => license.sportId === selectedApproval.sport?.id
                                )?.verified || ''
                              }
                              alt="Giấy phép hiện tại"
                              className="rounded shadow-sm"
                            />
                          </div>
                        </Card>
                      )}

                      {/* Giấy phép mới */}
                      {selectedApproval.license && (
                        <Card 
                          title={<div className="font-bold">Giấy phép mới</div>} 
                          className="shadow-sm h-full" 
                          styles={{ body: { padding: 16 } }}
                        >
                          <div className="flex justify-center bg-gray-50 p-3 rounded-lg h-full">
                            <Image
                              src={selectedApproval.license}
                              alt="Giấy phép mới"
                              className="rounded shadow-sm"
                            />
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Thông tin ghi chú nếu có (đặc biệt quan trọng cho yêu cầu bị từ chối) */}
              {selectedApproval.note && (
                <div className="mb-6">
                  <Card 
                    title={<div className="font-bold">Ghi chú</div>} 
                    className="shadow-sm border-orange-200" 
                    styles={{ 
                      body: { padding: 16 },
                      header: { backgroundColor: '#FFF7ED' } 
                    }}
                  >
                    <div className="p-2 text-orange-700">{selectedApproval.note}</div>
                  </Card>
                </div>
              )}

              {/* Footer với các nút hành động */}
              <div className="mt-6 flex justify-end gap-3 border-t pt-4">                              
                {selectedApproval.status === 'pending' && (
                  <>
                    <Button 
                      danger 
                      onClick={() => showConfirmModal('reject', selectedApproval.id)}
                      size={containerWidth < 768 ? "middle" : "large"}
                      loading={actionLoading}
                    >
                      Từ chối
                    </Button>
                    <Button 
                      type="primary" 
                      className="bg-green-500"
                      onClick={() => showConfirmModal('approve', selectedApproval.id)}
                      size={containerWidth < 768 ? "middle" : "large"}
                      loading={actionLoading}
                    >
                      Phê duyệt
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </Modal>
        
        {/* Modal Từ chối */}
        <Modal
          title="Từ chối yêu cầu"
          open={rejectModalVisible}
          onOk={confirmReject}
          onCancel={() => {
            setRejectModalVisible(false);
            setRejectReason('');
          }}
          okText="Xác nhận từ chối"
          cancelText="Hủy"
          okButtonProps={{ 
            disabled: !rejectReason.trim(),
            loading: actionLoading,
            danger: true 
          }}
          cancelButtonProps={{ disabled: actionLoading }}
          width={containerWidth < 576 ? '95%' : 500}
        >
          <p className="mb-3">Vui lòng nhập lý do từ chối yêu cầu:</p>
          <Input.TextArea
            rows={4}
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối yêu cầu..."
            disabled={actionLoading}
            showCount
            maxLength={200}
          />
        </Modal>

        {/* Modal Xác nhận */}
        <Modal
          title="Xác nhận thao tác"
          open={confirmModalVisible}
          onOk={handleConfirmAction}
          onCancel={() => {
            setConfirmModalVisible(false);
            setConfirmAction(null);
          }}
          okText="Xác nhận"
          cancelText="Hủy"
          okButtonProps={{ 
            disabled: !selectedApprovalId,
            loading: actionLoading,
            danger: confirmAction === 'reject' 
          }}
          cancelButtonProps={{ disabled: actionLoading }}
          width={containerWidth < 576 ? '95%' : 500}
        >
          <p className="mb-3">Bạn có chắc chắn muốn {confirmAction === 'reject' ? 'từ chối' : 'phê duyệt'} yêu cầu này?</p>
        </Modal>
      </div>
    </div>
  );
};

export default ApprovalPage;