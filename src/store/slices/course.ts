import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface CourseState {
  loading: boolean;
  error: string | null;
  // `data` holds either the paginated list (from fetchCourses) or the single
  // course (from fetchCourseById). Attachments and enrollments now live in
  // their own slots so they no longer clobber whatever `data` currently holds.
  data: any;
  attachments: any[];
  enrollments: any[];
}

const initialState: CourseState = {
  loading: false,
  error: null,
  data: null,
  attachments: [],
  enrollments: [],
};

export const createCourse = createAsyncThunk(
  "course/createCourse",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      // The real instructorId is supplied by the AddCourse form state (or the
      // backend falls back to req.user._id when empty). Do not overwrite it.
      const response = await axiosInstance.post("/courses/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

interface PaginationData {
  courses: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const fetchCourses = createAsyncThunk<
  PaginationData,
  { page?: number; limit?: number; search?: string; isPublished?: boolean } | undefined
>(
  "course/fetchCourses",
  async (params = {}, { rejectWithValue: _rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, search, isPublished } = params;
      const requestParams: Record<string, unknown> = { page, limit };
      if (search && search.trim() !== "") {
        requestParams.search = search.trim();
      }
      if (typeof isPublished === "boolean") {
        requestParams.isPublished = isPublished;
      }
      const response = await axiosInstance.get("/courses/", {
        params: requestParams,
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = response.data?.data;
      return {
        courses: data?.data || [],
        total: data?.total || 0,
        page: data?.page || 1,
        limit: data?.limit || 10,
        totalPages: data?.totalPages || 0,
      };
    } catch (error: any) {
      console.error('Fetch courses error:', error);
      // Return empty data instead of rejecting to prevent blocking the form
      return {
        courses: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  "course/fetchCourseById",
  async (
    { courseId, token: _token }: { courseId: string; token: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(
        `/courses/${courseId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      return response.data?.data?.course;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCourse = createAsyncThunk(
  "course/updateCourse",
  async ({ id, data }: { id: string; data: FormData }, { rejectWithValue }) => {
    try {
      // The real instructorId is supplied by the EditCourse form state
      // (populated from course.instructorId || course.instructor?._id). Do not
      // overwrite it with a hardcoded id, which would silently reassign course
      // ownership on every edit.
      const response = await axiosInstance.put(`/courses/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);



export const fetchCourseAttachments = createAsyncThunk(
  "course/fetchCourseAttachments",
  async (
    { courseId, type }: { courseId: string; type: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(
        `/courses/${courseId}/attachments`,
        {
          params: { type },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data?.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCourseEnrollments = createAsyncThunk<
  any,
  { courseId: string },
  { rejectValue: string }
>("course/fetchCourseEnrollments", async ({ courseId }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token") || "";
    const response = await axiosInstance.get(
      `/enrollment/courses/${courseId}/enrollments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data?.data || [];
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch enrollments");
  }
});

export const deleteCourse = createAsyncThunk(
  "course/deleteCourse",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") || "";
      const _response = await axiosInstance.delete(`/courses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return { id };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCourseAttachments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseAttachments.fulfilled, (state, action) => {
        state.loading = false;
        // Store attachments in their own slot so they don't mutate/clobber the
        // shared `data` field (which may hold the cached course list).
        state.attachments = action.payload;
      })
      .addCase(fetchCourseAttachments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCourseEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        // Store enrollments in their own slot so they don't mutate/clobber the
        // shared `data` field (which may hold the cached course list).
        state.enrollments = action.payload;
      })
      .addCase(fetchCourseEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
      // delete course
      builder
        .addCase(deleteCourse.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(deleteCourse.fulfilled, (state, action) => {
          state.loading = false;
          // remove course from cached list if present
          const id = action.payload?.id;
          if (state.data && Array.isArray(state.data.courses)) {
            state.data.courses = state.data.courses.filter((c: any) => c._id !== id);
            state.data.total = Math.max(0, (state.data.total || 0) - 1);
          }
        })
        .addCase(deleteCourse.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        });
      
  },
});

export default courseSlice.reducer;

// Selector to get all courses (array)
export const getAllCourses = (state: any) =>
  state.course?.data?.courses || [];
