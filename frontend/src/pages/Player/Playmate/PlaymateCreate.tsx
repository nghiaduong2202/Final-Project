import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { PlaymateFormData, BookingSlot } from '@/types/playmate.type';
import playmateService from '@/services/playmate.service';
import {getSportNameInVietnamese}  from '@/utils/translateSport';
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
  CheckCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TagOutlined
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
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedBookingSlot, setSelectedBookingSlot] = useState<BookingSlot | null>(null);

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
      
      // Add file to fileList with status 'done'
      const newFile: UploadFile = {
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: imageUrl,
        thumbUrl: imageUrl,
        size: file.size,
        type: file.type
      };
      
      setFileList(prev => [...prev, newFile]);
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
      await playmateService.createPlaymateSearch(playmateFormData);
      
      // Hiển thị thông báo thành công và chuyển hướng
      message.success('Đã tạo bài đăng tìm bạn chơi thành công!');
      
      // Chuyển hướng sau một khoảng thời gian để đảm bảo người dùng thấy thông báo
      setTimeout(() => {
        navigate(`/user/playmate/manage`);
      }, 500);
    } catch (error: unknown) {
      console.error('Error creating playmate search:', error);
      
      // Thêm thông tin chi tiết của lỗi
      let errorMessage = 'Có lỗi xảy ra khi tạo bài đăng. Vui lòng thử lại sau.';
      
      if (error && typeof error === 'object') {
        const err = error as { response?: { data?: { message?: string } }, message?: string };
        if (err.response?.data?.message) {
          errorMessage = `Lỗi: ${err.response.data.message}`;
        } else if (err.message) {
          errorMessage = `Lỗi: ${err.message}`;
        }
      }
      
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle file removal
  const handleRemove = (file: UploadFile) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
    
    // Also remove from uploadedImages
    if (file.url) {
      setUploadedImages(prev => prev.filter(url => url !== file.url));
    }
    return true;
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

  // Handle booking slot selection change
  const handleBookingSlotChange = (value: number) => {
    const selected = bookingSlots.find(slot => slot.id === value);
    setSelectedBookingSlot(selected || null);
  };

  // Render the booking slot select options
  const renderBookingSlotOptions = () => {
    return bookingSlots.map(slot => {
      const date = formatDate(slot.date);
      const time = `${slot.booking.startTime.substring(0, 5)} - ${slot.booking.endTime.substring(0, 5)}`;
      const facilityName = slot.field?.fieldGroup?.facility?.name || '';
      const sportName = slot.booking.sport?.name || '';
      
      return (
        <Option key={slot.id} value={slot.id}>
          {`${date} (${time}) - ${facilityName} - ${getSportNameInVietnamese(sportName)}`}
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
                requiredMark={false}
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
                        label={<span className="required-field">Tiêu đề</span>}
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
                  >
                    <Upload 
                      listType="picture-card" 
                      beforeUpload={handleUpload}
                      fileList={fileList}
                      onRemove={handleRemove}
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
                    label={<span className="required-field">Chọn lịch đặt sân</span>}
                    name="bookingSlotId"
                    rules={[{ required: true, message: 'Vui lòng chọn lịch đặt sân!' }]}
                  >
                    <Select 
                      placeholder="Chọn lịch đặt sân đã đặt trước" 
                      loading={loading}
                      showSearch
                      optionFilterProp="children"
                      onChange={handleBookingSlotChange}
                    >
                      {renderBookingSlotOptions()}
                    </Select>
                  </Form.Item>

                  {selectedBookingSlot && (
                    <Card className="mb-4 bg-gray-50">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center">
                          <CalendarOutlined className="mr-2 text-blue-500" />
                          <Text strong>Ngày: </Text>
                          <Text className="ml-2">{formatDate(selectedBookingSlot.date)}</Text>
                        </div>
                        <div className="flex items-center">
                          <ClockCircleOutlined className="mr-2 text-blue-500" />
                          <Text strong>Thời gian: </Text>
                          <Text className="ml-2">{`${selectedBookingSlot.booking.startTime.substring(0, 5)} - ${selectedBookingSlot.booking.endTime.substring(0, 5)}`}</Text>
                        </div>
                        <div className="flex items-center">
                          <TagOutlined className="mr-2 text-blue-500" />
                          <Text strong>Môn thể thao: </Text>
                          <Text className="ml-2 capitalize">{getSportNameInVietnamese(selectedBookingSlot.booking.sport?.name || '')}</Text>
                        </div>
                        {selectedBookingSlot.field?.name && (
                          <div className="flex items-center">
                            <InfoCircleOutlined className="mr-2 text-blue-500" />
                            <Text strong>Sân: </Text>
                            <Text className="ml-2">{selectedBookingSlot.field.name}</Text>
                          </div>
                        )}
                        {selectedBookingSlot.field?.fieldGroup?.facility?.name && (
                          <div className="flex items-center">
                            <InfoCircleOutlined className="mr-2 text-blue-500" />
                            <Text strong>Cơ sở: </Text>
                            <Text className="ml-2">{selectedBookingSlot.field.fieldGroup.facility.name}</Text>
                          </div>
                        )}
                        {selectedBookingSlot.field?.fieldGroup?.facility?.location && (
                          <div className="flex items-start">
                            <EnvironmentOutlined className="mr-2 text-blue-500 mt-1" />
                            <Text strong className="mr-2">Địa chỉ:</Text>
                            <Text>{selectedBookingSlot.field.fieldGroup.facility.location}</Text>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}

                  <Form.Item
                    label="Mô tả"
                    name="description"                    
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
                    label={<span className="required-field">Loại chi phí</span>}
                    name="costType"
                    rules={[{ required: true, message: 'Vui lòng chọn loại chi phí!' }]}
                  >
                    <Radio.Group onChange={handleCostTypeChange}>
                      <Space direction="vertical">                        
                        <Radio value="total">Tổng chi phí</Radio>
                        <Radio value="free">Miễn phí</Radio>
                        <Radio value="gender">Theo giới tính</Radio>
                      </Space>
                    </Radio.Group>
                  </Form.Item>                
                  
                  {(costType === 'total') && (
                    <Form.Item
                      label={<span className="required-field">Tổng chi phí</span>}
                      name="totalCost"
                      rules={[{ required: costType === 'total', message: 'Vui lòng nhập chi phí!' }]}
                    >
                      <InputNumber 
                        min={0} 
                        step={1000} 
                        className="w-full" 
                        formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                        parser={(value: string | undefined) => {
                          if (!value) return 0;
                          return Number(value.replace(/\./g, ''));
                        }}
                        placeholder="Nhập chi phí" 
                        prefix={<DollarOutlined />}
                        addonAfter="VND"
                      />
                    </Form.Item>
                  )}
                  
                  {costType === 'gender' && (
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={<span className="required-field">Chi phí cho Nam</span>}
                          name="maleCost"
                          rules={[{ required: costType === 'gender', message: 'Vui lòng nhập chi phí!' }]}
                        >
                          <InputNumber 
                            min={0} 
                            step={1000} 
                            className="w-full" 
                            formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                            parser={(value: string | undefined) => {
                              if (!value) return 0;
                              return Number(value.replace(/\./g, ''));
                            }}
                            placeholder="Nhập chi phí cho nam" 
                            prefix={<DollarOutlined />}
                            addonAfter="VND"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={<span className="required-field">Chi phí cho Nữ</span>}
                          name="femaleCost"
                          rules={[{ required: costType === 'gender', message: 'Vui lòng nhập chi phí!' }]}
                        >
                          <InputNumber 
                            min={0} 
                            step={1000} 
                            className="w-full" 
                            formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                            parser={(value: string | undefined) => {
                              if (!value) return 0;
                              return Number(value.replace(/\./g, ''));
                            }}
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
                        label={<span className="required-field">Số người/đội cần thiết</span>}
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
                    label={<span className="required-field">Giới tính</span>}
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
                    label={<span className="required-field">Trình độ yêu cầu tối thiểu</span>}
                    name="skillLevel"
                    rules={[{ required: true, message: 'Vui lòng chọn trình độ yêu cầu!' }]}
                  >
                    <Select placeholder="Chọn trình độ">
                      <Option value="any">Không giới hạn</Option>
                      <Option value="newbie">Mới bắt đầu</Option>
                      <Option value="intermediate">Trung cấp</Option>
                      <Option value="advance">Nâng cao</Option>
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
        /* Required field indicator */
        .required-field::before {
          content: '* ';
          color: #ff4d4f;
        }
      `}</style>
    </div>
  );
};

// Export component
export default PlaymateCreate; 