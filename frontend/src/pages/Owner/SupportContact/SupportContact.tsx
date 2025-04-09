import React, { useState } from 'react';
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
  Space,
  Steps,
  Result,
  Modal,
  Table,
  Tag,
  Badge,
  Divider
} from 'antd';
import { 
  UploadOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  MessageOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  SolutionOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

// Loại yêu cầu hỗ trợ phù hợp với chủ sân
const supportIssueTypes = [
  { value: 'facility', label: 'Quản lý cơ sở' },
  { value: 'field', label: 'Quản lý sân' },
  { value: 'booking', label: 'Quản lý đặt sân' },
  { value: 'payment', label: 'Vấn đề thanh toán' },
  { value: 'account', label: 'Tài khoản' },
  { value: 'feature', label: 'Yêu cầu tính năng mới' },
  { value: 'bug', label: 'Báo cáo lỗi' },
  { value: 'other', label: 'Khác' }
];

// Form giá trị
interface SupportFormValues {
  issueType: string;
  subject: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  attachments?: UploadFile[];
}

// Mock data hỗ trợ
interface SupportTicket {
  id: string;
  subject: string;
  issueType: string;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  urgency: 'low' | 'medium' | 'high';
  messages: {
    sender: 'user' | 'admin';
    content: string;
    timestamp: string;
    isRead: boolean;
  }[];
}

const mockSupportTickets: SupportTicket[] = [
  {
    id: 'TK-001',
    subject: 'Không thể tạo mới sân cầu lông',
    issueType: 'field',
    createdAt: '2023-12-01T10:30:00Z',
    status: 'in_progress',
    urgency: 'high',
    messages: [
      {
        sender: 'user',
        content: 'Tôi không thể tạo mới sân cầu lông, hệ thống báo lỗi khi tôi ấn nút Lưu.',
        timestamp: '2023-12-01T10:30:00Z',
        isRead: true
      },
      {
        sender: 'admin',
        content: 'Chào bạn, vui lòng cho chúng tôi biết thông báo lỗi cụ thể và gửi ảnh chụp màn hình.',
        timestamp: '2023-12-01T11:15:00Z',
        isRead: true
      },
      {
        sender: 'user',
        content: 'Lỗi hiển thị là "Không thể kết nối đến máy chủ".',
        timestamp: '2023-12-01T11:30:00Z',
        isRead: true
      }
    ]
  },
  {
    id: 'TK-002',
    subject: 'Cách cài đặt khung giờ cao điểm',
    issueType: 'facility',
    createdAt: '2023-11-25T15:45:00Z',
    status: 'resolved',
    urgency: 'medium',
    messages: [
      {
        sender: 'user',
        content: 'Tôi muốn cài đặt giá khác nhau cho khung giờ cao điểm vào cuối tuần, tôi cần làm thế nào?',
        timestamp: '2023-11-25T15:45:00Z',
        isRead: true
      },
      {
        sender: 'admin',
        content: 'Chào bạn, để cài đặt giá khung giờ cao điểm, vui lòng vào phần Quản lý sân > chọn sân > Tab "Cài đặt giá". Tại đây bạn có thể thêm khung giờ và mức giá tương ứng.',
        timestamp: '2023-11-25T16:30:00Z',
        isRead: true
      },
      {
        sender: 'user',
        content: 'Cảm ơn, tôi đã làm được rồi!',
        timestamp: '2023-11-25T17:15:00Z',
        isRead: true
      },
      {
        sender: 'admin',
        content: 'Rất vui khi bạn đã giải quyết được vấn đề. Nếu cần hỗ trợ thêm, hãy liên hệ với chúng tôi.',
        timestamp: '2023-11-25T17:30:00Z',
        isRead: true
      }
    ]
  },
  {
    id: 'TK-003',
    subject: 'Yêu cầu thêm tính năng thống kê khách hàng',
    issueType: 'feature',
    createdAt: '2023-11-15T09:20:00Z',
    status: 'pending',
    urgency: 'low',
    messages: [
      {
        sender: 'user',
        content: 'Tôi muốn có thêm tính năng thống kê và phân tích khách hàng thường xuyên để tạo chương trình khách hàng thân thiết.',
        timestamp: '2023-11-15T09:20:00Z', 
        isRead: true
      }
    ]
  }
];

const SupportContact: React.FC = () => {
  const [form] = Form.useForm<SupportFormValues>();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('new');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketModalVisible, setTicketModalVisible] = useState(false);
  const [messageInput, setMessageInput] = useState('');

  // Xử lý khi submit form
  const onFinish = (values: SupportFormValues) => {
    console.log('Received values:', values);
    // Xử lý gửi form liên hệ ở đây
    setIsSubmitted(true);
    form.resetFields();
  };

  // Xử lý tệp đính kèm
  const normFile = (e: { fileList?: UploadFile[] }): UploadFile[] => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList || [];
  };

  // Hiển thị chi tiết ticket
  const showTicketDetail = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setTicketModalVisible(true);
  };

  // Xử lý gửi tin nhắn mới
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedTicket) return;
    
    // In a real app, this would be an API call
    console.log('Sending message:', messageInput);
    
    // Add message to the selected ticket (mock)
    const updatedTicket = { 
      ...selectedTicket,
      messages: [
        ...selectedTicket.messages,
        {
          sender: 'user',
          content: messageInput,
          timestamp: new Date().toISOString(),
          isRead: false
        }
      ]
    };
    
    setSelectedTicket(updatedTicket as SupportTicket);
    setMessageInput('');
  };

  // Reset form sau khi gửi
  const handleResetForm = () => {
    setIsSubmitted(false);
  };

  // Hiển thị trạng thái ticket
  const renderTicketStatus = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge status="warning" text="Đang chờ xử lý" />;
      case 'in_progress':
        return <Badge status="processing" text="Đang xử lý" />;
      case 'resolved':
        return <Badge status="success" text="Đã giải quyết" />;
      case 'closed':
        return <Badge status="default" text="Đã đóng" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  // Hiển thị độ ưu tiên
  const renderUrgency = (urgency: string) => {
    switch(urgency) {
      case 'low':
        return <Tag color="blue">Thấp</Tag>;
      case 'medium':
        return <Tag color="orange">Trung bình</Tag>;
      case 'high':
        return <Tag color="red">Cao</Tag>;
      default:
        return <Tag>{urgency}</Tag>;
    }
  };

  return (
    <div className="p-6">
      <Card className="mb-6">
        <Title level={3}>Hỗ trợ liên hệ</Title>
        <Paragraph>
          Đội ngũ hỗ trợ của chúng tôi sẵn sàng giúp đỡ bạn giải quyết mọi vấn đề liên quan đến việc quản lý cơ sở thể thao.
        </Paragraph>
        
        {/* Tab chuyển đổi */}
        <div className="flex border-b mb-6">
          <div 
            className={`px-4 py-2 cursor-pointer ${activeTab === 'new' ? 'border-b-2 border-blue-500 text-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('new')}
          >
            Yêu cầu hỗ trợ mới
          </div>
          <div 
            className={`px-4 py-2 cursor-pointer ${activeTab === 'history' ? 'border-b-2 border-blue-500 text-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('history')}
          >
            Lịch sử hỗ trợ
          </div>
        </div>
        
        {activeTab === 'new' ? (
          isSubmitted ? (
            <Result
              status="success"
              title="Yêu cầu hỗ trợ đã được gửi thành công!"
              subTitle="Chúng tôi sẽ phản hồi yêu cầu của bạn trong thời gian sớm nhất. Bạn có thể theo dõi trạng thái yêu cầu trong phần Lịch sử hỗ trợ."
              extra={[
                <Button type="primary" key="back" onClick={handleResetForm}>
                  Tạo yêu cầu mới
                </Button>,
                <Button key="history" onClick={() => setActiveTab('history')}>
                  Xem lịch sử hỗ trợ
                </Button>,
              ]}
            />
          ) : (
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  requiredMark={false}
                >
                  <Form.Item
                    name="issueType"
                    label="Loại vấn đề"
                    rules={[{ required: true, message: 'Vui lòng chọn loại vấn đề' }]}
                  >
                    <Select placeholder="Chọn loại vấn đề">
                      {supportIssueTypes.map(type => (
                        <Option key={type.value} value={type.value}>{type.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  
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
                    name="urgency"
                    label="Mức độ ưu tiên"
                    rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên' }]}
                  >
                    <Select placeholder="Chọn mức độ ưu tiên">
                      <Option value="low">Thấp - Có thể đợi</Option>
                      <Option value="medium">Trung bình - Cần giải quyết sớm</Option>
                      <Option value="high">Cao - Cần giải quyết ngay</Option>
                    </Select>
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
                    >
                      Gửi yêu cầu
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
              
              {/* Hướng dẫn bên phải */}
              <Col xs={24} lg={8}>
                <Card title="Quy trình xử lý hỗ trợ" className="mb-6">
                  <Steps direction="vertical" size="small" current={-1}>
                    <Step 
                      title="Gửi yêu cầu" 
                      description="Điền thông tin và gửi yêu cầu hỗ trợ"
                      icon={<FileTextOutlined />}
                    />
                    <Step 
                      title="Xác nhận" 
                      description="Hệ thống xác nhận yêu cầu và gửi mã ticket"
                      icon={<ClockCircleOutlined />} 
                    />
                    <Step 
                      title="Xử lý" 
                      description="Đội ngũ hỗ trợ xem xét và xử lý yêu cầu của bạn"
                      icon={<SolutionOutlined />} 
                    />
                    <Step 
                      title="Phản hồi" 
                      description="Bạn nhận được phản hồi từ đội ngũ hỗ trợ"
                      icon={<MessageOutlined />} 
                    />
                    <Step 
                      title="Giải quyết" 
                      description="Vấn đề được giải quyết hoặc cần thêm thông tin"
                      icon={<CheckCircleOutlined />} 
                    />
                  </Steps>
                </Card>

                <Card title="Thông tin liên hệ" className="mb-6">
                  <Space direction="vertical" size="middle" className="w-full">
                    <div className="flex items-start">
                      <PhoneOutlined className="text-gray-500 mr-3 mt-1" style={{ fontSize: 18 }} />
                      <div>
                        <Text strong className="block">Hotline</Text>
                        <Text className="text-gray-500">1900 1234</Text>
                        <Text className="block text-gray-500">Thời gian: 8:00 - 20:00 (T2-CN)</Text>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MailOutlined className="text-gray-500 mr-3 mt-1" style={{ fontSize: 18 }} />
                      <div>
                        <Text strong className="block">Email</Text>
                        <Text className="text-gray-500">support@sportsbooking.com</Text>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <QuestionCircleOutlined className="text-gray-500 mr-3 mt-1" style={{ fontSize: 18 }} />
                      <div>
                        <Text strong className="block">Trung tâm trợ giúp</Text>
                        <Text className="text-gray-500">
                          Tham khảo <a href="/help-center">Trung tâm trợ giúp</a> hoặc <a href="/faq">FAQ</a> để tìm câu trả lời nhanh.
                        </Text>
                      </div>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          )
        ) : (
          <div>
            <Table
              dataSource={mockSupportTickets}
              rowKey="id"
              columns={[
                {
                  title: 'Mã yêu cầu',
                  dataIndex: 'id',
                  key: 'id',
                },
                {
                  title: 'Tiêu đề',
                  dataIndex: 'subject',
                  key: 'subject',
                  render: (text) => <Text strong>{text}</Text>,
                },
                {
                  title: 'Loại vấn đề',
                  dataIndex: 'issueType',
                  key: 'issueType',
                  render: (text) => {
                    const issueType = supportIssueTypes.find(i => i.value === text);
                    return issueType ? issueType.label : text;
                  },
                },
                {
                  title: 'Thời gian tạo',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm'),
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: renderTicketStatus,
                },
                {
                  title: 'Độ ưu tiên',
                  dataIndex: 'urgency',
                  key: 'urgency',
                  render: renderUrgency,
                },
                {
                  title: 'Thao tác',
                  key: 'action',
                  render: (_, record) => (
                    <Button type="link" onClick={() => showTicketDetail(record)}>
                      Xem chi tiết
                    </Button>
                  ),
                },
              ]}
              pagination={{ pageSize: 5 }}
            />
          </div>
        )}
      </Card>
      
      {/* Modal xem chi tiết ticket */}
      <Modal
        title={`Chi tiết yêu cầu #${selectedTicket?.id}`}
        open={ticketModalVisible}
        onCancel={() => setTicketModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedTicket && (
          <div>
            <div className="mb-4">
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Tiêu đề:</Text>
                  <div><Text strong>{selectedTicket.subject}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Thời gian tạo:</Text>
                  <div>{dayjs(selectedTicket.createdAt).format('DD/MM/YYYY HH:mm')}</div>
                </Col>
              </Row>
            </div>
            
            <div className="mb-4">
              <Row gutter={16}>
                <Col span={8}>
                  <Text type="secondary">Trạng thái:</Text>
                  <div>{renderTicketStatus(selectedTicket.status)}</div>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Loại vấn đề:</Text>
                  <div>{supportIssueTypes.find(i => i.value === selectedTicket.issueType)?.label}</div>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Độ ưu tiên:</Text>
                  <div>{renderUrgency(selectedTicket.urgency)}</div>
                </Col>
              </Row>
            </div>
            
            <Divider orientation="left">Lịch sử trao đổi</Divider>
            
            <div className="overflow-y-auto p-4 bg-gray-50 rounded-lg mb-4" style={{ maxHeight: '300px' }}>
              {selectedTicket.messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`p-3 rounded-lg max-w-[80%] ${
                      message.sender === 'user'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="mb-1">
                      <Text strong>{message.sender === 'user' ? 'Bạn' : 'Hỗ trợ viên'}</Text>
                    </div>
                    <Paragraph style={{ margin: 0 }}>{message.content}</Paragraph>
                    <div className="text-xs mt-1 text-gray-500">
                      {dayjs(message.timestamp).format('DD/MM/YYYY HH:mm')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedTicket.status !== 'closed' && (
              <div className="mt-4">
                <Form.Item className="mb-2">
                  <TextArea 
                    rows={3} 
                    placeholder="Nhập tin nhắn của bạn..." 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                </Form.Item>
                <Button 
                  type="primary" 
                  icon={<SendOutlined />} 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  Gửi tin nhắn
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SupportContact;