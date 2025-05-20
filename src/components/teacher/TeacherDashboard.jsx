import React, { useState, useEffect } from 'react';
import { getTeacherCourses } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';
import '../../assets/css/coursespage.css';
import { useNavigate } from 'react-router-dom';
import { Book, Users, User } from 'lucide-react';
import { API_BASE_URL } from '../../services/apiService';
import axios from 'axios';

const CourseCard = ({ course, isEnrolled = false }) => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [lessonCount, setLessonCount] = useState(course?.chapterCount || '0');
    const [teacherName, setTeacherName] = useState(course.teacher?.fullName || 'N/A');
    const [studentCount, setStudentCount] = useState(course?.studentCount || '0');
    const [courseImage, setCourseImage] = useState(null);

    // Thêm useEffect để lấy ảnh đại diện khóa học nếu có
    useEffect(() => {
        let imageObjectUrl = null;
        
        const fetchCourseImage = async () => {
            // Kiểm tra nếu course.image không null
            if (course.image) {
                try {
                    // Lấy token xác thực
                    const token = localStorage.getItem('authToken');
                    if (!token) {
                        console.error('No authentication token found');
                        return;
                    }
                    
                    // Tạo URL đầy đủ cho ảnh
                    const imageUrl = `${API_BASE_URL}${course.image}`;
                    console.log(`Đang tải ảnh khóa học từ: ${imageUrl}`);
                    
                    // Gọi API để lấy ảnh với Bearer token sử dụng axios
                    const response = await axios({
                        method: 'GET',
                        url: imageUrl,
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        responseType: 'blob' // Quan trọng: yêu cầu response dạng blob
                    });
                    
                    // Tạo URL object từ blob
                    imageObjectUrl = URL.createObjectURL(response.data);
                    // Cập nhật state với URL ảnh
                    setCourseImage(imageObjectUrl);
                } catch (error) {
                    console.error('Lỗi khi tải ảnh khóa học:', error);
                }
            }
        };
        
        fetchCourseImage();
        
        // Cleanup function để giải phóng URL object khi component unmount
        return () => {
            if (imageObjectUrl) {
                URL.revokeObjectURL(imageObjectUrl);
            }
        };
    }, [course.image]);

    const handleClick = () => {
        navigate('/teacher/course', {
            state: { courseId: course.id }
        });
    };

    // Tạo màu nền dựa trên ID khóa học (để luôn cố định cho mỗi khóa học)
    const getConsistentColor = (id) => {
        const colors = [
            'linear-gradient(to right, #4b6cb7, #182848)',
            'linear-gradient(to right, #1d75fb, #3e60ff)',
            'linear-gradient(to right, #ff416c, #ff4b2b)',
            'linear-gradient(to right, #11998e, #38ef7d)',
            'linear-gradient(to right, #8e2de2, #4a00e0)',
            'linear-gradient(to right, #fc4a1a, #f7b733)',
            'linear-gradient(to right, #5433ff, #20bdff)',
            'linear-gradient(to right, #2b5876, #4e4376)'
        ];
        if (!id) return colors[0]; 
        const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[sum % colors.length];
    };
    
    // Format dates
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Cắt ngắn tên giảng viên nếu quá dài
    const truncateTeacherName = (name, maxLength = 11) => {
        if (!name) return 'Giảng viên';
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength) + '..';
    };

    // Format giá tiền
    const formatPrice = (price) => {
        if (!price && price !== 0) return 'Miễn phí';
        if (price === 0) return 'Miễn phí';
        return `${price.toLocaleString('vi-VN')}$`;
    };

    // Xác định nội dung hiển thị cho phí khóa học
    const renderCourseFee = () => {
        if (course.feeType === 'NON_CHARGEABLE' || !course.feeType) {
            return <span className="status-badge free">Miễn phí</span>;
        } else if (course.feeType === 'CHARGEABLE') {
            return <span className="status-badge price">{formatPrice(course.price)}</span>;
        }
        return null;
    };

    return (
        <div className="course-card" onClick={handleClick}>
            <div className="course-image">
                {courseImage ? (
                    <img src={courseImage} alt={course.name} className="course-img" />
                ) : (
                    <div className="course-placeholder" style={{ background: getConsistentColor(course.id) }}>
                        <div className="image-text">
                            <div style={{ fontSize: "36px", fontWeight: "bold" }}>
                                {course.name?.charAt(0).toUpperCase() || 'C'}
                            </div>
                            <div style={{ fontSize: "14px", marginTop: "5px" }}>
                                {course.name || 'Course'}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="course-card-header">
                <h3 className="course-title">{course.name || 'Course Name'}</h3>
                <p className="course-dates">
                    Thời hạn: {formatDate(course.startDate)} - {course.endDate ? formatDate(course.endDate) : "Không giới hạn"}
                </p>
                <p className="course-major">Chuyên ngành: {course.major || 'N/A'}</p>
                <div className="course-status">
                    <span className={`status-badge ${course.status?.toLowerCase() || 'unknown'}`}>
                        {course.status || 'Unknown'}
                    </span>
                    {renderCourseFee()}
                </div>
            </div>
            <div className="course-stats">
                <div className="stat-item" title={teacherName}>
                    <User size={16} />
                    <span>{truncateTeacherName(teacherName)}</span>
                </div>
                <div className="stat-item" title={`${studentCount} sinh viên`}>
                    <Users size={16} />
                    <span>{studentCount}</span>
                </div>
                <div className="stat-item">
                    <Book size={16} />
                    <span>{lessonCount} bài học</span>
                </div>
            </div>
        </div>
    );
};

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [myCourses, setMyCourses] = useState([]);
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

    // Tải dữ liệu ban đầu khi component được mount
    useEffect(() => {
        const fetchInitialTeacherCourses = async () => {
            try {
                setLoading(prev => ({ ...prev, myCourses: true }));
                const data = await getTeacherCourses(0, myCoursesPage.pageSize);
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

        fetchInitialTeacherCourses();
    }, [authToken]); // Chỉ chạy khi component mount hoặc authToken thay đổi

    // Load more my courses
    const loadMoreTeacherCourses = async () => {
        if (myCoursesPage.pageNumber >= myCoursesPage.totalPages - 1) return;
        
        setLoadingMore(prev => ({ ...prev, myCourses: true }));
        
        try {
            const nextPage = myCoursesPage.pageNumber + 1;
            console.log('Loading more my courses, page:', nextPage);
            const data = await getTeacherCourses(nextPage, myCoursesPage.pageSize);
            
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

    if (loading.myCourses && loading.allCourses) {
        return <div className="courses-container">Đang tải dữ liệu khóa học...</div>;
    }

    return (
        <div className="courses-container">
            <div className="my-courses-section">
                <div className="courses-section-header">
                    <div className='d-flex align-center'>
                        <h1 className="section-title">Khóa học của bạn</h1>
                        {myCoursesPage.totalElements > 0 && (
                            <div className="course-count" style={{marginLeft: '2rem'}}>
                                Hiển thị: {myCourses.length}/{myCoursesPage.totalElements} khóa học
                            </div>
                        )}
                    </div>
                    <button className="add-course-button" onClick={() => navigate('/teacher/add-course')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span style={{ marginLeft: '5px' }}>Thêm Khóa Học</span>
                    </button>
                </div>
                
                {loading.myCourses ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Đang tải khóa học...</p>
                    </div>
                ) : myCourses.length === 0 ? (
                    <p className="empty-message">Bạn chưa thêm khóa học nào.</p>
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
                                    onClick={loadMoreTeacherCourses}
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
        </div>
    );
};

export default TeacherDashboard;
