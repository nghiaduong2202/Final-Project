import React, { useState, useEffect } from 'react';
import { Form, Card, Input, FormInstance, Typography, Row, Col, Empty, Radio, Divider, Button, Tag, Spin, Alert } from 'antd';
import { Voucher } from '@/types/voucher.type';
import { BookingFormData } from '@/types/booking.type';
import { CheckCircleOutlined, CloseCircleOutlined, TagOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

interface BookingStepVoucherProps {
  form: FormInstance;
  formData: Partial<BookingFormData>;
  vouchers: Voucher[];
  loading?: boolean;
  totalAmount?: number;
}

const BookingStepVoucher: React.FC<BookingStepVoucherProps> = ({
  form,
  formData,
  vouchers,
  loading = false,
  totalAmount = 0
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(
    formData.voucherId || null
  );
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>(vouchers);

  useEffect(() => {
    // Lọc voucher theo từ khóa tìm kiếm
    const filtered = vouchers.filter(voucher => 
      voucher.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVouchers(filtered);
  }, [searchTerm, vouchers]);

  // Kiểm tra xem voucher có hợp lệ với đơn đặt hiện tại không
  const isVoucherValid = (voucher: Voucher): boolean => {
    const now = dayjs();
    const startDate = dayjs(voucher.startDate);
    const endDate = dayjs(voucher.endDate);
    
    // Kiểm tra thời gian hiệu lực
    const isInDateRange = now.isAfter(startDate) && now.isBefore(endDate);
    
    // Kiểm tra số lượng còn lại
    const hasQuantityRemaining = voucher.remain > 0;
    
    // Kiểm tra giá trị tối thiểu
    const meetsMinimumAmount = totalAmount >= (voucher.minPrice || 0);
    
    return isInDateRange && hasQuantityRemaining && meetsMinimumAmount;
  };

  // Tính số tiền giảm từ voucher
  const calculateDiscountAmount = (voucher: Voucher): number => {
    if (!voucher) return 0;
    
    if (voucher.voucherType === 'percent') {
      return Math.min(totalAmount * (voucher.discount / 100), voucher.maxDiscount || Infinity);
    } else {
      return Math.min(voucher.discount, totalAmount);
    }
  };

  // Xử lý khi chọn voucher
  const handleVoucherSelect = (voucherId: number) => {
    if (selectedVoucherId === voucherId) {
      setSelectedVoucherId(null);
      form.setFieldsValue({ voucherId: null });
    } else {
      setSelectedVoucherId(voucherId);
      form.setFieldsValue({ voucherId });
    }
  };

  // Xử lý khi nhập mã voucher
  const handleSearchVoucher = (value: string) => {
    setSearchTerm(value);
    
    // Tìm voucher theo mã chính xác
    const exactVoucher = vouchers.find(v => v.code?.toLowerCase() === value.toLowerCase());
    if (exactVoucher && isVoucherValid(exactVoucher)) {
      handleVoucherSelect(exactVoucher.id);
    }
  };

  // Hiển thị trạng thái voucher
  const renderVoucherStatus = (voucher: Voucher) => {
    const valid = isVoucherValid(voucher);
    
    if (!valid) {
      const now = dayjs();
      const startDate = dayjs(voucher.startDate);
      const endDate = dayjs(voucher.endDate);
      
      if (now.isBefore(startDate)) {
        return (
          <Tag icon={<InfoCircleOutlined />} color="warning">
            Chưa đến thời gian sử dụng
          </Tag>
        );
      } else if (now.isAfter(endDate)) {
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Đã hết hạn
          </Tag>
        );
      } else if (voucher.remain <= 0) {
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Đã hết lượt sử dụng
          </Tag>
        );
      } else if (totalAmount < (voucher.minPrice || 0)) {
        return (
          <Tag icon={<InfoCircleOutlined />} color="warning">
            Chưa đạt giá trị tối thiểu
          </Tag>
        );
      }
    }
    
    return (
      <Tag icon={<CheckCircleOutlined />} color="success">
        Có thể sử dụng
      </Tag>
    );
  };

  // Hiển thị voucher dưới dạng card
  const renderVoucherCard = (voucher: Voucher) => {
    const isValid = isVoucherValid(voucher);
    const isSelected = selectedVoucherId === voucher.id;
    const discountAmount = calculateDiscountAmount(voucher);
    
    return (
      <Card 
        key={voucher.id}
        hoverable
        className={`mb-4 border-2 ${isSelected ? 'border-blue-500' : isValid ? '' : 'opacity-60'}`}
        onClick={() => isValid && handleVoucherSelect(voucher.id)}
      >
        <div className="flex justify-between flex-wrap">
          <div className="flex-grow">
            <div className="flex items-center mb-2">
              <Radio checked={isSelected} disabled={!isValid} className="mr-2" />
              <Title level={5} className="mb-0 mr-3">{voucher.code}</Title>
              {renderVoucherStatus(voucher)}
            </div>
            
            <Paragraph className="text-gray-600">{voucher.name}</Paragraph>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mt-2">
              <div>
                <TagOutlined className="mr-1" />
                Giảm: {voucher.voucherType === 'percent' 
                  ? `${voucher.discount}% (tối đa ${voucher.maxDiscount?.toLocaleString('vi-VN') || 'không giới hạn'}đ)` 
                  : `${voucher.discount.toLocaleString('vi-VN')}đ`}
              </div>
              
              {voucher.minPrice > 0 && (
                <div className={totalAmount < voucher.minPrice ? 'text-red-500' : ''}>
                  Đơn tối thiểu: {voucher.minPrice.toLocaleString('vi-VN')}đ
                </div>
              )}
              
              <div>
                Còn lại: {voucher.remain} lượt
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end justify-between">
            <div className="text-lg font-bold text-blue-600">
              -{discountAmount.toLocaleString('vi-VN')}đ
            </div>
            <div className="text-sm text-gray-500">
              HSD: {dayjs(voucher.endDate).format('DD/MM/YYYY')}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Tính tổng tiền giảm
  const getTotalDiscount = (): number => {
    if (!selectedVoucherId) return 0;
    
    const selectedVoucher = vouchers.find(v => v.id === selectedVoucherId);
    if (!selectedVoucher) return 0;
    
    return calculateDiscountAmount(selectedVoucher);
  };

  const selectedVoucher = vouchers.find(v => v.id === selectedVoucherId);
  const totalDiscount = getTotalDiscount();

  return (
    <Card className="shadow-md">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div className="flex justify-between items-center flex-wrap mb-4">
            <Title level={5} className="mb-0">Voucher & Mã giảm giá</Title>
            
            {selectedVoucher && (
              <div className="text-green-600 font-semibold flex items-center">
                <CheckCircleOutlined className="mr-1" /> 
                Đã áp dụng giảm giá: {totalDiscount.toLocaleString('vi-VN')}đ
              </div>
            )}
          </div>
          
          <Form form={form} layout="vertical" initialValues={formData}>
            <Form.Item name="voucherId" hidden>
              <Input />
            </Form.Item>
            
            <Row gutter={16}>
              <Col xs={24} md={12} lg={8}>
                <Search
                  placeholder="Nhập mã voucher"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onSearch={handleSearchVoucher}
                  enterButton
                  className="mb-4"
                  allowClear
                />
              </Col>
            </Row>
            
            {loading ? (
              <div className="text-center py-4">
                <Spin />
                <div className="mt-2">Đang tải danh sách voucher...</div>
              </div>
            ) : filteredVouchers.length === 0 ? (
              <Empty 
                description="Không tìm thấy voucher nào khả dụng" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            ) : (
              <div className="voucher-list space-y-4">
                {filteredVouchers.map(renderVoucherCard)}
              </div>
            )}
          </Form>
        </Col>
        
        {selectedVoucher && (
          <Col span={24}>
            <Divider />
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <Text strong className="flex items-center">
                    <CheckCircleOutlined className="mr-1 text-green-600" /> 
                    Voucher đã áp dụng: {selectedVoucher.code}
                  </Text>
                  <div className="text-gray-500 text-sm mt-1">
                    {selectedVoucher.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-600">Số tiền giảm:</div>
                  <div className="text-xl font-bold text-green-600">
                    -{totalDiscount.toLocaleString('vi-VN')}đ
                  </div>
                  <Button 
                    type="link" 
                    className="p-0 h-auto" 
                    danger 
                    onClick={() => handleVoucherSelect(selectedVoucher.id)}
                  >
                    Hủy áp dụng
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        )}
        
        {totalAmount > 0 && !selectedVoucher && filteredVouchers.length > 0 && (
          <Col span={24}>
            <Alert
              type="info"
              message="Bạn có thể chọn một voucher để được giảm giá cho đơn đặt sân này"
              showIcon
            />
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default BookingStepVoucher; 