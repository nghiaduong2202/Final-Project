  // Hàm chuyển đổi tên thể thao sang tiếng Việt
  export const getSportNameInVietnamese = (englishName: string): string => {
    const sportDictionary: Record<string, string> = {
      'football': 'Bóng đá',    
      'basketball': 'Bóng rổ',
      'volleyball': 'Bóng chuyền',
      'tennis': 'Tennis',
      'badminton': 'Cầu lông',    
      'tabletennis': 'Bóng bàn',
      'pickleball': 'Pickleball',    
      'golf': 'Golf',
      
    };
  
    // Chuyển đổi tên sang chữ thường để tìm kiếm trong từ điển
    const lowerCaseName = englishName.toLowerCase();
    
    // Trả về tên tiếng Việt nếu có trong từ điển, nếu không trả về tên gốc
    return sportDictionary[lowerCaseName] || englishName;
  };