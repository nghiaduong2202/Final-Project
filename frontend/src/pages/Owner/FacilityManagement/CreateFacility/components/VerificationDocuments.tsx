import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Upload, 
  Table, 
  Divider, 
  Alert, 
} from 'antd';
import { 
  UploadOutlined,
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
}

const VerificationDocuments: React.FC<VerificationDocumentsProps> = ({ 
  formData, 
  updateFormData
}) => {
  const [certificateFileName, setCertificateFileName] = useState<string>('');
  const [licenseFileNames, setLicenseFileNames] = useState<Record<number, string>>({});
  
  // Get the list of selected sports from formData
  const selectedSports = formData.selectedSports || [];
  
  useEffect(() => {
    // Initialize the license file names state based on existing license files
    const initialLicenseNames: Record<number, string> = {};
    formData.licenseFiles.forEach(license => {
      initialLicenseNames[license.sportId] = license.file.name;
    });
    setLicenseFileNames(initialLicenseNames);
    
    // Set certificate file name if exists
    if (formData.certificateFile) {
      setCertificateFileName(formData.certificateFile.name);
    }
  }, [formData]);
  
  // Handle certificate file upload
  const handleCertificateUpload = (file: File) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng tải lên file hình ảnh');
      return false;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước file không được vượt quá 5MB');
      return false;
    }

    setCertificateFileName(file.name);
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
      message.error('Kích thước file không được vượt quá 5MB');
      return false;
    }
    
    setLicenseFileNames(prev => ({
      ...prev,
      [sportId]: file.name
    }));
    
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
              <ul className="list-disc pl-4">
                <li><strong>Giấy chứng nhận cơ sở (bắt buộc):</strong> Chụp ảnh giấy phép kinh doanh hoặc giấy chứng nhận đăng ký doanh nghiệp</li>
                <li><strong>Giấy phép kinh doanh thể thao (không bắt buộc):</strong> Chụp ảnh giấy phép kinh doanh cho từng môn thể thao mà cơ sở của bạn cung cấp</li>
              </ul>
              <Paragraph>
                Lưu ý:
              </Paragraph>
              <ul className="list-disc pl-4">
                <li>Chỉ chấp nhận file hình ảnh (jpg, jpeg, png)</li>
                <li>Kích thước file không được vượt quá 5MB</li>
                <li>Các giấy tờ sẽ được xác thực bởi quản trị viên trong vòng 24-48 giờ làm việc</li>
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
        <Title level={5}>Giấy chứng nhận cơ sở</Title>
        <Text type="secondary" className="block mb-4">
          Vui lòng chụp ảnh và tải lên giấy phép kinh doanh hoặc giấy chứng nhận đăng ký doanh nghiệp
        </Text>
        
        <Dragger
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleCertificateUpload}
          maxCount={1}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            {certificateFileName || 'Nhấp hoặc kéo thả file vào đây để tải lên'}
          </p>
          <p className="ant-upload-hint">
            Chỉ chấp nhận file hình ảnh (jpg, jpeg, png), kích thước tối đa 5MB
          </p>
        </Dragger>
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
                render: (text: string) => getSportNameInVietnamese(text)
              },
              {
                title: 'Giấy phép',
                key: 'license',
                render: (_, record: Sport) => (
                  <Dragger
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={(file) => handleLicenseUpload(file, record.id)}
                    maxCount={1}
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined />
                    </p>
                    <p className="ant-upload-text">
                      {licenseFileNames[record.id] || 'Nhấp hoặc kéo thả file vào đây để tải lên'}
                    </p>
                    <p className="ant-upload-hint">
                      Chỉ chấp nhận file hình ảnh (jpg, jpeg, png), kích thước tối đa 5MB
                    </p>
                  </Dragger>
                )
              }
            ]}
            pagination={false}
          />
        </div>
      )}
    </div>
  );
};

export default VerificationDocuments; 