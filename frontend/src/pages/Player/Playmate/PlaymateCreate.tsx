import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { PlaymateFormData, BookingSlot } from '@/types/playmate.type';
import playmateService from '@/services/playmate.service';
import {
  Form,
  Input,
  Button,
  Select,
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
  Modal,
  Spin
} from 'antd';
import {
  PlusOutlined,
  DollarOutlined,
  TeamOutlined,
  UserOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { RadioChangeEvent } from 'antd/lib/radio';
import type { ValidateErrorEntity } from 'rc-field-form/lib/interface';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Extended PlaymateFormData for form
interface PlaymateFormValues extends PlaymateFormData {
  imagesFileList?: UploadFile[];
}

const PlaymateCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<PlaymateFormValues>();
  const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [costType, setCostType] = useState<string>('total');
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmModalVisible, setConfirmModalVisible] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<PlaymateFormValues | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  useEffect(() => {
    // Fetch booking slots
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch booking slots
        const bookingSlotsData = await playmateService.getBookingSlots();
        setBookingSlots(bookingSlotsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể lấy dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleCostTypeChange = (e: RadioChangeEvent) => {
    setCostType(e.target.value);
  };

  // Upload image handler
  const handleUpload = async (file: RcFile): Promise<boolean> => {
    try {
      setUploading(true);
      const imageUrl = await playmateService.uploadImage(file);
      setUploadedImages(prev => [...prev, imageUrl]);
      message.success('Tải ảnh lên thành công');
      return false; // prevent default upload behavior
    } catch (error) {
      console.error('Error uploading image:', error);
      message.error('Tải ảnh lên thất bại. Vui lòng thử lại sau.');
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (values: PlaymateFormValues) => {
    // Add uploaded images to the form values
    values.imagesUrl = uploadedImages;
    setFormValues(values);
    setConfirmModalVisible(true);
  };

  const handleConfirmSubmit = async () => {
    if (!formValues) return;
    
    setSubmitting(true);
    setConfirmModalVisible(false);
    
    try {
      // Prepare data for API
      const playmateFormData: PlaymateFormData = {
        title: formValues.title,
        bookingSlotId: formValues.bookingSlotId,
        description: formValues.description,
        imagesUrl: formValues.imagesUrl,
        additionalInfor: formValues.additionalInfor,
        costType: formValues.costType,
        totalCost: formValues.totalCost,
        maleCost: formValues.maleCost,
        femaleCost: formValues.femaleCost,
        detailOfCost: formValues.detailOfCost,
        isTeam: formValues.isTeam,
        minParticipant: formValues.minParticipant,
        maxParticipant: formValues.maxParticipant,
        genderPreference: formValues.genderPreference,
        skillLevel: formValues.skillLevel
      };
      
      // Create playmate search
      const response = await playmateService.createPlaymateSearch(playmateFormData);
      message.success('Đã tạo bài đăng tìm bạn chơi thành công!');
      navigate(`/user/playmate/${response.id}`);
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Number parser for formatting currency fields
  const numberParser = (value: string | undefined): number => {
    if (!value) return 0;
    return Number(value.replace(/\s?|(,*)/g, ''));
  };

  // Render the booking slot select options
  const renderBookingSlotOptions = () => {
    return bookingSlots.map(slot => {
      const date = formatDate(slot.date);
      const time = `${slot.booking.startTime.substring(0, 5)} - ${slot.booking.endTime.substring(0, 5)}`;
      
      return (
        <Option key={slot.id} value={slot.id}>
          {`${date} (${time})`}
        </Option>
      );
    });
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
                  bookingSlotId: undefined,
                  costType: 'total',
                  isTeam: false,
                  minParticipant: 2,
                  genderPreference: 'any',
                  skillLevel: 'any'
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
                    <Col xs={24}>
                      <Form.Item
                        label="Tiêu đề"
                        name="title"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                      >
                        <Input placeholder="Nhập tiêu đề cho bài đăng của bạn" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Hình ảnh minh họa"
                    name="imagesFileList"
                    valuePropName="fileList"
                  >
                    <Upload 
                      listType="picture-card" 
                      beforeUpload={handleUpload}
                      showUploadList={{
                        showPreviewIcon: true,
                        showRemoveIcon: true
                      }}
                    >
                      <div>
                        {uploading ? <Spin size="small" /> : <PlusOutlined />}
                        <div style={{ marginTop: 8 }}>Tải lên</div>
                      </div>
                    </Upload>
                  </Form.Item>

                  <Form.Item
                    label="Chọn lịch đặt sân"
                    name="bookingSlotId"
                    rules={[{ required: true, message: 'Vui lòng chọn lịch đặt sân!' }]}
                  >
                    <Select 
                      placeholder="Chọn lịch đặt sân đã đặt trước" 
                      loading={loading}
                      showSearch
                      optionFilterProp="children"
                    >
                      {renderBookingSlotOptions()}
                    </Select>
                  </Form.Item>

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
                    name="additionalInfor"
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
                        <Radio value="total">Tổng chi phí</Radio>
                        <Radio value="free">Miễn phí</Radio>
                        <Radio value="genderBased">Theo giới tính</Radio>
                      </Space>
                    </Radio.Group>
                  </Form.Item>
                
                  {(costType === 'perPerson') && (
                    <Form.Item
                      label="Chi phí dự kiến/người"
                      name="totalCost"
                      rules={[{ required: costType === 'perPerson', message: 'Vui lòng nhập chi phí!' }]}
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
                  
                  {(costType === 'total') && (
                    <Form.Item
                      label="Tổng chi phí"
                      name="totalCost"
                      rules={[{ required: costType === 'total', message: 'Vui lòng nhập chi phí!' }]}
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
                  
                  {costType === 'genderBased' && (
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Chi phí cho Nam"
                          name="maleCost"
                          rules={[{ required: costType === 'genderBased', message: 'Vui lòng nhập chi phí!' }]}
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
                          name="femaleCost"
                          rules={[{ required: costType === 'genderBased', message: 'Vui lòng nhập chi phí!' }]}
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
                    name="detailOfCost"
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
                    name="isTeam"
                    valuePropName="checked"
                  >
                    <Checkbox>Tìm nhóm (đánh dấu nếu bạn đang tìm một nhóm, để trống nếu tìm cá nhân)</Checkbox>
                  </Form.Item>
                
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Số người/đội cần thiết"
                        name="minParticipant"
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
                        name="maxParticipant"
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
                      <Option value="any">Không giới hạn</Option>
                      <Option value="male">Nam</Option>
                      <Option value="female">Nữ</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    label="Trình độ yêu cầu"
                    name="skillLevel"
                    rules={[{ required: true, message: 'Vui lòng chọn trình độ yêu cầu!' }]}
                  >
                    <Select placeholder="Chọn trình độ">
                      <Option value="any">Không giới hạn</Option>
                      <Option value="beginner">Mới bắt đầu</Option>
                      <Option value="intermediate">Trung cấp</Option>
                      <Option value="advanced">Nâng cao</Option>
                      <Option value="professional">Chuyên nghiệp</Option>
                    </Select>
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