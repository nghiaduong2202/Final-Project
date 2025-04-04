import { useNavigate } from 'react-router-dom';
import { Select } from 'antd';
import TopbarProfile from '@/components/LoginModal/TopbarProfile';
import Logo from '@/assets/Logo.svg';

const { Option } = Select;

const Header = () => {
  const navigate = useNavigate();
  
  // Mock data cho filters
  const sportTypes = [
    { value: 'all', label: 'Tất cả môn' },
    { value: 'badminton', label: 'Cầu lông' },
    { value: 'football', label: 'Bóng đá' },
    { value: 'basketball', label: 'Bóng rổ' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'volleyball', label: 'Bóng chuyền' }
  ];
  
  const locations = [
    { value: 'all', label: 'Tất cả khu vực' },
    { value: 'district1', label: 'Quận 1' },
    { value: 'district2', label: 'Quận 2' },
    { value: 'district3', label: 'Quận 3' },
    { value: 'district4', label: 'Quận 4' }
  ];
  
  const timeSlots = [
    { value: 'all', label: 'Tất cả khung giờ' },
    { value: 'morning', label: 'Sáng (6:00 - 12:00)' },
    { value: 'afternoon', label: 'Chiều (12:00 - 17:00)' },
    { value: 'evening', label: 'Tối (17:00 - 22:00)' }
  ];

  const handleHomeNavigate = () => {
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={handleHomeNavigate}>
            <img src={Logo} alt="Logo" className="h-14" />
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-3 mx-4 flex-grow max-w-2xl">
            <Select 
              defaultValue="all" 
              style={{ width: '33%' }}
              className="rounded-lg"
            >
              {sportTypes.map(sport => (
                <Option key={sport.value} value={sport.value}>{sport.label}</Option>
              ))}
            </Select>
            
            <Select 
              defaultValue="all" 
              style={{ width: '33%' }}
              className="rounded-lg"
            >
              {locations.map(location => (
                <Option key={location.value} value={location.value}>{location.label}</Option>
              ))}
            </Select>
            
            <Select 
              defaultValue="all" 
              style={{ width: '33%' }}
              className="rounded-lg"
            >
              {timeSlots.map(time => (
                <Option key={time.value} value={time.value}>{time.label}</Option>
              ))}
            </Select>
          </div>
          
          {/* Owner Link */}
          <div className="flex items-center space-x-6">
            {/* User Profile */}
            <TopbarProfile />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;