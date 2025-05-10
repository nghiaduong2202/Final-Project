import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Card, Avatar, Button, Tabs, Form, Upload, Input,
  Select, message, DatePicker, Row, Col, Spin, Tag, Alert, Divider
} from 'antd';
import {
  UserOutlined, EditOutlined, ManOutlined, WomanOutlined,
  CalendarOutlined, MailOutlined, PhoneOutlined, BankOutlined,
  UploadOutlined, HeartOutlined, CloseOutlined, WalletOutlined
} from '@ant-design/icons';
import moment from 'moment';
import type { Moment } from 'moment';
import type { TabsProps } from 'antd';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { login } from '@/store/slices/userSlice';
import { authService } from '@/services/auth.service';
import { UpdateInfo } from '@/types/user.type';
import _ from 'lodash';
import locale from 'antd/es/date-picker/locale/vi_VN';

const { Title, Text } = Typography;
const { Option } = Select;

// Định nghĩa interface cho form
interface ProfileFormValues {
  name: string;
  email: string;
  phoneNumber: string;
  gender?: 'male' | 'female' | 'other';
  dob?: Moment; 
  bankAccount?: string;
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.user);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [initialValues, setInitialValues] = useState<ProfileFormValues | null>(null);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
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
      <div className="max-w-4xl mx-auto px-4 py-8">
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
      return <Tag color="#f50">Chủ Sân</Tag>;
    } else {
      return <Tag color="#108ee9">Người Chơi</Tag>;
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

  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Update the tabItems to include a new tab for favorite facilities
  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span>
          <UserOutlined className="mr-1" /> Thông Tin Cá Nhân
        </span>
      ),
      children: (
        <div className="py-5">
          <Row gutter={[32, 24]}>
            <Col xs={24} md={8}>
              <div className="mb-6">
                <Text type="secondary">Họ và Tên</Text>
                <div className="mt-1">
                  <UserOutlined className="mr-2 text-gray-500" />
                  <Text strong>{user.name}</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="mb-6">
                <Text type="secondary">Giới Tính</Text>
                <div className="mt-1">
                  {user.gender === 'male' ? <ManOutlined className="mr-2 text-gray-500" /> : 
                    user.gender === 'female' ? <WomanOutlined className="mr-2 text-gray-500" /> : 
                    <UserOutlined className="mr-2 text-gray-500" />}
                  <Text strong>{translateGender(user.gender)}</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="mb-6">
                <Text type="secondary">Ngày Sinh</Text>
                <div className="mt-1">
                  <CalendarOutlined className="mr-2 text-gray-500" />
                  <Text strong>{user.dob ? formatDate(user.dob) : 'Chưa cập nhật'}</Text>
                </div>
              </div>
            </Col>
            {/* <Col xs={24} md={8}>
              <div className="mb-6">
                <Text type="secondary">Vai Trò</Text>
                <div className="mt-1 flex items-center">
                  <span className="mr-2">{getRoleDisplay()}</span>
                </div>
              </div>
            </Col> */}
            {user.role === 'player' && (
              <Col xs={24}>
                <div className="mt-4">
                  <Button 
                    type="primary" 
                    icon={<HeartOutlined />} 
                    onClick={() => navigate('/user/favorite')}
                  >
                    Xem danh sách sân yêu thích
                  </Button>
                </div>
              </Col>
            )}
          </Row>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <MailOutlined className="mr-1" /> Thông Tin Liên Hệ
        </span>
      ),
      children: (
        <div className="py-5">
          <Row gutter={[32, 24]}>
            <Col xs={24} md={12}>
              <div className="mb-6">
                <Text type="secondary">Email</Text>
                <div className="mt-1">
                  <MailOutlined className="mr-2 text-gray-500" />
                  <Text strong copyable>{user.email}</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="mb-6">
                <Text type="secondary">Số Điện Thoại</Text>
                <div className="mt-1">
                  <PhoneOutlined className="mr-2 text-gray-500" />
                  <Text strong>{user.phoneNumber || 'Chưa cập nhật'}</Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <BankOutlined className="mr-1" /> Thông Tin Tài Khoản
        </span>
      ),
      children: (
        <div className="py-5">
          <Row gutter={[32, 24]}>
            <Col xs={24} md={12}>
              <div className="mb-6">
                <Text type="secondary">Tài Khoản Ngân Hàng</Text>
                <div className="mt-1">
                  <BankOutlined className="mr-2 text-gray-500" />
                  <Text strong>{user.bankAccount || 'Chưa cập nhật'}</Text>
                </div>
              </div>
            </Col>
            {user.role === 'player' && (
              <Col xs={24} md={12}>
                <div className="mb-6">
                  <Text type="secondary">Điểm Tích Lũy</Text>
                  <div className="mt-1">
                    <WalletOutlined className="mr-2 text-green-500" />
                    <Text strong className="text-green-600">{user.refundedPoint || 0} điểm</Text>
                    <div className="mt-1 text-xs text-gray-500">
                      Tương đương: {formatCurrency(user.refundedPoint * 1000)}
                      <span className="ml-1">(1 điểm = 1.000 VNĐ)</span>
                    </div>
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </div>
      ),
    }
  ];

  // Function to render profile view with tabs
  const ProfileView = () => (
    <div>
      <Card>
        <div className="flex flex-col md:flex-row md:items-end mb-6">
          {/* Khối avatar và thông tin cá nhân */}
          <div className="flex flex-col md:flex-row md:items-end flex-grow">
            {/* Avatar */}
            <div className="relative mb-4 md:mb-0">
              <Avatar
                src={user.avatarUrl}
                icon={!user.avatarUrl && <UserOutlined />}
                size={90}
                style={{ border: '1px solid #f0f0f0' }}
              />
              <Upload
                showUploadList={false}
                beforeUpload={beforeUpload}
                accept="image/*"
              >
                <Button 
                  size="small"
                  icon={<UploadOutlined />}
                  className="absolute bottom-0 right-0"
                  loading={uploadLoading}
                />
              </Upload>
            </div>
            
            {/* Thông tin người dùng */}
            <div className="md:ml-6 text-center md:text-left md:self-end">
              <div className="flex items-center justify-center md:justify-start">
                <Title level={3} className="m-0" style={{ marginBottom: '0' }}>{user.name}</Title>
                <div className="ml-3">{getRoleDisplay()}</div>
              </div>
              <Text type="secondary">{user.email}</Text>
            </div>
          </div>
          
          {/* Nút chỉnh sửa */}
          <div className="w-full md:w-auto flex justify-center md:justify-end mt-4 md:mt-0 md:self-end">
            <Button 
              type="primary" 
              onClick={startEditing} 
              icon={<EditOutlined />}
            >
              Chỉnh Sửa Thông Tin
            </Button>
          </div>
        </div>
        
        <Divider />
        
        <Tabs 
          items={tabItems} 
          defaultActiveKey="1" 
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      </Card>
    </div>
  );

  // Function to render edit form
  const EditProfileForm = () => (
    <Card
      title="Chỉnh Sửa Thông Tin Cá Nhân"
      extra={
        <Button 
          onClick={cancelEditing}
          icon={<CloseOutlined />}
        >
          Hủy
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <div className="text-center mb-6">
          <Avatar
            src={user.avatarUrl}
            icon={!user.avatarUrl && <UserOutlined />}
            size={100}
            style={{ marginBottom: '16px' }}
          />
          <div>
            <Upload
              name="avatar"
              showUploadList={false}
              beforeUpload={beforeUpload}
              accept="image/*"
            >
              <Button 
                icon={<UploadOutlined />} 
                loading={uploadLoading}
              >
                Thay đổi ảnh
              </Button>
            </Upload>
          </div>
        </div>
        
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Họ và Tên"
              rules={[
                { required: true, message: 'Vui lòng nhập họ và tên' },
                { min: 2, message: 'Tên phải có ít nhất 2 ký tự' }
              ]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="phoneNumber"
              label="Số Điện Thoại"
              rules={[
                { pattern: /^[0-9]+$/, message: 'Số điện thoại chỉ bao gồm các chữ số' }
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
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
              <DatePicker 
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
                locale={locale}
                placeholder="Chọn ngày sinh"
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="bankAccount"
              label="Tài Khoản Ngân Hàng"
            >
              <Input placeholder="Nhập số tài khoản ngân hàng" />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item className="text-right mt-4">
          <Button onClick={cancelEditing} className="mr-3">
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={submitLoading}>
            Lưu Thay Đổi
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {isEditing ? <EditProfileForm /> : <ProfileView />}
      </div>
    </div>
  );
};

export default UserProfile;