import React, { useState } from 'react';
import { Table, Card, Tag, Button, Modal, Typography, Space, Divider, Row, Col } from 'antd';
import { EyeOutlined, CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { mockBookingHistory } from '@/mocks/booking/bookingData';
import { BookingStatus, PaymentStatus, Booking } from '@/types/booking.type';

const { Title, Text } = Typography;

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
}

const HistoryBookingPage: React.FC = () => {
  const [selectedBooking, setSelectedBooking] = useState<BookingHistoryItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancelBooking = async (bookingId: string) => {
    setLoading(true);
    try {
      // TODO: Implement API call to cancel booking
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Refresh data after cancellation
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const columns = [
    {
      title: 'Mã đặt sân',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Cơ sở',
      dataIndex: ['facility', 'name'],
      key: 'facility',
    },
    {
      title: 'Loại hình thể thao',
      dataIndex: ['sport', 'name'],
      key: 'sport',
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'bookingSlots',
      key: 'date',
      render: (bookingSlots: Booking['bookingSlots']) => (
        <span>{dayjs(bookingSlots[0]?.date).format('DD/MM/YYYY')}</span>
      ),
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (record: BookingHistoryItem) => (
        <span>{`${record.startTime.substring(0, 5)} - ${record.endTime.substring(0, 5)}`}</span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (record: BookingHistoryItem) => (
        <Space>
          <Tag color={record.status === BookingStatus.COMPLETED ? 'green' : 'orange'}>
            {record.status === BookingStatus.COMPLETED ? 'Hoàn thành' : 'Đang xử lý'}
          </Tag>
          <Tag color={record.payment.status === PaymentStatus.PAID ? 'green' : 'red'}>
            {record.payment.status === PaymentStatus.PAID ? 'Đã thanh toán' : 'Chưa thanh toán'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (record: BookingHistoryItem) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedBooking(record);
              setShowDetailModal(true);
            }}
          >
            Chi tiết
          </Button>
          {record.status === BookingStatus.DRAFT && (
            <Button
              type="text"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancelBooking(record.id)}
              loading={loading}
            >
              Hủy
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <Title level={2} className="mb-6">Lịch sử đặt sân</Title>
      
      <Card>
        <Table
          columns={columns}
          dataSource={mockBookingHistory}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng số ${total} đơn đặt sân`,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đặt sân"
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={null}
        width={800}
      >
        {selectedBooking && (
          <div>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className="mb-4">
                  <Text type="secondary">Cơ sở:</Text>
                  <div className="font-medium">{selectedBooking.facility.name}</div>
                  <div className="text-sm text-gray-500">{selectedBooking.facility.address}</div>
                </div>
                
                <div className="mb-4">
                  <Text type="secondary">Loại hình thể thao:</Text>
                  <div className="font-medium">{selectedBooking.sport.name}</div>
                </div>
                
                <div className="mb-4">
                  <Text type="secondary">Ngày đặt sân:</Text>
                  <div className="font-medium">
                    {dayjs(selectedBooking.bookingSlots[0]?.date).format('DD/MM/YYYY')}
                  </div>
                </div>
                
                <div className="mb-4">
                  <Text type="secondary">Thời gian:</Text>
                  <div className="font-medium">
                    {`${selectedBooking.startTime.substring(0, 5)} - ${selectedBooking.endTime.substring(0, 5)}`}
                  </div>
                </div>
              </Col>
              
              <Col xs={24} md={12}>
                <div className="mb-4">
                  <Text type="secondary">Loại sân:</Text>
                  <div className="font-medium">{selectedBooking.field.fieldGroup.name}</div>
                </div>
                
                <div className="mb-4">
                  <Text type="secondary">Sân:</Text>
                  <div className="font-medium">{selectedBooking.field.name}</div>
                </div>
                
                <div className="mb-4">
                  <Text type="secondary">Trạng thái:</Text>
                  <div>
                    <Space>
                      <Tag color={selectedBooking.status === BookingStatus.COMPLETED ? 'green' : 'orange'}>
                        {selectedBooking.status === BookingStatus.COMPLETED ? 'Hoàn thành' : 'Đang xử lý'}
                      </Tag>
                      <Tag color={selectedBooking.payment.status === PaymentStatus.PAID ? 'green' : 'red'}>
                        {selectedBooking.payment.status === PaymentStatus.PAID ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </Tag>
                    </Space>
                  </div>
                </div>
              </Col>
            </Row>
            
            <Divider />
            
            <div>
              <Title level={5} className="mb-4">Chi tiết thanh toán</Title>
              
              <div className="flex justify-between mb-2">
                <Text>Giá sân:</Text>
                <Text>{formatCurrency(selectedBooking.payment.fieldPrice)}</Text>
              </div>
              
              {selectedBooking.additionalServices.length > 0 && (
                <div className="mb-2">
                  <Text>Dịch vụ:</Text>
                  <div className="ml-4">
                    {selectedBooking.additionalServices.map((service) => (
                      <div key={service.serviceId} className="flex justify-between">
                        <Text>Dịch vụ {service.serviceId}</Text>
                        <Text>{formatCurrency(service.quantity * 15000)}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedBooking.payment.discount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <Text>Giảm giá:</Text>
                  <Text>-{formatCurrency(selectedBooking.payment.discount)}</Text>
                </div>
              )}
              
              <Divider />
              
              <div className="flex justify-between text-lg font-bold">
                <Text>Tổng cộng:</Text>
                <Text className="text-blue-600">
                  {formatCurrency(
                    selectedBooking.payment.fieldPrice +
                    selectedBooking.payment.servicePrice -
                    selectedBooking.payment.discount
                  )}
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HistoryBookingPage;

