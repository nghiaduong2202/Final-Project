import React, { useState, useEffect } from 'react';
import { Form, Card, Radio, Space, Divider, Typography, Row, Col, FormInstance, Select, Spin, Empty, message } from 'antd';
import { 
  BankOutlined, WalletOutlined, CreditCardOutlined, TagOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { BookingFormData } from '@/types/booking.type';
import { AvailableFieldGroup } from '@/types/field.type';
import { Service } from '@/types/service.type';
import { voucherService } from '@/services/voucher.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface Voucher {
  id: number;
  name: string;
  code?: string;
  startDate: string;
  endDate: string;
  voucherType: 'cash' | 'percent';
  discount: number;
  minPrice: number;
  maxDiscount: number;
  amount: number;
  remain: number;
  facilityId: string;
}

interface BookingStepPaymentProps {
  form: FormInstance;
  formData: Partial<BookingFormData>;
  fieldGroups: AvailableFieldGroup[];
  services: Service[];
  sports: { id: number; name: string }[];
  selectedDates: dayjs.Dayjs[];
  formatCurrency: (amount: number) => string;
  calculateTotalPrice: () => number;
}

const BookingStepPayment: React.FC<BookingStepPaymentProps> = ({
  form,
  formData,
  fieldGroups,
  services,
  sports,
  selectedDates,
  formatCurrency,
  calculateTotalPrice
}) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const totalPrice = calculateTotalPrice();

  // Lấy danh sách voucher từ API khi component được tạo
  useEffect(() => {
    const fetchVouchers = async () => {
      // Lấy facilityId từ URL hoặc từ fieldGroups nếu có
      let facilityId: string | null = null;
      
      // Cách 1: Lấy từ URL
      const urlParams = new URLSearchParams(window.location.search);
      facilityId = urlParams.get('facilityId');
      
      // Cách 2: Lấy từ fieldGroups nếu có
      if (!facilityId && fieldGroups.length > 0 && fieldGroups[0].id) {
        // Lấy facilityId của field group đầu tiên (field group thuộc về facility)
        // Trong thực tế có thể cần lấy từ một nguồn khác tùy vào cấu trúc dữ liệu
        facilityId = fieldGroups[0].id.split('_')[0]; // Giả sử id có format: "facilityId_groupId"
      }
      
      if (!facilityId) {
        console.error('Could not determine facilityId for vouchers');
        setLoadingVouchers(false);
        return;
      }
      
      setLoadingVouchers(true);
      try {
        const vouchersData = await voucherService.getVouchers(facilityId);
        
        // Lọc voucher còn hiệu lực (status = active) và số lượng còn (remain > 0)
        const validVouchers = vouchersData.filter(v => {
          const now = dayjs();
          const startDate = dayjs(v.startDate);
          const endDate = dayjs(v.endDate);
          const isActive = now.isAfter(startDate) && now.isBefore(endDate);
          return isActive && v.remain > 0 && v.minPrice <= totalPrice;
        });
        
        setVouchers(validVouchers);
      } catch (error) {
        console.error('Error fetching vouchers:', error);
      } finally {
        setLoadingVouchers(false);
      }
    };
    
    fetchVouchers();
  }, [fieldGroups, totalPrice]);

  // Xử lý khi chọn voucher
  const handleVoucherSelect = (voucherId: number) => {
    const voucher = vouchers.find(v => v.id === voucherId);
    
    if (voucher) {
      // Kiểm tra điều kiện áp dụng voucher
      if (totalPrice < voucher.minPrice) {
        message.error(`Đơn hàng tối thiểu phải từ ${formatCurrency(voucher.minPrice)}`);
        setSelectedVoucher(null);
        setDiscountAmount(0);
        form.setFieldsValue({ voucherId: undefined });
        return;
      }
      
      // Tính số tiền giảm giá
      let discount = 0;
      if (voucher.voucherType === 'cash') {
        discount = voucher.discount;
      } else {
        // Voucher giảm theo phần trăm
        discount = (totalPrice * voucher.discount) / 100;
        // Kiểm tra giảm tối đa
        if (discount > voucher.maxDiscount) {
          discount = voucher.maxDiscount;
        }
      }
      
      setSelectedVoucher(voucher);
      setDiscountAmount(discount);
      form.setFieldsValue({ voucherId: voucher.id });
      message.success(`Đã áp dụng voucher "${voucher.name}"`);
    } else {
      setSelectedVoucher(null);
      setDiscountAmount(0);
      form.setFieldsValue({ voucherId: undefined });
    }
  };

  return (
    <Card className="shadow-md">
      <Form
        form={form}
        layout="vertical"
        initialValues={formData}
      >
        <Form.Item
          name="paymentMethod"
          label="Phương thức thanh toán"
          rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
        >
          <Radio.Group className="w-full">
            <Space direction="vertical" className="w-full">
              <Radio value="banking" className="w-full">
                <Card className="w-full mb-2 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center">
                    <BankOutlined className="text-2xl mr-4 text-blue-600" />
                    <div>
                      <Text strong>Chuyển khoản ngân hàng</Text>
                      <div className="text-sm text-gray-500">
                        Chuyển khoản trực tiếp đến tài khoản ngân hàng của cơ sở
                      </div>
                    </div>
                  </div>
                </Card>
              </Radio>
              
              <Radio value="momo" className="w-full">
                <Card className="w-full mb-2 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center">
                    <WalletOutlined className="text-2xl mr-4 text-pink-600" />
                    <div>
                      <Text strong>Ví MoMo</Text>
                      <div className="text-sm text-gray-500">
                        Thanh toán qua ví điện tử MoMo
                      </div>
                    </div>
                  </div>
                </Card>
              </Radio>
              
              <Radio value="vnpay" className="w-full">
                <Card className="w-full mb-2 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center">
                    <CreditCardOutlined className="text-2xl mr-4 text-blue-600" />
                    <div>
                      <Text strong>VNPay</Text>
                      <div className="text-sm text-gray-500">
                        Thanh toán qua cổng thanh toán VNPay
                      </div>
                    </div>
                  </div>
                </Card>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item
          label={
            <div className="flex items-center">
              <TagOutlined className="mr-2 text-orange-500" />
              <span>Voucher giảm giá</span>
            </div>
          }
        >
          <Form.Item
            name="voucherId"
            noStyle
          >
            {loadingVouchers ? (
              <div className="text-center py-4">
                <Spin tip="Đang tải voucher..." />
              </div>
            ) : vouchers.length === 0 ? (
              <Empty 
                description="Không có voucher khả dụng" 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                className="py-2"
              />
            ) : (
              <Select
                placeholder="Chọn voucher"
                style={{ width: '100%' }}
                onChange={handleVoucherSelect}
                allowClear
                optionLabelProp="label"
              >
                {vouchers.map(voucher => (
                  <Option 
                    key={voucher.id} 
                    value={voucher.id}
                    label={voucher.name}
                  >
                    <div className="flex flex-col">
                      <div className="font-semibold">{voucher.name}</div>
                      <div className="text-sm text-gray-500 flex justify-between">
                        <span>
                          {voucher.voucherType === 'cash' 
                            ? `Giảm ${formatCurrency(voucher.discount)}` 
                            : `Giảm ${voucher.discount}%`}
                        </span>
                        <span>Còn lại: {voucher.remain}</span>
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          {totalPrice > 0 && (
            <div className="mt-1 text-xs text-gray-500">
              <InfoCircleOutlined className="mr-1" />
              Chỉ hiển thị voucher phù hợp với đơn hàng của bạn
            </div>
          )}
        </Form.Item>
      </Form>
      
      <Divider />
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <Title level={5} className="mb-4">Thông tin đặt sân</Title>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="mb-2">
              <Text type="secondary">Loại hình thể thao:</Text>
              <div>{sports.find(s => s.id === formData.sportId)?.name || '-'}</div>
            </div>
            
            <div className="mb-2">
              <Text type="secondary">Ngày đặt sân:</Text>
              <div>
                {formData.isRecurring ? (
                  <div>
                    <div>Đặt sân định kỳ</div>
                    <div className="text-sm text-gray-500">
                      {selectedDates.length} ngày đã chọn
                    </div>
                  </div>
                ) : (
                  formData.date ? dayjs(formData.date).format('DD/MM/YYYY') : '-'
                )}
              </div>
            </div>
            
            <div className="mb-2">
              <Text type="secondary">Thời gian:</Text>
              <div>
                {formData.timeRange ? 
                  `${dayjs(formData.timeRange[0]).format('HH:mm')} - ${dayjs(formData.timeRange[1]).format('HH:mm')}` 
                  : '-'
                }
              </div>
            </div>
          </Col>
          
          <Col xs={24} md={12}>
            <div className="mb-2">
              <Text type="secondary">Loại sân:</Text>
              <div>
                {formData.fieldGroupId ? 
                  fieldGroups.find(g => String(g.id) === String(formData.fieldGroupId))?.name || '-' 
                  : '-'
                }
              </div>
            </div>
            
            <div className="mb-2">
              <Text type="secondary">Phương thức thanh toán:</Text>
              <div>
                {formData.paymentMethod === 'banking' ? 'Chuyển khoản ngân hàng' :
                 formData.paymentMethod === 'momo' ? 'Ví MoMo' :
                 formData.paymentMethod === 'vnpay' ? 'VNPay' : '-'}
              </div>
            </div>
          </Col>
        </Row>
        
        <Divider />
        
        <div>
          <Title level={5} className="mb-2">Chi tiết thanh toán</Title>
          
          <div className="flex justify-between mb-2">
            <Text>Giá sân:</Text>
            <Text>
              {formData.fieldGroupId ? 
                formatCurrency(fieldGroups.find(g => String(g.id) === String(formData.fieldGroupId))?.basePrice || 0) 
                : '-'
              }
            </Text>
          </div>
          
          {Array.isArray(formData.services) && formData.services.length > 0 && (
            <div className="flex justify-between mb-2">
              <Text>Dịch vụ:</Text>
              <Text>
                {formatCurrency(
                  formData.services.reduce((total, service) => {
                    const serviceInfo = services.find(s => s.id === service.serviceId);
                    return total + (serviceInfo?.price || 0) * service.quantity;
                  }, 0)
                )}
              </Text>
            </div>
          )}
          
          {formData.isRecurring && (
            <div className="flex justify-between mb-2">
              <Text>Số ngày đặt:</Text>
              <Text>{selectedDates.length}</Text>
            </div>
          )}
          
          {selectedVoucher && (
            <div className="flex justify-between mb-2">
              <Text className="flex items-center">
                <TagOutlined className="mr-1 text-orange-500" />
                Giảm giá:
              </Text>
              <Text className="text-orange-500">- {formatCurrency(discountAmount)}</Text>
            </div>
          )}
          
          <Divider />
          
          <div className="flex justify-between text-lg font-bold">
            <Text>Tổng cộng:</Text>
            <Text className="text-blue-600">
              {formatCurrency(totalPrice - discountAmount)}
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BookingStepPayment; 