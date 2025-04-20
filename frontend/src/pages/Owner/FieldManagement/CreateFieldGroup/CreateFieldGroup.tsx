import React, { useState, useEffect, useRef } from 'react';
import { Select, Card, Typography, Button, Table, Empty, notification, Spin, Checkbox, Tag, Modal } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getSportNameInVietnamese } from '@/utils/translateSport';
import { sportService } from '@/services/sport.service';
import { fieldService } from '@/services/field.service';
import { facilityService, FacilityDropdownItem } from '@/services/facility.service';
import { Sport } from '@/types/sport.type';
import { FieldGroup, FieldGroupFormData } from '@/types/field.type';
import FieldGroupForm from './components/FieldGroupForm';
import { useNavigate } from 'react-router-dom';


const { Title, Text } = Typography;
const { Option } = Select;
const { CheckableTag } = Tag;

// Local storage key
const SELECTED_FACILITY_KEY = 'owner_selected_facility_id';

// Danh sách tất cả các loại thể thao được hỗ trợ trong ứng dụng
const ALL_SUPPORTED_SPORTS = [
  'football',
  'basketball',
  'volleyball',
  'tennis',
  'badminton',
  'tabletennis',
  'pickleball',
  'golf'
];

// Mock data để đảm bảo UI hiển thị khi API không trả về kết quả
const MOCK_SPORTS: Sport[] = ALL_SUPPORTED_SPORTS.map((sportName, index) => ({
  id: index + 1,
  name: sportName
}));

// Thêm mục "Tổng hợp" vào danh sách thể thao
const COMPOSITE_SPORT: Sport = {
  id: 999,
  name: 'composite',
  // Thêm các thuộc tính khác nếu cần
};

