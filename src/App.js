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
// import ForumPage from './components/ForumPage';
// import PostsPage from './components/PostsPage';
// import TeacherDashboard from './components/teacher/TeacherDashboard';
// import TeacherCourses from './components/teacher/TeacherCourses';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
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
          {/* <Route path="/teacher/courses" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout>
                <CoursesPage />
              </TeacherLayout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/courses" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout>
                <TeacherCourses />
              </TeacherLayout>
            </ProtectedRoute>
          } /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
