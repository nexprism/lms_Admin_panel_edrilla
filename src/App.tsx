import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import React from "react";
import { lazy, Suspense, useState } from "react";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "./store/slices/authslice";

// Critical path — kept eager: auth pages, route guard, layout shell and the
// dashboard (first page after login) so they render without a lazy roundtrip.
import ProtectedRoute from "./components/common/ProtectedRoute";
import { ScrollToTop } from "./components/common/ScrollToTop";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Dashboard/Home";

// Everything else is lazy-loaded so each page lands in its own chunk and the
// main bundle stays small. All components below are default exports.
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));

const AddFilter = lazy(() => import("./components/filters/AddFilter"));
const FilterList = lazy(() => import("./components/filters/FilterList"));
const AddCourse = lazy(() => import("./pages/courses/AddCourse"));
const CourseList = lazy(() => import("./pages/courses/CourseList"));
const EditCourse = lazy(() => import("./pages/courses/EditCourse"));
const AddBundle = lazy(() => import("./pages/bundles/AddBundle"));
const BundleList = lazy(() => import("./pages/bundles/bundleList"));
const EditBundleForm = lazy(() => import("./pages/bundles/EditBundle"));
const QuizList = lazy(() => import("./pages/Quiz/QuizList"));
const AssignmentList = lazy(() => import("./pages/Assignmets/AssignmentList"));
const TextLessonPage = lazy(() => import("./pages/courses/TextLesson"));
const EditQuiz = lazy(() => import("./pages/courses/components/EditQuiz"));
const EditAssignmentForm = lazy(
  () => import("./pages/courses/components/EditAssignment")
);
const EditTextLessonEditor = lazy(
  () => import("./pages/courses/components/EditTextLesson")
);
const FileList = lazy(() => import("./pages/Files/FileList"));
const AddFile = lazy(() => import("./pages/courses/components/AddFile"));
const Session = lazy(() => import("./pages/Files/Session"));
const StudentList = lazy(() => import("./pages/students/StudenList"));
const StudentDetail = lazy(() => import("./pages/students/StudentDetail"));
const AssignmentSubmissionReview = lazy(
  () => import("./pages/Assignmets/AssignmentDetails")
);
const AssignmentPage = lazy(() => import("./pages/Assignmets/AssignmentPage"));
const HelpDesk = lazy(() => import("./pages/HelpDesk/RequestList"));
const TicketDetails = lazy(() => import("./pages/HelpDesk/TicketDetails"));
const CertificationList = lazy(
  () => import("./pages/Certification/CertificationList")
);
const EditCreateCertificateTemplate = lazy(
  () => import("./pages/Certification/EditeCertification")
);
const IssueCertification = lazy(
  () => import("./pages/Certification/IssueCertification")
);
const DeleteRequestsList = lazy(
  () => import("./pages/students/DeleteRequestsList")
);
const User = lazy(() => import("./pages/SalesAnalytics/User"));
const Course = lazy(() => import("./pages/SalesAnalytics/Course"));
const Bundel = lazy(() => import("./pages/SalesAnalytics/Bundel"));
const Project = lazy(() => import("./pages/Files/Project"));
const QueryList = lazy(() => import("./pages/Query/QueryList"));
const Coupons = lazy(() => import("./pages/coupons/Coupons"));
const CreateCoupon = lazy(() => import("./pages/coupons/CreateCoupon"));
const EditCoupon = lazy(() => import("./pages/coupons/EditCoupon"));
const ForumThreadList = lazy(() => import("./pages/Forum/ForumThreadList"));
const DeviceApprovals = lazy(() => import("./pages/DeviceApprovals"));
const ForumDetails = lazy(() => import("./pages/Forum/ForumDetails"));
const EditForumThread = lazy(() => import("./pages/Forum/EditForumThread"));
const AddEvent = lazy(() => import("./pages/Events/AddEvent"));
const EventList = lazy(() => import("./pages/Events/EventList"));
const EditEvent = lazy(() => import("./pages/Events/EditEvent"));
const AddJob = lazy(() => import("./pages/Jobs/AddJob"));
const JobList = lazy(() => import("./pages/Jobs/JobList"));
const EditJob = lazy(() => import("./pages/Jobs/EditJob"));
const TestimonialsPage = lazy(() => import("./pages/Testimonials"));
const AllBanners = lazy(() => import("./pages/Banner/AllBanners"));
const AddBanner = lazy(() => import("./pages/Banner/AddBanner"));
const EditBanner = lazy(() => import("./pages/Banner/EditBanner"));
const LeaderboardSetting = lazy(() => import("./pages/LeaderboardSetting"));
const NotificationDashboard = lazy(
  () => import("./pages/Notifications/NotificationDashboard")
);
const NotificationList = lazy(
  () => import("./pages/Notifications/NotificationList")
);
const NewsList = lazy(() => import("./pages/News/NewsList"));
const AddNews = lazy(() => import("./pages/News/AddNews"));
const EditNews = lazy(() => import("./pages/News/EditNews"));
const ViewNews = lazy(() => import("./pages/News/ViewNews"));
const ManageQuestions = lazy(
  () => import("./pages/PersonalityTest/ManageQuestions")
);
const ChatPage = lazy(() => import("./pages/Chat/ChatPage"));
const AITool = lazy(() => import("./pages/AITool/AITool"));
const SecurityIncidents = lazy(() => import("./pages/Security/Incidents"));
const ZoomMeetings = lazy(() => import("./pages/LiveClasses/ZoomMeetings"));

