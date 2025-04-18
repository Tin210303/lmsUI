import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Users, User } from 'lucide-react';
import axios from 'axios';
import '../../assets/css/coursespage.css';

const CourseCard = ({ course }) => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [lessonCount, setLessonCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [teacherName, setTeacherName] = useState(course.teacher?.fullName || 'N/A');
    const [courseImage, setCourseImage] = useState(course.image || null);

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
        // Tạo số từ các ký tự trong ID
        const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[sum % colors.length];
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                // Fetch students
                const studentsResponse = await axios.get(`http://localhost:8080/lms/studentcourse/studentofcourse/${course.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setStudents(studentsResponse.data.result || []);

                // Fetch course details to get lesson count and teacher info
                const courseDetailsResponse = await axios.get(`http://localhost:8080/lms/course/${course.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                // Count lessons from the course details
                const courseDetails = courseDetailsResponse.data.result;
                const lessons = courseDetails.lesson || [];
                setLessonCount(lessons.length);
                
                // Update teacher name from course details
                if (courseDetails.teacher && courseDetails.teacher.fullName) {
                    setTeacherName(courseDetails.teacher.fullName);
                }
                
                // Update course image if available
                if (courseDetails.image) {
                    setCourseImage(courseDetails.image);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [course.id]);

    const handleClick = () => {
        navigate('/teacher/course', {
            state: { courseId: course.id }
        });
    };

    // Format dates
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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
                                {course.name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ fontSize: "14px", marginTop: "5px" }}>
                                {course.name}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="course-card-header">
                <h3 className="course-title">{course.name}</h3>
                <p className="course-dates">Thời hạn: {formatDate(course.startDate)} - {course.endDate ? formatDate(course.endDate) : "Không giới hạn"}</p>
                <p className="course-major">Chuyên ngành: {course.major || 'Chưa có thông tin'}</p>
                <div className="course-status">
                    <span className={`status-badge ${course.status.toLowerCase()}`}>
                        {course.status.toUpperCase() === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE'}
                    </span>
                </div>
            </div>
            <div className="course-stats">
                <div className="stat-item">
                    <User size={16} />
                    <span>{teacherName}</span>
                </div>
                <div className="stat-item">
                    <Users size={16} />
                    <span>{students.length}</span>
                </div>
                <div className="stat-item">
                    <Book size={16} />
                    <span>{loading ? '...' : lessonCount} bài học</span>
                </div>
            </div>
        </div>
    );
};

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await axios.get('http://localhost:8080/lms/course/courseofteacher', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setCourses(response.data.result || []);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                console.error('Error fetching courses:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) {
        return <div className="courses-container">
            <div className="main-content">
                <div>Đang tải dữ liệu...</div>
            </div>
        </div>;
    }

    if (error) {
        return <div className="courses-container">
            <div className="main-content">
                <div>Có lỗi xảy ra: {error}</div>
            </div>
        </div>;
    }

    return (
        <div className="courses-container">
            <div className="main-content">
                <div className="course-container">
                    <div className="course-header">
                        <h2 className="course-header-title">Khóa học của bạn</h2>
                        <button className="add-course-button" onClick={() => navigate('/teacher/add-course')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            <span style={{ marginLeft: '5px' }}>Thêm Khóa Học</span>
                        </button>
                    </div>
                    <div className="courses-grid">
                        {courses.map(course => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
