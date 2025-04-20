import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, InputNumber, Select, DatePicker, Button, Card, Typography, Row, Col, message, Modal } from 'antd';
import { ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { VoucherFormData } from '@/types/voucher.type';
import { facilityService, FacilityDropdownItem } from '@/services/facility.service';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { createVoucher } from '@/store/slices/voucherSlice';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

// Key cho localStorage
const SELECTED_FACILITY_KEY = 'owner_selected_facility_id';

// Định nghĩa interface cho form values
interface VoucherFormValues {
  name: string;
  code: string;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
  voucherType: 'cash' | 'percent';
  discount: number;
  minPrice: number;
  maxDiscount: number;
  amount: number;
}

const CreateVoucher: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  
  // States
  const [facilities, setFacilities] = useState<FacilityDropdownItem[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [voucherType, setVoucherType] = useState<'cash' | 'percent'>('cash');
  const [facilityLoading, setFacilityLoading] = useState(false);

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
          setSelectedFacilityId(initialFacilityId);
        }
      } catch (error) {
        console.error('Error fetching facilities:', error);
      } finally {
        setFacilityLoading(false);
      }
    };
    
    fetchFacilities();
  }, []);

  // Xử lý khi chọn cơ sở
  const handleFacilityChange = (value: string) => {
    setSelectedFacilityId(value);
    localStorage.setItem(SELECTED_FACILITY_KEY, value);
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

  // Gán giá trị ban đầu cho voucherType khi component được render
  useEffect(() => {
    setVoucherType(form.getFieldValue('voucherType') || 'cash');
  }, [form]);

  // Xử lý khi submit form
  const handleSubmit = (values: VoucherFormValues) => {
    if (!selectedFacilityId) {
      message.error('Vui lòng chọn cơ sở');
      return;
    }

    // Hiển thị popup xác nhận
    confirm({
      title: 'Xác nhận tạo voucher',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn tạo voucher này?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        setSubmitting(true);

        // Xử lý giá trị maxDiscount cho loại voucher cash
        const finalValues = {...values};
        if (values.voucherType === 'cash') {
          finalValues.maxDiscount = values.discount;
        }

        // Extract dates from date range và tạo VoucherFormData
        const voucherData: VoucherFormData = {
          name: finalValues.name,
          code: finalValues.code,
          startDate: finalValues.dateRange[0].format('YYYY-MM-DD'),
          endDate: finalValues.dateRange[1].format('YYYY-MM-DD'),
          voucherType: finalValues.voucherType,
          discount: finalValues.discount,
          minPrice: finalValues.minPrice,
          maxDiscount: finalValues.maxDiscount,
          amount: finalValues.amount,
          // facilityId: selectedFacilityId,
        };

        try {
          await dispatch(createVoucher({ facilityId: selectedFacilityId, voucherData })).unwrap();
          message.success('Tạo voucher thành công');
          navigate('/owner/voucher-management');
        } catch (error) {
          message.error('Có lỗi xảy ra khi tạo voucher. Vui lòng thử lại sau.');
          console.error('Error creating voucher:', error);
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  return (
    <div className="p-6 md:p-8">
      <Card className="mb-4">
        <div className="flex items-center mb-4">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/owner/voucher-management')}
            type="text"
          />
          <Title level={3} style={{ margin: 0, marginLeft: 8 }}>
            Tạo Voucher mới
          </Title>
        </div>
        
        <Text className="block mb-4 text-gray-600">
          Tạo voucher ưu đãi để thu hút khách hàng và tăng doanh thu cho cơ sở của bạn.
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{
            voucherType: 'cash',
          }}
        >
          <Row gutter={24}>
            <Col span={24} className="mb-4">
              <Title level={4}>Thông tin cơ bản</Title>
            </Col>

            {/* Chọn cơ sở */}
            <Col span={24}>
              <Form.Item
                label="Chọn cơ sở áp dụng"
                required
                help={!selectedFacilityId ? 'Vui lòng chọn cơ sở' : null}
                validateStatus={!selectedFacilityId ? 'error' : undefined}
              >
                <Select
                  placeholder="Chọn cơ sở của bạn"
                  style={{ width: '100%' }}
                  value={selectedFacilityId || undefined}
                  onChange={handleFacilityChange}
                  loading={facilityLoading}
                >
                  {facilities.map((facility) => (
                    <Option key={facility.id} value={facility.id}>
                      {facility.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Tên và mã voucher */}
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Tên Voucher"
                rules={[{ required: true, message: 'Vui lòng nhập tên voucher' }]}
              >
                <Input placeholder="Nhập tên voucher" />
              </Form.Item>
            </Col>

            {/* <Col xs={24} md={12}>
              <Form.Item
                name="code"
                label="Mã Voucher"
                rules={[{ required: true, message: 'Vui lòng nhập mã voucher' }]}
              >
                <Input placeholder="Nhập mã voucher (VD: WELCOME2023)" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col> */}

            {/* Thời gian áp dụng */}
            <Col span={24}>
              <Form.Item
                name="dateRange"
                label="Thời gian áp dụng"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian áp dụng' }]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>

            <Col span={24} className="mb-4 mt-4">
              <Title level={4}>Thiết lập mã giảm giá</Title>
            </Col>

            {/* Loại giảm giá và giá trị */}
            <Col xs={24} md={12}>
              <Form.Item
                name="voucherType"
                label="Loại giảm giá"
                rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
              >
                <Select 
                  placeholder="Chọn loại giảm giá"
                  onChange={handleVoucherTypeChange}
                >
                  <Option value="cash">Giảm theo số tiền</Option>
                  <Option value="percent">Giảm theo phần trăm</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
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
                  min={0}
                  max={voucherType === 'percent' ? 100 : undefined}
                />
              </Form.Item>
            </Col>

            {/* Đơn tối thiểu */}
            <Col xs={24} md={voucherType === 'percent' ? 8 : 12}>
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
                  min={0}
                />
              </Form.Item>
            </Col>

            {/* Giảm tối đa - chỉ hiển thị khi chọn loại giảm là percent */}
            {voucherType === 'percent' && (
              <Col xs={24} md={8}>
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
                    min={0}
                  />
                </Form.Item>
              </Col>
            )}

            {/* Số lượng voucher */}
            <Col xs={24} md={voucherType === 'percent' ? 8 : 12}>
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
            </Col>
          </Row>

          <div className="flex justify-end gap-4 mt-8">
            <Button 
              onClick={() => navigate('/owner/voucher-management')}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={submitting}
              style={{ background: '#1890ff' }}
            >
              Tạo voucher
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CreateVoucher;