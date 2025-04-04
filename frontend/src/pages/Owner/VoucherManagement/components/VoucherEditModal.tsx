import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Button } from 'antd';
import { Voucher, VoucherFormData } from '@/types/voucher.type';
import dayjs from 'dayjs';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

interface VoucherEditModalProps {
  visible: boolean;
  voucher: Voucher | null;
  onClose: () => void;
  onSave: (values: VoucherFormData) => void;
  submitting: boolean;
}

const VoucherEditModal: React.FC<VoucherEditModalProps> = ({
  visible,
  voucher,
  onClose,
  onSave,
  submitting
}) => {
  // Tạo form instance ngay trong component
  const [form] = Form.useForm();
  
  // Theo dõi loại voucher với state của component
  const [voucherType, setVoucherType] = useState<'cash' | 'percent'>('cash');
  
  // Khởi tạo form chỉ khi modal đã hiển thị hoàn toàn với component đã mount
  useEffect(() => {
    // Chỉ thực hiện khi modal hiển thị và có dữ liệu voucher
    if (visible && voucher) {
      // Gọi lệnh này trong queue của React để đảm bảo Form đã được render
      const timer = setTimeout(() => {
        try {
          // Thiết lập giá trị cho form
          form.setFieldsValue({
            name: voucher.name,
            code: voucher.code,
            voucherType: voucher.voucherType,
            discount: voucher.discount,
            minPrice: voucher.minPrice,
            maxDiscount: voucher.maxDiscount,
            dateRange: [
              dayjs(voucher.startDate),
              dayjs(voucher.endDate)
            ],
            amount: voucher.amount
          });
          // Cập nhật state cho loại voucher
          setVoucherType(voucher.voucherType);
        } catch (error) {
          console.error('Lỗi khi thiết lập giá trị form:', error);
        }
      }, 300); // Thời gian đợi dài hơn để đảm bảo Form đã được render
      
      return () => clearTimeout(timer);
    }
  }, [visible, voucher, form]);
  
  // Reset form khi modal đóng
  useEffect(() => {
    if (!visible) {
      // Reset form và state
      form.resetFields();
      setVoucherType('cash');
    }
  }, [visible, form]);

  // Xử lý submit form với xác nhận
  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        // Hiển thị popup xác nhận
        confirm({
          title: 'Xác nhận thay đổi thông tin',
          icon: <ExclamationCircleOutlined />,
          content: 'Bạn có chắc chắn muốn lưu những thay đổi này?',
          okText: 'Xác nhận',
          cancelText: 'Hủy',
          onOk() {
            // Trích xuất ngày từ dateRange
            const { dateRange, ...rest } = values;
            
            // Xử lý giá trị maxDiscount cho loại voucher cash
            const finalValues = {...rest};
            if (values.voucherType === 'cash') {
              finalValues.maxDiscount = values.discount;
            }
            
            // Tạo dữ liệu để gửi
            const voucherData: VoucherFormData = {
              ...finalValues,
              startDate: dateRange[0].format('YYYY-MM-DD'),
              endDate: dateRange[1].format('YYYY-MM-DD'),
            };
            
            onSave(voucherData);
          }
        });
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  // Xử lý khi thay đổi loại voucher
  const handleVoucherTypeChange = (value: 'cash' | 'percent') => {
    setVoucherType(value);
    
    // Nếu chọn loại "cash", tự động cập nhật maxDiscount = discount
    if (value === 'cash') {
      const currentDiscount = form.getFieldValue('discount');
      form.setFieldsValue({ maxDiscount: currentDiscount });
    }
  };

  // Xử lý khi thay đổi giá trị giảm (discount)
  const handleDiscountChange = (value: number | null) => {
    // Nếu loại voucher là "cash", tự động cập nhật maxDiscount = discount
    if (voucherType === 'cash' && value !== null) {
      form.setFieldsValue({ maxDiscount: value });
    }
  };

  // Render component
  return (
    <Form.Provider>
      <Modal
        title="Chỉnh sửa voucher"
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="back" onClick={onClose}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={submitting} 
            onClick={handleSubmit}
          >
            Lưu thay đổi
          </Button>
        ]}
        width={700}
        destroyOnClose={true}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          name="voucher_edit_form"
          preserve={false}
        >
          <Form.Item
            name="name"
            label="Tên voucher"
            rules={[{ required: true, message: 'Vui lòng nhập tên voucher' }]}
          >
            <Input placeholder="Nhập tên voucher" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Mã voucher"
            rules={[{ required: true, message: 'Vui lòng nhập mã voucher' }]}
          >
            <Input placeholder="Nhập mã voucher" />
          </Form.Item>

          <Form.Item
            name="voucherType"
            label="Loại giảm giá"
            rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
          >
            <Select 
              placeholder="Chọn loại giảm giá"
              onChange={handleVoucherTypeChange}
            >
              <Option value="percent">Giảm theo %</Option>
              <Option value="cash">Giảm theo số tiền</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="discount"
            label="Giá trị giảm"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập giá trị giảm"
              formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
              parser={(value: string | undefined) => {
                if (!value) return 0;
                return Number(value.replace(/\./g, ''));
              }}
              onChange={handleDiscountChange}
              addonAfter={voucherType === 'percent' ? '%' : 'đ'}
            />
          </Form.Item>

          <Form.Item
            name="minPrice"
            label="Đơn tối thiểu"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị đơn tối thiểu' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập giá trị đơn tối thiểu"
              formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
              parser={(value: string | undefined) => {
                if (!value) return 0;
                return Number(value.replace(/\./g, ''));
              }}
              addonAfter="đ"
            />
          </Form.Item>

          {voucherType === 'percent' && (
            <Form.Item
              name="maxDiscount"
              label="Giảm tối đa"
              rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm tối đa' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Nhập giá trị giảm tối đa"
                formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                parser={(value: string | undefined) => {
                  if (!value) return 0;
                  return Number(value.replace(/\./g, ''));
                }}
                addonAfter="đ"
              />
            </Form.Item>
          )}

          <Form.Item
            name="dateRange"
            label="Thời gian sử dụng"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian sử dụng' }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Số lượng voucher"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng voucher' }]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              min={1}
              placeholder="Nhập số lượng voucher"
              formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
              parser={(value: string | undefined) => {
                if (!value) return 1;
                return Number(value.replace(/\./g, ''));
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Form.Provider>
  );
};

export default VoucherEditModal; 