const CreateFieldGroup: React.FC = () => {
  const isMounted = useRef<boolean>(false);
  const navigate = useNavigate();

  // States
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSports, setSelectedSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [currentSportForModal, setCurrentSportForModal] = useState<Sport | null>(null);
  const [facilities, setFacilities] = useState<FacilityDropdownItem[]>([]);
  const [fieldGroups, setFieldGroups] = useState<Record<string, FieldGroup[]>>({});
  const [loadingFieldGroups, setLoadingFieldGroups] = useState<boolean>(false);
  
  // Fetch facilities and sports data
  useEffect(() => {
    // Sử dụng cờ để tránh fetch 2 lần trong Strict Mode
    if (!isMounted.current) {
      isMounted.current = true;
      
      const fetchInitialData = async () => {
        setIsLoading(true);
        try {
          // Fetch facilities
          const facilitiesData = await facilityService.getFacilitiesDropdown();
          setFacilities(facilitiesData);
          
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
          }
          
          // Fetch sports
          const sportsData = await sportService.getSport();          
          // Kiểm tra data có phải là mảng và có phần tử không
          if (Array.isArray(sportsData) && sportsData.length > 0) {
            // Thêm mục "Tổng hợp" vào danh sách thể thao
            setSports([...sportsData, COMPOSITE_SPORT]);
          } else {
            // Chỉ sử dụng mock data khi API trả về mảng rỗng
            setSports([...MOCK_SPORTS, COMPOSITE_SPORT]);
          }
        } catch (error) {
          notification.error({
            message: 'Lỗi',
            description: 'Không thể tải danh sách cơ sở hoặc loại hình thể thao'
          });
          console.error('Error fetching initial data:', error);
          // Sử dụng mock data khi API bị lỗi
          setSports([...MOCK_SPORTS, COMPOSITE_SPORT]);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchInitialData();
    }
  }, []);

  // Fetch field groups when facility changes
  useEffect(() => {
    if (selectedFacilityId) {
      fetchFieldGroupsByFacility();
    }
  }, [selectedFacilityId]);
  
  // Fetch field groups for selected facility
  const fetchFieldGroupsByFacility = async () => {
    if (!selectedFacilityId) return;
    
    setLoadingFieldGroups(true);
    try {
      const fieldGroupsData = await fieldService.getFieldGroupsByFacilityId(selectedFacilityId);
      
      // Organize field groups by sport
      const fieldGroupsBySport: Record<string, FieldGroup[]> = {};
      
      // Process each field group to categorize by sport
      fieldGroupsData.forEach(group => {
        // Nếu không có sports hoặc là mảng rỗng, bỏ qua
        if (!group.sports || group.sports.length === 0) return;

        // Groups with multiple sports go to composite
        if (group.sports.length > 1) {
          if (!fieldGroupsBySport['composite']) {
            fieldGroupsBySport['composite'] = [];
          }
          fieldGroupsBySport['composite'].push(group);
        } else {
          // For single sport field groups
          const sportName = group.sports[0].name.toLowerCase();
          if (!fieldGroupsBySport[sportName]) {
            fieldGroupsBySport[sportName] = [];
          }
          fieldGroupsBySport[sportName].push(group);
        }
      });
      
      console.log('Categorized field groups:', fieldGroupsBySport);
      setFieldGroups(fieldGroupsBySport);
    } catch (error) {
      console.error('Error fetching field groups:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải danh sách nhóm sân'
      });
    } finally {
      setLoadingFieldGroups(false);
    }
  };
  
  // Handle facility selection
  const handleFacilityChange = (value: string) => {
    setSelectedFacilityId(value);
    localStorage.setItem(SELECTED_FACILITY_KEY, value);
    // Reset sport selection when facility changes
    setSelectedSports([]);
  };
  
  // Handle sport selection
  const handleSportSelect = (sport: Sport) => {
    // Kiểm tra xem loại thể thao đã được chọn hay chưa
    const isSelected = selectedSports.some(s => s.id === sport.id);
    
    if (isSelected) {
      // Nếu đã chọn, loại bỏ khỏi danh sách đã chọn
      const newSelection = selectedSports.filter(s => s.id !== sport.id);
      setSelectedSports(newSelection);
    } else {
      // Thêm vào danh sách đã chọn
      const newSelection = [...selectedSports, sport];
      setSelectedSports(newSelection);
    }
  };
  
  // Lấy danh sách nhóm sân cho một loại thể thao cụ thể
  const getFieldGroupsForSport = (sport: Sport): FieldGroup[] => {
    const sportName = sport.name.toLowerCase();
    
    // Đối với tổng hợp, cần trả về composite
    if (sport.id === COMPOSITE_SPORT.id) {
      return fieldGroups['composite'] || [];
    }
    
    return fieldGroups[sportName] || [];
  };
  
  // Lấy tên hiển thị cho loại thể thao
  const getSportDisplayName = (sport: Sport): string => {
    return sport.id === COMPOSITE_SPORT.id 
      ? "Tổng hợp" 
      : getSportNameInVietnamese(sport.name);
  };
  
  // Show add modal for a specific sport
  const showAddModal = (sport: Sport) => {
    if (!selectedFacilityId) {
      notification.warning({
        message: 'Chưa chọn cơ sở',
        description: 'Vui lòng chọn cơ sở trước khi tạo nhóm sân mới.'
      });
      return;
    }
    
    setCurrentSportForModal(sport);
    setIsAddModalVisible(true);
  };
  
  // Handle form submission
  const handleFormSubmit = async (formData: FieldGroupFormData) => {
    if (!selectedFacilityId) {
      notification.warning({
        message: 'Chưa chọn cơ sở',
        description: 'Vui lòng chọn cơ sở trước khi tạo nhóm sân.'
      });
      return;
    }
    
    // Ensure formData has the correct structure for the API
    const preparedFormData = {
      ...formData,
      fields: formData.fields.map(field => ({ name: typeof field === 'string' ? field : field.name }))
    };
    
    // Add facilityId to the formData
    preparedFormData.facilityId = selectedFacilityId;
    
    // Show confirmation modal
    Modal.confirm({
      title: 'Xác nhận tạo nhóm sân',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn tạo nhóm sân <strong>{preparedFormData.name}</strong> với các thông tin sau không?</p>
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <p><strong>Kích thước:</strong> {preparedFormData.dimension}</p>
            <p><strong>Mặt sân:</strong> {preparedFormData.surface}</p>
            <p><strong>Giá cơ bản:</strong> {preparedFormData.basePrice.toLocaleString('de-DE')} VNĐ</p>
            <p><strong>Số sân:</strong> {preparedFormData.fields.length}</p>
          </div>
        </div>
      ),
      okText: 'Tạo nhóm sân',
      okType: 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          // Call API to create field group
          await fieldService.createFieldGroups(selectedFacilityId, [preparedFormData]);
          
          notification.success({
            message: 'Thành công',
            description: 'Đã tạo nhóm sân mới thành công!'
          });
          
          // Close modal and refresh field groups
          setIsAddModalVisible(false);
          fetchFieldGroupsByFacility();
          
        } catch (error) {
          console.error('Error creating field group:', error);
          notification.error({
            message: 'Lỗi',
            description: 'Không thể tạo nhóm sân. Vui lòng thử lại sau.'
          });
        }
      }
    });
  };
  
  // Column definition for existing field groups table
  const columns = [
    {
      title: 'Tên nhóm sân',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Kích thước',
      dataIndex: 'dimension',
      key: 'dimension',
    },
    {
      title: 'Mặt sân',
      dataIndex: 'surface',
      key: 'surface',
    },
    {
      title: 'Giá cơ bản',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (price: number) => `${price.toLocaleString('de-DE')} VNĐ`,
    },
  ];
  
  // Render field groups table with loading state
  const renderFieldGroupsTable = (sport: Sport) => {
    const groups = getFieldGroupsForSport(sport);
    
    if (loadingFieldGroups) {
      return <Spin tip="Đang tải dữ liệu..." />;
    }
    
    console.log(`Sport ${sport.name} (${sport.id}) has ${groups.length} field groups`);
    
    if (groups.length === 0) {
      return <Empty description={`Không có nhóm sân ${getSportDisplayName(sport)} nào`} />;
    }
    
    return (
      <Table
        dataSource={groups}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
      />
    );
  };
  
  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
        <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/owner/field-group-management')}
            type="text"
          />    
          <Title level={2} style={{ margin: 0 }}>Tạo nhóm sân mới</Title>
        </div>
      </div>
      
      {/* Main content */}
      <Card className="mb-6">
        <Title level={4}>1. Chọn cơ sở</Title>
        <div className="mb-6">
          <Select
            placeholder="Chọn cơ sở quản lý"
            style={{ width: '100%' }}
            onChange={handleFacilityChange}
            value={selectedFacilityId || undefined}
          >
            {facilities.map(facility => (
              <Option key={facility.id} value={facility.id}>
                {facility.name}
              </Option>
            ))}
          </Select>
        </div>
        
        {selectedFacilityId && (
          <>
            <Title level={4}>2. Chọn loại hình thể thao</Title>
            <div className="mb-4">
              <Text type="secondary">
                Chọn một hoặc nhiều loại hình thể thao mà bạn muốn tạo nhóm sân
              </Text>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spin size="large" />
              </div>
            ) : sports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {sports.map(sport => (
                  <Card
                    key={sport.id}
                    hoverable
                    className={`cursor-pointer ${selectedSports.some(s => s.id === sport.id) ? 'border-2 border-blue-500' : ''}`}
                    onClick={() => handleSportSelect(sport)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-lg">
                          {getSportDisplayName(sport)}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {sport.id === COMPOSITE_SPORT.id 
                            ? "Nhóm sân đa năng" 
                            : "Dành riêng cho một môn"
                          }
                        </div>
                      </div>
                      <Checkbox 
                        checked={selectedSports.some(s => s.id === sport.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => handleSportSelect(sport)}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty 
                description="Không có loại hình thể thao nào" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </>
        )}
        
        {selectedSports.length > 0 && (
          <>
            <Title level={4}>3. Nhóm sân hiện có</Title>
            <div className="mb-4">
              <Text type="secondary">
                Danh sách các nhóm sân theo từng loại hình thể thao
              </Text>
            </div>
            
            {/* Hiển thị thẻ cho loại thể thao đã chọn */}
            <div className="mb-4">
              <Text className="mr-2">Đã chọn:</Text>
              {selectedSports.map(sport => (
                <CheckableTag
                  key={sport.id}
                  checked={true}
                  onChange={() => handleSportSelect(sport)}
                >
                  {getSportDisplayName(sport)}
                </CheckableTag>
              ))}
            </div>
            
            {/* Hiển thị danh sách nhóm sân và nút thêm */}
            {selectedSports.map(sport => {
              const sportName = getSportDisplayName(sport);
              
              return (
                <div className="mb-8" key={`sport-${sport.id}`}>
                  <div className="flex justify-between items-center mb-4">
                    <Title level={4} className="m-0">
                      Nhóm sân {sportName}
                    </Title>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      onClick={() => showAddModal(sport)}
                    >
                      Thêm nhóm sân {sportName}
                    </Button>
                  </div>
                  
                  {renderFieldGroupsTable(sport)}
                </div>
              );
            })}
          </>
        )}
      </Card>
      
      {/* Field Group Form Modal */}
      {isAddModalVisible && currentSportForModal && (
        <FieldGroupForm
          open={isAddModalVisible}
          onClose={() => {
            setIsAddModalVisible(false);
            setCurrentSportForModal(null);
          }}
          onSave={handleFormSubmit}
          sport={currentSportForModal}
          allSports={sports}
          selectedSportIds={currentSportForModal.id === COMPOSITE_SPORT.id 
            ? selectedSports.filter(s => s.id !== COMPOSITE_SPORT.id).map(s => s.id) 
            : [currentSportForModal.id]}
        />
      )}
    </div>
  );
};

export default CreateFieldGroup;
