import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Typography, 
  Spin, 
  message, 
  Divider, 
  TimePicker, 
  Select, 
  Upload, 
  Tabs,
  Card,
  Tag,
  Space,
  Empty,
  List,
  Table,
  Modal,
  Row,
  Col
} from 'antd';
import { 
  SaveOutlined, 
  UploadOutlined, 
  MinusCircleOutlined,
  InfoCircleOutlined,
  FileImageOutlined,
  TagOutlined,
  FileOutlined,
  FolderOpenOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  GiftOutlined,
  LinkOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Facility } from '@/types/facility.type';
import { facilityService } from '@/services/facility.service';
import { Sport } from '@/types/sport.type';
import { getSportNameInVietnamese } from '@/utils/translateSport';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { UploadFile as AntdUploadFile, RcFile } from 'antd/es/upload/interface';
import { sportService } from '@/services/sport.service';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = TimePicker;

interface FacilityEditProps {
  facilityId: string;
  onClose: (updated?: boolean) => void;
}

interface FacilityFormValues {
  name: string;
  description: string;
  location: string;
  openTime1: dayjs.Dayjs | null;
  closeTime1: dayjs.Dayjs | null;
  openTime2: dayjs.Dayjs | null;
  closeTime2: dayjs.Dayjs | null;
  openTime3: dayjs.Dayjs | null;
  closeTime3: dayjs.Dayjs | null;
  numberOfShifts: number;
  sportIds: number[];
  status?: 'pending' | 'active' | 'unactive' | 'closed' | 'banned';
}

// Khai báo interface cho file upload từ Ant Design
interface UploadFile extends Omit<AntdUploadFile, 'originFileObj'> {
  uid: string;
  name: string;
  status?: 'uploading' | 'done' | 'error' | 'removed';
  url?: string;
  thumbUrl?: string;
  originFileObj?: RcFile;
  response?: unknown;
  error?: unknown;
  linkProps?: unknown;
  type?: string;
  size?: number;
  percent?: number;
}

// Tạo các hàm helper để kiểm tra trạng thái phê duyệt
const hasPendingCertificateApproval = (facility: Facility) => {
  return facility.approvals?.some(approval => 
    approval.type === 'certificate' && approval.status === 'pending'
  );
};

const hasPendingLicenseApproval = (facility: Facility, sportId: number) => {
  return facility.approvals?.some(approval => 
    approval.type === 'license' && 
    approval.status === 'pending' && 
    approval.sport?.id === sportId
  );
};

