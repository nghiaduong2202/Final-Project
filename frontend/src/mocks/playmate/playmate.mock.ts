import { PlaymateSearch, PlaymateApplication } from "@/types/playmate.type";

// Mock data cho các đơn đăng ký tham gia
export const mockPlaymateApplications: PlaymateApplication[] = [
  {
    id: 1,
    playmateSearchId: 1,
    userId: "user123",
    userInfo: {
      name: "Nguyễn Văn A",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      gender: "male",
      phoneNumber: "0987654321",
      age: 25
    },
    message: "Tôi muốn tham gia để cải thiện kỹ năng đá bóng của mình.",
    skillLevel: "BEGINNER",
    status: "PENDING",
    createdAt: "2023-10-25T08:30:00Z"
  },
  {
    id: 2,
    playmateSearchId: 1,
    userId: "user456",
    userInfo: {
      name: "Trần Thị B",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      gender: "female",
      phoneNumber: "0987654322",
      age: 22
    },
    message: "Tôi đã chơi bóng đá 5 năm và muốn tìm đối tác mới.",
    skillLevel: "INTERMEDIATE",
    status: "ACCEPTED",
    createdAt: "2023-10-25T09:15:00Z",
    reviewedAt: "2023-10-26T10:30:00Z"
  },
  {
    id: 3,
    playmateSearchId: 1,
    userId: "user789",
    userInfo: {
      name: "Lê Văn C",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      gender: "male",
      phoneNumber: "0987654323",
      age: 30
    },
    message: "Tôi là người mới, muốn học hỏi từ các bạn.",
    skillLevel: "BEGINNER",
    status: "REJECTED",
    createdAt: "2023-10-25T10:00:00Z",
    reviewedAt: "2023-10-26T11:45:00Z",
    rejectionReason: "Không phù hợp với yêu cầu kỹ năng của nhóm"
  },
  {
    id: 4,
    playmateSearchId: 2,
    userId: "user123",
    userInfo: {
      name: "Nguyễn Văn A",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      gender: "male",
      phoneNumber: "0987654321",
      age: 25
    },
    message: "Tôi mới học chơi tennis và muốn tìm bạn cùng tập luyện.",
    skillLevel: "BEGINNER",
    status: "ACCEPTED",
    createdAt: "2023-10-27T14:20:00Z",
    reviewedAt: "2023-10-28T09:15:00Z"
  },
  {
    id: 5,
    playmateSearchId: 3,
    userId: "user456",
    userInfo: {
      name: "Trần Thị B",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      gender: "female",
      phoneNumber: "0987654322",
      age: 22
    },
    message: "Tôi muốn thử sức với môn cầu lông, đã từng chơi khoảng 3 năm.",
    skillLevel: "INTERMEDIATE",
    status: "PENDING",
    createdAt: "2023-10-29T16:45:00Z"
  }
];

