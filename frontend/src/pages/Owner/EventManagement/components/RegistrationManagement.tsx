import React, { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Descriptions,
  Typography,
  Image,
  message,
  Input,
  Select,
  Tabs,
  Divider
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  UserOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  ExportOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { EventRegistration, RegistrationApprovalStatus, PaymentStatus, Event } from '@/types/event.type';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { confirm } = Modal;
const { Option } = Select;
const { TabPane } = Tabs;

interface RegistrationManagementProps {
  visible: boolean;
  event: Event | null;
  onClose: () => void;
}

const RegistrationManagement: React.FC<RegistrationManagementProps> = ({
  visible,
  event,
  onClose,
}) => {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<RegistrationApprovalStatus | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState<EventRegistration | null>(null);

  // Fetch registrations data
  useEffect(() => {
    if (visible && event) {
      setLoading(true);
      
      // Simulate API call - Replace with actual API call
      setTimeout(() => {
        // Generate mock registrations
        const mockRegistrations: EventRegistration[] = Array(10).fill(null).map((_, index) => ({
          id: `reg-${index + 1}`,
          eventId: event.id || 0,
          userId: `user-${100 + index}`,
          userName: `Người dùng ${index + 1}`,
          userEmail: `user${index + 1}@example.com`,
          userPhone: `098765432${index}`,
          registrationDate: dayjs().subtract(Math.floor(Math.random() * 10), 'day').toISOString(),
          status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)] as RegistrationApprovalStatus,
          paymentStatus: ['pending', 'paid', 'refunded'][Math.floor(Math.random() * 3)] as PaymentStatus,
          paymentProof: Math.random() > 0.5 ? 'https://via.placeholder.com/300x200?text=Payment+Proof' : undefined,
          paymentMethod: Math.random() > 0.7 ? 'bank_transfer' : 'cash',
          paymentDate: Math.random() > 0.5 ? dayjs().subtract(Math.floor(Math.random() * 5), 'day').toISOString() : undefined,
          teamName: Math.random() > 0.7 ? `Đội ${index + 1}` : undefined,
          teamMembers: Math.random() > 0.7 ? [
            { name: `Thành viên 1 của đội ${index + 1}`, email: `member1-team${index + 1}@example.com`, phone: '0987654321' },
            { name: `Thành viên 2 của đội ${index + 1}`, email: `member2-team${index + 1}@example.com`, phone: '0987654322' }
          ] : undefined,
          notes: Math.random() > 0.7 ? `Ghi chú đăng ký ${index + 1}` : undefined,
        }));
        
        setRegistrations(mockRegistrations);
        setLoading(false);
      }, 100);
    }
  }, [visible, event]);

  // Render status tag
  const renderStatusTag = (status: RegistrationApprovalStatus) => {
    const config = {
      pending: { color: 'warning', text: 'Chờ phê duyệt', icon: <ExclamationCircleOutlined /> },
      approved: { color: 'success', text: 'Đã phê duyệt', icon: <CheckCircleOutlined /> },
      rejected: { color: 'error', text: 'Đã từ chối', icon: <CloseCircleOutlined /> }
    };
    
    const { color, text, icon } = config[status];
    return <Tag color={color} icon={icon}>{text}</Tag>;
  };
  
  // Render payment status tag
  const renderPaymentStatusTag = (status?: PaymentStatus) => {
    if (!status) return <Tag>Không có thông tin</Tag>;
    
    const config = {
      pending: { color: 'warning', text: 'Chờ thanh toán' },
      paid: { color: 'success', text: 'Đã thanh toán' },
      refunded: { color: 'default', text: 'Đã hoàn tiền' }
    };
    
    const { color, text } = config[status];
    return <Tag color={color}>{text}</Tag>;
  };
  
  // Handle view registration details
  const handleViewDetails = (registration: EventRegistration) => {
    setCurrentRegistration(registration);
    setDetailModalVisible(true);
  };
  
  // Handle approve registration
  const handleApproveRegistration = (registration: EventRegistration) => {
    confirm({
      title: 'Xác nhận phê duyệt',
      content: `Bạn có chắc chắn muốn phê duyệt đăng ký của ${registration.userName}?`,
      onOk() {
        // Update registration status
        const updatedRegistrations = registrations.map(reg => {
          if (reg.id === registration.id) {
            return {
              ...reg,
              status: 'approved' as RegistrationApprovalStatus,
              approvedBy: 'owner-001', // Giả sử owner ID
              approvedDate: new Date().toISOString()
            };
          }
          return reg;
        });
        
        setRegistrations(updatedRegistrations);
        message.success('Đã phê duyệt đăng ký thành công');
      }
    });
  };
  
  // Handle reject registration
  const handleRejectRegistration = (registration: EventRegistration) => {
    let rejectionReason = '';
    
    Modal.confirm({
      title: 'Từ chối đăng ký',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn từ chối đăng ký của {registration.userName}?</p>
          <p>Vui lòng nhập lý do từ chối:</p>
          <Input.TextArea 
            rows={3} 
            onChange={e => { rejectionReason = e.target.value; }} 
            placeholder="Lý do từ chối" 
          />
        </div>
      ),
      onOk() {
        // Update registration status
        const updatedRegistrations = registrations.map(reg => {
          if (reg.id === registration.id) {
            return {
              ...reg,
              status: 'rejected' as RegistrationApprovalStatus,
              rejectionReason: rejectionReason || 'Không đáp ứng yêu cầu',
              approvedBy: 'owner-001', // Giả sử owner ID
              approvedDate: new Date().toISOString()
            };
          }
          return reg;
        });
        
        setRegistrations(updatedRegistrations);
        message.success('Đã từ chối đăng ký');
      }
    });
  };
  
  // Handle mark as paid
  const handleMarkAsPaid = (registration: EventRegistration) => {
    confirm({
      title: 'Xác nhận thanh toán',
      content: `Xác nhận ${registration.userName} đã thanh toán phí tham gia?`,
      onOk() {
        // Update payment status
        const updatedRegistrations = registrations.map(reg => {
          if (reg.id === registration.id) {
            return {
              ...reg,
              paymentStatus: 'paid',
              paymentDate: new Date().toISOString()
            };
          }
          return reg;
        });
        
        setRegistrations(updatedRegistrations as EventRegistration[]);
        message.success('Đã cập nhật trạng thái thanh toán');
      }
    });
  };
  
  // Filter registrations based on tab and search text
  const getFilteredRegistrations = () => {
    // First filter by tab (status)
    let filtered = registrations;
    if (activeTab !== 'all') {
      filtered = registrations.filter(reg => reg.status === activeTab);
    }
    
    // Filter by status if selected
    if (filterStatus) {
      filtered = filtered.filter(reg => reg.status === filterStatus);
    }
    
    // Then filter by search text
    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      filtered = filtered.filter(reg => 
        reg.userName.toLowerCase().includes(lowerCaseSearch) ||
        reg.userEmail.toLowerCase().includes(lowerCaseSearch) ||
        reg.userPhone.includes(searchText) ||
        (reg.teamName && reg.teamName.toLowerCase().includes(lowerCaseSearch))
      );
    }
    
    return filtered;
  };
  
  // Format date
  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return dayjs(date).format('DD/MM/YYYY HH:mm');
  };
  
  // Format payment method
  const formatPaymentMethod = (method?: string) => {
    if (!method) return 'N/A';
    const methodMap: Record<string, string> = {
      'bank_transfer': 'Chuyển khoản',
      'cash': 'Tiền mặt',
      'QR': 'Quét mã QR',
      'wallet': 'Ví điện tử'
    };
    return methodMap[method] || method;
  };
  
  // Table columns
  const columns: ColumnsType<EventRegistration> = [
    {
      title: 'Người đăng ký',
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-gray-500 text-sm">{record.userEmail}</div>
          <div className="text-gray-500 text-sm">{record.userPhone}</div>
          {record.teamName && (
            <Tag color="blue" className="mt-1">
              <TeamOutlined /> {record.teamName}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Thời gian đăng ký',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      render: (date) => formatDate(date),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatusTag(status),
    },
    {
      title: 'Thanh toán',
      key: 'payment',
      render: (_, record) => (
        <div>
          {renderPaymentStatusTag(record.paymentStatus)}
          {record.paymentDate && (
            <div className="text-xs text-gray-500 mt-1">
              {formatDate(record.paymentDate)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>
          
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                className="text-green-600"
                onClick={() => handleApproveRegistration(record)}
              >
                Phê duyệt
              </Button>
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleRejectRegistration(record)}
              >
                Từ chối
              </Button>
            </>
          )}
          
          {record.status === 'approved' && record.paymentStatus === 'pending' && !event?.isFreeRegistration && (
            <Button
              type="link"
              size="small"
              className="text-green-600"
              onClick={() => handleMarkAsPaid(record)}
            >
              Đánh dấu đã TT
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Detail Modal Content
  const renderDetailModal = () => {
    if (!currentRegistration) return null;
    
    return (
      <Modal
        title="Chi tiết đăng ký"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        <Descriptions bordered column={2} className="mt-4">
          <Descriptions.Item label="Mã đăng ký" span={2}>
            {currentRegistration.id}
          </Descriptions.Item>
          
          <Descriptions.Item label="Trạng thái">
            {renderStatusTag(currentRegistration.status)}
          </Descriptions.Item>
          
          <Descriptions.Item label="Thanh toán">
            {renderPaymentStatusTag(currentRegistration.paymentStatus)}
          </Descriptions.Item>
          
          <Descriptions.Item label="Người đăng ký" span={2}>
            <div>
              <p><UserOutlined /> {currentRegistration.userName}</p>
              <p><MailOutlined /> {currentRegistration.userEmail}</p>
              <p><PhoneOutlined /> {currentRegistration.userPhone}</p>
            </div>
          </Descriptions.Item>
          
          {currentRegistration.teamName && (
            <Descriptions.Item label="Tên đội" span={2}>
              {currentRegistration.teamName}
            </Descriptions.Item>
          )}
          
          {currentRegistration.teamMembers && currentRegistration.teamMembers.length > 0 && (
            <Descriptions.Item label="Thành viên đội" span={2}>
              <ul className="list-disc pl-5">
                {currentRegistration.teamMembers.map((member, index) => (
                  <li key={index}>
                    <p>{member.name}</p>
                    <p className="text-sm text-gray-500">
                      {member.email || 'Không có email'} | {member.phone || 'Không có SĐT'}
                    </p>
                  </li>
                ))}
              </ul>
            </Descriptions.Item>
          )}
          
          <Descriptions.Item label="Thời gian đăng ký">
            {formatDate(currentRegistration.registrationDate)}
          </Descriptions.Item>
          
          {currentRegistration.approvedDate && (
            <Descriptions.Item label="Thời gian phê duyệt">
              {formatDate(currentRegistration.approvedDate)}
            </Descriptions.Item>
          )}
          
          {currentRegistration.approvedBy && (
            <Descriptions.Item label="Người phê duyệt" span={2}>
              {currentRegistration.approvedBy}
            </Descriptions.Item>
          )}
          
          {currentRegistration.rejectionReason && (
            <Descriptions.Item label="Lý do từ chối" span={2}>
              {currentRegistration.rejectionReason}
            </Descriptions.Item>
          )}
          
          <Divider orientation="left">Thông tin thanh toán</Divider>
          
          {currentRegistration.paymentMethod && (
            <Descriptions.Item label="Phương thức thanh toán">
              {formatPaymentMethod(currentRegistration.paymentMethod)}
            </Descriptions.Item>
          )}
          
          {currentRegistration.paymentDate && (
            <Descriptions.Item label="Ngày thanh toán">
              {formatDate(currentRegistration.paymentDate)}
            </Descriptions.Item>
          )}
          
          {currentRegistration.paymentProof && (
            <Descriptions.Item label="Chứng từ thanh toán" span={2}>
              <Image 
                src={currentRegistration.paymentProof} 
                alt="Chứng từ thanh toán"
                width={400}
              />
            </Descriptions.Item>
          )}
          
          {currentRegistration.notes && (
            <Descriptions.Item label="Ghi chú" span={2}>
              {currentRegistration.notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Modal>
    );
  };

  // Status filter options
  const statusFilterOptions = [
    { value: null, label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ phê duyệt' },
    { value: 'approved', label: 'Đã phê duyệt' },
    { value: 'rejected', label: 'Đã từ chối' }
  ];

  if (!event) return null;

  return (
    <div className="registration-management-container">
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={4}>Quản lý đăng ký: {event.name}</Title>
            <Text type="secondary">
              {event.facilityName || 'Không có thông tin cơ sở'} | {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </Text>
          </div>
          <Button onClick={onClose}>Quay lại</Button>
        </div>
        
        <div className="flex items-center mb-4 gap-4">
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>
          <div>
            <Select
              style={{ width: 200 }}
              placeholder="Lọc theo trạng thái"
              value={filterStatus}
              onChange={value => setFilterStatus(value)}
              allowClear
            >
              {statusFilterOptions.map(option => (
                <Option key={option.value || 'all'} value={option.value as RegistrationApprovalStatus | null}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Button 
              type="default" 
              icon={<ExportOutlined />}
              onClick={() => message.info('Tính năng xuất danh sách đang được phát triển')}
            >
              Xuất danh sách
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Tất cả" key="all" />
        <TabPane tab="Chờ phê duyệt" key="pending" />
        <TabPane tab="Đã phê duyệt" key="approved" />
        <TabPane tab="Đã từ chối" key="rejected" />
      </Tabs>
      
      <Table
        columns={columns}
        dataSource={getFilteredRegistrations().map(reg => ({ ...reg, key: reg.id }))}
        loading={loading}
        pagination={{ pageSize: 10 }}
        className="bg-white rounded-lg shadow-sm mt-4"
      />
      
      {renderDetailModal()}
    </div>
  );
};

export default RegistrationManagement; 