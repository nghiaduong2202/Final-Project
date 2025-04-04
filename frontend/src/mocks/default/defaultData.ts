export const SURFACE_TYPES = {
    football: ['Cỏ nhân tạo', 'Cỏ tự nhiên', 'Sân đất nện', 'Sân chất nhựa tổng hợp'],
    badminton: ['Thảm PVC/PU', 'Gỗ công nghiệp', 'Sân acrylic', 'Sân bê tông'],
    basketball: ['Thảm PVC/PU', 'Tấm nhựa lắp ghép PP', 'Sân acrylic', 'Sân bê tông'],
    volleyball: ['Thảm PVC/PU', 'Sân acrylic', 'Sân bê tông'],
    tennis: ['Sân cứng', 'Sân đất nện', 'Sân cỏ'],
    pickleball: ['Sân cứng', 'Sân acrylic', 'Sân nhựa tổng hợp'],
    tabletennis: ['Sân xi măng', 'Thảm cao su', 'Thảm nhựa tổng hợp'],
    golf: ['Cỏ nhân tạo', 'Cỏ tự nhiên', 'Sân xi măng'],
    default: []
  };
  
  export const DIMENSIONS = {
    football: ['(25-42)m x (16-25)m', '(50-75)m x (30-55)m', '(60-67)m x (45-50)m', '(100-110)m x (64-75)m'],
    badminton: ['13.4m x 6.1m', '13.4m x 5.18m'],
    basketball: ['28m x 15m', '15m x 11m', '18m x 10m', '12m x 7m'],
    volleyball: ['18m x 9m', '20m x 10m'],
    tennis: ['23.77m x 8.23m', '23.77m x 10.97m'],
    pickleball: ['13.4m x 6.1m'],
    tabletennis: ['9m x 5m', '12m x 6m'],
    golf: ['50m x 10m', '160m x 45m', '200m x 80m'],
    default: []
  };
  
  // Default pricing for different sports
  export const DEFAULT_PRICING = {
    football: 300000,
    badminton: 100000,
    basketball: 150000,
    volleyball: 80000,
    tennis: 250000,
    pickleball: 150000,
    tabletennis: 100000,
    golf: 500000,
    default: 100000
  };
  
  // Compatible sport combinations for composite fields
  // These groupings are based on similar surface types and compatible dimensions
  export const COMPATIBLE_SPORT_GROUPS = [
    {
      id: 1,
      name: "Sân nhà thi đấu đa năng",
      sports: ["basketball", "volleyball", "badminton"],
      description: "Sân trong nhà với mặt sân cứng phù hợp cho bóng rổ, bóng chuyền và cầu lông",
      recommendedSurfaces: ["Thảm PVC/PU", "Sân acrylic", "Sân bê tông"],
      recommendedDimensions: ["28m x 15m", "20m x 10m"],
    },
    {
      id: 2,
      name: "Sân cầu lông - Pickleball",
      sports: ["badminton", "pickleball"],
      description: "Sân đa năng cho cầu lông và pickleball với kích thước tương tự",
      recommendedSurfaces: ["Sân acrylic", "Thảm PVC/PU"],
      recommendedDimensions: ["13.4m x 6.1m"],
    },
    {
      id: 3,
      name: "Sân tennis đa năng",
      sports: ["tennis", "pickleball", "volleyball"],
      description: "Sân tennis có thể kẻ thêm đường cho pickleball hoặc bóng chuyền",
      recommendedSurfaces: ["Sân cứng", "Sân acrylic"],
      recommendedDimensions: ["23.77m x 10.97m"],
    },
    {
      id: 4,
      name: "Sân nhỏ đa năng",
      sports: ["basketball", "volleyball", "badminton", "pickleball"],
      description: "Sân nhỏ đa năng cho nhiều môn thể thao, phù hợp cho các khu vực hạn chế không gian",
      recommendedSurfaces: ["Thảm PVC/PU", "Sân acrylic", "Sân bê tông"],
      recommendedDimensions: ["18m x 10m", "15m x 11m"],
    },
    {
      id: 5,
      name: "Sân bóng đá nhỏ đa năng",
      sports: ["football", "basketball"],
      description: "Sân bóng đá cỡ nhỏ có thể kết hợp với bóng rổ",
      recommendedSurfaces: ["Sân chất nhựa tổng hợp", "Sân bê tông"],
      recommendedDimensions: ["25m x 16m", "28m x 15m"],
    }
  ];
  
  // For each sport, define which other sports it can be combined with
  export const SPORT_COMPATIBILITY = {
    football: ["basketball"],
    basketball: ["football", "volleyball", "badminton", "pickleball"],
    volleyball: ["basketball", "badminton", "tennis", "pickleball"],
    tennis: ["pickleball", "volleyball"],
    badminton: ["pickleball", "basketball", "volleyball"],
    pickleball: ["badminton", "tennis", "basketball", "volleyball"],
    tableTennis: [], // Usually standalone
    golf: [] // Usually standalone
  };
  