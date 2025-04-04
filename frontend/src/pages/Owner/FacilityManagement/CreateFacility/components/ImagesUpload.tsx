import React, { useState, useRef } from 'react';
import { 
  Button, 
  Card, 
  message, 
  Image, 
  Radio,
  Typography,
  Alert
} from 'antd';
import { 
  UploadOutlined, 
  DeleteOutlined
} from '@ant-design/icons';
import { FacilityFormData } from '@/types/facility.type';

const { Title, Text } = Typography;

interface ImagesUploadProps {
  formData: FacilityFormData;
  updateFormData: (data: Partial<FacilityFormData>) => void;
}

const ImagesUpload: React.FC<ImagesUploadProps> = ({ 
  formData, 
  updateFormData 
}) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Khởi tạo preview URLs từ formData
  React.useEffect(() => {
    if (formData.imageFiles.length > 0) {
      const urls = formData.imageFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  }, [formData.imageFiles]);

  // Cleanup preview URLs khi component unmount
  React.useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        message.error(`File ${file.name} vượt quá 5MB`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        message.error(`File ${file.name} không phải là hình ảnh`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      updateFormData({
        imageFiles: [...formData.imageFiles, ...validFiles]
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = [...formData.imageFiles];
    const newPreviewUrls = [...previewUrls];
    
    // Revoke URL của ảnh bị xóa
    URL.revokeObjectURL(newPreviewUrls[index]);
    
    // Xóa file và preview URL
    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    // Cập nhật state
    setPreviewUrls(newPreviewUrls);
    updateFormData({ imageFiles: newFiles });
    
    // Nếu xóa ảnh bìa, chọn ảnh đầu tiên làm ảnh bìa
    if (index === coverImageIndex && newFiles.length > 0) {
      setCoverImageIndex(0);
    }
  };

  const handleCoverImageChange = (index: number) => {
    setCoverImageIndex(index);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Title level={4}>Hình ảnh cơ sở</Title>
      <Text type="secondary" className="mb-6 block">
        Tải lên hình ảnh của cơ sở (tối đa 5 ảnh, mỗi ảnh không quá 5MB)
      </Text>

      <div className="mb-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          style={{ display: 'none' }}
        />
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => fileInputRef.current?.click()}
          disabled={formData.imageFiles.length >= 5}
        >
          Tải lên ảnh
        </Button>
      </div>

      {formData.imageFiles.length === 0 && (
        <Alert
          message="Chưa có ảnh nào được tải lên"
          description="Vui lòng tải lên ít nhất một ảnh để tiếp tục"
          type="warning"
          showIcon
          className="mb-6"
        />
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {previewUrls.map((url, index) => (
          <Card
            key={index}
            hoverable
            className="relative"
            cover={
              <div className="relative aspect-square">
                <Image
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveImage(index)}
                  />
                </div>
                <div className="absolute bottom-2 left-2">
                  <Radio
                    checked={coverImageIndex === index}
                    onChange={() => handleCoverImageChange(index)}
                  >
                    Ảnh bìa
                  </Radio>
                </div>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
};

export default ImagesUpload; 