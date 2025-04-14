import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Upload, 
  Table, 
  Divider, 
  Alert,
  Button,
  Modal
} from 'antd';
import { 
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { FacilityFormData } from '@/types/facility.type';
import { getSportNameInVietnamese } from '@/utils/translateSport';
import { Sport } from '@/types/sport.type';
import { message } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

interface VerificationDocumentsProps {
  formData: FacilityFormData;
  updateFormData: (data: Partial<FacilityFormData>) => void;
  allSports: Sport[];
}

const VerificationDocuments: React.FC<VerificationDocumentsProps> = ({ 
  formData, 
  updateFormData,
  allSports
}) => {
  const [certificateFileName, setCertificateFileName] = useState<string>('');
  const [licenseFileNames, setLicenseFileNames] = useState<Record<number, string>>({});
  const [certificatePreview, setCertificatePreview] = useState<string | null>(null);
  const [licensePreviewUrls, setLicensePreviewUrls] = useState<Record<number, string>>({});
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  
  // Lấy danh sách tất cả các môn thể thao, bao gồm cả trong nhóm "Tổng hợp"
  const getAllSports = () => {
    // Lấy các môn thể thao được chọn trực tiếp
    const directSelectedSports = formData.selectedSports || [];
    
    // Lấy tất cả các sportIds từ các nhóm sân tổng hợp (nhóm có nhiều môn thể thao)
    const compositeFieldGroups = formData.fieldGroups.filter(group => group.sportIds.length > 1);
    
    // Tạo Set để lưu tất cả sportId duy nhất từ nhóm tổng hợp
    const compositeSportIdsSet = new Set<number>();
    compositeFieldGroups.forEach(group => {
      group.sportIds.forEach(id => compositeSportIdsSet.add(id));
    });
    
    // Lọc những môn thể thao có trong nhóm tổng hợp nhưng không nằm trong directSelectedSports
    const additionalSportIds = Array.from(compositeSportIdsSet)
      .filter(id => !directSelectedSports.some(sport => sport.id === id));
    
    // Chuyển đổi IDs thành objects Sport đầy đủ
    const additionalSports: Sport[] = additionalSportIds.map(id => {
      const sport = allSports.find(s => s.id === id);
      return sport || { id, name: `Sport ${id}` };
    });
    
    // Gộp lại tất cả các môn thể thao
    return [...directSelectedSports, ...additionalSports];
  };
  
  // Lấy danh sách tất cả các môn thể thao phải upload giấy phép
  const selectedSports = getAllSports();
  
  useEffect(() => {
    // Initialize the license file names state based on existing license files
    const initialLicenseNames: Record<number, string> = {};
    formData.licenseFiles.forEach(license => {
      initialLicenseNames[license.sportId] = license.file.name;
      
      // Tạo URL xem trước cho file hình ảnh đã upload
      if (license.file) {
        createImagePreview(license.file, license.sportId);
      }
    });
    setLicenseFileNames(initialLicenseNames);
    
    // Set certificate file name if exists
    if (formData.certificateFile) {
      setCertificateFileName(formData.certificateFile.name);
      createCertificatePreview(formData.certificateFile);
    }
    
    // Dọn dẹp URL khi component unmount
    return () => {
      Object.values(licensePreviewUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
      if (certificatePreview) {
        URL.revokeObjectURL(certificatePreview);
      }
    };
  }, [formData]);
  
  // Tạo URL xem trước cho certificate
  const createCertificatePreview = (file: File) => {
    if (certificatePreview) {
      URL.revokeObjectURL(certificatePreview);
    }
    const url = URL.createObjectURL(file);
    setCertificatePreview(url);
  };
  
  // Tạo URL xem trước cho license
  const createImagePreview = (file: File, sportId: number) => {
    if (licensePreviewUrls[sportId]) {
      URL.revokeObjectURL(licensePreviewUrls[sportId]);
    }
    const url = URL.createObjectURL(file);
    setLicensePreviewUrls(prev => ({
      ...prev,
      [sportId]: url
    }));
  };
  
  // Handle certificate file upload
  const handleCertificateUpload = (file: File) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng tải lên file hình ảnh');
      return false;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước file không được vượt quá 10MB');
      return false;
    }

    setCertificateFileName(file.name);
    createCertificatePreview(file);
    updateFormData({
      certificateFile: file
    });
    
    return false;
  };
  
  // Handle license file upload
  const handleLicenseUpload = (file: File, sportId: number) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng tải lên file hình ảnh');
      return false;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước file không được vượt quá 10MB');
      return false;
    }
    
    setLicenseFileNames(prev => ({
      ...prev,
      [sportId]: file.name
    }));
    
    createImagePreview(file, sportId);
    
    // Update the license files array in formData
    const updatedLicenseFiles = [...formData.licenseFiles.filter(l => l.sportId !== sportId)];
    updatedLicenseFiles.push({
      sportId,
      file
    });
    
    updateFormData({
      licenseFiles: updatedLicenseFiles
    });
    
    return false;
  };
  
  // Xóa certificate đã upload
  const removeCertificate = () => {
    if (certificatePreview) {
      URL.revokeObjectURL(certificatePreview);
    }
    setCertificateFileName('');
    setCertificatePreview(null);
    updateFormData({
      certificateFile: null
    });
  };
  
  // Xóa license đã upload
  const removeLicense = (sportId: number) => {
    if (licensePreviewUrls[sportId]) {
      URL.revokeObjectURL(licensePreviewUrls[sportId]);
    }
    
    setLicenseFileNames(prev => {
      const newNames = { ...prev };
      delete newNames[sportId];
      return newNames;
    });
    
    setLicensePreviewUrls(prev => {
      const newUrls = { ...prev };
      delete newUrls[sportId];
      return newUrls;
    });
    
    updateFormData({
      licenseFiles: formData.licenseFiles.filter(l => l.sportId !== sportId)
    });
  };
  
  // Hiển thị hình ảnh phóng to
  const handlePreview = (imageUrl: string, title: string) => {
    setPreviewImage(imageUrl);
    setPreviewTitle(title);
    setPreviewVisible(true);
  };
  
  return (
    <div className="verification-documents-step bg-white rounded-lg shadow p-6">
      <Title level={4}>Xác thực cơ sở</Title>
      <Text type="secondary" className="mb-6 block">
        Vui lòng tải lên các giấy tờ xác thực theo yêu cầu
      </Text>
      
      <Divider />
      
      <div className="mb-6">
        <Alert
          message="Thông tin xác thực cơ sở"
          description={
            <div>
              <Paragraph>
                Để cơ sở của bạn được phê duyệt và hoạt động trên hệ thống, bạn cần cung cấp các giấy tờ sau:
              </Paragraph>
              <ul className="list-disc pl-4 pb-2">
                <li><strong>Giấy chứng nhận cơ sở (bắt buộc):</strong> Chụp ảnh giấy chứng nhận hộ kinh doanh cá thể hoặc giấy chứng nhận đăng ký doanh nghiệp.</li>
                <li><strong>Giấy phép kinh doanh thể thao (không bắt buộc):</strong> Chụp ảnh giấy phép kinh doanh cho các môn thể thao mà cơ sở của bạn cung cấp.</li>
              </ul>
              <Paragraph className="text-red-500" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                Lưu ý:
              </Paragraph>
              <ul className="list-disc pl-4">
                <li>Chỉ chấp nhận file hình ảnh (jpg, jpeg, png).</li>
                <li>Kích thước file không được vượt quá 10MB.</li>
                <li>Các giấy tờ sẽ được xác thực bởi quản trị viên trong vòng 24 giờ làm việc.</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
          className="mb-6"
        />
      </div>
      
      {/* Giấy chứng nhận cơ sở (Certificate) - Required */}
      <div className="mb-8">
        <Title level={5}>Giấy chứng nhận cơ sở <span className="text-red-500">*</span></Title>
        <Text type="secondary" className="block mb-4">
          Vui lòng chụp ảnh và tải lên giấy chứng nhận đăng ký hộ kinh doanh cá thể hoặc giấy chứng nhận đăng ký doanh nghiệp
        </Text>
        
        {certificatePreview ? (
          <div className="border rounded-lg p-4 bg-gray-50 relative">
            <div className="flex items-center mb-3">
              <CheckCircleOutlined className="text-green-500 mr-2" />
              <span className="font-medium">Đã tải lên: {certificateFileName}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div 
                className="w-40 h-40 border rounded-md overflow-hidden cursor-pointer relative"
                onClick={() => handlePreview(certificatePreview, certificateFileName)}
              >
                <img 
                  src={certificatePreview} 
                  alt="Giấy chứng nhận" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center transition-all">
                  <EyeOutlined className="text-white text-2xl opacity-0 hover:opacity-100" />
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button 
                  icon={<EyeOutlined />} 
                  onClick={() => handlePreview(certificatePreview, certificateFileName)}
                >
                  Xem chi tiết
                </Button>
                <Button 
                  icon={<DeleteOutlined />} 
                  danger
                  onClick={removeCertificate}
                >
                  Xóa
                </Button>
                <Button 
                  icon={<UploadOutlined />} 
                  type="primary"
                  onClick={() => {
                    // Trigger file input
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = 'image/*';
                    fileInput.onchange = (e: Event) => {
                      const target = e.target as HTMLInputElement;
                      if (target.files && target.files.length > 0) {
                        handleCertificateUpload(target.files[0]);
                      }
                    };
                    fileInput.click();
                  }}
                >
                  Tải lên lại
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Dragger
            accept="image/*"
            showUploadList={false}
            beforeUpload={handleCertificateUpload}
            maxCount={1}
            className="bg-gray-50 hover:bg-gray-100 transition-colors border-dashed"
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined className="text-3xl text-blue-500" />
            </p>
            <p className="ant-upload-text font-medium">
              Nhấp hoặc kéo thả file vào đây để tải lên
            </p>
            <p className="ant-upload-hint text-gray-500">
              Chỉ chấp nhận file hình ảnh (jpg, jpeg, png), kích thước tối đa 5MB
            </p>
          </Dragger>
        )}
      </div>
      
      {/* Giấy phép kinh doanh thể thao (Licenses) - Optional */}
      {selectedSports.length > 0 && (
        <div>
          <Title level={5}>Giấy phép kinh doanh thể thao</Title>
          <Text type="secondary" className="block mb-4">
            Vui lòng chụp ảnh và tải lên giấy phép kinh doanh cho từng môn thể thao
          </Text>
          
          <Table
            dataSource={selectedSports}
            columns={[
              {
                title: 'Môn thể thao',
                dataIndex: 'name',
                key: 'name',
                render: (text: string) => (
                  <span className="font-medium">{getSportNameInVietnamese(text)}</span>
                )
              },
              {
                title: 'Giấy phép',
                key: 'license',
                render: (_, record: Sport) => {
                  const hasUploadedFile = licensePreviewUrls[record.id];
                  
                  return hasUploadedFile ? (
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-24 h-24 border rounded-md overflow-hidden cursor-pointer relative"
                        onClick={() => handlePreview(licensePreviewUrls[record.id], licenseFileNames[record.id])}
                      >
                        <img 
                          src={licensePreviewUrls[record.id]} 
                          alt={`Giấy phép ${getSportNameInVietnamese(record.name)}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center transition-all">
                          <EyeOutlined className="text-white opacity-0 hover:opacity-100" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center mb-1">
                          <CheckCircleOutlined className="text-green-500 mr-2" />
                          <span className="text-sm">{licenseFileNames[record.id]}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="small" 
                            icon={<EyeOutlined />} 
                            onClick={() => handlePreview(licensePreviewUrls[record.id], licenseFileNames[record.id])}
                          >
                            Xem
                          </Button>
                          <Button 
                            size="small" 
                            danger
                            icon={<DeleteOutlined />} 
                            onClick={() => removeLicense(record.id)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Dragger
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={(file) => handleLicenseUpload(file, record.id)}
                      maxCount={1}
                      className="bg-gray-50 hover:bg-gray-100 transition-colors border-dashed"
                    >
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined className="text-xl text-blue-500" />
                      </p>
                      <p className="ant-upload-text text-sm">
                        Nhấp hoặc kéo thả file vào đây
                      </p>
                      <p className="ant-upload-hint text-xs text-gray-500">
                        Chỉ chấp nhận file hình ảnh, tối đa 5MB
                      </p>
                    </Dragger>
                  );
                }
              }
            ]}
            pagination={false}
            rowKey={(record) => `sport-${record.id}`}
          />
        </div>
      )}
      
      {/* Modal xem trước hình ảnh */}
      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default VerificationDocuments; 