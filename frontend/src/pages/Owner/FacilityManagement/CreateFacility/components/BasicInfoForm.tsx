import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  TimePicker, 
  Typography, 
  Divider, 
  Row, 
  Col,
  Alert,
  Spin,
  Button
} from 'antd';
import { FacilityFormData, FacilityInfo, Province, District, Ward } from '@/types/facility.type';
import dayjs from 'dayjs';
import axios from 'axios';
import { facilityService } from '@/services/facility.service';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface BasicInfoFormProps {
  formData: FacilityFormData;
  updateFormData: (data: Partial<FacilityFormData>) => void;
  allSports: { id: number; name: string }[];
}

export interface BasicInfoFormRef {
  validateFields: () => Promise<BasicInfoFormValues>;
}

// Interface for form values
interface BasicInfoFormValues {
  name: string;
  description: string;
  numberOfShifts: number;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  detailAddress: string;
  openTime1: dayjs.Dayjs | null;
  closeTime1: dayjs.Dayjs | null;
  openTime2?: dayjs.Dayjs | null;
  closeTime2?: dayjs.Dayjs | null;
  openTime3?: dayjs.Dayjs | null;
  closeTime3?: dayjs.Dayjs | null;
}

const BasicInfoForm = forwardRef<BasicInfoFormRef, BasicInfoFormProps>(({ 
  formData, 
  updateFormData
}, ref) => {
  const [form] = Form.useForm<BasicInfoFormValues>();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [numberOfShifts, setNumberOfShifts] = useState<number>(
    formData.facilityInfo?.numberOfShifts || 1
  );
  
  // Expose form methods to parent
  useImperativeHandle(ref, () => ({
    validateFields: async () => {
      const values = await form.validateFields();
      // Khi validate, đồng thời cập nhật formData
      await handleSubmit(values);
      return values;
    }
  }));
  
  // Fetch provinces on mount
  useEffect(() => {
    fetchProvinces();
  }, []);
  
  // Load districts if province is selected
  useEffect(() => {
    if (formData.facilityInfo?.provinceCode) {
      fetchDistricts(formData.facilityInfo.provinceCode);
    }
  }, [formData.facilityInfo?.provinceCode]);
  
  // Load wards if district is selected
  useEffect(() => {
    if (formData.facilityInfo?.districtCode) {
      fetchWards(formData.facilityInfo.districtCode);
    }
  }, [formData.facilityInfo?.districtCode]);
  
  // Fetch provinces from API
  const fetchProvinces = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://provinces.open-api.vn/api/p/');
      setProvinces(response.data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch districts from API
  const fetchDistricts = async (provinceCode: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      setDistricts(response.data.districts);
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch wards from API
  const fetchWards = async (districtCode: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      setWards(response.data.wards);
    } catch (error) {
      console.error('Error fetching wards:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Khởi tạo form với dữ liệu có sẵn
  useEffect(() => {
    if (formData.facilityInfo) {
      const info = formData.facilityInfo;
      form.setFieldsValue({
        name: info.name,
        description: info.description,
        numberOfShifts: info.numberOfShifts,
        provinceCode: info.provinceCode,
        districtCode: info.districtCode,
        wardCode: info.wardCode,
        detailAddress: info.location,
        openTime1: info.openTime1 ? dayjs(info.openTime1, 'HH:mm') : null,
        closeTime1: info.closeTime1 ? dayjs(info.closeTime1, 'HH:mm') : null,
        openTime2: info.openTime2 ? dayjs(info.openTime2, 'HH:mm') : null,
        closeTime2: info.closeTime2 ? dayjs(info.closeTime2, 'HH:mm') : null,
        openTime3: info.openTime3 ? dayjs(info.openTime3, 'HH:mm') : null,
        closeTime3: info.closeTime3 ? dayjs(info.closeTime3, 'HH:mm') : null,
      });
      
      setNumberOfShifts(info.numberOfShifts);
    }
  }, [formData, form]);
  
  // Theo dõi thay đổi form và tự động lưu
  const handleFormValuesChange = (_changedValues: Partial<BasicInfoFormValues>, allValues: BasicInfoFormValues) => {
    // Chỉ cập nhật khi đã có thông tin cơ bản
    if (allValues.name && allValues.description) {
      const timer = setTimeout(() => {
        handleSubmit(allValues);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (values: BasicInfoFormValues) => {
    try {
      // Get province, district, and ward names
      let provinceName = '';
      let districtName = '';
      let wardName = '';
      
      // Find province name
      const province = provinces.find(p => p.code?.toString() === values.provinceCode);
      if (province) {
        provinceName = province.name;
      }
      
      // Find district name
      const district = districts.find(d => d.code?.toString() === values.districtCode);
      if (district) {
        districtName = district.name;
      }
      
      // Find ward name
      const ward = wards.find(w => w.code?.toString() === values.wardCode);
      if (ward) {
        wardName = ward.name;
      }
      
      // Format facility info
      const facilityInfo: FacilityInfo = {
        name: values.name,
        description: values.description,
        numberOfShifts: values.numberOfShifts,
        city: provinceName,
        provinceCode: values.provinceCode,
        district: districtName,
        districtCode: values.districtCode,
        ward: wardName,
        wardCode: values.wardCode,
        location: values.detailAddress,
        openTime1: values.openTime1 ? values.openTime1.format('HH:mm') : '',
        closeTime1: values.closeTime1 ? values.closeTime1.format('HH:mm') : '',
        openTime2: values.numberOfShifts >= 2 ? values.openTime2?.format('HH:mm') || '' : '',
        closeTime2: values.numberOfShifts >= 2 ? values.closeTime2?.format('HH:mm') || '' : '',
        openTime3: values.numberOfShifts >= 3 ? values.openTime3?.format('HH:mm') || '' : '',
        closeTime3: values.numberOfShifts >= 3 ? values.closeTime3?.format('HH:mm') || '' : ''
      };
      
      // Update form data with new facility info
      updateFormData({ facilityInfo });
      console.log("Đã cập nhật facilityInfo:", facilityInfo);
    } catch (error) {
      console.error('Error processing form submission:', error);
    }
  };
  
  // Handle province change
  const handleProvinceChange = (value: string) => {
    fetchDistricts(value);
    form.setFieldsValue({ 
      districtCode: undefined,
      wardCode: undefined
    });
  };
  
  // Handle district change
  const handleDistrictChange = (value: string) => {
    fetchWards(value);
    form.setFieldsValue({ 
      wardCode: undefined
    });
  };
  
  // Handle change number of shifts
  const handleShiftChange = (value: number | null) => {
    if (value) {
      setNumberOfShifts(value);
    }
  };

  // Custom validator for facility name uniqueness
  const validateFacilityName = async (_rule: unknown, value: string) => {
    if (!value) {
      return Promise.resolve(); // Let the required rule handle empty value
    }
    
    try {
      const response = await facilityService.checkFacilityNameExists(value);
      if (response.exists) {
        return Promise.reject('Tên cơ sở đã tồn tại');
      }
      return Promise.resolve();
    } catch (error) {
      console.error('Error checking facility name:', error);
      return Promise.reject('Không thể kiểm tra tên cơ sở. Vui lòng thử lại sau.');
    }
  };

  // Custom validator for operating hours
  const validateOperatingHours = async (_rule: unknown, value: dayjs.Dayjs | null, field: string) => {
    if (!value) {
      return Promise.resolve(); // Let the required rule handle empty value
    }

    // Get current form values without triggering validation
    const values = form.getFieldsValue();
    const { numberOfShifts, openTime1, closeTime1, openTime2, closeTime2, openTime3, closeTime3 } = values;

    // Validate first shift
    if (field === 'openTime1' || field === 'closeTime1') {
      if (!openTime1 || !closeTime1) {
        return Promise.resolve(); // Let the required rule handle empty values
      }
      if (openTime1.isAfter(closeTime1)) {
        return Promise.reject('Giờ đóng cửa phải sau giờ mở cửa');
      }
    }

    // Validate second shift if exists
    if (numberOfShifts >= 2) {
      if (field === 'openTime2') {
        if (!closeTime1) {
          return Promise.resolve(); // Let the required rule handle empty values
        }
        if (value.isBefore(closeTime1)) {
          return Promise.reject('Giờ mở cửa ca 2 phải sau giờ đóng cửa ca 1');
        }
      }
      if (field === 'closeTime2') {
        if (!openTime2 || !closeTime2) {
          return Promise.resolve(); // Let the required rule handle empty values
        }
        if (openTime2.isAfter(closeTime2)) {
          return Promise.reject('Giờ đóng cửa phải sau giờ mở cửa');
        }
      }
    }

    // Validate third shift if exists
    if (numberOfShifts >= 3) {
      if (field === 'openTime3') {
        if (!closeTime2) {
          return Promise.resolve(); // Let the required rule handle empty values
        }
        if (value.isBefore(closeTime2)) {
          return Promise.reject('Giờ mở cửa ca 3 phải sau giờ đóng cửa ca 2');
        }
      }
      if (field === 'closeTime3') {
        if (!openTime3 || !closeTime3) {
          return Promise.resolve(); // Let the required rule handle empty values
        }
        if (openTime3.isAfter(closeTime3)) {
          return Promise.reject('Giờ đóng cửa phải sau giờ mở cửa');
        }
      }
    }

    return Promise.resolve();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Title level={4}>Thông tin cơ bản</Title>
      <Text type="secondary" className="mb-6 block">
        Vui lòng nhập đầy đủ các thông tin cơ bản của cơ sở
      </Text>
      
      <Divider />
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        name="basicInfoForm"
        initialValues={{
          numberOfShifts: 1
        }}
        validateTrigger={['onBlur']}
        validateMessages={{
          required: 'Vui lòng nhập ${label}',
          types: {
            email: '${label} không phải là email hợp lệ',
            number: '${label} không phải là số hợp lệ',
          },
          number: {
            range: '${label} phải nằm trong khoảng ${min} và ${max}',
          },
        }}
        onValuesChange={handleFormValuesChange}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Tên cơ sở"
              rules={[
                { required: true },
                { validator: validateFacilityName }
              ]}
              validateTrigger={['onBlur', 'onChange']}
            >
              <Input placeholder="Nhập tên cơ sở" />
            </Form.Item>
          </Col>
          
          <Col span={24}>
            <Form.Item
              name="description"
              label="Mô tả"
            >
              <TextArea rows={4} placeholder="Nhập mô tả cơ sở (không bắt buộc)" />
            </Form.Item>
          </Col>
        </Row>
        
        <Title level={5} className="mt-4">Giờ hoạt động</Title>
        
        <Row gutter={16} className="mb-4">
          <Col span={24}>
            <Form.Item
              name="numberOfShifts"
              label="Số ca trong ngày"
              rules={[{ required: true }]}
              validateTrigger={['onBlur', 'onChange']}
            >
              <Select onChange={handleShiftChange}>
                <Option value={1}>1 ca</Option>
                <Option value={2}>2 ca</Option>
                <Option value={3}>3 ca</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16} className="mb-4">
          <Col span={12}>
            <Form.Item
              name="openTime1"
              label="Giờ mở cửa (Ca 1)"
              rules={[
                { required: true },
                { validator: (_, value) => validateOperatingHours(_, value, 'openTime1') }
              ]}
              validateTrigger={['onBlur', 'onChange']}
            >
              <TimePicker format="HH:mm" className="w-full" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="closeTime1"
              label="Giờ đóng cửa (Ca 1)"
              rules={[
                { required: true },
                { validator: (_, value) => validateOperatingHours(_, value, 'closeTime1') }
              ]}
              validateTrigger={['onBlur', 'onChange']}
            >
              <TimePicker format="HH:mm" className="w-full" />
            </Form.Item>
          </Col>
        </Row>
        
        {numberOfShifts >= 2 && (
          <Row gutter={16} className="mb-4">
            <Col span={12}>
              <Form.Item
                name="openTime2"
                label="Giờ mở cửa (Ca 2)"
                rules={[
                  { required: true },
                  { validator: (_, value) => validateOperatingHours(_, value, 'openTime2') }
                ]}
                validateTrigger={['onBlur', 'onChange']}
              >
                <TimePicker format="HH:mm" className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="closeTime2"
                label="Giờ đóng cửa (Ca 2)"
                rules={[
                  { required: true },
                  { validator: (_, value) => validateOperatingHours(_, value, 'closeTime2') }
                ]}
                validateTrigger={['onBlur', 'onChange']}
              >
                <TimePicker format="HH:mm" className="w-full" />
              </Form.Item>
            </Col>
          </Row>
        )}
        
        {numberOfShifts >= 3 && (
          <Row gutter={16} className="mb-4">
            <Col span={12}>
              <Form.Item
                name="openTime3"
                label="Giờ mở cửa (Ca 3)"
                rules={[
                  { required: true },
                  { validator: (_, value) => validateOperatingHours(_, value, 'openTime3') }
                ]}
                validateTrigger={['onBlur', 'onChange']}
              >
                <TimePicker format="HH:mm" className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="closeTime3"
                label="Giờ đóng cửa (Ca 3)"
                rules={[
                  { required: true },
                  { validator: (_, value) => validateOperatingHours(_, value, 'closeTime3') }
                ]}
                validateTrigger={['onBlur', 'onChange']}
              >
                <TimePicker format="HH:mm" className="w-full" />
              </Form.Item>
            </Col>
          </Row>
        )}
        
        <Title level={5} className="mt-4">Địa chỉ</Title>
        
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="provinceCode"
              label="Tỉnh/Thành phố"
              rules={[{ required: true }]}
              validateTrigger={['onBlur', 'onChange']}
            >
              <Select 
                placeholder="Chọn tỉnh/thành phố"
                onChange={handleProvinceChange}
                loading={loading}
              >
                {provinces.map(province => (
                  <Option key={province.code} value={province.code.toString()}>
                    {province.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              name="districtCode"
              label="Quận/Huyện"
              rules={[{ required: true }]}
              validateTrigger={['onBlur', 'onChange']}
            >
              <Select 
                placeholder="Chọn quận/huyện"
                onChange={handleDistrictChange}
                loading={loading}
                disabled={!form.getFieldValue('provinceCode')}
              >
                {districts.map(district => (
                  <Option key={district.code} value={district.code.toString()}>
                    {district.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              name="wardCode"
              label="Phường/Xã"
              rules={[{ required: true }]}
              validateTrigger={['onBlur', 'onChange']}
            >
              <Select 
                placeholder="Chọn phường/xã" 
                loading={loading}
                disabled={!form.getFieldValue('districtCode')}
              >
                {wards.map(ward => (
                  <Option key={ward.code} value={ward.code.toString()}>
                    {ward.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="detailAddress"
              label="Địa chỉ chi tiết"
              rules={[{ required: true }]}
              validateTrigger={['onBlur', 'onChange']}
            >
              <Input placeholder="Số nhà, tên đường..." />
            </Form.Item>
          </Col>
        </Row>
        
        {/* Preview full address if all components are selected */}
        {form.getFieldValue('provinceCode') && 
         form.getFieldValue('districtCode') && 
         form.getFieldValue('wardCode') && 
         form.getFieldValue('detailAddress') && (
          <Alert
            message="Địa chỉ đầy đủ"
            description={
              <div>
                {form.getFieldValue('detailAddress')}, 
                {wards.find(w => w.code.toString() === form.getFieldValue('wardCode'))?.name || ''}, 
                {districts.find(d => d.code.toString() === form.getFieldValue('districtCode'))?.name || ''}, 
                {provinces.find(p => p.code.toString() === form.getFieldValue('provinceCode'))?.name || ''}
              </div>
            }
            type="info"
            showIcon
            className="mb-6"
          />
        )}
        
        {/* Remove handleSubmit from form submission */}
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ display: 'none' }}>
            Submit
          </Button>
        </Form.Item>
      </Form>
      
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 flex-col">
          <Spin size="large" />
          <div className="mt-3 text-white">Đang tải dữ liệu...</div>
        </div>
      )}
    </div>
  );
});

export default BasicInfoForm; 