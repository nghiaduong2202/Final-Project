import React, { useState, useEffect } from 'react';
import { Form, Card, Radio, Space, Divider, Typography, FormInstance, Select, Spin, Empty, message, InputNumber, Button } from 'antd';
import { 
  CreditCardOutlined, TagOutlined, InfoCircleOutlined, 
  WalletFilled
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { BookingFormData } from '@/types/booking.type';
import { AvailableFieldGroup } from '@/types/field.type';
import { Service } from '@/types/service.type';
import { voucherService } from '@/services/voucher.service';
import dayjs from 'dayjs';
import { useAppSelector } from '@/hooks/reduxHooks';
import BookingPaymentSummary from './BookingPaymentSummary';

const { Text } = Typography;
const { Option } = Select;

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  bankAccount: string;
  role: 'player' | 'owner';
  avatarUrl?: string;
  refundedPoint: number;
}

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
  sports?: { id: number; name: string }[];
  selectedDates: dayjs.Dayjs[];
  formatCurrency: (amount: number) => string;
  calculateTotalPrice: () => number;
  user?: User;
}

const BookingStepPayment: React.FC<BookingStepPaymentProps> = ({
  form,
  formData,
  fieldGroups,
  services,
  selectedDates,
  formatCurrency,
  calculateTotalPrice
}) => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [, setSelectedVoucher] = useState<Voucher | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const totalPrice = calculateTotalPrice();
  
  // Get user from redux store to access refundedPoint
  const { user: reduxUser } = useAppSelector(state => state.user);
  const [refundedPointsInput, setRefundedPointsInput] = useState<number | null>(0);
  // We use this state in useEffect but ESLint doesn't detect it
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [refundedPointsDiscount, setRefundedPointsDiscount] = useState(0);
  
  // Calculate the maximum points that can be used (in points)
  const availablePoints = reduxUser?.refundedPoint || 0;
  // Limit points to 50% of total price
  const maxPointsUsable = Math.min(
    availablePoints, 
    Math.floor((totalPrice * 0.5) / 1000) // 50% of total payment, converted to points
  );

  // Update form values when refundedPoints input changes
  useEffect(() => {
    if (refundedPointsInput !== null && refundedPointsInput > 0) {
      // Convert points to VND (1 point = 1,000 VND)
      const discount = refundedPointsInput * 1000;
      setRefundedPointsDiscount(discount);
      
      // Make sure to store the value as a number
      form.setFieldsValue({ refundedPoint: Number(refundedPointsInput) });
      
      console.log('Updated refundedPoint in form:', Number(refundedPointsInput));
    } else {
      setRefundedPointsDiscount(0);
      form.setFieldsValue({ refundedPoint: 0 });
    }
  }, [refundedPointsInput, form]);

  // Lấy danh sách voucher từ API khi component được tạo
  useEffect(() => {
    const fetchVouchers = async () => {
      if (!facilityId) {
        console.error('Missing facilityId for vouchers');
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
  }, [facilityId, totalPrice]);

  // Xử lý khi chọn voucher
  const handleVoucherSelect = (voucherId: number) => {
    const voucher = vouchers.find(v => v.id === voucherId);
    
    if (voucher) {
      // Kiểm tra điều kiện áp dụng voucher
      if (totalPrice < voucher.minPrice) {
        message.error(`Đơn hàng tối thiểu phải từ ${formatCurrency(voucher.minPrice)}`);
        setSelectedVoucher(null);
        setDiscountAmount(0);
        form.setFieldsValue({ voucherId: undefined, voucherDiscount: 0 });
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
      form.setFieldsValue({ 
        voucherId: voucher.id,
        voucherDiscount: discount // Store the discount amount in the form
      });
      message.success(`Đã áp dụng voucher "${voucher.name}"`);
    } else {
      setSelectedVoucher(null);
      setDiscountAmount(0);
      form.setFieldsValue({ 
        voucherId: undefined,
        voucherDiscount: 0 // Reset the discount amount
      });
    }
  };

  // Xử lý sử dụng tối đa điểm tích lũy
  const handleUseMaxPoints = () => {
    // Ensure maxPointsUsable is a number
    const pointsToUse = Number(maxPointsUsable);
    setRefundedPointsInput(pointsToUse);
    
    // Update form with the number value
    form.setFieldsValue({ refundedPoint: pointsToUse });
    console.log('Set max points:', pointsToUse);
  };

  // Xử lý khi người dùng thay đổi số điểm tích lũy
  const handleRefundedPointChange = (value: number | null) => {
    if (value === null) {
      setRefundedPointsInput(0);
      return;
    }

    // Convert to number to ensure proper type
    const pointValue = Number(value);

    // Validate against maximum limits
    if (pointValue > availablePoints) {
      message.error(`Bạn chỉ có ${availablePoints} điểm tích lũy`);
      setRefundedPointsInput(Number(availablePoints));
      return;
    }

    if (pointValue > maxPointsUsable) {
      message.error(`Bạn chỉ có thể sử dụng tối đa ${maxPointsUsable} điểm (50% giá trị đơn hàng)`);
      setRefundedPointsInput(Number(maxPointsUsable));
      return;
    }

    // Store as number
    setRefundedPointsInput(pointValue);
  };

  return (
    <Card className="shadow-md">
      <Form
        form={form}
        layout="vertical"
        initialValues={{...formData, refundedPoint: 0, voucherDiscount: 0}}
      >
        {/* Hidden field to store voucher discount amount */}
        <Form.Item name="voucherDiscount" hidden>
          <InputNumber />
        </Form.Item>
        
        <Form.Item
          name="paymentMethod"
          label="Phương thức thanh toán"
          rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
        >
          <Radio.Group className="w-full">
            <Space direction="vertical" className="w-full">
              {/* <Radio value="banking" className="w-full">
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
              </Radio> */}
              
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
        
        {reduxUser && reduxUser.refundedPoint >= 0 && (
          <Form.Item
            name="refundedPoint"
            label={
              <div className="flex items-center">
                <WalletFilled className="mr-2 text-green-500" />
                <span>Sử dụng điểm tích lũy</span>
              </div>
            }
          >
            <div>
              <div className="flex items-center gap-2">
                <InputNumber
                  min={0}
                  max={Math.min(availablePoints, maxPointsUsable)}
                  value={refundedPointsInput}
                  onChange={handleRefundedPointChange}
                  style={{ width: '50%' }}
                  placeholder="Nhập số điểm muốn sử dụng"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => {
                    const parsed = parseInt(value!.replace(/\$\s?|(,*)/g, ''));
                    return isNaN(parsed) ? 0 : parsed;
                  }}
                />
                <Button 
                  type="primary" 
                  size="small" 
                  onClick={handleUseMaxPoints}
                >
                  Dùng tối đa
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="text-gray-600">
                  <span>Bạn có: </span>
                  <span className="text-green-600 font-medium">{reduxUser.refundedPoint} điểm</span>
                </div>
                <div className="text-gray-600">
                  <span>Tối đa có thể dùng: </span>
                  <span className="text-green-600 font-medium">{maxPointsUsable} điểm</span>
                  <span className="text-xs text-gray-500 ml-1">(50% giá trị đơn hàng)</span>
                </div>
              </div>
              
              <div className="mt-1 text-xs text-gray-500">
                <InfoCircleOutlined className="mr-1" />
                1 điểm = 1.000 VNĐ. Điểm tích lũy từ việc hoàn tiền các đơn hàng đã hủy.
              </div>
            </div>
          </Form.Item>
        )}
      </Form>
      
      <Divider />
      
      {/* Add BookingPaymentSummary component */}
      <BookingPaymentSummary 
        step={4}
        fieldGroup={formData.fieldGroupId ? 
          fieldGroups.find(g => String(g.id) === String(formData.fieldGroupId)) : 
          undefined}
        services={Array.isArray(formData.services) ? formData.services : []}
        allServices={services}
        startTime={formData.timeRange?.[0]?.format('HH:mm:ss')}
        endTime={formData.timeRange?.[1]?.format('HH:mm:ss')}
        selectedDates={selectedDates}
        voucherDiscount={discountAmount}
        refundedPoint={Number(refundedPointsInput) || 0}
        formatCurrency={formatCurrency}
        calculateTotalPrice={calculateTotalPrice}
      />
      
      {/* <Divider /> */}
      
      {/* <div className="bg-gray-50 p-4 rounded-lg">
        <Title level={5} className="mb-4">Thông tin đặt sân</Title>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="mb-2">
              <Text type="secondary">Loại hình thể thao:</Text>
              <div>{sports?.find(s => s.id === formData.sportId)?.name || '-'}</div>
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
      </div> */}
    </Card>
  );
};

export default BookingStepPayment; 