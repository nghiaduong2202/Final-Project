import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Typography, Table, DatePicker, 
  Button, Space, Progress, Badge, Avatar, Tabs, Tag,
  Select, Input, Form, Rate, Modal, Grid
} from 'antd';
import {
  StarOutlined, MessageOutlined, UserOutlined, 
  ArrowUpOutlined, ReloadOutlined,
  CommentOutlined, LikeOutlined
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/charts';
import dayjs from 'dayjs';
import type { TableProps } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

// Interfaces
interface Facility {
  id: string;
  name: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  positiveRatePercentage: number;
  negativeReviewsCount: number;
  newReviewsCount: number;
  ratingDistribution: RatingItem[];
  reviewTrend: ReviewTrendItem[];
}

interface RatingItem {
  rating: number;
  count: number;
}

interface ReviewTrendItem {
  date: string;
  count: number;
}

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  bookingId: string;
  service: string;
  rating: number;
  comment: string;
  timestamp: string;
  images?: string[];
  reply?: {
    content: string;
    timestamp: string;
  };
  status: 'pending' | 'replied';
}

// Thêm mock data
// Generate mock reviews
const mockReviews: Review[] = [
  {
    id: '1',
    userName: 'Nguyễn Văn A',
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    bookingId: 'B0012345',
    service: 'Sân cầu lông - Sân 3',
    rating: 5,
    comment: 'Sân rất tốt, nhân viên phục vụ chu đáo. Tôi rất hài lòng với trải nghiệm tại đây.',
    timestamp: '2023-12-15T09:30:00Z',
    images: [
      'https://picsum.photos/id/26/200/200',
      'https://picsum.photos/id/27/200/200'
    ],
    status: 'replied',
    reply: {
      content: 'Cảm ơn bạn đã đánh giá tốt cho sân của chúng tôi. Chúng tôi rất vui khi bạn có trải nghiệm tốt và mong sẽ được phục vụ bạn trong thời gian tới!',
      timestamp: '2023-12-15T10:30:00Z'
    }
  },
  {
    id: '2',
    userName: 'Trần Thị B',
    userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    bookingId: 'B0012346',
    service: 'Sân cầu lông - Sân 2',
    rating: 4,
    comment: 'Sân đẹp, sạch sẽ. Tuy nhiên tôi nghĩ ánh sáng có thể được cải thiện thêm.',
    timestamp: '2023-12-10T15:45:00Z',
    status: 'pending'
  },
  {
    id: '3',
    userName: 'Lê Văn C',
    userAvatar: 'https://randomuser.me/api/portraits/men/62.jpg',
    bookingId: 'B0012350',
    service: 'Sân cầu lông - Sân 1',
    rating: 3,
    comment: 'Sân ở mức trung bình, không quá tệ nhưng không tốt lắm. Tôi nghĩ cần cải thiện về chất lượng mặt sân và nhà vệ sinh.',
    timestamp: '2023-12-05T18:20:00Z',
    status: 'replied',
    reply: {
      content: 'Cảm ơn bạn đã góp ý. Chúng tôi đang có kế hoạch nâng cấp mặt sân và cải thiện các tiện ích trong thời gian tới.',
      timestamp: '2023-12-05T20:30:00Z'
    }
  },
  {
    id: '4',
    userName: 'Phạm Thị D',
    userAvatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    bookingId: 'B0012355',
    service: 'Sân cầu lông - Sân 4',
    rating: 2,
    comment: 'Sân quá nóng, không có đủ quạt. Nhân viên phục vụ còn chậm.',
    timestamp: '2023-12-01T12:10:00Z',
    status: 'pending'
  },
  {
    id: '5',
    userName: 'Hoàng Văn E',
    userAvatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    bookingId: 'B0012360',
    service: 'Sân cầu lông - Sân 2',
    rating: 5,
    comment: 'Tuyệt vời! Tôi rất thích sân này và sẽ quay lại vào tuần sau.',
    timestamp: '2023-11-28T09:45:00Z',
    images: [
      'https://picsum.photos/id/28/200/200'
    ],
    status: 'replied',
    reply: {
      content: 'Cảm ơn bạn đã đánh giá tích cực. Chúng tôi rất vui được phục vụ bạn và mong sẽ gặp lại bạn vào tuần sau!',
      timestamp: '2023-11-28T11:30:00Z'
    }
  }
];

