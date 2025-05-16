import React, { useState, useRef, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../assets/css/header.css';
import { User, LogOut, KeySquare } from 'lucide-react';
import {Search} from 'lucide-react'
import logo from '../../assets/imgs/logo.png';
import axios from 'axios';
import { API_BASE_URL, GET_TEACHER_INFO, SEARCH_COURSE_API } from '../../services/apiService';

const TeacherHeader = () => {
    const { user, logout } = useAuth();
    
    const navigate = useNavigate();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [teacherData, setTeacherData] = useState({
        name: '',
        email: '',
        avatar: null,
        id: null
    });

    // Thêm state cho chức năng tìm kiếm
    const [searchQueryCourse, setSearchQueryCourse] = useState('');
    const [searchQueryTeacher, setSearchQueryTeacher] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);
    
    // Thêm state cho debounce
    const searchTimeoutRef = useRef(null);

    // State cho phân trang và cuộn vô hạn tìm kiếm
    const [searchPagination, setSearchPagination] = useState({
        pageNumber: 0,
        pageSize: 10,
        totalPages: 0,
        totalElements: 0
    });
    const [loadingMoreResults, setLoadingMoreResults] = useState(false);
    const searchResultsRef = useRef(null);

    // State cho phần đổi mật khẩu
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changePasswordLoading, setChangePasswordLoading] = useState(false);
    const [changePasswordError, setChangePasswordError] = useState('');
    const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
    const [modalClosing, setModalClosing] = useState(false);

    // Thêm state để lưu trữ URL ảnh đại diện cho các khóa học
    const [courseImages, setCourseImages] = useState({});

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (event.target.closest('.profile-section')) {
                return;
            }
            setDropdownOpen(false);
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // lắng nghe sự kiện để set avatar ngay khi avatar được cập nhật
    React.useEffect(() => {
        const handleAvatarUpdate = (event) => {
            setAvatarUrl(event.detail.avatarUrl);
        };
        
        window.addEventListener('avatar_updated', handleAvatarUpdate);
        
        return () => {
            window.removeEventListener('avatar_updated', handleAvatarUpdate);
        };
    }, []);

    React.useEffect(() => {
        const fetchStudentInfo = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                // Fetch student info
                const teacherResponse = await axios.get(`${GET_TEACHER_INFO}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log(teacherResponse);
                

                // Check response
                if (teacherResponse.data.code === 0 && teacherResponse.data.result) {
                    const teacherInfo = teacherResponse.data.result;
                    // Calculate joined days (using a placeholder - you might want to adjust this)
                    const joinedDays = 3; // Placeholder

                    setTeacherData({
                        name: teacherInfo.fullName || '',
                        email: teacherInfo.email || '',
                        avatar: teacherInfo.avatar,
                        id: teacherInfo.id
                    });

                    // Fetch avatar if available
                    if (teacherInfo.avatar) {
                        fetchAvatar(teacherInfo.avatar);
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
            const response = await axios.get(`${API_BASE_URL}${avatarPath}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            });

            // Create a URL for the blob data
            const imageUrl = URL.createObjectURL(response.data);
            setAvatarUrl(imageUrl);
        } catch (err) {
            console.error('Error fetching avatar:', err);
        }
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

    // Hàm tìm kiếm khóa học với phân trang
    const searchCourses = async (courseName, teacherName, pageNumber = 0, pageSize = 3, appendResults = false) => {
        if ((!courseName || courseName.trim() === '') && (!teacherName || teacherName.trim() === '')) {
            setSearchResults([]);
            setIsSearchOpen(false);
            return;
        }
        
        if (!appendResults) {
            setIsSearching(true);
        } else {
            setLoadingMoreResults(true);
        }
        
        setIsSearchOpen(true);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Không tìm thấy token xác thực');
            }
            
            // Tạo form data theo yêu cầu của backend
            console.log(`Tìm kiếm với: courseName=${courseName}, teacherName=${teacherName}, pageNumber=${pageNumber}, pageSize=${pageSize}`);
            
            const response = await axios.get(`${SEARCH_COURSE_API}`, {
                params: {
                    courseName: courseName || '',
                    teacherName: teacherName || '',
                    pageNumber: pageNumber,
                    pageSize: pageSize
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data && response.data.code === 0) {
                console.log('Kết quả tìm kiếm:', response.data.result);
                
                // Cập nhật thông tin phân trang
                const pageInfo = response.data.result.page || {};
                setSearchPagination({
                    pageNumber: pageInfo.number || 0,
                    pageSize: pageInfo.size || 3,
                    totalPages: pageInfo.totalPages || 1,
                    totalElements: pageInfo.totalElements || 0
                });
                
                // Nếu là tải thêm, nối vào kết quả hiện tại
                if (appendResults) {
                    setSearchResults(prev => [...prev, ...(response.data.result.content || [])]);
                } else {
                    setSearchResults(response.data.result.content || []);
                }
            } else {
                if (!appendResults) {
                    setSearchResults([]);
                }
            }
        } catch (error) {
            console.error('Lỗi khi tìm kiếm khóa học:', error);
            // Hiển thị thông tin chi tiết lỗi để gỡ lỗi
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
            if (!appendResults) {
                setSearchResults([]);
            }
        } finally {
            setIsSearching(false);
            setLoadingMoreResults(false);
        }
    };

    // Cập nhật hàm xử lý thay đổi cho input tìm kiếm khóa học
    const handleSearchCourseChange = (e) => {
        const courseValue = e.target.value;
        setSearchQueryCourse(courseValue);
        console.log(teacherData);
        
        setSearchQueryTeacher(teacherData.name)
        
        // Xóa timeout hiện tại nếu có
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        // Tạo timeout mới để debounce
        searchTimeoutRef.current = setTimeout(() => {
            // Reset lại trang về 0 khi thực hiện tìm kiếm mới
            setSearchPagination(prev => ({
                ...prev,
                pageNumber: 0
            }));
            searchCourses(courseValue, searchQueryTeacher, 0, searchPagination.pageSize);
        }, 500); // Đợi 500ms sau khi người dùng ngừng gõ
    };

    // Xóa timeout khi component unmount
    React.useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Hàm xử lý tìm kiếm khi nhấn nút
    const handleSearch = () => {
        // Reset lại trang về 0 khi thực hiện tìm kiếm mới
        setSearchPagination(prev => ({
            ...prev,
            pageNumber: 0
        }));
        searchCourses(searchQueryCourse, searchQueryTeacher, 0, searchPagination.pageSize);
    };

    // Hàm xử lý tải thêm kết quả khi cuộn
    const loadMoreSearchResults = () => {
        if (searchPagination.pageNumber >= searchPagination.totalPages - 1) return;
        
        const nextPage = searchPagination.pageNumber + 1;
        searchCourses(searchQueryCourse, searchQueryTeacher, nextPage, searchPagination.pageSize, true);
    };

    // Theo dõi sự kiện cuộn để tải thêm kết quả
    React.useEffect(() => {
        const handleScroll = (e) => {
            if (!searchResultsRef.current || loadingMoreResults) return;
            
            const element = searchResultsRef.current;
            const isBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 20;
            
            if (isBottom && searchPagination.pageNumber < searchPagination.totalPages - 1) {
                loadMoreSearchResults();
            }
        };
        
        const searchResultsElement = searchResultsRef.current;
        if (searchResultsElement) {
            searchResultsElement.addEventListener('scroll', handleScroll);
        }
        
        return () => {
            if (searchResultsElement) {
                searchResultsElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, [loadingMoreResults, searchPagination.pageNumber, searchPagination.totalPages, searchQueryCourse, searchQueryTeacher]);


    // Xử lý click vào kết quả tìm kiếm
    const handleSearchResultClick = async (course) => {
        setIsSearchOpen(false);
        setSearchQueryCourse('');
        setSearchQueryTeacher('');

        // Chuyển hướng đến trang chi tiết khóa học
        navigate('/teacher/course', {
            state: { courseId: course.id }
        });
    };

    // Hàm lấy ảnh đại diện của khóa học
    const fetchCourseImage = async (course) => {
        // Nếu đã tải ảnh này rồi, không tải lại
        if (courseImages[course.id]) return;

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
                const imageObjectUrl = URL.createObjectURL(response.data);
                
                // Cập nhật state với URL ảnh
                setCourseImages(prev => ({
                    ...prev,
                    [course.id]: imageObjectUrl
                }));
            } catch (error) {
                console.error(`Lỗi khi tải ảnh khóa học ID ${course.id}:`, error);
            }
        }
    };

    // Thêm useEffect để tải ảnh cho các khóa học trong kết quả tìm kiếm
    useEffect(() => {
        // Tải ảnh cho mỗi khóa học trong kết quả tìm kiếm
        searchResults.forEach(course => {
            if (course.image) {
                fetchCourseImage(course);
            }
        });

        // Cleanup function để giải phóng URL objects khi component unmount
        return () => {
            Object.values(courseImages).forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, [searchResults]);

    // Render kết quả tìm kiếm
    const renderSearchResults = () => {
        if (isSearching && searchResults.length === 0) {
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
            <>
                <div className="search-results-list" ref={searchResultsRef}>
                    {searchResults.map(course => (
                        <div 
                            key={course.id} 
                            className="search-result-item"
                            onClick={() => handleSearchResultClick(course)}
                        >
                            <div className="search-result-image">
                                {courseImages[course.id] ? (
                                    <img 
                                        src={courseImages[course.id]} 
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
                                <div className="search-result-info">
                                    <div>
                                        <h4 className="search-result-title">{course.name}</h4>
                                        <span className="search-result-teacher">
                                            {course.teacher ? `Giảng viên: ${course.teacher.fullName}` : 'Chưa có giảng viên'}
                                        </span>
                                    </div>
                                    <span className={`search-result-status ${course.status.toLowerCase()}`}>
                                        {course.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {loadingMoreResults && (
                        <div className="search-results-loading-more">
                            <div className="search-spinner-small"></div>
                            <span>Đang tải thêm...</span>
                        </div>
                    )}
                </div>
                
                {searchResults.length > 0 && (
                    <div className="search-results-count">
                        Hiển thị: {searchResults.length}/{searchPagination.totalElements} kết quả
                    </div>
                )}
            </>
        );
    };

    const handleChangePassword = async () => {
        setChangePasswordError('');
        setChangePasswordSuccess('');
        if (!oldPassword || !newPassword || !confirmPassword) {
            setChangePasswordError('Vui lòng nhập đầy đủ thông tin.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setChangePasswordError('Mật khẩu xác nhận không khớp.');
            return;
        }
        setChangePasswordLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(
                `${API_BASE_URL}/lms/account/changePassword`,
                { oldPassword, newPassword },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (response.data && response.data.code === 200) {
                setChangePasswordSuccess('Đổi mật khẩu thành công!');
                setTimeout(() => {
                    closePasswordModal();
                }, 500);
            } else {
                setChangePasswordError(response.data?.message || 'Đổi mật khẩu thất bại.');
            }
        } catch (err) {
            setChangePasswordError('Đổi mật khẩu thất bại. Vui lòng thử lại.');
        } finally {
            setChangePasswordLoading(false);
        }
    };

    // Hàm để đóng modal với hiệu ứng fade out
    const closePasswordModal = () => {
        setModalClosing(true);
        setTimeout(() => {
            setShowChangePassword(false);
            setModalClosing(false);
            // Reset các state khi đóng
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setChangePasswordError('');
            setChangePasswordSuccess('');
        }, 300); // thời gian phải khớp với thời gian animation
    };

    return (
        <header className="header">
            <div className="left-section">
                <Link to="/teacher/dashboard"><img src={logo} alt="LMS Logo" className="logo" /></Link>
                <span className="title">Hệ Thống Học Tập Trực Tuyến</span>
            </div>
            <div className='teacher-search-box'>
                <div className="teacher-header-search-box">
                    <span className="teacher-header-search-icon">
                        <Search size={18} color='#787878'/>
                    </span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm khóa học..."
                        value={searchQueryCourse}
                        onChange={handleSearchCourseChange}
                        onFocus={() => {
                            if (searchQueryCourse || searchQueryTeacher) setIsSearchOpen(true);
                        }}
                    />
                </div>
                {isSearchOpen && (searchQueryCourse || searchQueryTeacher) && (
                    <div className="search-results-dropdown">
                        <div className="search-results-header">
                            <h3>Kết quả tìm kiếm</h3>
                            <div className="search-results-close" onClick={() => setIsSearchOpen(false)}>
                                ×
                            </div>
                        </div>
                        {renderSearchResults()}
                    </div>
                )}
            </div>

            <div className='right-section'>
                <Link to="/teacher/dashboard" className="my-courses">Quản lý khóa học</Link>
                <div className="bell-icon">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="20"
                        viewBox="0 0 24 24"
                        width="20"
                        fill="currentColor"
                    >
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-2.8-1.7-5.1-4.3-5.8V4a1.7 1.7 0 0 0-3.4 0v1.2C7.7 5.9 6 8.2 6 11v5l-2 2v1h16v-1l-2-2z" />
                    </svg>
                </div>
                {user && (
                    <div className="profile-section">
                        <div className="profile-info" onClick={toggleDropdown} style={{ cursor: 'pointer' }}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className='avatar'/>
                            ) : (
                                <img src='https://randomuser.me/api/portraits/men/1.jpg' className='avatar'/>
                            )}
                        </div>

                        {isDropdownOpen && (
                            <div className="profile-dropdown">
                                <Link to="/teacher/profile" className="header-dropdown-item" onClick={() => setDropdownOpen(false)}>
                                    <User size={16} />
                                    <span>Thông tin cá nhân</span>
                                </Link>
                                <button onClick={() => setShowChangePassword(true)} className="header-dropdown-item">
                                    <KeySquare size={16} />
                                    <span>Đổi mật khẩu</span>
                                </button>
                                <button onClick={handleLogout} className="header-dropdown-item logout-button">
                                    <LogOut size={16} />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal đổi mật khẩu với hiệu ứng fade */}
            {showChangePassword && (
                <div 
                    className={`password-modal-overlay ${modalClosing ? 'modal-exit' : 'modal-enter'}`}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closePasswordModal();
                    }}
                >
                    <div className="password-modal" onClick={e => e.stopPropagation()}>
                        <h2>Đổi Mật Khẩu</h2>
                        <input
                            type="password"
                            placeholder="Mật khẩu cũ"
                            value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Mật khẩu mới"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Xác nhận mật khẩu mới"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                        {changePasswordError && <div className="password-error-message">{changePasswordError}</div>}
                        {changePasswordSuccess && <div className="password-success-message">{changePasswordSuccess}</div>}
                        <div className="password-modal-actions">
                            <button onClick={closePasswordModal}>Hủy</button>
                            <button onClick={handleChangePassword} disabled={changePasswordLoading}>
                                {changePasswordLoading ? 'Đang xử lý...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default TeacherHeader;
