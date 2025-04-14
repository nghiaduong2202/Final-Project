import React from 'react';

interface MapLocationProps {
  location: string;
  lat?: number;
  lng?: number;
  zoom?: number;
}

const MapLocation: React.FC<MapLocationProps> = ({ location, lat, lng, zoom = 15 }) => {
  // Mặc định là vị trí trung tâm Hà Nội khi không có tọa độ
  const latitude = lat || 21.0278;
  const longitude = lng || 105.8342;
  
  // Sử dụng URL ở dạng map tương tự như link xem bản đồ lớn hơn
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.003}%2C${latitude - 0.003}%2C${longitude + 0.003}%2C${latitude + 0.003}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  
  return (
    <div className="w-full mb-3">
      <div className="relative shadow-md" style={{ paddingBottom: '40%', height: 0, overflow: 'hidden' }}>
        <iframe 
          title={`Map of ${location}`}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }} 
          frameBorder="0" 
          scrolling="no" 
          marginHeight={0} 
          marginWidth={0} 
          src={mapUrl} 
          allowFullScreen
        />
      </div>
      <div className="text-xs text-center mt-1 text-gray-500">
        <a 
          href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`} 
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Xem vị trí trên bản đồ lớn
        </a>
      </div>
    </div>
  );
};

export default MapLocation; 