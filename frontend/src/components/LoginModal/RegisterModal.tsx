import React from 'react';
import { Modal, Form, Input, Button, Select, message } from 'antd';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { register } from '@/store/slices/userSlice';
import { RegisterData } from '@/types/user.type';

interface RegisterModalProps {
  visible: boolean;
  onClose?: () => void;
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ 
  visible, 
  onClose,
  onSwitchToLogin,
  onSuccess
}) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.user);

  const handleRegister = async (values: RegisterData & { retypePassword: string }) => {
    try {
      const { retypePassword, ...registerData } = values;
      await dispatch(register(registerData)).unwrap();
      // message.success('Đăng ký tài khoản thành công!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.log(err);
      message.error(error || 'Đăng ký tài khoản thất bại. Vui lòng thử lại.');
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
    
  };

  return (
    <Modal
      title="Đăng ký tài khoản"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      maskClosable={false}
    >
      <Form
        name={`register-form-${Date.now()}`}
        layout="vertical"
        onFinish={handleRegister}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Vui lòng nhập email hợp lệ' }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Họ và tên"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' },
            {
              pattern: /^[0-9]{10,11}$/,
              message: 'Vui lòng nhập số điện thoại hợp lệ'
            }
          ]}          
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Vai trò"
          name="role"
          rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
        >
          <Select>
            <Select.Option value="player">Người chơi</Select.Option>
            <Select.Option value="owner">Chủ sân</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' },
            {
            pattern: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/,
            message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái đầu viết hoa, và số'
          }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Nhập lại mật khẩu"
          name="retypePassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('Mật khẩu không khớp');
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <div className="flex justify-between">
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Đăng ký
            </Button>
            <Button type="link" onClick={onSwitchToLogin}>
              <span className="text-gray-500">Đã có tài khoản? </span>Đăng nhập
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RegisterModal;