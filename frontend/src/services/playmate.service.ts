import { PlaymateSearch, PlaymateApplication, SkillLevel, PlaymateSearchType, PlaymateStatus, PlaymateFormData } from "@/types/playmate.type";
import { mockPlaymateSearches, mockPlaymateApplications } from "@/mocks/playmate/playmate.mock";

// Flag để chuyển đổi giữa mock data và API thực tế
const USE_MOCK = true;

// ----- PLAYMATE SEARCH SERVICES -----

/**
 * Lấy danh sách tất cả các bài đăng tìm bạn chơi
 */
export const getAllPlaymateSearches = async (): Promise<PlaymateSearch[]> => {
  if (USE_MOCK) {
    // Sử dụng mock data
    return Promise.resolve(mockPlaymateSearches);
  } else {
    // Sử dụng API thực tế
    try {
      const response = await fetch('/api/playmate/searches');
      if (!response.ok) throw new Error('Failed to fetch playmate searches');
      return await response.json();
    } catch (error) {
      console.error('Error fetching playmate searches:', error);
      throw error;
    }
  }
};

/**
 * Lấy chi tiết của một bài đăng tìm bạn chơi theo ID
 */
export const getPlaymateSearchById = async (id: number): Promise<PlaymateSearch | undefined> => {
  if (USE_MOCK) {
    // Sử dụng mock data
    const search = mockPlaymateSearches.find(search => search.id === id);
    return Promise.resolve(search);
  } else {
    // Sử dụng API thực tế
    try {
      const response = await fetch(`/api/playmate/searches/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch playmate search with id ${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching playmate search with id ${id}:`, error);
      throw error;
    }
  }
};

/**
 * Lấy danh sách các bài đăng của người dùng hiện tại
 */
export const getUserPlaymateSearches = async (userId: string): Promise<PlaymateSearch[]> => {
  if (USE_MOCK) {
    // Sử dụng mock data
    const userSearches = mockPlaymateSearches.filter(search => search.userId === userId);
    return Promise.resolve(userSearches);
  } else {
    // Sử dụng API thực tế
    try {
      const response = await fetch(`/api/playmate/searches/user/${userId}`);
      if (!response.ok) throw new Error(`Failed to fetch playmate searches for user ${userId}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching playmate searches for user ${userId}:`, error);
      throw error;
    }
  }
};

/**
 * Tạo bài đăng tìm bạn chơi mới
 */
