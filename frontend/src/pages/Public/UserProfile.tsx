import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHooks';
import { authService } from '@/services/auth.service';
import { UpdateInfo } from '@/types/user.type';
import { login } from '@/store/slices/userSlice';
import { 
  Card, Avatar, Typography, Divider, Row, Col, Spin, Alert, Button, Form, Input, 
  Select, DatePicker, message, Tabs, Upload, Tag, ConfigProvider, List, Empty, Tooltip, Rate
} from 'antd';
import type { TabsProps } from 'antd';
import { 
  UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, BankOutlined, 
  EditOutlined, SaveOutlined, CloseOutlined, UploadOutlined, ManOutlined, WomanOutlined,
  HeartOutlined, DeleteOutlined, EnvironmentOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import moment, { Moment } from 'moment';
import locale from 'antd/es/date-picker/locale/vi_VN';
import _ from 'lodash';

// Cấu hình moment để sử dụng tiếng Việt
moment.locale('vi');

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Định nghĩa kiểu dữ liệu cho form
interface ProfileFormValues {
  name: string;
  email: string;
  phoneNumber: string;
  gender?: 'male' | 'female' | 'other';
  dob?: Moment; 
  bankAccount?: string;
}

// Mock data cho sân yêu thích
const mockFavoriteFacilities = [
  {
    id: 'facility-1',
    name: 'Sân bóng đá mini TDT Arena',
    location: 'Quận 7, TP.HCM',
    rating: 4.8,
    image: 'https://placehold.co/300x200/orange/white?text=TDT+Arena',
    sports: ['Bóng đá', 'Futsal'],
    openTime: '07:00',
    closeTime: '22:00'
  },
  {
    id: 'facility-2',
    name: 'Sân bóng rổ Star Basketball Court',
    location: 'Quận 1, TP.HCM',
    rating: 4.5,
    image: 'https://placehold.co/300x200/blue/white?text=Star+Basketball',
    sports: ['Bóng rổ'],
    openTime: '06:00',
    closeTime: '21:00'
  },
  {
    id: 'facility-3',
    name: 'Sân cầu lông Thống Nhất',
    location: 'Quận 10, TP.HCM',
    rating: 4.2,
    image: 'https://placehold.co/300x200/green/white?text=Badminton+Court',
    sports: ['Cầu lông'],
    openTime: '08:00',
    closeTime: '23:00'
  }
];

const UserProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.user);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [initialValues, setInitialValues] = useState<ProfileFormValues | null>(null);

  // State for favorite facilities
  const [favoriteFacilities, setFavoriteFacilities] = useState(mockFavoriteFacilities);

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Initialize form with user data when editing starts
  const startEditing = () => {
    if (user) {
      const values: ProfileFormValues = {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        dob: user.dob ? moment(user.dob, 'YYYY-MM-DD') : undefined,
        bankAccount: user.bankAccount || '',
      };
      form.setFieldsValue(values);
      setInitialValues(values);
    }
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const onFinish = async (values: ProfileFormValues) => {
    setSubmitLoading(true);
    try {
      // Tạo Date object từ moment object nếu có
      const dobDate = values.dob ? new Date(values.dob.toDate()) : undefined;
      
      const formattedValues = {
        ...values,
        dob: dobDate, // Gửi trực tiếp Date object
      };
      
      // Chỉ gửi những trường đã thay đổi
      const changedValues: Partial<UpdateInfo> = {};
      
      if (initialValues) {
        // So sánh và lấy ra các trường đã thay đổi
        if (!_.isEqual(formattedValues.name, initialValues.name)) {
          changedValues.name = formattedValues.name;
        }
        
        if (!_.isEqual(formattedValues.email, initialValues.email)) {
          changedValues.email = formattedValues.email;
        }
        
        if (!_.isEqual(formattedValues.phoneNumber, initialValues.phoneNumber)) {
          changedValues.phoneNumber = formattedValues.phoneNumber;
        }
        
        if (!_.isEqual(formattedValues.gender, initialValues.gender)) {
          changedValues.gender = formattedValues.gender;
        }
        
        if (!_.isEqual(formattedValues.bankAccount, initialValues.bankAccount)) {
          changedValues.bankAccount = formattedValues.bankAccount;
        }
        
        // Xử lý riêng cho trường hợp dob
        const initialDobDate = initialValues.dob ? new Date(initialValues.dob.toDate()) : undefined;
        
        if (dobDate && (!initialDobDate || dobDate.getTime() !== initialDobDate.getTime())) {
          changedValues.dob = dobDate;
        }
      }

      // Gửi request và chờ kết quả
      if (Object.keys(changedValues).length > 0) {
        await authService.updateInfo(changedValues as UpdateInfo); // Đã cập nhật kiểu UpdateInfo hỗ trợ Date
        message.success('Cập nhật thông tin thành công');
      } else {
        message.info('Không có thông tin nào được thay đổi');
      }
      
      // Refresh user data
      dispatch(login({ email: '', password: '', fromToken: true }));
      setIsEditing(false);
    } catch (err) {
      message.error('Cập nhật thông tin thất bại. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      await authService.updateAvatar(formData);
      // Refresh user data
      dispatch(login({ email: '', password: '', fromToken: true }));
      message.success('Cập nhật ảnh đại diện thành công');
    } catch (err) {
      message.error('Cập nhật ảnh đại diện thất bại. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setUploadLoading(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Bạn chỉ có thể tải lên tệp hình ảnh!');
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Kích thước hình ảnh phải nhỏ hơn 2MB!');
      return Upload.LIST_IGNORE;
    }
    
    // Manually handle the upload
    handleAvatarUpload(file);
    return false; // Prevent auto upload
  };

  // Handle remove favorite facility
  const handleRemoveFavorite = (facilityId: string) => {
    // In real application, this would make an API call
    message.success('Đã xóa sân khỏi danh sách yêu thích');
    setFavoriteFacilities(prev => prev.filter(item => item.id !== facilityId));
  };

  // Handle view facility details
  const handleViewFacility = (facilityId: string) => {
    window.location.href = `/facility/${facilityId}`;
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert
          message="Lỗi Tải Thông Tin"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert
          message="Chưa Đăng Nhập"
          description="Vui lòng đăng nhập để xem thông tin cá nhân"
          type="warning"
          showIcon
        />
      </div>
    );
  }
  
  // Get role color and text
  const getRoleDisplay = () => {
    if (user.role === 'owner') {
      return <Tag color="#f50" style={{ fontSize: '14px', padding: '2px 10px' }}>Chủ Sân</Tag>;
    } else {
      return <Tag color="#108ee9" style={{ fontSize: '14px', padding: '2px 10px' }}>Người Chơi</Tag>;
    }
  };

  // Translate gender to Vietnamese
  const translateGender = (gender: string | undefined) => {
    if (!gender) return 'Chưa xác định';
    switch (gender.toLowerCase()) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      case 'other': return 'Khác';
      default: return 'Chưa xác định';
    }
  };

  // Update the tabItems to include a new tab for favorite facilities
  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: 'Thông Tin Cá Nhân',
      children: (
        <Row gutter={[24, 24]} style={{ marginTop: '16px' }}>
          <Col xs={24} sm={12}>
            <div className="info-item">
              <UserOutlined className="info-icon" />
              <div>
                <Text type="secondary" style={{ fontSize: '13px' }}>Họ và Tên</Text>
                <Paragraph strong style={{ margin: '4px 0 0', fontSize: '15px' }}>{user.name}</Paragraph>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div className="info-item">
              {user.gender === 'male' ? <ManOutlined className="info-icon" /> : 
                user.gender === 'female' ? <WomanOutlined className="info-icon" /> : 
                <UserOutlined className="info-icon" />}
              <div>
                <Text type="secondary" style={{ fontSize: '13px' }}>Giới Tính</Text>
                <Paragraph strong style={{ margin: '4px 0 0', fontSize: '15px' }}>
                  {translateGender(user.gender)}
                </Paragraph>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div className="info-item">
              <CalendarOutlined className="info-icon" />
              <div>
                <Text type="secondary" style={{ fontSize: '13px' }}>Ngày Sinh</Text>
                <Paragraph strong style={{ margin: '4px 0 0', fontSize: '15px' }}>
                  {user.dob ? formatDate(user.dob) : 'Chưa cập nhật'}
                </Paragraph>
              </div>
            </div>
          </Col>
        </Row>
      ),
    },
    {
      key: '2',
      label: 'Thông Tin Liên Hệ',
      children: (
        <Row gutter={[24, 24]} style={{ marginTop: '16px' }}>
          <Col xs={24} sm={12}>
            <div className="info-item">
              <MailOutlined className="info-icon" />
              <div>
                <Text type="secondary" style={{ fontSize: '13px' }}>Email</Text>
                <Paragraph strong style={{ margin: '4px 0 0', fontSize: '15px' }}>{user.email}</Paragraph>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div className="info-item">
              <PhoneOutlined className="info-icon" />
              <div>
                <Text type="secondary" style={{ fontSize: '13px' }}>Số Điện Thoại</Text>
                <Paragraph strong style={{ margin: '4px 0 0', fontSize: '15px' }}>
                  {user.phoneNumber || 'Chưa cập nhật'}
                </Paragraph>
              </div>
            </div>
          </Col>
        </Row>
      ),
    },
    {
      key: '3',
      label: 'Thông Tin Tài Khoản',
      children: (
        <Row gutter={[24, 24]} style={{ marginTop: '16px' }}>
          <Col xs={24} sm={12}>
            <div className="info-item">
              <BankOutlined className="info-icon" />
              <div>
                <Text type="secondary" style={{ fontSize: '13px' }}>Tài Khoản Ngân Hàng</Text>
                <Paragraph strong style={{ margin: '4px 0 0', fontSize: '15px' }}>
                  {user.bankAccount || 'Chưa cập nhật'}
                </Paragraph>
              </div>
            </div>
          </Col>
        </Row>
      ),
    },
    {
      key: '4',
      label: (
        <span>
          <HeartOutlined /> Sân Yêu Thích
        </span>
      ),
      children: (
        <div style={{ marginTop: '16px' }}>
          {favoriteFacilities.length > 0 ? (
            <List
              grid={{ 
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 2,
                lg: 3,
                xl: 3,
                xxl: 3,
              }}
              dataSource={favoriteFacilities}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    hoverable
                    cover={<img alt={item.name} src={item.image} style={{ height: 160, objectFit: 'cover' }} />}
                    actions={[
                      <Tooltip title="Xem chi tiết">
                        <Button type="text" icon={<EditOutlined />} onClick={() => handleViewFacility(item.id)} />
                      </Tooltip>,
                      <Tooltip title="Xóa khỏi yêu thích">
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />} 
                          onClick={() => handleRemoveFavorite(item.id)} 
                        />
                      </Tooltip>
                    ]}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 text-xs sm:text-sm">
                        <ClockCircleOutlined className="mr-1" />
                        {item.openTime} - {item.closeTime}
                      </span>
                      <div className="flex items-center">
                        <Rate disabled defaultValue={item.rating} className="text-xs" />
                        <span className="ml-1 text-gray-500 text-xs">
                          {item.rating}
                        </span>
                      </div>
                    </div>
                    <Card.Meta
                      title={item.name}
                      description={
                        <>
                          <div className="flex items-center mb-2">
                            <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                            <Text ellipsis style={{ fontSize: '12px' }}>{item.location}</Text>
                          </div>
                          <div>
                            {item.sports.map(sport => (
                              <Tag key={sport} color="blue" style={{ marginBottom: 5 }}>{sport}</Tag>
                            ))}
                          </div>
                        </>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <p>Bạn chưa có sân yêu thích nào</p>
                  <Button
                    type="primary"
                    icon={<HeartOutlined />}
                    onClick={() => window.location.href = '/result-search'}
                    style={{ marginTop: 16 }}
                  >
                    Tìm sân ngay
                  </Button>
                </div>
              }
            />
          )}
        </div>
      ),
    }
  ];

  // Profile view (not editing)
  const ProfileView = () => (
    <Card 
      className="profile-card"
      variant="outlined"
      style={{ 
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)', 
        borderRadius: '8px',
        marginBottom: '20px' 
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '24px',
        flexDirection: 'column',
        textAlign: 'center' 
      }}>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Avatar 
            size={120} 
            icon={<UserOutlined />} 
            src={user.avatarUrl} 
            style={{ 
              border: '4px solid #f0f0f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          />
          <Upload
            showUploadList={false}
            beforeUpload={beforeUpload}
            accept="image/*"
          >
            <Button
              icon={<UploadOutlined />}
              shape="circle"
              type="primary"
              size="small"
              loading={uploadLoading}
              style={{ 
                position: 'absolute', 
                bottom: 0, 
                right: 0, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            />
          </Upload>
        </div>
        <div>
          <Title level={3} style={{ margin: '8px 0', fontWeight: 600 }}>{user.name}</Title>
          <div style={{ marginTop: '5px' }}>{getRoleDisplay()}</div>
        </div>
      </div>
      
      <Divider style={{ margin: '16px 0' }} />
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        centered
        type="card"
        items={tabItems}
      />
      
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          onClick={startEditing}
          size="large"
          style={{ borderRadius: '4px' }}
        >
          Chỉnh Sửa Thông Tin
        </Button>
      </div>
    </Card>
  );

  // Edit profile form
  const EditProfileForm = () => (
    <Card 
      variant="outlined"
      style={{ 
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)', 
        borderRadius: '8px'
      }}
    >
      <Title level={4} style={{ marginBottom: '24px' }}>Chỉnh Sửa Thông Tin</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          gender: user.gender,
          dob: user.dob ? moment(user.dob) : undefined,
          bankAccount: user.bankAccount || '',
        }}
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Họ và Tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Vui lòng nhập email hợp lệ' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="phoneNumber"
              label="Số Điện Thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="gender"
              label="Giới Tính"
            >
              <Select placeholder="Chọn giới tính">
                <Option value="male">Nam</Option>
                <Option value="female">Nữ</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="dob"
              label="Ngày Sinh"
            >
              <ConfigProvider>
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                  locale={locale}
                  disabledDate={(current) => current && current > moment().endOf('day')}
                  allowClear={true}
                  inputReadOnly={true}
                  popupStyle={{ width: '300px' }}
                />
              </ConfigProvider>
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="bankAccount"
              label="Tài Khoản Ngân Hàng"
            >
              <Input prefix={<BankOutlined />} placeholder="Số tài khoản ngân hàng" />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item style={{ marginTop: '24px', textAlign: 'right' }}>
          <Button 
            onClick={cancelEditing} 
            style={{ marginRight: '10px' }}
            icon={<CloseOutlined />}
          >
            Hủy
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={submitLoading}
            icon={<SaveOutlined />}
          >
            Lưu Thay Đổi
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  return (
    <div className="profile-container" style={{ 
      padding: '30px 20px', 
      maxWidth: '900px', 
      margin: '0 auto',
      background: '#f9f9f9'
    }}>
      <style>
        {`
          .profile-container {
            background-color: #f9f9f9;
          }
          
          .profile-card {
            transition: all 0.3s ease;
          }
          
          .profile-card:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
          
          .info-item {
            display: flex;
            align-items: flex-start;
            background: #f9fafc;
            padding: 12px 16px;
            border-radius: 8px;
            height: 100%;
            transition: all 0.3s ease;
          }
          
          .info-item:hover {
            background: #f0f5ff;
          }
          
          .info-icon {
            font-size: 20px;
            margin-right: 12px;
            color: #1890ff;
            background: rgba(24, 144, 255, 0.1);
            padding: 8px;
            border-radius: 8px;
          }
        `}
      </style>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <Title level={2} style={{ margin: 0 }}>Thông Tin Cá Nhân</Title>
      </div>
      
      {isEditing ? <EditProfileForm /> : <ProfileView />}
    </div>
  );
};

export default UserProfile;