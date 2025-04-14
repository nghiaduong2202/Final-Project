// Hàm chuyển đổi địa chỉ thành tọa độ (latitude, longitude)
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    // Sử dụng Nominatim API (OpenStreetMap) thay vì Google Geocoding (miễn phí, không cần API key)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Không thể lấy tọa độ từ địa chỉ');
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

// Hàm mô phỏng để tạo các tọa độ cho các cơ sở theo vùng
export const getMockCoordinates = (facilityId: string): { lat: number; lng: number } => {
  // Mặc định là khu vực Hoàn Kiếm, Hà Nội nếu không có dữ liệu
  let center = { lat: 21.0285, lng: 105.8508 };
  
  // Tạo một số vùng ví dụ dựa trên id
  const lastChar = facilityId.charAt(facilityId.length - 1);
  const charCode = lastChar.charCodeAt(0);
  
  // Tạo một số ngẫu nhiên, nhưng nhất quán cho cùng một id
  const randomLat = (charCode % 10) * 0.001;
  const randomLng = ((charCode * 2) % 10) * 0.001;
  
  // Các vùng mẫu ở Việt Nam với tọa độ chính xác hơn
  if (facilityId.includes('HN')) {
    // Hà Nội - sân vận động Mỹ Đình
    center = { lat: 21.0204 + randomLat, lng: 105.7644 + randomLng };
  } else if (facilityId.includes('SG') || facilityId.includes('HCM')) {
    // Hồ Chí Minh - Thảo Cầm Viên
    center = { lat: 10.7873 + randomLat, lng: 106.7052 + randomLng };
  } else if (facilityId.includes('DN')) {
    // Đà Nẵng - Cầu Rồng
    center = { lat: 16.0611 + randomLat, lng: 108.2272 + randomLng };
  } else if (facilityId.includes('HP')) {
    // Hải Phòng - Quảng trường Lớn
    center = { lat: 20.8603 + randomLat, lng: 106.6839 + randomLng };
  } else if (facilityId.includes('CT')) {
    // Cần Thơ - Bến Ninh Kiều
    center = { lat: 10.0333 + randomLat, lng: 105.7875 + randomLng };
  } else {
    // Các vị trí ngẫu nhiên khác nhau tùy theo ID
    const areas = [
      { lat: 21.0285, lng: 105.8508 }, // Hoàn Kiếm
      { lat: 21.0189, lng: 105.8265 }, // Ba Đình
      { lat: 21.0287, lng: 105.7828 }, // Cầu Giấy
      { lat: 21.0699, lng: 105.8234 }, // Tây Hồ
      { lat: 10.7756, lng: 106.7019 }, // Quận 1, HCM
      { lat: 10.8068, lng: 106.6430 }, // Tân Bình, HCM
    ];
    
    const index = charCode % areas.length;
    center = { 
      lat: areas[index].lat + randomLat, 
      lng: areas[index].lng + randomLng 
    };
  }
  
  return center;
}; 