import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
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
  Button,
  FormInstance
} from 'antd';
import { FacilityFormData, FacilityInfo, Province, District, Ward } from '@/types/facility.type';
import dayjs from 'dayjs';
import axios from 'axios';
import { facilityService } from '@/services/facility.service';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = TimePicker;

interface BasicInfoFormProps {
  formData: FacilityFormData;
  updateFormData: (data: Partial<FacilityFormData>) => void;
  allSports: { id: number; name: string }[];
  form?: FormInstance<BasicInfoFormValues>;
}

export interface BasicInfoFormRef {
  validateFields: () => Promise<BasicInfoFormValues>;
}

// Interface for form values
interface BasicInfoFormValues {
  name: string;
  description: string;
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

// Component con để hiển thị địa chỉ đầy đủ
const FullAddressDisplay: React.FC<{
  detailAddress?: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  provinces: Province[];
  districts: District[];
  wards: Ward[];
}> = ({ detailAddress, provinceCode, districtCode, wardCode, provinces, districts, wards }) => {
  // Tính toán địa chỉ đầy đủ
  const fullAddress = useMemo(() => {
    if (!provinceCode || !districtCode || !wardCode) return null;
    
    // Lấy thông tin tên tỉnh, huyện, xã
    let provinceName = '';
    let districtName = '';
    let wardName = '';
    
    const province = provinces.find(p => p.code?.toString() === provinceCode);
    if (province) provinceName = province.name;
    
    const district = districts.find(d => d.code?.toString() === districtCode);
    if (district) districtName = district.name;
    
    const ward = wards.find(w => w.code?.toString() === wardCode);
    if (ward) wardName = ward.name;
    
    // Nếu không có đủ thông tin, không hiển thị
    if (!provinceName || !districtName || !wardName) return null;
    
    // Tạo địa chỉ đầy đủ
    return detailAddress 
      ? `${detailAddress}, ${wardName}, ${districtName}, ${provinceName}`
      : `${wardName}, ${districtName}, ${provinceName}`;
  }, [detailAddress, provinceCode, districtCode, wardCode, provinces, districts, wards]);
  
  // Không hiển thị gì nếu không có đủ thông tin
  if (!fullAddress) return null;
  
  return (
    <Alert
      message="Địa chỉ đầy đủ"
      description={fullAddress}
      type="info"
      showIcon
      className=""
    />
  );
};

const BasicInfoForm = forwardRef<BasicInfoFormRef, BasicInfoFormProps>(({ 
  formData, 
  updateFormData,
  form: externalForm
}, ref) => {
  // Tạo form instance nội bộ, luôn gọi hook ở đây
  const [internalForm] = Form.useForm<BasicInfoFormValues>();
  // Xác định form nào sẽ được sử dụng
  const form = externalForm || internalForm;
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [visibleShifts, setVisibleShifts] = useState<number>(
    formData.facilityInfo?.numberOfShifts || 1
  );
  
  // Thêm debounce timer reference
  const submitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [shouldPreventSubmit, setShouldPreventSubmit] = useState(false);
  
  // Expose form methods to parent
  useImperativeHandle(ref, () => ({
    validateFields: async () => {
      try {
        const values = await form.validateFields();
        
        // Kiểm tra tên cơ sở đã tồn tại hay chưa
        const name = values.name;
        if (name) {
          try {
            const response = await facilityService.checkFacilityNameExists(name);
            if (response.exists) {
              form.setFields([
                {
                  name: 'name',
                  errors: ['Tên cơ sở đã tồn tại']
                }
              ]);
              return Promise.reject('Tên cơ sở đã tồn tại');
            }
          } catch (error) {
            console.error('Error checking facility name:', error);
            form.setFields([
              {
                name: 'name',
                errors: ['Không thể kiểm tra tên cơ sở. Vui lòng thử lại sau.']
              }
            ]);
            return Promise.reject('Không thể kiểm tra tên cơ sở');
          }
        }
        
        // Khi validate thành công, đồng thời cập nhật formData
        await submitFormData(values);
        return values;
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }));
  
  // Fetch provinces on mount - tải trước tất cả dữ liệu địa phương
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Fetch tất cả tỉnh thành
        const provinceResponse = await axios.get('https://provinces.open-api.vn/api/p');
        setProvinces(provinceResponse.data);
        
        // Nếu đã có provinceCode trong formData, fetch districts
        if (formData.facilityInfo?.provinceCode) {
          const districtResponse = await axios.get(`https://provinces.open-api.vn/api/p/${formData.facilityInfo.provinceCode}?depth=2`);
          setDistricts(districtResponse.data.districts);
          
          // Nếu đã có districtCode trong formData, fetch wards
          if (formData.facilityInfo?.districtCode) {
            const wardResponse = await axios.get(`https://provinces.open-api.vn/api/d/${formData.facilityInfo.districtCode}?depth=2`);
            setWards(wardResponse.data.wards);
          }
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);
  
  // Init form values from formData (khi component được tạo hoặc khi formData thay đổi) 
  useEffect(() => {
    // Khởi tạo initial values khi formData thay đổi
    if (formData.facilityInfo) {
      const { 
        name, 
        description, 
        openTime1, 
        closeTime1, 
        openTime2, 
        closeTime2, 
        openTime3, 
        closeTime3,
        provinceCode,
        districtCode,
        wardCode,
        detailAddress
      } = formData.facilityInfo;
      
      // Tạo object chứa các giá trị cần cập nhật
      const initialValues: Partial<BasicInfoFormValues> = { 
        name, 
        description,
        provinceCode,
        districtCode,
        wardCode,
        detailAddress
      };
      
      // Format thời gian từ string sang dayjs
      if (openTime1) initialValues.openTime1 = dayjs(openTime1, "HH:mm");
      if (closeTime1) initialValues.closeTime1 = dayjs(closeTime1, "HH:mm");
      if (openTime2) initialValues.openTime2 = dayjs(openTime2, "HH:mm");
      if (closeTime2) initialValues.closeTime2 = dayjs(closeTime2, "HH:mm");
      if (openTime3) initialValues.openTime3 = dayjs(openTime3, "HH:mm");
      if (closeTime3) initialValues.closeTime3 = dayjs(closeTime3, "HH:mm");
      
      // Cập nhật số ca làm việc
      let shifts = 1;
      if (openTime2 && closeTime2) shifts = openTime3 && closeTime3 ? 3 : 2;
      setVisibleShifts(shifts);
      
      // Set form values
      form.setFieldsValue(initialValues);           
    }
  }, [formData, form]);
  
  // Hàm prefetch districts khi province thay đổi
  const handleProvinceChange = async (value: string) => {
    try {
      setShouldPreventSubmit(true);
      const response = await axios.get(`https://provinces.open-api.vn/api/p/${value}?depth=2`);
      setDistricts(response.data.districts);
      setWards([]);
      form.setFieldsValue({ 
        districtCode: undefined,
        wardCode: undefined
      });
      setTimeout(() => setShouldPreventSubmit(false), 100);
    } catch (error) {
      console.error('Error fetching districts:', error);
      setShouldPreventSubmit(false);
    }
  };
  
  // Hàm prefetch wards khi district thay đổi
  const handleDistrictChange = async (value: string) => {
    try {
      setShouldPreventSubmit(true);
      const response = await axios.get(`https://provinces.open-api.vn/api/d/${value}?depth=2`);
      setWards(response.data.wards);
      form.setFieldsValue({ 
        wardCode: undefined
      });
      setTimeout(() => setShouldPreventSubmit(false), 100);
    } catch (error) {
      console.error('Error fetching wards:', error);
      setShouldPreventSubmit(false);
    }
  };
  
  // Hàm riêng cho việc submit form data
  const submitFormData = async (values: BasicInfoFormValues) => {
    if (shouldPreventSubmit) return;
    
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
      
      // Tạo địa chỉ đầy đủ (bắt buộc phải có giá trị)
      const detailAddress = values.detailAddress || '';
      
      // Tạo địa chỉ đầy đủ - đảm bảo location luôn có giá trị khi có đủ thông tin địa chỉ
      let fullLocation = '';
      if (provinceName && districtName && wardName) {
        if (detailAddress) {
          fullLocation = `${detailAddress}, ${wardName}, ${districtName}, ${provinceName}`;
        } else {
          fullLocation = `${wardName}, ${districtName}, ${provinceName}`;
        }
      }
      
      // Lấy thông tin hiện tại từ formData để tránh mất dữ liệu
      const currentInfo = formData.facilityInfo || {};
      
      // Format facility info
      const facilityInfo: FacilityInfo = {
        // Giữ nguyên các giá trị cũ nếu không có giá trị mới
        name: values.name || currentInfo.name || '',
        description: values.description || currentInfo.description || '',
        numberOfShifts: visibleShifts,
        city: provinceName,
        provinceCode: values.provinceCode,
        district: districtName,
        districtCode: values.districtCode,
        ward: wardName,
        wardCode: values.wardCode,
        // Đảm bảo location luôn có giá trị
        location: fullLocation || currentInfo.location || '',
        // Thêm detailAddress vào facilityInfo để lưu lại
        detailAddress: detailAddress,
        openTime1: values.openTime1 ? values.openTime1.format('HH:mm') : currentInfo.openTime1 || '',
        closeTime1: values.closeTime1 ? values.closeTime1.format('HH:mm') : currentInfo.closeTime1 || '',
        openTime2: (visibleShifts >= 2 && values.openTime2) ? values.openTime2.format('HH:mm') : currentInfo.openTime2 || '',
        closeTime2: (visibleShifts >= 2 && values.closeTime2) ? values.closeTime2.format('HH:mm') : currentInfo.closeTime2 || '',
        openTime3: (visibleShifts >= 3 && values.openTime3) ? values.openTime3.format('HH:mm') : currentInfo.openTime3 || '',
        closeTime3: (visibleShifts >= 3 && values.closeTime3) ? values.closeTime3.format('HH:mm') : currentInfo.closeTime3 || ''
      };
      
      // Log chi tiết về địa chỉ được tạo
      console.log("Thông tin địa chỉ từ Basic Info Form:", {
        detailAddress,
        fullLocation,
        provinceName,
        districtName,
        wardName,
        finalLocation: facilityInfo.location, // Giá trị location cuối cùng được sử dụng
        provinceCode: values.provinceCode,
        districtCode: values.districtCode,
        wardCode: values.wardCode,
      });
      
      // Update form data with new facility info
      updateFormData({ facilityInfo });
     
    } catch (error) {
      console.error('Error processing form submission:', error);
    }
  };
  
  // Theo dõi thay đổi form và tự động lưu với debounce
  const handleFormValuesChange = (_changedValues: Partial<BasicInfoFormValues>, allValues: BasicInfoFormValues) => {
    // Không cập nhật nếu đang trong trạng thái ngăn submit
    if (shouldPreventSubmit) return;
    
    // Kiểm tra nếu đang thay đổi khung giờ hoặc tên cơ sở, không gọi submitFormData
    const timeFieldChanged = _changedValues.openTime1 !== undefined || 
                            _changedValues.closeTime1 !== undefined ||
                            _changedValues.openTime2 !== undefined || 
                            _changedValues.closeTime2 !== undefined ||
                            _changedValues.openTime3 !== undefined || 
                            _changedValues.closeTime3 !== undefined;
                            
    const nameOrDescChanged = _changedValues.name !== undefined || 
                              _changedValues.description !== undefined;
    
    // Không cập nhật nếu đang thay đổi tên hoặc mô tả (sẽ cập nhật khi Tiếp Theo)
    if (nameOrDescChanged || timeFieldChanged) {
      return;
    }
    
    // Chỉ theo dõi các thay đổi liên quan đến địa chỉ để cập nhật sớm
    if (_changedValues.provinceCode || _changedValues.districtCode || 
        _changedValues.wardCode || _changedValues.detailAddress) {
      
      // Cập nhật ngay lập tức nếu thay đổi các trường liên quan đến địa chỉ
      if (allValues.provinceCode && allValues.districtCode && allValues.wardCode) {
        // Hủy timer trước đó nếu có
        if (submitTimerRef.current) {
          clearTimeout(submitTimerRef.current);
          submitTimerRef.current = null;
        }
        
        // Cập nhật ngay lập tức
        submitFormData(allValues);
      }
    }
  };
  
  // Xử lý khi thay đổi timeRange - đảm bảo khung giờ được cập nhật đúng
  const handleTimeRangeChange = (index: number, times: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (!times) return;
    
    const [start, end] = times;
    if (!start || !end) return;

    // Dựa vào index để xác định ca nào đang được thay đổi
    if (index === 1) {
      form.setFieldsValue({
        openTime1: start,
        closeTime1: end
      });
    } else if (index === 2) {
      form.setFieldsValue({
        openTime2: start,
        closeTime2: end
      });
      
      // Đảm bảo visibleShifts >= 2 khi có dữ liệu ca 2
      if (visibleShifts < 2) {
        setVisibleShifts(2);
      }
    } else if (index === 3) {
      form.setFieldsValue({
        openTime3: start,
        closeTime3: end
      });
      
      // Đảm bảo visibleShifts = 3 khi có dữ liệu ca 3
      if (visibleShifts < 3) {
        setVisibleShifts(3);
      }
    }
    
    // KHÔNG gọi submitFormData tại đây để tránh việc reset các khung giờ
    // Dữ liệu sẽ được cập nhật khi nhấn nút Tiếp theo
  };
  
  // Tiện ích để lấy giá trị timeRange từ open/close time
  const getTimeRange = (shiftIndex: number): [dayjs.Dayjs | null, dayjs.Dayjs | null] | undefined => {
    const values = form.getFieldsValue();
    
    if (shiftIndex === 1 && values.openTime1 && values.closeTime1) {
      return [values.openTime1, values.closeTime1];
    } else if (shiftIndex === 2 && values.openTime2 && values.closeTime2) {
      return [values.openTime2, values.closeTime2];  
    } else if (shiftIndex === 3 && values.openTime3 && values.closeTime3) {
      return [values.openTime3, values.closeTime3];
    }
    
    return undefined;
  };
  
  // Thêm ca làm việc tiếp theo
  const addShift = () => {
    if (visibleShifts < 3) {
      // Tăng số ca hiển thị mà không gọi submitFormData
      setVisibleShifts(visibleShifts + 1);
      
      // Lưu vào localStorage để phòng trường hợp state bị reset
      try {
        localStorage.setItem('visibleShifts', (visibleShifts + 1).toString());
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
  };
  
  // Xóa ca làm việc
  const removeShift = (shiftNumber: number) => {
    if (shiftNumber === 2) {
      // Xóa ca 2
      form.setFieldsValue({
        openTime2: null,
        closeTime2: null,
        openTime3: null,
        closeTime3: null
      });
      setVisibleShifts(1);
    } else if (shiftNumber === 3) {
      // Xóa ca 3
      form.setFieldsValue({
        openTime3: null,
        closeTime3: null
      });
      setVisibleShifts(2);
    }
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
        onFinish={submitFormData}
        name="basicInfoForm"
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
                { required: true }
              ]}
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
        
        <Row className="mb-2">
          <Col span={24}>
            <div className="flex items-center">
              <Text>Số ca trong ngày: {visibleShifts}</Text>
            </div>
          </Col>
        </Row>
        
        {/* Ca 1 - luôn hiển thị */}
        <Row gutter={16} className="mb-4">
          <Col span={24}>
            <Form.Item
              label={<span className="font-medium">Khung giờ hoạt động (Ca 1)</span>}
              required
              className="mb-1"
            >
              <div className="flex items-center">
                <Form.Item
                  name="timeRange1"
                  className="mb-0 flex-grow"
                  rules={[
                    { 
                      validator: async (_, value) => {
                        if (!value || !value[0] || !value[1]) {
                          return Promise.reject('Vui lòng chọn giờ hoạt động');
                        }
                        const openTime = value[0];
                        const closeTime = value[1];
                        if (openTime.isAfter(closeTime)) {
                          return Promise.reject('Giờ đóng cửa phải sau giờ mở cửa');
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                  getValueProps={() => {
                    return { value: getTimeRange(1) };
                  }}
                >
                  <RangePicker
                    format="HH:mm"
                    className="w-full"
                    placeholder={['Giờ mở cửa', 'Giờ đóng cửa']}
                    minuteStep={30}
                    onChange={(times) => handleTimeRangeChange(1, times as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                  />
                </Form.Item>
                
                {/* Hidden fields to store values for API compatibility */}
                <Form.Item name="openTime1" hidden>
                  <Input />
                </Form.Item>
                <Form.Item name="closeTime1" hidden>
                  <Input />
                </Form.Item>
              </div>
            </Form.Item>
          </Col>
        </Row>
        
        {/* Ca 2 - hiển thị khi visibleShifts >= 2 */}
        {visibleShifts >= 2 && (
          <Row gutter={16} className="mb-4">
            <Col span={23}>
              <Form.Item
                label={<span className="font-medium">Khung giờ hoạt động (Ca 2)</span>}
                required
                className="mb-1"
              >
                <div className="flex items-center">
                  <Form.Item
                    name="timeRange2"
                    className="mb-0 flex-grow"
                    rules={[
                      { 
                        validator: async (_, value) => {
                          if (!value || !value[0] || !value[1]) {
                            return Promise.reject('Vui lòng chọn giờ hoạt động');
                          }
                          const values = form.getFieldsValue();
                          const closeTime1 = values.closeTime1;
                          const openTime = value[0];
                          const closeTime = value[1];
                          
                          if (closeTime1 && openTime.isBefore(closeTime1)) {
                            return Promise.reject('Giờ mở cửa ca 2 phải sau giờ đóng cửa ca 1');
                          }
                          if (openTime.isAfter(closeTime)) {
                            return Promise.reject('Giờ đóng cửa phải sau giờ mở cửa');
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                    getValueProps={() => {
                      return { value: getTimeRange(2) };
                    }}
                  >
                    <RangePicker
                      format="HH:mm"
                      className="w-full"
                      placeholder={['Giờ mở cửa', 'Giờ đóng cửa']}
                      minuteStep={30}
                      onChange={(times) => handleTimeRangeChange(2, times as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                    />
                  </Form.Item>
                  
                  {/* Hidden fields to store values for API compatibility */}
                  <Form.Item name="openTime2" hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item name="closeTime2" hidden>
                    <Input />
                  </Form.Item>
                </div>
              </Form.Item>
            </Col>
            <Col span={1} className="flex items-center mt-8">
              <Button 
                type="text" 
                danger 
                icon={<MinusCircleOutlined />} 
                onClick={() => removeShift(2)}
              />
            </Col>
          </Row>
        )}
        
        {/* Ca 3 - hiển thị khi visibleShifts >= 3 */}
        {visibleShifts >= 3 && (
          <Row gutter={16} className="mb-4">
            <Col span={23}>
              <Form.Item
                label={<span className="font-medium">Khung giờ hoạt động (Ca 3)</span>}
                required
                className="mb-1"
              >
                <div className="flex items-center">
                  <Form.Item
                    name="timeRange3"
                    className="mb-0 flex-grow"
                    rules={[
                      { 
                        validator: async (_, value) => {
                          if (!value || !value[0] || !value[1]) {
                            return Promise.reject('Vui lòng chọn giờ hoạt động');
                          }
                          const values = form.getFieldsValue();
                          const closeTime2 = values.closeTime2;
                          const openTime = value[0];
                          const closeTime = value[1];
                          
                          if (closeTime2 && openTime.isBefore(closeTime2)) {
                            return Promise.reject('Giờ mở cửa ca 3 phải sau giờ đóng cửa ca 2');
                          }
                          if (openTime.isAfter(closeTime)) {
                            return Promise.reject('Giờ đóng cửa phải sau giờ mở cửa');
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                    getValueProps={() => {
                      return { value: getTimeRange(3) };
                    }}
                  >
                    <RangePicker
                      format="HH:mm"
                      className="w-full"
                      placeholder={['Giờ mở cửa', 'Giờ đóng cửa']}
                      minuteStep={30}
                      onChange={(times) => handleTimeRangeChange(3, times as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                    />
                  </Form.Item>
                  
                  {/* Hidden fields to store values for API compatibility */}
                  <Form.Item name="openTime3" hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item name="closeTime3" hidden>
                    <Input />
                  </Form.Item>
                </div>
              </Form.Item>
            </Col>
            <Col span={1} className="flex items-center mt-8">
              <Button 
                type="text" 
                danger 
                icon={<MinusCircleOutlined />} 
                onClick={() => removeShift(3)}
              />
            </Col>
          </Row>
        )}
        
        {/* Button thêm ca - đặt sau ca cuối cùng */}
        {visibleShifts < 3 && (
          <Row className="mb-4">
            <Col span={24}>
              <Button 
                type="dashed" 
                onClick={addShift} 
                icon={<PlusOutlined />}
                className="w-full"
              >
                Thêm khung giờ hoạt động
              </Button>
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
            >
              <Input placeholder="Số nhà, tên đường..." />
            </Form.Item>
          </Col>
        </Row>
        
        {/* Sử dụng component con để hiển thị địa chỉ đầy đủ */}
        <FullAddressDisplay
          detailAddress={form.getFieldValue('detailAddress')}
          provinceCode={form.getFieldValue('provinceCode')}
          districtCode={form.getFieldValue('districtCode')}
          wardCode={form.getFieldValue('wardCode')}
          provinces={provinces}
          districts={districts}
          wards={wards}          
        />
        
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