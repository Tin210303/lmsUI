import React, { useState, useEffect } from 'react';
import '../../assets/css/student-info.css';
import axios from 'axios';
import { getMyCourses } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';
import CourseCard from './CourseCard';
import { X, Upload, Backpack } from 'lucide-react';

const StudentInfo = () => {
    const [studentData, setStudentData] = useState({
        name: '',
        email: '',
        major: '',
        joinedDays: 0,
        avatar: null,
        id: null
    });
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const { authToken } = useAuth();

    const [loadingCourse, setLoadingCourse] = useState({
        myCourses: true,
        allCourses: true
    });

    const [loadingMore, setLoadingMore] = useState({
        myCourses: false,
        allCourses: false
    });

    // Pagination state for my courses
    const [myCoursesPage, setMyCoursesPage] = useState({
        pageNumber: 0,
        pageSize: 8,
        totalPages: 0,
        totalElements: 0
    });

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
        const fetchInitialMyCourses = async () => {
            try {
                setLoadingCourse(prev => ({ ...prev, myCourses: true }));
                const data = await getMyCourses(0, myCoursesPage.pageSize);
                console.log('Fetched initial my courses:', data);
                setCourses(data.content || []);
                setMyCoursesPage(prev => ({
                    ...prev,
                    pageNumber: 0, // Đảm bảo reset về trang đầu tiên
                    totalPages: data.totalPages || 1,
                    totalElements: data.totalElements || 0
                }));
                setLoadingCourse(prev => ({ ...prev, myCourses: false }));
            } catch (error) {
                console.error('Error fetching initial my courses:', error);
                setLoadingCourse(prev => ({ ...prev, myCourses: false }));
            }
        };

        fetchInitialMyCourses()
        fetchStudentInfo();
    }, [authToken]);

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

            // Tạo và dispatch một custom event
            const avatarEvent = new CustomEvent('avatar_updated', { 
                detail: { avatarUrl: imageUrl } 
            });
            window.dispatchEvent(avatarEvent);
        } catch (err) {
            console.error('Error fetching avatar:', err);
        }
    };

    const handleOpenAvatarModal = () => {
        setShowAvatarModal(true);
    };

    const handleCloseAvatarModal = () => {
        setShowAvatarModal(false);
        setSelectedAvatar(null);
    };

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedAvatar(e.target.files[0]);
        }
    };

    const handleAvatarUpload = async () => {
        if (!selectedAvatar || !studentData.id) return;

        try {
            setUploadingAvatar(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const formData = new FormData();
            formData.append('file', selectedAvatar);

            const response = await axios.post(`http://localhost:8080/lms/student/${studentData.id}/upload-photo`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.code === 0 || response.status === 200) {
                const studentResponse = await axios.get('http://localhost:8080/lms/student/myinfo', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (studentResponse.data.code === 0 && studentResponse.data.result) {
                    const updatedAvatar = studentResponse.data.result.avatar;
                    setStudentData(prev => ({
                        ...prev,
                        avatar: updatedAvatar
                    }));
                    
                    // Fetch the new avatar image
                    if (updatedAvatar) {
                        fetchAvatar(updatedAvatar);
                    }
                }

                handleCloseAvatarModal();
            }
        } catch (err) {
            console.error('Error uploading avatar:', err);
            alert('Không thể tải lên ảnh đại diện. Vui lòng thử lại sau.');
        } finally {
            setUploadingAvatar(false);
        }
    };

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
                setCourses(prev => [...prev, ...data.content]);
                
                // Update pagination state
                setCourses(prev => ({
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

    if (loading) {
        return <div className="loading-container">Đang tải thông tin sinh viên...</div>;
    }

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    return (
        <div className="student-info-container">
            <div className="student-profile">
                <div className="avatar-container">
                    <div className="avatar-circle" onClick={handleOpenAvatarModal}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" />
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
                </div>
                <div className="student-details">
                    <h2 className="my-info-student-name">{studentData.name}</h2>
                    <p className="my-info-student-email">{studentData.email}</p>
                    <p className="my-info-student-major">{studentData.major}</p>
                    <p className="my-info-student-joined">Tham gia <strong>LMS</strong> từ {studentData.joinedDays} ngày trước</p>
                </div>
            </div>

            <div className="enrolled-courses">
                <div className="d-flex align-center" style={{marginBottom: '20px', borderLeft: '4px solid #066fbf'}}>
                    <Backpack size={18} style={{marginLeft: '8px'}}/>
                    <h3 className="myinfo-course-section-title">Khóa học đã đăng ký ({courses.length})</h3>
                </div>
                {courses.length > 0 ? (
                    <>
                        <div className="course-grid">
                            {courses.map(course => (
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
                ) : (
                    <p className="no-courses-message">Bạn chưa đăng ký khóa học nào.</p>
                )}
            </div>

            {/* Avatar Modal */}
            {showAvatarModal && (
                <div className="avatar-modal-overlay">
                    <div className="avatar-modal">
                        <div className="avatar-modal-header">
                            <h2>Ảnh đại diện</h2>
                            <button className="avatar-modal-close" onClick={handleCloseAvatarModal}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="avatar-modal-content">
                            <p className="avatar-modal-description">
                                Ảnh đại diện giúp mọi người nhận biết bạn dễ dàng hơn qua các bình luận, tin nhắn...
                            </p>
                            <div className="avatar-preview">
                                {selectedAvatar ? (
                                    <img 
                                        src={URL.createObjectURL(selectedAvatar)} 
                                        alt="Preview" 
                                        className="avatar-preview-image" 
                                    />
                                ) : avatarUrl ? (
                                    <img 
                                        src={avatarUrl} 
                                        alt="Current avatar" 
                                        className="avatar-preview-image"
                                    />
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
                            <label className="upload-avatar-button">
                                <Upload size={18} />
                                <span>Tải ảnh mới lên</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleAvatarChange} 
                                    style={{ display: 'none' }} 
                                />
                            </label>
                            {selectedAvatar && (
                                <button 
                                    className="save-avatar-button" 
                                    onClick={handleAvatarUpload}
                                    disabled={uploadingAvatar}
                                >
                                    {uploadingAvatar ? 'Đang tải lên...' : 'Lưu thay đổi'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentInfo; 