import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { PlaymateFormData } from '@/types/playmate.type';
import { createPlaymateSearch } from '@/services/playmate.service';
import { sportService } from '@/services/sport.service';
// import { facilityService } from '@/services/facility.service';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  TimePicker,
  Radio,
  InputNumber,
  Card,
  Typography,
  Row,
  Col,
  message,
  Breadcrumb,
  Space,
  Checkbox,
  Upload,
  Divider,
  Modal
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  TeamOutlined,
  UserOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import locale from 'antd/es/date-picker/locale/vi_VN';
import { RadioChangeEvent } from 'antd/lib/radio';
import type { ValidateErrorEntity } from 'rc-field-form/lib/interface';
import dayjs from 'dayjs';
import type { UploadFile } from 'antd/es/upload/interface';

// Định nghĩa interface cho Sport và Facility
interface Sport {
  id: number;
  name: string;
}

interface Facility {
  id: string;
  name: string;
}

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Interface cho response từ API
interface PlaymateSearchResponse {
  id: number;
  [key: string]: unknown;
}

// Extend PlaymateFormData với các trường cần thiết cho form
interface PlaymateFormValues extends Omit<PlaymateFormData, 'date' | 'startTime' | 'endTime' | 'applicationDeadline'> {
  date: dayjs.Dayjs;
  timeRange: [dayjs.Dayjs, dayjs.Dayjs];
  applicationDeadline?: dayjs.Dayjs;
}

const PlaymateCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<PlaymateFormValues>();
  const [sports, setSports] = useState<Sport[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [costType, setCostType] = useState<PlaymateFormData['costType']>('PER_PERSON');
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmModalVisible, setConfirmModalVisible] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<PlaymateFormValues | null>(null);
  

  useEffect(() => {
    // Fetch sports and facilities list
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch sports data
        const sportsData = await sportService.getSport();
        setSports(sportsData || []);
        
        // Mock facilities data - replace with actual API call if available
        // const facilitiesData = await facilityService.getFacilitiesDropdown();
        setFacilities([
          { id: 'facility1', name: 'Sân vận động ABC' },
          { id: 'facility2', name: 'Trung tâm thể thao XYZ' },
          { id: 'facility3', name: 'Sân bóng 123' },
        ]);
      
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể lấy dữ liệu. Đang sử dụng dữ liệu mẫu.');
        
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleCostTypeChange = (e: RadioChangeEvent) => {
    setCostType(e.target.value as PlaymateFormData['costType']);
  };

  const handleSubmit = (values: PlaymateFormValues) => {
    setFormValues(values);
    setConfirmModalVisible(true);
  };

  const handleConfirmSubmit = async () => {
    if (!formValues) return;
    
    setSubmitting(true);
    setConfirmModalVisible(false);
    
    try {
      // Chuẩn bị dữ liệu theo cấu trúc PlaymateFormData
      const playmateFormData: PlaymateFormData = {
        title: formValues.title,
        description: formValues.description,
        image: formValues.image,
        sportId: formValues.sportId,
        facilityId: formValues.facilityId,
        date: formValues.date.format('YYYY-MM-DD'),
        startTime: formValues.timeRange[0].format('HH:mm'),
        endTime: formValues.timeRange[1].format('HH:mm'),
        location: formValues.location,
        applicationDeadline: formValues.applicationDeadline?.format('YYYY-MM-DD HH:mm'),
        price: formValues.price,
        costMale: formValues.costMale,
        costFemale: formValues.costFemale,
        costType: formValues.costType,
        costDetails: formValues.costDetails,
        searchType: formValues.searchType,
        requiredParticipants: formValues.requiredParticipants,
        maximumParticipants: formValues.maximumParticipants,
        genderPreference: formValues.genderPreference,
        requiredSkillLevel: formValues.requiredSkillLevel,
        communicationDescription: formValues.communicationDescription
      };
      
      // Tạo bài đăng
      const response = await createPlaymateSearch(playmateFormData);
      const newSearch = response as unknown as PlaymateSearchResponse;
      message.success('Đã tạo bài đăng tìm bạn chơi thành công!');
      navigate(`/user/playmate/${newSearch.id}`);
    } catch (error) {
      console.error('Error creating playmate search:', error);
      message.error('Có lỗi xảy ra khi tạo bài đăng. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubmit = () => {
    setConfirmModalVisible(false);
  };

  const onFinishFailed = (errorInfo: ValidateErrorEntity<PlaymateFormValues>) => {
    message.error('Vui lòng kiểm tra lại thông tin đã nhập');
    console.log('Failed:', errorInfo);
  };

  const handleGoBack = () => {
    navigate('/user/playmate');
  };

  // Number parser for formatting currency fields
  const numberParser = (value: string | undefined): number => {
    if (!value) return 0;
    return Number(value.replace(/\s?|(,*)/g, ''));
  };

  // File upload normalization
  const normFile = (e: { fileList?: UploadFile[] }): UploadFile[] => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList || [];
  };

  return (
    <div className="w-full px-4 py-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4 md:mb-6"
          items={[
            {
              title: <Link to="/">Trang chủ</Link>
            },
            {
              title: <Link to="/user/playmate">Tìm bạn chơi</Link>
            },
            {
              title: 'Tạo mới'
            }
          ]}
        />

        <Row gutter={[16, 16]}>
          <Col span={24}>            
            <Card className="shadow-md playmate-inner-card">
              <Title level={2} className="mb-6 text-xl md:text-2xl">Tạo bài đăng tìm bạn chơi</Title>
              <Text type="secondary" className="block mb-6">
                Điền đầy đủ thông tin bên dưới để tạo bài đăng tìm bạn chơi. Thông tin chi tiết sẽ giúp bạn tìm được người phù hợp.
              </Text>
              
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onFinishFailed={onFinishFailed}
                requiredMark="optional"
                scrollToFirstError
                disabled={loading}
                className="playmate-form"
                initialValues={{
                  title: '',
                  sportId: undefined,
                  facilityId: undefined,
                  costType: 'PER_PERSON',
                  searchType: 'INDIVIDUAL',
                  requiredParticipants: 0,
                  genderPreference: 'ANY',
                  requiredSkillLevel: ['BEGINNER'],
                  date: undefined,
                  timeRange: [undefined, undefined],
                  applicationDeadline: undefined
                }}
              >
                <Card 
                  title={
                    <span>
                      <InfoCircleOutlined className="mr-2" />
                      Thông tin cơ bản
                    </span>
                  } 
                  className="mb-6 border border-gray-200 rounded-lg playmate-inner-card"
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={16}>
                      <Form.Item
                        label="Tiêu đề"
                        name="title"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                      >
                        <Input placeholder="Nhập tiêu đề cho bài đăng của bạn" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Môn thể thao"
                        name="sportId"
                        rules={[{ required: true, message: 'Vui lòng chọn môn thể thao!' }]}
                      >
                        <Select placeholder="Chọn môn thể thao" loading={loading}>
                          {sports.map(sport => (
                            <Option key={sport.id} value={sport.id}>{sport.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Hình ảnh minh họa"
                    name="image"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                  >
                    <Upload listType="picture" beforeUpload={() => false} maxCount={5}>
                      <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
                    </Upload>
                  </Form.Item>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Cơ sở thể thao"
                        name="facilityId"
                        rules={[{ required: true, message: 'Vui lòng chọn cơ sở thể thao!' }]}
                      >
                        <Select placeholder="Chọn cơ sở thể thao" loading={loading}>
                          {facilities.map(facility => (
                            <Option key={facility.id} value={facility.id}>{facility.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Địa điểm cụ thể"
                        name="location"
                        tooltip="Nhập địa chỉ cụ thể hoặc mô tả vị trí"
                      >
                        <Input 
                          prefix={<EnvironmentOutlined className="text-gray-400" />}
                          placeholder="Nhập địa điểm (VD: Sân số 3, Khu A)" 
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Ngày"
                        name="date"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
                      >
                        <DatePicker 
                          locale={locale} 
                          format="DD/MM/YYYY" 
                          className="w-full" 
                          placeholder="Chọn ngày" 
                          suffixIcon={<CalendarOutlined />}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Thời gian"
                        name="timeRange"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
                      >
                        <TimePicker.RangePicker 
                          format="HH:mm" 
                          className="w-full" 
                          placeholder={['Từ', 'Đến']} 
                          suffixIcon={<ClockCircleOutlined />}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Hạn đăng ký"
                        name="applicationDeadline"
                        tooltip="Thời hạn cuối để người khác đăng ký tham gia"
                      >
                        <DatePicker 
                          locale={locale} 
                          format="DD/MM/YYYY HH:mm" 
                          className="w-full" 
                          placeholder="Chọn hạn đăng ký" 
                          showTime={{ format: 'HH:mm' }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Mô tả"
                    name="description"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                  >
                    <TextArea 
                      rows={4} 
                      placeholder="Mô tả chi tiết về buổi chơi thể thao (kĩ năng yêu cầu, dụng cụ cần mang theo...)" 
                    />
                  </Form.Item>
                  
                  <Form.Item
                    label="Thông tin liên hệ"
                    name="communicationDescription"
                  >
                    <TextArea 
                      rows={2} 
                      placeholder="Phương thức liên lạc (ví dụ: Sẽ lập nhóm Zalo, Liên hệ qua số điện thoại...)" 
                    />
                  </Form.Item>
                </Card>

                <Card 
                  title={
                    <span>
                      <DollarOutlined className="mr-2" />
                      Chi phí
                    </span>
                  } 
                  className="mb-6 border border-gray-200 rounded-lg playmate-inner-card"
                >
                  <Form.Item
                    label="Loại chi phí"
                    name="costType"
                    rules={[{ required: true, message: 'Vui lòng chọn loại chi phí!' }]}
                  >
                    <Radio.Group onChange={handleCostTypeChange}>
                      <Space direction="vertical">
                        <Radio value="PER_PERSON">Tính trên đầu người</Radio>
                        <Radio value="TOTAL">Tổng chi phí</Radio>
                        <Radio value="FREE">Miễn phí</Radio>
                        <Radio value="GENDER_BASED">Theo giới tính</Radio>
                      </Space>
                    </Radio.Group>
                  </Form.Item>
                
                  {(costType === 'PER_PERSON' || costType === 'TOTAL') && (
                    <Form.Item
                      label="Chi phí dự kiến"
                      name="price"
                      rules={[{ required: costType === 'PER_PERSON' || costType === 'TOTAL', message: 'Vui lòng nhập chi phí!' }]}
                    >
                      <InputNumber 
                        min={0} 
                        step={1000} 
                        className="w-full" 
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={numberParser}
                        placeholder="Nhập chi phí" 
                        prefix={<DollarOutlined />}
                        addonAfter="VND"
                      />
                    </Form.Item>
                  )}
                  
                  {costType === 'GENDER_BASED' && (
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Chi phí cho Nam"
                          name="costMale"
                          rules={[{ required: costType === 'GENDER_BASED', message: 'Vui lòng nhập chi phí!' }]}
                        >
                          <InputNumber 
                            min={0} 
                            step={1000} 
                            className="w-full" 
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={numberParser}
                            placeholder="Nhập chi phí cho nam" 
                            prefix={<DollarOutlined />}
                            addonAfter="VND"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Chi phí cho Nữ"
                          name="costFemale"
                          rules={[{ required: costType === 'GENDER_BASED', message: 'Vui lòng nhập chi phí!' }]}
                        >
                          <InputNumber 
                            min={0} 
                            step={1000} 
                            className="w-full" 
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={numberParser}
                            placeholder="Nhập chi phí cho nữ" 
                            prefix={<DollarOutlined />}
                            addonAfter="VND"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}
                  
                  <Form.Item
                    label="Chi tiết chi phí"
                    name="costDetails"
                  >
                    <TextArea 
                      rows={2} 
                      placeholder="Chi tiết về chi phí (ví dụ: phí thuê sân, nước uống, trang phục...)" 
                    />
                  </Form.Item>
                </Card>

                <Card 
                  title={
                    <span>
                      <TeamOutlined className="mr-2" />
                      Thông tin tìm kiếm
                    </span>
                  } 
                  className="mb-6 border border-gray-200 rounded-lg playmate-inner-card"
                >
                  <Form.Item
                    label="Loại tìm kiếm"
                    name="searchType"
                    rules={[{ required: true, message: 'Vui lòng chọn loại tìm kiếm!' }]}
                  >
                    <Radio.Group buttonStyle="solid">
                      <Radio.Button value="INDIVIDUAL">Tìm cá nhân</Radio.Button>
                      <Radio.Button value="GROUP">Tìm đội/nhóm</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Số người/đội cần thiết"
                        name="requiredParticipants"
                        rules={[{ required: true, message: 'Vui lòng nhập số người/đội cần thiết!' }]}
                      >
                        <InputNumber 
                          min={1} 
                          max={50} 
                          className="w-full" 
                          placeholder="Số người/đội cần thiết"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Số người/đội tối đa"
                        name="maximumParticipants"
                        tooltip="Để trống nếu không giới hạn"
                      >
                        <InputNumber 
                          min={1} 
                          max={100} 
                          className="w-full" 
                          placeholder="Số người tối đa (nếu có)"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                <Card 
                  title={
                    <span>
                      <UserOutlined className="mr-2" />
                      Yêu cầu người tham gia
                    </span>
                  } 
                  className="mb-6 border border-gray-200 rounded-lg playmate-inner-card"
                >
                  <Form.Item
                    label="Giới tính"
                    name="genderPreference"
                    rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                  >
                    <Select placeholder="Chọn giới tính">
                      <Option value="ANY">Không giới hạn</Option>
                      <Option value="MALE">Nam</Option>
                      <Option value="FEMALE">Nữ</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    label="Trình độ yêu cầu"
                    name="requiredSkillLevel"
                    rules={[{ required: true, message: 'Vui lòng chọn trình độ yêu cầu!' }]}
                  >
                    <Checkbox.Group>
                      <Row gutter={[8, 8]}>
                        <Col xs={12} md={8}>
                          <Checkbox value="BEGINNER">Mới bắt đầu</Checkbox>
                        </Col>
                        <Col xs={12} md={8}>
                          <Checkbox value="INTERMEDIATE">Trung cấp</Checkbox>
                        </Col>
                        <Col xs={12} md={8}>
                          <Checkbox value="ADVANCED">Nâng cao</Checkbox>
                        </Col>
                        <Col xs={12} md={8}>
                          <Checkbox value="PROFESSIONAL">Chuyên nghiệp</Checkbox>
                        </Col>
                        <Col xs={12} md={8}>
                          <Checkbox value="ANY">Không giới hạn</Checkbox>
                        </Col>
                      </Row>
                    </Checkbox.Group>
                  </Form.Item>
                </Card>

                <Divider />

                <Form.Item className="text-center">
                  <Space size="middle">
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<PlusOutlined />} 
                      loading={submitting}
                      size="large"
                      className="min-w-[150px]"
                    >
                      Tạo bài đăng
                    </Button>
                    <Button 
                      onClick={handleGoBack} 
                      size="large"
                    >
                      Hủy
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* Modal xác nhận tạo bài đăng */}
      <Modal
        title={
          <div className="flex items-center">
            <ExclamationCircleOutlined className="text-yellow-500 mr-2 text-xl" />
            <span>Xác nhận tạo bài đăng</span>
          </div>
        }
        open={confirmModalVisible}
        onOk={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ 
          icon: <CheckCircleOutlined />,
          loading: submitting 
        }}
        centered
      >
        <p>Bạn có chắc chắn muốn tạo bài đăng tìm bạn chơi này không?</p>
        <p>Sau khi tạo, bài đăng sẽ được hiển thị công khai và người dùng khác có thể đăng ký tham gia.</p>
      </Modal>
      
      {/* Add custom styling for form */}
      <style>{`
        .playmate-form .ant-form-item-label > label {
          font-weight: 500;
        }
        .playmate-form .ant-card-head-title {
          font-weight: 600;
        }
        .playmate-form .ant-input-number-group-wrapper {
          width: 100%;
        }
        /* Fix cho vấn đề nhảy lên xuống khi hover */
        .playmate-inner-card.ant-card:hover {
          transform: none !important;
          box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 
                      0 3px 6px 0 rgba(0, 0, 0, 0.12), 
                      0 5px 12px 4px rgba(0, 0, 0, 0.09);
          transition: box-shadow 0.3s ease;
        }
        .playmate-inner-card .ant-card-body {
          padding: 20px !important;
          height: auto !important;
          min-height: 0 !important;
        }
        .playmate-card .ant-card-body {
          padding: 24px !important;
          height: auto !important;
          overflow: visible !important;
        }
        /* Responsive container adjustments */
        @media (min-width: 1280px) {
          .max-w-7xl {
            max-width: 1280px;
          }
        }
        @media (min-width: 1536px) {
          .max-w-7xl {
            max-width: 1400px;
          }
        }
      `}</style>
    </div>
  );
};

// Export component
export default PlaymateCreate; 