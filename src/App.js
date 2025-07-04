import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ScrollOnTop from './setting/ScrollOnTop';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import StudentLayout from './layouts/StudentLayout';
import TeacherLayout from './layouts/TeacherLayout';
import ProtectedRoute from './ProtectedRoute';

// Teacher Routes
import TeacherDashboard from './components/teacher/TeacherDashboard';
import TeacherAddCourse from './components/teacher/TeacherAddCourse';
import TeacherCourseDetail from './components/teacher/TeacherCourseDetail';
import TeacherAddLesson from './components/teacher/TeacherAddLesson';
import TeacherAddQuiz from './components/teacher/TeacherAddQuiz';
import TeacherAddMaterial from './components/teacher/TeacherAddMaterial';
import CourseManagementPage from './components/teacher/CourseManagementPage';
import AddStudentsPage from './components/teacher/AddStudentsPage';
import TeacherGroup from './components/teacher/TeacherGroup';
import TeacherGroupDetail from './components/teacher/TeacherGroupDetail';
import AddStudentsGroup from './components/teacher/AddStudentsGroup';
import CreateTask from './components/teacher/CreateTask';
import TeacherTaskDetail from './components/teacher/TeacherTaskDetail';
import TestResultDetail from './components/teacher/TestResultDetail';
import TeacherInfo from './components/teacher/TeacherInfo';
import TeacherDocuments from './components/teacher/TeacherDocuments';
import ManageDocument from './components/teacher/ManageDocument';
import TeacherCourseContent from './components/teacher/TeacherCourseContent';

// Student Routes
import CoursesPage from './components/student/CoursesPage';
import CourseDetailPage from './components/student/CourseDetailPage';
import LearningPage from './components/student/LearningPage';
import ChatboxPage from './components/student/ChatboxPage';
import StudentInfo from './components/student/StudentInfo';
import GroupPage from './components/student/GroupPage';
import GroupDetailPage from './components/student/GroupDetailPage';
import TaskDetail from './components/student/TaskDetail';
import DocumentsPage from './components/student/DocumentsPage';
import MajorDocuments from './components/student/MajorDocuments';
import PaymentSuccess from './components/student/PaymentSuccess';
import PaymentCancel from './components/student/PaymentCancel';

// Common Routes
import Header from './components/Header';
import Hero from './components/Hero';
import PopularCourses from './components/PopularCourses';
import FreeCoursesSignup from './components/FreeCoursesSignup';
import Footer from './components/Footer';
import './App.css';
import './assets/css/payment.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollOnTop />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        <Routes>
          {/* Trang chính (dùng layout chung hoặc sinh viên) */}
          <Route path="/" element={
            <>
              <Header />
              <Hero />
              <PopularCourses />
              <FreeCoursesSignup />
              <Footer />
            </>
          } />

          {/* Các route dành cho sinh viên */}
          <Route path="/courses" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout>
                <CoursesPage />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/courses/:id" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout>
                <CourseDetailPage />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/courses/detail/:slug" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout>
                <CourseDetailPage />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/learning/:id" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
                <LearningPage />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout>
                <ChatboxPage />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout>
                <StudentInfo />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/groups" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout>
                <GroupPage />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/groups/:id" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout>
                <GroupDetailPage />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/groups/tests/:id" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout>
                <TaskDetail />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/documents" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout>
                <DocumentsPage />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/documents/:majorId" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout>
                <MajorDocuments />
              </StudentLayout>
            </ProtectedRoute>
          } />
          
          {/* PayPal payment routes */}
          <Route path="/paypal/success" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout>
                <PaymentSuccess />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/paypal/cancel" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout>
                <PaymentCancel />
              </StudentLayout>
            </ProtectedRoute>
          } />

          {/* Các route dành riêng cho giảng viên */}
          <Route path="/teacher/dashboard" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <TeacherDashboard />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/add-course" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <TeacherAddCourse />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/course" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <TeacherCourseDetail />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/add-lesson" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <TeacherAddLesson />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/add-quiz" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <TeacherAddQuiz />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/add-material" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <TeacherAddMaterial />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/course-management/:courseId" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <CourseManagementPage />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/course-content/:courseId" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
                <TeacherCourseContent />
            </ProtectedRoute>
          } />
          <Route path="/teacher/course/:courseId/add-students" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <AddStudentsPage />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/groups" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <TeacherGroup />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/groups/:id" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <TeacherGroupDetail />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/groups/:id/add-students" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <AddStudentsGroup />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/groups/:id/create-task" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <CreateTask />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/groups/:id/edit-test/:testId" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <CreateTask />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/groups/:id/tests/:testId" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <TeacherTaskDetail />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/test-results/:id" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <TestResultDetail />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/chat" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <ChatboxPage />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/profile" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <TeacherInfo />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/documents" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <TeacherDocuments />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/documents/manage/:majorId" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLayout>
                <ManageDocument />
              </TeacherLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
