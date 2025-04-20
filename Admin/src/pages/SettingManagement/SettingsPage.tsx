import React, { useState } from 'react';
import { Tabs, Form, Input, Button, Upload, message, Select, Card, Avatar } from 'antd';
import type { UploadChangeParam, UploadFile } from 'antd/es/upload/interface';
import { UserOutlined, LockOutlined, UploadOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/hooks/reduxHooks';
import { sportService, SportData } from '@/services/sport.service';

const { TabPane } = Tabs;
const { Option } = Select;

const SettingsPage: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [sportForm] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatar);
  const [loading, setLoading] = useState(false);
  const [sportLoading, setSportLoading] = useState(false);

  const handleProfileSubmit = async () => {
    try {
      setLoading(true);
      // Mock API call for now
      // await apiClient.put('/admin/profile', values);
      
      setTimeout(() => {
        setLoading(false);
        message.success('Thông tin cá nhân đã được cập nhật');
      }, 1000);
    } catch {
      setLoading(false);
      message.error('Không thể cập nhật thông tin cá nhân');
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      setLoading(true);
      // Mock API call for now
      // await apiClient.put('/admin/change-password', {
      //   currentPassword: values.currentPassword,
      //   newPassword: values.newPassword,
      // });
      
      setTimeout(() => {
        setLoading(false);
        passwordForm.resetFields();
        message.success('Mật khẩu đã được cập nhật');
      }, 1000);
    } catch {
      setLoading(false);
      message.error('Không thể cập nhật mật khẩu');
    }
  };

  const handleAvatarChange = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      // When using actual API, you would get the URL from the API response
      // For now, use a placeholder
      setAvatarUrl('https://picsum.photos/200');
      message.success('Ảnh đại diện đã được cập nhật');
    }
  };

  const handleSportSubmit = async (values: SportData) => {
    try {
      setSportLoading(true);
      await sportService.createSport(values);
      sportForm.resetFields();
      message.success('Loại hình thể thao đã được tạo thành công');
      setSportLoading(false);
    } catch {
      setSportLoading(false);
      message.error('Không thể tạo loại hình thể thao');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cài đặt tài khoản</h1>
      </div>
      
      <Tabs defaultActiveKey="profile">
        <TabPane tab="Thông tin cá nhân" key="profile">
          <Card>
            <Form
              form={profileForm}
              layout="vertical"
              initialValues={{
                name: user?.name || '',
                email: user?.email || '',
              }}
              onFinish={handleProfileSubmit}
            >
              <div className="mb-6 flex items-center">
                <Avatar 
                  size={100} 
                  icon={<UserOutlined />}
                  src={avatarUrl}
                  className="mr-4"
                />
                <Upload
                  action="https://www.mocky.io/v2/5cc8019d300000980a055e76" // Replace with your actual API endpoint
                  onChange={handleAvatarChange}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>Tải lên ảnh mới</Button>
                </Upload>
              </div>
              
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
              >
                <Input placeholder="Họ và tên" />
              </Form.Item>
              
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input placeholder="Email" disabled />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Cập nhật thông tin
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab="Đổi mật khẩu" key="password">
          <Card>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordSubmit}
            >
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
              >
                <Input.Password 
                  placeholder="Mật khẩu hiện tại" 
                  prefix={<LockOutlined />}
                />
              </Form.Item>
              
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                  { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
                ]}
              >
                <Input.Password 
                  placeholder="Mật khẩu mới" 
                  prefix={<LockOutlined />}
                />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  placeholder="Xác nhận mật khẩu mới" 
                  prefix={<LockOutlined />}
                />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Đổi mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab="Thông báo" key="notifications">
          <Card>
            <Form layout="vertical">
              <Form.Item
                name="emailNotifications"
                label="Nhận thông báo qua email"
                valuePropName="checked"
                initialValue={true}
              >
                <Select defaultValue="all">
                  <Option value="all">Tất cả thông báo</Option>
                  <Option value="important">Chỉ thông báo quan trọng</Option>
                  <Option value="none">Không nhận thông báo</Option>
                </Select>
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Lưu cài đặt
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="Quản lý loại hình thể thao" key="sports">
          <Card>
            <h2 className="text-lg font-semibold mb-4">Tạo loại hình thể thao mới</h2>
            <Form
              form={sportForm}
              layout="vertical"
              onFinish={handleSportSubmit}
            >
              <Form.Item
                name="name"
                label="Tên loại hình thể thao"
                rules={[{ required: true, message: 'Vui lòng nhập tên loại hình thể thao' }]}
              >
                <Input placeholder="Ví dụ: Bóng đá, Bơi lội, Tennis..." />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={sportLoading}>
                  Tạo loại hình thể thao
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SettingsPage;