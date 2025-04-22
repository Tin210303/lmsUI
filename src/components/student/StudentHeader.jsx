import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, LogOut, Bell, X, Check, Eye, ChevronRight } from 'lucide-react';
import logo from '../../assets/imgs/logo.png';
import { useAuth } from '../../context/AuthContext';
import '../../assets/css/header.css'; // Use the shared header CSS
import axios from 'axios';


// Dữ liệu mẫu cho thông báo
const sampleNotifications = [
    {
        id: 1,
        title: 'Khóa học mới',
        message: 'Khóa học "React JS nâng cao" vừa được thêm vào danh sách khóa học của bạn.',
        time: '2 giờ trước',
        read: false,
        type: 'course',
    },
    {
        id: 2,
        title: 'Nhắc nhở học tập',
        message: 'Bạn có một bài học "JavaScript ES6" chưa hoàn thành. Hãy quay lại học ngay!',
        time: '1 ngày trước',
        read: false,
        type: 'reminder',
    },
    {
        id: 3,
        title: 'Bài kiểm tra sắp đến hạn',
        message: 'Bài kiểm tra "HTML & CSS cơ bản" sẽ kết thúc trong 2 ngày nữa. Hãy hoàn thành ngay.',
        time: '2 ngày trước',
        read: true,
        type: 'exam',
    },
    {
        id: 4,
        title: 'Phản hồi từ giảng viên',
        message: 'Giảng viên đã phản hồi câu hỏi của bạn trong khóa học "Node.js".',
        time: '3 ngày trước',
        read: true,
        type: 'feedback',
    },
    {
        id: 5,
        title: 'Ưu đãi đặc biệt',
        message: 'Giảm giá 50% cho khóa học "UI/UX Design" khi đăng ký trong tuần này!',
        time: '1 tuần trước',
        read: true,
        type: 'promotion',
    }
];

const API_BASE_URL = 'http://localhost:8080';

const StudentHeader = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isNotificationOpen, setNotificationOpen] = useState(false);
    const [isCoursesOpen, setCoursesOpen] = useState(false);
    const [notifications, setNotifications] = useState(sampleNotifications);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const notificationRef = useRef(null);
    const coursesRef = useRef(null);

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

    // Fetch student courses
    const fetchCourses = async () => {
        if (isCoursesOpen && courses.length === 0) {
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                
                // Fetch my courses
                const myCourseResponse = await axios.get(`${API_BASE_URL}/lms/studentcourse/mycourse`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const myCourses = myCourseResponse.data.result || [];
                
                // Fetch details and calculate progress for each course
                const coursesWithProgress = await Promise.all(myCourses.map(async (course) => {
                    try {
                        // Get course details
                        const courseDetailResponse = await axios.get(`${API_BASE_URL}/lms/course/${course.id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        
                        const courseDetail = courseDetailResponse.data.result;
                        
                        // Get lessons and chapters for the course
                        const lessons = courseDetail.lesson || [];
                        let totalChapters = 0;
                        let completedChapters = 0;
                        
                        // Count chapters and check completion status
                        for (const lesson of lessons) {
                            const chapters = lesson.chapter || [];
                            totalChapters += chapters.length;
                            
                            for (const chapter of chapters) {
                                try {
                                    const progressResponse = await axios.get(`${API_BASE_URL}/lms/lessonchapterprogress/getprogress/${chapter.id}`, {
                                        headers: {
                                            'Authorization': `Bearer ${token}`
                                        }
                                    });
                                    
                                    // If progress exists and is completed, increment counter
                                    if (progressResponse.data.result && progressResponse.data.result.isCompleted) {
                                        completedChapters++;
                                    }
                                } catch (error) {
                                    console.error(`Error fetching progress for chapter ${chapter.id}:`, error);
                                }
                            }
                        }
                        
                        // Calculate progress percentage
                        const progressPercentage = totalChapters > 0
                            ? Math.round((completedChapters / totalChapters) * 100)
                            : 0;
                        
                        // Format last studied date if available
                        let lastStudiedInfo = "Chưa bắt đầu học";
                        
                        if (course.startDate) {
                            const date = new Date(course.startDate);
                            const now = new Date();
                            const diffTime = Math.abs(now - date);
                            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                            
                            if (diffDays === 0) {
                                lastStudiedInfo = "Học hôm nay";
                            } else if (diffDays === 1) {
                                lastStudiedInfo = "Học hôm qua";
                            } else if (diffDays < 30) {
                                lastStudiedInfo = `Học cách đây ${diffDays} ngày`;
                            } else if (diffDays < 365) {
                                const months = Math.floor(diffDays / 30);
                                lastStudiedInfo = `Học cách đây ${months} tháng`;
                            } else {
                                const years = Math.floor(diffDays / 365);
                                lastStudiedInfo = `Học cách đây ${years} năm`;
                            }
                        }
                        
                        return {
                            id: course.id,
                            title: courseDetail.name || "Khóa học",
                            lastStudied: lastStudiedInfo,
                            progress: progressPercentage,
                            path: `/learning/${course.id}`,
                            image: courseDetail.image || null
                        };
                    } catch (error) {
                        console.error(`Error processing course ${course.id}:`, error);
                        return null;
                    }
                }));
                
                // Filter out any null courses (failed to process)
                const validCourses = coursesWithProgress.filter(course => course !== null);
                setCourses(validCourses);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (isCoursesOpen) {
            fetchCourses();
        }
    }, [isCoursesOpen]);

    const handleLogout = () => {
        logout();
        navigate('/'); // Redirect to homepage after logout
    };

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const toggleNotification = () => {
        setNotificationOpen(!isNotificationOpen);
    };

    const toggleCourses = (e) => {
        e.preventDefault(); // Prevent navigation
        setCoursesOpen(!isCoursesOpen);
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(notification => 
            notification.id === id ? { ...notification, read: true } : notification
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    };

    const getUnreadCount = () => {
        return notifications.filter(notification => !notification.read).length;
    };

    // Function to close dropdowns if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setNotificationOpen(false);
            }
            
            if (coursesRef.current && !coursesRef.current.contains(event.target)) {
                setCoursesOpen(false);
            }
            
            if (event.target.closest('.profile-section')) {
                return; // Clicked inside the profile section, do nothing
            }
            setDropdownOpen(false); // Clicked outside, close dropdown
        };

        if (isDropdownOpen || isNotificationOpen || isCoursesOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen, isNotificationOpen, isCoursesOpen]);

    // Render notification icon based on type
    const renderNotificationIcon = (type) => {
        switch(type) {
            case 'course':
                return <BookIcon size={16} />;
            case 'reminder':
                return <ClockIcon size={16} />;
            case 'exam':
                return <FileIcon size={16} />;
            case 'feedback':
                return <MessageIcon size={16} />;
            case 'promotion':
                return <GiftIcon size={16} />;
            default:
                return <Bell size={16} />;
        }
    };

    // Dummy icons for notification types
    const BookIcon = ({ size }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
    const ClockIcon = ({ size }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
    const FileIcon = ({ size }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
    const MessageIcon = ({ size }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
    const GiftIcon = ({ size }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>;

    const renderCourseContent = () => {
        if (loading) {
            return (
                <div className="header-courses-spinner">
                    <div className="header-spinner"></div>
                </div>
            );
        }

        if (courses.length === 0) {
            return (
                <div className="header-courses-empty">
                    <p>Bạn chưa đăng ký khóa học nào</p>
                </div>
            );
        }

        return (
            <div className="header-courses-list">
                {courses.map(course => (
                    <Link to={course.path} key={course.id} className="header-course-item">
                        <div className="header-course-image">
                            {course.image ? (
                                <img src={course.image} alt={course.title} className="header-course-img" />
                            ) : (
                                <div className="header-course-placeholder" style={{ background: getConsistentColor(course.id) }}>
                                    <div className="header-image-text">
                                        <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                                            {course.title?.charAt(0).toUpperCase() || 'C'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="header-course-content">
                            <h4 className="header-course-title">{course.title}</h4>
                            <div className="header-course-info">
                                {course.lastStudied}
                            </div>
                            
                            {course.progress > 0 ? (
                                <div className="header-progress-container">
                                    <div className="header-progress-bar">
                                        <div 
                                            className="header-progress-fill" 
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="header-progress-tooltip">
                                        Hoàn thành: {course.progress}%
                                    </div>
                                </div>
                            ) : (
                                <Link to={course.path} className="header-start-button">
                                    Bắt đầu học
                                </Link>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        );
    };

    return (
        <header className="header">
            <div className="left-section">
                <Link to="/courses"><img src={logo} alt="LMS Logo" className="logo" /></Link>
                <span className="title">Hệ Thống Học Tập Trực Tuyến</span>
            </div>

            <div className="search-box">
                <span className="search-icon">
                    <Search size={18} color='#787878'/>
                </span>
                <input
                    type="text"
                    placeholder="Tìm kiếm khóa học, bài viết, video, ..."
                />
            </div>

            <div className="right-section">
                <div className="header-courses-dropdown-wrapper" ref={coursesRef}>
                    <a href="#" className="header-my-courses" onClick={toggleCourses}>Khóa học của tôi</a>
                    
                    {isCoursesOpen && (
                        <div className="header-courses-dropdown">
                            <div className="courses-header">
                                <h3>Khóa học của tôi</h3>
                                <Link to="/courses" className="view-all-link">Xem tất cả</Link>
                            </div>  
                            
                            {renderCourseContent()}
                        </div>
                    )}
                </div>
                
                <div className="bell-icon" ref={notificationRef}>
                    <div onClick={toggleNotification}>
                        <Bell size={20} />
                        {getUnreadCount() > 0 && (
                            <span className="notification-badge">{getUnreadCount()}</span>
                        )}
                    </div>
                    
                    {isNotificationOpen && (
                        <div className="notification-dropdown">
                            <div className="notification-header">
                                <h3>Thông Báo</h3>
                                <div className="notification-actions">
                                    <button className="notification-action" onClick={markAllAsRead}>
                                        <Check size={14} />
                                        <span>Đánh dấu đã đọc</span>
                                    </button>
                                </div>
                            </div>
                            
                            {notifications.length > 0 ? (
                                <ul className="notification-list">
                                    {notifications.map(notification => (
                                        <li 
                                            key={notification.id} 
                                            className={`notification-item ${!notification.read ? 'notification-unread' : ''}`}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="notification-icon">
                                                {renderNotificationIcon(notification.type)}
                                            </div>
                                            <div className="notification-content">
                                                <h4 className="notification-title">{notification.title}</h4>
                                                <p className="notification-message">{notification.message}</p>
                                                <div className="notification-time">{notification.time}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="notification-empty">
                                    <p>Bạn không có thông báo nào</p>
                                </div>
                            )}
                            
                            <div className="notification-footer">
                                <Link to="/notifications">Xem tất cả thông báo</Link>
                            </div>
                        </div>
                    )}
                </div>
                
                {user && (
                    <div className="profile-section">
                        <div className="profile-info" onClick={toggleDropdown} style={{ cursor: 'pointer' }}>
                            <img 
                                src={user.avatar || '/path/to/default-avatar.png'} // Use actual avatar or default
                                alt="Ava" 
                                className="avatar"
                            />
                        </div>
                    
                        {isDropdownOpen && (
                            <div className="profile-dropdown">
                                <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                    <User size={16} />
                                    <span>Thông tin cá nhân</span>
                                </Link>
                                <button onClick={handleLogout} className="dropdown-item logout-button">
                                    <LogOut size={16} />
                                    <span>Đăng Xuất</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default StudentHeader;
