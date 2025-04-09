import React, { useState, useRef, useEffect } from 'react';
import { BankAccount } from '@/types/bankaccount.type';
import { mockBankAccounts } from '@/mocks/bankaccount/bankaccount';
import { Modal, Form, Input, DatePicker, Button, message } from 'antd';
import { DeleteOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { ApiError } from '@/types/errors';

const Banking: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const isMobile = containerWidth < 640;
  
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(mockBankAccounts);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleAddBankAccount = async () => {
    try {
      const values = await form.validateFields();
      const newAccount: BankAccount = {
        id: String(bankAccounts.length + 1),
        bankName: values.bankName,
        accountNumber: `**** **** **** ${values.accountNumber.slice(-4)}`,
        accountHolder: values.accountHolder,
        expireDate: values.expireDate.format('YYYY-MM-DD'),
        cvv: '***',
        isVerified: false,
        status: 'PHỤ'
      };

      setBankAccounts([...bankAccounts, newAccount]);
      setIsAddModalOpen(false);
      form.resetFields();
      message.success('Thêm tài khoản ngân hàng thành công');
    } catch (error: unknown) {
      const apiError = error as ApiError;
      message.error(apiError.response?.data?.message || 'Vui lòng điền đầy đủ thông tin');
    }
  };

  const handleDeleteBankAccount = (id: string) => {
    setBankAccounts(bankAccounts.filter(account => account.id !== id));
    message.success('Xóa tài khoản ngân hàng thành công');
  };

  return (
    <div ref={containerRef} className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold">Tài khoản ngân hàng</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalOpen(true)}
          size={isMobile ? "middle" : "large"}
          className="w-full sm:w-auto"
        >
          Thêm tài khoản mới
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {bankAccounts.map((account) => (
          <div 
            key={account.id} 
            className="bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-xl p-4 sm:p-6 shadow-lg relative group"
          >
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteBankAccount(account.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                size={isMobile ? "small" : "middle"}
              />
            </div>

            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-base sm:text-lg">{account.bankName}</h3>
                  <span className="text-xs sm:text-sm text-gray-300">{account.status}</span>
                </div>
              </div>
              {account.isVerified && (
                <div className="flex items-center gap-1 text-xs sm:text-sm text-emerald-400">
                  <CheckCircleOutlined />
                  <span>Đã kiểm tra</span>
                </div>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Số tài khoản</p>
                <p className="text-lg sm:text-xl tracking-wider font-mono">{account.accountNumber}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Chủ tài khoản</p>
                <p className="text-base sm:text-lg">{account.accountHolder}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Ngày hết hạn</p>
                <p className="text-base sm:text-lg">{account.expireDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        title="Thêm tài khoản ngân hàng"
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={isMobile ? "90%" : "520px"}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddBankAccount}
        >
          <Form.Item
            name="bankName"
            label="Ngân hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng' }]}
          >
            <Input placeholder="Nhập tên ngân hàng" size={isMobile ? "middle" : "large"} />
          </Form.Item>

          <Form.Item
            name="accountNumber"
            label="Số tài khoản"
            rules={[{ required: true, message: 'Vui lòng nhập số tài khoản' }]}
          >
            <Input placeholder="Nhập số tài khoản" size={isMobile ? "middle" : "large"} />
          </Form.Item>

          <Form.Item
            name="accountHolder"
            label="Chủ tài khoản"
            rules={[{ required: true, message: 'Vui lòng nhập tên chủ tài khoản' }]}
          >
            <Input placeholder="Nhập tên chủ tài khoản" size={isMobile ? "middle" : "large"} />
          </Form.Item>

          <Form.Item
            name="expireDate"
            label="Ngày hết hạn"
            rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}
          >
            <DatePicker className="w-full" size={isMobile ? "middle" : "large"} />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end gap-3">
              <Button 
                onClick={() => {
                  setIsAddModalOpen(false);
                  form.resetFields();
                }}
                size={isMobile ? "middle" : "large"}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                size={isMobile ? "middle" : "large"}
              >
                Thêm tài khoản
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Banking; 