const UserProfiles = lazy(() => import("./pages/UserProfiles"));
const Videos = lazy(() => import("./pages/UiElements/Videos"));
const Images = lazy(() => import("./pages/UiElements/Images"));
const Alerts = lazy(() => import("./pages/UiElements/Alerts"));
const Badges = lazy(() => import("./pages/UiElements/Badges"));
const Avatars = lazy(() => import("./pages/UiElements/Avatars"));
const Buttons = lazy(() => import("./pages/UiElements/Buttons"));
const LineChart = lazy(() => import("./pages/Charts/LineChart"));
const BarChart = lazy(() => import("./pages/Charts/BarChart"));
const Calendar = lazy(() => import("./pages/Calendar"));
const BasicTables = lazy(() => import("./pages/Tables/BasicTables"));
const FormElements = lazy(() => import("./pages/Forms/FormElements"));
const AddCategory = lazy(() => import("./pages/AddCategory"));
const CategoryList = lazy(() => import("./pages/CategoryList"));
const AddReporter = lazy(() => import("./pages/Reporters/AddReporter"));
const CreateCertificateTemplate = lazy(
  () => import("./pages/Certification/CreateCertificateTemplate")
);

// Minimal centered spinner, consistent with the app's existing loaders
// (e.g. the dashboard loading state in pages/Dashboard/Home.tsx).
const routeFallback = (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
  </div>
);

// Simple modal wrapper for SignIn
function SignInModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        zIndex: 9999,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 32,
          minWidth: 350,
          boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <SignIn />
      </div>
    </div>
  );
}