const mockReviewStats: ReviewStats = {
  averageRating: 4.2,
  totalReviews: 58,
  positiveRatePercentage: 92,
  negativeReviewsCount: 2,
  newReviewsCount: 3,
  ratingDistribution: [
    { rating: 5, count: 35 },
    { rating: 4, count: 15 },
    { rating: 3, count: 6 },
    { rating: 2, count: 1 },
    { rating: 1, count: 1 }
  ],
  reviewTrend: [
    { date: '2023-11-01', count: 5 },
    { date: '2023-11-08', count: 8 },
    { date: '2023-11-15', count: 10 },
    { date: '2023-11-22', count: 12 },
    { date: '2023-11-29', count: 15 },
    { date: '2023-12-06', count: 8 },
  ]
};

const ReviewManagement: React.FC = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  
  // States
  const [facilities] = useState<Facility[]>([
    { id: '1', name: 'Sân cầu lông Phạm Kha' },
    { id: '2', name: 'Sân bóng đá Nguyễn Du' }
  ]);
  const [selectedFacility, setSelectedFacility] = useState<string>('1');
  const [reviewStats] = useState<ReviewStats>(mockReviewStats);
  
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [loading, setLoading] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Filter states
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'replied'>('all');
  const [ratingFilter, setRatingFilter] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  useEffect(() => {
    // In a real app, we would fetch facilities from the API
  }, []);

  useEffect(() => {
    if (selectedFacility) {
      fetchReviewData();
    }
  }, [selectedFacility, statusFilter, ratingFilter, searchText, dateRange, activeTab]);

  const fetchReviewData = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Filter reviews based on current filters
      let filteredReviews = [...mockReviews];
      
      if (statusFilter !== 'all') {
        filteredReviews = filteredReviews.filter(review => review.status === statusFilter);
      }
      
      if (ratingFilter.length > 0) {
        filteredReviews = filteredReviews.filter(review => ratingFilter.includes(review.rating));
      }
      
      if (searchText) {
        const lowerSearch = searchText.toLowerCase();
        filteredReviews = filteredReviews.filter(
          review => 
            review.userName.toLowerCase().includes(lowerSearch) || 
            review.service.toLowerCase().includes(lowerSearch) ||
            review.bookingId.toLowerCase().includes(lowerSearch)
        );
      }
      
      if (dateRange[0] && dateRange[1]) {
        filteredReviews = filteredReviews.filter(review => {
          const reviewDate = dayjs(review.timestamp);
          return reviewDate.isAfter(dateRange[0]) && reviewDate.isBefore(dateRange[1]);
        });
      }
      
      setReviews(filteredReviews);
      setLoading(false);
    }, 500);
  };

  const handleReplySubmit = () => {
    if (!currentReview || !replyContent.trim()) return;
    
    // In a real app, this would be an API call
    const updatedReviews = reviews.map(review => 
      review.id === currentReview.id 
        ? {
            ...review,
            status: 'replied' as const,
            reply: {
              content: replyContent,
              timestamp: new Date().toISOString()
            }
          }
        : review
    );
    
    setReviews(updatedReviews);
    setReplyModalVisible(false);
    setReplyContent('');
    setCurrentReview(null);
  };

  const openReplyModal = (review: Review) => {
    setCurrentReview(review);
    setReplyContent(review.reply?.content || '');
    setReplyModalVisible(true);
  };

  const handleReset = () => {
    setStatusFilter('all');
    setRatingFilter([]);
    setSearchText('');
    setDateRange([null, null]);
  };

  // Chart configurations
  const reviewTrendConfig = {
    data: reviewStats.reviewTrend,
    xField: 'date',
    yField: 'count',
    smooth: true,
    meta: {
      date: {
        alias: 'Ngày',
      },
      count: {
        alias: 'Số lượng đánh giá',
      },
    },
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  // Table columns with responsive adjustments
  const columns: TableProps<Review>['columns'] = [
    {
      title: 'Người đánh giá',
      key: 'user',
      render: (_, review) => (
        <div className="flex items-center space-x-3">
          <Avatar src={review.userAvatar} icon={<UserOutlined />} />
          <div>
            <Text strong>{review.userName}</Text>
            <div>
              <Text type="secondary" className="text-xs">Đơn #{review.bookingId}</Text>
            </div>
          </div>
        </div>
      ),
      responsive: ['md'],
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      render: (_, review) => (
        <div>
          <div className="mb-1">
            <Rate disabled defaultValue={review.rating} />
            <Text type="secondary" className="ml-2">
              {dayjs(review.timestamp).format('DD/MM/YYYY HH:mm')}
            </Text>
          </div>
          <Paragraph ellipsis={{ rows: isMobile ? 1 : 2 }}>{review.comment}</Paragraph>
          {review.images && review.images.length > 0 && (
            <div className="flex mt-2 space-x-2">
              {review.images.map((image, index) => (
                <div 
                  key={index} 
                  className="w-12 h-12 rounded overflow-hidden"
                  style={{ 
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              ))}
            </div>
          )}
          {review.reply && (
            <div className="mt-2 bg-gray-50 p-2 rounded">
              <Text type="secondary" className="text-xs">
                Phản hồi của bạn - {dayjs(review.reply.timestamp).format('DD/MM/YYYY HH:mm')}
              </Text>
              <Paragraph ellipsis={{ rows: isMobile ? 1 : 2 }} className="text-sm mt-1">
                {review.reply.content}
              </Paragraph>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'service',
      key: 'service',
      render: (service) => <Text>{service}</Text>,
      responsive: ['md'],
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, review) => (
        <Badge 
          status={review.status === 'replied' ? 'success' : 'warning'} 
          text={review.status === 'replied' ? 'Đã phản hồi' : 'Chưa phản hồi'} 
        />
      ),
      responsive: ['md'],
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, review) => (
        <Space>
          <Button 
            type={review.status === 'pending' ? 'primary' : 'default'} 
            onClick={() => openReplyModal(review)}
            size={isMobile ? 'small' : 'middle'}
          >
            {review.status === 'pending' ? 'Phản hồi' : 'Xem/Sửa phản hồi'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <Card className="mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
          <Title level={4} className="mb-2 md:mb-0">Quản lý đánh giá</Title>
          <Select
            placeholder="Chọn cơ sở"
            style={{ width: isMobile ? '100%' : 300 }}
            value={selectedFacility}
            onChange={setSelectedFacility}
          >
            {facilities.map((facility) => (
              <Option key={facility.id} value={facility.id}>{facility.name}</Option>
            ))}
          </Select>
        </div>
        
        <Row gutter={[8, 8]} className="mb-4 md:mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card className="h-full">
              <Statistic
                title="Đánh giá trung bình"
                value={reviewStats.averageRating}
                precision={1}
                valueStyle={{ color: '#1890ff' }}
                prefix={<StarOutlined />}
                suffix="/ 5"
              />
              <Rate disabled allowHalf defaultValue={reviewStats.averageRating} className="mt-2" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="h-full">
              <Statistic
                title="Tổng đánh giá"
                value={reviewStats.totalReviews}
                valueStyle={{ color: '#52c41a' }}
                prefix={<MessageOutlined />}
              />
              <div className="mt-2">
                <Tag color="green">
                  <ArrowUpOutlined /> 12% so với tháng trước
                </Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="h-full">
              <Statistic
                title="Đánh giá tích cực"
                value={reviewStats.positiveRatePercentage}
                precision={0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<LikeOutlined />}
                suffix="%"
              />
              <Progress 
                percent={reviewStats.positiveRatePercentage} 
                showInfo={false} 
                strokeColor="#52c41a" 
                className="mt-2" 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="h-full">
              <Statistic
                title="Cần phản hồi"
                value={reviewStats.negativeReviewsCount}
                valueStyle={{ color: reviewStats.negativeReviewsCount > 0 ? '#f5222d' : '#52c41a' }}
                prefix={<CommentOutlined />}
              />
              <div className="mt-2">
                <Button 
                  type="primary" 
                  danger={reviewStats.negativeReviewsCount > 0}
                  disabled={reviewStats.negativeReviewsCount === 0}
                  size={isMobile ? 'small' : 'middle'}
                  block={isMobile}
                >
                  Xem đánh giá cần phản hồi
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
        
        <div className="mt-4 md:mt-6">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={[
              {
                key: 'overview',
                label: 'Tổng quan đánh giá',
                children: (
                  <Row gutter={[8, 8]}>
                    <Col xs={24} md={12}>
                      <Card title="Phân bố đánh giá theo sao" className="h-full">
                        <Line {...reviewTrendConfig} height={isMobile ? 250 : 300} />
                      </Card>
                    </Col>
                    <Col xs={24} md={12}>
                      <Card title="Xu hướng đánh giá theo thời gian" className="h-full">
                        <Pie 
                          data={reviewStats.ratingDistribution.map(item => ({
                            type: `${item.rating} sao`,
                            value: item.count
                          }))}
                          angleField="value"
                          colorField="type"
                          radius={0.8}
                          legend={{
                            position: isMobile ? 'bottom' : 'right',
                            layout: isMobile ? 'horizontal' : 'vertical'
                          }}
                          tooltip={{
                            formatter: (datum: { type: string; value: number }) => {
                              return { name: datum.type, value: datum.value };
                            }
                          }}
                          interactions={[{ type: 'element-active' }]}
                          height={isMobile ? 250 : 300}
                        />
                      </Card>
                    </Col>
                  </Row>
                )
              },
              {
                key: 'list',
                label: 'Danh sách đánh giá',
                children: (
                  <Card>
                    <div className="review-filter-group">
                      <div className="review-filter-item">
                        <Text strong className="review-filter-label">Trạng thái:</Text>
                        <Select
                          value={statusFilter}
                          onChange={setStatusFilter}
                          style={{ minWidth: 160 }}
                        >
                          <Option value="all">Tất cả</Option>
                          <Option value="pending">Chưa phản hồi</Option>
                          <Option value="replied">Đã phản hồi</Option>
                        </Select>
                      </div>
                      
                      <div className="review-filter-item">
                        <Text strong className="review-filter-label">Đánh giá:</Text>
                        <Select
                          mode="multiple"
                          placeholder="Chọn số sao"
                          value={ratingFilter}
                          onChange={setRatingFilter}
                          style={{ minWidth: 160 }}
                        >
                          <Option value={5}>5 sao</Option>
                          <Option value={4}>4 sao</Option>
                          <Option value={3}>3 sao</Option>
                          <Option value={2}>2 sao</Option>
                          <Option value={1}>1 sao</Option>
                        </Select>
                      </div>
                      
                      <div className="review-filter-item">
                        <Text strong className="review-filter-label">Thời gian:</Text>
                        <RangePicker 
                          value={dateRange}
                          onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                          style={{ minWidth: 240 }}
                        />
                      </div>
                    </div>
                    
                    <div className="review-filter-group mt-4">
                      <div className="review-filter-item" style={{ flex: 1 }}>
                        <Input.Search
                          placeholder="Tìm kiếm theo tên, dịch vụ, mã đơn..."
                          value={searchText}
                          onChange={e => setSearchText(e.target.value)}
                          onSearch={fetchReviewData}
                        />
                      </div>
                      
                      <div className="review-filter-item" style={{ width: 'auto' }}>
                        <Button 
                          icon={<ReloadOutlined />} 
                          onClick={handleReset}
                        >
                          Đặt lại bộ lọc
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Table
                        dataSource={reviews}
                        columns={columns}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                          pageSize: isMobile ? 5 : 10,
                          showTotal: total => `Tổng ${total} đánh giá`,
                          showSizeChanger: !isMobile,
                          showQuickJumper: !isMobile,
                        }}
                        scroll={{ x: 800 }}
                        className="review-table"
                      />
                    </div>
                  </Card>
                )
              }
            ]}
          />
        </div>
      </Card>
      
      <Modal
        title={currentReview?.status === 'pending' ? "Phản hồi đánh giá" : "Xem/Sửa phản hồi"}
        open={replyModalVisible}
        onOk={handleReplySubmit}
        onCancel={() => setReplyModalVisible(false)}
        okText="Gửi phản hồi"
        cancelText="Hủy"
        width={isMobile ? '90%' : 600}
      >
        {currentReview && (
          <>
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <Avatar src={currentReview.userAvatar} icon={<UserOutlined />} />
                <Text strong className="ml-2">{currentReview.userName}</Text>
              </div>
              <Rate disabled defaultValue={currentReview.rating} className="block mb-2" />
              <Paragraph>{currentReview.comment}</Paragraph>
              {currentReview.images && currentReview.images.length > 0 && (
                <div className="flex mt-2 space-x-2">
                  {currentReview.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="w-16 h-16 rounded overflow-hidden"
                      style={{ 
                        backgroundImage: `url(${image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <Form layout="vertical">
              <Form.Item 
                label="Nội dung phản hồi" 
                required
                rules={[{ required: true, message: 'Vui lòng nhập phản hồi' }]}
              >
                <TextArea 
                  rows={4} 
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  placeholder="Nhập phản hồi của bạn tại đây..."
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ReviewManagement; 