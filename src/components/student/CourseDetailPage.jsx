import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../../services/courseService';
import { GET_STATUS_API, API_BASE_URL, GET_STUDENT_INFO } from '../../services/apiService';
import axios from 'axios';
import '../../assets/css/course-detail.css';
import { Check, CirclePlay, Film, Clock, AlarmClock, Plus, Minus, SquareUser, GraduationCap, DollarSign } from 'lucide-react';
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
    const [isRejected, setIsRejected] = useState(false);
    const [studentId, setStudentId] = useState(null);
    const [alert, setAlert] = useState(null);
    const [courseImage, setCourseImage] = useState(null);
    const [isPurchasing, setIsPurchasing] = useState(false);

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
    };
    
    // Hàm lấy thông tin sinh viên
    const fetchStudentInfo = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const response = await axios.get(GET_STUDENT_INFO, {
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

    // Hàm kiểm tra trạng thái đăng ký khóa học của sinh viên
    const checkEnrollmentStatus = async (courseId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            // Chuẩn bị form data
            const formData = new FormData();
            formData.append('courseId', courseId);

            // Gọi API kiểm tra trạng thái
            const response = await axios.get(`${GET_STATUS_API}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    courseId: courseId
                }
            });

            if (response.data && response.data.code === 0) {
                const status = response.data.result;
                
                // Cập nhật trạng thái dựa vào kết quả từ API
                setIsEnrolled(status === 'APPROVED');
                setIsPending(status === 'PENDING');
                setIsRejected(status === 'REJECTED');
                
                console.log('Enrollment status:', status);
            }
        } catch (error) {
            console.error('Error checking enrollment status:', error);
        }
    };

    useEffect(() => {
        fetchStudentInfo();
    }, []);

    const getCourseId = () => {
        if (params.slug) {
            const courseId = localStorage.getItem(`course_${params.slug}`);
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
            
            try {
                const courseData = await getCourseById(courseId);
                console.log('CourseDetailPage - Course data received:', courseData);
                setCourse(courseData);

                // Kiểm tra trạng thái đăng ký của sinh viên
                await checkEnrollmentStatus(courseId);

                if (courseData && courseData.lesson && courseData.lesson.length > 0) {
                    const sortedLessons = [...courseData.lesson].sort((a, b) => a.order - b.order);
                    const firstLessonId = sortedLessons[0].id;
                    setOpenChapters({ [firstLessonId]: true });
                }
            } catch (error) {
                console.error('Error fetching course data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchCourse();
    }, [params]);

    useEffect(() => {
        let imageObjectUrl = null;
        
        const fetchCourseImage = async () => {
            if (course && course.image) {
                try {
                    const token = localStorage.getItem('authToken');
                    if (!token) {
                        console.error('No authentication token found');
                        return;
                    }
                    
                    const imageUrl = `${API_BASE_URL}${course.image}`;
                    console.log(`u0110ang tu1ea3i u1ea3nh khu00f3a hu1ecdc tu1eeb: ${imageUrl}`);
                    
                    const response = await axios({
                        method: 'GET',
                        url: imageUrl,
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        responseType: 'blob'
                    });
                    
                    imageObjectUrl = URL.createObjectURL(response.data);
                    setCourseImage(imageObjectUrl);
                } catch (error) {
                    console.error('Lu1ed7i khi tu1ea3i u1ea3nh khu00f3a hu1ecdc:', error);
                }
            }
        };
        
        fetchCourseImage();
        
        return () => {
            if (imageObjectUrl) {
                URL.revokeObjectURL(imageObjectUrl);
            }
        };
    }, [course]);

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

    // Hàm mua khóa học qua Paypal
    const handlePurchaseCourse = async () => {
        try {
            setIsPurchasing(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Dữ liệu thanh toán
            const paymentData = {
                price: course.price,
                currency: "USD",
                method: "paypal",
                intent: "sale",
                description: `Payment for course: ${course.name}`,
                cancelUrl: "http://localhost:3000/paypal/cancel",
                successUrl: "http://localhost:3000/paypal/success",
                courseId: course.id
            };

            // Gọi API thanh toán
            const response = await axios.post('http://localhost:8080/lms/paypal/pay', paymentData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.code === 0) {
                // Mở URL thanh toán trong tab mới
                const paymentUrl = response.data.message;
                if (paymentUrl) {
                    window.open(paymentUrl, '_blank');
                    showAlert('info', 'Chuyển hướng', 'Đang chuyển sang trang thanh toán PayPal. Vui lòng hoàn tất thanh toán.');
                } else {
                    throw new Error('Không nhận được đường dẫn thanh toán');
                }
            } else {
                throw new Error(response.data?.message || 'Khởi tạo thanh toán thất bại');
            }
        } catch (error) {
            console.error('Error purchasing course:', error);
            showAlert('error', 'Lỗi', `Có lỗi xảy ra khi khởi tạo thanh toán: ${error.message}`);
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleRegister = async () => {
        // Nếu sinh viên đã đăng ký thành công (đã được phê duyệt), chuyển đến trang học
        if (isEnrolled) {
            navigate(`/learning/${course.id}`);
            return;
        }
        
        // Nếu đang chờ phê duyệt, thông báo cho sinh viên
        if (isPending) {
            showAlert('info', 'Đang chờ phê duyệt', 'Yêu cầu đăng ký khóa học của bạn đang chờ được phê duyệt.');
            return;
        }

        // Nếu khóa học có phí và chưa đăng ký
        if (course.feeType === 'CHARGEABLE' && !isEnrolled && !isPending) {
            handlePurchaseCourse();
            return;
        }

        // Xử lý khóa học miễn phí chưa đăng ký
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
                // Kiểm tra lại trạng thái sau khi đăng ký
                await checkEnrollmentStatus(course.id);
                
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
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    // Format giá tiền
    const formatPrice = (price) => {
        if (!price && price !== 0) return 'Miễn phí';
        if (price === 0) return 'Miễn phí';
        return `${price.toLocaleString('vi-VN')}$`;
    };

    // Xác định text và style cho button
    const getButtonText = () => {
        if (isEnrolled) return 'TIẾP TỤC HỌC';
        if (isPending) return 'ĐANG CHỜ DUYỆT';
        if (isRejected) return 'ĐÃ BỊ TỪ CHỐI';
        if (isPurchasing || isRegistering) return 'ĐANG XỬ LÝ...';
        return course.feeType === 'CHARGEABLE' ? 'MUA KHÓA HỌC' : 'ĐĂNG KÝ HỌC';
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
                        Thời gian học: <strong>{course.endDate ? `${formatDate(course.startDate)} - ${formatDate(course.endDate)}` : "Không giới hạn"}</strong>
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
                    {courseImage ? (
                        <img src={courseImage} alt={course.name} className="course-thumbnail-img" />
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
                    {course.feeType === 'CHARGEABLE' && (
                        <div className="course-price">
                            <DollarSign size={18} />
                            <span>{formatPrice(course.price)}</span>
                        </div>
                    )}
                    
                    <button 
                        className={`register-btn ${course.feeType === 'CHARGEABLE' ? 'purchase-btn' : ''}`}
                        onClick={handleRegister}
                        disabled={isPending || isPurchasing || isRegistering}
                    >
                        {getButtonText()}
                    </button>
                    
                    <ul className="info-list">
                        <li><SquareUser size={16} className='mr-16'/>Giảng viên: {course.teacher?.fullName || 'Người dạy học'}</li>
                        <li><GraduationCap size={16} className='mr-16'/>Chuyên ngành: {course.major}</li>
                        <li><Film size={16} className='mr-16'/> Tổng số {numChapters} chương / {displayLessonOrItemCount} {lessonOrItemText}</li>
                        <li><AlarmClock size={16} className='mr-16'/> {course.learningDurationType === 'LIMITED' ? 'Có thời hạn' : 'Không thời hạn'}</li>
                        <li><Clock size={16} className='mr-16'/> Thời gian học: {formatDate(course.startDate)} - {course.endDate ? formatDate(course.endDate) : "Không giới hạn"}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;