export default function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [showSignIn, setShowSignIn] = useState(false);

  // Show popup if not authenticated and not on /signin or /signup
  // (You may want to refine this logic based on your routing needs)
  React.useEffect(() => {
    if (!isAuthenticated) {
      setShowSignIn(true);
    } else {
      setShowSignIn(false);
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={routeFallback}>
        <Routes>
          {/* Public Routes - Only accessible when NOT authenticated */}
          <Route
            path="/signin"
            element={
              !isAuthenticated ? <SignIn /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/signup"
            element={
              !isAuthenticated ? <SignUp /> : <Navigate to="/" replace />
            }
          />

          {/* Protected Routes - Only accessible when authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/add-category" element={<AddCategory />} />
              <Route path="/categories" element={<CategoryList />} />

              {/* Filters */}
              <Route path="/filters/add" element={<AddFilter />} />
              <Route path="/filters/all" element={<FilterList />} />

              <Route path="/event/add" element={<AddEvent />} />
              <Route path="/events" element={<EventList />} />
              <Route path="/events/edit/:id" element={<EditEvent />} />

              {/* Jobs */}
              <Route path="/jobs/add" element={<AddJob />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="/jobs/edit/:id" element={<EditJob />} />
              {/* Courses */}
              <Route path="/courses/add" element={<AddCourse />} />
              <Route path="/courses/all/courses" element={<CourseList />} />
              <Route path="/courses/edit/:courseId" element={<EditCourse />} />
              <Route
                path="/courses/all/text-courses"
                element={<TextLessonPage />}
              />
              <Route
                path="/courses/text-courses/:lessonId"
                element={
                  // @ts-ignore - component props are untyped legacy code
                  <EditTextLessonEditor />
                }
              />


              <Route path="/reporters/add" element={<AddReporter />} />

              {/* Bundles */}
              <Route path="/bundles/create" element={<AddBundle />} />
              <Route path="/bundles/all" element={<BundleList />} />
              <Route path="/bundles/:bundleId" element={<EditBundleForm />} />

              {/* Quiz */}
              <Route path="/quiz/all" element={<QuizList />} />
              <Route path="/quiz/edit/:quizId" element={
                // @ts-ignore - component props are untyped legacy code
                <EditQuiz />
              } />

              {/* Assignments */}
              <Route path="/assignments/all" element={<AssignmentList />} />
              <Route path="/assignments/:assignmentId" element={<AssignmentPage />} />
              <Route
                path="/assignments/edit/:assignmentId"
                element={
                  // @ts-ignore - component props are untyped legacy code
                  <EditAssignmentForm />
                }
              />
              <Route
                path="/assignments/submissions"
                element={<AssignmentList />}
              />
              <Route
                path="/assignments/submissions/:id"
                element={<AssignmentSubmissionReview />}
              />

              <Route path="/forum" element={<ForumThreadList />} />
              <Route path="/forum/create" element={<EditForumThread />} />
              <Route path="/forum/:threadId" element={<ForumDetails />} />
              <Route path="/forum/edit/:threadId" element={<EditForumThread />} />

              {/* Support Tickets */}
              <Route
                path="/support-tickets/view/:ticketId"
                element={<TicketDetails isEditMode={false} />}
              />
              <Route
                path="/support-tickets/edit/:ticketId"
                element={<TicketDetails isEditMode={true} />}
              />
              <Route path="/requests" element={<HelpDesk />} />

              {/* Certificates */}
              <Route
                path="/certificates-template/add"
                element={<CreateCertificateTemplate />}
              />
              <Route
                path="/certificates-template/all"
                element={<CertificationList />}
              />
              <Route
                path="/certificates-template/edit/:certificateId"
                element={<EditCreateCertificateTemplate />}
              />
              <Route
                path="/certificates/issue"
                element={<IssueCertification />}

              />

              {/* Coupons */}
              <Route path="/coupons" element={<Navigate to="/coupons/all" replace />} />
              <Route path="/coupons/all" element={<Coupons />} />
              <Route path="/coupons/add" element={<CreateCoupon />} />
              <Route path="/coupons/edit/:couponId" element={<EditCoupon />} />

              {/* Files */}
              <Route path="/files/all" element={<FileList />} />
              <Route path="/files/add" element={
                // @ts-ignore - component props are untyped legacy code
                <AddFile />
              } />
              <Route path="/files/sessions" element={<Session />} />
              <Route path="/files/projects" element={<Project />} />

              {/* Students */}
              <Route path="/students/all" element={<StudentList />} />
              <Route path="/students/:studentId" element={<StudentDetail />} />
              <Route path="/students/delete-requests" element={<DeleteRequestsList />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />


              <Route path="/banner" element={<AllBanners />} />
              <Route path="/banner/add" element={<AddBanner />} />
              <Route path="/banner/edit/:id" element={<EditBanner />} />

              {/* News */}
              <Route path="/news" element={<NewsList />} />
              <Route path="/news/add" element={<AddNews />} />
              <Route path="/news/view/:id" element={<ViewNews />} />
              <Route path="/news/edit/:id" element={<EditNews />} />

              {/* sales analytics */}
              <Route path="/sales/user" element={<User />} />
              <Route path="/sales/course" element={<Course />} />
              <Route path="/sales/bundle" element={<Bundel />} />

              {/* query */}
              <Route path="/queries/all" element={<QueryList />} />


              <Route path="/security/incidents" element={<SecurityIncidents />} />

              {/* User Profiles */}

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />


              {/* UI Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/send-notification" element={<NotificationDashboard />} />
              <Route path="/notification-history" element={<NotificationList />} />
              <Route path="/device-approvals" element={<DeviceApprovals />} />
              {/* Testimonials */}
              <Route path="/testimonials" element={<TestimonialsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/ai-tool" element={<AITool />} />
              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
              <Route path="/leaderboard-setting" element={<LeaderboardSetting />} />
              <Route path="/personality-test" element={<ManageQuestions />} />
              <Route path="/security-incidents" element={<SecurityIncidents />} />
              <Route path="/live-classes" element={<ZoomMeetings />} />
            </Route>
          </Route>

          {/* Redirect unauthenticated users to signup instead of signin */}
          <Route
            path="*"
            element={
              !isAuthenticated ? (
                <Navigate to="/signup" replace />
              ) : (
                <NotFound />
              )
            }
          />
        </Routes>
        {/* SignIn Popup */}
        <SignInModal open={showSignIn && window.location.pathname !== "/signin" && window.location.pathname !== "/signup"} onClose={() => setShowSignIn(false)} />
      </Suspense>
    </Router>
  );
}
