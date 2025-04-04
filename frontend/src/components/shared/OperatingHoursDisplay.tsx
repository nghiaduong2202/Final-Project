import React from 'react';
import { Popover, Tag } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Facility } from '@/types/facility.type';

interface OperatingHoursDisplayProps {
  facility: Facility;
  showIcon?: boolean;
  className?: string;
}

const OperatingHoursDisplay: React.FC<OperatingHoursDisplayProps> = ({ 
  facility, 
  showIcon = true,
  className = '' 
}) => {
  const operatingHours = [];
  
  if (facility.openTime1 && facility.closeTime1) {
    operatingHours.push(
      `${facility.openTime1} - ${facility.closeTime1}`
    );
  }
  
  if (facility.openTime2 && facility.closeTime2) {
    operatingHours.push(
      `${facility.openTime2} - ${facility.closeTime2}`
    );
  }
  
  if (facility.openTime3 && facility.closeTime3) {
    operatingHours.push(
      `${facility.openTime3} - ${facility.closeTime3}`
    );
  }
  
  if (operatingHours.length === 0) {
    return <span>{showIcon && <ClockCircleOutlined className="mr-2" />}-</span>;
  }
  
  // Nếu chỉ có 1 khung giờ, hiển thị bình thường
  if (operatingHours.length === 1) {
    return (
      <div className={`flex items-center ${className}`}>
        {showIcon && <ClockCircleOutlined className="mr-2" />}
        <span className="text-sm">{operatingHours[0]}</span>
      </div>
    );
  }
  
  // Nếu có nhiều khung giờ, hiển thị trong Popover
  const content = (
    <div className="p-1">
      {operatingHours.map((time, index) => (
        <div key={index} className="mb-1 last:mb-0">
          <Tag color="blue">{`Ca ${index + 1}: ${time}`}</Tag>
        </div>
      ))}
    </div>
  );
  
  return (
    <div className={`flex items-center ${className}`}>
      {showIcon && <ClockCircleOutlined className="mr-2" />}
      <Popover 
        content={content} 
        title="Khung giờ hoạt động" 
        trigger="hover"
        placement="bottom"
      >
        <span className="text-sm cursor-pointer hover:text-blue-500">
          {operatingHours[0]} <span className="font-medium text-blue-500 ml-1">[{operatingHours.length}]</span>
        </span>
      </Popover>
    </div>
  );
};

export default OperatingHoursDisplay; 