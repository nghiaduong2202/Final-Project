import React, { useEffect, useState } from 'react';
import { Select, Spin } from 'antd';
import { facilityService, FacilityDropdownItem } from '@/services/facility.service';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchFacilityDropdown } from '@/store/slices/facilitySlice';

const { Option } = Select;

interface FacilitySelectDropdownProps {
  onChange: (id: string) => void;
  value?: string;
  placeholder?: string;
  style?: React.CSSProperties;
  size?: 'large' | 'middle' | 'small';
  allowClear?: boolean;
  disabled?: boolean;
  useRedux?: boolean;
}

const FacilitySelectDropdown: React.FC<FacilitySelectDropdownProps> = ({
  onChange,
  value,
  placeholder = 'Chọn cơ sở',
  style,
  size = 'middle',
  allowClear = true,
  disabled = false,
  useRedux = false
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<FacilityDropdownItem[]>([]);
  
  const dispatch = useDispatch<AppDispatch>();
  const { dropdownItems, isLoading: reduxLoading } = useSelector((state: RootState) => state.facility);

  useEffect(() => {
    if (useRedux) {
      dispatch(fetchFacilityDropdown());
    } else {
      const fetchFacilities = async () => {
        try {
          setIsLoading(true);
          const data = await facilityService.getFacilitiesDropdown();
          setOptions(data);
        } catch (error) {
          console.error('Failed to fetch facilities for dropdown:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchFacilities();
    }
  }, [dispatch, useRedux]);
  
  useEffect(() => {
    if (useRedux && dropdownItems?.length > 0) {
      setOptions(dropdownItems);
    }
  }, [dropdownItems, useRedux]);

  const handleChange = (value: string) => {
    onChange(value);
  };

  const loading = useRedux ? reduxLoading : isLoading;

  return (
    <Select
      value={value}
      placeholder={placeholder}
      style={style || { width: '100%' }}
      onChange={handleChange}
      loading={loading}
      size={size}
      allowClear={allowClear}
      showSearch
      filterOption={(input, option) =>
        (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
      }
      disabled={disabled}
      notFoundContent={loading ? <Spin size="small" /> : null}
    >
      {options.map(facility => (
        <Option key={facility.id} value={facility.id}>
          {facility.name}
        </Option>
      ))}
    </Select>
  );
};

export default FacilitySelectDropdown; 