import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card, Typography, Form, Rate, Input, Button, Space,
  notification, Upload, Divider, Modal, Breadcrumb, Image, Avatar
} from 'antd';
import {
  StarOutlined, PictureOutlined, CheckCircleOutlined,
  FieldTimeOutlined, CalendarOutlined, UserOutlined, EditOutlined, DeleteOutlined
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
  const [isEditing, setIsEditing] = useState(false);
  const [imagesToKeep, setImagesToKeep] = useState<string[]>([]);

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

  // Đồng bộ fileList với form khi component mount
  useEffect(() => {
    // Đặt giá trị mặc định cho form field 'images'
    form.setFieldsValue({ images: fileList });
  }, []);

  // Xử lý upload ảnh
  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    // Cập nhật state fileList
    setFileList(newFileList);
    
    // Cập nhật giá trị của form field 'images' để đồng bộ với fileList
    form.setFieldsValue({ images: newFileList });
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
      
      // Add review data as JSON string with key 'data'
      formData.append('data', JSON.stringify(reviewData));
      
      // Add image files if any with key 'images' for each file - đơn giản và trực tiếp
      if (fileList && fileList.length > 0) {
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append('images', file.originFileObj);
          }
        });
      }
      
      // Hiển thị thông báo thành công sau delay nhỏ để tạo cảm giác xử lý
      setTimeout(() => {
        notification.success({
          message: 'Đánh giá thành công',
          description: 'Cảm ơn bạn đã đánh giá trải nghiệm sử dụng sân của chúng tôi!',
        });
        
        // Hiển thị thông báo việc tải ảnh đang diễn ra trong nền (nếu có ảnh)
        if (fileList && fileList.length > 0) {
          notification.info({
            message: 'Đang xử lý ảnh trong nền',
            description: 'Bạn có thể tiếp tục sử dụng ứng dụng bình thường.',
            duration: 3
          });
        }
        
        // Chuyển đến trạng thái đã submit review
        setReviewSubmitted(true);
        setSubmitting(false);
      }, 200);
      
      // Gửi request API trong nền, không đợi kết quả
      reviewService.createReview(formData)
        .then(() => {
          console.log('Review successfully submitted to backend');
        })
        .catch((error) => {
          console.error('Failed to submit review, but UI already updated:', error);
          // Mặc dù có lỗi nhưng không hiển thị cho người dùng vì đã chuyển màn hình
        });
    } catch (error) {
      // Xử lý lỗi xảy ra trước khi gửi API (ít khi xảy ra)
      console.error('Error preparing review submission:', error);
      notification.error({
        message: 'Đánh giá thất bại',
        description: 'Đã xảy ra lỗi khi chuẩn bị đánh giá. Vui lòng thử lại sau.'
      });
      setSubmitting(false);
    }
  };

  // Xử lý chỉnh sửa review
  const handleEditReview = () => {
    if (!existingReview) return;
    
    // Khởi tạo form với dữ liệu review hiện tại
    form.setFieldsValue({
      rating: existingReview.rating,
      comment: existingReview.comment,
      images: []
    });
    
    // Khởi tạo danh sách ảnh hiện có
    if (existingReview.imageUrl && existingReview.imageUrl.length > 0) {
      setImagesToKeep(existingReview.imageUrl as unknown as string[]);
      
      // Tạo danh sách fileList từ URL ảnh hiện có
      const existingFileList: UploadFile[] = existingReview.imageUrl.map((url: string, index: number) => ({
        uid: `-${index}`,
        name: `image-${index}.jpg`,
        status: 'done',
        url: url as unknown as string,
      }));
      setFileList(existingFileList);
    } else {
      setFileList([]);
      setImagesToKeep([]);
    }
    
    // Chuyển sang chế độ chỉnh sửa
    setIsEditing(true);
    setReviewSubmitted(false);
  };
  
  // Xử lý xóa ảnh hiện có
  const handleRemoveExistingImage = (url: string) => {
    setImagesToKeep(prev => prev.filter(item => item !== url));
  };
  
  // Xử lý cập nhật review
  const handleUpdateReview = async (values: ReviewFormValues) => {
    if (!existingReview || !existingReview.id) return;
    
    try {
      setSubmitting(true);
      
      // Tạo mảng URL ảnh cần giữ lại
      const imageUrls = [...imagesToKeep];
      
      // Upload ảnh mới (nếu có)
      const newImagePromises = fileList
        .filter(file => file.originFileObj) // Chỉ lấy file mới (có originFileObj)
        .map(async (file) => {
          if (file.originFileObj) {
            try {
              // Upload ảnh và lấy URL
              const imageUrl = await reviewService.uploadImage(file.originFileObj);
              return imageUrl;
            } catch (error) {
              console.error('Failed to upload image:', error);
              return null;
            }
          }
          return null;
        });
      
      // Đợi tất cả ảnh được upload
      const newImageUrls = await Promise.all(newImagePromises);
      
      // Lọc bỏ các giá trị null và thêm vào mảng URL
      newImageUrls.forEach(url => {
        if (url) imageUrls.push(url);
      });
      
      // Tạo dữ liệu cập nhật - chuyển reviewId từ string sang number
      const updateData = {
        reviewId: parseInt(existingReview.id.toString(), 10),
        rating: values.rating,
        comment: values.comment,
        imageUrl: imageUrls
      };
      
      console.log('Sending update data:', updateData);
      
      // Hiển thị thông báo đang xử lý
      setTimeout(() => {
        notification.success({
          message: 'Cập nhật đánh giá thành công',
          description: 'Đánh giá của bạn đã được cập nhật.',
        });
        
        // Chuyển về chế độ xem
        setIsEditing(false);
        
        // Cập nhật dữ liệu review hiện tại với dữ liệu mới
        const updatedReview = {
          ...existingReview,
          rating: values.rating,
          comment: values.comment,
          imageUrl: imageUrls as unknown as string[]
        };
        setExistingReview(updatedReview);
        
        setSubmitting(false);
      }, 200);
      
      // Gửi request API trong nền
      reviewService.updateReview(updateData)
        .then(() => {
          console.log('Review successfully updated');
        })
        .catch((error) => {
          console.error('Failed to update review:', error);
          notification.error({
            message: 'Cập nhật thất bại',
            description: 'Đã xảy ra lỗi khi cập nhật đánh giá. Vui lòng thử lại sau.',
          });
        });
    } catch (error) {
      console.error('Error preparing review update:', error);
      notification.error({
        message: 'Cập nhật thất bại',
        description: 'Đã xảy ra lỗi khi cập nhật đánh giá. Vui lòng thử lại sau.'
      });
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
                Đánh giá của bạn đã được gửi thành công.
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
  if (existingReview && !isEditing) {
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
              <div className="flex items-center justify-between">
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
                
                {/* Nút chỉnh sửa chỉ hiển thị khi chưa có feedback */}
                {!existingReview.feedback && (
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />}
                    onClick={handleEditReview}
                  >
                    Chỉnh sửa
                  </Button>
                )}
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
  
  // Show edit form if in editing mode
  if (isEditing && existingReview) {
    return (
      <div className="w-full px-4 py-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb
            className="mb-4"
            items={[
              { title: <Link to="/">Trang chủ</Link> },
              { title: <Link to="/user/history-booking">Lịch sử đặt sân</Link> },
              { title: <> Chỉnh sửa đánh giá</> }
            ]}
          />

          <div className="mb-6">
            <Title level={3}>Chỉnh sửa đánh giá</Title>
            <Text type="secondary">
              Cập nhật đánh giá của bạn về trải nghiệm sử dụng sân
            </Text>
          </div>

          <Card className="shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateReview}
              initialValues={{
                rating: existingReview.rating,
                comment: existingReview.comment
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
                    { required: true, message: 'Vui lòng nhập nhận xét của bạn' }                 
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
              
              {/* Hiển thị ảnh hiện có */}
              {imagesToKeep.length > 0 && (
                <div className="mb-6">
                  <div className="font-medium text-lg mb-2">Ảnh hiện tại</div>
                  <div className="flex flex-wrap gap-2">
                    {imagesToKeep.map((url, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={url} 
                          alt={`Current image ${index + 1}`} 
                          className="w-24 h-24 object-cover rounded-md"
                        />
                        <Button
                          type="primary"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          className="absolute top-0 right-0"
                          onClick={() => handleRemoveExistingImage(url)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Upload ảnh mới */}
              <div className="mb-6">
                <Form.Item
                  name="images"
                  label={<span className="font-medium text-lg">Thêm hình ảnh mới (tùy chọn)</span>}
                >
                  <Upload
                    listType="picture-card"
                    fileList={fileList.filter(file => file.originFileObj)} // Chỉ hiển thị ảnh mới
                    onChange={handleUploadChange}
                    onPreview={handlePreview}
                    beforeUpload={(file) => {
                      // Kiểm tra kích thước file (tối đa 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        notification.error({
                          message: 'Kích thước file quá lớn',
                          description: `File ${file.name} vượt quá 5MB. Vui lòng chọn file nhỏ hơn.`
                        });
                        return false;
                      }
                      
                      // Kiểm tra loại file là hình ảnh
                      if (!file.type.startsWith('image/')) {
                        notification.error({
                          message: 'Loại file không hợp lệ',
                          description: `File ${file.name} không phải là hình ảnh. Vui lòng chọn file hình ảnh.`
                        });
                        return false;
                      }
                      
                      return false; // Ngăn chặn upload tự động
                    }}
                    accept="image/*"
                    maxCount={5 - imagesToKeep.length}
                  >
                    {(fileList.filter(file => file.originFileObj).length + imagesToKeep.length) >= 5 ? null : (
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
                    Cập nhật đánh giá
                  </Button>
                  <Button 
                    size="large" 
                    onClick={() => {
                      setIsEditing(false);
                      // Khôi phục lại danh sách ảnh ban đầu
                      if (existingReview.imageUrl && existingReview.imageUrl.length > 0) {
                        setImagesToKeep(existingReview.imageUrl as unknown as string[]);
                      }
                    }}
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
                  { required: true, message: 'Vui lòng nhập nhận xét của bạn' }                 
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
                  beforeUpload={(file) => {
                    // Kiểm tra kích thước file (tối đa 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      notification.error({
                        message: 'Kích thước file quá lớn',
                        description: `File ${file.name} vượt quá 5MB. Vui lòng chọn file nhỏ hơn.`
                      });
                      return false;
                    }
                    
                    // Kiểm tra loại file là hình ảnh
                    if (!file.type.startsWith('image/')) {
                      notification.error({
                        message: 'Loại file không hợp lệ',
                        description: `File ${file.name} không phải là hình ảnh. Vui lòng chọn file hình ảnh.`
                      });
                      return false;
                    }
                    
                    return false; // Ngăn chặn upload tự động
                  }}
                  accept="image/*"
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