import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Typography, Form, Rate, Input, Button, Space, Divider,
  notification, Upload, Row, Col, Tag, Modal, Tabs, List
} from 'antd';
import {
  StarOutlined, EditOutlined, DeleteOutlined, 
  HistoryOutlined, PictureOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { TabsProps } from 'antd';
import { mockBookingHistory } from '@/mocks/booking/bookingData';
import { BookingStatus, Booking } from '@/types/booking.type';
import { useAppSelector } from '@/hooks/reduxHooks';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface BookingHistoryItem extends Booking {
  facility: {
    id: number;
    name: string;
    address: string;
  };
  sport: {
    id: number;
    name: string;
  };
  field: {
    id: number;
    name: string;
    fieldGroup: {
      id: number;
      name: string;
      basePrice: number;
    };
  };
  hasReview?: boolean;
}

interface ReviewFormValues {
  rating: number;
  comment: string;
  images: UploadFile[];
  tags: string[];
  notifyOwner: boolean;
}

// Mock data cho đánh giá đã gửi trước đó
const mockPreviousReviews = [
  {
    id: '1',
    facilityId: 'facility-1',
    facilityName: 'TDT Football Arena',
    bookingId: 'booking-123',
    rating: 4.5,
    comment: 'Sân rất tốt, dịch vụ chuyên nghiệp. Tuy nhiên giá hơi cao.',
    createdAt: '2023-12-15T08:30:00Z',
    images: [
      'https://placehold.co/150?text=Football+Field',
      'https://placehold.co/150?text=Locker+Room'
    ],
    status: 'published'
  },
  {
    id: '2',
    facilityId: 'facility-2',
    facilityName: 'Sport Center Quận 10',
    bookingId: 'booking-456',
    rating: 3.5,
    comment: 'Sân đẹp nhưng vị trí hơi xa trung tâm, khó tìm.',
    createdAt: '2023-11-20T14:00:00Z',
    images: [
      'https://placehold.co/150?text=Basketball+Court'
    ],
    status: 'published'
  }
];

// Thêm interface cho review đang chỉnh sửa
interface EditingReview {
  id: string;
  rating: number;
  comment: string;
  images: string[];
  tags?: string[];
  facilityName: string;
  bookingId: string;
}

const BookingReview: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<ReviewFormValues>();
  const [booking, setBooking] = useState<BookingHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const { user } = useAppSelector(state => state.user);
  
  // States
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [activeTab, setActiveTab] = useState('current');
  const [editingReview, setEditingReview] = useState<EditingReview | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  
  // Tạo sẵn một số tag đánh giá phổ biến
  const commonTags = [
    'Sân đẹp',
    'Dịch vụ tốt',
    'Vị trí thuận tiện',
    'Giá cả hợp lý',
    'Nhân viên thân thiện',
    'Sạch sẽ',
    'Trang thiết bị tốt',
    'Dễ tìm',
    'Đúng giờ',
    'Đáng tiền'
  ];

  useEffect(() => {
    const fetchBookingDetail = async () => {
      try {
        setLoading(true);
        // Giả lập gọi API
        await new Promise(resolve => setTimeout(resolve, 500));
        const foundBooking = mockBookingHistory.find(b => b.id === bookingId);
        
        if (foundBooking && foundBooking.status === BookingStatus.COMPLETED) {
          setBooking(foundBooking as BookingHistoryItem);
        }
      } catch (error) {
        console.error('Failed to fetch booking detail:', error);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetail();
    }
  }, [bookingId]);

  // Xử lý upload ảnh
  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Xử lý xem trước ảnh
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj!);
    }
    setPreviewImage(file.url || file.preview || null);
    setPreviewVisible(true);
  };

  // Convert File to base64
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Xử lý chọn tag
  const handleTagClick = (tag: string) => {
    const nextSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(nextSelectedTags);
    form.setFieldsValue({ tags: nextSelectedTags });
  };

  // Xử lý gửi đánh giá
  const handleSubmitReview = async (values: ReviewFormValues) => {
    try {
      setSubmitting(true);
      console.log('Submitting review:', { ...values, bookingId });
      
      // Giả lập gọi API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Hiển thị thông báo thành công
      notification.success({
        message: 'Đánh giá thành công',
        description: 'Cảm ơn bạn đã đánh giá trải nghiệm sử dụng sân của chúng tôi!',
      });
      
      setReviewSubmitted(true);
    } catch (error) {
      console.error('Failed to submit review:', error);
      notification.error({
        message: 'Đánh giá thất bại',
        description: 'Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại sau.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý mở modal chỉnh sửa đánh giá
  const showEditModal = (review: EditingReview) => {
    setEditingReview(review);
    editForm.setFieldsValue({
      rating: review.rating,
      comment: review.comment,
      // Chuyển images thành định dạng UploadFile nếu cần
      tags: review.tags || []
    });
    setIsEditModalVisible(true);
  };

  // Xử lý cập nhật đánh giá
  const handleUpdateReview = async (values: ReviewFormValues) => {
    try {
      setSubmitting(true);
      console.log('Updating review:', { ...values, reviewId: editingReview?.id });
      
      // Giả lập gọi API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Hiển thị thông báo thành công
      notification.success({
        message: 'Cập nhật thành công',
        description: 'Đánh giá của bạn đã được cập nhật!',
      });
      
      setIsEditModalVisible(false);
    } catch (error) {
      notification.error({
        message: 'Cập nhật thất bại',
        description: 'Đã xảy ra lỗi khi cập nhật đánh giá. Vui lòng thử lại sau.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý xóa đánh giá
  const handleDeleteReview = async () => {
    try {
      if (!reviewToDelete) return;
      
      // Trong thực tế, gửi API request ở đây
      console.log('Deleting review:', reviewToDelete);
      
      // Giả lập delay API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      notification.success({
        message: 'Đánh giá đã được xóa thành công',
        description: 'Đánh giá đã được xóa thành công',
      });
      setConfirmDeleteVisible(false);
      
      // Refresh data trong thực tế
    } catch (error) {
      notification.error({
        message: 'Không thể xóa đánh giá',
        description: 'Đã xảy ra lỗi khi xóa đánh giá. Vui lòng thử lại sau.',
      });
    }
  };

  // Cấu hình tabs
  const tabs: TabsProps['items'] = [
    {
      key: 'current',
      label: 'Viết đánh giá',
      children: (
        <Card loading={loading}>
          {!booking?.hasReview ? (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmitReview}
              initialValues={{
                rating: 0,
                cleanliness: 0,
                service: 0,
                facilities: 0,
                valueForMoney: 0,
                comment: ''
              }}
            >
              <div className="mb-6">
                <Title level={4}>Đánh giá của bạn về {booking?.facility.name}</Title>
                <Text type="secondary">
                  Ngày đặt sân: {new Date(booking?.bookingSlots[0]?.date).toLocaleDateString('vi-VN')}
                </Text>
                <br />
                <Text type="secondary">
                  {booking?.field.name} • {booking?.bookingSlots[0]?.duration} giờ • {booking?.bookingSlots[0]?.price ? booking.bookingSlots[0].price.toLocaleString() : 0}đ
                </Text>
              </div>
              
              <Divider />
              
              {/* Đánh giá tổng thể */}
              <div className="mb-4">
                <Form.Item
                  name="rating"
                  label={<span className="font-medium">Đánh giá tổng thể</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn đánh giá của bạn' }]}
                >
                  <Rate
                    allowHalf
                    style={{ fontSize: 36 }}
                    character={<StarOutlined />}
                  />
                </Form.Item>
              </div>
              
              {/* Đánh giá chi tiết */}
              <div className="mb-6">
                <Title level={5}>Đánh giá chi tiết</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="cleanliness" label="Vệ sinh">
                      <Rate allowHalf />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="service" label="Dịch vụ & Nhân viên">
                      <Rate allowHalf />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="facilities" label="Cơ sở vật chất">
                      <Rate allowHalf />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="valueForMoney" label="Giá trị/Giá tiền">
                      <Rate allowHalf />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
              
              {/* Nhận xét chi tiết */}
              <div className="mb-6">
                <Form.Item
                  name="comment"
                  label={<span className="font-medium">Nhận xét của bạn</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập nhận xét của bạn' },
                    { min: 20, message: 'Nhận xét phải có ít nhất 20 ký tự' }
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Hãy chia sẻ trải nghiệm của bạn về sân này..."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
              </div>
              
              {/* Upload ảnh */}
              <div className="mb-6">
                <Form.Item
                  name="images"
                  label={<span className="font-medium">Thêm hình ảnh (tùy chọn)</span>}
                >
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleUploadChange}
                    onPreview={handlePreview}
                    beforeUpload={() => false}
                    maxCount={5}
                  >
                    {fileList.length >= 5 ? null : (
                      <div>
                        <PictureOutlined />
                        <div style={{ marginTop: 8 }}>Tải lên</div>
                      </div>
                    )}
                  </Upload>
                  <Text type="secondary">Tối đa 5 hình ảnh, mỗi hình không quá 5MB</Text>
                </Form.Item>
              </div>
              
              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    size="large"
                  >
                    Gửi đánh giá
                  </Button>
                  <Button 
                    size="large" 
                    onClick={() => navigate('/user/history-booking')}
                  >
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          ) : (
            <div className="text-center py-6">
              <Title level={4}>Bạn đã đánh giá đặt sân này</Title>
              <Paragraph>
                Cảm ơn bạn đã chia sẻ đánh giá về trải nghiệm của mình!
              </Paragraph>
              <Button
                type="primary"
                onClick={() => navigate('/user/history-booking')}
              >
                Quay lại lịch sử đặt sân
              </Button>
            </div>
          )}
        </Card>
      ),
    },
    {
      key: 'history',
      label: (
        <span>
          <HistoryOutlined /> Lịch sử đánh giá
        </span>
      ),
      children: (
        <Card>
          <List
            itemLayout="vertical"
            dataSource={mockPreviousReviews}
            renderItem={(review) => (
              <List.Item
                key={review.id}
                actions={[
                  <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={() => showEditModal(review as EditingReview)}
                  >
                    Chỉnh sửa
                  </Button>,
                  <Button 
                    type="text" 
                    danger
                    icon={<DeleteOutlined />} 
                    onClick={() => {
                      setReviewToDelete(review.id);
                      setConfirmDeleteVisible(true);
                    }}
                  >
                    Xóa
                  </Button>
                ]}
                extra={
                  review.images?.length > 0 && (
                    <div className="flex gap-2">
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Review ${idx}`}
                          width={100}
                          style={{ objectFit: 'cover' }}
                        />
                      ))}
                    </div>
                  )
                }
              >
                <List.Item.Meta
                  title={
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.facilityName}</span>
                      <Tag color="blue">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</Tag>
                    </div>
                  }
                  description={
                    <div>
                      <Rate disabled allowHalf value={review.rating} style={{ fontSize: 16 }} />
                      <span className="ml-2 text-gray-500">{review.rating.toFixed(1)}</span>
                    </div>
                  }
                />
                <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}>
                  {review.comment}
                </Paragraph>
              </List.Item>
            )}
          />
        </Card>
      ),
    },
  ];

  // Hiển thị thông tin chi tiết về đặt sân
  const renderBookingDetail = () => {
    if (!booking) return null;
    
    const bookingDate = booking.bookingSlots[0]?.date ? 
      new Date(booking.bookingSlots[0].date) : new Date();
    
    const totalCost = booking.payment?.fieldPrice || 0;
    
    return (
      <div className="mb-6">
        <Title level={4}>Chi tiết đặt sân</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="mb-3">
              <Text strong>Cơ sở:</Text>
              <div>{booking.facility.name}</div>
            </div>
            <div className="mb-3">
              <Text strong>Ngày đặt:</Text>
              <div>{bookingDate.toLocaleDateString('vi-VN')}</div>
            </div>
            <div className="mb-3">
              <Text strong>Thời gian:</Text>
              <div>{booking.startTime} - {booking.endTime}</div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="mb-3">
              <Text strong>Sân:</Text>
              <div>{booking.field.name}</div>
            </div>
            <div className="mb-3">
              <Text strong>Môn thể thao:</Text>
              <div>{booking.sport.name}</div>
            </div>
            <div className="mb-3">
              <Text strong>Tổng tiền:</Text>
              <div>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalCost)}</div>
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <div className="text-center py-10">
            <Title level={4}>Không tìm thấy thông tin đặt sân</Title>
            <Paragraph className="mt-2">
              Bạn chỉ có thể đánh giá các đơn đặt sân đã hoàn thành.
            </Paragraph>
            <Button 
              type="primary" 
              onClick={() => navigate('/user/history-booking')}
              className="mt-4"
            >
              Quay lại lịch sử đặt sân
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (reviewSubmitted) {
    return (
      <div className="w-full px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <Card className="shadow-md">
            <div className="text-center py-8 md:py-10">
              <CheckCircleOutlined className="text-green-500 text-4xl md:text-5xl mb-4" />
              <Title level={3} className="text-xl md:text-2xl">Cảm ơn bạn đã đánh giá!</Title>
              <Paragraph className="mt-2">
                Đánh giá của bạn đã được gửi thành công và đang chờ xử lý.
              </Paragraph>
              <Paragraph className="text-gray-500">
                Những đánh giá chân thực sẽ giúp chúng tôi cải thiện dịch vụ và giúp người chơi khác lựa chọn sân tốt hơn.
              </Paragraph>
              <Space className="mt-6">
                <Button onClick={() => navigate('/user/history-booking')}>
                  Quay lại lịch sử đặt sân
                </Button>
                <Button type="primary" onClick={() => navigate('/')}>
                  Trang chủ
                </Button>
              </Space>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Title level={3}>
            {activeTab === 'current' ? 'Viết đánh giá' : 'Lịch sử đánh giá'}
          </Title>
          <Text type="secondary">
            Chia sẻ trải nghiệm của bạn và giúp đỡ người khác tìm được sân tốt nhất
          </Text>
        </div>

        <Tabs defaultActiveKey="current" items={tabs} onChange={(key) => setActiveTab(key)} />

        {/* Modal chỉnh sửa đánh giá */}
        <Modal
          title="Chỉnh sửa đánh giá"
          open={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
          width={700}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleUpdateReview}
          >
            <Form.Item
              name="rating"
              label="Đánh giá tổng thể"
              rules={[{ required: true, message: 'Vui lòng chọn đánh giá của bạn' }]}
            >
              <Rate allowHalf />
            </Form.Item>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item name="cleanliness" label="Vệ sinh">
                  <Rate allowHalf />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="service" label="Dịch vụ & Nhân viên">
                  <Rate allowHalf />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="facilities" label="Cơ sở vật chất">
                  <Rate allowHalf />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="valueForMoney" label="Giá trị/Giá tiền">
                  <Rate allowHalf />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="comment"
              label="Nhận xét của bạn"
              rules={[
                { required: true, message: 'Vui lòng nhập nhận xét của bạn' },
                { min: 20, message: 'Nhận xét phải có ít nhất 20 ký tự' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Hãy chia sẻ trải nghiệm của bạn về sân này..."
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Cập nhật đánh giá
                </Button>
                <Button onClick={() => setIsEditModalVisible(false)}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal xác nhận xóa đánh giá */}
        <Modal
          title="Xác nhận xóa"
          open={confirmDeleteVisible}
          onOk={handleDeleteReview}
          onCancel={() => setConfirmDeleteVisible(false)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <p>Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.</p>
        </Modal>
      </div>
    </div>
  );
};

export default BookingReview; 