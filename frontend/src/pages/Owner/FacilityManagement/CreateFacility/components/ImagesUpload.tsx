import React, { useState, useRef, useEffect } from 'react';
import { 
  Button, 
  Card, 
  message, 
  Image, 
  Radio,
  Typography,
  Alert,
  Divider,
  Tooltip
} from 'antd';
import { 
  UploadOutlined, 
  DeleteOutlined,
  PictureOutlined
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
  useEffect(() => {
    if (formData.imageFiles.length > 0) {
      const urls = formData.imageFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    } else {
      setPreviewUrls([]);
    }
  }, [formData.imageFiles]);

  // Cleanup preview URLs khi component unmount
  useEffect(() => {
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
      // Tạo mảng ảnh mới từ những ảnh hiện có và ảnh mới tải lên
      const updatedFiles = [...formData.imageFiles, ...validFiles];
      
      // Cập nhật previewUrls
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      
      // Cập nhật formData
      updateFormData({
        imageFiles: updatedFiles
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
    
    // Nếu xóa ảnh bìa hoặc xóa ảnh trước ảnh bìa, cập nhật lại coverImageIndex
    if (index === coverImageIndex && newFiles.length > 0) {
      setCoverImageIndex(0);
    } else if (index < coverImageIndex && coverImageIndex > 0) {
      setCoverImageIndex(coverImageIndex - 1);
    }
    
    // Cập nhật formData với ảnh mới
    updateFormData({ 
      imageFiles: newFiles
    });
  };

  const handleCoverImageChange = (index: number) => {
    if (index === coverImageIndex) return; // Không cần thay đổi nếu đã là ảnh bìa
    
    // Cập nhật state hiển thị
    setCoverImageIndex(index);
    
    // Lấy bản sao của mảng ảnh hiện tại
    const updatedFiles = [...formData.imageFiles];
    const updatedPreviewUrls = [...previewUrls];
    
    // Lấy ảnh được chọn làm ảnh bìa
    const coverImage = updatedFiles[index];
    const coverPreviewUrl = updatedPreviewUrls[index];
    
    // Xóa ảnh đó khỏi vị trí hiện tại
    updatedFiles.splice(index, 1);
    updatedPreviewUrls.splice(index, 1);
    
    // Thêm ảnh vào đầu mảng
    updatedFiles.unshift(coverImage);
    updatedPreviewUrls.unshift(coverPreviewUrl);
    
    // Cập nhật state
    setCoverImageIndex(0); // Sau khi sắp xếp lại, ảnh bìa luôn ở vị trí đầu tiên
    setPreviewUrls(updatedPreviewUrls);
    
    // Cập nhật formData
    updateFormData({
      imageFiles: updatedFiles
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Title level={4}>Hình ảnh cơ sở</Title>
      <Text type="secondary" className="mb-4 block">
        Tải lên hình ảnh của cơ sở (tối đa 10 ảnh, mỗi ảnh không quá 5MB)
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
          disabled={formData.imageFiles.length >= 10}
          size="large"
          className="mb-4"
        >
          Tải lên ảnh
        </Button>
        
        <Text type="secondary" className="ml-4">
          Đã tải lên: {formData.imageFiles.length}/10 ảnh
        </Text>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {previewUrls.map((url, index) => (
          <Card
            key={index}
            hoverable
            className="overflow-hidden transition-all duration-300 hover:shadow-lg"
            style={{ padding: '4px' }}
          >
            {/* Phần ảnh với kích thước cố định */}
            <div className="w-full h-32 overflow-hidden ">
              <Image
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded"
                preview={{ mask: <div className="flex items-center justify-center"><PictureOutlined className="text-xl mr-1" /> Xem ảnh</div> }}
                style={{ height: '90%', width: '100%' }}
              />
            </div>
            
            <Divider style={{ margin: '8px 0' }} />
            
            {/* Phần điều khiển bên dưới ảnh */}
            <div className="flex justify-between items-center px-1">
              <Radio
                checked={coverImageIndex === index}
                onChange={() => handleCoverImageChange(index)}
              >
                Ảnh bìa
              </Radio>
              
              <Tooltip title="Xóa ảnh">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveImage(index)}
                />
              </Tooltip>
            </div>
            
            {/* Hiển thị chỉ số của ảnh */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
              {index + 1}/{previewUrls.length}
            </div>
            
            {/* Đánh dấu ảnh bìa */}
            {coverImageIndex === index && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                Ảnh bìa
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ImagesUpload; 