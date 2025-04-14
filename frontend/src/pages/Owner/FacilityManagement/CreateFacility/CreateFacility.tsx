import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Typography, 
  Steps, 
  Card, 
  message,
  Form
} from 'antd';
import { 
  ArrowLeftOutlined, 
  PictureOutlined, 
  AppstoreOutlined, 
  SafetyCertificateOutlined, 
  InfoCircleOutlined,
} from '@ant-design/icons';
import { FacilityFormData } from '@/types/facility.type';
import { Sport } from '@/types/sport.type';
import { facilityService } from '@/services/facility.service';
import { sportService } from '@/services/sport.service';
import BasicInfoForm, { BasicInfoFormRef } from './components/BasicInfoForm';
import ImagesUpload from './components/ImagesUpload';
import FieldGroupsForm from './components/FieldGroupsForm';
import VerificationDocuments from './components/VerificationDocuments';

const { Title } = Typography;
const { Step } = Steps;

interface StepComponentProps {
  onNext: () => void;
  onPrev: () => void;
  formData: FacilityFormData;
  updateFormData: (data: Partial<FacilityFormData>) => void;
  allSports: Sport[];
}

const CreateFacility: React.FC = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [allSports, setAllSports] = useState<Sport[]>([]);
  const basicInfoFormRef = useRef<BasicInfoFormRef>(null);
  const [basicInfoForm] = Form.useForm();
  const [formData, setFormData] = useState<FacilityFormData>({
    facilityInfo: {
      name: '',
      description: '',
      location: '',
      openTime1: '',
      closeTime1: '',
      openTime2: '',
      closeTime2: '',
      openTime3: '',
      closeTime3: '',
      numberOfShifts: 1,
      city: '',
      provinceCode: '',
      district: '',
      districtCode: '',
      ward: '',
      wardCode: ''
    },
    imageFiles: [],
    fieldGroups: [],
    selectedSports: [],
    certificateFile: null,
    licenseFiles: []
  });

  useEffect(() => {
    // Fetch sports data
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const response = await sportService.getSport();
      if (response && Array.isArray(response)) {
        setAllSports(response);
      } else {
        // If real API fails, use mock data
        const mockSports: Sport[] = [
          { id: 1, name: 'football' },
          { id: 2, name: 'tennis' },
          { id: 3, name: 'futsal' },
          { id: 4, name: 'basketball' },
          { id: 5, name: 'badminton' },
          { id: 6, name: 'swimming' },
          { id: 7, name: 'golf' }
        ];
        setAllSports(mockSports);
      }
    } catch (error) {
      console.error('Error fetching sports:', error);
      message.error('Không thể tải dữ liệu môn thể thao');
    }
  };

  const steps = [
    {
      title: 'Thông tin cơ bản',
      icon: <InfoCircleOutlined />,
      content: (props: StepComponentProps) => <BasicInfoForm {...props} />
    },
    {
      title: 'Hình ảnh',
      icon: <PictureOutlined />,
      content: (props: StepComponentProps) => <ImagesUpload {...props} />
    },
    {
      title: 'Nhóm sân',
      icon: <AppstoreOutlined />,
      content: (props: StepComponentProps) => <FieldGroupsForm {...props} />
    },
    {
      title: 'Xác thực',
      icon: <SafetyCertificateOutlined />,
      content: (props: StepComponentProps) => <VerificationDocuments
        formData={props.formData}
        updateFormData={props.updateFormData}
        allSports={props.allSports}
      />
    }
  ];

  const next = async () => {
    try {
      if (current === 0) {
        // Validate basic info form và lấy dữ liệu
        if (basicInfoFormRef.current) {
          const values = await basicInfoFormRef.current.validateFields();
          
          // Xác định số ca dựa trên khung giờ đã nhập
          let numberOfShifts = 1;
          if (values.openTime2 && values.closeTime2) {
            numberOfShifts = values.openTime3 && values.closeTime3 ? 3 : 2;
          }
          
          // Đảm bảo có đủ thông tin location trước khi chuyển bước
          if (!values.provinceCode || !values.districtCode || !values.wardCode) {
            message.error('Vui lòng nhập đầy đủ thông tin địa chỉ của cơ sở');
            return;
          }
          
          // Lấy tên tỉnh, huyện, xã từ values hoặc từ formData hiện tại
          let provinceName = '';
          let districtName = '';
          let wardName = '';
          let fullLocation = '';
          
          // Sử dụng trực tiếp dữ liệu từ formData đã được cập nhật bởi BasicInfoForm
          if (formData.facilityInfo) {
            provinceName = formData.facilityInfo.city || '';
            districtName = formData.facilityInfo.district || '';
            wardName = formData.facilityInfo.ward || '';
            
            // Kiểm tra xem đã có location trong formData chưa
            if (formData.facilityInfo.location) {
              fullLocation = formData.facilityInfo.location;
              console.log("Sử dụng location từ formData:", fullLocation);
            }
          }
          
          // Nếu không có location trong formData, tạo mới từ các thành phần
          if (!fullLocation && provinceName && districtName && wardName) {
            const detailAddress = values.detailAddress || '';
            if (detailAddress) {
              fullLocation = `${detailAddress}, ${wardName}, ${districtName}, ${provinceName}`;
            } else {
              fullLocation = `${wardName}, ${districtName}, ${provinceName}`;
            }
            console.log("Tạo location mới:", fullLocation);
          }
          
          // Không hiển thị lỗi nếu có đủ thông tin địa chỉ, chỉ log cảnh báo
          if (!fullLocation) {
            console.warn('Không thể tạo địa chỉ đầy đủ từ các thành phần.');
            // Tạo location mặc định từ các thành phần hiện có
            if (provinceName && districtName && wardName) {
              fullLocation = `${wardName}, ${districtName}, ${provinceName}`;
              console.log("Tạo location mặc định:", fullLocation);
            }
          }
          
          // Lưu dữ liệu từ form vào state formData
          const facilityInfo = {
            ...formData.facilityInfo,
            name: values.name,
            description: values.description,
            numberOfShifts: numberOfShifts,
            provinceCode: values.provinceCode,
            districtCode: values.districtCode,
            wardCode: values.wardCode,
            detailAddress: values.detailAddress || '',
            // Sử dụng location đã tạo hoặc từ formData
            location: fullLocation || formData.facilityInfo.location || '',
            openTime1: values.openTime1 ? values.openTime1.format('HH:mm') : '',
            closeTime1: values.closeTime1 ? values.closeTime1.format('HH:mm') : '',
            openTime2: values.openTime2 ? values.openTime2.format('HH:mm') : '',
            closeTime2: values.closeTime2 ? values.closeTime2.format('HH:mm') : '',
            openTime3: values.openTime3 ? values.openTime3.format('HH:mm') : '',
            closeTime3: values.closeTime3 ? values.closeTime3.format('HH:mm') : ''
          };
          
          // Cập nhật formData với dữ liệu mới
          updateFormData({ facilityInfo });
          
          // Log để kiểm tra dữ liệu
          console.log("Thông tin đầy đủ của facilityInfo:", facilityInfo);
          console.log("Kiểm tra location:", facilityInfo.location);
        }
      } else if (current === 1) {
        // Validate images
        if (formData.imageFiles.length === 0) {
          message.error('Vui lòng tải lên ít nhất một hình ảnh');
          return;
        }
      } else if (current === 2) {
        // Validate field groups
        if (formData.selectedSports.length === 0) {
          message.error('Vui lòng chọn ít nhất một môn thể thao');
          return;
        }
        
        if (formData.fieldGroups.length === 0) {
          message.error('Vui lòng tạo ít nhất một nhóm sân');
          return;
        }
      }
      
      setCurrent(current + 1);
    } catch (error) {
      // Hiển thị lỗi cụ thể hơn
      console.error("Lỗi khi chuyển bước:", error);
      return;
    }
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const updateFormData = (data: Partial<FacilityFormData>) => {
    setFormData(prevData => ({
      ...prevData,
      ...data
    }));
  };

  const handleSubmit = async () => {
    // Validate certificate upload (required)
    if (!formData.certificateFile) {
      message.error('Vui lòng tải lên giấy chứng nhận cơ sở');
      return;
    }

    // Kiểm tra thông tin cơ bản
    if (!formData.facilityInfo.name || formData.facilityInfo.name.length < 5) {
      message.error('Tên cơ sở phải có ít nhất 5 ký tự');
      setCurrent(0); // Quay lại bước 1
      return;
    }
      
    if (!formData.facilityInfo.location) {
      message.error('Vui lòng nhập địa chỉ cơ sở');
      setCurrent(0); // Quay lại bước 1
      return;
    }
      
    if (!formData.facilityInfo.openTime1 || !formData.facilityInfo.closeTime1) {
      message.error('Vui lòng nhập giờ mở cửa và đóng cửa');
      setCurrent(0); // Quay lại bước 1
      return;
    }
      
    try {
      setSubmitting(true);
      
      // Hàm định dạng chuẩn hóa thời gian
      const formatTimeString = (timeStr: string): string => {
        if (!timeStr) return "";
        
        // Nếu đã có format HH:MM (2 số, dấu hai chấm, 2 số) thì trả về
        if (timeStr.match(/^\d{2}:\d{2}$/)) return timeStr;
        
        // Xử lý định dạng HH:mm:ss (được sử dụng trong fieldGroup)
        if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
          return timeStr.substring(0, 5); // Lấy 5 ký tự đầu (HH:MM)
        }
        
        // Xử lý các định dạng khác
        try {
          const parts = timeStr.split(':');
          if (parts.length >= 2) {
            const hours = parts[0].padStart(2, '0');
            const minutes = parts[1].padStart(2, '0');
            return `${hours}:${minutes}`;
          }
        } catch (error) {
          console.error("Lỗi khi định dạng thời gian:", timeStr, error);
        }
        
        return timeStr; // Trả về nguyên bản nếu không xử lý được
      };

      // Chuẩn bị dữ liệu cho API - chỉ gửi các trường mà API cần
      const apiInfo = {
        name: formData.facilityInfo.name,
        description: formData.facilityInfo.description,
        location: formData.facilityInfo.location,
        openTime1: formatTimeString(formData.facilityInfo.openTime1),
        closeTime1: formatTimeString(formData.facilityInfo.closeTime1),
        openTime2: formData.facilityInfo.openTime2 ? formatTimeString(formData.facilityInfo.openTime2) : null,
        closeTime2: formData.facilityInfo.closeTime2 ? formatTimeString(formData.facilityInfo.closeTime2) : null,
        openTime3: formData.facilityInfo.openTime3 ? formatTimeString(formData.facilityInfo.openTime3) : null,
        closeTime3: formData.facilityInfo.closeTime3 ? formatTimeString(formData.facilityInfo.closeTime3) : null,
        fieldGroups: formData.fieldGroups.map(group => {
          // Đảm bảo các trường required luôn có dữ liệu định dạng đúng
          if (!group.peakStartTime1 || !group.peakEndTime1) {
            console.warn("Thiếu dữ liệu thời gian cao điểm 1 cho nhóm sân:", group.name);
          }
          
          return {
            name: group.name,
            dimension: group.dimension,
            surface: group.surface,
            basePrice: group.basePrice,
            sportIds: group.sportIds,
            // numberOfPeaks: group.numberOfPeaks || 0,
            // Chỉ thêm các trường thời gian nếu chúng tồn tại
            ...(group.peakStartTime1 && group.peakEndTime1 ? { 
              peakStartTime1: formatTimeString(group.peakStartTime1),
              peakEndTime1: formatTimeString(group.peakEndTime1),
              priceIncrease1: group.priceIncrease1 || 0
            } : {}),
            
            // Thêm các trường thời gian khác nếu chúng tồn tại
            ...(group.peakStartTime2 ? { peakStartTime2: formatTimeString(group.peakStartTime2) } : {}),
            ...(group.peakEndTime2 ? { peakEndTime2: formatTimeString(group.peakEndTime2) } : {}),
            ...(group.priceIncrease2 ? { priceIncrease2: group.priceIncrease2 } : {}),
            
            ...(group.peakStartTime3 ? { peakStartTime3: formatTimeString(group.peakStartTime3) } : {}),
            ...(group.peakEndTime3 ? { peakEndTime3: formatTimeString(group.peakEndTime3) } : {}),
            ...(group.priceIncrease3 ? { priceIncrease3: group.priceIncrease3 } : {}),
            
            fields: group.fields.map(field => ({ name: field.name }))
          };
        })
      };
      
      // Log để kiểm tra dữ liệu trước khi gửi
      console.log("Dữ liệu gửi đến API:", apiInfo);
      
      // Log chi tiết thời gian để debug
      console.log("Chi tiết thời gian:");
      console.log("Facility - openTime1:", apiInfo.openTime1);
      console.log("Facility - closeTime1:", apiInfo.closeTime1);
      console.log("FieldGroups:", apiInfo.fieldGroups.map(group => ({
        name: group.name,
        peakStartTime1: group.peakStartTime1,
        peakEndTime1: group.peakEndTime1,
        peakStartTime2: group.peakStartTime2,
        peakEndTime2: group.peakEndTime2,
        peakStartTime3: group.peakStartTime3,
        peakEndTime3: group.peakEndTime3
      })));
      
      // Thêm thông tin cơ sở vào FormData
      const formDataForApi = new FormData();
      formDataForApi.append('facilityInfo', JSON.stringify(apiInfo));
      
      // Add images
      formData.imageFiles.forEach((file) => {
        formDataForApi.append('images', file);
      });
      
      // Add certificate and license files
      if (formData.certificateFile) {
        formDataForApi.append('certificate', formData.certificateFile);
      }
      
      // Thêm license (giấy phép cho từng môn thể thao)
      if (formData.licenseFiles && formData.licenseFiles.length > 0) {
        formData.licenseFiles.forEach((licenseItem) => {
          if (licenseItem.file) {
            formDataForApi.append('licenses', licenseItem.file);
          }
        });
      
        // Thêm mapping sportIds cho licenses
        const sportLicenses = {
          sportIds: formData.licenseFiles.map(license => license.sportId)
        };
        formDataForApi.append('sportLicenses', JSON.stringify(sportLicenses));
      } else {
        formDataForApi.append('sportLicenses', JSON.stringify({}));
      }
      
      // Send to server
      try {
        const response = await facilityService.createFacility(formDataForApi);
        console.log("API Response:", response);
        
        if (response && response.message) {
          message.success('Đã tạo cơ sở thành công!');
          
          // Redirect to facility management
          setTimeout(() => {
            navigate('/owner/facility-management');
          }, 100);
        }
      } catch (error) {
        console.error("Lỗi từ API:", error);         
          message.error('Có lỗi xảy ra khi tạo cơ sở. Vui lòng thử lại sau.');        
      } finally {
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Lỗi khi xử lý form:", error);
      message.error('Có lỗi xảy ra khi xử lý dữ liệu. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  // Render component based on current step directly
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/owner/facility-management')}
            type="text"
            size="large"
          />
          <Title level={2} style={{ margin: 0, marginLeft: 8 }}>Tạo cơ sở mới</Title>
        </div>

        <Card className="mb-8">
          <Steps current={current}>
            {steps.map((item, index) => (
              <Step 
                key={index}
                title={item.title}
                icon={item.icon}
              />
            ))}
          </Steps>
        </Card>

        <div className="steps-content mb-8">
          <Card>
            {current === 0 && (
              <BasicInfoForm
                ref={basicInfoFormRef}
                formData={formData}
                updateFormData={updateFormData}
                allSports={allSports}
                form={basicInfoForm}
              />
            )}
            {current === 1 && (
              <ImagesUpload
                formData={formData}
                updateFormData={updateFormData}
              />
            )}
            {current === 2 && (
              <FieldGroupsForm
                formData={formData}
                updateFormData={updateFormData}
                allSports={allSports}
              />
            )}
            {current === 3 && (
              <VerificationDocuments
                formData={formData}
                updateFormData={updateFormData}
                allSports={allSports}
              />
            )}
          </Card>
        </div>

        <div className="steps-action mt-6 flex justify-between">
          {current > 0 && (
            <Button 
              style={{ margin: '0 8px' }} 
              onClick={prev}
              size="large"
            >
              Quay lại
            </Button>
          )}
          
          {current < steps.length - 1 && (
            <Button 
              type="primary" 
              onClick={next}
              size="large"
              className="ml-auto"
            >
              Tiếp theo
            </Button>
          )}
          
          {current === steps.length - 1 && (
            <Button 
              type="primary" 
              onClick={handleSubmit}
              loading={submitting}
              size="large"
              className="ml-auto"
            >
              Hoàn tất
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateFacility;
