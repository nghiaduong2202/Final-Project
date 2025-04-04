import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, TimePicker, Typography, Row, Col, message } from 'antd';
import { FieldGroup, FieldGroupFormData } from '@/types/field.type';
import { fieldService } from '@/services/field.service';
import { SURFACE_TYPES, DIMENSIONS } from '@/mocks/default/defaultData';
import dayjs from 'dayjs';
import { getSportNameInVietnamese } from '@/utils/translateSport';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

interface FieldGroupEditProps {
  open: boolean;
  onClose: () => void;
  onSave: (updatedFieldGroup: FieldGroup) => void;
  fieldGroup: FieldGroup | null;
}

const FieldGroupEdit: React.FC<FieldGroupEditProps> = ({ open, onClose, onSave, fieldGroup }) => {
  const [form] = Form.useForm();
  const [selectedSports, setSelectedSports] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (fieldGroup && open) {
      // Set form values when modal opens
      form.setFieldsValue({
        name: fieldGroup.name,
        dimension: fieldGroup.dimension,
        surface: fieldGroup.surface,
        basePrice: fieldGroup.basePrice,
        // Format times for TimePicker with dayjs
        peakTime1: fieldGroup.peakStartTime1 ? [
          dayjs(fieldGroup.peakStartTime1, 'HH:mm'),
          dayjs(fieldGroup.peakEndTime1, 'HH:mm')
        ] : undefined,
        priceIncrease1: fieldGroup.priceIncrease1,
        
        peakTime2: fieldGroup.peakStartTime2 ? [
          dayjs(fieldGroup.peakStartTime2, 'HH:mm'),
          dayjs(fieldGroup.peakEndTime2, 'HH:mm')
        ] : undefined,
        priceIncrease2: fieldGroup.priceIncrease2,
        
        peakTime3: fieldGroup.peakStartTime3 ? [
          dayjs(fieldGroup.peakStartTime3, 'HH:mm'),
          dayjs(fieldGroup.peakEndTime3, 'HH:mm')
        ] : undefined,
        priceIncrease3: fieldGroup.priceIncrease3,
        
        sportIds: fieldGroup.sports.map(sport => sport.id)
      });
      
      // Set selected sports from fieldGroup
      setSelectedSports(fieldGroup.sports.map(sport => sport.id));
    }
  }, [fieldGroup, open, form]);

  const handleSave = () => {
    form.validateFields().then(values => {
      if (!fieldGroup) return;

      // Calculate number of peak times
      let numberOfPeaks = 0;
      if (values.peakTime1) numberOfPeaks++;
      if (values.peakTime2) numberOfPeaks++;
      if (values.peakTime3) numberOfPeaks++;

      // Transform form values for display
      const peakTime1Display = values.peakTime1 
        ? `${values.peakTime1[0].format('HH:mm')} - ${values.peakTime1[1].format('HH:mm')}: ${values.priceIncrease1?.toLocaleString('de-DE')} VNĐ` 
        : '';
      
      const peakTime2Display = values.peakTime2 
        ? `${values.peakTime2[0].format('HH:mm')} - ${values.peakTime2[1].format('HH:mm')}: ${values.priceIncrease2?.toLocaleString('de-DE')} VNĐ` 
        : '';
      
      const peakTime3Display = values.peakTime3 
        ? `${values.peakTime3[0].format('HH:mm')} - ${values.peakTime3[1].format('HH:mm')}: ${values.priceIncrease3?.toLocaleString('de-DE')} VNĐ` 
        : '';

      // Get sport names
      const selectedSportNames = sportOptions
        .filter(sport => values.sportIds.includes(sport.value))
        .map(sport => sport.label)
        .join(', ');

      // Hiển thị popup xác nhận
      Modal.confirm({
        title: 'Xác nhận thay đổi',
        content: (
          <div>
            <p>Bạn có chắc chắn muốn lưu những thay đổi cho nhóm sân <strong>{values.name}</strong>?</p>
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <p><strong>Kích thước:</strong> {values.dimension}</p>
              <p><strong>Mặt sân:</strong> {values.surface}</p>
              <p><strong>Giá cơ bản:</strong> {values.basePrice?.toLocaleString('de-DE')} VNĐ</p>
              <p><strong>Loại hình thể thao:</strong> {selectedSportNames}</p>
              {numberOfPeaks > 0 && (
                <>
                  <p><strong>Giờ cao điểm:</strong></p>
                  <ul>
                    {peakTime1Display && <li>{peakTime1Display}</li>}
                    {peakTime2Display && <li>{peakTime2Display}</li>}
                    {peakTime3Display && <li>{peakTime3Display}</li>}
                  </ul>
                </>
              )}
            </div>
          </div>
        ),
        okText: 'Lưu thay đổi',
        cancelText: 'Hủy',
        icon: <ExclamationCircleOutlined />,
        onOk: async () => {
          try {
            setIsSubmitting(true);
            
            // Transform form values to FieldGroupFormData object
            const updateData: Partial<FieldGroupFormData> = {
              name: values.name,
              dimension: values.dimension,
              surface: values.surface,
              basePrice: values.basePrice,
              sportIds: values.sportIds
            };
            
            // Chỉ thêm các trường peak time nếu có
            if (values.peakTime1) {
              updateData.peakStartTime1 = values.peakTime1[0].format('HH:mm');
              updateData.peakEndTime1 = values.peakTime1[1].format('HH:mm');
              updateData.priceIncrease1 = values.priceIncrease1 || 0;
            }
            
            if (values.peakTime2) {
              updateData.peakStartTime2 = values.peakTime2[0].format('HH:mm');
              updateData.peakEndTime2 = values.peakTime2[1].format('HH:mm');
              updateData.priceIncrease2 = values.priceIncrease2 || 0;
            }
            
            if (values.peakTime3) {
              updateData.peakStartTime3 = values.peakTime3[0].format('HH:mm');
              updateData.peakEndTime3 = values.peakTime3[1].format('HH:mm');
              updateData.priceIncrease3 = values.priceIncrease3 || 0;
            }
            
            // Call API to update field group
            await fieldService.updateFieldGroup(fieldGroup.id, updateData);
            
            // For the local state update, we need to map to the expected format
            const updatedFieldGroup: FieldGroup = {
              ...fieldGroup,
              ...updateData,
              numberOfPeaks,
              fields: fieldGroup.fields, // Keep the existing fields unchanged
              sports: fieldGroup.sports.filter(sport => 
                values.sportIds.includes(sport.id)
              )
            };
            
            // Show success message
            Modal.success({
              title: 'Cập nhật thành công',
              content: 'Thông tin nhóm sân đã được cập nhật thành công.'
            });
                        
            onSave(updatedFieldGroup);
            onClose();
          } catch (error) {
            console.error('Error updating field group:', error);
            message.error('Không thể cập nhật nhóm sân. Vui lòng thử lại.');
          } finally {
            setIsSubmitting(false);
          }
        }
      });
    });
  };

  const sportOptions = [
    { value: 1, label: getSportNameInVietnamese('football') },
    { value: 2, label: getSportNameInVietnamese('basketball') },
    { value: 3, label: getSportNameInVietnamese('volleyball') },
    { value: 4, label: getSportNameInVietnamese('tennis') },
    { value: 5, label: getSportNameInVietnamese('badminton') },
    { value: 6, label: getSportNameInVietnamese('tabletennis') },
    { value: 7, label: getSportNameInVietnamese('pickleball') },
    { value: 8, label: getSportNameInVietnamese('golf') }
  ];

  // Get surface options based on selected sports
  const getSurfaceOptions = () => {
    if (selectedSports.length === 0) return SURFACE_TYPES.default;
    
    // Get surfaces for the first selected sport (simplification)
    const sportId = selectedSports[0];
    const sportName = sportOptions.find(opt => opt.value === sportId)?.label.toLowerCase() || 'football';
    const sportKey = sportName as keyof typeof SURFACE_TYPES;
    
    return SURFACE_TYPES[sportKey] || SURFACE_TYPES.default;
  };
  
  // Get dimension options based on selected sports
  const getDimensionOptions = () => {
    if (selectedSports.length === 0) return DIMENSIONS.default;
    
    // Get dimensions for the first selected sport (simplification)
    const sportId = selectedSports[0];
    const sportName = sportOptions.find(opt => opt.value === sportId)?.label.toLowerCase() || 'football';
    const sportKey = sportName as keyof typeof DIMENSIONS;
    
    return DIMENSIONS[sportKey] || DIMENSIONS.default;
  };

  if (!fieldGroup) return null;

  return (
    <Modal
      title={<Title level={4}>Chỉnh sửa nhóm sân: {fieldGroup.name}</Title>}
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      width={800}
      confirmLoading={isSubmitting}
      style={{ top: 20 }}
      styles={{ 
        body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: '',
          basePrice: 0,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên nhóm sân"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên nhóm sân' }]}
            >
              <Input placeholder="Nhập tên nhóm sân" />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label="Giá sân cơ bản"
              name="basePrice"
              rules={[{ required: true, message: 'Vui lòng nhập giá sân' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                addonAfter="VNĐ"
                placeholder="Nhập giá sân cơ bản"
                min={0}                
                step={10000}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={(value: string | undefined) => {
                  if (!value) return 0;
                  return Number(value.replace(/\./g, ''));
                }}
                precision={0}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Loại hình thể thao"
              name="sportIds"
              rules={[{ required: true, message: 'Vui lòng chọn ít nhất một loại hình thể thao' }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn loại hình thể thao"
                onChange={(values: number[]) => setSelectedSports(values)}
                style={{ width: '100%' }}
              >
                {sportOptions.map((sport) => (
                  <Option key={sport.value} value={sport.value}>
                    {sport.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Mặt sân"
              name="surface"
              rules={[{ required: true, message: 'Vui lòng chọn mặt sân' }]}
            >
              <Select placeholder="Chọn mặt sân">
                {getSurfaceOptions().map((surface, index) => (
                  <Option key={index} value={surface}>
                    {surface}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Kích thước sân"
              name="dimension"
              rules={[{ required: true, message: 'Vui lòng chọn kích thước sân' }]}
            >
              <Select placeholder="Chọn kích thước sân">
                {getDimensionOptions().map((dimension, index) => (
                  <Option key={index} value={dimension}>
                    {dimension}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 16, marginBottom: 16 }}>Giờ cao điểm</Title>

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item label="Giờ cao điểm 1" name="peakTime1">
              <TimePicker.RangePicker 
                format="HH:mm" 
                style={{ width: '100%' }}
                placeholder={['Giờ bắt đầu', 'Giờ kết thúc']}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Tăng giá" name="priceIncrease1">
              <InputNumber
                style={{ width: '100%' }}
                addonAfter="VNĐ"
                min={0}                
                step={10000}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={(value: string | undefined) => {
                  if (!value) return 0;
                  return Number(value.replace(/\./g, ''));
                }}               
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item label="Giờ cao điểm 2" name="peakTime2">
              <TimePicker.RangePicker 
                format="HH:mm" 
                style={{ width: '100%' }}
                placeholder={['Giờ bắt đầu', 'Giờ kết thúc']}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Tăng giá" name="priceIncrease2">
              <InputNumber
                style={{ width: '100%' }}
                addonAfter="VNĐ"
                min={0}                
                step={10000}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={(value: string | undefined) => {
                  if (!value) return 0;
                  return Number(value.replace(/\./g, ''));
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item label="Giờ cao điểm 3" name="peakTime3">
              <TimePicker.RangePicker 
                format="HH:mm" 
                style={{ width: '100%' }}
                placeholder={['Giờ bắt đầu', 'Giờ kết thúc']}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Tăng giá" name="priceIncrease3">
              <InputNumber
                style={{ width: '100%' }}
                addonAfter="VNĐ"
                min={0}                
                step={10000}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={(value: string | undefined) => {
                  if (!value) return 0;
                  return Number(value.replace(/\./g, ''));
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default FieldGroupEdit; 