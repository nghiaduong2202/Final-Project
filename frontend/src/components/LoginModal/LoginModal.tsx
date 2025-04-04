import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { login, hideLoginModal } from '@/store/slices/userSlice';
import RegisterModal from './RegisterModal';
import { useNavigate } from 'react-router-dom';
interface LoginModalProps {
  visible: boolean;
  onClose?: () => void;
  requiredRole?: 'player' | 'owner';
}

const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose, requiredRole }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, redirectPath } = useAppSelector(state => state.user);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
       await dispatch(login({ ...values, requiredRole , fromToken: false })).unwrap();       
      message.success('Đăng nhập thành công');
      // Check if there's a redirect path and navigate to it
    if (redirectPath) {
      navigate(redirectPath);
    } 
    else {
      // Chuyển hướng dựa trên vai trò nếu không có redirectPath
      if (requiredRole === 'owner') {
        navigate('/owner');
      } else if (requiredRole === 'player') {
        navigate('/');
      }
    }
    if (onClose) {
      onClose();
    }
      // Redirect will be handled by the protected route component
    } catch (error) {
      // Hiển thị thông báo lỗi cụ thể từ API
      message.error(error as string || 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
    }
  };

  const switchToRegister = () => {
    setShowRegister(true);
  };

  const handleCancel = () => {
    dispatch(hideLoginModal());    
    if (onClose) {
      onClose();
    }
    setShowRegister(false);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    message.success('Đăng ký tài khoản thành công. Vui lòng đăng nhập.');
  };

  if (showRegister) {
    return (
      <RegisterModal 
        visible={visible} 
        onClose={handleCancel} 
        onSwitchToLogin={() => setShowRegister(false)}
        onSuccess={handleRegisterSuccess}
      />
    );
  }

  return (
    <Modal
      title={`Đăng nhập ${requiredRole === 'owner' ? 'Chủ sân' : requiredRole === 'player' ? 'Người chơi' : ''}`}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      maskClosable={false}
    >
      <Form
        name={`login-form-${Date.now()}`}
        layout="vertical"
        onFinish={handleLogin}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Vui lòng nhập email' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
        >
          <Input.Password />
        </Form.Item>

        {/* Hiển thị vai trò đã chọn */}
        {requiredRole && (
          <div className="mb-4 p-2 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-600">
              Bạn đang đăng nhập với vai trò: <strong>{requiredRole === 'owner' ? 'Chủ sân' : 'Người chơi'}</strong>
            </p>
          </div>
        )}

        <Form.Item>
          <div className="flex justify-between">
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Đăng nhập
            </Button>
            <Button type="link" onClick={switchToRegister}>
              <span className="text-gray-500">Bạn chưa có tài khoản?</span> Đăng ký
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LoginModal;