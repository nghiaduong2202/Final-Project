import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { PlaymateFormData, SkillLevel, PlaymateSearchType, GenderPreference, CostType, PlaymateSearch } from '@/types/playmate.type';
import { createPlaymateSearch } from '@/services/playmate.service';
import { sportService } from '@/services/sport.service';

// Định nghĩa interface cho Sport
interface Sport {
  id: number;
  name: string;
}

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
  Checkbox
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined
} from '@ant-design/icons';
import locale from 'antd/es/date-picker/locale/vi_VN';
import { RadioChangeEvent } from 'antd/lib/radio';
import type { ValidateErrorEntity } from 'rc-field-form/lib/interface';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Add moment type
import { Moment } from 'moment';

// Interface cho values của form
interface FormValues {
  title: string;
  sportId: number;
  facilityId: string;
  location?: string;
  date: Moment;
  timeRange: [Moment, Moment];
  description?: string;
  price?: number;
  costMale?: number;
  costFemale?: number;
  costType: CostType;
  costDetails?: string;
  searchType: PlaymateSearchType;
  requiredParticipants: number;
  maximumParticipants?: number;
  genderPreference: GenderPreference;
  requiredSkillLevel: SkillLevel[];
  communicationDescription?: string;
}

// Interface cho response từ API
interface PlaymateSearchResponse {
  id: number;
  [key: string]: unknown;
}

const PlaymateCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [sports, setSports] = useState<Sport[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [costType, setCostType] = useState<CostType>('PER_PERSON');

  useEffect(() => {
    // Fetch sports list
    const fetchSports = async () => {
      try {
        const data = await sportService.getSport();
        setSports(data || []);
      } catch (error) {
        console.error('Error fetching sports:', error);
        message.error('Không thể lấy danh sách môn thể thao');
        // Fallback to mock data if API fails
        setSports([
          { id: 1, name: 'Bóng đá' },
          { id: 2, name: 'Bóng rổ' },
          { id: 3, name: 'Cầu lông' },
          { id: 4, name: 'Tennis' },
          { id: 5, name: 'Yoga' },
          { id: 6, name: 'Golf' },
          { id: 7, name: 'Bơi lội' },
          { id: 8, name: 'Bóng chuyền' },
          { id: 9, name: 'Đạp xe' },
        ]);
      }
    };
    
    fetchSports();
  }, []);

  const handleCostTypeChange = (e: RadioChangeEvent) => {
    setCostType(e.target.value as CostType);
  };

  const onFinish = async (values: FormValues) => {
    setSubmitting(true);
    
    try {
      // Chuẩn bị dữ liệu theo cấu trúc PlaymateFormData
      const playmateFormData: PlaymateFormData = {
        title: values.title,
        description: values.description,
        sportId: values.sportId,
        facilityId: values.facilityId || 'default',  // Temporary, until facility selection is implemented
        date: values.date.format('YYYY-MM-DD'),
        startTime: values.timeRange[0].format('HH:mm'),
        endTime: values.timeRange[1].format('HH:mm'),
        location: values.location,
        price: values.price,
        costMale: values.costMale,
        costFemale: values.costFemale,
        costType: values.costType,
        costDetails: values.costDetails,
        searchType: values.searchType,
        requiredParticipants: values.requiredParticipants,
        maximumParticipants: values.maximumParticipants,
        genderPreference: values.genderPreference,
        requiredSkillLevel: values.requiredSkillLevel,
        communicationDescription: values.communicationDescription
      };
      
      // Tạo bài đăng
      const response = await createPlaymateSearch(playmateFormData as unknown as Omit<PlaymateSearch, "id" | "createdAt" | "updatedAt">);
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

  const onFinishFailed = (errorInfo: ValidateErrorEntity<FormValues>) => {
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

  return (
    <div className="w-full px-4 py-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4 md:mb-6">
          <Breadcrumb.Item>
            <Link to="/user/dashboard">Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/user/playmate">Tìm bạn chơi</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Tạo mới</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Button 
              onClick={handleGoBack} 
              icon={<ArrowLeftOutlined />} 
              className="mb-4"
            >
              Quay lại
            </Button>
            <Card className="shadow-md">
              <Title level={2} className="mb-6 text-xl md:text-2xl">Tạo bài đăng tìm bạn chơi</Title>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                requiredMark="optional"
                scrollToFirstError
              >
                <Card title="Thông tin cơ bản" className="mb-4 border border-gray-200">
                  <Row gutter={16}>
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
                        <Select placeholder="Chọn môn thể thao">
                          {sports.map(sport => (
                            <Option key={sport.id} value={sport.id}>{sport.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Địa điểm"
                    name="location"
                    rules={[{ required: true, message: 'Vui lòng nhập địa điểm!' }]}
                  >
                    <Input placeholder="Nhập địa điểm (VD: Sân bóng ABC, 123 Đường XYZ)" />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
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
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Thời gian"
                        name="timeRange"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
                      >
                        <TimePicker.RangePicker 
                          format="HH:mm" 
                          className="w-full" 
                          placeholder={['Từ', 'Đến']} 
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

                <Card title="Chi phí" className="mb-4 border border-gray-200">
                  <Form.Item
                    label="Loại chi phí"
                    name="costType"
                    initialValue="PER_PERSON"
                    rules={[{ required: true, message: 'Vui lòng chọn loại chi phí!' }]}
                  >
                    <Radio.Group onChange={handleCostTypeChange}>
                      <Radio value="PER_PERSON">Tính trên đầu người</Radio>
                      <Radio value="TOTAL">Tổng chi phí</Radio>
                      <Radio value="FREE">Miễn phí</Radio>
                      <Radio value="GENDER_BASED">Theo giới tính</Radio>
                    </Radio.Group>
                  </Form.Item>
                
                  {costType === 'PER_PERSON' || costType === 'TOTAL' ? (
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
                      />
                    </Form.Item>
                  ) : null}
                  
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

                <Card title="Thông tin tìm kiếm" className="mb-4 border border-gray-200">
                  <Form.Item
                    label="Loại tìm kiếm"
                    name="searchType"
                    initialValue="INDIVIDUAL"
                    rules={[{ required: true, message: 'Vui lòng chọn loại tìm kiếm!' }]}
                  >
                    <Radio.Group>
                      <Radio value="INDIVIDUAL">Tìm cá nhân</Radio>
                      <Radio value="GROUP">Tìm nhóm</Radio>
                    </Radio.Group>
                  </Form.Item>
                
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Số người cần thiết"
                        name="requiredParticipants"
                        initialValue={2}
                        rules={[{ required: true, message: 'Vui lòng nhập số người cần thiết!' }]}
                      >
                        <InputNumber 
                          min={1} 
                          max={50} 
                          className="w-full" 
                          placeholder="Số người cần thiết"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Số người tối đa"
                        name="maximumParticipants"
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

                <Card title="Yêu cầu người tham gia" className="mb-4 border border-gray-200">
                  <Form.Item
                    label="Giới tính"
                    name="genderPreference"
                    initialValue="ANY"
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
                    initialValue={['BEGINNER']}
                    rules={[{ required: true, message: 'Vui lòng chọn trình độ yêu cầu!' }]}
                  >
                    <Checkbox.Group>
                      <Row>
                        <Col span={8}>
                          <Checkbox value="BEGINNER">Mới bắt đầu</Checkbox>
                        </Col>
                        <Col span={8}>
                          <Checkbox value="INTERMEDIATE">Trung cấp</Checkbox>
                        </Col>
                        <Col span={8}>
                          <Checkbox value="ADVANCED">Nâng cao</Checkbox>
                        </Col>
                        <Col span={8}>
                          <Checkbox value="PROFESSIONAL">Chuyên nghiệp</Checkbox>
                        </Col>
                        <Col span={8}>
                          <Checkbox value="ANY">Không giới hạn</Checkbox>
                        </Col>
                      </Row>
                    </Checkbox.Group>
                  </Form.Item>
                </Card>

                <Form.Item>
                  <Space>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<PlusOutlined />} 
                      loading={submitting}
                      size="large"
                    >
                      Tạo bài đăng
                    </Button>
                    <Button onClick={handleGoBack} size="large">Hủy</Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PlaymateCreate; 