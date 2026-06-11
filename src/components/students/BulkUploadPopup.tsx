import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { bulkEnrollStudents } from "../../store/slices/students";
import { fetchCourses } from "../../store/slices/course";
import axiosInstance from "../../services/axiosConfig";
import { X } from "lucide-react";

interface EnrollStudentPopupProps {
  open: boolean;
  onClose: () => void;
  studentId?: string;
}

interface CoursePlan {
  _id: string;
  name: string;
  price?: number;
  durationType?: string;
  duration?: number;
}

/**
 * Course + plan dropdown pair. Owns the plan list for the chosen course
 * (GET /course-plans?courseId=...). Used for both the primary course and the
 * optional secondary course so the two selectors share one code path.
 */
const CoursePlanPicker: React.FC<{
  idPrefix: string;
  courses: any[];
  courseId: string;
  planId: string;
  onCourseChange: (id: string) => void;
  onPlanChange: (id: string) => void;
  disabled?: boolean;
  required?: boolean;
}> = ({ idPrefix, courses, courseId, planId, onCourseChange, onPlanChange, disabled, required }) => {
  const [plans, setPlans] = useState<CoursePlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);

  // Load the plans for the chosen course. Clearing the selected plan on course
  // change keeps the parent's planId from pointing at a plan of another course.
  useEffect(() => {
    onPlanChange("");
    setPlans([]);
    if (!courseId) return;
    let cancelled = false;
    setPlansLoading(true);
    (async () => {
      try {
        const res = await axiosInstance.get(`/course-plans?courseId=${courseId}`);
        if (!cancelled) setPlans(res.data?.data || []);
      } catch {
        if (!cancelled) setPlans([]);
      } finally {
        if (!cancelled) setPlansLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // onPlanChange is intentionally excluded: only re-run when the course changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  return (
    <>
      <div className="space-y-2">
        <label
          htmlFor={`${idPrefix}-course-select`}
          className="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Course
        </label>
        <select
          id={`${idPrefix}-course-select`}
          className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
          value={courseId}
          onChange={(e) => onCourseChange(e.target.value)}
          required={required}
          disabled={disabled}
        >
          <option value="">Select a course</option>
          {courses.map((c: any) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label
          htmlFor={`${idPrefix}-plan-select`}
          className="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Course Plan
        </label>
        <select
          id={`${idPrefix}-plan-select`}
          className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
          value={planId}
          onChange={(e) => onPlanChange(e.target.value)}
          required={required}
          disabled={disabled || !courseId || plansLoading}
        >
          <option value="">
            {!courseId
              ? "Select a course first"
              : plansLoading
              ? "Loading plans..."
              : plans.length === 0
              ? "No plans found for this course"
              : "Select a plan"}
          </option>
          {plans.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
              {typeof p.price === "number" ? ` — ₹${p.price}` : ""}
              {p.duration && p.durationType ? ` (${p.duration} ${p.durationType})` : ""}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

const BulkUploadPopup: React.FC<EnrollStudentPopupProps> = ({
  open,
  onClose,
  studentId: _studentId,
}) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state: any) => state.students);
  const courseState = useAppSelector((state: any) => state.course);

  const [file, setFile] = useState<File | null>(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [accessExpiry, setAccessExpiry] = useState("");

  // Optional second course (the merged /enrollment/bulk-enroll can enroll into
  // a primary AND secondary course in one pass).
  const [enableSecondary, setEnableSecondary] = useState(false);
  const [secondaryCourse, setSecondaryCourse] = useState("");
  const [secondaryPlan, setSecondaryPlan] = useState("");
  const [secondaryAccessExpiry, setSecondaryAccessExpiry] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Courses for the dropdowns come from the shared course slice.
  const courses = courseState?.data?.courses || [];

  useEffect(() => {
    if (open) {
      dispatch(fetchCourses({ limit: 1000 }));
      setFile(null);
      setSelectedCourse("");
      setSelectedPlan("");
      setAccessExpiry("");
      setEnableSecondary(false);
      setSecondaryCourse("");
      setSecondaryPlan("");
      setSecondaryAccessExpiry("");
      setSubmitted(false);
      setLocalError(null);
      setSuccess(false);
    }
  }, [open, dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setLocalError(null);
    setSuccess(false);
    if (!file) {
      setLocalError("Please select an Excel file to upload.");
      return;
    }
    if (!selectedCourse) {
      setLocalError("Please select a course.");
      return;
    }
    if (!selectedPlan) {
      setLocalError("Please select a course plan.");
      return;
    }
    if (enableSecondary && (!secondaryCourse || !secondaryPlan)) {
      setLocalError("Please select a course and plan for the second course, or disable it.");
      return;
    }
    if (enableSecondary && secondaryCourse === selectedCourse) {
      setLocalError("The second course must be different from the primary course.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("courseId", selectedCourse);
      formData.append("planId", selectedPlan);
      if (accessExpiry) {
        formData.append("accessExpiry", new Date(accessExpiry).toISOString());
      }
      if (enableSecondary) {
        formData.append("secondaryCourseId", secondaryCourse);
        formData.append("secondaryPlanId", secondaryPlan);
        if (secondaryAccessExpiry) {
          formData.append(
            "secondaryAccessExpiry",
            new Date(secondaryAccessExpiry).toISOString()
          );
        }
      }
      const result = await dispatch(bulkEnrollStudents(formData));
      if (result.meta.requestStatus === "fulfilled") {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
        window.location.reload();
      } else {
        setLocalError((result.payload as any) || "Bulk upload failed.");
      }
    } catch (err: any) {
      setLocalError(err.message || "Bulk upload failed.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md relative transform transition-all duration-300 scale-100 animate-in zoom-in-90 max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
          onClick={onClose}
          disabled={loading}
          aria-label="Close popup"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">
            Bulk Enroll Students
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <CoursePlanPicker
              idPrefix="bulk"
              courses={courses}
              courseId={selectedCourse}
              planId={selectedPlan}
              onCourseChange={setSelectedCourse}
              onPlanChange={setSelectedPlan}
              disabled={loading}
              required
            />
            <div className="space-y-2">
              <label
                htmlFor="bulk-access-expiry"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Access Expiry (optional)
              </label>
              <input
                id="bulk-access-expiry"
                type="date"
                value={accessExpiry}
                onChange={(e) => setAccessExpiry(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
                disabled={loading}
              />
            </div>

            {/* Optional second course */}
            <div className="space-y-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={enableSecondary}
                  onChange={(e) => setEnableSecondary(e.target.checked)}
                  disabled={loading}
                />
                Also enroll into a second course
              </label>
              {enableSecondary && (
                <>
                  <CoursePlanPicker
                    idPrefix="bulk-secondary"
                    courses={courses}
                    courseId={secondaryCourse}
                    planId={secondaryPlan}
                    onCourseChange={setSecondaryCourse}
                    onPlanChange={setSecondaryPlan}
                    disabled={loading}
                    required
                  />
                  <div className="space-y-2">
                    <label
                      htmlFor="bulk-secondary-access-expiry"
                      className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Second Course Access Expiry (optional)
                    </label>
                    <input
                      id="bulk-secondary-access-expiry"
                      type="date"
                      value={secondaryAccessExpiry}
                      onChange={(e) => setSecondaryAccessExpiry(e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
                      disabled={loading}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="bulk-upload-file"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Upload File (Excel .xlsx / .xls)
              </label>
              <input
                id="bulk-upload-file"
                type="file"
                accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
                onChange={handleFileChange}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The sheet must contain an <span className="font-medium">email</span> column
                (a <span className="font-medium">phone</span> column is optional).
              </p>
            </div>
            {localError && submitted && (
              <div
                id="error-message"
                className="bg-red-50 text-red-700 rounded-lg p-3 text-sm animate-in fade-in"
                role="alert"
              >
                {localError}
              </div>
            )}
            {success && (
              <div
                id="success-message"
                className="bg-green-50 text-green-700 rounded-lg p-3 text-sm animate-in fade-in"
                role="status"
              >
                Students enrolled successfully!
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                Bulk Enroll
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadPopup;
