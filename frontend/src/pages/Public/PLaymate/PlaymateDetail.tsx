import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlaymateSearch, SkillLevel, PlaymateApplicationFormData } from '@/types/playmate.type';
import playmateService from '@/services/playmate.service';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Divider,
  Breadcrumb,
  Descriptions,
  Avatar,
  Modal,
  Form,
  Select,
  Input,
  message,
  Spin,
  Result,
  Image,
  Tabs
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  TeamOutlined,
  MoneyCollectOutlined,
  TrophyOutlined,
  ArrowLeftOutlined,
  ExpandOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PlaymateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const user = useSelector((state: RootState) => state.user.user);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [playmateSearch, setPlaymateSearch] = useState<PlaymateSearch | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [mainImage, setMainImage] = useState<string>('');

  // Fetch playmate search data
  useEffect(() => {
    const fetchPlaymateSearch = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await playmateService.getPlaymateSearchById(id);
        
        if (!data) {
          setError('Không tìm thấy bài đăng.');
          return;
        }
        
        setPlaymateSearch(data);
        
        // Set main image if available
        if (data.image && data.image.length > 0) {
          setMainImage(data.image[0]);
        }
      } catch (error) {
        console.error('Error fetching playmate search:', error);
        setError('Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaymateSearch();
  }, [id]);

  // Check if user has already applied
  const hasApplied = playmateSearch?.participants?.some(app => app.playerId === user?.id);
  
  // Check if the search is created by current user
  const isOwner = playmateSearch?.userId === user?.id;
  
  // Check if the search is full - count accepted participants plus creator
  const acceptedParticipants = playmateSearch?.participants ? 
    playmateSearch.participants.filter(p => p.status === 'accepted' || p.status === 'ACCEPTED').length : 0;
  
  const currentCount = 1 + acceptedParticipants; // +1 for the creator
  
  const isFull = playmateSearch && 
    playmateSearch.maximumParticipants !== undefined && 
    currentCount >= playmateSearch.maximumParticipants;

  // Check if the search is active
  const isActive = playmateSearch?.status === 'ACTIVE';
  
  // Show application modal
  const showModal = () => {
    setIsModalVisible(true);
  };
  
  // Close application modal
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };
  
  // Handle application form submission
  const handleApply = async (values: { skillLevel: string; note?: string }) => {
    if (!playmateSearch || !id || !user) return;
    
    try {
      setSubmitting(true);
      
      const applicationData: PlaymateApplicationFormData = {
        playmateId: id,
        skillLevel: values.skillLevel,
        note: values.note
      };
      
      await playmateService.createApplication(applicationData);
      
      message.success('Đăng ký thành công!');
      setIsModalVisible(false);
      
      // Reload data to show updated application status
      const updatedData = await playmateService.getPlaymateSearchById(id);
      setPlaymateSearch(updatedData || null);
    } catch (error) {
      console.error('Error applying to playmate search:', error);
      message.error('Đã có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Get cost display
  const getCostDisplay = () => {
    if (!playmateSearch) return null;
    
    const costType = playmateSearch.costType;
    
    if (!costType || costType === 'FREE' || costType === 'free') {
      return <Tag color="success">Miễn phí</Tag>;
    }
           
    if ((costType === 'TOTAL' || costType === 'total') && playmateSearch.price) {
      return <Text>{playmateSearch.price.toLocaleString('vi-VN')}đ tổng</Text>;
    }
    
    if (costType === 'GENDER_BASED' || costType === 'genderBased') {
      return (
        <Space direction="vertical" size={0}>
          {playmateSearch.costMale && (
            <Text>Nam: {playmateSearch.costMale.toLocaleString('vi-VN')}đ</Text>
          )}
          {playmateSearch.costFemale && (
            <Text>Nữ: {playmateSearch.costFemale.toLocaleString('vi-VN')}đ</Text>
          )}
        </Space>
      );
    }
    
    return null;
  };
  
  // Format date time
  const formatDate = (date: string) => {
    return moment(date).format('DD/MM/YYYY');
  };
  
  // Handle thumbnail click
  const handleImageClick = (image: string) => {
    setMainImage(image);
  };
  
  // Get skill level display
  const getSkillLevelDisplay = (level: SkillLevel) => {
    const levelUpper = level.toUpperCase() as SkillLevel;
    
    switch (levelUpper) {
      case 'BEGINNER':
        return 'Mới bắt đầu';
      case 'INTERMEDIATE':
        return 'Trung cấp';
      case 'ADVANCED':
        return 'Nâng cao';
      case 'PROFESSIONAL':
        return 'Chuyên nghiệp';
      case 'ANY':
        return 'Mọi trình độ';
      default:
        return level;
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }
  
  // Render error state
  if (error || !playmateSearch) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <Result
            status="404"
            title="Không tìm thấy bài đăng"
            subTitle={error || 'Bài đăng không tồn tại hoặc đã bị xóa.'}
            extra={
              <Button type="primary" onClick={() => navigate('/user/playmate')}>
                Quay lại danh sách
              </Button>
            }
          />
        </div>
      </div>
    );
  }
  
  // Tab items
  const tabItems = [
    {
      key: 'info',
      label: 'Thông tin chi tiết',
      children: (
        <div className="py-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Card className="mb-4 shadow-sm">
                <Space direction="vertical" size={16} className="w-full">
                  {/* Time and location */}
                  <Space direction="vertical" size={8} className="w-full">
                    <Space align="center">
                      <CalendarOutlined className="text-blue-600" />
                      <Text>{formatDate(playmateSearch.date)}</Text>
                    </Space>
                    
                    <Space align="center">
                      <ClockCircleOutlined className="text-blue-600" />
                      <Text>{`${playmateSearch.startTime} - ${playmateSearch.endTime}`}</Text>
                    </Space>
                    
                    {playmateSearch.location && (
                      <Space align="center">
                        <EnvironmentOutlined className="text-blue-600" />
                        <Text>{playmateSearch.location}</Text>
                      </Space>
                    )}
                  </Space>
                  
                  <Divider />
                  
                  {/* Description */}
                  <div>
                    <Title level={5}>Mô tả</Title>
                    <Paragraph>
                      {playmateSearch.description || 'Không có mô tả chi tiết.'}
                    </Paragraph>
                  </div>
                  
                  {playmateSearch.communicationDescription && (
                    <>
                      <Divider />
                      <div>
                        <Title level={5}>Thông tin liên hệ</Title>
                        <Paragraph>
                          {playmateSearch.communicationDescription}
                        </Paragraph>
                      </div>
                    </>
                  )}
                </Space>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              {/* Creator info */}
              <Card className="mb-4 shadow-sm">
                <Space direction="vertical" size={16} className="w-full">
                  <Title level={5}>Người tạo</Title>
                  <Space>
                    <Avatar 
                      size={64} 
                      src={playmateSearch.userInfo.avatar || playmateSearch.userInfo.avatarUrl} 
                      icon={<UserOutlined />} 
                    />
                    <Space direction="vertical" size={0}>
                      <Text strong>{playmateSearch.userInfo.name}</Text>
                      {playmateSearch.userInfo.phoneNumber && (
                        <Text>{playmateSearch.userInfo.phoneNumber}</Text>
                      )}
                    </Space>
                  </Space>
                </Space>
              </Card>
              
              {/* Details box */}
              <Card className="mb-4 shadow-sm">
                <Descriptions title="Thông tin chi tiết" column={1}>
                  <Descriptions.Item 
                    label={<span className="font-medium"><TeamOutlined className="mr-2" />Số người tham gia</span>}
                  >
                    {`${currentCount}/${playmateSearch.requiredParticipants}`}
                  </Descriptions.Item>
                  
                  {playmateSearch.maximumParticipants && (
                    <Descriptions.Item 
                      label={<span className="font-medium"><TeamOutlined className="mr-2" />Số người tối đa</span>}
                    >
                      {playmateSearch.maximumParticipants}
                    </Descriptions.Item>
                  )}
                  
                  <Descriptions.Item 
                    label={<span className="font-medium"><TrophyOutlined className="mr-2" />Trình độ yêu cầu</span>}
                  >
                    {getSkillLevelDisplay(playmateSearch.requiredSkillLevel)}
                  </Descriptions.Item>
                  
                  {playmateSearch.genderPreference && (
                    <Descriptions.Item 
                      label={<span className="font-medium"><UserOutlined className="mr-2" />Giới tính ưu tiên</span>}
                    >
                      {playmateSearch.genderPreference.toUpperCase() === 'MALE' ? 'Nam' : 
                       playmateSearch.genderPreference.toUpperCase() === 'FEMALE' ? 'Nữ' : 
                       'Không giới hạn'}
                    </Descriptions.Item>
                  )}
                  
                  <Descriptions.Item 
                    label={<span className="font-medium"><MoneyCollectOutlined className="mr-2" />Chi phí</span>}
                  >
                    {getCostDisplay()}
                  </Descriptions.Item>
                  
                  {playmateSearch.costDetails && (
                    <Descriptions.Item 
                      label={<span className="font-medium"><InfoCircleOutlined className="mr-2" />Chi tiết chi phí</span>}
                    >
                      {playmateSearch.costDetails}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'images',
      label: 'Hình ảnh',
      children: (
        <div className="py-4">
          {playmateSearch.image && playmateSearch.image.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {playmateSearch.image.map((img, index) => (
                <Image
                  key={index}
                  src={img}
                  alt={`${playmateSearch.title} - Hình ${index + 1}`}
                  className="rounded-lg object-cover h-48 w-full"
                  preview={{
                    src: img,
                    mask: <div className="flex items-center justify-center"><ExpandOutlined /> Xem ảnh lớn</div>,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Text type="secondary">Không có hình ảnh</Text>
            </div>
          )}
        </div>
      )
    }
  ];
  
  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Section 1: Breadcrumb, Title, Status, and Image */}
        <section className="mb-6 md:mb-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-3" items={[
            { title: <Link to="/">Trang chủ</Link> },
            { title: <Link to="/user/playmate">Tìm bạn chơi</Link> },
            { title: "Chi tiết" }
          ]} />
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
            <Title level={2} className="m-0 text-xl md:text-2xl lg:text-3xl">{playmateSearch.title}</Title>
            <div className="flex gap-2">
              <Tag color={isActive ? 'green' : 'red'}>
                {isActive ? 'Đang hoạt động' : 'Đã kết thúc'}
              </Tag>
              <Tag color={playmateSearch.playmateSearchType === 'INDIVIDUAL' ? 'blue' : 'purple'}>
                {playmateSearch.playmateSearchType === 'INDIVIDUAL' ? 'Cá nhân' : 'Nhóm'}
              </Tag>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main Image */}
              <div>
                <div className="relative w-full h-auto">
                  <Image
                    src={mainImage || (playmateSearch.image && playmateSearch.image.length > 0 ? 
                      playmateSearch.image[0] : 'https://via.placeholder.com/800x400?text=No+Image')}
                    alt={playmateSearch.title}
                    className="w-full rounded-lg"
                    style={{ 
                      height: 'auto', 
                      maxHeight: '400px', 
                      objectFit: 'cover' 
                    }}
                    preview={{
                      mask: <div className="flex items-center justify-center"><ExpandOutlined /> Xem ảnh lớn</div>,
                    }}
                  />
                </div>
                
                {/* Thumbnail Gallery */}
                {playmateSearch.image && playmateSearch.image.length > 1 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {playmateSearch.image.map((img, index) => (
                      <div 
                        key={index} 
                        className={`relative cursor-pointer border-2 rounded-lg overflow-hidden flex-shrink-0 
                          ${mainImage === img ? 'border-blue-500' : 'border-transparent'}`}
                        onClick={() => handleImageClick(img)}
                        style={{ width: '70px', height: '50px' }}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          preview={false}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Info Card */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="mb-4">
                  <Title level={4}>Thông tin chung</Title>
                  <Divider className="my-3" />
                  
                  <Descriptions column={1} className="mb-3">
                    <Descriptions.Item label={<span className="font-medium"><CalendarOutlined className="mr-2" />Ngày</span>}>
                      {formatDate(playmateSearch.date)}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label={<span className="font-medium"><ClockCircleOutlined className="mr-2" />Thời gian</span>}>
                      {`${playmateSearch.startTime} - ${playmateSearch.endTime}`}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label={<span className="font-medium"><EnvironmentOutlined className="mr-2" />Địa điểm</span>}>
                      {playmateSearch.location}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label={<span className="font-medium"><TeamOutlined className="mr-2" />Số người tham gia</span>}>
                      {`${currentCount}/${playmateSearch.requiredParticipants}`}
                      {playmateSearch.maximumParticipants && ` (tối đa ${playmateSearch.maximumParticipants})`}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label={<span className="font-medium"><TrophyOutlined className="mr-2" />Trình độ yêu cầu</span>}>
                      {getSkillLevelDisplay(playmateSearch.requiredSkillLevel)}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label={<span className="font-medium"><MoneyCollectOutlined className="mr-2" />Chi phí</span>}>
                      {getCostDisplay()}
                    </Descriptions.Item>
                  </Descriptions>
                  
                  <div className="flex gap-2 mt-6">
                    {!isOwner && isActive ? (
                      <Button 
                        type="primary" 
                        size="large"
                        onClick={showModal}
                        disabled={hasApplied || isFull || !isActive}
                      >
                        {hasApplied ? 'Đã đăng ký' : (isFull ? 'Đã đủ người' : 'Đăng ký tham gia')}
                      </Button>
                    ) : isOwner ? (
                      <Button 
                        type="primary" 
                        size="large"
                        onClick={() => navigate(`/user/playmate/manage/${id}`)}
                      >
                        Quản lý bài đăng
                      </Button>
                    ) : null}
                    
                    <Button 
                      type="default" 
                      size="large"
                      onClick={() => navigate('/user/playmate')}
                      icon={<ArrowLeftOutlined />}
                    >
                      Quay lại danh sách
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Section 2: Event Details */}
        <section className="mb-6">
          <Card>
            <Tabs 
              defaultActiveKey="info" 
              items={tabItems}
            />
          </Card>
        </section>
      </div>

      {/* Application Modal */}
      <Modal
        title="Đăng ký tham gia"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleApply}
          requiredMark={false}
        >
          <Form.Item
            name="skillLevel"
            label="Trình độ của bạn"
            rules={[{ required: true, message: 'Vui lòng chọn trình độ!' }]}
          >
            <Select placeholder="Chọn trình độ của bạn">
              <Option value="beginner">Mới bắt đầu</Option>
              <Option value="intermediate">Trung cấp</Option>
              <Option value="advanced">Nâng cao</Option>
              <Option value="professional">Chuyên nghiệp</Option>
              <Option value="any">Không xác định</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="note"
            label="Lời nhắn"
          >
            <TextArea
              rows={4}
              placeholder="Nhập lời nhắn cho người tạo (không bắt buộc)"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Đăng ký
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      <style>{`
        .ant-descriptions-item-label {
          font-weight: 500;
        }
        
        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #1890ff;
          font-weight: 500;
        }
        
        .ant-image {
          display: block;
        }
      `}</style>
    </div>
  );
};

export default PlaymateDetail; 