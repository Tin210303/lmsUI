import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../../services/courseService';
import axios from 'axios';
import '../../assets/css/course-detail.css';
import { Check, CirclePlay, Film, Clock, AlarmClock, Plus, Minus, SquareUser, GraduationCap } from 'lucide-react';
import Alert from '../common/Alert';

const CourseDetailPage = () => {
    const params = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openChapters, setOpenChapters] = useState({});
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [pendingCourses, setPendingCourses] = useState([]);
    const [studentId, setStudentId] = useState(null);
    const [alert, setAlert] = useState(null);

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
    };
    
    // Hàm lấy thông tin sinh viên
    const fetchStudentInfo = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const response = await axios.get('http://localhost:8080/lms/student/myinfo', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data && response.data.code === 0) {
                setStudentId(response.data.result.id);
            }
        } catch (error) {
            console.error('Error fetching student info:', error);
        }
    };

    // Hàm lấy danh sách khóa học đang chờ duyệt
    const fetchPendingCourses = async (studentId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const response = await axios.get(`http://localhost:8080/lms/joinclass/courserequest`, {
                params: {
                    studentId: studentId,
                    pageSize: 10,
                    pageNumber: 0
                },
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data && response.data.code === 0) {
                setPendingCourses(response.data.result.content || []);
            }
        } catch (error) {
            console.error('Error fetching pending courses:', error);
        }
    };

    useEffect(() => {
        fetchStudentInfo();
    }, []);

    useEffect(() => {
        if (studentId) {
            fetchPendingCourses(studentId);
        }
    }, [studentId]);

    // Hàm tạo slug từ tên khóa học (không thêm timestamp)
    const createSlug = (name) => {
        let str = name.toLowerCase();
        str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        str = str.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        return str;
    };

    const getCourseId = () => {
        if (params.slug) {
            const courseId = localStorage.getItem(`course_${params.slug}`);
            const enrolled = localStorage.getItem(`course_${params.slug}_enrolled`) === 'true';
            const pending = localStorage.getItem(`course_${params.slug}_pending`) === 'true';
            setIsEnrolled(enrolled);
            setIsPending(pending);
            if (courseId) {
                return courseId;
            } else {
                console.error('Không tìm thấy ID khóa học cho slug:', params.slug);
                return null;
            }
        }
        return params.id;
    };

    useEffect(() => {
        const fetchCourse = async () => {
            const courseId = getCourseId();
            console.log('CourseDetailPage - Fetching course with ID:', courseId);
            
            if (!courseId) {
                setLoading(false);
                return;
            }
            
            const courseData = await getCourseById(courseId);
            console.log('CourseDetailPage - Course data received:', courseData);
            setCourse(courseData);

            // Kiểm tra xem khóa học có trong danh sách đang chờ duyệt không
            if (courseData && pendingCourses.length > 0) {
                console.log('Pending courses:', pendingCourses);
                const isCoursePending = pendingCourses.some(pendingCourse => 
                    pendingCourse.id === courseData.id || 
                    pendingCourse.id === courseData.id.toString()
                );
                console.log('Is course pending:', isCoursePending);
                setIsPending(isCoursePending);
            }

            if (courseData && courseData.lesson && courseData.lesson.length > 0) {
                const sortedLessons = [...courseData.lesson].sort((a, b) => a.order - b.order);
                const firstLessonId = sortedLessons[0].id;
                setOpenChapters({ [firstLessonId]: true });
            }
            setLoading(false);
        };
        fetchCourse();
    }, [params, pendingCourses]);

    if (loading) {
        return <div style={{ padding: 32 }}>Đang tải...</div>;
    }

    if (!course || !course.lesson) {
        return <div style={{ padding: 32 }}>Khóa học không tồn tại hoặc không có nội dung!</div>;
    }

    const toggleChapter = (chapterId) => {
        setOpenChapters(prev => ({
            ...prev,
            [chapterId]: !prev[chapterId]
        }));
    };

    const handleRegister = async () => {
        if (isEnrolled || isPending) {
            navigate(`/learning/${course.id}`);
        } else {
            try {
                setIsRegistering(true);
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const formData = new FormData();
                formData.append('courseId', course.id.toString());

                // Gửi yêu cầu đăng ký (pending)
                const response = await axios.post('http://localhost:8080/lms/joinclass/pending', formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.data && response.data.code === 0) {
                    // Nếu khóa học có status là PUBLIC, tự động phê duyệt
                    if (course.status === 'PUBLIC' && studentId) {
                        try {
                            const approveFormData = new FormData();
                            approveFormData.append('courseId', course.id.toString());
                            approveFormData.append('studentId', studentId.toString());

                            // Gọi API phê duyệt tự động
                            const approveResponse = await axios.post('http://localhost:8080/lms/joinclass/approved', 
                                approveFormData, {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'multipart/form-data'
                                }
                            });

                            if (approveResponse.data && approveResponse.data.code === 0) {
                                setIsEnrolled(true);
                                setIsPending(false);
                                
                                // Cập nhật localStorage
                                if (params.slug) {
                                    localStorage.setItem(`course_${params.slug}_enrolled`, 'true');
                                    localStorage.setItem(`course_${params.slug}_pending`, 'false');
                                }
                                
                                showAlert('success', 'Thành công', 'Đăng ký khóa học thành công! Bạn có thể bắt đầu học ngay.');
                                
                                // Sau 2 giây, chuyển hướng người dùng đến trang học
                                setTimeout(() => {
                                    navigate(`/learning/${course.id}`);
                                }, 1000);
                                return;
                            }
                        } catch (approveError) {
                            console.error('Error auto-approving course:', approveError);
                            // Nếu lỗi khi tự động phê duyệt, vẫn coi như đăng ký thành công và chờ duyệt
                        }
                    }
                    
                    // Nếu không phải khóa học PUBLIC hoặc việc tự động phê duyệt thất bại
                    // Cập nhật trạng thái chờ duyệt và hiển thị thông báo
                    setIsPending(true);
                    if (params.slug) {
                        localStorage.setItem(`course_${params.slug}_pending`, 'true');
                    }
                    
                    // Cập nhật danh sách khóa học đang chờ duyệt
                    if (studentId) {
                        await fetchPendingCourses(studentId);
                    }
                    
                    showAlert('success', 'Thành công', 'Đăng ký khóa học thành công! Vui lòng chờ giảng viên phê duyệt.');
                } else {
                    throw new Error(response.data?.message || 'Đăng ký khóa học thất bại');
                }
            } catch (error) {
                console.error('Error registering for course:', error);
                console.error('Error response:', error.response?.data);
                showAlert('error', 'Lỗi', 'Có lỗi xảy ra khi đăng ký khóa học. Vui lòng thử lại sau.');
            } finally {
                setIsRegistering(false);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const numChapters = course.lesson.length;
    const totalLessons = course.lesson.reduce((sum, chapter) => {
        return sum + (chapter.chapter ? chapter.chapter.length : 0);
    }, 0);
    const totalItemsFallback = course.lesson.reduce((sum, chapter) => {
        return sum + (chapter.lessonMaterial?.length || 0) + (chapter.lessonQuiz?.length || 0);
    }, 0);
    const displayLessonOrItemCount = totalLessons > 0 ? totalLessons : totalItemsFallback;
    const lessonOrItemText = totalLessons > 0 ? 'bài học' : 'mục';

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
        if (!id) return colors[0]; // Default color if id is missing
        const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[sum % colors.length];
    };

    // Sắp xếp bài học theo thứ tự
    const sortedLessons = [...(course.lesson || [])].sort((a, b) => a.order - b.order);

    return (
        <div className="course-detail-container">
            {alert && (
                <div className="alert-container">
                    <Alert
                        type={alert.type}
                        title={alert.title}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                </div>
            )}
            <div className="left-column">
                <h1 className="course-detail-title">{course.name}</h1>
                <p className="course-description">{course.description}</p>

                {course.whatYouWillLearn && (
                    <>
                        <h3 style={{margin: 0}}>Bạn sẽ học được gì?</h3>
                        <ul className="benefits-list">
                            {course.whatYouWillLearn.map((item, index) => (
                                <li key={index}><Check size={18} className='benefit-list-check'/> <span>{item}</span></li>
                            ))}
                        </ul>
                    </>
                )}

                <div className="course-summary">
                    <h3>Nội dung khóa học</h3>
                    <p>
                        <strong>{sortedLessons.length}</strong> chương · 
                        <strong>{displayLessonOrItemCount}</strong> {lessonOrItemText} · 
                        Thời gian học: <strong>{formatDate(course.startDate)} - {course.endDate ? formatDate(course.endDate) : "Không giới hạn"}</strong>
                    </p>
                </div>

                <div className="course-content">
                    {sortedLessons.map((lesson, idx) => {
                        const chapterId = lesson.id || idx;
                        return (
                            <div key={lesson.id} className="chapter">
                                <div className="chapter-title" onClick={() => toggleChapter(chapterId)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {openChapters[lesson.id] ? <Minus size={18} color='#066fbf' /> : <Plus size={18} color='#066fbf'/>}
                                        <span style={{ fontWeight: '600', paddingBottom: '3px' }}>{idx + 1}. {lesson.description}</span>
                                    </div>
                                    <span style={{ fontSize: '0.9rem' }}>
                                        {lesson.chapter && lesson.chapter.length > 0
                                            ? `${lesson.chapter.length} bài học`
                                            : `${(lesson.lessonMaterial?.length || 0) + (lesson.lessonQuiz?.length || 0)} mục`}
                                    </span>
                                </div>
                                {openChapters[lesson.id] && (
                                    <ul className="lesson-list">
                                        {lesson.chapter && lesson.chapter.length > 0 ? (
                                            [...lesson.chapter]
                                                .sort((a, b) => (a.order || 0) - (b.order || 0))
                                                .map((chapter, chapterIdx) => (
                                                <li key={chapter.id || chapterIdx}>
                                                    <div className='d-flex align-center'>
                                                        <CirclePlay size={16} color='#066fbf' opacity={0.4}/>
                                                        <span style={{marginLeft: '12px', paddingBottom: '3px', fontSize: '0.9rem'}}>
                                                            {chapterIdx + 1}. {chapter.name || chapter.description || 'Bài học không tên'} 
                                                        </span>
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <li><span style={{ marginLeft: '28px', fontSize: '0.9rem', fontStyle: 'italic' }}>Chưa có bài học cụ thể.</span></li>
                                        )}
                                        
                                        {lesson.lessonMaterial && lesson.lessonMaterial.length > 0 && (
                                            <li>
                                                <div className='d-flex align-center'>
                                                    <CirclePlay size={16} color='#066fbf' opacity={0.4}/>
                                                    <span style={{marginLeft: '12px', paddingBottom: '3px', fontSize: '0.9rem'}}>
                                                        Tài liệu chương ({lesson.lessonMaterial.length})
                                                    </span>
                                                </div>
                                            </li>
                                        )}
                                        {lesson.lessonQuiz && lesson.lessonQuiz.length > 0 && (
                                            <li>
                                                <div className='d-flex align-center'>
                                                    <CirclePlay size={16} color='#066fbf' opacity={0.4}/>
                                                    <span style={{marginLeft: '12px', paddingBottom: '3px', fontSize: '0.9rem'}}>
                                                        Bài kiểm tra chương ({lesson.lessonQuiz.length})
                                                    </span>
                                                </div>
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="right-column">
                <div className="course-thumbnail">
                    {course.image ? (
                        <img src={course.image} alt={course.name} className="course-thumbnail-img" />
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
                <div className="price-box">
                    {console.log(typeof isPending, isPending)}
                    <button 
                        className="register-btn" 
                        onClick={handleRegister}
                        disabled={isPending}
                    >
                        {isEnrolled ? 'TIẾP TỤC HỌC' : 
                         isPending ? 'ĐANG CHỜ DUYỆT' : 
                         isRegistering ? 'ĐANG ĐĂNG KÝ...' : 'ĐĂNG KÝ HỌC'}
                    </button>
                    <ul className="info-list">
                        <li><SquareUser size={16} className='mr-16'/>Giảng viên: {course.teacher?.fullName || 'Người dạy học'}</li>
                        <li><GraduationCap size={16} className='mr-16'/>Chuyên ngành: {course.major}</li>
                        <li><Film size={16} className='mr-16'/> Tổng số {numChapters} chương / {displayLessonOrItemCount} {lessonOrItemText}</li>
                        <li><AlarmClock size={16} className='mr-16'/> {course.learningDurationType}</li>
                        <li><Clock size={16} className='mr-16'/> Thời gian học: {formatDate(course.startDate)} - {course.endDate ? formatDate(course.endDate) : "Không giới hạn"}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;
