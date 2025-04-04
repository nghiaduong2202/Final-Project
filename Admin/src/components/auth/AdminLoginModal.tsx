import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { login, hideLoginModal } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

interface AdminLoginModalProps {
  visible: boolean;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ visible }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, redirectPath } = useAppSelector(state => state.auth);
  const [form] = Form.useForm();
  
  const handleCancel = () => {
    dispatch(hideLoginModal());
    form.resetFields();
  };
  
  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await dispatch(login(values)).unwrap();
      message.success('Đăng nhập thành công');
      // Redirect to the path they were trying to access or dashboard
      navigate(redirectPath || '/dashboard');
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : 'Đăng nhập thất bại. Vui lòng thử lại.';
      message.error(errorMessage);
    }
  };

  return (
    <Modal
      title="Đăng nhập hệ thống quản trị"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      maskClosable={false}
    >
      <Form
        name={`admin-login-form-${Date.now()}`}
        layout="vertical"
        form={form}
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

        {error && (
          <div className="mb-4 p-2 bg-red-50 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdminLoginModal;