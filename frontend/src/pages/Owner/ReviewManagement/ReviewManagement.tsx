import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Typography, Table, DatePicker, 
  Button, Space, Progress, Badge, Avatar, Tabs, Tag,
  Select, Input, Form, Rate, Modal, Grid, message, Popover
} from 'antd';
import {
  StarOutlined, MessageOutlined, UserOutlined, 
  ArrowUpOutlined, ReloadOutlined,
  CommentOutlined, LikeOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/charts';
import dayjs from 'dayjs';
import type { TableProps } from 'antd';
import { facilityService, FacilityDropdownItem } from '@/services/facility.service';
import { reviewService } from '@/services/review.service';
import { review as Review, BookingSlot } from '@/types/review.type';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

// Local Storage key
const SELECTED_FACILITY_KEY = 'owner_selected_facility_review_id';

// Interfaces
interface RatingItem {
  rating: number;
  count: number;
}

interface ReviewTrendItem {
  date: string;
  count: number;
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

const ReviewManagement: React.FC = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  
  // States
  const [facilities, setFacilities] = useState<FacilityDropdownItem[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [activeTab, setActiveTab] = useState('list');

  // Filter states
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'replied'>('all');
  const [ratingFilter, setRatingFilter] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  // Calculated review statistics
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    positiveRatePercentage: 0,
    negativeReviewsCount: 0,
    newReviewsCount: 0,
    ratingDistribution: [],
    reviewTrend: []
  });

  // Fetch facilities when component mounts
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const facilitiesData = await facilityService.getFacilitiesDropdown();
        setFacilities(facilitiesData);
        
        // Get saved facility ID from localStorage or use the first one
        const savedFacilityId = localStorage.getItem(SELECTED_FACILITY_KEY);
        const isValidSavedId = savedFacilityId && facilitiesData.some(f => f.id === savedFacilityId);
        const initialFacilityId = isValidSavedId ? savedFacilityId : (facilitiesData.length > 0 ? facilitiesData[0].id : '');
        
        if (initialFacilityId) {
          setSelectedFacility(initialFacilityId);
          localStorage.setItem(SELECTED_FACILITY_KEY, initialFacilityId);
          fetchReviewData(initialFacilityId);
        }
      } catch (error) {
        console.error('Error fetching facilities:', error);
        message.error('Không thể tải danh sách cơ sở. Vui lòng thử lại sau.');
      }
    };
    
    fetchFacilities();
  }, []);

  // Fetch reviews when facility changes or filters change
  useEffect(() => {
    if (selectedFacility) {
      fetchReviewData();
    }
  }, [selectedFacility, statusFilter, ratingFilter, searchText, dateRange, activeTab]);

  // Calculate review statistics
  useEffect(() => {
    if (reviews.length > 0) {
      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      // Count reviews by rating
      const ratingDistribution: RatingItem[] = [
        { rating: 5, count: 0 },
        { rating: 4, count: 0 },
        { rating: 3, count: 0 },
        { rating: 2, count: 0 },
        { rating: 1, count: 0 }
      ];
      
      reviews.forEach(review => {
        const ratingIndex = 5 - review.rating;
        if (ratingIndex >= 0 && ratingIndex < 5) {
          ratingDistribution[ratingIndex].count += 1;
        }
      });
      
      // Calculate positive rate (4-5 stars)
      const positiveReviews = reviews.filter(review => review.rating >= 4).length;
      const positiveRatePercentage = (positiveReviews / reviews.length) * 100;
      
      // Count negative reviews (1-2 stars)
      const negativeReviews = reviews.filter(review => review.rating <= 2).length;
      
      // Count reviews without feedback
      const pendingReviews = reviews.filter(review => !review.feedback).length;
      
      // Generate review trend data (last 6 months)
      const reviewDates = reviews.map(review => dayjs(review.reviewAt).format('YYYY-MM'));
      const uniqueDates = Array.from(new Set(reviewDates)).sort();
      const last6Months = uniqueDates.slice(-6);
      
      const reviewTrend: ReviewTrendItem[] = last6Months.map(date => {
        const count = reviews.filter(review => 
          dayjs(review.reviewAt).format('YYYY-MM') === date
        ).length;
        return { date, count };
      });
      
      setReviewStats({
        averageRating,
        totalReviews: reviews.length,
        positiveRatePercentage,
        negativeReviewsCount: negativeReviews,
        newReviewsCount: pendingReviews,
        ratingDistribution,
        reviewTrend
      });
    } else {
      // Reset stats if no reviews
      setReviewStats({
        averageRating: 0,
        totalReviews: 0,
        positiveRatePercentage: 0,
        negativeReviewsCount: 0,
        newReviewsCount: 0,
        ratingDistribution: [],
        reviewTrend: []
      });
    }
  }, [reviews]);

  const fetchReviewData = async (facilityId: string = selectedFacility) => {
    if (!facilityId) return;
    
    setLoading(true);
    
    try {
      // Fetch reviews from API
      const reviewsData = await reviewService.getListReviewByFacilityId(facilityId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      message.error('Không thể tải dữ liệu đánh giá. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityChange = (value: string) => {
    setSelectedFacility(value);
    localStorage.setItem(SELECTED_FACILITY_KEY, value);
    fetchReviewData(value);
  };

  const handleReplySubmit = async () => {
    if (!currentReview || !replyContent.trim()) return;
    
    try {
      // Call API to update feedback
      await reviewService.updateFeedback(currentReview.id, replyContent);
      
      // Update local state
      const updatedReviews = reviews.map(review => 
        review.id === currentReview.id 
          ? {
              ...review,
              feedback: replyContent,
              feedbackAt: new Date().toISOString()
            }
          : review
      );
      
      setReviews(updatedReviews);
      setReplyModalVisible(false);
      setReplyContent('');
      setCurrentReview(null);
      message.success('Phản hồi đánh giá thành công!');
    } catch (error) {
      console.error('Error updating feedback:', error);
      message.error('Không thể cập nhật phản hồi. Vui lòng thử lại sau.');
    }
  };

  const openReplyModal = (review: Review) => {
    setCurrentReview(review);
    setReplyContent(review.feedback || '');
    setReplyModalVisible(true);
  };

  const handleReset = () => {
    setStatusFilter('all');
    setRatingFilter([]);
    setSearchText('');
    setDateRange([null, null]);
  };

  // Filter reviews based on current filters
  const filteredReviews = reviews.filter(review => {
    // Status filter
    if (statusFilter === 'pending' && review.feedback) return false;
    if (statusFilter === 'replied' && !review.feedback) return false;
    
    // Rating filter
    if (ratingFilter.length > 0 && !ratingFilter.includes(review.rating)) return false;
    
    // Search text filter (bookingId)
    if (searchText && !review.booking?.id.toLowerCase().includes(searchText.toLowerCase())) return false;
    
    // Date range filter
    if (dateRange[0] && dateRange[1]) {
      const reviewDate = dayjs(review.reviewAt);
      if (!reviewDate.isAfter(dateRange[0]) || !reviewDate.isBefore(dateRange[1])) return false;
    }
    
    return true;
  });

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
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{review.booking?.player?.name || 'Người dùng'}</Text>
            <div>
              <Text type="secondary" className="text-xs">Đơn #{review.booking?.id.slice(0, 8)}</Text>
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
              {dayjs(review.reviewAt).format('DD/MM/YYYY HH:mm')}
            </Text>
          </div>
          <Paragraph ellipsis={{ rows: isMobile ? 1 : 2 }}>{review.comment}</Paragraph>
          {review.imageUrl && review.imageUrl.length > 0 && (
            <div className="flex mt-2 space-x-2">
              {review.imageUrl.map((image, index) => (
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
          {review.feedback && (
            <div className="mt-2 bg-gray-50 p-2 rounded">
              <Text type="secondary" className="text-xs">
                Phản hồi của bạn - {dayjs(review.feedbackAt).format('DD/MM/YYYY HH:mm')}
              </Text>
              <Paragraph ellipsis={{ rows: isMobile ? 1 : 2 }} className="text-sm mt-1">
                {review.feedback}
              </Paragraph>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Đơn đặt sân',
      dataIndex: 'service',
      key: 'service',
      render: (_, review) => {
        // Get booking date slots
        const bookingSlots = review.booking?.bookingSlots || [];
        
        if (bookingSlots.length === 0) {
          return (
            <div>
              <Text>
                {review.booking?.startTime} - {review.booking?.endTime}
              </Text>
            </div>
          );
        }
        
        // Format dates
        const formattedDates = bookingSlots.map((slot: BookingSlot) => 
          dayjs(slot.date).format('DD/MM/YYYY')
        );
        
        // If only one date, display it directly
        if (formattedDates.length === 1) {
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              <div>
                <Text>{formattedDates[0]}</Text>
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {review.booking?.startTime} - {review.booking?.endTime}
                  </Text>
                </div>
              </div>
            </div>
          );
        }
        
        // If multiple dates, use Popover
        const content = (
          <div style={{ padding: 4 }}>
            {formattedDates.map((date: string, index: number) => (
              <div key={index} style={{ marginBottom: 4 }}>
                <Tag color="blue">{date}</Tag>
              </div>
            ))}
          </div>
        );
        
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            <div>
              <Popover
                content={content}
                title="Lịch đặt sân"
                trigger="hover"
                placement="bottom"
              >
                <span style={{ cursor: 'pointer' }}>
                  {formattedDates[0]} 
                  <span style={{ fontWeight: 500, color: '#1890ff', marginLeft: 4 }}>
                    [{formattedDates.length}]
                  </span>
                </span>
              </Popover>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {review.booking?.startTime} - {review.booking?.endTime}
                </Text>
              </div>
            </div>
          </div>
        );
      },
      responsive: ['md'],
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, review) => (
        <Badge 
          status={review.feedback ? 'success' : 'warning'} 
          text={review.feedback ? 'Đã phản hồi' : 'Chưa phản hồi'} 
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
            type={!review.feedback ? 'primary' : 'default'} 
            onClick={() => openReplyModal(review)}
            size={isMobile ? 'small' : 'middle'}
          >
            {!review.feedback ? 'Phản hồi' : 'Xem/Sửa phản hồi'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-4 md:p-6 ">
      <Card className="mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
          <Title level={4} className="mb-2 md:mb-0">Quản lý đánh giá</Title>
          <Select
            placeholder="Chọn cơ sở"
            style={{ width: isMobile ? '100%' : 300 }}
            value={selectedFacility}
            onChange={handleFacilityChange}
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
                {reviewStats.totalReviews > 0 && (
                  <Tag color="green">
                    <ArrowUpOutlined /> Có {reviewStats.totalReviews} đánh giá
                  </Tag>
                )}
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
                value={reviewStats.newReviewsCount}
                valueStyle={{ color: reviewStats.newReviewsCount > 0 ? '#f5222d' : '#52c41a' }}
                prefix={<CommentOutlined />}
              />
              <div className="mt-2">
                <Button 
                  type="primary" 
                  danger={reviewStats.newReviewsCount > 0}
                  disabled={reviewStats.newReviewsCount === 0}
                  size={isMobile ? 'small' : 'middle'}
                  block={isMobile}
                  onClick={() => {
                    setActiveTab('list');
                    setStatusFilter('pending');
                  }}
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
                      <Card title="Xu hướng đánh giá theo thời gian" className="h-full">
                        {reviewStats.reviewTrend.length > 0 ? (
                          <Line {...reviewTrendConfig} height={isMobile ? 250 : 300} />
                        ) : (
                          <div className="flex items-center justify-center h-64">
                            <Text type="secondary">Chưa có dữ liệu đánh giá</Text>
                          </div>
                        )}
                      </Card>
                    </Col>
                    <Col xs={24} md={12}>
                      <Card title="Phân bố đánh giá theo sao" className="h-full">
                        {reviewStats.ratingDistribution.length > 0 ? (
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
                        ) : (
                          <div className="flex items-center justify-center h-64">
                            <Text type="secondary">Chưa có dữ liệu đánh giá</Text>
                          </div>
                        )}
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
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '16px', 
                      marginBottom: '16px',
                      flexDirection: isMobile ? 'column' : 'row'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Text strong>Trạng thái:</Text>
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
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Text strong>Đánh giá:</Text>
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
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Text strong>Thời gian:</Text>
                        <RangePicker 
                          value={dateRange}
                          onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                          style={{ minWidth: 240 }}
                        />
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '16px', 
                      marginTop: '16px',
                      marginBottom: '16px',
                      flexDirection: isMobile ? 'column' : 'row'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                        <Input.Search
                          placeholder="Tìm kiếm theo mã đơn..."
                          value={searchText}
                          onChange={e => setSearchText(e.target.value)}
                          onSearch={() => fetchReviewData()}
                        />
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
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
                        dataSource={filteredReviews}
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
                        locale={{ emptyText: 'Không có dữ liệu đánh giá' }}
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
        title={!currentReview?.feedback ? "Phản hồi đánh giá" : "Xem/Sửa phản hồi"}
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
                <Avatar icon={<UserOutlined />} />
                <Text strong className="ml-2">{currentReview.booking?.player?.name || 'Người dùng'}</Text>
              </div>
              <Rate disabled defaultValue={currentReview.rating} className="block mb-2" />
              <Paragraph>{currentReview.comment}</Paragraph>
              {currentReview.imageUrl && currentReview.imageUrl.length > 0 && (
                <div className="flex mt-2 space-x-2">
                  {currentReview.imageUrl.map((image, index) => (
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