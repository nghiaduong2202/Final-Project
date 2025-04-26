import React, { useState } from 'react';
import { 
  Collapse, 
  Input, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Card, 
  List,
  Divider,
  Space
} from 'antd';
import { 
  SearchOutlined, 
  BookOutlined, 
  CreditCardOutlined,
  UserOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined, 
  QuestionCircleOutlined,
  MessageOutlined,
  RightOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

// Định nghĩa các loại câu hỏi
interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

// Danh mục FAQ
const categories = [
  { key: 'all', name: 'Tất cả', icon: <QuestionCircleOutlined /> },
  { key: 'booking', name: 'Đặt sân', icon: <BookOutlined /> },
  { key: 'payment', name: 'Thanh toán', icon: <CreditCardOutlined /> },
  { key: 'account', name: 'Tài khoản', icon: <UserOutlined /> },
  { key: 'facilities', name: 'Cơ sở thể thao', icon: <EnvironmentOutlined /> },
  { key: 'schedule', name: 'Lịch đặt', icon: <ClockCircleOutlined /> }
];

// Danh sách câu hỏi thường gặp
const faqList: FAQ[] = [
  {
    id: 1,
    question: 'Làm thế nào để đặt sân?',
    answer: 'Để đặt sân, bạn có thể truy cập vào trang chủ, tìm kiếm sân phù hợp, chọn ngày và giờ mong muốn, rồi tiến hành thanh toán để hoàn tất việc đặt sân.',
    category: 'booking'
  },
  {
    id: 2,
    question: 'Làm thế nào để hủy đặt sân?',
    answer: 'Bạn có thể hủy đặt sân bằng cách đăng nhập vào tài khoản, vào mục "Lịch sử đặt sân", chọn lịch đặt sân cần hủy và nhấn vào nút "Hủy đặt sân". Lưu ý rằng việc hủy đặt sân phải tuân theo chính sách hủy của chúng tôi.',
    category: 'booking'
  },
  {
    id: 3,
    question: 'Chính sách hoàn tiền như thế nào?',
    answer: 'Nếu bạn hủy đặt sân trước 24 giờ so với thời gian đặt, bạn sẽ được hoàn lại 100% thành điểm tích lũy. Nếu hủy trong khoảng 12-24 giờ, bạn sẽ được hoàn 50% thành điểm tích lũy. Nếu hủy dưới 12 giờ, bạn sẽ không được hoàn tiền.',
    category: 'payment'
  },
  {
    id: 4,
    question: 'Làm thế nào để đổi mật khẩu?',
    answer: 'Để đổi mật khẩu, bạn cần đăng nhập vào tài khoản, vào phần "Thông tin tài khoản", chọn "Đổi mật khẩu", nhập mật khẩu cũ và mật khẩu mới, sau đó nhấn "Lưu thay đổi".',
    category: 'account'
  },
  {
    id: 5,
    question: 'Tôi có thể đặt sân định kỳ không?',
    answer: 'Có, bạn có thể đặt sân định kỳ bằng cách chọn tùy chọn "Đặt lặp lại" trong quá trình đặt sân. Bạn có thể chọn đặt hàng ngày, hàng tuần, hoặc hàng tháng tùy theo nhu cầu của bạn.',
    category: 'booking'
  },
  {
    id: 6,
    question: 'Làm thế nào để trở thành đối tác của TanSport?',
    answer: 'Để trở thành đối tác của TanSport, bạn cần có cơ sở thể thao và đăng ký tài khoản chủ sân trên hệ thống. Sau đó, bạn cần cung cấp thông tin về cơ sở thể thao và chờ xác nhận từ đội ngũ của chúng tôi.',
    category: 'account'
  },
  {
    id: 7,
    question: 'Tôi có thể sử dụng những phương thức thanh toán nào?',
    answer: 'TanSport hỗ trợ nhiều phương thức thanh toán như thẻ tín dụng/ghi nợ, ví điện tử (MoMo, ZaloPay, VNPay), và chuyển khoản ngân hàng. Bạn có thể chọn phương thức thanh toán phù hợp trong quá trình đặt sân.',
    category: 'payment'
  },
  {
    id: 8,
    question: 'Làm thế nào để tìm sân gần vị trí của tôi?',
    answer: 'Bạn có thể sử dụng tính năng tìm kiếm trên trang chủ và nhập địa điểm hiện tại của bạn, hoặc cho phép ứng dụng truy cập vị trí để tự động tìm kiếm các sân gần bạn nhất.',
    category: 'facilities'
  },
  {
    id: 9,
    question: 'Tôi có thể đặt nhiều sân cùng một lúc không?',
    answer: 'Có, bạn có thể đặt nhiều sân cùng một lúc bằng cách thêm từng sân vào giỏ hàng của bạn và thanh toán cùng một lúc.',
    category: 'booking'
  },
  {
    id: 10,
    question: 'Làm thế nào để xem lịch đặt sân của tôi?',
    answer: 'Bạn có thể xem lịch đặt sân của mình bằng cách đăng nhập vào tài khoản và truy cập vào mục "Lịch sử đặt sân" hoặc "Lịch sắp tới" trong trang cá nhân của bạn.',
    category: 'schedule'
  },
  {
    id: 11,
    question: 'Tôi có thể thay đổi thời gian đặt sân sau khi đã đặt không?',
    answer: 'Có, bạn có thể thay đổi thời gian đặt sân bằng cách vào mục "Lịch sử đặt sân", chọn lịch đặt sân cần thay đổi và nhấn vào nút "Thay đổi lịch". Lưu ý rằng việc thay đổi lịch phải tuân theo chính sách của chúng tôi.',
    category: 'schedule'
  },
  {
    id: 12,
    question: 'Làm thế nào để đánh giá một cơ sở thể thao?',
    answer: 'Sau khi hoàn thành lịch đặt sân, bạn sẽ nhận được thông báo để đánh giá trải nghiệm của mình. Bạn cũng có thể vào mục "Lịch sử đặt sân", chọn lịch đã hoàn thành và nhấn vào nút "Đánh giá".',
    category: 'facilities'
  },
  {
    id: 13,
    question: 'Tôi có thể quản lý nhiều tài khoản cho một đội không?',
    answer: 'Hiện tại, mỗi người dùng chỉ có thể quản lý một tài khoản. Tuy nhiên, bạn có thể tạo một đội và mời các thành viên tham gia, sau đó phân công nhiệm vụ cho họ.',
    category: 'account'
  },
  {
    id: 14,
    question: 'Tôi không nhận được email xác nhận đặt sân, phải làm thế nào?',
    answer: 'Đầu tiên, hãy kiểm tra thư mục spam/rác trong hộp thư của bạn. Nếu vẫn không tìm thấy, vui lòng liên hệ bộ phận hỗ trợ khách hàng để được giúp đỡ.',
    category: 'booking'
  },
  {
    id: 15,
    question: 'Tôi có thể nhận hóa đơn VAT cho việc đặt sân không?',
    answer: 'Có, bạn có thể yêu cầu hóa đơn VAT bằng cách chọn tùy chọn "Yêu cầu hóa đơn VAT" trong quá trình đặt sân và cung cấp thông tin hóa đơn của bạn.',
    category: 'payment'
  }
];

const FAQ: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Lọc câu hỏi theo danh mục và từ khóa tìm kiếm
  const filteredFAQs = faqList.filter(faq => {
    const matchCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchQuery = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchCategory && matchQuery;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gray-100 py-12 text-center shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <Title level={1} className="text-gray-800 text-3xl md:text-4xl font-bold mb-6">
            Câu hỏi thường gặp
          </Title>
          <Paragraph className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Tìm kiếm câu trả lời cho các câu hỏi phổ biến về TanSport
          </Paragraph>
          
          <div className="max-w-2xl mx-auto">
            <Input
              placeholder="Tìm kiếm câu hỏi..."
              prefix={<SearchOutlined className="text-gray-400" />}
              size="large"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg shadow-sm"
            />
          </div>
        </div>
      </div>
      
      {/* Nội dung FAQ */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Row gutter={[32, 24]}>
          {/* Sidebar danh mục */}
          <Col xs={24} md={6}>
            <Card className="shadow-sm">
              <Title level={4} className="mb-4">Danh mục</Title>
              
              <List
                dataSource={categories}
                renderItem={(category) => (
                  <List.Item 
                    className={`cursor-pointer hover:bg-gray-100 rounded py-2 px-3 -mx-3 transition-colors ${activeCategory === category.key ? 'bg-indigo-50 text-indigo-600' : ''}`}
                    onClick={() => setActiveCategory(category.key)}
                  >
                    <div className="flex items-center w-full">
                      <span className="mr-3 text-lg">{category.icon}</span>
                      <span className="flex-grow">{category.name}</span>
                      {activeCategory === category.key && (
                        <RightOutlined />
                      )}
                    </div>
                  </List.Item>
                )}
              />
              
              <Divider />
              
              <div className="text-center">
                <Paragraph>
                  Không tìm thấy câu trả lời bạn cần?
                </Paragraph>
                <Link to="/contact">
                  <Button type="primary" icon={<MessageOutlined />} className="bg-indigo-600 hover:bg-indigo-700 border-none">
                    Liên hệ hỗ trợ
                  </Button>
                </Link>
              </div>
            </Card>
          </Col>
          
          {/* Nội dung chính */}
          <Col xs={24} md={18}>
            <Card className="shadow-sm">
              <Title level={3} className="mb-6">
                {categories.find(cat => cat.key === activeCategory)?.name || 'Tất cả'} ({filteredFAQs.length})
              </Title>
              
              {filteredFAQs.length > 0 ? (
                <Collapse 
                  accordion 
                  expandIconPosition="end"
                  className="bg-white"
                >
                  {filteredFAQs.map(faq => (
                    <Panel 
                      header={<span className="font-medium text-base">{faq.question}</span>} 
                      key={faq.id}
                    >
                      <div className="text-gray-700 pt-2 pb-2">{faq.answer}</div>
                    </Panel>
                  ))}
                </Collapse>
              ) : (
                <div className="text-center py-8">
                  <QuestionCircleOutlined className="text-4xl text-gray-300 mb-4" />
                  <Title level={4}>Không tìm thấy câu hỏi</Title>
                  <Paragraph className="text-gray-500">
                    Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
                  </Paragraph>
                </div>
              )}
            </Card>
            
            <div className="mt-8 text-center">
              <Title level={4} className="mb-4">Bạn vẫn cần trợ giúp?</Title>
              <Paragraph className="mb-6">
                Nếu bạn không tìm thấy câu trả lời, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi
              </Paragraph>
              <Space size="large">
                <Link to="/help">
                  <Button size="large" icon={<QuestionCircleOutlined />} className="border-indigo-500 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-600">
                    Trung tâm trợ giúp
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button type="primary" size="large" icon={<MessageOutlined />} className="bg-indigo-600 hover:bg-indigo-700 border-none">
                    Liên hệ hỗ trợ
                  </Button>
                </Link>
              </Space>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default FAQ; 