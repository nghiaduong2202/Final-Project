import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Select, Card, Typography, Radio, Modal, Input } from 'antd';
import { PlusOutlined, ArrowRightOutlined, SearchOutlined } from '@ant-design/icons';
import { Voucher, VoucherFormData } from '@/types/voucher.type';
import { getVoucherStatus } from '@/utils/voucherUtils';
import voucherImage from '@/assets/Owner/content/voucher.png';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { fetchVouchers, updateVoucher, deleteVoucher, setSelectedFacilityId } from '@/store/slices/voucherSlice';
import { RootState } from '@/store';
import { facilityService, FacilityDropdownItem } from '@/services/facility.service';

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
  const dispatch = useAppDispatch();
  
  // Redux state
  const { vouchers, isLoading, error } = useAppSelector((state: RootState) => state.voucher);
  const selectedFacilityId = useAppSelector((state: RootState) => state.voucher.selectedFacilityId);

  // States
  const [facilities, setFacilities] = useState<FacilityDropdownItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [facilityLoading, setFacilityLoading] = useState(false);
  
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

  // Load facilities dropdown
  useEffect(() => {
    const fetchFacilities = async () => {
      setFacilityLoading(true);
      try {
        const response = await facilityService.getFacilitiesDropdown();
        setFacilities(response);
        
        // Get initial facility ID
        const savedFacilityId = localStorage.getItem(SELECTED_FACILITY_KEY);
        const isValidSavedId = savedFacilityId && response.some((f: FacilityDropdownItem) => f.id === savedFacilityId);
        const initialFacilityId = isValidSavedId ? savedFacilityId : (response.length > 0 ? response[0].id : '');
        
        if (initialFacilityId) {
          if (initialFacilityId !== savedFacilityId) {
            localStorage.setItem(SELECTED_FACILITY_KEY, initialFacilityId);
          }
          dispatch(setSelectedFacilityId(initialFacilityId));
          dispatch(fetchVouchers(initialFacilityId));
        }
      } catch (error) {
        console.error('Error fetching facilities:', error);
      } finally {
        setFacilityLoading(false);
      }
    };
    
    fetchFacilities();
  }, [dispatch]);

  // Handle facility change
  const handleFacilityChange = (value: string) => {
    dispatch(setSelectedFacilityId(value));
    localStorage.setItem(SELECTED_FACILITY_KEY, value);
    dispatch(fetchVouchers(value));
  };

  // Navigate to create voucher page
  const handleCreateVoucher = () => {
    navigate('/owner/create-voucher');
  };

  // Handle delete voucher
  const handleDeleteVoucher = (voucherId: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa voucher này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await dispatch(deleteVoucher(voucherId)).unwrap();
          
          // Show success message
          Modal.success({
            title: 'Xóa voucher thành công',
            content: 'Voucher đã được xóa khỏi hệ thống.'
          });
        } catch (error) {
          console.error('Error deleting voucher:', error);
          Modal.error({
            title: 'Lỗi',
            content: 'Có lỗi xảy ra khi xóa voucher. Vui lòng thử lại sau.'
          });
        }
      }
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
  const handleSaveVoucher = async (values: VoucherFormData) => {
    if (!currentVoucher) return;
    
    setSubmitting(true);
    
    try {
      // Create updated voucher data
      const updateData: Partial<Voucher> = {
        id: currentVoucher.id,
        name: values.name,
        code: values.code,
        startDate: values.startDate,
        endDate: values.endDate,
        voucherType: values.voucherType,
        discount: values.discount,
        minPrice: values.minPrice,
        maxDiscount: values.maxDiscount,
        amount: values.amount
      };
      
      // Dispatch update action
      await dispatch(updateVoucher(updateData)).unwrap();
      
      setSubmitting(false);
      setEditModalVisible(false);
      
      // Show success message
      Modal.success({
        title: 'Cập nhật thành công',
        content: 'Thông tin voucher đã được cập nhật thành công.'
      });
    } catch (error) {
      console.error('Error updating voucher:', error);
      setSubmitting(false);
      
      Modal.error({
        title: 'Lỗi',
        content: 'Có lỗi xảy ra khi cập nhật voucher. Vui lòng thử lại sau.'
      });
    }
  };

  // Filter and search vouchers
  const filteredVouchers = vouchers.filter(voucher => {
    // Filter by status
    const status = getVoucherStatus(voucher.startDate, voucher.endDate);
    const statusMatch = activeFilter === 'all' || status === activeFilter;
    
    // Filter by search term
    const searchMatch = !searchTerm || 
      voucher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
            loading={facilityLoading}
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
        ) : isLoading ? (
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
            loading={isLoading}
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