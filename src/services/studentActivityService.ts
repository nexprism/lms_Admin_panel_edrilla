import axiosInstance from './axiosConfig';

/**
 * Fetch forum posts (threads) created by a specific user
 * @param userId - User ID
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Promise with forum posts data
 */
export const getStudentForumPosts = async (userId: string, page: number = 1, limit: number = 10) => {
  try {
    // Admin-gated backend route: GET /admin/students/:id/forum-posts
    // Returns { success, message, data: ForumThread[], total, page, limit, totalPages }
    const response = await axiosInstance.get(`/admin/students/${userId}/forum-posts`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching student forum posts:", error);
    throw error;
  }
};

/**
 * Fetch forum replies made by a specific user
 * @param userId - User ID
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Promise with forum replies data
 */
export const getStudentForumReplies = async (userId: string, page: number = 1, limit: number = 10) => {
  try {
    // Admin-gated backend route: GET /admin/students/:id/forum-replies
    // Returns { success, message, data: ForumReply[], total, page, limit, totalPages }
    const response = await axiosInstance.get(`/admin/students/${userId}/forum-replies`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching student forum replies:", error);
    return { data: [], total: 0, page: 1, totalPages: 0 };
  }
};

/**
 * Fetch job posts created by a specific user
 * @param userId - User ID
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Promise with job posts data
 */
export const getStudentJobPosts = async (userId: string, page: number = 1, limit: number = 10) => {
  try {
    // Admin-gated backend route: GET /admin/students/:id/job-posts
    // Returns { success, message, data: JobPosting[], total, page, limit, totalPages }
    const response = await axiosInstance.get(`/admin/students/${userId}/job-posts`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching student job posts:", error);
    throw error;
  }
};

