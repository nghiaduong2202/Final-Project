import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Tag, Popconfirm, message, Card, Image } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined, EyeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/api.service';

const { Option } = Select;

interface Facility {
  id: string;
  name: string;
  address: string;
  sportType: string;
  owner: {
    id: string;
    name: string;
  };
  status: string;
  image: string;
  createdAt: string;
}

const FacilitiesPage: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterSportType, setFilterSportType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        // Trong môi trường thực tế, bạn sẽ gọi API thực sự
        // const response = await apiClient.get('/admin/facilities');
        // setFacilities(response.data);
        
        // Mock data for development
        setTimeout(() => {
          const mockFacilities: Facility[] = [
            { 
              id: '1', 
              name: 'Sân vận động Thống Nhất', 
              address: '123 Nguyễn Thị Minh Khai, Quận 1, TP.HCM', 
              sportType: 'football', 
              owner: { id: '101', name: 'Nguyễn Văn X' },
              status: 'active', 
              image: 'https://picsum.photos/200/150',
              createdAt: '2023-01-15' 
            },
            { 
              id: '2', 
              name: 'Sân cầu lông Victory', 
              address: '456 Lê Lợi, Quận 3, TP.HCM', 
              sportType: 'badminton', 
              owner: { id: '102', name: 'Trần Thị Y' },
              status: 'pending', 
              image: 'https://picsum.photos/200/150',
              createdAt: '2023-02-20' 
            },
            { 
              id: '3', 
              name: 'Sân Tennis Hòa Bình', 
              address: '789 Cách Mạng Tháng 8, Quận 10, TP.HCM', 
              sportType: 'tennis', 
              owner: { id: '103', name: 'Lê Văn Z' },
              status: 'active', 
              image: 'https://picsum.photos/200/150',
              createdAt: '2023-03-10' 
            },
            { 
              id: '4', 
              name: 'Sân bóng rổ Phú Nhuận', 
              address: '012 Phan Xích Long, Quận Phú Nhuận, TP.HCM', 
              sportType: 'basketball', 
              owner: { id: '104', name: 'Hoàng Thị W' },
              status: 'blocked', 
              image: 'https://picsum.photos/200/150',
              createdAt: '2023-04-05' 
            },
            { 
              id: '5', 
              name: 'Sân bóng đá mini Thủ Đức', 
              address: '345 Võ Văn Ngân, TP. Thủ Đức, TP.HCM', 
              sportType: 'football', 
              owner: { id: '105', name: 'Phạm Văn V' },
              status: 'active', 
              image: 'https://picsum.photos/200/150',
              createdAt: '2023-05-12' 
            },
          ];
          
          setFacilities(mockFacilities);
          setLoading(false);
        }, 100);
        
      } catch (error) {
        console.error('Error fetching facilities:', error);
        setLoading(false);
        message.error('Không thể tải danh sách cơ sở');
      }
    };

    fetchFacilities();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      // Trong môi trường thực tế, bạn sẽ gọi API xóa
      // await apiClient.delete(`/admin/facilities/${id}`);
      
      // Mock deletion
      setFacilities(prevFacilities => prevFacilities.filter(facility => facility.id !== id));
      message.success('Xóa cơ sở thành công');
    } catch (error) {
      console.error('Error deleting facility:', error);
      message.error('Không thể xóa cơ sở');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      // Trong môi trường thực tế, bạn sẽ gọi API update
      // await apiClient.patch(`/admin/facilities/${id}/status`, { status: newStatus });
      
      // Mock status update
      setFacilities(prevFacilities => 
        prevFacilities.map(facility => 
          facility.id === id ? { ...facility, status: newStatus } : facility
        )
      );
      
      message.success(`Đã cập nhật trạng thái cơ sở thành ${newStatus === 'active' ? 'Hoạt động' : newStatus === 'blocked' ? 'Bị chặn' : 'Chờ duyệt'}`);
    } catch (error) {
      console.error('Error updating facility status:', error);
      message.error('Không thể cập nhật trạng thái cơ sở');
    }
  };

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = searchText === '' || 
      facility.name.toLowerCase().includes(searchText.toLowerCase()) || 
      facility.address.toLowerCase().includes(searchText.toLowerCase()) ||
      facility.owner.name.toLowerCase().includes(searchText.toLowerCase());
      
    const matchesSportType = filterSportType === null || facility.sportType === filterSportType;
    const matchesStatus = filterStatus === null || facility.status === filterStatus;
    
    return matchesSearch && matchesSportType && matchesStatus;
  });

  const columns = [
    {
      title: 'Cơ sở',
      key: 'facility',
      render: (_: any, record: Facility) => (
        <div className="flex items-center space-x-3">
          <Image 
            src={record.image} 
            alt={record.name}
            width={60}
            height={40}
            className="object-cover rounded"
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
          />
          <div>
            <div className="font-semibold">
              <Link to={`/facilities/${record.id}`} className="text-blue-500 hover:underline">
                {record.name}
              </Link>
            </div>
            <div className="text-xs text-gray-500">{record.address}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Chủ sân',
      dataIndex: ['owner', 'name'],
      key: 'owner',
      render: (text: string, record: Facility) => (
        <Link to={`/users/${record.owner.id}`} className="text-blue-500 hover:underline">
          {text}
        </Link>
      ),
    },
    {
      title: 'Loại sân',
      dataIndex: 'sportType',
      key: 'sportType',
      render: (type: string) => {
        let text = '';
        let color = '';
        
        switch (type) {
          case 'football':
            text = 'Bóng đá';
            color = 'green';
            break;
          case 'badminton':
            text = 'Cầu lông';
            color = 'blue';
            break;
          case 'tennis':
            text = 'Tennis';
            color = 'orange';
            break;
          case 'basketball':
            text = 'Bóng rổ';
            color = 'red';
            break;
          default:
            text = type;
            color = 'default';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = '';
        let text = '';
        let icon = null;
        
        switch (status) {
          case 'active':
            color = 'green';
            text = 'Hoạt động';
            icon = <CheckCircleOutlined />;
            break;
          case 'blocked':
            color = 'red';
            text = 'Bị chặn';
            icon = <StopOutlined />;
            break;
          case 'pending':
            color = 'orange';
            text = 'Chờ duyệt';
            icon = <EyeOutlined />;
            break;
          default:
            color = 'default';
            text = status;
        }
        
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Facility) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/facilities/${record.id}`)}
            type="link"
          />
          {record.status === 'active' ? (
            <Popconfirm
              title="Bạn có chắc muốn chặn cơ sở này?"
              onConfirm={() => handleStatusChange(record.id, 'blocked')}
              okText="Có"
              cancelText="Không"
            >
              <Button 
                icon={<StopOutlined />} 
                danger
                type="link"
                title="Chặn cơ sở"
              />
            </Popconfirm>
          ) : record.status === 'blocked' ? (
            <Button 
              icon={<CheckCircleOutlined />} 
              type="link"
              title="Mở khóa cơ sở"
              style={{ color: 'green' }}
              onClick={() => handleStatusChange(record.id, 'active')}
            />
          ) : (
            <Button 
              icon={<CheckCircleOutlined />} 
              type="link"
              title="Duyệt cơ sở"
              style={{ color: 'orange' }}
              onClick={() => handleStatusChange(record.id, 'active')}
            />
          )}
          <Popconfirm
            title="Bạn có chắc muốn xóa cơ sở này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button 
              icon={<DeleteOutlined />} 
              danger
              type="link"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý cơ sở</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => message.info('Chức năng thêm mới cơ sở chưa được triển khai')}
        >
          Thêm cơ sở
        </Button>
      </div>
      
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Tìm kiếm theo tên, địa chỉ..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          
          <Select
            placeholder="Lọc theo loại sân"
            allowClear
            style={{ width: 200 }}
            onChange={value => setFilterSportType(value)}
          >
            <Option value="football">Bóng đá</Option>
            <Option value="badminton">Cầu lông</Option>
            <Option value="tennis">Tennis</Option>
            <Option value="basketball">Bóng rổ</Option>
          </Select>
          
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            style={{ width: 200 }}
            onChange={value => setFilterStatus(value)}
          >
            <Option value="active">Hoạt động</Option>
            <Option value="blocked">Bị chặn</Option>
            <Option value="pending">Chờ duyệt</Option>
          </Select>
        </div>
      </Card>
      
      <Table
        columns={columns}
        dataSource={filteredFacilities}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default FacilitiesPage;