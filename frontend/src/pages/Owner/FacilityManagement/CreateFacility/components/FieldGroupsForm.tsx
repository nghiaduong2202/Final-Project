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
  Checkbox,
  Alert,
  Spin
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { FacilityFormData } from '@/types/facility.type';
import { Sport } from '@/types/sport.type';
import { FieldGroupFormData } from '@/types/field.type';
import { getSportNameInVietnamese } from '@/utils/translateSport';
import FieldGroupForm from '@/pages/Owner/FieldManagement/CreateFieldGroup/components/FieldGroupForm';

const { Title, Text, Paragraph } = Typography;

// Define constant for composite sport type without using ID 999
const COMPOSITE_SPORT_NAME = "Tổng hợp";

// Định nghĩa lại interface EditingData dựa trên interface của FieldGroupForm
interface EditingData {
  name?: string;
  dimension?: string;
  surface?: string;
  basePrice?: number;
  numberOfPeaks?: number;
  fields?: Array<{ name: string; id?: string; status?: string } | string>;
  peakStartTime1?: string;
  peakEndTime1?: string;
  priceIncrease1?: number;
  peakStartTime2?: string;
  peakEndTime2?: string;
  priceIncrease2?: number;
  peakStartTime3?: string;
  peakEndTime3?: string;
  priceIncrease3?: number;
  sportIds?: number[];
}

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
  const [editingFieldGroup, setEditingFieldGroup] = useState<EditingData | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCompositeSport, setShowCompositeSport] = useState<boolean>(false);
  const [isCreatingCompositeSport, setIsCreatingCompositeSport] = useState<boolean>(false);

  // Load data from formData
  useEffect(() => {
    if (formData.selectedSports && formData.selectedSports.length > 0) {
      setSelectedSports(formData.selectedSports);
    }
    
    // Check if there are any composite field groups
    const hasCompositeSport = formData.fieldGroups.some(group => group.sportIds.length > 1);
    setShowCompositeSport(hasCompositeSport);
  }, [formData.selectedSports, formData.fieldGroups]);

  // Toggle sport selection
  const handleSportSelect = (sport: Sport, checked: boolean) => {
    setLoading(true);
    
    try {
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
    } finally {
      setLoading(false);
    }
  };

  // Toggle composite sport selection
  const handleCompositeSportSelect = (checked: boolean) => {
    setShowCompositeSport(checked);
    if (!checked) {
      // Remove composite field groups
      const updatedFieldGroups = formData.fieldGroups.filter(
        group => group.sportIds.length <= 1
      );
      
      updateFormData({
        fieldGroups: updatedFieldGroups
      });
    }
  };

  // Show field group modal for a sport
  const showAddFieldGroupModal = (sport: Sport | null, isComposite: boolean = false) => {
    if (!sport && isComposite) {
      // For composite, create a virtual composite sport with ID 999 to maintain compatibility
      // with existing logic in FieldGroupForm
      sport = {
        id: 999, // Use ID 999 just for UI display in FieldGroupForm
        name: COMPOSITE_SPORT_NAME
      };
      
      // Đánh dấu đang tạo sân tổng hợp
      setIsCreatingCompositeSport(true);
    } else {
      setIsCreatingCompositeSport(false);
    }
    
    if (!sport) return;
    
    setCurrentSport(sport);
    setEditingFieldGroup(null);
    setEditingIndex(-1);
    setIsFieldGroupModalVisible(true);
  };

  // Show edit field group modal
  const showEditFieldGroupModal = (fieldGroup: FieldGroupFormData, index: number) => {
    // Determine if this is a composite field group
    const isComposite = fieldGroup.sportIds.length > 1;
    
    let sport;
    if (isComposite) {
      // For composite groups, create a special sport with ID 999
      sport = {
        id: 999, // Use ID 999 to trigger composite UI in FieldGroupForm
        name: COMPOSITE_SPORT_NAME
      };
    } else {
      // For regular sports, use the specific sport
      sport = allSports.find(s => s.id === fieldGroup.sportIds[0]) || allSports[0];
    }
    
    setCurrentSport(sport);
    
    // Chuyển đổi từ FieldGroupFormData sang EditingData
    const editingData: EditingData = {
      ...fieldGroup,
      // Không cần các trường peakTime mà FieldGroupForm sẽ tự tính toán
    };
    
    // Log data for debugging
    console.log("Editing field group:", {
      original: fieldGroup,
      converted: editingData
    });
    
    setEditingFieldGroup(editingData);
    setEditingIndex(index);
    setIsFieldGroupModalVisible(true);
  };

  // Get field groups for a specific sport
  const getFieldGroupsForSport = (sportId: number) => {
    // If sportId is -1, return composite field groups
    if (sportId === -1) {
      return formData.fieldGroups.filter(group => group.sportIds.length > 1);
    }
    
    // For regular sports, return groups that contain only this sport ID
    return formData.fieldGroups.filter(group => 
      group.sportIds.includes(sportId) && 
      group.sportIds.length === 1
    );
  };
  
  // Handle field group save
  const handleFieldGroupSave = (fieldGroupData: FieldGroupFormData) => {
    // Kiểm tra xem đây có phải là sân tổng hợp không (có ID 999)
    const isCompositeSportType = currentSport?.id === 999;

    // Lọc bỏ ID ảo 999 ra khỏi sportIds
    const cleanedSportIds = fieldGroupData.sportIds.filter(id => id !== 999);
    
    // Kiểm tra sportIds sau khi đã lọc
    if (cleanedSportIds.length === 0) {
      // Nếu đây là sân tổng hợp, hiển thị thông báo yêu cầu chọn ít nhất một môn thể thao
      if (isCompositeSportType) {
        message.error('Vui lòng chọn ít nhất một loại hình thể thao cho sân tổng hợp.');
        return;
      } 
      // Nếu không phải sân tổng hợp, thêm môn thể thao mặc định (sport.id của môn thể thao hiện tại)
      else if (currentSport && currentSport.id !== 999) {
        fieldGroupData.sportIds = [currentSport.id];
      } else {
        message.error('Vui lòng chọn ít nhất một loại hình thể thao.');
        return;
      }
    }
    
    // Check if this is a composite field group
    const isComposite = cleanedSportIds.length > 1;
    if (isComposite && !showCompositeSport) {
      setShowCompositeSport(true);
    }
    
    // Ensure we're not storing any temporary ID like 999 in the actual data
    const cleanedFieldGroupData = {
      ...fieldGroupData,
      sportIds: cleanedSportIds
    };
    
    // Kiểm tra trùng lặp nhóm sân
    const existingGroups = [...formData.fieldGroups];
    let hasDuplicateName = false;
    let hasSimilarProperties = false;
    let duplicateGroup = null;
    
    // Nếu đang edit thì bỏ qua item đang edit
    const groupsToCheck = editingIndex >= 0 
      ? existingGroups.filter((_, index) => index !== editingIndex) 
      : existingGroups;
    
    // Kiểm tra trùng tên nhóm sân
    duplicateGroup = groupsToCheck.find(group => 
      group.name.toLowerCase() === cleanedFieldGroupData.name.toLowerCase()
    );
    
    if (duplicateGroup) {
      hasDuplicateName = true;
    } else {
      // Kiểm tra trùng thuộc tính (mặt sân + kích thước)
      duplicateGroup = groupsToCheck.find(group => 
        group.surface === cleanedFieldGroupData.surface && 
        group.dimension === cleanedFieldGroupData.dimension &&
        // Kiểm tra thêm cả sportIds có phần tử chung không
        group.sportIds.some(id => cleanedFieldGroupData.sportIds.includes(id))
      );
      
      if (duplicateGroup) {
        hasSimilarProperties = true;
      }
    }
    
    // Nếu có trùng lặp, hiển thị cảnh báo
    if (hasDuplicateName || hasSimilarProperties) {
      if (hasDuplicateName) {
        // Tạo gợi ý tên thay thế bằng cách thêm các ký tự A, B, C... phía sau
        const suggestedNames = ['A', 'B', 'C', 'D', 'E'].map(
          suffix => `${cleanedFieldGroupData.name} ${suffix}`
        );
        
        // Tìm tên gợi ý không trùng với bất kỳ nhóm sân nào khác
        const uniqueSuggestedNames = suggestedNames.filter(
          name => !groupsToCheck.some(group => 
            group.name.toLowerCase() === name.toLowerCase()
          )
        );
        
        Modal.confirm({
          title: 'Tên nhóm sân đã tồn tại',
          content: (
            <div>
              <p>Nhóm sân có tên <strong>"{cleanedFieldGroupData.name}"</strong> đã tồn tại.</p>
              <p className="mt-2">Bạn có thể chọn một trong các tên gợi ý sau:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {uniqueSuggestedNames.map((name, index) => (
                  <Tag
                    key={index}
                    color="blue"
                    style={{ cursor: 'pointer', padding: '4px 8px', fontSize: '14px' }}
                    onClick={() => {
                      // Đóng modal hiện tại
                      Modal.destroyAll();
                      
                      // Lưu với tên mới
                      const updatedData = {
                        ...cleanedFieldGroupData,
                        name: name
                      };
                      saveFieldGroup(updatedData);
                    }}
                  >
                    {name}
                  </Tag>
                ))}
              </div>
              <p className="mt-3">Hoặc bạn có thể tự đặt tên khác. Lưu ý rằng tên nhóm sân phải là duy nhất.</p>
            </div>
          ),
          okText: 'Nhập lại tên',
          cancelText: 'Hủy',
          onOk: () => {
            // Không làm gì, để người dùng sửa lại form
            // Modal sẽ được đóng và form vẫn hiển thị
            return Promise.resolve();
          }
        });
      } else if (hasSimilarProperties) {
        Modal.confirm({
          title: 'Nhóm sân tương tự đã tồn tại',
          content: (
            <div>
              <p>Đã tồn tại nhóm sân có thuộc tính tương tự:</p>
              <ul className="mt-2">
                <li><strong>Tên nhóm sân:</strong> {duplicateGroup?.name}</li>
                <li><strong>Mặt sân:</strong> {duplicateGroup?.surface}</li>
                <li><strong>Kích thước:</strong> {duplicateGroup?.dimension}</li>
              </ul>
              <p className="mt-2">Thay vì tạo nhóm sân mới, bạn có thể chỉnh sửa nhóm sân hiện có để thêm số lượng sân.</p>
              <p className="mt-2">Bạn có chắc chắn muốn tiếp tục tạo nhóm sân mới?</p>
            </div>
          ),
          okText: 'Tiếp tục tạo mới',
          cancelText: 'Hủy',
          onOk: () => {
            saveFieldGroup(cleanedFieldGroupData);
          }
        });
      }
    } else {
      // Nếu không có trùng lặp, lưu ngay
      saveFieldGroup(cleanedFieldGroupData);
    }
  };
  
  // Hàm lưu nhóm sân sau khi đã kiểm tra trùng lặp
  const saveFieldGroup = (fieldGroupData: FieldGroupFormData) => {
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

  // Hàm truyền danh sách sportIds vào component FieldGroupForm
  const getSportIdsForFieldGroupForm = () => {
    // Nếu đang tạo sân tổng hợp, trả về mảng rỗng để cho phép
    // người dùng chọn môn thể thao trong form
    if (isCreatingCompositeSport || currentSport?.id === 999) {
      return [];
    }
    
    // Nếu là môn thể thao thông thường, trả về ID của môn thể thao đó
    return currentSport ? [currentSport.id] : [];
  };

  // Khi đóng modal, cần reset lại isCreatingCompositeSport
  const handleCloseFieldGroupModal = () => {
    setIsFieldGroupModalVisible(false);
    setIsCreatingCompositeSport(false);
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
              className={`border transition-all ${selectedSports.some(s => s.id === sport.id) ? 'border-blue-500 shadow-md' : 'border-gray-200'}`}
              onClick={() => handleSportSelect(sport, !selectedSports.some(s => s.id === sport.id))}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Text strong>{getSportNameInVietnamese(sport.name)}</Text>
                </div>
                <Checkbox checked={selectedSports.some(s => s.id === sport.id)} />
              </div>
            </Card>
          ))}
          
          {/* Composite sport option */}
          <Card 
            key="composite"
            hoverable
            className={`border transition-all ${showCompositeSport ? 'border-blue-500 shadow-md' : 'border-gray-200'}`}
            onClick={() => handleCompositeSportSelect(!showCompositeSport)}
          >
            <div className="flex items-center justify-between">
              <div>
                <Text strong>{COMPOSITE_SPORT_NAME}</Text>
                <div className="text-xs text-gray-500">Sân đa năng</div>
              </div>
              <Checkbox checked={showCompositeSport} />
            </div>
          </Card>
        </div>
      </div>
      
      {/* Show composite sport explanation if it's selected */}
      {showCompositeSport && (
        <Alert
          message="Sân đa năng"
          description="Sân đa năng cho phép kết hợp nhiều loại thể thao trên cùng một sân. Bạn có thể tạo nhóm sân đa năng để tối ưu không gian và tăng tính linh hoạt cho cơ sở của bạn."
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          className="mb-6"
        />
      )}
      
      {/* Field groups section */}
      {(selectedSports.length > 0 || showCompositeSport) && (
        <div className="mt-8">
          <Title level={5}>2. Tạo nhóm sân cho từng loại hình thể thao</Title>
          <Paragraph className="text-gray-500">
            Mỗi loại hình thể thao cần có ít nhất một nhóm sân
          </Paragraph>
          
          <Divider />
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <>
              {/* Regular sports sections */}
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
                                  {fieldGroup.peakStartTime1 && fieldGroup.peakEndTime1 && (
                                    <Tag color="purple">Giờ cao điểm 1: {fieldGroup.peakStartTime1} - {fieldGroup.peakEndTime1} (+{fieldGroup.priceIncrease1?.toLocaleString()} VNĐ)</Tag>
                                  )}
                                  {fieldGroup.numberOfPeaks && fieldGroup.numberOfPeaks > 1 && fieldGroup.peakStartTime2 && fieldGroup.peakEndTime2 && (
                                    <Tag color="purple">Giờ cao điểm 2: {fieldGroup.peakStartTime2} - {fieldGroup.peakEndTime2} (+{fieldGroup.priceIncrease2?.toLocaleString()} VNĐ)</Tag>
                                  )}
                                  {fieldGroup.numberOfPeaks && fieldGroup.numberOfPeaks > 2 && fieldGroup.peakStartTime3 && fieldGroup.peakEndTime3 && (
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
              
              {/* Composite sport section */}
              {showCompositeSport && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <Title level={5}>{COMPOSITE_SPORT_NAME}</Title>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => showAddFieldGroupModal(null, true)}
                    >
                      Thêm nhóm sân đa năng
                    </Button>
                  </div>
                  
                  {getFieldGroupsForSport(-1).length > 0 ? (
                    <List
                      className="bg-gray-50 rounded-lg"
                      itemLayout="horizontal"
                      dataSource={getFieldGroupsForSport(-1)}
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
                                  
                                  {/* Display all sports in this composite field group */}
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {fieldGroup.sportIds.map(sportId => {
                                      const sportObj = allSports.find(s => s.id === sportId);
                                      return sportObj ? (
                                        <Tag key={sportId} color="purple">
                                          {getSportNameInVietnamese(sportObj.name)}
                                        </Tag>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                                <div>
                                  {fieldGroup.peakStartTime1 && fieldGroup.peakEndTime1 && (
                                    <Tag color="purple">Giờ cao điểm 1: {fieldGroup.peakStartTime1} - {fieldGroup.peakEndTime1} (+{fieldGroup.priceIncrease1?.toLocaleString()} VNĐ)</Tag>
                                  )}
                                  {fieldGroup.numberOfPeaks && fieldGroup.numberOfPeaks > 1 && fieldGroup.peakStartTime2 && fieldGroup.peakEndTime2 && (
                                    <Tag color="purple">Giờ cao điểm 2: {fieldGroup.peakStartTime2} - {fieldGroup.peakEndTime2} (+{fieldGroup.priceIncrease2?.toLocaleString()} VNĐ)</Tag>
                                  )}
                                  {fieldGroup.numberOfPeaks && fieldGroup.numberOfPeaks > 2 && fieldGroup.peakStartTime3 && fieldGroup.peakEndTime3 && (
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
                          Chưa có nhóm sân đa năng nào. Nhấn "Thêm nhóm sân đa năng" để tạo mới.
                        </span>
                      }
                      className="my-8 bg-gray-50 p-8 rounded-lg"
                    />
                  )}
                  
                  <Divider />
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Field group modal */}
      <Modal
        title={editingFieldGroup ? "Chỉnh sửa nhóm sân" : "Thêm nhóm sân mới"}
        open={isFieldGroupModalVisible}
        onCancel={handleCloseFieldGroupModal}
        footer={null}
        width={800}
        destroyOnClose
      >
        {currentSport && (
          <FieldGroupForm
            open={isFieldGroupModalVisible}
            onClose={handleCloseFieldGroupModal}
            onSave={handleFieldGroupSave}
            sport={currentSport || allSports[0]}
            allSports={allSports}
            selectedSportIds={getSportIdsForFieldGroupForm()}
            editingFieldGroup={editingFieldGroup || undefined}
          />
        )}
      </Modal>
    </div>
  );
};

export default FieldGroupsForm; 