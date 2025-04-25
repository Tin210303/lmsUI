import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, LogOut, Bell, Check } from 'lucide-react';
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
    const [studentData, setStudentData] = useState({
        name: '',
        email: '',
        major: '',
        joinedDays: 0,
        avatar: null,
        id: null
    });
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [error, setError] = useState(null);
    
    // Thêm state cho chức năng tìm kiếm
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchType, setSearchType] = useState('course'); // 'course' hoặc 'teacher'
    const searchRef = useRef(null);

    // lắng nghe sự kiện để set avatar ngay khi avatar được cập nhật
    useEffect(() => {
        const handleAvatarUpdate = (event) => {
            setAvatarUrl(event.detail.avatarUrl);
        };
        
        window.addEventListener('avatar_updated', handleAvatarUpdate);
        
        return () => {
            window.removeEventListener('avatar_updated', handleAvatarUpdate);
        };
    }, []);

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

    // Hàm tìm kiếm khóa học
    const searchCourses = async (query) => {
        if (!query || query.trim() === '') {
            setSearchResults([]);
            setIsSearchOpen(false);
            return;
        }
        
        setIsSearching(true);
        setIsSearchOpen(true);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Không tìm thấy token xác thực');
            }
            
            // Tạo tham số theo yêu cầu của backend
            const params = {
                courseName: searchType === 'course' ? query : '',
                teacherName: searchType === 'teacher' ? query : ''
            };
            
            console.log('Sending search request with params:', params);
            
            // Sử dụng phương thức POST thay vì GET theo định nghĩa backend
            const response = await axios.post(`${API_BASE_URL}/lms/course/search`, null, {
                params: params,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data && response.data.result) {
                console.log('Search results:', response.data.result);
                setSearchResults(response.data.result);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Lỗi khi tìm kiếm khóa học:', error);
            // Hiển thị thông tin chi tiết lỗi để gỡ lỗi
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };
    
    // Xử lý debounce tìm kiếm để không gọi API quá nhiều lần
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchQuery) {
                searchCourses(searchQuery);
            }
        }, 500); // Delay 500ms
        
        return () => clearTimeout(delaySearch);
    }, [searchQuery, searchType]);

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

    useEffect(() => {
        const fetchStudentInfo = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                // Fetch student info
                const studentResponse = await axios.get('http://localhost:8080/lms/student/myinfo', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Check response
                if (studentResponse.data.code === 0 && studentResponse.data.result) {
                    const studentInfo = studentResponse.data.result;
                    // Calculate joined days (using a placeholder - you might want to adjust this)
                    const joinedDays = 3; // Placeholder

                    setStudentData({
                        name: studentInfo.fullName || '',
                        email: studentInfo.email || '',
                        major: studentInfo.major || 'Kỹ thuật phần mềm', // Default if not available
                        joinedDays: joinedDays,
                        avatar: studentInfo.avatar,
                        id: studentInfo.id
                    });

                    // Fetch avatar if available
                    if (studentInfo.avatar) {
                        fetchAvatar(studentInfo.avatar);
                    }
                }

            } catch (err) {
                console.error('Error fetching student data:', err);
                setError('Failed to load student information. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchStudentInfo();
    }, []);

    // Hàm gọi API để lấy ra ảnh đại diện của sinh viên
    const fetchAvatar = async (avatarPath) => {
        if (!avatarPath) return;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            // Fetch avatar with authorization header
            const response = await axios.get(`http://localhost:8080${avatarPath}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob' // Important: we want the image as a blob
            });

            // Create a URL for the blob data
            const imageUrl = URL.createObjectURL(response.data);
            setAvatarUrl(imageUrl);
        } catch (err) {
            console.error('Error fetching avatar:', err);
        }
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
    
    // Xử lý click vào kết quả tìm kiếm
    const handleSearchResultClick = async (course) => {
        setIsSearchOpen(false);
        setSearchQuery('');
        
        // Tạo slug từ tên khóa học (giống với CourseCard.jsx)
        let slug = '';
        
        if (course.name) {
            // Chuyển tiếng Việt có dấu thành không dấu
            let str = course.name.toLowerCase();
            str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            
            // Thay thế ký tự đặc biệt và dấu cách bằng dấu gạch ngang
            str = str.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            
            // Thêm timestamp để đảm bảo slug là duy nhất
            slug = `${str}-${Date.now()}`;
        } else {
            // Nếu không có tên, sử dụng ID và thêm timestamp
            slug = `course-${Date.now()}`;
        }
        
        // Kiểm tra xem sinh viên đã đăng ký khóa học này chưa
        let isEnrolled = false;
        
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                // Gọi API để lấy danh sách khóa học đã đăng ký
                const myCourseResponse = await axios.get(`${API_BASE_URL}/lms/studentcourse/mycourse`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const myCourses = myCourseResponse.data.result || [];
                
                // Kiểm tra xem khóa học hiện tại có trong danh sách đã đăng ký không
                isEnrolled = myCourses.some(myCourse => myCourse.id === course.id);
                console.log(`Khóa học ${course.name} (ID: ${course.id}) đã đăng ký: ${isEnrolled}`);
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra trạng thái đăng ký khóa học:', error);
            // Nếu có lỗi, mặc định là false
            isEnrolled = false;
        }
        
        // Lưu ID khóa học vào localStorage với slug làm khóa (giống với CourseCard.jsx)
        localStorage.setItem(`course_${slug}`, course.id);
        localStorage.setItem(`course_${slug}_enrolled`, isEnrolled); // Lưu trạng thái đăng ký thực tế
        
        console.log(`Chuyển hướng đến khóa học với slug: ${slug}, ID: ${course.id}, đã đăng ký: ${isEnrolled}`);
        
        // Chuyển hướng đến trang chi tiết khóa học với slug
        navigate(`/courses/detail/${slug}`);
    };
    
    // Chuyển đổi loại tìm kiếm
    const toggleSearchType = () => {
        setSearchType(searchType === 'course' ? 'teacher' : 'course');
        setSearchQuery(''); // Reset kết quả tìm kiếm khi chuyển loại
        setSearchResults([]);
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
            
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
            
            if (event.target.closest('.profile-section')) {
                return; // Clicked inside the profile section, do nothing
            }
            setDropdownOpen(false); // Clicked outside, close dropdown
        };

        if (isDropdownOpen || isNotificationOpen || isCoursesOpen || isSearchOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen, isNotificationOpen, isCoursesOpen, isSearchOpen]);

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
    
    // Render kết quả tìm kiếm
    const renderSearchResults = () => {
        if (isSearching) {
            return (
                <div className="search-results-loading">
                    <div className="search-spinner"></div>
                    <span>Đang tìm kiếm...</span>
                </div>
            );
        }

        if (searchResults.length === 0) {
            return (
                <div className="search-results-empty">
                    <p>Không tìm thấy kết quả phù hợp</p>
                </div>
            );
        }

        return (
            <div className="search-results-list">
                {searchResults.map(course => (
                    <div 
                        key={course.id} 
                        className="search-result-item"
                        onClick={() => handleSearchResultClick(course)}
                    >
                        <div className="search-result-image">
                            {course.image ? (
                                <img 
                                    src={`${API_BASE_URL}/lms/course/image/${course.image}`} 
                                    alt={course.name} 
                                    className="search-result-img" 
                                />
                            ) : (
                                <div className="search-result-placeholder" style={{ background: getConsistentColor(course.id) }}>
                                    {course.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="search-result-content">
                            <h4 className="search-result-title">{course.name}</h4>
                            <div className="search-result-info">
                                <span className="search-result-teacher">
                                    {course.teacher ? `Giảng viên: ${course.teacher.fullName}` : 'Chưa có giảng viên'}
                                </span>
                                <span className={`search-result-status ${course.status.toLowerCase()}`}>
                                    {course.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    return (
        <header className="header">
            <div className="left-section">
                <Link to="/courses"><img src={logo} alt="LMS Logo" className="logo" /></Link>
                <span className="title">Hệ Thống Học Tập Trực Tuyến</span>
            </div>

            <div className="search-box" ref={searchRef}>
                <span className="search-icon">
                    <Search size={18} color='#787878'/>
                </span>
                <input
                    type="text"
                    placeholder={searchType === 'course' ? "Tìm kiếm khóa học..." : "Tìm kiếm giảng viên..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                        if (searchQuery) setIsSearchOpen(true);
                    }}
                />
                <button 
                    className="search-type-toggle" 
                    onClick={toggleSearchType}
                    title={searchType === 'course' ? "Đang tìm theo tên khóa học. Nhấn để chuyển sang tìm theo tên giảng viên" : "Đang tìm theo tên giảng viên. Nhấn để chuyển sang tìm theo tên khóa học"}
                >
                    {searchType === 'course' ? 'Khóa học' : 'Giảng viên'}
                </button>
                
                {isSearchOpen && searchQuery && (
                    <div className="search-results-dropdown">
                        <div className="search-results-header">
                            <h3>Kết quả tìm kiếm</h3>
                        </div>
                        {renderSearchResults()}
                    </div>
                )}
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
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className='avatar'/>
                            ) : (
                                <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="100" cy="100" r="100" fill="#ff4757" />
                                    <path d="M100,40 C60,40 40,70 40,110 C40,150 60,180 100,180 C140,180 160,150 160,110 C160,70 140,40 100,40 Z" fill="#2f3542" />
                                    <path d="M65,90 C65,80 75,70 85,70 C95,70 100,80 100,90 C100,80 105,70 115,70 C125,70 135,80 135,90 C135,100 125,110 115,110 C105,110 100,100 100,90 C100,100 95,110 85,110 C75,110 65,100 65,90 Z" fill="#f1f2f6" />
                                    <path d="M70,75 C70,70 75,65 80,65 C85,65 90,70 90,75 C90,80 85,85 80,85 C75,85 70,80 70,75 Z" fill="#3742fa" />
                                    <path d="M110,75 C110,70 115,65 120,65 C125,65 130,70 130,75 C130,80 125,85 120,85 C115,85 110,80 110,75 Z" fill="#3742fa" />
                                    <path d="M65,120 C65,140 80,160 100,160 C120,160 135,140 135,120 C135,110 120,100 100,100 C80,100 65,110 65,120 Z" fill="#f1f2f6" />
                                    <path d="M70,110 C80,120 90,125 100,125 C110,125 120,120 130,110 C120,105 110,100 100,100 C90,100 80,105 70,110 Z" fill="#2f3542" />
                                </svg>
                                
                            )}
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