export const createPlaymateSearch = async (formData: PlaymateFormData): Promise<PlaymateSearch> => {
  if (USE_MOCK) {
    // Sử dụng mock data - chỉ giả lập
    const newSearch: PlaymateSearch = {
      id: Math.max(...mockPlaymateSearches.map(s => s.id)) + 1,
      userId: 'current-user-id', // Giả định ID người dùng hiện tại
      userInfo: {
        name: 'Người dùng hiện tại', // Giả định tên người dùng hiện tại
      },
      sportId: formData.sportId,
      sportName: 'Mock Sport', // Giả định tên môn thể thao
      title: formData.title,
      description: formData.description,
      image: formData.image ? ['https://example.com/image.jpg'] : undefined,
      requiredSkillLevel: formData.requiredSkillLevel.includes('ANY') ? 'ANY' : formData.requiredSkillLevel[0],
      facilityId: formData.facilityId,
      facilityName: 'Mock Facility', // Giả định tên cơ sở
      location: formData.location,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      applicationDeadline: formData.applicationDeadline,
      communicationDescription: formData.communicationDescription,
      playmateSearchType: formData.searchType, // Chuyển đổi từ searchType
      requiredParticipants: formData.requiredParticipants,
      maximumParticipants: formData.maximumParticipants,
      currentParticipants: 1, // Mặc định là 1 (người tạo)
      genderPreference: formData.genderPreference,
      price: formData.price,
      costType: formData.costType,
      costMale: formData.costMale,
      costFemale: formData.costFemale,
      costDetails: formData.costDetails,
      status: 'ACTIVE', // Mặc định là ACTIVE
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      applications: []
    };
    return Promise.resolve(newSearch);
  } else {
    // Sử dụng API thực tế
    try {
      // Chuyển đổi từ FormData sang định dạng API cần
      const apiData = {
        ...formData,
        requiredSkillLevel: formData.requiredSkillLevel.includes('ANY') ? 'ANY' : formData.requiredSkillLevel[0],
        playmateSearchType: formData.searchType
      };
      
      const response = await fetch('/api/playmate/searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      if (!response.ok) throw new Error('Failed to create playmate search');
      return await response.json();
    } catch (error) {
      console.error('Error creating playmate search:', error);
      throw error;
    }
  }
};

/**
 * Cập nhật thông tin bài đăng tìm bạn chơi
 */
export const updatePlaymateSearch = async (id: number, playmateSearch: Partial<PlaymateSearch>): Promise<PlaymateSearch> => {
  if (USE_MOCK) {
    // Sử dụng mock data - chỉ giả lập
    const searchIndex = mockPlaymateSearches.findIndex(search => search.id === id);
    if (searchIndex === -1) {
      throw new Error(`Playmate search with id ${id} not found`);
    }
    
    const updatedSearch: PlaymateSearch = {
      ...mockPlaymateSearches[searchIndex],
      ...playmateSearch,
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(updatedSearch);
  } else {
    // Sử dụng API thực tế
    try {
      const response = await fetch(`/api/playmate/searches/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playmateSearch),
      });
      if (!response.ok) throw new Error(`Failed to update playmate search with id ${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error updating playmate search with id ${id}:`, error);
      throw error;
    }
  }
};

/**
 * Xóa bài đăng tìm bạn chơi
 */
export const deletePlaymateSearch = async (id: number): Promise<boolean> => {
  if (USE_MOCK) {
    // Sử dụng mock data - chỉ giả lập
    console.log(`Deleting search with ID: ${id}`);
    return Promise.resolve(true);
  } else {
    // Sử dụng API thực tế
    try {
      const response = await fetch(`/api/playmate/searches/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Failed to delete playmate search with id ${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting playmate search with id ${id}:`, error);
      throw error;
    }
  }
};

/**
 * Lọc bài đăng theo môn thể thao
 */
export const filterPlaymateSearchesBySport = async (sportId: number | null): Promise<PlaymateSearch[]> => {
  if (USE_MOCK) {
    // Sử dụng mock data
    if (!sportId) return Promise.resolve(mockPlaymateSearches);
    const filtered = mockPlaymateSearches.filter(search => search.sportId === sportId);
    return Promise.resolve(filtered);
  } else {
    // Sử dụng API thực tế
    try {
      const url = sportId ? `/api/playmate/searches?sportId=${sportId}` : '/api/playmate/searches';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch filtered playmate searches');
      return await response.json();
    } catch (error) {
      console.error('Error fetching filtered playmate searches:', error);
      throw error;
    }
  }
};

/**
 * Lọc bài đăng theo trình độ kỹ năng
 */
export const filterPlaymateSearchesBySkillLevel = async (skillLevel: SkillLevel | null): Promise<PlaymateSearch[]> => {
  if (USE_MOCK) {
    // Sử dụng mock data
    if (!skillLevel) return Promise.resolve(mockPlaymateSearches);
    const filtered = mockPlaymateSearches.filter(search => search.requiredSkillLevel === skillLevel);
    return Promise.resolve(filtered);
  } else {
    // Sử dụng API thực tế
    try {
      const url = skillLevel ? `/api/playmate/searches?skillLevel=${skillLevel}` : '/api/playmate/searches';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch filtered playmate searches');
      return await response.json();
    } catch (error) {
      console.error('Error fetching filtered playmate searches:', error);
      throw error;
    }
  }
};

/**
 * Lọc bài đăng theo loại tìm kiếm (cá nhân/nhóm)
 */
export const filterPlaymateSearchesBySearchType = async (searchType: PlaymateSearchType | null): Promise<PlaymateSearch[]> => {
  if (USE_MOCK) {
    // Sử dụng mock data
    if (!searchType) return Promise.resolve(mockPlaymateSearches);
    const filtered = mockPlaymateSearches.filter(search => search.playmateSearchType === searchType);
    return Promise.resolve(filtered);
  } else {
    // Sử dụng API thực tế
    try {
      const url = searchType ? `/api/playmate/searches?searchType=${searchType}` : '/api/playmate/searches';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch filtered playmate searches');
      return await response.json();
    } catch (error) {
      console.error('Error fetching filtered playmate searches:', error);
      throw error;
    }
  }
};

/**
 * Lọc bài đăng theo trạng thái
 */
export const filterPlaymateSearchesByStatus = async (status: PlaymateStatus | null): Promise<PlaymateSearch[]> => {
  if (USE_MOCK) {
    // Sử dụng mock data
    if (!status) return Promise.resolve(mockPlaymateSearches);
    const filtered = mockPlaymateSearches.filter(search => search.status === status);
    return Promise.resolve(filtered);
  } else {
    // Sử dụng API thực tế
    try {
      const url = status ? `/api/playmate/searches?status=${status}` : '/api/playmate/searches';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch filtered playmate searches');
      return await response.json();
    } catch (error) {
      console.error('Error fetching filtered playmate searches:', error);
      throw error;
    }
  }
};

// ----- PLAYMATE APPLICATION SERVICES -----

/**
 * Lấy danh sách đơn đăng ký của người dùng hiện tại
 */
export const getUserApplications = async (userId: string): Promise<PlaymateApplication[]> => {
  if (USE_MOCK) {
    // Sử dụng mock data
    const userApplications = mockPlaymateApplications.filter(app => app.userId === userId);
    
    // Kết hợp với thông tin bài đăng cho frontend
    const extendedApplications = userApplications.map(app => {
      const relatedSearch = mockPlaymateSearches.find(search => search.id === app.playmateSearchId);
      return {
        ...app,
        search: relatedSearch
      };
    });
    
    return Promise.resolve(extendedApplications as unknown as PlaymateApplication[]);
  } else {
    // Sử dụng API thực tế
    try {
      const response = await fetch(`/api/playmate/applications/user/${userId}`);
      if (!response.ok) throw new Error(`Failed to fetch applications for user ${userId}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching applications for user ${userId}:`, error);
      throw error;
    }
  }
};

/**
 * Lấy danh sách đơn đăng ký cho một bài đăng cụ thể
 */
export const getApplicationsForSearch = async (searchId: number): Promise<PlaymateApplication[]> => {
  if (USE_MOCK) {
    // Sử dụng mock data
    const applications = mockPlaymateApplications.filter(app => app.playmateSearchId === searchId);
    return Promise.resolve(applications);
  } else {
    // Sử dụng API thực tế
    try {
      const response = await fetch(`/api/playmate/searches/${searchId}/applications`);
      if (!response.ok) throw new Error(`Failed to fetch applications for search ${searchId}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching applications for search ${searchId}:`, error);
      throw error;
    }
  }
};

/**
 * Tạo đơn đăng ký mới
 */
export const createApplication = async (
  application: Omit<PlaymateApplication, 'id' | 'status' | 'createdAt' | 'reviewedAt' | 'rejectionReason'>
): Promise<PlaymateApplication> => {
  if (USE_MOCK) {
    // Sử dụng mock data - chỉ giả lập
    const newApplication: PlaymateApplication = {
      ...application,
      id: Math.floor(Math.random() * 1000) + 100,
      status: "PENDING",
      createdAt: new Date().toISOString()
    };
    
    return Promise.resolve(newApplication);
  } else {
    // Sử dụng API thực tế
    try {
      const response = await fetch('/api/playmate/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(application),
      });
      if (!response.ok) throw new Error('Failed to create application');
      return await response.json();
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }
};

/**
 * Chấp nhận đơn đăng ký
 */
export const acceptApplication = async (applicationId: number): Promise<boolean> => {
  if (USE_MOCK) {
    // Sử dụng mock data - chỉ giả lập
    console.log(`Accepting application with ID: ${applicationId}`);
    return Promise.resolve(true);
  } else {
    // Sử dụng API thực tế
    try {
      const response = await fetch(`/api/playmate/applications/${applicationId}/accept`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error(`Failed to accept application with id ${applicationId}`);
      return true;
    } catch (error) {
      console.error(`Error accepting application with id ${applicationId}:`, error);
      throw error;
    }
  }
};

/**
 * Từ chối đơn đăng ký
 */
export const rejectApplication = async (applicationId: number, reason: string): Promise<boolean> => {
  if (USE_MOCK) {
    // Sử dụng mock data - chỉ giả lập
    console.log(`Rejecting application with ID: ${applicationId}, reason: ${reason}`);
    return Promise.resolve(true);
  } else {
    // Sử dụng API thực tế
    try {
      const response = await fetch(`/api/playmate/applications/${applicationId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error(`Failed to reject application with id ${applicationId}`);
      return true;
    } catch (error) {
      console.error(`Error rejecting application with id ${applicationId}:`, error);
      throw error;
    }
  }
};

/**
 * Hủy đơn đăng ký (người đăng ký tự hủy)
 */
export const cancelApplication = async (applicationId: number): Promise<boolean> => {
  if (USE_MOCK) {
    // Sử dụng mock data - chỉ giả lập
    console.log(`Cancelling application with ID: ${applicationId}`);
    return Promise.resolve(true);
  } else {
    // Sử dụng API thực tế
    try {
      const response = await fetch(`/api/playmate/applications/${applicationId}/cancel`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error(`Failed to cancel application with id ${applicationId}`);
      return true;
    } catch (error) {
      console.error(`Error cancelling application with id ${applicationId}:`, error);
      throw error;
    }
  }
};