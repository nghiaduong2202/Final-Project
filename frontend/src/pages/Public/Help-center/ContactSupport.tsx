import React from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  Typography, 
  Row, 
  Col, 
  Card,
  Upload,
  Divider,
  Space
} from 'antd';
import { 
  UploadOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined,
  MessageOutlined,
  SendOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { UploadFile } from 'antd/lib/upload/interface';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  issueType: string;
  subject: string;
  message: string;
  attachments?: UploadFile[];
}

const ContactSupport: React.FC = () => {
  const [form] = Form.useForm<ContactFormValues>();

  const onFinish = (values: ContactFormValues) => {
    console.log('Received values:', values);
    // Xử lý gửi form liên hệ ở đây
    form.resetFields();
  };

  const normFile = (e: { fileList?: UploadFile[] }): UploadFile[] => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList || [];
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gray-100 py-12 text-center shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <Title level={1} className="text-gray-800 text-3xl md:text-4xl font-bold mb-6">
            Liên hệ hỗ trợ
          </Title>
          <Paragraph className="text-gray-600 text-lg mb-4 max-w-2xl mx-auto">
            Đội ngũ hỗ trợ của chúng tôi sẵn sàng giúp đỡ bạn giải quyết mọi vấn đề
          </Paragraph>
          <div className="flex justify-center mt-4">
            <Link to="/help" className="text-indigo-600 hover:text-indigo-800 mx-2">
              <Button type="link" className="text-indigo-600 hover:text-indigo-800 px-0">
                Trung tâm trợ giúp
              </Button>
            </Link>
            <span className="text-gray-400 mx-2">|</span>
            <Link to="/faq" className="text-indigo-600 hover:text-indigo-800 mx-2">
              <Button type="link" className="text-indigo-600 hover:text-indigo-800 px-0">
                Câu hỏi thường gặp
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Form liên hệ */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Row gutter={[32, 24]}>
          <Col xs={24} md={16}>
            <Card className="shadow-sm">
              <Title level={3} className="mb-6">Gửi yêu cầu hỗ trợ</Title>
              
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="name"
                      label="Họ và tên"
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                      <Input placeholder="Nhập họ và tên của bạn" />
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
                      <Input placeholder="Nhập địa chỉ email của bạn" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="phone"
                      label="Số điện thoại"
                      rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    >
                      <Input placeholder="Nhập số điện thoại của bạn" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="issueType"
                      label="Loại vấn đề"
                      rules={[{ required: true, message: 'Vui lòng chọn loại vấn đề' }]}
                    >
                      <Select placeholder="Chọn loại vấn đề">
                        <Option value="booking">Đặt sân</Option>
                        <Option value="payment">Thanh toán</Option>
                        <Option value="account">Tài khoản</Option>
                        <Option value="facility">Cơ sở thể thao</Option>
                        <Option value="feedback">Góp ý</Option>
                        <Option value="other">Khác</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item
                  name="subject"
                  label="Tiêu đề"
                  rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                >
                  <Input placeholder="Nhập tiêu đề yêu cầu hỗ trợ" />
                </Form.Item>
                
                <Form.Item
                  name="message"
                  label="Nội dung chi tiết"
                  rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                >
                  <TextArea 
                    placeholder="Mô tả chi tiết vấn đề của bạn" 
                    rows={6} 
                  />
                </Form.Item>
                
                <Form.Item
                  name="attachments"
                  label="Tệp đính kèm (nếu có)"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                >
                  <Upload name="files" listType="text" multiple>
                    <Button icon={<UploadOutlined />}>Tải lên tệp</Button>
                  </Upload>
                </Form.Item>
                
                <Form.Item className="mt-6">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large"
                    icon={<SendOutlined />}
                    className="bg-indigo-600 hover:bg-indigo-700 border-none"
                  >
                    Gửi yêu cầu
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          
          {/* Thông tin liên hệ */}
          <Col xs={24} md={8}>
            <Card className="shadow-sm mb-6">
              <Title level={3} className="mb-4">Thông tin liên hệ</Title>
              
              <Space direction="vertical" size="large" className="w-full">
                <div className="flex items-start">
                  <PhoneOutlined className="text-indigo-500 text-xl mt-1 mr-3" />
                  <div>
                    <Text strong className="block">Hotline</Text>
                    <Text className="text-lg">1900 xxxx</Text>
                    <Text type="secondary" className="block">
                      Thời gian làm việc: 8:00 - 22:00 mỗi ngày
                    </Text>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MailOutlined className="text-indigo-500 text-xl mt-1 mr-3" />
                  <div>
                    <Text strong className="block">Email hỗ trợ</Text>
                    <Text className="text-lg">support@tansport.com</Text>
                    <Text type="secondary" className="block">
                      Phản hồi trong vòng 24 giờ
                    </Text>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <EnvironmentOutlined className="text-indigo-500 text-xl mt-1 mr-3" />
                  <div>
                    <Text strong className="block">Văn phòng</Text>
                    <Text className="text-lg">Lầu 2, Tòa nhà Innovation, 15 Tân Thuận Đông, Quận 7, TP.HCM</Text>
                  </div>
                </div>
              </Space>
            </Card>
            
            <Card className="shadow-sm">
              <Title level={4} className="mb-4">Câu hỏi thường gặp</Title>
              <Paragraph>
                Trước khi liên hệ, bạn có thể xem qua các câu hỏi thường gặp để tìm câu trả lời nhanh chóng.
              </Paragraph>
              <Link to="/faq">
                <Button 
                  type="primary" 
                  ghost 
                  icon={<InfoCircleOutlined />}
                  className="w-full mt-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-600"
                >
                  Xem câu hỏi thường gặp
                </Button>
              </Link>
              
              <Divider />
              
              <Title level={4} className="mb-4">Trung tâm trợ giúp</Title>
              <Paragraph>
                Trung tâm trợ giúp cung cấp các hướng dẫn chi tiết về cách sử dụng dịch vụ của chúng tôi.
              </Paragraph>
              <Link to="/help">
                <Button 
                  type="primary" 
                  ghost
                  icon={<MessageOutlined />}
                  className="w-full mt-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-600"
                >
                  Đến trung tâm trợ giúp
                </Button>
              </Link>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ContactSupport; 