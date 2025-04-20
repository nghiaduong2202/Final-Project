import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import bookingService from '@/services/booking.service';


const ResultBookingVNPay: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        // Lấy tất cả các tham số từ URL
        const queryParams = Object.fromEntries(new URLSearchParams(location.search));
        
        // Gọi API để kiểm tra trạng thái thanh toán
        const result = await bookingService.getPaymentResult(queryParams);
        
        // Log message nhận được để debug
        console.log('Payment result message:', result.message);
        console.log('Payment result data:', result);
        
        // Lưu message từ API response
        setPaymentMessage(result.message);
        
        // Kiểm tra kết quả thanh toán linh hoạt hơn
        // Xem nếu message chứa từ khóa "success" hoặc có thuộc tính success = true
        const isSuccess = 
          (typeof result.message === 'string' && 
            (result.message.toLowerCase().includes('success') || 
             result.message.toLowerCase().includes('thành công'))) || 
          result.success === true || 
          result.code === '00' ||
          result.statusCode === 200;
          
        setPaymentSuccess(isSuccess);
      } catch (error) {
        console.error('Error checking payment status:', error);
        setPaymentMessage(null);
        setPaymentSuccess(false);
      }
    };
    
    fetchPaymentStatus();
  }, [location.search]);
  
  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {paymentSuccess ? (
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          title="Thanh toán thành công!"          
          extra={[
            <Button type="primary" key="bookings" onClick={() => navigate(`/user/history-booking`)}>
              Xem lịch sử đặt sân
            </Button>,
            <Button key="home" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>,
          ]}
        >          
        </Result>
      ) : (
        <Result
          status="error"
          icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
          title="Thanh toán thất bại!"
          subTitle={paymentMessage || "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau."}
          extra={[
            <Button type="primary" key="home" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>,
          ]}
        />
      )}
    </div>
  );
};

export default ResultBookingVNPay;