import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Select, Card, Typography, Radio, Modal, Input } from 'antd';
import { PlusOutlined, ArrowRightOutlined, SearchOutlined } from '@ant-design/icons';
import { Voucher, VoucherFormData } from '@/types/voucher.type';
import { mockVouchers } from '@/mocks/voucher/voucherData';
import { mockFacilitiesDropdown } from '@/mocks/facility/mockFacilities';
import { getVoucherStatus } from '@/utils/voucherUtils';
import voucherImage from '@/assets/Owner/content/voucher.png';

// Components
import VoucherTable from './components/VoucherTable';
import VoucherDetailModal from './components/VoucherDetailModal';
import VoucherEditModal from './components/VoucherEditModal';

const { Title, Text } = Typography;
const { Option } = Select;

// Local storage key
const SELECTED_FACILITY_KEY = 'owner_selected_facility_id';

const VoucherManagement: React.FC = () => {
  const navigate = useNavigate();

  // States
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState<Voucher | null>(null);
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
    const initialFacilityId = savedFacilityId || (mockFacilitiesDropdown.length > 0 ? mockFacilitiesDropdown[0].id : '');
    
    if (initialFacilityId) {
      setSelectedFacilityId(initialFacilityId);
      fetchVouchers();
    }
  }, []);

  // Fetch vouchers (mock function)
  const fetchVouchers = () => {
    setLoading(true);
    setError(null);
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      try {
        // In real implementation, this would be filtered by facilityId
        setVouchers(mockVouchers);
        setLoading(false);
      } catch (error) {
        setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
        setLoading(false);
        console.error('Error fetching vouchers:', error);
      }
    }, 500);
  };

  // Handle facility change
  const handleFacilityChange = (value: string) => {
    setSelectedFacilityId(value);
    localStorage.setItem(SELECTED_FACILITY_KEY, value);
    fetchVouchers();
  };

  // Navigate to create voucher page
  const handleCreateVoucher = () => {
    navigate('/owner/create-voucher');
  };

  // Handle delete voucher
  const handleDeleteVoucher = (voucherId: number) => {
    // Filter out the deleted voucher
    setVouchers(prevVouchers => prevVouchers.filter(voucher => voucher.id !== voucherId));
    
    // Show success message
    Modal.success({
      title: 'Xóa voucher thành công',
      content: 'Voucher đã được xóa khỏi hệ thống.'
    });
  };

  // Handle view voucher details
  const handleViewVoucher = (voucher: Voucher) => {
    setCurrentVoucher(voucher);
    setDetailModalVisible(true);
  };

  // Handle edit voucher
  const handleEditVoucher = (voucher: Voucher) => {
    setCurrentVoucher(voucher);
    setEditModalVisible(true);
  };

  // Handle save voucher
  const handleSaveVoucher = (values: VoucherFormData) => {
    if (!currentVoucher) return;
    
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Create updated voucher
      const updatedVoucher: Voucher = {
        ...currentVoucher,
        name: values.name,
        code: values.code || currentVoucher.code,
        startDate: values.startDate,
        endDate: values.endDate,
        voucherType: values.voucherType,
        discount: values.discount,
        minPrice: values.minPrice,
        maxDiscount: values.maxDiscount,
        amount: values.amount,
        updatedAt: new Date().toISOString()
      };
      
      // Update vouchers list
      setVouchers(prevVouchers => 
        prevVouchers.map(voucher => 
          voucher.id === currentVoucher.id ? updatedVoucher : voucher
        )
      );
      
      setSubmitting(false);
      setEditModalVisible(false);
      
      // Show success message
      Modal.success({
        title: 'Cập nhật thành công',
        content: 'Thông tin voucher đã được cập nhật thành công.'
      });
    }, 1000);
  };

  // Filter and search vouchers
  const filteredVouchers = vouchers.filter(voucher => {
    // Filter by status
    const status = getVoucherStatus(voucher.startDate, voucher.endDate);
    const statusMatch = activeFilter === 'all' || status === activeFilter;
    
    // Filter by search term
    const searchMatch = !searchTerm || 
      voucher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  return (
    <div className="p-6 md:p-8">
      {/* Promotional Banner */}
      <Card className="mb-8 overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div className="flex-1">
            <Title level={2} style={{ fontSize: 26 }} className="text-xl md:text-2xl lg:text-3xl">
              Tạo ngay Voucher để tăng doanh thu cho cơ sở của bạn!!!
            </Title>
            <Text className="block mb-8 text-gray-600">
              Cơ hội tăng đến 43% đơn đặt sân và 28% doanh thu khi tạo Voucher ưu đãi cho Khách hàng.
            </Text>
            <Button 
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreateVoucher}
              style={{ background: '#cc440a', display: 'flex', alignItems: 'center', width: 'fit-content' }}
            >
              Tạo Voucher ngay <ArrowRightOutlined style={{ marginLeft: 8 }} />
            </Button>
          </div>
          <div className="max-w-md">
            <img 
              src={voucherImage} 
              alt="Voucher illustration" 
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </Card>

      {/* Voucher List Section */}
      <Card title="Danh sách mã giảm giá" className="mb-8">
        {/* Facility selector */}
        <div className="mb-6">
          <Select
            placeholder="Chọn cơ sở của bạn"
            style={{ width: '100%' }}
            value={selectedFacilityId || undefined}
            onChange={handleFacilityChange}
            popupMatchSelectWidth={false}
          >
            {mockFacilitiesDropdown.map((facility) => (
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
              options={filterOptions} 
              onChange={e => setActiveFilter(e.target.value)} 
              value={activeFilter}
              optionType="button"
              className="flex-nowrap"
            />
          </div>
          
          <Input
            placeholder="Tìm kiếm voucher"
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ maxWidth: 300, width: '100%' }}
          />
        </div>

        {/* Conditional rendering based on state */}
        {!selectedFacilityId ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg p-6">
            <p className="text-lg text-gray-600 mb-4">Vui lòng chọn cơ sở để xem danh sách voucher</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Đang tải dữ liệu...</p>
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg p-6">
            <p className="text-lg text-gray-600 mb-4">Chưa có voucher nào</p>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateVoucher}
            >
              Tạo voucher mới
            </Button>
          </div>
        ) : (
          <VoucherTable
            vouchers={filteredVouchers}
            loading={loading}
            onView={handleViewVoucher}
            onEdit={handleEditVoucher}
            onDelete={handleDeleteVoucher}
          />
        )}
      </Card>

      {/* Modals */}
      <VoucherDetailModal
        visible={detailModalVisible}
        voucher={currentVoucher}
        onClose={() => setDetailModalVisible(false)}
      />
      
      <VoucherEditModal
        visible={editModalVisible}
        voucher={currentVoucher}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveVoucher}
        submitting={submitting}
      />
    </div>
  );
};

export default VoucherManagement;