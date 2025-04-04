import React from 'react';
import { Card, Statistic } from 'antd';
import { StatisticProps } from 'antd/es/statistic/Statistic';

interface StatCardProps extends Omit<StatisticProps, 'title'> {
  title: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color = '#1677ff', 
  loading = false,
  ...rest 
}) => {
  return (
    <Card hoverable className="h-full">
      <div className="flex items-center">
        {icon && (
          <div 
            className="flex items-center justify-center w-12 h-12 rounded-lg mr-4"
            style={{ backgroundColor: `${color}20` }} // Use color with 20% opacity
          >
            <span style={{ color }}>{icon}</span>
          </div>
        )}
        <Statistic
          title={title}
          value={value}
          loading={loading}
          {...rest}
        />
      </div>
    </Card>
  );
};

export default StatCard;