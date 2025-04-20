import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Select, Card, Typography, Modal, Form, message } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { FieldGroup } from '@/types/field.type';
import fieldImage from '@/assets/Owner/content/field.png';
import { fieldService } from '@/services/field.service';
import { facilityService, FacilityDropdownItem } from '@/services/facility.service';

// Component imports
import FieldGroupTable from './components/FieldGroupTable';
import AddFieldModal from './components/AddFieldModal';
import FieldGroupDetail from './components/FieldGroupDetail';
import FieldGroupEdit from './components/FieldGroupEdit';

const { Title, Text } = Typography;
const { confirm } = Modal;

// Key cho localStorage
const SELECTED_FACILITY_KEY = 'owner_selected_facility_id';

const FieldGroupManagement: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // Local state
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [fieldGroups, setFieldGroups] = useState<FieldGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<FacilityDropdownItem[]>([]);
  
  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addFieldModalVisible, setAddFieldModalVisible] = useState(false);
  const [currentFieldGroup, setCurrentFieldGroup] = useState<FieldGroup | null>(null);
  const [currentFieldGroupId, setCurrentFieldGroupId] = useState<string>('');

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
          fetchFieldGroups(initialFacilityId);
        }
      } catch (err) {
        console.error('Error fetching facilities:', err);
        message.error('Không thể tải danh sách cơ sở. Vui lòng thử lại sau.');
      }
    };

    fetchFacilities();
  }, []);

  // Fetch field groups based on facility ID
  const fetchFieldGroups = async (facilityId?: string) => {
    const targetFacilityId = facilityId || selectedFacilityId;
    if (!targetFacilityId) return;

    setLoading(true);
    setError(null);
    
    try {
      const data = await fieldService.getFieldGroupsByFacilityId(targetFacilityId);
      setFieldGroups(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching field groups:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
      setLoading(false);
      message.error('Không thể tải danh sách nhóm sân. Vui lòng thử lại sau.');
    }
  };

  // Handle facility change
  const handleFacilityChange = (value: string) => {
    setSelectedFacilityId(value);
    localStorage.setItem(SELECTED_FACILITY_KEY, value);
    fetchFieldGroups(value);
  };

  // Navigate to create field group page
  const handleCreateField = () => {
    navigate('/owner/create-field-group');
  };

  // Toggle field status
  const toggleFieldStatus = (fieldGroupId: string, fieldId: string, currentStatus: 'active' | 'closed') => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    const actionText = currentStatus === 'active' ? 'đóng' : 'mở';

    confirm({
      title: `Bạn có chắc chắn muốn ${actionText} sân này?`,
      icon: <ExclamationCircleOutlined />,
      content: currentStatus === 'active' 
        ? 'Hệ thống sẽ kiểm tra xem có lịch đặt sân này không. Nếu có, bạn sẽ không thể đóng sân.' 
        : 'Khi mở lại sân, khách hàng sẽ có thể đặt sân này từ bây giờ.'
      ,
      okText: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} sân`,
      okType: currentStatus === 'active' ? 'danger' : 'primary',
      cancelText: 'Hủy',
      onOk() {
        // Check for existing bookings (mock implementation)
        if (currentStatus === 'active') {
          const hasBooking = ["1", "2", "3", "4", "5", "8", "9", "10"].includes(fieldId);

          if (hasBooking) {
            Modal.error({
              title: 'Không thể đóng sân',
              content: (
                <div>
                  <p>Sân này đang có lịch đặt. Bạn không thể đóng sân khi có lịch đặt.</p>
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <p><strong>Chi tiết lịch đặt:</strong></p>
                    <p>- Đơn #{fieldId}001: Ngày 25/10/2023, 15:00 - 17:00</p>
                    <p>- Đơn #{fieldId}002: Ngày 26/10/2023, 09:00 - 11:00</p>
                  </div>
                  <p style={{ marginTop: '10px' }}>Vui lòng liên hệ với khách hàng để hủy lịch đặt trước khi đóng sân.</p>
                </div>
              )
            });
            return;
          }
        }

        // Update field status if no booking conflicts
        const updatedFieldGroups = fieldGroups.map(group => {
          if (group.id === fieldGroupId) {
            const updatedFields = group.fields.map(field => {
              if (field.id === fieldId) {
                return {
                  ...field,
                  status: newStatus as 'active' | 'closed'
                };
              }
              return field;
            });
            return { ...group, fields: updatedFields };
          }
          return group;
        });
        setFieldGroups(updatedFieldGroups);
        
        // Show success message
        Modal.success({
          title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} sân thành công`,
          content: currentStatus === 'active' 
            ? 'Sân đã được đóng thành công. Khách hàng sẽ không thể đặt sân này nữa.' 
            : 'Sân đã được mở lại thành công. Khách hàng có thể đặt sân này từ bây giờ.'
        });
      },
    });
  };

  // Handle delete field
  const handleDeleteField = (fieldGroupId: string, fieldId: string) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa sân này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hệ thống sẽ kiểm tra xem có lịch đặt sân nào tại sân này không. Nếu có, bạn sẽ không thể xóa sân.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          // Check for existing bookings (mock implementation)
          const hasBooking = ["1", "2", "3", "4", "5", "8", "9", "10"].includes(fieldId);

          if (hasBooking) {
            Modal.error({
              title: 'Không thể xóa sân',
              content: (
                <div>
                  <p>Sân này đang có lịch đặt. Bạn không thể xóa sân khi có lịch đặt.</p>
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <p><strong>Chi tiết lịch đặt:</strong></p>
                    <p>- Đơn #{fieldId}001: Ngày 25/10/2023, 15:00 - 17:00</p>
                    <p>- Đơn #{fieldId}002: Ngày 26/10/2023, 09:00 - 11:00</p>
                  </div>
                  <p style={{ marginTop: '10px' }}>Vui lòng liên hệ với khách hàng để hủy lịch đặt trước khi xóa sân.</p>
                </div>
              )
            });
            return;
          }

          // Call API to delete field
          await fieldService.deleteField(Number(fieldId));
          
          // Update local state
          const updatedFieldGroups = fieldGroups.map(group => {
            if (group.id === fieldGroupId) {
              return {
                ...group,
                fields: group.fields.filter(field => field.id !== fieldId)
              };
            }
            return group;
          });
          
          setFieldGroups(updatedFieldGroups);
          
          // Show success message
          Modal.success({
            title: 'Xóa sân thành công',
            content: 'Sân đã được xóa khỏi hệ thống.'
          });
        } catch (err) {
          console.error('Error deleting field:', err);
          message.error('Không thể xóa sân. Sân có thể đang có lịch đặt hoặc đã xảy ra lỗi.');
        }
      },
    });
  };

  // Handle view field group details
  const handleViewFieldGroup = (id: string) => {
    const fieldGroup = fieldGroups.find(group => group.id === id);
    if (fieldGroup) {
      setCurrentFieldGroup(fieldGroup);
      setDetailModalVisible(true);
    }
  };

  // Handle edit field group
  const handleEditFieldGroup = (id: string) => {
    const fieldGroup = fieldGroups.find(group => group.id === id);
    if (fieldGroup) {
      setCurrentFieldGroup(fieldGroup);
      setEditModalVisible(true);
    }
  };

  // Handle save field group after edit
  const handleSaveFieldGroup = async (updatedFieldGroup: FieldGroup) => {
    try {
      // Call API to update field group
      await fieldService.updateFieldGroup(updatedFieldGroup.id, updatedFieldGroup);
      
      // Update local state
      const updatedFieldGroups = fieldGroups.map(group => 
        group.id === updatedFieldGroup.id ? updatedFieldGroup : group
      );
      
      setFieldGroups(updatedFieldGroups);
      setEditModalVisible(false);
      message.success('Cập nhật nhóm sân thành công');
    } catch (err) {
      console.error('Error updating field group:', err);
      message.error('Không thể cập nhật nhóm sân. Vui lòng thử lại sau.');
    }
  };

  // Handle delete field group
  const handleDeleteFieldGroup = (id: string) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa nhóm sân này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hệ thống sẽ kiểm tra xem có lịch đặt sân nào tại nhóm sân này không. Nếu có, bạn sẽ không thể xóa nhóm sân.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          // Mock check for existing bookings
          const fieldGroup = fieldGroups.find(group => group.id === id);
          const hasActiveBookings = fieldGroup?.fields.some(field => 
            ["1", "3", "5"].includes(field.id)
          );

          if (hasActiveBookings) {
            Modal.error({
              title: 'Không thể xóa nhóm sân',
              content: (
                <div>
                  <p>Nhóm sân này đang có lịch đặt. Bạn không thể xóa nhóm sân khi có lịch đặt.</p>
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <p><strong>Chi tiết lịch đặt:</strong></p>
                    <p>- Đơn #10001: Ngày 25/10/2023, 15:00 - 17:00</p>
                    <p>- Đơn #10002: Ngày 26/10/2023, 09:00 - 11:00</p>
                  </div>
                  <p style={{ marginTop: '10px' }}>Vui lòng liên hệ với khách hàng để hủy lịch đặt trước khi xóa nhóm sân.</p>
                </div>
              )
            });
            return;
          }

          // Call API to delete field group
          await fieldService.deleteFieldGroup(id);
          
          // Update local state
          setFieldGroups(fieldGroups.filter(group => group.id !== id));
          
          // Show success message
          Modal.success({
            title: 'Xóa nhóm sân thành công',
            content: 'Nhóm sân đã được xóa khỏi hệ thống.'
          });
        } catch (err) {
          console.error('Error deleting field group:', err);
          message.error('Không thể xóa nhóm sân. Nhóm sân có thể đang có lịch đặt hoặc đã xảy ra lỗi.');
        }
      },
    });
  };

  // Show modal to add new fields to a field group
  const showAddFieldModal = (fieldGroupId: string) => {
    setCurrentFieldGroupId(fieldGroupId);
    setAddFieldModalVisible(true);
  };

  // Handle adding new fields to a field group
  const handleAddField = () => {
    form
      .validateFields()
      .then((values) => {
        const fields = values.fields.map((field: string) => ({ name: field }));
        
        confirm({
          title: 'Xác nhận thêm sân mới',
          icon: <ExclamationCircleOutlined />,
          content: (
            <div>
              <p>Bạn xác nhận muốn thêm sân mới vào nhóm sân này?</p>
              <ul>
                {fields.map((field: { name: string }, index: number) => (
                  <li key={index}>{field.name}</li>
                ))}
              </ul>
              <p style={{ marginTop: '10px', fontWeight: 'bold' }}>Lưu ý:</p>
              <p>Việc thêm sân mới đồng nghĩa với việc bạn xác nhận sân này có thực và thuộc quyền quản lý của cơ sở. Bạn chịu hoàn toàn trách nhiệm về tính xác thực của thông tin này.</p>
            </div>
          ),
          okText: 'Xác nhận thêm',
          okType: 'primary',
          cancelText: 'Hủy',
          onOk: async () => {
            try {
              // Call API to create fields
              await fieldService.createFields(currentFieldGroupId, fields);
              
              // Refresh the field groups data
              fetchFieldGroups();
              
              // Reset and close modal
              form.resetFields();
              setAddFieldModalVisible(false);
              
              // Show success message
              Modal.success({
                title: 'Thêm sân thành công',
                content: `${fields.length > 1 
                  ? `${fields.length} sân` 
                  : `Sân "${fields[0].name}"`} đã được thêm vào nhóm sân.`
              });
            } catch (err) {
              console.error('Error adding fields:', err);
              message.error('Không thể thêm sân. Vui lòng thử lại sau.');
            }
          },
        });
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <div className="p-6 md:p-8">
      {/* Promotional Banner */}
      <Card className="mb-8 overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div className="flex-1">
            <Title level={2} style={{ fontSize: 26 }}>
              Tạo thêm nhóm sân trong cơ sở của bạn nào!!!
            </Title>
            <Text className="block mb-8 text-gray-600">
              Cơ hội tăng đến 43% đơn đặt sân và 28% doanh thu khi tạo Voucher ưu đãi cho Khách hàng.
            </Text>
            <Button 
              type="primary" 
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreateField}
              style={{ background: '#cc440a', display: 'flex', alignItems: 'center' }}
            >
              Tạo nhóm sân ngay <ArrowRightOutlined />
            </Button>
          </div>
          <div className="max-w-md">
            <img 
              src={fieldImage} 
              alt="Field illustration" 
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </Card>

      {/* Field Group List Section */}
      <Card title="Danh sách nhóm sân" className="mb-8">
        {/* Facility Dropdown */}
        <div className="mb-6">
          <Select
            placeholder="Chọn cơ sở của bạn"
            style={{ width: '100%' }}
            value={selectedFacilityId || undefined}
            onChange={handleFacilityChange}
            popupMatchSelectWidth={false}
          >
            {facilities.map((facility) => (
              <Select.Option key={facility.id} value={facility.id}>
                {facility.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Field Groups Table */}
        {selectedFacilityId ? (
          loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          ) : fieldGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg p-6">
              <p className="text-lg text-gray-600 mb-4">Chưa có nhóm sân nào</p>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateField}
              >
                Tạo nhóm sân mới
              </Button>
            </div>
          ) : (
            <FieldGroupTable 
              fieldGroups={fieldGroups}
              onViewFieldGroup={handleViewFieldGroup}
              onEditFieldGroup={handleEditFieldGroup}
              onDeleteFieldGroup={handleDeleteFieldGroup}
              onAddField={showAddFieldModal}
              onToggleFieldStatus={toggleFieldStatus}
              onDeleteField={handleDeleteField}
            />
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg p-6">
            <p className="text-lg text-gray-600 mb-4">Vui lòng chọn cơ sở để xem danh sách nhóm sân</p>
          </div>
        )}
      </Card>

      {/* Add Field Modal */}
      <AddFieldModal
        visible={addFieldModalVisible}
        onClose={() => setAddFieldModalVisible(false)}
        onAddField={handleAddField}
        form={form}
      />

      {/* FieldGroup Detail Modal */}
      <FieldGroupDetail 
        open={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        fieldGroup={currentFieldGroup}
      />

      {/* FieldGroup Edit Modal */}
      <FieldGroupEdit
        open={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveFieldGroup}
        fieldGroup={currentFieldGroup}
      />
    </div>
  );
};

export default FieldGroupManagement;