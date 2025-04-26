import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { List, Card, Typography, Avatar, Tag, Button, Empty, Spin, Breadcrumb } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHooks';
import { showLoginModal } from '@/store/slices/userSlice';
import { EventRegistration, DisplayEvent } from '@/types/event.type';
import { getRegistrationsByUserId } from '@/mocks/event/registrationData';
import { mockEvents } from '@/mocks/event/eventData';
import { mockFacilitiesDropdown } from '@/mocks/facility/mockFacilities';

const { Title, Paragraph } = Typography;

const EventParticipate: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector(state => state.user);
  const userId = user?.id;

  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [eventsMap, setEventsMap] = useState<Record<number, DisplayEvent>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(showLoginModal({ path: '/user/events/manage', role: 'player' }));
      return;
    }
    setLoading(true);
    const regs = getRegistrationsByUserId(userId || '');
    setRegistrations(regs);
    const map: Record<number, DisplayEvent> = {};
    regs.forEach(reg => {
      const ev = mockEvents.find(e => e.id === reg.eventId);
      if (ev) {
        const fac = mockFacilitiesDropdown.find(f => f.id === ev.facilityId);
        map[reg.eventId] = { ...ev, facilityName: fac?.name || '' } as DisplayEvent;
      }
    });
    setEventsMap(map);
    setLoading(false);
  }, [isAuthenticated, userId]);

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <Empty
        description="Bạn chưa đăng ký tham gia sự kiện nào"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button type="primary" onClick={() => navigate('/events')}>
          Khám phá sự kiện
        </Button>
      </Empty>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Breadcrumb
        className="mb-4"
        items={[
          { title: <Link to="/">Trang chủ</Link> },
          { title: 'Đăng ký của tôi' }
        ]}
      />
      <Title level={2}>Sự kiện đã đăng ký</Title>

      <List
        itemLayout="vertical"
        dataSource={registrations}
        renderItem={reg => {
          const ev = eventsMap[reg.eventId];
          return (
            <Card key={reg.id} className="mb-4">
              <List.Item.Meta
                avatar={<Avatar size={64} src={ev?.image?.[0] || 'https://via.placeholder.com/64'} />}
                title={<Link to={`/event/${reg.eventId}`}>{ev?.name}</Link>}
                description={
                  <div className="flex flex-wrap gap-4">
                    <span><CalendarOutlined /> {dayjs(reg.registrationDate).format('DD/MM/YYYY')}</span>
                    <Tag color={reg.status === 'approved' ? 'green' : reg.status === 'rejected' ? 'red' : 'orange'}>
                      {reg.status === 'pending' ? 'Chờ duyệt' : reg.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                    </Tag>
                    {reg.paymentStatus && (
                      <Tag color={reg.paymentStatus === 'paid' ? 'green' : reg.paymentStatus === 'refunded' ? 'gray' : 'orange'}>
                        {reg.paymentStatus === 'pending'
                          ? 'Chờ thanh toán'
                          : reg.paymentStatus === 'paid'
                          ? 'Đã thanh toán'
                          : 'Đã hoàn tiền'}
                      </Tag>
                    )}
                  </div>
                }
              />

              {reg.teamName && <Paragraph><strong>Đội:</strong> {reg.teamName}</Paragraph>}
              {reg.notes && <Paragraph italic><strong>Ghi chú:</strong> {reg.notes}</Paragraph>}

              <div className="flex gap-2">
                <Button onClick={() => navigate(`/event/${reg.eventId}`)}>Xem chi tiết</Button>
                {reg.paymentProof && <Button type="link" href={reg.paymentProof} target="_blank">Xem chứng từ</Button>}
              </div>
            </Card>
          );
        }}
      />
    </div>
  );
};

export default EventParticipate;

