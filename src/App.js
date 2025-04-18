import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ScrollOnTop from './setting/ScrollOnTop';

import StudentLayout from './layouts/StudentLayout';
import TeacherLayout from './layouts/TeacherLayout';
import ProtectedRoute from './ProtectedRoute';

import Header from './components/Header';
import Hero from './components/Hero';
import PopularCourses from './components/PopularCourses';
import FreeCoursesSignup from './components/FreeCoursesSignup';
import Footer from './components/Footer';
import CoursesPage from './components/student/CoursesPage';
import CourseDetailPage from './components/student/CourseDetailPage';
import LearningPage from './components/student/LearningPage';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import TeacherAddCourse from './components/teacher/TeacherAddCourse';
import TeacherCourseDetail from './components/teacher/TeacherCourseDetail';
import TeacherAddLesson from './components/teacher/TeacherAddLesson';
import TeacherAddQuiz from './components/teacher/TeacherAddQuiz';
import TeacherAddMaterial from './components/teacher/TeacherAddMaterial';
import CourseManagementPage from './components/teacher/CourseManagementPage';
// import TeacherCourses from './components/teacher/TeacherCourses';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollOnTop />
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
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <CoursesPage />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/courses/:id" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <CourseDetailPage />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/courses/detail/:slug" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <CourseDetailPage />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/learning/:id" element={
            <ProtectedRoute allowedRoles={['student']}>
                <LearningPage />
            </ProtectedRoute>
          } />
          <Route path="/forum" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <CoursesPage />
              </StudentLayout>
            </ProtectedRoute>
          } />
          <Route path="/posts" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <CoursesPage />
              </StudentLayout>
            </ProtectedRoute>
          } />

          {/* Các route dành riêng cho giảng viên */}
          <Route path="/teacher/dashboard" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout>
                <TeacherDashboard />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/add-course" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout>
                <TeacherAddCourse />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/course" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout>
                <TeacherCourseDetail />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/add-lesson" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout>
                <TeacherAddLesson />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/add-quiz" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout>
                <TeacherAddQuiz />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/add-material" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout>
                <TeacherAddMaterial />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/course-management/:courseId" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout>
                <CourseManagementPage />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          {/* <Route path="/teacher/courses" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout>
                <TeacherCourses />
              </TeacherLayout>
            </ProtectedRoute>
          } /> */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
