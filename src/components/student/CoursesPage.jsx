import React, { useState, useEffect } from 'react';
import { getMyCourses, getAllCourses } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';
import CourseCard from './CourseCard';
import '../../assets/css/coursespage.css';

const CoursesPage = () => {
    const [myCourses, setMyCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState({
        myCourses: true,
        allCourses: true
    });
    const [loadingMore, setLoadingMore] = useState({
        myCourses: false,
        allCourses: false
    });
    const { authToken } = useAuth();
    
    // Pagination state for my courses
    const [myCoursesPage, setMyCoursesPage] = useState({
        pageNumber: 0,
        pageSize: 8,
        totalPages: 0,
        totalElements: 0
    });
    
    // Pagination state for all courses
    const [allCoursesPage, setAllCoursesPage] = useState({
        pageNumber: 0,
        pageSize: 8,
        totalPages: 0,
        totalElements: 0
    });

    // Tải dữ liệu ban đầu khi component được mount
    useEffect(() => {
        const fetchInitialMyCourses = async () => {
            try {
                setLoading(prev => ({ ...prev, myCourses: true }));
                const data = await getMyCourses(0, myCoursesPage.pageSize);
                console.log('Fetched initial my courses:', data);
                setMyCourses(data.content || []);
                setMyCoursesPage(prev => ({
                    ...prev,
                    pageNumber: 0, // Đảm bảo reset về trang đầu tiên
                    totalPages: data.totalPages || 1,
                    totalElements: data.totalElements || 0
                }));
                setLoading(prev => ({ ...prev, myCourses: false }));
            } catch (error) {
                console.error('Error fetching initial my courses:', error);
                setLoading(prev => ({ ...prev, myCourses: false }));
            }
        };

        const fetchInitialAllCourses = async () => {
            try {
                setLoading(prev => ({ ...prev, allCourses: true }));
                const data = await getAllCourses(0, allCoursesPage.pageSize);
                console.log('Fetched initial all courses:', data);
                setAllCourses(data.content || []);
                setAllCoursesPage(prev => ({
                    ...prev,
                    pageNumber: 0, // Đảm bảo reset về trang đầu tiên
                    totalPages: data.totalPages || 1,
                    totalElements: data.totalElements || 0
                }));
                setLoading(prev => ({ ...prev, allCourses: false }));
            } catch (error) {
                console.error('Error fetching initial all courses:', error);
                setLoading(prev => ({ ...prev, allCourses: false }));
            }
        };

        fetchInitialMyCourses();
        fetchInitialAllCourses();
    }, [authToken]); // Chỉ chạy khi component mount hoặc authToken thay đổi

    // Load more my courses
    const loadMoreMyCourses = async () => {
        if (myCoursesPage.pageNumber >= myCoursesPage.totalPages - 1) return;
        
        setLoadingMore(prev => ({ ...prev, myCourses: true }));
        
        try {
            const nextPage = myCoursesPage.pageNumber + 1;
            console.log('Loading more my courses, page:', nextPage);
            const data = await getMyCourses(nextPage, myCoursesPage.pageSize);
            
            if (data.content && data.content.length > 0) {
                console.log('Appending new my courses:', data.content.length);
                // Append new courses to existing list
                setMyCourses(prev => [...prev, ...data.content]);
                
                // Update pagination state
                setMyCoursesPage(prev => ({
                    ...prev,
                    pageNumber: nextPage,
                }));
            }
        } catch (error) {
            console.error('Error loading more my courses:', error);
        } finally {
            setLoadingMore(prev => ({ ...prev, myCourses: false }));
        }
    };
    
    // Load more all courses
    const loadMoreAllCourses = async () => {
        if (allCoursesPage.pageNumber >= allCoursesPage.totalPages - 1) return;
        
        setLoadingMore(prev => ({ ...prev, allCourses: true }));
        
        try {
            const nextPage = allCoursesPage.pageNumber + 1;
            console.log('Loading more all courses, page:', nextPage);
            const data = await getAllCourses(nextPage, allCoursesPage.pageSize);
            
            if (data.content && data.content.length > 0) {
                console.log('Appending new all courses:', data.content.length);
                // Append new courses to existing list
                setAllCourses(prev => [...prev, ...data.content]);
                
                // Update pagination state
                setAllCoursesPage(prev => ({
                    ...prev,
                    pageNumber: nextPage,
                }));
            }
        } catch (error) {
            console.error('Error loading more all courses:', error);
        } finally {
            setLoadingMore(prev => ({ ...prev, allCourses: false }));
        }
    };

    // Filter out courses that are already in my courses
    const otherCourses = allCourses.filter(
        course => !myCourses.some(myCourse => myCourse.id === course.id)
    );

    if (loading.myCourses && loading.allCourses) {
        return <div className="courses-container">Đang tải dữ liệu khóa học...</div>;
    }

    return (
        <div className="courses-container">
            <div className="my-courses-section">
                <div className="courses-section-header">
                    <h1 className="section-title">Khóa học của bạn</h1>
                    {myCoursesPage.totalElements > 0 && (
                        <div className="course-count">
                            Hiển thị: {myCourses.length}/{myCoursesPage.totalElements} khóa học
                        </div>
                    )}
                </div>
                
                {loading.myCourses ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Đang tải khóa học...</p>
                    </div>
                ) : myCourses.length === 0 ? (
                    <p className="empty-message">Bạn chưa đăng ký khóa học nào.</p>
                ) : (
                    <>
                        <div className="courses-grid">
                            {myCourses.map(course => (
                                <CourseCard key={course.id} course={course} isEnrolled={true} />
                            ))}
                        </div>
                        
                        {/* See More Button for My Courses */}
                        {myCoursesPage.pageNumber < myCoursesPage.totalPages - 1 && (
                            <div className="load-more-container">
                                <button 
                                    className="load-more-btn" 
                                    onClick={loadMoreMyCourses}
                                    disabled={loadingMore.myCourses}
                                >
                                    {loadingMore.myCourses ? (
                                        <>
                                            <span className="spinner-border-sm"></span>
                                            Đang tải...
                                        </>
                                    ) : (
                                        'Xem thêm khóa học'
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Divider */}
            <div className="section-divider"></div>

            {/* Phần khóa học phổ biến */}
            <div className="popular-courses-section">
                <div className="courses-section-header">
                    <h2 className="section-title">Các khóa học phổ biến</h2>
                    {allCoursesPage.totalElements > 0 && (
                        <div className="course-count">
                            Hiển thị: {otherCourses.length}/{allCoursesPage.totalElements} khóa học
                        </div>
                    )}
                </div>
                
                {loading.allCourses ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Đang tải khóa học...</p>
                    </div>
                ) : otherCourses.length === 0 ? (
                    <p className="empty-message">Không có khóa học nào khả dụng.</p>
                ) : (
                    <>
                        <div className="courses-grid">
                            {otherCourses.map(course => (
                                <CourseCard key={course.id} course={course} isEnrolled={false} />
                            ))}
                        </div>
                        
                        {/* See More Button for All Courses */}
                        {allCoursesPage.pageNumber < allCoursesPage.totalPages - 1 && (
                            <div className="load-more-container">
                                <button 
                                    className="load-more-btn" 
                                    onClick={loadMoreAllCourses}
                                    disabled={loadingMore.allCourses}
                                >
                                    {loadingMore.allCourses ? (
                                        <>
                                            <span className="spinner-border-sm"></span>
                                            Đang tải...
                                        </>
                                    ) : (
                                        'Xem thêm khóa học'
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CoursesPage;
