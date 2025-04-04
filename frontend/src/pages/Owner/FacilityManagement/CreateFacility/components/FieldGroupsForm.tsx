import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  Empty, 
  Modal, 
  Divider,
  List,
  Tag,
  message,
  Checkbox
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined
} from '@ant-design/icons';
import { FacilityFormData } from '@/types/facility.type';
import { Sport } from '@/types/sport.type';
import { FieldGroupFormData } from '@/types/field.type';
import { getSportNameInVietnamese } from '@/utils/translateSport';
import FieldGroupForm from '@/pages/Owner/FieldManagement/CreateFieldGroup/components/FieldGroupForm';

const { Title, Text, Paragraph } = Typography;

interface FieldGroupsFormProps {
  formData: FacilityFormData;
  updateFormData: (data: Partial<FacilityFormData>) => void;
  allSports: Sport[];
}

const FieldGroupsForm: React.FC<FieldGroupsFormProps> = ({
  formData,
  updateFormData,
  allSports
}) => {
  // States for sports selection
  const [selectedSports, setSelectedSports] = useState<Sport[]>(formData.selectedSports || []);
  
  // States for field group management
  const [isFieldGroupModalVisible, setIsFieldGroupModalVisible] = useState<boolean>(false);
  const [currentSport, setCurrentSport] = useState<Sport | null>(null);
  const [editingFieldGroup, setEditingFieldGroup] = useState<FieldGroupFormData | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  // Load data from formData
  useEffect(() => {
    if (formData.selectedSports && formData.selectedSports.length > 0) {
      setSelectedSports(formData.selectedSports);
    }
  }, [formData]);

  // Toggle sport selection
  const handleSportSelect = (sport: Sport, checked: boolean) => {
    let newSelectedSports;
    
    if (checked) {
      newSelectedSports = [...selectedSports, sport];
    } else {
      newSelectedSports = selectedSports.filter(s => s.id !== sport.id);
      
      // Remove field groups for this sport
      const updatedFieldGroups = formData.fieldGroups.filter(
        group => !group.sportIds.includes(sport.id)
      );
      
      updateFormData({
        fieldGroups: updatedFieldGroups
      });
    }
    
    setSelectedSports(newSelectedSports);
    updateFormData({
      selectedSports: newSelectedSports
    });
  };

  // Check if a sport is selected
  const isSportSelected = (sportId: number) => {
    return selectedSports.some(sport => sport.id === sportId);
  };

  // Show field group modal for a sport
  const showAddFieldGroupModal = (sport: Sport) => {
    setCurrentSport(sport);
    setEditingFieldGroup(null);
    setEditingIndex(-1);
    setIsFieldGroupModalVisible(true);
  };

  // Show edit field group modal
  const showEditFieldGroupModal = (fieldGroup: FieldGroupFormData, index: number) => {
    // Find the sport for this field group
    const sport = allSports.find(s => fieldGroup.sportIds.includes(s.id)) || null;
    if (!sport) return;
    
    setCurrentSport(sport);
    setEditingFieldGroup(fieldGroup);
    setEditingIndex(index);
    setIsFieldGroupModalVisible(true);
  };

  // Handle field group save
  const handleFieldGroupSave = (fieldGroupData: FieldGroupFormData) => {
    const updatedFieldGroups = [...formData.fieldGroups];
    
    if (editingIndex >= 0) {
      // Update existing field group
      updatedFieldGroups[editingIndex] = fieldGroupData;
    } else {
      // Add new field group
      updatedFieldGroups.push(fieldGroupData);
    }
    
    updateFormData({
      fieldGroups: updatedFieldGroups
    });
    
    setIsFieldGroupModalVisible(false);
    setCurrentSport(null);
    setEditingFieldGroup(null);
    setEditingIndex(-1);
    
    message.success(editingIndex >= 0 ? 'Cập nhật nhóm sân thành công' : 'Thêm nhóm sân thành công');
  };

  // Handle field group delete
  const handleDeleteFieldGroup = (index: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa nhóm sân',
      content: 'Bạn có chắc chắn muốn xóa nhóm sân này không?',
      onOk: () => {
        const updatedFieldGroups = [...formData.fieldGroups];
        updatedFieldGroups.splice(index, 1);
        
        updateFormData({
          fieldGroups: updatedFieldGroups
        });
        
        message.success('Đã xóa nhóm sân');
      }
    });
  };

  // Get field groups for a specific sport
  const getFieldGroupsForSport = (sportId: number) => {
    return formData.fieldGroups.filter(group => 
      group.sportIds.includes(sportId)
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Title level={4}>Thông tin sân</Title>
      
      {/* Sport selection section */}
      <div className="mb-8">
        <Title level={5}>1. Chọn loại hình thể thao</Title>
        <Paragraph className="text-gray-500">
          Chọn các loại hình thể thao mà cơ sở của bạn hỗ trợ
        </Paragraph>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {allSports.map(sport => (
            <Card 
              key={sport.id}
              hoverable
              className={`border ${isSportSelected(sport.id) ? 'border-blue-500' : 'border-gray-200'}`}
              onClick={() => handleSportSelect(sport, !isSportSelected(sport.id))}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Text strong>{getSportNameInVietnamese(sport.name)}</Text>
                </div>
                <Checkbox checked={isSportSelected(sport.id)} />
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Field groups section */}
      {selectedSports.length > 0 && (
        <div className="mt-8">
          <Title level={5}>2. Tạo nhóm sân cho từng loại hình thể thao</Title>
          <Paragraph className="text-gray-500">
            Mỗi loại hình thể thao cần có ít nhất một nhóm sân
          </Paragraph>
          
          <Divider />
          
          {selectedSports.map(sport => (
            <div key={sport.id} className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <Title level={5}>{getSportNameInVietnamese(sport.name)}</Title>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => showAddFieldGroupModal(sport)}
                >
                  Thêm nhóm sân
                </Button>
              </div>
              
              {getFieldGroupsForSport(sport.id).length > 0 ? (
                <List
                  className="bg-gray-50 rounded-lg"
                  itemLayout="horizontal"
                  dataSource={getFieldGroupsForSport(sport.id)}
                  renderItem={(fieldGroup) => (
                    <List.Item
                      actions={[
                        <Button 
                          icon={<EditOutlined />} 
                          type="text"
                          onClick={() => showEditFieldGroupModal(fieldGroup, formData.fieldGroups.indexOf(fieldGroup))}
                        >
                          Sửa
                        </Button>,
                        <Button 
                          icon={<DeleteOutlined />} 
                          type="text"
                          danger
                          onClick={() => handleDeleteFieldGroup(formData.fieldGroups.indexOf(fieldGroup))}
                        >
                          Xóa
                        </Button>
                      ]}
                      className="px-4"
                    >
                      <List.Item.Meta
                        title={<span className="font-semibold">{fieldGroup.name}</span>}
                        description={
                          <div>
                            <div className="flex flex-wrap gap-2 mb-1">
                              <Tag color="blue">Kích thước: {fieldGroup.dimension}</Tag>
                              <Tag color="green">Mặt sân: {fieldGroup.surface}</Tag>
                              <Tag color="orange">Giá cơ bản: {fieldGroup.basePrice.toLocaleString()} VNĐ/giờ</Tag>
                            </div>
                            <div>
                              <Tag color="purple">Giờ cao điểm 1: {fieldGroup.peakStartTime1} - {fieldGroup.peakEndTime1} (+{fieldGroup.priceIncrease1.toLocaleString()} VNĐ)</Tag>
                              {fieldGroup.numberOfPeaks > 1 && fieldGroup.peakStartTime2 && fieldGroup.peakEndTime2 && (
                                <Tag color="purple">Giờ cao điểm 2: {fieldGroup.peakStartTime2} - {fieldGroup.peakEndTime2} (+{fieldGroup.priceIncrease2?.toLocaleString()} VNĐ)</Tag>
                              )}
                              {fieldGroup.numberOfPeaks > 2 && fieldGroup.peakStartTime3 && fieldGroup.peakEndTime3 && (
                                <Tag color="purple">Giờ cao điểm 3: {fieldGroup.peakStartTime3} - {fieldGroup.peakEndTime3} (+{fieldGroup.priceIncrease3?.toLocaleString()} VNĐ)</Tag>
                              )}
                            </div>
                            <div className="mt-2">
                              <span className="font-semibold">Danh sách sân ({fieldGroup.fields.length}):</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {fieldGroup.fields.map((field, i) => (
                                  <Tag key={i} color="blue">
                                    {typeof field === 'object' ? field.name : field}
                                  </Tag>
                                ))}
                              </div>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  description={
                    <span className="text-gray-500">
                      Chưa có nhóm sân nào. Nhấn "Thêm nhóm sân" để tạo mới.
                    </span>
                  }
                  className="my-8 bg-gray-50 p-8 rounded-lg"
                />
              )}
              
              <Divider />
            </div>
          ))}
        </div>
      )}
      
      {/* Field group modal */}
      <Modal
        title={editingFieldGroup ? "Chỉnh sửa nhóm sân" : "Thêm nhóm sân mới"}
        open={isFieldGroupModalVisible}
        onCancel={() => setIsFieldGroupModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        {currentSport && (
          <FieldGroupForm
            open={isFieldGroupModalVisible}
            onClose={() => setIsFieldGroupModalVisible(false)}
            onSave={handleFieldGroupSave}
            sport={currentSport}
            allSports={allSports}
            selectedSportIds={editingFieldGroup?.sportIds || [currentSport.id]}
          />
        )}
      </Modal>
    </div>
  );
};

export default FieldGroupsForm; 