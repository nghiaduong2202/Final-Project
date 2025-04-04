import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Tag, message, Card, Tabs, Modal, Descriptions, Image } from 'antd';
import { SearchOutlined, CheckOutlined, CloseOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import { approvalService } from '@/services/approval.service';
import { Approval, ApprovalFilter } from '@/types/approval.types';

const { Option } = Select;
const { TabPane } = Tabs;

const ApprovalPage: React.FC = () => {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);

  useEffect(() => {
    fetchApprovals();
  }, [activeTab]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const filter: ApprovalFilter = {
        status: activeTab as 'pending' | 'approved' | 'rejected',
        type: filterType as Approval['type'] | undefined
      };
      const response = await approvalService.getApprovals(filter);
      setApprovals(response.data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
      message.error('Không thể tải danh sách yêu cầu phê duyệt');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approvalService.approveRequest(id);
      message.success('Đã phê duyệt yêu cầu');
      fetchApprovals();
    } catch (error) {
      console.error('Error approving request:', error);
      message.error('Không thể phê duyệt yêu cầu');
    }
  };

  const handleReject = async (id: string) => {
    setSelectedApprovalId(id);
    setRejectModalVisible(true);
  };

  const confirmReject = async () => {
    if (!selectedApprovalId || !rejectReason) return;
    
    try {
      await approvalService.rejectRequest(selectedApprovalId, rejectReason);
      message.success('Đã từ chối yêu cầu');
      setRejectModalVisible(false);
      setRejectReason('');
      fetchApprovals();
    } catch (error) {
      console.error('Error rejecting request:', error);
      message.error('Không thể từ chối yêu cầu');
    }
  };

  const handleViewDetails = (approval: Approval) => {
    setSelectedApproval(approval);
    setDetailsModalVisible(true);
  };

  const handleVerifyDocument = async (approvalId: string, documentId: string, isValid: boolean) => {
    try {
      await approvalService.verifyDocument(approvalId, documentId, isValid);
      message.success(`Đã ${isValid ? 'xác nhận' : 'từ chối'} tài liệu`);
      fetchApprovals();
    } catch (error) {
      console.error('Error verifying document:', error);
      message.error('Không thể xác thực tài liệu');
    }
  };

  const getApprovalTypeText = (type: string) => {
    switch (type) {
      case 'facility_registration':
        return 'Đăng ký cơ sở mới';
      case 'facility_name_change':
        return 'Thay đổi tên cơ sở';
      case 'business_license':
        return 'Giấy phép kinh doanh';
      default:
        return type;
    }
  };

  const columns = [
    {
      title: 'Loại yêu cầu',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={
          type === 'facility_registration' ? 'blue' :
          type === 'facility_name_change' ? 'orange' :
          type === 'business_license' ? 'green' : 'default'
        }>
          {getApprovalTypeText(type)}
        </Tag>
      ),
    },
    {
      title: 'Cơ sở',
      key: 'facility',
      render: (record: Approval) => (
        <div>
          <div>{record.facilityName || 'N/A'}</div>
          {record.facilityId && (
            <div className="text-xs text-gray-500">ID: {record.facilityId}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Người yêu cầu',
      key: 'requestedBy',
      render: (record: Approval) => (
        <div>
          <div>{record.requestedBy.name}</div>
          <div className="text-xs text-gray-500">{record.requestedBy.email}</div>
        </div>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (record: Approval) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.id)}
              >
                Từ chối
              </Button>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
              >
                Duyệt
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch = searchText === '' || 
      approval.facilityName?.toLowerCase().includes(searchText.toLowerCase()) ||
      approval.requestedBy.name.toLowerCase().includes(searchText.toLowerCase());
      
    const matchesType = filterType === null || approval.type === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý phê duyệt</h1>
      </div>
      
      <Tabs 
        activeKey={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      >
        <TabPane tab="Đang chờ" key="pending" />
        <TabPane tab="Đã duyệt" key="approved" />
        <TabPane tab="Đã từ chối" key="rejected" />
      </Tabs>
      
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Tìm kiếm theo tên cơ sở, người yêu cầu..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          
          <Select
            placeholder="Lọc theo loại yêu cầu"
            allowClear
            style={{ width: 200 }}
            onChange={value => setFilterType(value)}
          >
            <Option value="facility_registration">Đăng ký cơ sở mới</Option>
            <Option value="facility_name_change">Thay đổi tên cơ sở</Option>
            <Option value="business_license">Giấy phép kinh doanh</Option>
          </Select>
        </div>
      </Card>
      
      <Table
        columns={columns}
        dataSource={filteredApprovals}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      
      {/* Modal Chi tiết yêu cầu */}
      <Modal
        title="Chi tiết yêu cầu phê duyệt"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        width={800}
        footer={null}
      >
        {selectedApproval && (
          <div>
            <Descriptions bordered>
              <Descriptions.Item label="Loại yêu cầu">
                <Tag color={
                  selectedApproval.type === 'facility_registration' ? 'blue' :
                  selectedApproval.type === 'facility_name_change' ? 'orange' :
                  selectedApproval.type === 'business_license' ? 'green' : 'default'
                }>
                  {getApprovalTypeText(selectedApproval.type)}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Cơ sở">
                {selectedApproval.facilityName || 'N/A'}
                {selectedApproval.facilityId && (
                  <div className="text-xs text-gray-500">ID: {selectedApproval.facilityId}</div>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="Người yêu cầu">
                {selectedApproval.requestedBy.name}
                <div className="text-xs text-gray-500">{selectedApproval.requestedBy.email}</div>
              </Descriptions.Item>
              
              <Descriptions.Item label="Ngày tạo">
                {new Date(selectedApproval.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Descriptions.Item>
              
              <Descriptions.Item label="Mô tả" span={3}>
                {selectedApproval.details.description}
              </Descriptions.Item>
              
              {selectedApproval.details.facilityInfo && (
                <>
                  <Descriptions.Item label="Thông tin cơ sở" span={3}>
                    <div className="space-y-4">
                      <div>
                        <strong>Tên cơ sở:</strong> {selectedApproval.details.facilityInfo.name}
                      </div>
                      <div>
                        <strong>Địa chỉ:</strong> {selectedApproval.details.facilityInfo.address}
                      </div>
                      <div>
                        <strong>Mô tả:</strong> {selectedApproval.details.facilityInfo.description}
                      </div>
                      {selectedApproval.details.facilityInfo.images.length > 0 && (
                        <div>
                          <strong>Hình ảnh:</strong>
                          <Image.PreviewGroup>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {selectedApproval.details.facilityInfo.images.map((image, index) => (
                                <Image
                                  key={index}
                                  src={image}
                                  alt={`Hình ảnh ${index + 1}`}
                                  className="rounded-lg"
                                />
                              ))}
                            </div>
                          </Image.PreviewGroup>
                        </div>
                      )}
                    </div>
                  </Descriptions.Item>
                </>
              )}
              
              <Descriptions.Item label="Tài liệu" span={3}>
                <div className="space-y-4">
                  {selectedApproval.details.documents.map((doc, index) => (
                    <div key={index} className="border p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <FileTextOutlined className="mr-2" />
                          <span>{doc.name}</span>
                          <Tag className="ml-2">
                            {doc.type === 'business_registration' ? 'Giấy chứng nhận' : 'Giấy phép'}
                            {doc.sportType && ` - ${doc.sportType}`}
                          </Tag>
                        </div>
                        <div>
                          <Button
                            type="link"
                            onClick={() => window.open(doc.url, '_blank')}
                          >
                            Xem tài liệu
                          </Button>
                          {selectedApproval.status === 'pending' && (
                            <Space>
                              <Button
                                type="link"
                                danger
                                onClick={() => handleVerifyDocument(selectedApproval.id, doc.url, false)}
                              >
                                Từ chối
                              </Button>
                              <Button
                                type="link"
                                onClick={() => handleVerifyDocument(selectedApproval.id, doc.url, true)}
                              >
                                Xác nhận
                              </Button>
                            </Space>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Modal Từ chối yêu cầu */}
      <Modal
        title="Từ chối yêu cầu"
        open={rejectModalVisible}
        onOk={confirmReject}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
        }}
      >
        <Input.TextArea
          rows={4}
          placeholder="Nhập lý do từ chối..."
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ApprovalPage;