// Mock data cho các bài đăng tìm bạn chơi
export const mockPlaymateSearches: PlaymateSearch[] = [
  {
    id: 1,
    userId: "current_user_id",
    userInfo: {
      name: "Trần Minh D",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
      gender: "male",
      age: 28,
      phoneNumber: "0987654324",
      email: "tranminhd@example.com"
    },
    sportId: 1,
    sportName: "Bóng đá",
    title: "Tìm đối tác chơi bóng đá 5v5",
    description: "Đang tìm thêm người để chơi bóng đá 5v5 vào cuối tuần. Mình có sân và cần thêm 3 người nữa.",
    image: [
      "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=1000",      
      "https://images.unsplash.com/photo-1560089000-7433a4ebbd64?q=80&w=1000"
    ],
    facilityId: "facility123",
    facilityName: "Sân bóng đá Mini HCMC",
    location: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    date: "2023-11-05",
    startTime: "18:00",
    endTime: "20:00",
    applicationDeadline: "2023-11-04T18:00:00Z",
    playmateSearchType: "GROUP",
    requiredSkillLevel: "INTERMEDIATE",
    requiredParticipants: 5,
    maximumParticipants: 10,
    currentParticipants: 2,
    genderPreference: "ANY",
    status: "ACTIVE",
    costType: "PER_PERSON",
    price: 50000,
    costDetails: "Phí thuê sân chia đều cho các thành viên",
    communicationDescription: "Sẽ lập nhóm Zalo để trao đổi thông tin",
    createdAt: "2023-10-24T15:30:00Z",
    updatedAt: "2023-10-24T15:30:00Z",
    applications: [
      mockPlaymateApplications[0],
      mockPlaymateApplications[1],
      mockPlaymateApplications[2]
    ]
  },
  {
    id: 2,
    userId: "user888",
    userInfo: {
      name: "Phạm Thị E",
      avatar: "https://randomuser.me/api/portraits/women/5.jpg",
      gender: "female",
      age: 24,
      phoneNumber: "0987654325",
      email: "phamthie@example.com"
    },
    sportId: 2,
    sportName: "Tennis",
    title: "Tìm người chơi tennis cuối tuần",
    description: "Mình mới bắt đầu chơi tennis được vài tháng, đang tìm bạn cùng luyện tập vào sáng thứ 7 hoặc chủ nhật.",
    image: [
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1000",
    ],
    facilityId: "facility456",
    facilityName: "Sân Tennis Phú Nhuận",
    location: "456 Phan Xích Long, Phú Nhuận, TP.HCM",
    date: "2023-11-11",
    startTime: "08:00",
    endTime: "10:00",
    playmateSearchType: "INDIVIDUAL",
    requiredSkillLevel: "BEGINNER",
    requiredParticipants: 1,
    currentParticipants: 1,
    genderPreference: "ANY",
    status: "ACTIVE",
    costType: "TOTAL",
    price: 200000,
    costDetails: "Chi phí thuê sân sẽ chia đôi",
    communicationDescription: "Liên hệ qua số điện thoại",
    createdAt: "2023-10-26T10:15:00Z",
    updatedAt: "2023-10-26T10:15:00Z",
    applications: [
      mockPlaymateApplications[3]
    ]
  },
  {
    id: 3,
    userId: "user777",
    userInfo: {
      name: "Hoàng Văn F",
      avatar: "https://randomuser.me/api/portraits/men/6.jpg",
      gender: "male",
      age: 32,
      phoneNumber: "0987654326",
      email: "hoangvanf@example.com"
    },
    sportId: 3,
    sportName: "Cầu lông",
    title: "Tìm đối thủ cầu lông trình độ nâng cao",
    description: "Mình đã chơi cầu lông 10 năm, đang tìm đối thủ cùng trình độ để thi đấu giao lưu vào tối thứ 4 hàng tuần.",
    image: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000",
      "https://images.unsplash.com/photo-1613918108466-759cb53c4518?q=80&w=1000"
    ],
    facilityId: "facility789",
    facilityName: "Nhà thi đấu Tân Bình",
    location: "789 Cộng Hòa, Tân Bình, TP.HCM",
    date: "2023-11-15",
    startTime: "19:00",
    endTime: "21:00",
    playmateSearchType: "INDIVIDUAL",
    requiredSkillLevel: "ADVANCED",
    requiredParticipants: 1,
    currentParticipants: 0,
    genderPreference: "ANY",
    status: "ACTIVE",
    costType: "PER_PERSON",
    price: 80000,
    costDetails: "Đã bao gồm phí thuê sân và vợt",
    createdAt: "2023-10-27T14:45:00Z",
    updatedAt: "2023-10-27T14:45:00Z",
    applications: [
      mockPlaymateApplications[4]
    ]
  },
  {
    id: 4,
    userId: "user666",
    userInfo: {
      name: "Ngô Thị G",
      avatar: "https://randomuser.me/api/portraits/women/7.jpg",
      gender: "female",
      age: 27,
      phoneNumber: "0987654327",
      email: "ngothig@example.com"
    },
    sportId: 4,
    sportName: "Bơi lội",
    title: "Tìm bạn cùng tập bơi buổi sáng",
    description: "Mình muốn tìm bạn cùng tập bơi vào buổi sáng để động viên nhau. Bạn không cần giỏi, chỉ cần đều đặn.",
    image: [
      "https://images.unsplash.com/photo-1560090995-01632a28895b?q=80&w=1000",
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1000"
    ],
    facilityId: "facility101",
    facilityName: "Hồ bơi Đầm Sen",
    location: "101 Hòa Bình, Quận 11, TP.HCM",
    date: "2023-11-20",
    startTime: "06:00",
    endTime: "07:30",
    playmateSearchType: "INDIVIDUAL",
    requiredSkillLevel: "BEGINNER",
    requiredParticipants: 1,
    maximumParticipants: 2,
    currentParticipants: 0,
    genderPreference: "FEMALE",
    status: "ACTIVE",
    costType: "FREE",
    communicationDescription: "Liên hệ qua Zalo",
    createdAt: "2023-10-28T08:20:00Z",
    updatedAt: "2023-10-28T08:20:00Z"
  },
  {
    id: 5,
    userId: "current_user_id",
    userInfo: {
      name: "Trần Minh D",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
      gender: "male",
      age: 28,
      phoneNumber: "0987654324",
      email: "tranminhd@example.com"
    },
    sportId: 1,
    sportName: "Bóng đá",
    title: "Tuyển người chơi cho đội bóng phong trào",
    description: "Đội bóng phong trào khu vực quận 7 đang tuyển thêm thành viên tham gia thi đấu giao lưu hàng tuần.",
    image: [
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000",
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1000"
    ],
    facilityId: "facility202",
    facilityName: "Sân bóng đá Phú Mỹ Hưng",
    location: "202 Nguyễn Lương Bằng, Quận 7, TP.HCM",
    date: "2023-11-25",
    startTime: "17:30",
    endTime: "19:30",
    playmateSearchType: "GROUP",
    requiredSkillLevel: "INTERMEDIATE",
    requiredParticipants: 3,
    maximumParticipants: 5,
    currentParticipants: 1,
    genderPreference: "MALE",
    status: "ACTIVE",
    costType: "PER_PERSON",
    price: 70000,
    costDetails: "Chi phí thuê sân và nước uống",
    communicationDescription: "Liên hệ qua nhóm Facebook của đội",
    createdAt: "2023-10-29T16:10:00Z",
    updatedAt: "2023-10-29T16:10:00Z"
  },
  {
    id: 6,
    userId: "user444",
    userInfo: {
      name: "Lý Thị I",
      avatar: "https://randomuser.me/api/portraits/women/9.jpg",
      gender: "female",
      age: 29,
      phoneNumber: "0987654329",
      email: "lythii@example.com"
    },
    sportId: 5,
    sportName: "Yoga",
    title: "Tìm nhóm tập Yoga cùng nhau",
    description: "Mình đang tìm 3-4 bạn cùng tập Yoga vào buổi sáng sớm tại công viên hoặc phòng tập.",
    image: [
      "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=1000",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000"
    ],
    facilityId: "facility303",
    facilityName: "Phòng tập Yoga Zen",
    location: "303 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM",
    date: "2023-11-30",
    startTime: "05:30",
    endTime: "07:00",
    playmateSearchType: "GROUP",
    requiredSkillLevel: "BEGINNER",
    requiredParticipants: 4,
    maximumParticipants: 6,
    currentParticipants: 1,
    genderPreference: "FEMALE",
    status: "ACTIVE",
    costType: "GENDER_BASED",
    costFemale: 50000,
    costMale: 70000,
    costDetails: "Phí tham gia khóa học cơ bản",
    communicationDescription: "Liên hệ qua email",
    createdAt: "2023-10-30T07:45:00Z",
    updatedAt: "2023-10-30T07:45:00Z"
  },
  {
    id: 7,
    userId: "user333",
    userInfo: {
      name: "Vũ Văn K",
      avatar: "https://randomuser.me/api/portraits/men/10.jpg",
      gender: "male",
      age: 40,
      phoneNumber: "0987654330",
      email: "vuvank@example.com"
    },
    sportId: 6,
    sportName: "Golf",
    title: "Tìm đối tác chơi golf cuối tuần",
    description: "Đang tìm đối tác chơi golf vào cuối tuần tại các sân golf quanh TP.HCM. Bạn nên có kinh nghiệm khoảng 2-3 năm.",
    image: [
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=1000",
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=1000"
    ],
    facilityId: "facility404",
    facilityName: "Sân Golf Thủ Đức",
    location: "404 Linh Đông, Thủ Đức, TP.HCM",
    date: "2023-12-02",
    startTime: "14:00",
    endTime: "17:00",
    playmateSearchType: "INDIVIDUAL",
    requiredSkillLevel: "PROFESSIONAL",
    requiredParticipants: 1,
    maximumParticipants: 3,
    currentParticipants: 0,
    genderPreference: "ANY",
    status: "ACTIVE",
    costType: "TOTAL",
    price: 1500000,
    costDetails: "Chi phí thuê sân sẽ chia đều",
    communicationDescription: "Liên hệ qua số điện thoại",
    createdAt: "2023-10-31T11:30:00Z",
    updatedAt: "2023-10-31T11:30:00Z"
  },
  {
    id: 8,
    userId: "user222",
    userInfo: {
      name: "Đinh Thị L",
      avatar: "https://randomuser.me/api/portraits/women/11.jpg",
      gender: "female",
      age: 26,
      phoneNumber: "0987654331",
      email: "dinhthi@example.com"
    },
    sportId: 7,
    sportName: "Bóng rổ",
    title: "Tìm đội bóng rổ nữ để tham gia",
    description: "Mình cao 1m68, đã chơi bóng rổ 5 năm và đang tìm một đội bóng rổ nữ để tham gia tập luyện thường xuyên.",
    image: [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000",
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=1000"
    ],
    facilityId: "facility505",
    facilityName: "Sân bóng rổ Quận 5",
    location: "505 An Dương Vương, Quận 5, TP.HCM",
    date: "2023-12-05",
    startTime: "18:30",
    endTime: "20:30",
    playmateSearchType: "GROUP",
    requiredSkillLevel: "ADVANCED",
    requiredParticipants: 1,
    currentParticipants: 0,
    genderPreference: "FEMALE",
    status: "ACTIVE",
    costType: "PER_PERSON",
    price: 40000,
    costDetails: "Phí thuê sân và nước uống",
    communicationDescription: "Liên hệ qua Instagram",
    createdAt: "2023-11-01T13:15:00Z",
    updatedAt: "2023-11-01T13:15:00Z"
  },
  {
    id: 9,
    userId: "current_user_id",
    userInfo: {
      name: "Trần Minh D",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
      gender: "male",
      age: 28,
      phoneNumber: "0987654324",
      email: "tranminhd@example.com"
    },
    sportId: 8,
    sportName: "Bóng chuyền",
    title: "Thành lập đội bóng chuyền nghiệp dư",
    description: "Đang tìm những bạn có đam mê với bóng chuyền để thành lập đội thi đấu phong trào. Ưu tiên những bạn đã có kinh nghiệm.",
    image: [
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1000",
      "https://images.unsplash.com/photo-1553005746-5bcd94a1b7ec?q=80&w=1000"
    ],
    facilityId: "facility606",
    facilityName: "Nhà thi đấu Quận 4",
    location: "606 Hoàng Diệu, Quận 4, TP.HCM",
    date: "2023-12-10",
    startTime: "19:00",
    endTime: "21:00",
    playmateSearchType: "GROUP",
    requiredSkillLevel: "INTERMEDIATE",
    requiredParticipants: 6,
    maximumParticipants: 12,
    currentParticipants: 2,
    genderPreference: "ANY",
    status: "ACTIVE",
    costType: "PER_PERSON",
    price: 60000,
    costDetails: "Chi phí thuê sân và trang phục đồng bộ",
    communicationDescription: "Sẽ lập nhóm chat để trao đổi",
    createdAt: "2023-11-02T09:40:00Z",
    updatedAt: "2023-11-02T09:40:00Z"
  },
  {
    id: 10,
    userId: "user111",
    userInfo: {
      name: "Mai Văn M",
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
      gender: "male",
      age: 31,
      phoneNumber: "0987654332",
      email: "maivanm@example.com"
    },
    sportId: 9,
    sportName: "Đạp xe",
    title: "Tìm nhóm đạp xe cuối tuần",
    description: "Mình mới chuyển đến TP.HCM và đang tìm nhóm đạp xe cùng khám phá những cung đường đẹp vào cuối tuần.",
    image: [
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1000",
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000",
      "https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?q=80&w=1000"
    ],
    location: "Quận 2, TP.HCM",
    date: "2023-12-16",
    startTime: "05:00",
    endTime: "09:00",
    playmateSearchType: "GROUP",
    requiredSkillLevel: "INTERMEDIATE",
    requiredParticipants: 3,
    maximumParticipants: 10,
    currentParticipants: 1,
    genderPreference: "ANY",
    status: "ACTIVE",
    costType: "FREE",
    communicationDescription: "Liên hệ qua Strava hoặc nhóm Facebook",
    createdAt: "2023-11-03T16:50:00Z",
    updatedAt: "2023-11-03T16:50:00Z"
  }
];