const FacilityEdit: React.FC<FacilityEditProps> = ({ facilityId, onClose }) => {
  const [form] = Form.useForm<FacilityFormValues>();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [allSports, setAllSports] = useState<Sport[]>([]);
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [licenseFiles, setLicenseFiles] = useState<Record<number, File>>({});
  const [numberOfShifts, setNumberOfShifts] = useState<number>(1);
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
  const navigate = useNavigate();
  // Thêm state riêng để lưu certificate khi đổi tên
  const [nameChangeFile, setNameChangeFile] = useState<File | null>(null);
  
  // Hàm thêm khung giờ hoạt động
  const addShift = () => {
    if (numberOfShifts < 3) {
      setNumberOfShifts(prev => prev + 1);
    }
  };

  // Hàm xóa khung giờ hoạt động
  const removeShift = (shiftNumber: number) => {
    if (shiftNumber === 2 && numberOfShifts === 3) {
      // Nếu xóa khung giờ 2 trong khi có 3 khung giờ, cần dịch chuyển dữ liệu từ khung giờ 3 lên khung giờ 2
      const openTime3 = form.getFieldValue('openTime3');
      const closeTime3 = form.getFieldValue('closeTime3');
      
      form.setFieldsValue({
        openTime2: openTime3,
        closeTime2: closeTime3,
        openTime3: null,
        closeTime3: null
      });
    } else {
      // Xóa dữ liệu của khung giờ đang xóa
      const openTimeField = `openTime${shiftNumber}` as 'openTime2' | 'openTime3';
      const closeTimeField = `closeTime${shiftNumber}` as 'closeTime2' | 'closeTime3';
      
      form.setFieldsValue({
        [openTimeField]: null,
        [closeTimeField]: null
      });
    }
    
    setNumberOfShifts(prev => prev - 1);
  };

  // Xử lý khi thay đổi timeRange
  const handleTimeRangeChange = (index: number, times: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (!times) return;
    
    const [start, end] = times;
    if (!start || !end) return;

    // Dựa vào index để xác định ca nào đang được thay đổi
    if (index === 1) {
      form.setFieldsValue({
        openTime1: start,
        closeTime1: end
      });
    } else if (index === 2) {
      form.setFieldsValue({
        openTime2: start,
        closeTime2: end
      });
    } else if (index === 3) {
      form.setFieldsValue({
        openTime3: start,
        closeTime3: end
      });
    }
  };
  
  // Tiện ích để lấy giá trị timeRange từ open/close time
  const getTimeRange = (shiftIndex: number): [dayjs.Dayjs | null, dayjs.Dayjs | null] | undefined => {
    const values = form.getFieldsValue();
    
    if (shiftIndex === 1 && values.openTime1 && values.closeTime1) {
      return [values.openTime1, values.closeTime1];
    } else if (shiftIndex === 2 && values.openTime2 && values.closeTime2) {
      return [values.openTime2, values.closeTime2];  
    } else if (shiftIndex === 3 && values.openTime3 && values.closeTime3) {
      return [values.openTime3, values.closeTime3];
    }
    
    return undefined;
  };

  // Handle form submission
  const handleSubmit = async (values: FacilityFormValues) => {
    try {
      setSubmitting(true);
      
      // Format times for submission
      const formattedValues: Partial<Facility> = {
        description: values.description,
        location: values.location,
        openTime1: values.openTime1 ? values.openTime1.format('HH:mm') : '',
        closeTime1: values.closeTime1 ? values.closeTime1.format('HH:mm') : '',
        openTime2: values.openTime2 ? values.openTime2.format('HH:mm') : '',
        closeTime2: values.closeTime2 ? values.closeTime2.format('HH:mm') : '',
        openTime3: values.openTime3 ? values.openTime3.format('HH:mm') : '',
        closeTime3: values.closeTime3 ? values.closeTime3.format('HH:mm') : '',
        numberOfShifts: values.numberOfShifts,
        status: values.status as 'pending' | 'active' | 'unactive' | 'closed' | 'banned'
      };
      
      // Nếu tên bị thay đổi, sử dụng API approval cho cập nhật tên
      if (facility && values.name !== facility.name) {
        try {
          await facilityService.updateFacilityName(facilityId, { 
            name: values.name,
            certificate: nameChangeFile
          });
          
          // Thông báo chi tiết hơn
          Modal.success({
            title: 'Đã gửi yêu cầu thành công',
            content: (
              <div>
                <p>Yêu cầu cập nhật tên cơ sở đã được gửi và đang chờ phê duyệt.</p>
                <p>Trong thời gian chờ phê duyệt, tên cơ sở hiện tại vẫn được sử dụng.</p>
              </div>
            ),
          });
        } catch (error) {
          console.error('Failed to update facility name:', error);
          message.error('Không thể cập nhật tên cơ sở');
        } finally {
          setSubmitting(false);
        }
      } else {
        // Nếu không thay đổi tên, sử dụng API cập nhật thông thường
        formattedValues.name = values.name;
      }
      
      // Cập nhật thông tin cơ bản của cơ sở
      await facilityService.updateFacility(facilityId, formattedValues);
      
      // Xử lý upload hình ảnh mới nếu có
      const fileList = uploadFileList || [];
      if (fileList.length > 0) {
        const fileObjects = fileList
          .filter((file) => file.originFileObj)
          .map((file) => file.originFileObj);
        
        if (fileObjects.length > 0 && fileObjects.every(Boolean)) {
          await facilityService.uploadFacilityImages(facilityId, fileObjects as File[]);
        }
      }
      
      message.success('Cập nhật cơ sở thành công');
      onClose(true);
    } catch (error) {
      console.error('Failed to update facility:', error);
      message.error('Không thể cập nhật thông tin cơ sở');
    } finally {
      setSubmitting(false);
    }
  };
  
  // File upload configuration
  const uploadProps = {
    beforeUpload: (file: RcFile) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Bạn chỉ có thể tải lên file hình ảnh!');
      }
      return isImage ? false : Upload.LIST_IGNORE;
    },
    accept: 'image/*',
    fileList: uploadFileList,
    onChange: ({ fileList }: { fileList: UploadFile[] }) => {
      setUploadFileList(fileList);
    }
  };
  
  // Navigation to management pages
  const navigateToFieldManagement = () => {
    navigate(`/owner/field-management?facilityId=${facilityId}`);
  };
  
  const navigateToServiceManagement = () => {
    navigate(`/owner/service-management?facilityId=${facilityId}`);
  };
  
  const navigateToEventManagement = () => {
    navigate(`/owner/event-management?facilityId=${facilityId}`);
  };
  
  const navigateToVoucherManagement = () => {
    navigate(`/owner/voucher-management?facilityId=${facilityId}`);
  };
  
  // Handle cancel
  // const handleCancel = () => {
  //   onClose();
  // };
  
  // Certificate file upload
  const handleCertificateUpload = (file: File) => {
    setCertificateFile(file);
    return false; // prevent auto upload
  };
  
  // Submit certificate qua approval API
  const handleCertificateSubmit = async () => {
    if (!certificateFile) {
      message.error('Vui lòng chọn file giấy chứng nhận trước khi gửi');
      return;
    }
    
    try {
      setSubmitting(true);
      await facilityService.updateCertificate(facilityId, certificateFile);
      
      // Thông báo chi tiết hơn
      Modal.success({
        title: 'Đã gửi yêu cầu thành công',
        content: (
          <div>
            <p>Yêu cầu cập nhật giấy chứng nhận đã được gửi và đang chờ phê duyệt.</p>
            <p>Trong thời gian chờ phê duyệt, giấy chứng nhận hiện tại (nếu có) vẫn được sử dụng.</p>
          </div>
        ),
      });
      
      setCertificateFile(null);
      // Refresh data
      const data = await facilityService.getFacilityById(facilityId);
      setFacility(data);
    } catch (error) {
      console.error('Không thể gửi yêu cầu cập nhật giấy chứng nhận:', error);
      message.error('Không thể gửi yêu cầu cập nhật giấy chứng nhận');
    } finally {
      setSubmitting(false);
    }
  };
  
  // License file upload
  const handleLicenseUpload = (file: File, sportId: number) => {
    setLicenseFiles(prev => ({
      ...prev,
      [sportId]: file
    }));
    return false; // prevent auto upload
  };
  
  // Submit license qua approval API
  const handleLicenseSubmit = async (sportId: number) => {
    const licenseFile = licenseFiles[sportId];
    if (!licenseFile) {
      message.error('Vui lòng chọn file giấy phép trước khi gửi');
      return;
    }
    
    try {
      setSubmitting(true);
      await facilityService.updateLicense(facilityId, sportId, licenseFile);
      
      // Thông báo chi tiết hơn
      Modal.success({
        title: 'Đã gửi yêu cầu thành công',
        content: (
          <div>
            <p>Yêu cầu cập nhật giấy phép kinh doanh đã được gửi và đang chờ phê duyệt.</p>
            <p>Trong thời gian chờ phê duyệt, giấy phép hiện tại (nếu có) vẫn được sử dụng.</p>
          </div>
        ),
      });
      
      // Xóa file đã upload khỏi state
      setLicenseFiles(prev => {
        const newFiles = {...prev};
        delete newFiles[sportId];
        return newFiles;
      });
      
      // Refresh data
      const data = await facilityService.getFacilityById(facilityId);
      setFacility(data);
    } catch (error) {
      console.error('Không thể gửi yêu cầu cập nhật giấy phép:', error);
      message.error('Không thể gửi yêu cầu cập nhật giấy phép');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Fetch facility data and sports data on component mount
  useEffect(() => {
    const fetchFacilityData = async () => {
      try {
        setLoading(true);
        // Gọi API để lấy dữ liệu cơ sở
        const data = await facilityService.getFacilityById(facilityId);
        setFacility(data);
        setNumberOfShifts(data.numberOfShifts || 1);        
        
        // Set initial form values
        form.setFieldsValue({
          name: data.name,
          description: data.description,
          location: data.location,
          openTime1: data.openTime1 ? dayjs(data.openTime1, 'HH:mm') : null,
          closeTime1: data.closeTime1 ? dayjs(data.closeTime1, 'HH:mm') : null,
          openTime2: data.openTime2 ? dayjs(data.openTime2, 'HH:mm') : null,
          closeTime2: data.closeTime2 ? dayjs(data.closeTime2, 'HH:mm') : null,
          openTime3: data.openTime3 ? dayjs(data.openTime3, 'HH:mm') : null,
          closeTime3: data.closeTime3 ? dayjs(data.closeTime3, 'HH:mm') : null,
          numberOfShifts: data.numberOfShifts || 1,
          status: data.status
        });
        
        // Xử lý danh sách sport IDs từ fieldGroups
        if (data.fieldGroups && data.fieldGroups.length > 0) {
          // Thu thập tất cả các sportIds từ tất cả các fieldGroups
          const allSportIds = data.fieldGroups.flatMap(group => {
            if (group.sports) return group.sports.map(sport => sport.id);
            return [];
          });
          
          // Loại bỏ các ID trùng lặp
          const uniqueSportIds = [...new Set(allSportIds)];
          
          // Cập nhật form với danh sách sportIds đã trích xuất
          form.setFieldsValue({
            sportIds: uniqueSportIds
          });
        }
        
        // Xử lý danh sách hình ảnh
        if (data.imagesUrl && data.imagesUrl.length > 0) {
          const fileList: UploadFile[] = data.imagesUrl.map((url, index) => ({
            uid: `-${index}`,
            name: url.split('/').pop() || `image-${index}.jpg`,
            status: 'done',
            url,
          }));
          setUploadFileList(fileList);
        }
      } catch (error) {
        console.error('Failed to fetch facility details:', error);
        message.error('Không thể tải thông tin cơ sở.');
      } finally {
        setLoading(false);
      }
    };
    
    // Gọi API lấy danh sách thể thao - Nếu không có getAllSports, sử dụng mock data
    const fetchSports = async () => {
      try {        
        const data = await sportService.getSport();
        // Tạm thời sử dụng mock data
        const sportsList = data;         
        setAllSports(sportsList);
      } catch (error) {
        console.error('Failed to fetch sports:', error);
      }
    };
    
    if (facilityId) {
      fetchFacilityData();
      fetchSports();
    }
  }, [facilityId, form]);
  
  // Phương thức xóa hình ảnh
  const handleDeleteImage = async (imageUrl: string) => {
    try {
      Modal.confirm({
        title: 'Xác nhận xóa hình ảnh',
        content: 'Bạn có chắc chắn muốn xóa hình ảnh này? Hành động này không thể hoàn tác.',
        okText: 'Xóa',
        okType: 'danger',
        cancelText: 'Hủy',
        onOk: async () => {
    try {
      setSubmitting(true);
      await facilityService.deleteFacilityImages(facilityId, imageUrl);
      
      // Cập nhật lại danh sách hình ảnh trong state
      setUploadFileList(prev => prev.filter(file => file.url !== imageUrl));
      
      message.success('Đã xóa hình ảnh');
    } catch (error) {
      console.error('Failed to delete image:', error);
      message.error('Không thể xóa hình ảnh');
    } finally {
      setSubmitting(false);
          }
        }
      });
    } catch (error) {
      console.error('Failed to delete image:', error);
      message.error('Không thể xóa hình ảnh');
    }
  };
  
  // Thêm hàm xử lý upload cho phần đổi tên
  const handleNameCertificateUpload = (file: File) => {
    setNameChangeFile(file);
    return false; // prevent auto upload
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spin size="large" tip="Đang tải thông tin cơ sở..." />
      </div>
    );
  }
  
  if (!facility) {
    return (
      <div className="p-8 text-center">
        <Text>Không tìm thấy thông tin cơ sở</Text>
        <div className="mt-4">
          <Button onClick={() => onClose()}>Đóng</Button>
        </div>
      </div>
    );
  }
  
  const tabItems = [
    { key: 'basic', label: 'Thông tin cơ bản', icon: <InfoCircleOutlined /> },
    { key: 'images', label: 'Hình ảnh', icon: <FileImageOutlined /> },
    { key: 'fields', label: 'Nhóm sân', icon: <AppstoreOutlined /> },
    { key: 'services', label: 'Dịch vụ', icon: <FolderOpenOutlined /> },
    { key: 'events', label: 'Sự kiện', icon: <CalendarOutlined /> },
    { key: 'vouchers', label: 'Khuyến mãi', icon: <GiftOutlined /> },
    { key: 'documents', label: 'Giấy tờ xác thực', icon: <FileOutlined /> },
    { key: 'status', label: 'Trạng thái', icon: <TagOutlined /> }
  ];
  
  return (
    <div className="facility-edit w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b shadow-sm">
        {/* Facility title and edit button row */}
        <div className="flex justify-between items-center px-5 mt-8">
          <div>
            <div className="flex items-center">
              <Title level={3} className="m-0 mr-3">{facility.name}</Title>
              <Tag color={facility.status === 'active' ? 'success' : 
                     facility.status === 'pending' ? 'warning' : 
                     facility.status === 'closed' ? 'default' : 'error'}>
                {facility.status === 'active' ? 'Đang hoạt động' : 
                 facility.status === 'pending' ? 'Đang chờ phê duyệt' : 
                 facility.status === 'closed' ? 'Đang đóng cửa' : 
                 facility.status === 'unactive' ? 'Đã bị từ chối' : 'Đã bị cấm'}
              </Tag>
            </div>
          </div>
        </div>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={(value) => setActiveTab(value)}
          items={tabItems.map(item => ({
            key: item.key,
            label: (
              <span>
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </span>
            )
          }))}
          className="px-6"
          size="large"
        />
      </div>
      
      {/* Form */}
      <div className="p-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          className="w-full"
        >
          {activeTab === 'basic' && (
            <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
              {/* Khối 1: Đổi tên cơ sở */}
              <Card title="Tên cơ sở" className="mb-4">
                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.name !== currentValues.name}>
                  {() => (
                    <div className="flex items-start">
                      <div className="flex-grow mr-4">
                        {facility.status === 'active' ? (
                          <>
                            <Form.Item name="name" noStyle>
                              <Input placeholder="Nhập tên cơ sở" className="w-full" />
                            </Form.Item>
                            <div className="mt-2">
                              <Text type="secondary">
                                Tên cơ sở sẽ hiển thị trên hệ thống và cho người dùng. Việc thay đổi tên cơ sở cần được phê duyệt.
                              </Text>
                            </div>
                            
                            {facility.name !== form.getFieldValue('name') && (
                              <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                <div className="mb-2">
                                  <Text strong className="text-yellow-700">Yêu cầu bắt buộc: Tải lên giấy chứng nhận</Text>
                                </div>
                                <div className="mb-3">
                                  <Text className="text-yellow-700">
                                    Để thay đổi tên cơ sở, bạn cần tải lên giấy chứng nhận kinh doanh có tên mới.
                                  </Text>
                                </div>
                                <Upload
                                  beforeUpload={handleNameCertificateUpload}
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  maxCount={1}
                                  fileList={nameChangeFile ? [{ uid: '1', name: nameChangeFile.name, status: 'done' }] as UploadFile[] : []}
                                  onRemove={() => setNameChangeFile(null)}
                                >
                                  <Button icon={<UploadOutlined />}>
                                    Chọn file giấy chứng nhận
                                  </Button>
                                </Upload>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="bg-gray-50 p-3 rounded-md">
                              <Text>{facility.name}</Text>
                            </div>
                            <div className="mt-2">
                              <Text type="secondary">
                                Cơ sở phải ở trạng thái hoạt động mới có thể yêu cầu đổi tên
                              </Text>
                            </div>
                          </>
                        )}
                      </div>
                      <Button 
                        type="primary" 
                        disabled={
                          facility.status !== 'active' || 
                          facility.name === form.getFieldValue('name') || 
                          (facility.name !== form.getFieldValue('name') && !nameChangeFile)
                        }
                        onClick={() => {
                          const nameValue = form.getFieldValue('name');
                          if (nameValue !== facility.name) {
                            // Hiển thị modal xác nhận trước khi gửi
                            Modal.confirm({
                              title: 'Xác nhận cập nhật tên cơ sở',
                              content: 'Việc thay đổi tên cơ sở sẽ cần được phê duyệt bởi admin. Bạn có chắc chắn muốn gửi yêu cầu cập nhật tên?',
                              onOk: async () => {
                                try {
                                  setSubmitting(true);
                                  await facilityService.updateFacilityName(facilityId, {
                                    name: nameValue,
                                    certificate: nameChangeFile
                                  });
                                  
                                  // Thông báo chi tiết hơn
                                  Modal.success({
                                    title: 'Đã gửi yêu cầu thành công',
                                    content: (
                                      <div>
                                        <p>Yêu cầu cập nhật tên cơ sở đã được gửi và đang chờ phê duyệt.</p>
                                        <p>Trong thời gian chờ phê duyệt, tên cơ sở hiện tại vẫn được sử dụng.</p>
                                      </div>
                                    ),
                                  });
                                  
                                  // Reset certificate file sau khi submit thành công
                                  setNameChangeFile(null);
                                } catch (error) {
                                  console.error('Failed to update facility name:', error);
                                  message.error('Không thể cập nhật tên cơ sở');
                                } finally {
                                  setSubmitting(false);
                                }
                              }
                            });
                          } else {
                            message.info('Bạn chưa thay đổi tên cơ sở');
                          }
                        }}
                      >
                        Yêu cầu đổi tên
                      </Button>
                    </div>
                  )}
                </Form.Item>
              </Card>

              {/* Khối 2: Thông tin không thể chỉnh sửa */}
              <Card title="Thông tin cố định" className="mb-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Địa chỉ */}
                  <div>
                    <div className="font-medium mb-1">Địa chỉ:</div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <Text>{facility.location}</Text>
                    </div>
                    <div className="mt-1">
                      <Text type="secondary">Địa chỉ cơ sở không thể thay đổi sau khi tạo</Text>
                    </div>
                  </div>

                  {/* Môn thể thao */}
                  <div>
                    <div className="font-medium mb-1">Các môn thể thao:</div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex flex-wrap gap-2">
                        {form.getFieldValue('sportIds')?.map((sportId: number) => {
                          const sport = allSports.find(s => s.id === sportId);
                          return sport ? (
                            <Tag key={sport.id} color="blue">
                              {getSportNameInVietnamese(sport.name)}
                            </Tag>
                          ) : null;
                        })}
                      </div>
                    </div>
                    <div className="mt-1">
                      <Text type="secondary">Môn thể thao chỉ có thể thay đổi trong mục quản lý nhóm sân</Text>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Khối 3: Thông tin có thể chỉnh sửa */}
              <Card title="Thông tin có thể chỉnh sửa" className="mb-4">
                <div className="grid grid-cols-1 gap-6">
                  {/* Mô tả */}
                  <div>
                <Form.Item 
                  name="description" 
                  label="Mô tả" 
                  rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                >
                  <TextArea 
                    placeholder="Nhập mô tả chi tiết về cơ sở" 
                    rows={4} 
                  />
                </Form.Item>
                  </div>

                  {/* Giờ hoạt động */}
                  <div>
                    <div className="font-medium mb-3">Giờ hoạt động</div>
                    <Row className="mb-2">
                      <Col span={24}>
                        <div className="flex items-center">
                          <Text>Số ca trong ngày: {numberOfShifts}</Text>
                        </div>
                      </Col>
                    </Row>
                    
                    {/* Ca 1 - luôn hiển thị */}
                    <Row gutter={16} className="mb-4">
                      <Col span={24}>
                  <Form.Item
                          label={<span className="font-medium">Khung giờ hoạt động (Ca 1)</span>}
                          required
                          className="mb-1"
                        >
                          <div className="flex items-center">
                      <Form.Item 
                              name="timeRange1"
                              className="mb-0 flex-grow"
                              rules={[
                                { 
                                  validator: async (_, value) => {
                                    if (!value || !value[0] || !value[1]) {
                                      return Promise.reject('Vui lòng chọn giờ hoạt động');
                                    }
                                    const openTime = value[0];
                                    const closeTime = value[1];
                                    if (openTime.isAfter(closeTime)) {
                                      return Promise.reject('Giờ đóng cửa phải sau giờ mở cửa');
                                    }
                                    return Promise.resolve();
                                  }
                                }
                              ]}
                              getValueProps={() => {
                                return { value: getTimeRange(1) };
                              }}
                            >
                              <RangePicker
                                format="HH:mm"
                                className="w-full"
                                placeholder={['Giờ mở cửa', 'Giờ đóng cửa']}
                                minuteStep={30}
                                onChange={(times) => handleTimeRangeChange(1, times as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                              />
                      </Form.Item>
                      
                            {/* Hidden fields to store values for API compatibility */}
                            <Form.Item name="openTime1" hidden>
                              <Input />
                            </Form.Item>
                            <Form.Item name="closeTime1" hidden>
                              <Input />
                      </Form.Item>
                    </div>
                        </Form.Item>
                      </Col>
                    </Row>
                  
                    {/* Ca 2 - hiển thị khi numberOfShifts >= 2 */}
                  {numberOfShifts >= 2 && (
                      <Row gutter={16} className="mb-4">
                        <Col span={23}>
                        <Form.Item 
                            label={<span className="font-medium">Khung giờ hoạt động (Ca 2)</span>}
                            required
                            className="mb-1"
                          >
                            <div className="flex items-center">
                        <Form.Item 
                                name="timeRange2"
                                className="mb-0 flex-grow"
                                rules={[
                                  { 
                                    validator: async (_, value) => {
                                      if (!value || !value[0] || !value[1]) {
                                        return Promise.reject('Vui lòng chọn giờ hoạt động');
                                      }
                                      const values = form.getFieldsValue();
                                      const closeTime1 = values.closeTime1;
                                      const openTime = value[0];
                                      const closeTime = value[1];
                                      
                                      if (closeTime1 && openTime.isBefore(closeTime1)) {
                                        return Promise.reject('Giờ mở cửa ca 2 phải sau giờ đóng cửa ca 1');
                                      }
                                      if (openTime.isAfter(closeTime)) {
                                        return Promise.reject('Giờ đóng cửa phải sau giờ mở cửa');
                                      }
                                      return Promise.resolve();
                                    }
                                  }
                                ]}
                                getValueProps={() => {
                                  return { value: getTimeRange(2) };
                                }}
                              >
                                <RangePicker
                                  format="HH:mm"
                                  className="w-full"
                                  placeholder={['Giờ mở cửa', 'Giờ đóng cửa']}
                                  minuteStep={30}
                                  onChange={(times) => handleTimeRangeChange(2, times as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                                />
                              </Form.Item>
                              
                              {/* Hidden fields to store values for API compatibility */}
                              <Form.Item name="openTime2" hidden>
                                <Input />
                              </Form.Item>
                              <Form.Item name="closeTime2" hidden>
                                <Input />
                        </Form.Item>
                      </div>
                          </Form.Item>
                        </Col>
                        <Col span={1} className="flex items-center mt-8">
                          <Button 
                            type="text" 
                            danger 
                            icon={<MinusCircleOutlined />} 
                            onClick={() => removeShift(2)}
                          />
                        </Col>
                      </Row>
                    )}
                    
                    {/* Ca 3 - hiển thị khi numberOfShifts >= 3 */}
                  {numberOfShifts >= 3 && (
                      <Row gutter={16} className="mb-4">
                        <Col span={23}>
                        <Form.Item 
                            label={<span className="font-medium">Khung giờ hoạt động (Ca 3)</span>}
                            required
                            className="mb-1"
                          >
                            <div className="flex items-center">
                        <Form.Item 
                                name="timeRange3"
                                className="mb-0 flex-grow"
                                rules={[
                                  { 
                                    validator: async (_, value) => {
                                      if (!value || !value[0] || !value[1]) {
                                        return Promise.reject('Vui lòng chọn giờ hoạt động');
                                      }
                                      const values = form.getFieldsValue();
                                      const closeTime2 = values.closeTime2;
                                      const openTime = value[0];
                                      const closeTime = value[1];
                                      
                                      if (closeTime2 && openTime.isBefore(closeTime2)) {
                                        return Promise.reject('Giờ mở cửa ca 3 phải sau giờ đóng cửa ca 2');
                                      }
                                      if (openTime.isAfter(closeTime)) {
                                        return Promise.reject('Giờ đóng cửa phải sau giờ mở cửa');
                                      }
                                      return Promise.resolve();
                                    }
                                  }
                                ]}
                                getValueProps={() => {
                                  return { value: getTimeRange(3) };
                                }}
                              >
                                <RangePicker
                                  format="HH:mm"
                                  className="w-full"
                                  placeholder={['Giờ mở cửa', 'Giờ đóng cửa']}
                                  minuteStep={30}
                                  onChange={(times) => handleTimeRangeChange(3, times as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                                />
                              </Form.Item>
                              
                              {/* Hidden fields to store values for API compatibility */}
                              <Form.Item name="openTime3" hidden>
                                <Input />
                              </Form.Item>
                              <Form.Item name="closeTime3" hidden>
                                <Input />
                        </Form.Item>
                      </div>
                          </Form.Item>
                        </Col>
                        <Col span={1} className="flex items-center mt-8">
                          <Button 
                            type="text" 
                            danger 
                            icon={<MinusCircleOutlined />} 
                            onClick={() => removeShift(3)}
                          />
                        </Col>
                      </Row>
                    )}
                    
                    {/* Button thêm ca - đặt sau ca cuối cùng */}
                    {numberOfShifts < 3 && (
                      <Row className="mb-4">
                        <Col span={24}>
                          <Button 
                            type="dashed" 
                            onClick={addShift} 
                            icon={<PlusOutlined />}
                            className="w-full"
                          >
                            Thêm khung giờ hoạt động
                          </Button>
                        </Col>
                      </Row>
                    )}
                  </div>
                </div>

                {/* Button lưu */}
                <div className="flex justify-end mt-6">
                  <Button
                    type="primary"
                    onClick={async () => {
                      try {
                        // Validate form fields
                        const values = await form.validateFields([
                          'description', 
                          'timeRange1',
                          'timeRange2',
                          'timeRange3',
                          'openTime1', 'closeTime1',
                          'openTime2', 'closeTime2',
                          'openTime3', 'closeTime3'
                        ]);
                        
                        setSubmitting(true);
                        
                        // Format times for submission
                        const formattedValues: Partial<Facility> = {
                          description: values.description,                          
                          openTime1: values.openTime1 ? dayjs(values.openTime1).format('HH:mm') : undefined,
                          closeTime1: values.closeTime1 ? dayjs(values.closeTime1).format('HH:mm') : undefined,
                          openTime2: values.openTime2 ? dayjs(values.openTime2).format('HH:mm') : undefined,
                          closeTime2: values.closeTime2 ? dayjs(values.closeTime2).format('HH:mm') : undefined,
                          openTime3: values.openTime3 ? dayjs(values.openTime3).format('HH:mm') : undefined,
                          closeTime3: values.closeTime3 ? dayjs(values.closeTime3).format('HH:mm') : undefined
                        };
                        
                        // Cập nhật thông tin cơ bản của cơ sở
                        await facilityService.updateFacility(facilityId, formattedValues);
                        message.success('Đã cập nhật thông tin cơ bản');
                        
                        // Refresh data
                        const data = await facilityService.getFacilityById(facilityId);
                        setFacility(data);
                      } catch (error) {
                        console.error('Failed to update facility:', error);
                        message.error('Không thể cập nhật thông tin cơ sở');
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    loading={submitting}
                    icon={<SaveOutlined />}
                  >
                    Lưu thông tin cơ bản
                  </Button>
                </div>
                </Card>
            </div>
          )}
          
          {activeTab === 'images' && (
            <Card title="Quản lý hình ảnh" className="max-h-[calc(100vh-240px)] overflow-y-auto">
              <div className="mb-4">
                <Title level={5}>Hình ảnh hiện tại</Title>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {facility.imagesUrl && facility.imagesUrl.length > 0 ? facility.imagesUrl.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image} 
                        alt={`facility-${index}`} 
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                        <Button 
                          danger 
                          type="primary" 
                          size="small" 
                          icon={<MinusCircleOutlined />}
                          onClick={() => handleDeleteImage(image)}
                        >
                          Xoá ảnh
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <Empty description="Chưa có hình ảnh nào" className="col-span-full" />
                  )}
                </div>
              </div>
              
              <Divider />
              
              <div>
                <Title level={5}>Thêm hình ảnh mới</Title>
                <Upload
                  listType="picture-card"
                  {...uploadProps}
                  multiple
                >
                  <div>
                    <UploadOutlined />
                    <div className="mt-2">Tải ảnh lên</div>
                  </div>
                </Upload>
                
                <div className="flex justify-end mt-6">
                  <Button
                    type="primary"
                    onClick={() => {
                      // Kiểm tra xem có hình ảnh mới để tải lên hay không
                      const fileList = uploadFileList || [];
                      const newFiles = fileList.filter((file) => file.originFileObj);
                      
                      if (newFiles.length === 0) {
                        message.info('Không có hình ảnh mới để tải lên');
                        return;
                      }
                      
                      Modal.confirm({
                        title: 'Xác nhận tải lên hình ảnh mới',
                        content: `Bạn có chắc chắn muốn tải lên ${newFiles.length} hình ảnh mới?`,
                        okText: 'Tải lên',
                        cancelText: 'Hủy',
                        onOk: async () => {
                          try {
                            setSubmitting(true);
                            
                            const fileObjects = newFiles.map((file) => file.originFileObj);
                            
                            if (fileObjects.length > 0 && fileObjects.every(Boolean)) {
                              await facilityService.uploadFacilityImages(facilityId, fileObjects as File[]);
                              message.success('Đã tải lên hình ảnh mới');
                              
                              // Refresh data sau khi upload
                              const data = await facilityService.getFacilityById(facilityId);
                              setFacility(data);
                              
                              // Cập nhật danh sách hình ảnh
                              if (data.imagesUrl && data.imagesUrl.length > 0) {
                                const updatedFileList: UploadFile[] = data.imagesUrl.map((url, index) => ({
                                  uid: `-${index}`,
                                  name: url.split('/').pop() || `image-${index}.jpg`,
                                  status: 'done',
                                  url,
                                }));
                                setUploadFileList(updatedFileList);
                              }
                            }
                          } catch (error) {
                            console.error('Failed to upload images:', error);
                            message.error('Không thể tải lên hình ảnh');
                          } finally {
                            setSubmitting(false);
                          }
                        }
                      });
                    }}
                    loading={submitting}
                    icon={<UploadOutlined />}
                    disabled={!uploadFileList.some(file => file.originFileObj)}
                  >
                    Lưu hình ảnh mới
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
          {activeTab === 'fields' && (
            <Card title="Nhóm sân" extra={
              <Button 
                type="primary" 
                icon={<LinkOutlined />} 
                onClick={navigateToFieldManagement}
              >
                Quản lý nhóm sân
              </Button>
            } className="max-h-[calc(100vh-240px)] overflow-y-auto">
              {facility.fieldGroups && facility.fieldGroups.length > 0 ? (
                <div>
                  <div className="bg-yellow-50 p-4 mb-6 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <ExclamationCircleOutlined className="text-yellow-500 mr-2 mt-1" />
                      <div>
                        <Text strong className="text-yellow-700">Lưu ý quan trọng</Text>
                        <div className="mt-1">
                          <Text className="text-yellow-700">
                            Để quản lý chi tiết nhóm sân, bao gồm thêm/sửa/xóa các nhóm sân và sân đơn lẻ, 
                            vui lòng sử dụng trang Quản lý sân chuyên dụng bằng cách nhấn vào nút "Quản lý nhóm sân".
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {facility.fieldGroups.map(group => (
                    <Card 
                      key={group.id} 
                      title={
                        <div className="flex justify-between items-center">
                          <span>{group.name}</span>
                          <Tag color="blue">{group.fields.length} sân</Tag>
                        </div>
                      }
                      className="mb-6 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Text type="secondary">Kích thước:</Text>
                            <Text strong className="ml-2">{group.dimension}</Text>
                          </div>
                          {group.surface && (
                            <div>
                              <Text type="secondary">Mặt sân:</Text>
                              <Text strong className="ml-2">{group.surface}</Text>
                            </div>
                          )}
                          <div>
                            <Text type="secondary">Giá cơ bản:</Text>
                            <Text strong className="ml-2 text-blue-600">{group.basePrice?.toLocaleString()}đ/giờ</Text>
                          </div>
                          <div>
                            <Text type="secondary">Môn thể thao:</Text>
                            <span className="ml-2">
                              {group.sports?.map(sport => (
                                <Tag key={sport.id} color="green">{getSportNameInVietnamese(sport.name)}</Tag>
                              ))}
                            </span>
                          </div>
                        </div>
                        
                        {/* Giờ cao điểm */}
                        {((group.peakStartTime1 && group.peakEndTime1) || 
                          (group.peakStartTime2 && group.peakEndTime2) || 
                          (group.peakStartTime3 && group.peakEndTime3)) && (
                          <>
                            <Divider orientation="left">Giờ cao điểm</Divider>
                            <div className="mb-4">
                              <div className="grid grid-cols-1 gap-2">
                                {group.peakStartTime1 && group.peakEndTime1 && (
                                  <div className="p-3 bg-gray-50 rounded-md">
                                    <div className="flex justify-between items-center">
                                      <Text strong>Giờ cao điểm 1: {group.peakStartTime1} - {group.peakEndTime1}</Text>
                                      <Text className="text-green-600 font-semibold">+{group.priceIncrease1?.toLocaleString()}đ/giờ</Text>
                                    </div>
                                  </div>
                                )}
                                
                                {group.peakStartTime2 && group.peakEndTime2 && group.priceIncrease2 && (
                                  <div className="p-3 bg-gray-50 rounded-md">
                                    <div className="flex justify-between items-center">
                                      <Text strong>Giờ cao điểm 2: {group.peakStartTime2} - {group.peakEndTime2}</Text>
                                      <Text className="text-green-600 font-semibold">+{group.priceIncrease2?.toLocaleString()}đ/giờ</Text>
                                    </div>
                                  </div>
                                )}
                                
                                {group.peakStartTime3 && group.peakEndTime3 && group.priceIncrease3 && (
                                  <div className="p-3 bg-gray-50 rounded-md">
                                    <div className="flex justify-between items-center">
                                      <Text strong>Giờ cao điểm 3: {group.peakStartTime3} - {group.peakEndTime3}</Text>
                                      <Text className="text-green-600 font-semibold">+{group.priceIncrease3?.toLocaleString()}đ/giờ</Text>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                        
                        {/* Danh sách sân */}
                        <Divider orientation="left" style={{ margin: 0, marginRight: '16px', minWidth: '100px' }}>
                          Danh sách sân
                        </Divider>
                        
                        <List
                          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                          dataSource={group.fields}
                          renderItem={field => (
                            <List.Item>
                              <Card size="small" hoverable className="text-center mt-4">
                                <div className="text-center">
                                  <Text strong>{field.name}</Text>
                                  {field.status === 'closed' && (
                                    <div className="mt-1">
                                      <Tag color="default">Đang đóng cửa</Tag>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            </List.Item>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Empty 
                  description={
                    <div>
                      <p>Cơ sở này chưa có nhóm sân nào</p>
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={navigateToFieldManagement}
                        className="mt-4"
                      >
                        Thêm nhóm sân
                      </Button>
                    </div>
                  } 
                />
              )}
            </Card>
          )}
          
          {activeTab === 'services' && (
            <Card title="Dịch vụ" extra={
              <Button 
                type="primary" 
                icon={<LinkOutlined />} 
                onClick={navigateToServiceManagement}
              >
                Quản lý dịch vụ
              </Button>
            } className="max-h-[calc(100vh-240px)] overflow-y-auto">
              {facility.services && facility.services.length > 0 ? (
                <div>
                  <div className="bg-yellow-50 p-4 mb-6 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <ExclamationCircleOutlined className="text-yellow-500 mr-2 mt-1" />
                      <div>
                        <Text strong className="text-yellow-700">Lưu ý quan trọng</Text>
                        <div className="mt-1">
                          <Text className="text-yellow-700">
                            Để quản lý chi tiết dịch vụ, bao gồm thêm/sửa/xóa các dịch vụ, 
                            vui lòng sử dụng trang Quản lý dịch vụ chuyên dụng bằng cách nhấn vào nút "Quản lý dịch vụ".
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {facility.services.map(service => (
                      <Card 
                        key={service.id}
                        hoverable
                        className="h-full"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <Title level={5}>{service.name}</Title>                        
                          </div>
                          
                          <div className="text-gray-500 mb-4">{service.description}</div>
                          
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <Text type="secondary">{service.type === 'rental' ? 'Cho thuê' : 'Dịch vụ'}</Text>
                              {service.sport && (
                                <Tag color="blue" className="ml-2">{getSportNameInVietnamese(service.sport.name)}</Tag>
                              )}
                            </div>
                            <Text className="text-lg font-bold text-blue-600">{service.price.toLocaleString()}đ/{service.unit}</Text>
                          </div>
                          
                          <Divider style={{ margin: '12px 0' }} />
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <Text type="secondary">Số lượng còn lại:</Text>
                              <Text strong className="ml-1 text-green-600">{service.amount?.toLocaleString() || 0}</Text>
                            </div>
                            {service.bookedCount !== undefined && (
                              <div>
                                <Text type="secondary">Lượt đặt:</Text>
                                <Text strong className="ml-1">{service.bookedCount}</Text>
                              </div>
                            )}
                            {service.bookedCountOnDate !== undefined && (
                              <div>
                                <Text type="secondary">Đang sử dụng:</Text>
                                <Text strong className="ml-1">{service.bookedCountOnDate}</Text>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Empty 
                  description={
                    <div>
                      <p>Cơ sở này chưa có dịch vụ nào</p>
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={navigateToServiceManagement}
                        className="mt-4"
                      >
                        Thêm dịch vụ
                      </Button>
                    </div>
                  } 
                />
              )}
            </Card>
          )}
          
          {activeTab === 'events' && (
            <Card title="Sự kiện" extra={
              <Button 
                type="primary" 
                icon={<LinkOutlined />} 
                onClick={navigateToEventManagement}
              >
                Quản lý sự kiện
              </Button>
            } className="max-h-[calc(100vh-240px)] overflow-y-auto">
              {facility.events && facility.events.length > 0 ? (
                <div>
                  <div className="bg-yellow-50 p-4 mb-6 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <ExclamationCircleOutlined className="text-yellow-500 mr-2 mt-1" />
                      <div>
                        <Text strong className="text-yellow-700">Lưu ý quan trọng</Text>
                        <div className="mt-1">
                          <Text className="text-yellow-700">
                            Để quản lý chi tiết sự kiện, bao gồm thêm/sửa/xóa các sự kiện, 
                            vui lòng sử dụng trang Quản lý sự kiện chuyên dụng bằng cách nhấn vào nút "Quản lý sự kiện".
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {facility.events.map(event => (
                      <Card 
                        key={event.id}
                        hoverable
                        cover={event.image && <img alt={event.name} src={event.image} className="h-48 object-cover" />}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <Title level={5}>{event.name}</Title>
                            <Tag color={
                              event.status === 'active' ? 'success' : 
                              event.status === 'upcoming' ? 'processing' : 'default'
                            }>
                              {event.status === 'active' ? 'Đang diễn ra' : 
                               event.status === 'upcoming' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                            </Tag>
                          </div>
                          
                          <div className="text-gray-500 mb-3 line-clamp-2">
                            {event.description}
                          </div>
                          
                          <div className="flex items-center text-gray-500 mb-2">
                            <CalendarOutlined className="mr-2" />
                            <Text>
                              {new Date(event.startDate).toLocaleDateString('vi-VN')} - {new Date(event.endDate).toLocaleDateString('vi-VN')}
                            </Text>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Empty 
                  description={
                    <div>
                      <p>Cơ sở này chưa có sự kiện nào</p>
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={navigateToEventManagement}
                        className="mt-4"
                      >
                        Thêm sự kiện
                      </Button>
                    </div>
                  } 
                />
              )}
            </Card>
          )}
          
          {activeTab === 'vouchers' && (
            <Card title="Khuyến mãi" extra={
              <Button 
                type="primary" 
                icon={<LinkOutlined />} 
                onClick={navigateToVoucherManagement}
              >
                Quản lý khuyến mãi
              </Button>
            } className="max-h-[calc(100vh-240px)] overflow-y-auto">
              {facility.vouchers && facility.vouchers.length > 0 ? (
                <div>
                  <div className="bg-yellow-50 p-4 mb-6 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <ExclamationCircleOutlined className="text-yellow-500 mr-2 mt-1" />
                      <div>
                        <Text strong className="text-yellow-700">Lưu ý quan trọng</Text>
                        <div className="mt-1">
                          <Text className="text-yellow-700">
                            Để quản lý chi tiết khuyến mãi, bao gồm thêm/sửa/xóa các mã khuyến mãi, 
                            vui lòng sử dụng trang Quản lý khuyến mãi chuyên dụng bằng cách nhấn vào nút "Quản lý khuyến mãi".
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {facility.vouchers.map(voucher => {
                      // Xác định trạng thái khuyến mãi dựa trên ngày hiệu lực
                      const now = new Date();
                      const start = new Date(voucher.startDate);
                      const end = new Date(voucher.endDate);
                      const status = now < start ? 'upcoming' : (now > end ? 'expired' : 'active');
                      
                      return (
                        <Card 
                          key={voucher.id}
                          className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <Title level={5} className="text-blue-700">{voucher.name}</Title>
                                <div>
                                  <Tag 
                                    color={
                                      status === 'active' ? 'success' : 
                                      status === 'upcoming' ? 'processing' : 'error'
                                    }
                                  >
                                    {status === 'active' ? 'Đang diễn ra' : 
                                     status === 'upcoming' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                                  </Tag>
                                </div>
                              </div>
                              <div className="bg-white px-3 py-1 rounded-full border border-blue-200 text-blue-700 font-bold">
                                {voucher.code}
                              </div>
                            </div>
                            
                            <div className="bg-white p-3 rounded-lg mb-4">
                              <div className="text-center mb-2">
                                <Text className="text-2xl font-bold text-red-600">
                                  {voucher.voucherType === 'percent' ? `Giảm ${voucher.discount}%` : `Giảm ${voucher.discount.toLocaleString()}đ`}
                                </Text>
                              </div>
                              
                              <div className="text-center text-gray-500 text-sm">
                                {voucher.voucherType === 'percent' && voucher.maxDiscount > 0 && 
                                  <div>Tối đa {voucher.maxDiscount.toLocaleString()}đ</div>
                                }
                                {voucher.minPrice && <div>Đơn tối thiểu {voucher.minPrice.toLocaleString()}đ</div>}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-sm text-gray-500">
                                <Text strong>Thời gian hiệu lực:</Text>
                                <Text>
                                  {new Date(voucher.startDate).toLocaleDateString('vi-VN')} - {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                                </Text>
                              </div>
                              
                              {voucher.amount !== undefined && (
                                <>
                                  <div className="flex justify-between items-center text-sm">
                                    <Text type="secondary">Tổng số lượng:</Text>
                                    <Text>{voucher.amount}</Text>
                                  </div>
                                  
                                  {voucher.remain !== undefined && (
                                    <div className="flex justify-between items-center text-sm">
                                      <Text type="secondary">Còn lại:</Text>
                                      <Text strong className="text-green-600">{voucher.remain}/{voucher.amount}</Text>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <Empty 
                  description={
                    <div>
                      <p>Cơ sở này chưa có mã khuyến mãi nào</p>
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={navigateToVoucherManagement}
                        className="mt-4"
                      >
                        Thêm mã khuyến mãi
                      </Button>
                    </div>
                  } 
                />
              )}
            </Card>
          )}
          
          {activeTab === 'documents' && (
            <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
              <Card title="Giấy chứng nhận cơ sở" className="mb-6">
                <div className="mb-4">
                  <Title level={5}>Giấy chứng nhận hiện tại</Title>
                  {facility?.certificate?.verified ? (
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <FileOutlined className="mr-2" />
                          <Text>Giấy chứng nhận</Text>
                        </div>
                        <a href={facility.certificate.verified} target="_blank" rel="noopener noreferrer">
                          <Button type="link">Xem</Button>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <Empty description="Không có giấy chứng nhận" />
                  )}
                </div>
                
                <Divider />
                
                <div className="mb-4">
                  <Title level={5}>Cập nhật giấy chứng nhận</Title>
                  <Text type="secondary" className="block mb-4">
                    Việc cập nhật giấy chứng nhận mới sẽ yêu cầu phê duyệt từ quản trị viên. Giấy chứng nhận hiện tại vẫn được sử dụng cho đến khi giấy mới được duyệt.
                  </Text>
                  
                  <Upload
                    beforeUpload={handleCertificateUpload}
                    accept="image/*,.pdf"
                    maxCount={1}
                    fileList={certificateFile ? [{ uid: '1', name: certificateFile.name, status: 'done' }] as UploadFile[] : []}
                    onRemove={() => setCertificateFile(null)}
                    disabled={facility?.status !== 'active'}
                  >
                    <Button 
                      icon={<UploadOutlined />}
                      disabled={facility?.status !== 'active'}
                    >
                      Chọn file giấy chứng nhận
                    </Button>
                  </Upload>
                  
                  <Button 
                    type="primary" 
                    className="mt-4"
                    onClick={handleCertificateSubmit}
                    loading={submitting}
                    disabled={!certificateFile || facility?.status !== 'active'}
                  >
                    Gửi yêu cầu cập nhật
                  </Button>
                  
                  {facility?.status !== 'active' && (
                    <div className="mt-2">
                      <Text type="danger">
                        <ExclamationCircleOutlined className="mr-1" />
                        Cơ sở phải ở trạng thái hoạt động mới có thể cập nhật giấy tờ.
                      </Text>
                    </div>
                  )}

                  {facility.status === 'active' && hasPendingCertificateApproval(facility) && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Text type="warning">
                        <ExclamationCircleOutlined className="mr-1" />
                        Đang có một yêu cầu cập nhật giấy chứng nhận đang chờ phê duyệt.
                      </Text>
                    </div>
                  )}
                </div>
              </Card>
              
              <Card title="Giấy phép kinh doanh theo môn thể thao">
                <div className="mb-4">
                  <Title level={5}>Giấy phép hiện tại</Title>
                  {facility?.licenses && facility.licenses.length > 0 ? (
                    <Table 
                      dataSource={facility.licenses}
                      rowKey={(record) => `${record.facilityId}-${record.sportId}`}
                      pagination={false}
                      columns={[
                        {
                          title: 'Môn thể thao',
                          dataIndex: 'sportId',
                          key: 'sportId',
                          render: (sportId) => {
                            // Tìm sport trong danh sách allSports
                            const sport = allSports.find(s => s.id === sportId);
                            if (sport) {
                              return getSportNameInVietnamese(sport.name);
                            }
                            return "Không xác định";
                          }
                        },
                        {
                          title: 'Trạng thái',
                          key: 'status',
                          render: (_, record) => (
                            <>
                              <Tag color={record.verified ? 'success' : (hasPendingLicenseApproval(facility, record.sportId as number) ? 'warning' : 'default')}>
                                {record.verified ? 'Đã cập nhật' : (hasPendingLicenseApproval(facility, record.sportId as number) ? 'Đang chờ cập nhật' : 'Chưa có giấy phép')}
                              </Tag>
                            </>
                          )
                        },
                        {
                          title: 'Hành động',
                          key: 'action',
                          render: (_, record) => (
                            <Space>
                              {record.verified && (
                                <Button type="link" href={record.verified} target="_blank">
                                  Xem giấy phép
                                </Button>
                              )}
                            </Space>
                          )
                        }
                      ]}
                    />
                  ) : (
                    <Empty description="Chưa có giấy phép kinh doanh" />
                  )}
                </div>
                
                <Divider />
                
                <div>
                  <Title level={5}>Cập nhật giấy phép</Title>
                  <Text type="secondary" className="block mb-4">
                    Việc cập nhật giấy phép mới sẽ yêu cầu phê duyệt từ quản trị viên. Giấy phép hiện tại vẫn được sử dụng cho đến khi giấy mới được duyệt.
                  </Text>
                  
                  {facility?.status !== 'active' && (
                    <div className="mb-4">
                      <Text type="danger">
                        <ExclamationCircleOutlined className="mr-1" />
                        Cơ sở phải ở trạng thái hoạt động mới có thể cập nhật giấy tờ.
                      </Text>
                    </div>
                  )}
                  
                  {form.getFieldValue('sportIds')?.length > 0 ? (
                    <div>
                      {form.getFieldValue('sportIds').map((sportId: number) => {
                        const sport = allSports.find(s => s.id === sportId);
                        if (!sport) return null;
                        
                        // Tìm giấy phép hiện tại cho môn thể thao này
                        const existingLicense = facility?.licenses?.find(license => license.sportId === sportId);
                        
                        return (
                          <Card key={sportId} size="small" className="mb-3">
                            <div className="flex justify-between items-center flex-wrap">
                              <div className="mb-2 md:mb-0">
                              <Text strong>{getSportNameInVietnamese(sport.name)}</Text>
                              
                                {existingLicense && existingLicense.verified && (
                                <Tag color="success" className="ml-2">Đã có giấy phép</Tag>
                              )}
                                
                                {hasPendingLicenseApproval(facility, sportId) && (
                                  <Tag color="warning" className="ml-2">Đang chờ cập nhật</Tag>
                                )}
                            </div>
                            
                            <div className="flex items-center">
                              <Upload
                                  beforeUpload={(file) => handleLicenseUpload(file, sportId)}
                                accept="image/*,.pdf"
                                maxCount={1}
                                  fileList={licenseFiles[sportId] ? [{ uid: '1', name: licenseFiles[sportId].name, status: 'done' }] as UploadFile[] : []}
                                onRemove={() => {
                                  setLicenseFiles(prev => {
                                    const newFiles = {...prev};
                                      delete newFiles[sportId];
                                    return newFiles;
                                  });
                                }}
                                className="mr-3"
                                  disabled={facility?.status !== 'active' || hasPendingLicenseApproval(facility, sportId)}
                                >
                                  <Button 
                                    icon={<UploadOutlined />}
                                    disabled={facility?.status !== 'active' || hasPendingLicenseApproval(facility, sportId)}
                                  >
                                    Chọn file
                                  </Button>
                              </Upload>
                              
                              <Button 
                                type="primary"
                                  onClick={() => handleLicenseSubmit(sportId)}
                                loading={submitting}
                                  disabled={!licenseFiles[sportId] || facility?.status !== 'active' || hasPendingLicenseApproval(facility, sportId)}
                              >
                                Gửi yêu cầu
                              </Button>
                            </div>
                          </div>
                            
                            {hasPendingLicenseApproval(facility, sportId) && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <Text type="warning" className="text-xs">
                        <ExclamationCircleOutlined className="mr-1" />
                                  Đang có một yêu cầu cập nhật giấy phép đang chờ phê duyệt cho môn này.
                      </Text>
                    </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Empty description="Không có môn thể thao nào được đăng ký. Hãy thêm môn thể thao vào cơ sở trước." />
                  )}
                </div>
              </Card>
            </div>
          )}
          
          {activeTab === 'status' && (
            <Card title="Trạng thái cơ sở" className="max-h-[calc(100vh-240px)] overflow-y-auto">
              <div className="mb-4">
                <Title level={5}>Thay đổi trạng thái</Title>
                
                {facility.status === 'pending' ? (
                  <div>
                    <div className="bg-yellow-50 p-4 mb-4 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <ExclamationCircleOutlined className="text-yellow-500 mr-2 mt-1" />
                        <div>
                          <Text strong className="text-yellow-700">Cơ sở đang chờ phê duyệt</Text>
                          <div className="mt-1">
                            <Text className="text-yellow-700">
                              Cơ sở của bạn đang trong quá trình được xét duyệt. Bạn không thể thay đổi trạng thái trong giai đoạn này.
                              Vui lòng chờ quản trị viên phê duyệt cơ sở của bạn.
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <Text strong>Trạng thái hiện tại: </Text>
                      <Tag color="warning" className="ml-2">Đang chờ phê duyệt</Tag>
                    </div>
                  </div>
                ) : (
                  <>
                    <Form.Item 
                      name="status" 
                      initialValue={facility.status}
                    >
                      <Select disabled={!['active', 'unactive'].includes(facility.status)}>
                        <Option value="active">Đang hoạt động</Option>
                        <Option value="unactive">Đang đóng cửa</Option>
                      </Select>
                    </Form.Item>
                    
                    <div className="text-gray-500 text-sm mb-4">
                      <p>- <strong>Đang hoạt động</strong>: Cơ sở mở cửa và có thể nhận đặt sân</p>
                      <p>- <strong>Đang đóng cửa</strong>: Cơ sở tạm thời đóng cửa, không nhận đặt sân</p>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        type="primary"
                        onClick={async () => {
                          try {
                            const status = form.getFieldValue('status');
                            
                            setSubmitting(true);
                            
                            // Cập nhật trạng thái cơ sở
                            await facilityService.updateFacility(facilityId, { status });
                            message.success('Đã cập nhật trạng thái cơ sở');
                            
                            // Refresh data
                            const data = await facilityService.getFacilityById(facilityId);
                            setFacility(data);
                          } catch (error) {
                            console.error('Failed to update facility status:', error);
                            message.error('Không thể cập nhật trạng thái cơ sở');
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                        loading={submitting}
                        icon={<SaveOutlined />}
                        disabled={!['active', 'unactive'].includes(facility.status)}
                      >
                        Lưu trạng thái
                      </Button>
                    </div>
                  </>
                )}
                
                {(facility.status === 'unactive' || facility.status === 'closed') && (
                  <div className="mt-4 bg-red-50 p-4 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <ExclamationCircleOutlined className="text-red-500 mr-2 mt-1" />
                      <div>
                        <Text strong className="text-red-700">
                          {facility.status === 'unactive' ? 'Cơ sở đã bị từ chối' : 'Cơ sở đã bị cấm'}
                        </Text>
                        <div className="mt-1">
                          <Text className="text-red-700">
                            {facility.status === 'unactive' 
                              ? 'Cơ sở của bạn đã bị từ chối. Vui lòng liên hệ với quản trị viên để biết thêm chi tiết.'
                              : 'Cơ sở của bạn đã bị cấm. Không thể thay đổi trạng thái. Vui lòng liên hệ với quản trị viên để biết thêm chi tiết.'}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </Form>
       
      </div>
        
        {/* Add floating back button at bottom right
        <div className="fixed bottom-6 right-6">
          <Button 
            type="default" 
            shape="round"
            icon={<ArrowLeftOutlined />} 
            onClick={handleCancel}
            size="large"
            className="shadow-md"
          >
            Quay lại
          </Button>
      </div> */}
    </div>
  );
};

export default FacilityEdit; 