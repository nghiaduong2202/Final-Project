import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card, Typography, Form, Rate, Input, Button, Space,
  notification, Upload, Divider, Modal, Breadcrumb, Image, Avatar
} from 'antd';
import {
  StarOutlined, PictureOutlined, CheckCircleOutlined,
  FieldTimeOutlined, CalendarOutlined, UserOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { bookingService } from '@/services/booking.service';
import { reviewService } from '@/services/review.service';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Format tiền tệ
const formatCurrency = (amount: number | null) => {
  if (amount === null) return '0 đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

interface Facility {
  id: string;
  name: string;
  description: string;
  location: string;
  status: string;
  avgRating: number;
  numberOfRating: number;
  imagesUrl: string[];
  fieldGroups: FieldGroup[];
}

interface FieldGroup {
  id: string;
  name: string;
  dimension: string;
  surface: string;
  basePrice: number;
}

interface Sport {
  id: number;
  name: string;
}

interface Field {
  id: number;
  name: string;
  status: string;
}

interface BookingSlot {
  id: number;
  date: string;
  field: Field;
}

interface Payment {
  id: string;
  fieldPrice: number;
  servicePrice: number | null;
  discount: number | null;
  status: string;
  updatedAt: string;
}

interface BookingData {
  id: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  sport: Sport;
  bookingSlots: BookingSlot[];
  payment: Payment;
  hasReview?: boolean;
  review?: ReviewData | null;
}

interface BookingDetailData {
  facility: Facility;
  booking: BookingData;
}

interface ReviewData {
  id: number;
  rating: number;
  comment: string;
  imageUrl: string[];
  reviewAt: string;
  feedbackAt?: string;
  feedback?: string;
}

interface ReviewFormValues {
  rating: number;
  comment: string;
  images: UploadFile[];
}

const BookingReview: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<ReviewFormValues>();
  const [bookingDetail, setBookingDetail] = useState<BookingDetailData | null>(null);
  const [existingReview, setExistingReview] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const fetchBookingDetail = async () => {
      try {
        setLoading(true);
        if (!bookingId) return;
        
        // Get booking details
        const data = await bookingService.getBookingDetail(bookingId);
        setBookingDetail(data);
        
        // Debug log
        console.log('BookingReview - Booking data received:', {
          bookingId: data.booking.id,
          status: data.booking.status,
          hasReview: !!data.booking.review,
          reviewType: data.booking.review ? typeof data.booking.review : 'N/A',
          reviewData: data.booking.review
        });
        
        // Check if the booking already has a review
        if (data.booking.review) {
          setExistingReview(data.booking.review);
        }
      } catch (error) {
        console.error('Failed to fetch booking detail:', error);
        notification.error({
          message: 'Không thể tải thông tin đặt sân',
          description: 'Đã xảy ra lỗi khi tải thông tin chi tiết đặt sân. Vui lòng thử lại sau.'
        });
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
    setPreviewModalVisible(true);
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

  // Xử lý gửi đánh giá
  const handleSubmitReview = async (values: ReviewFormValues) => {
    if (!bookingId || !bookingDetail) return;
    
    try {
      setSubmitting(true);
      
      // Create the data object
      const reviewData = {
        bookingId: bookingId,
        rating: values.rating,
        comment: values.comment
      };
      
      // Create FormData
      const formData = new FormData();
      
      // Add review data as JSON string (this is crucial)
      formData.append('data', JSON.stringify(reviewData));
      
      // Add image files if any
      if (values.images && values.images.length > 0) {
        values.images.forEach((file) => {
          if (file.originFileObj) {
            formData.append('imageUrl', file.originFileObj);
          }
        });
      }
      
      // Send the request
      await reviewService.createReview(formData);
      
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!bookingDetail) {
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

  const { facility, booking } = bookingDetail;

  // Show review thank you page
  if (reviewSubmitted) {
    return (
      <div className="w-full px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb
            className="mb-4"
            items={[
              { title: <Link to="/">Trang chủ</Link> },
              { title: <Link to="/user/history-booking"> Lịch sử đặt sân</Link> },
              { title: <> Đánh giá</> }
            ]}
          />
          
          <Card className="shadow-md rounded-lg">
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

  // If there's an existing review, display it instead of the form
  if (existingReview) {
    return (
      <div className="w-full px-4 py-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb
            className="mb-4"
            items={[
              { title: <Link to="/"> Trang chủ</Link> },
              { title: <Link to="/user/history-booking"> Lịch sử đặt sân</Link> },
              { title: <> Đánh giá</> }
            ]}
          />

          <div className="mb-6">
            <Title level={3}>Đánh giá của bạn</Title>
            <Text type="secondary">
              Bạn đã đánh giá sân này vào ngày {dayjs(existingReview.reviewAt).format('DD/MM/YYYY')}
            </Text>
          </div>

          <Card className="shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300">
            <div className="mb-6">
              <Title level={4}>{facility.name}</Title>
              <Text className="text-green-600 font-medium">
                Ngày đặt sân: {dayjs(booking.bookingSlots[0]?.date).format('DD/MM/YYYY')}
              </Text>
              <br />
              <div className="flex items-center mt-2 bg-gray-50 rounded-md p-3">
                <div className="mr-2">
                  {facility.imagesUrl && facility.imagesUrl.length > 0 ? (
                    <img 
                      src={facility.imagesUrl[0]} 
                      alt={facility.name} 
                      className="w-16 h-16 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div>
                  <Text className="block font-medium">{booking.bookingSlots[0]?.field.name}</Text>
                  <Text className="block text-gray-600">{booking.startTime.substring(0, 5)} - {booking.endTime.substring(0, 5)}</Text>
                  <Text className="block text-blue-600 font-medium">{formatCurrency(booking.payment.fieldPrice)}</Text>
                </div>
              </div>
            </div>
            
            <Divider />
            
            {/* Display review content */}
            <div className="mb-4">
              <div className="flex items-center">
                <Avatar icon={<UserOutlined />} className="mr-3" />
                <div>
                  <div className="font-medium">Đánh giá của bạn</div>
                  <div className="text-gray-500 text-sm">
                    <CalendarOutlined className="mr-1" /> {dayjs(existingReview.reviewAt).format('DD/MM/YYYY')}
                    <span className="mx-2">•</span>
                    <FieldTimeOutlined className="mr-1" /> {dayjs(existingReview.reviewAt).format('HH:mm')}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="font-medium text-lg">Đánh giá tổng thể</div>
              <Rate
                disabled
                allowHalf
                value={existingReview.rating}
                style={{ fontSize: 36 }}
                character={<StarOutlined />}
              />
            </div>
            
            <div className="mb-6">
              <div className="font-medium text-lg">Nhận xét của bạn</div>
              <div className="mt-2 bg-gray-50 p-4 rounded-md text-gray-700">
                {existingReview.comment}
              </div>
            </div>
            
            {/* Display review images */}
            {existingReview.imageUrl && existingReview.imageUrl.length > 0 && (
              <div className="mb-6">
                <div className="font-medium text-lg mb-2">Hình ảnh đánh giá</div>
                <div className="flex flex-wrap gap-2">
                  <Image.PreviewGroup>
                    {existingReview.imageUrl.map((url, index) => (
                      <Image
                        key={index}
                        width={100}
                        height={100}
                        className="object-cover rounded-md"
                        src={url}
                        alt={`Review image ${index + 1}`}
                      />
                    ))}
                  </Image.PreviewGroup>
                </div>
              </div>
            )}
            
            {/* Show owner's feedback if available */}
            {existingReview.feedback && (
              <div className="mb-6">
                <div className="font-medium text-lg">Phản hồi từ chủ sân</div>
                <div className="mt-2 bg-blue-50 p-4 rounded-md text-gray-700">
                  {existingReview.feedback}
                  {existingReview.feedbackAt && (
                    <div className="mt-2 text-gray-500 text-sm">
                      <CalendarOutlined className="mr-1" /> {dayjs(existingReview.feedbackAt).format('DD/MM/YYYY HH:mm')}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <Button 
              type="primary" 
              onClick={() => navigate('/user/history-booking')}
              className="mt-4"
            >
              Quay lại lịch sử đặt sân
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Show the review form if no existing review
  return (
    <div className="w-full px-4 py-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb
          className="mb-4"
          items={[
            { title: <Link to="/">Trang chủ</Link> },
            { title: <Link to="/user/history-booking">Lịch sử đặt sân</Link> },
            { title: <> Đánh giá</> }
          ]}
        />

        <div className="mb-6">
          <Title level={3}>Viết đánh giá</Title>
          <Text type="secondary">
            Chia sẻ trải nghiệm của bạn và giúp đỡ người khác tìm được sân tốt nhất
          </Text>
        </div>

        <Card className="shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmitReview}
            initialValues={{
              rating: 0,
              comment: ''
            }}
          >
            <div className="mb-6">
              <Title level={4}>{facility.name}</Title>
              <Text className="text-green-600 font-medium">
                Ngày đặt sân: {dayjs(booking.bookingSlots[0]?.date).format('DD/MM/YYYY')}
              </Text>
              <br />
              <div className="flex items-center mt-2 bg-gray-50 rounded-md p-3">
                <div className="mr-2">
                  {facility.imagesUrl && facility.imagesUrl.length > 0 ? (
                    <img 
                      src={facility.imagesUrl[0]} 
                      alt={facility.name} 
                      className="w-16 h-16 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div>
                  <Text className="block font-medium">{booking.bookingSlots[0]?.field.name}</Text>
                  <Text className="block text-gray-600">{booking.startTime.substring(0, 5)} - {booking.endTime.substring(0, 5)}</Text>
                  <Text className="block text-blue-600 font-medium">{formatCurrency(booking.payment.fieldPrice)}</Text>
                </div>
              </div>
            </div>
            
            <Divider />
            
            {/* Đánh giá tổng thể */}
            <div className="mb-6">
              <Form.Item
                name="rating"
                label={<span className="font-medium text-lg">Đánh giá tổng thể</span>}
                rules={[{ required: true, message: 'Vui lòng chọn đánh giá của bạn' }]}
              >
                <Rate
                  allowHalf
                  style={{ fontSize: 36 }}
                  character={<StarOutlined />}
                />
              </Form.Item>
            </div>
            
            {/* Nhận xét chi tiết */}
            <div className="mb-6">
              <Form.Item
                name="comment"
                label={<span className="font-medium text-lg">Nhận xét của bạn</span>}
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
                  className="rounded-md"
                />
              </Form.Item>
            </div>
            
            {/* Upload ảnh */}
            <div className="mb-6">
              <Form.Item
                name="images"
                label={<span className="font-medium text-lg">Thêm hình ảnh (tùy chọn)</span>}
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
              </Form.Item>
              <Text type="secondary" className="mt-1">Tối đa 5 hình ảnh, mỗi hình không quá 5MB</Text>
            </div>
            
            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting}
                  size="large"
                  className="bg-green-600 hover:bg-green-700"
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
        </Card>

        {/* Modal xem trước ảnh */}
        <Modal
          open={previewModalVisible}
          title="Xem trước"
          footer={null}
          onCancel={() => setPreviewModalVisible(false)}
        >
          {previewImage && <img alt="Preview" style={{ width: '100%' }} src={previewImage} />}
        </Modal>
      </div>
    </div>
  );
};

export default BookingReview; 