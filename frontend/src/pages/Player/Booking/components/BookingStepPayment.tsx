import React from 'react';
import { Form, Card, Radio, Space, InputNumber, Button, Divider, Typography, Row, Col, FormInstance } from 'antd';
import { 
  BankOutlined, WalletOutlined, CreditCardOutlined 
} from '@ant-design/icons';
import { BookingFormData } from '@/types/booking.type';
import { FieldGroup } from '@/types/field.type';
import { Service } from '@/types/service.type';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface BookingStepPaymentProps {
  form: FormInstance;
  formData: Partial<BookingFormData>;
  fieldGroups: FieldGroup[];
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
              
              <Radio value="cash" className="w-full">
                <Card className="w-full mb-2 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center">
                    <WalletOutlined className="text-2xl mr-4 text-green-600" />
                    <div>
                      <Text strong>Tiền mặt</Text>
                      <div className="text-sm text-gray-500">
                        Thanh toán bằng tiền mặt tại cơ sở
                      </div>
                    </div>
                  </div>
                </Card>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item label="Mã giảm giá (nếu có)">
          <div className="flex">
            <InputNumber
              className="flex-1 mr-2"
              placeholder="Nhập mã giảm giá"
              onChange={value => form.setFieldsValue({ voucherCode: value })}
            />
            <Button type="primary">Áp dụng</Button>
          </div>
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
                 formData.paymentMethod === 'vnpay' ? 'VNPay' :
                 formData.paymentMethod === 'cash' ? 'Tiền mặt' : '-'}
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
          
          <Divider />
          
          <div className="flex justify-between text-lg font-bold">
            <Text>Tổng cộng:</Text>
            <Text className="text-blue-600">{formatCurrency(calculateTotalPrice())}</Text>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BookingStepPayment; 