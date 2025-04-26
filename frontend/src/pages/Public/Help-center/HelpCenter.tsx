import React, { useState } from 'react';
import { 
  SearchOutlined, 
  BookOutlined, 
  CreditCardOutlined, 
  UserOutlined, 
  EnvironmentOutlined,
  ClockCircleOutlined, 
  CalculatorOutlined, 
  SafetyOutlined,
  PhoneOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Input, Button, Collapse, Row, Col, Card, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

// Danh mục trợ giúp
const categories = [
  {
    id: 'booking',
    icon: <BookOutlined />,
    title: 'Đặt sân',
    description: 'Hướng dẫn về cách đặt sân, hủy đặt, và thay đổi lịch'
  },
  {
    id: 'payment',
    icon: <CreditCardOutlined />,
    title: 'Thanh toán',
    description: 'Các phương thức thanh toán, hoàn tiền, và xử lý thanh toán'
  },
  {
    id: 'account',
    icon: <UserOutlined />,
    title: 'Tài khoản',
    description: 'Quản lý tài khoản, thông tin cá nhân, mật khẩu'
  },
  {
    id: 'facilities',
    icon: <EnvironmentOutlined />,
    title: 'Cơ sở thể thao',
    description: 'Thông tin về cơ sở, tiện ích, và quy định sử dụng'
  },
  {
    id: 'schedule',
    icon: <ClockCircleOutlined />,
    title: 'Lịch đặt',
    description: 'Xem và quản lý lịch đặt sân của bạn'
  },
  {
    id: 'pricing',
    icon: <CalculatorOutlined />,
    title: 'Giá cả',
    description: 'Thông tin về giá cả, khung giờ, và chính sách giá'
  },
  {
    id: 'security',
    icon: <SafetyOutlined />,
    title: 'Bảo mật',
    description: 'Bảo mật tài khoản và thông tin cá nhân'
  },
  {
    id: 'partner',
    icon: <TeamOutlined />,
    title: 'Đối tác',
    description: 'Thông tin dành cho chủ sân và đối tác'
  }
];

// Câu hỏi thường gặp
const faqs = [
  {
    id: 1,
    question: 'Làm thế nào để đặt sân?',
    answer: 'Để đặt sân, bạn có thể truy cập vào trang chủ, tìm kiếm sân phù hợp, chọn ngày và giờ mong muốn, rồi tiến hành thanh toán để hoàn tất việc đặt sân.'
  },
  {
    id: 2,
    question: 'Làm thế nào để hủy đặt sân?',
    answer: 'Bạn có thể hủy đặt sân bằng cách đăng nhập vào tài khoản, vào mục "Lịch sử đặt sân", chọn lịch đặt sân cần hủy và nhấn vào nút "Hủy đặt sân". Lưu ý rằng việc hủy đặt sân phải tuân theo chính sách hủy của chúng tôi.'
  },
  {
    id: 3,
    question: 'Chính sách hoàn tiền như thế nào?',
    answer: 'Nếu bạn hủy đặt sân trước 24 giờ so với thời gian đặt, bạn sẽ được hoàn lại 100% thành điểm tích lũy. Nếu hủy trong khoảng 12-24 giờ, bạn sẽ được hoàn 50% thành điểm tích lũy. Nếu hủy dưới 12 giờ, bạn sẽ không được hoàn tiền.'
  },
  {
    id: 4,
    question: 'Làm thế nào để đổi mật khẩu?',
    answer: 'Để đổi mật khẩu, bạn cần đăng nhập vào tài khoản, vào phần "Thông tin tài khoản", chọn "Đổi mật khẩu", nhập mật khẩu cũ và mật khẩu mới, sau đó nhấn "Lưu thay đổi".'
  },
  {
    id: 5,
    question: 'Tôi có thể đặt sân định kỳ không?',
    answer: 'Có, bạn có thể đặt sân định kỳ bằng cách chọn tùy chọn "Đặt lặp lại" trong quá trình đặt sân. Bạn có thể chọn đặt hàng ngày, hàng tuần, hoặc hàng tháng tùy theo nhu cầu của bạn.'
  },
  {
    id: 6,
    question: 'Làm thế nào để trở thành đối tác của TanSport?',
    answer: 'Để trở thành đối tác của TanSport, bạn cần có cơ sở thể thao và đăng ký tài khoản chủ sân trên hệ thống. Sau đó, bạn cần cung cấp thông tin về cơ sở thể thao và chờ xác nhận từ đội ngũ của chúng tôi.'
  }
];

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gray-100 py-12 text-center shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <Title level={1} className="text-gray-800 text-3xl md:text-4xl font-bold mb-6">
            Chào mừng đến với Trung tâm Trợ giúp
          </Title>
          <Paragraph className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Tìm kiếm câu trả lời cho câu hỏi của bạn hoặc duyệt qua các chủ đề bên dưới
          </Paragraph>
          
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Input
                placeholder="Tìm kiếm câu trả lời..."
                prefix={<SearchOutlined className="text-gray-400" />}
                size="large"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Danh mục chính */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Title level={2} className="text-center mb-8">Chọn chủ đề bạn cần hỗ trợ</Title>
        
        <Row gutter={[16, 16]}>
          {categories.map(category => (
            <Col xs={12} md={8} lg={6} key={category.id}>
              <Card 
                hoverable 
                className="text-center h-full transition-all duration-300 hover:shadow-md" 
                bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                <div className="text-indigo-500 text-4xl mb-4 transition-colors duration-300">{category.icon}</div>
                <Title level={4} className="mb-2">{category.title}</Title>
                <Paragraph type="secondary" className="text-sm flex-grow">
                  {category.description}
                </Paragraph>
                <Link to={`/help/${category.id}`}>
                  <Button type="link" className="mt-2 p-0 text-indigo-600 hover:text-indigo-800">
                    Xem chi tiết
                  </Button>
                </Link>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      
      {/* Câu hỏi phổ biến */}
      <div className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <Title level={2} className="text-center mb-8">Câu hỏi thường gặp</Title>
          
          <Collapse className="bg-white">
            {faqs.map(faq => (
              <Panel 
                header={<span className="font-medium text-base">{faq.question}</span>} 
                key={faq.id}
              >
                <div className="text-gray-700 pt-2">{faq.answer}</div>
              </Panel>
            ))}
          </Collapse>
          
          <div className="text-center mt-8">
            <Link to="/faq">
              <Button type="primary" size="large">Xem thêm câu hỏi</Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Kênh hỗ trợ khác */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Title level={2} className="text-center mb-8">Vẫn chưa tìm thấy câu trả lời?</Title>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card className="text-center h-full hover:shadow-md transition-all duration-300">
              <MessageOutlined className="text-4xl text-indigo-500 mb-4" />
              <Title level={4} className="mb-2">Liên hệ hỗ trợ</Title>
              <Paragraph className="text-gray-500 mb-4">
                Gửi yêu cầu hỗ trợ cho đội ngũ của chúng tôi
              </Paragraph>
              <Link to="/contact">
                <Button type="primary" className="bg-indigo-600 hover:bg-indigo-700 border-none">Liên hệ ngay</Button>
              </Link>
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card className="text-center h-full hover:shadow-md transition-all duration-300">
              <QuestionCircleOutlined className="text-4xl text-indigo-500 mb-4" />
              <Title level={4} className="mb-2">Câu hỏi thường gặp</Title>
              <Paragraph className="text-gray-500 mb-4">
                Xem danh sách câu hỏi thường gặp đầy đủ
              </Paragraph>
              <Link to="/faq">
                <Button type="primary" className="bg-indigo-600 hover:bg-indigo-700 border-none">Xem FAQ</Button>
              </Link>
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card className="text-center h-full hover:shadow-md transition-all duration-300">
              <PhoneOutlined className="text-4xl text-indigo-500 mb-4" />
              <Title level={4} className="mb-2">Hotline hỗ trợ</Title>
              <Paragraph className="text-gray-500 mb-4">
                Gọi cho chúng tôi trong giờ làm việc
              </Paragraph>
              <div className="text-lg font-medium text-indigo-600">1900 xxxx</div>
              <div className="text-sm text-gray-500 mt-1">8:00 - 22:00 mỗi ngày</div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default HelpCenter; 