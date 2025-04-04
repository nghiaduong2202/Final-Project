import React, { useEffect, useState } from 'react';
import { Badge, Dropdown } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchUnreadCount } from '@/store/slices/notificationSlice';
import NotificationPanel from '@/components/Notification/NotificationPanel';

const NotificationIcon: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { unreadCount } = useSelector((state: RootState) => state.notification);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Fetch unread count when component mounts
    dispatch(fetchUnreadCount());

    // Poll for new notifications every minute
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <Dropdown
      overlay={<NotificationPanel onClose={() => setOpen(false)} />}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <div className="relative cursor-pointer">
        <Badge count={unreadCount} overflowCount={99} size="small">
          <BellOutlined style={{ fontSize: '24px', color: '#646464' }} />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default NotificationIcon; 