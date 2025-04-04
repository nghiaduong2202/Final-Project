import React from 'react';
import { Modal, Form, Input, Typography, Select, InputNumber, Button } from 'antd';
import { Service, UpdatedServiceValues } from '@/types/service.type';
import { Sport } from '@/types/sport.type';
import { getSportNameInVietnamese } from '@/utils/translateSport';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

interface ServiceEditModalProps {
  visible: boolean;
  service: Service | null;
  sports: Sport[];
  onCancel: () => void;
  onSubmit: (values: UpdatedServiceValues) => void;
}

const ServiceEditModal: React.FC<ServiceEditModalProps> = ({
  visible,
  service,
  sports,
  onCancel,
  onSubmit
}) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSubmit(values as UpdatedServiceValues);
    }).catch(error => {
      console.error('Validation failed:', error);
    });
  };

  return (
    <Modal
      title={<Title level={4}>Chỉnh sửa dịch vụ</Title>}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit} 
        >
          Lưu thay đổi
        </Button>
      ]}
      width={600}
      style={{ top: 20 }}
      styles={{
        body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }
      }}
    >
      {service && (
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{
            name: service.name,
            description: service.description,
            price: service.price,
            amount: service.amount,
            sportId: service.sport?.id,
            type: service.type,
            unit: service.unit
          }}
        >
          <Form.Item
            name="name"
            label="Tên dịch vụ"
            rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ' }]}
          >
            <Input placeholder="Nhập tên dịch vụ" />
          </Form.Item>

          <Form.Item
            name="sportId"
            label="Loại hình thể thao"
            rules={[{ required: true, message: 'Vui lòng chọn loại hình thể thao' }]}
          >
            <Select 
              placeholder="Chọn loại hình thể thao"
              optionLabelProp="label"
              style={{ width: '100%' }}
              popupMatchSelectWidth={false}
            >
              {sports.map((sport) => (
                <Option 
                  key={sport.id} 
                  value={sport.id} 
                  label={getSportNameInVietnamese(sport.name)}
                >
                  <div style={{ minWidth: '120px' }}>{getSportNameInVietnamese(sport.name)}</div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại dịch vụ"
            rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ' }]}
          >
            <Select placeholder="Chọn loại dịch vụ">
              <Option value="rental">Cho thuê</Option>
              <Option value="coaching">Huấn luyện</Option>
              <Option value="equipment">Thiết bị</Option>
              <Option value="food">Đồ uống/Thực phẩm</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả dịch vụ"
          >
            <TextArea 
              placeholder="Nhập mô tả chi tiết về dịch vụ" 
              rows={3}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="price"
              label="Giá dịch vụ"
              rules={[{ required: true, message: 'Vui lòng nhập giá dịch vụ' }]}
            >
              <InputNumber
                min={0}
                placeholder="Nhập giá dịch vụ"
                addonAfter="đ"
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={(value: string | undefined) => {
                  if (!value) return 0;
                  return Number(value.replace(/\./g, ''));
                }}
              />
            </Form.Item>

            <Form.Item
              name="unit"
              label="Đơn vị tính"
              rules={[{ required: true, message: 'Vui lòng nhập đơn vị tính' }]}
            >
              <Select placeholder="Chọn đơn vị tính">
                <Option value="giờ">Giờ</Option>
                <Option value="ngày">Ngày</Option>
                <Option value="buổi">Buổi</Option>
                <Option value="chai">Chai</Option>
                <Option value="cái">Cái</Option>
                <Option value="bộ">Bộ</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="amount"
            label="Số lượng"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber
              min={0}
              placeholder="Nhập số lượng"
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={(value: string | undefined) => {
                if (!value) return 0;
                return Number(value.replace(/\./g, ''));
              }}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default ServiceEditModal; 