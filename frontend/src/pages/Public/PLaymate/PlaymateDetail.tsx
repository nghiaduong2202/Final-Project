import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlaymateSearch, SkillLevel } from '@/types/playmate.type';
import { getPlaymateSearchById, createApplication } from '@/services/playmate.service';
import moment from 'moment';

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
  Result
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  TeamOutlined,
  MoneyCollectOutlined,
  TrophyOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Interface cho form đăng ký
interface ApplicationFormValues {
  skillLevel?: SkillLevel;
  message?: string;
}

const PlaymateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [playmateSearch, setPlaymateSearch] = useState<PlaymateSearch | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // Mock: Thông tin người dùng hiện tại
  const currentUser = {
    id: 'user123',
    name: 'Nguyễn Văn A',
    avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
    gender: 'male',
    phoneNumber: '0987123456'
  };

  // Fetch playmate search data
  useEffect(() => {
    const fetchPlaymateSearch = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getPlaymateSearchById(Number(id));
        
        if (!data) {
          setError('Không tìm thấy bài đăng.');
          return;
        }
        
        setPlaymateSearch(data);
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
  const hasApplied = playmateSearch?.applications?.some(app => app.userId === currentUser.id);
  
  // Check if the search is created by current user
  const isOwner = playmateSearch?.userId === currentUser.id;
  
  // Check if the search is full
  const isFull = playmateSearch && 
    playmateSearch.currentParticipants !== undefined && 
    playmateSearch.maximumParticipants !== undefined && 
    playmateSearch.currentParticipants >= playmateSearch.maximumParticipants;

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
  const handleApply = async (values: ApplicationFormValues) => {
    if (!playmateSearch || !id) return;
    
    try {
      setSubmitting(true);
      
      const applicationData = {
        playmateSearchId: Number(id),
        userId: currentUser.id,
        userInfo: {
          name: currentUser.name,
          avatar: currentUser.avatar,
          gender: currentUser.gender,
          phoneNumber: currentUser.phoneNumber
        },
        skillLevel: values.skillLevel,
        message: values.message
      };
      
      await createApplication(applicationData);
      
      message.success('Đăng ký thành công!');
      setIsModalVisible(false);
      
      // Reload data to show updated application status
      const updatedData = await getPlaymateSearchById(Number(id));
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
    
    if (!playmateSearch.costType || playmateSearch.costType === 'FREE') {
      return <Tag color="success">Miễn phí</Tag>;
    }
    
    if (playmateSearch.costType === 'PER_PERSON' && playmateSearch.price) {
      return <Text>{playmateSearch.price.toLocaleString('vi-VN')}đ/người</Text>;
    }
    
    if (playmateSearch.costType === 'TOTAL' && playmateSearch.price) {
      return <Text>{playmateSearch.price.toLocaleString('vi-VN')}đ tổng</Text>;
    }
    
    if (playmateSearch.costType === 'GENDER_BASED') {
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
  // const formatDateTime = (date: string, time: string) => {
  //   const formattedDate = moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY');
  //   return `${formattedDate} ${time}`;
  // };
  
  // Get skill level display
  const getSkillLevelDisplay = (level: SkillLevel) => {
    switch (level) {
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
  
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item>
            <Link to="/user/dashboard">Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/user/playmate">Tìm bạn chơi</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Chi tiết</Breadcrumb.Item>
        </Breadcrumb>
        
        {/* Back button */}
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/user/playmate')}
          className="mb-4"
        >
          Quay lại
        </Button>
        
        {/* Header */}
        <Card className="mb-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={18}>
              <Space direction="vertical" size={8} className="w-full">
                {/* Title */}
                <Title level={3}>{playmateSearch.title}</Title>
                
                {/* Tags */}
                <Space wrap>
                  {playmateSearch.sportName && (
                    <Tag color="blue">{playmateSearch.sportName}</Tag>
                  )}
                  <Tag color={playmateSearch.playmateSearchType === 'INDIVIDUAL' ? 'green' : 'purple'}>
                    {playmateSearch.playmateSearchType === 'INDIVIDUAL' ? 'Cá nhân' : 'Nhóm'}
                  </Tag>
                  <Tag color="orange">
                    {getSkillLevelDisplay(playmateSearch.requiredSkillLevel)}
                  </Tag>
                  {!isActive && (
                    <Tag color="red">
                      {playmateSearch.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đã hủy'}
                    </Tag>
                  )}
                </Space>
              </Space>
            </Col>
            
            <Col xs={24} md={6} className="flex justify-end items-start">
              {!isOwner && isActive && (
                <Button 
                  type="primary" 
                  size="large"
                  onClick={showModal}
                  disabled={hasApplied || isFull || isFull === null}
                >
                  {hasApplied ? 'Đã đăng ký' : (isFull ? 'Đã đủ người' : 'Đăng ký tham gia')}
                </Button>
              )}
              {isOwner && (
                <Button 
                  type="primary" 
                  onClick={() => navigate(`/user/playmate/manage/${id}`)}
                >
                  Quản lý bài đăng
                </Button>
              )}
            </Col>
          </Row>
        </Card>
        
        {/* Main content */}
        <Row gutter={[16, 16]}>
          {/* Left column - details */}
          <Col xs={24} md={16}>
            <Card className="mb-4">
              <Space direction="vertical" size={16} className="w-full">
                {/* Time and location */}
                <Space direction="vertical" size={8} className="w-full">
                  <Space align="center">
                    <CalendarOutlined className="text-gray-500" />
                    <Text>{moment(playmateSearch.date).format('DD/MM/YYYY')}</Text>
                  </Space>
                  
                  <Space align="center">
                    <ClockCircleOutlined className="text-gray-500" />
                    <Text>{`${playmateSearch.startTime} - ${playmateSearch.endTime}`}</Text>
                  </Space>
                  
                  {playmateSearch.location && (
                    <Space align="center">
                      <EnvironmentOutlined className="text-gray-500" />
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
          
          {/* Right column - summary */}
          <Col xs={24} md={8}>
            {/* Creator info */}
            <Card className="mb-4">
              <Space direction="vertical" size={16} className="w-full">
                <Title level={5}>Người tạo</Title>
                <Space>
                  <Avatar 
                    size={64} 
                    src={playmateSearch.userInfo.avatar} 
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
            <Card className="mb-4">
              <Descriptions title="Thông tin chi tiết" column={1} bordered>
                <Descriptions.Item label="Số người cần thiết">
                  <Space>
                    <TeamOutlined />
                    <Text>{`${playmateSearch.currentParticipants || 1}/${playmateSearch.requiredParticipants}`}</Text>
                  </Space>
                </Descriptions.Item>
                
                {playmateSearch.maximumParticipants && (
                  <Descriptions.Item label="Số người tối đa">
                    <Space>
                      <TeamOutlined />
                      <Text>{playmateSearch.maximumParticipants}</Text>
                    </Space>
                  </Descriptions.Item>
                )}
                
                <Descriptions.Item label="Trình độ yêu cầu">
                  <Space>
                    <TrophyOutlined />
                    <Text>{getSkillLevelDisplay(playmateSearch.requiredSkillLevel)}</Text>
                  </Space>
                </Descriptions.Item>
                
                {playmateSearch.genderPreference && (
                  <Descriptions.Item label="Giới tính ưu tiên">
                    <Space>
                      <UserOutlined />
                      <Text>
                        {playmateSearch.genderPreference === 'MALE' ? 'Nam' : 
                         playmateSearch.genderPreference === 'FEMALE' ? 'Nữ' : 
                         'Không giới hạn'}
                      </Text>
                    </Space>
                  </Descriptions.Item>
                )}
                
                <Descriptions.Item label="Chi phí">
                  <Space>
                    <MoneyCollectOutlined />
                    {getCostDisplay()}
                  </Space>
                </Descriptions.Item>
                
                {playmateSearch.costDetails && (
                  <Descriptions.Item label="Chi tiết chi phí">
                    <Text>{playmateSearch.costDetails}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>
        </Row>
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
              <Option value="BEGINNER">Mới bắt đầu</Option>
              <Option value="INTERMEDIATE">Trung cấp</Option>
              <Option value="ADVANCED">Nâng cao</Option>
              <Option value="PROFESSIONAL">Chuyên nghiệp</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="message"
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
    </div>
  );
};

export default PlaymateDetail; 