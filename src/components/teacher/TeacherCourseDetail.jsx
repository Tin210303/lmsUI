import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import '../../assets/css/teacher-course-detail.css';
import { CircleGauge, Film, Clock, AlarmClock, FileText, FileQuestion, File, Plus, SquareUser, GraduationCap, FolderPen } from 'lucide-react';
import Alert from '../common/Alert';

const TeacherCourseDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { courseId } = location.state || {};
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedLessons, setExpandedLessons] = useState({});
    const [showAddLessonModal, setShowAddLessonModal] = useState(false);
    const [alert, setAlert] = useState(null);
    const [newLesson, setNewLesson] = useState({
        description: '',
        order: 1
    });
    
    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
    };

    useEffect(() => {
        const fetchCourseDetail = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                if (!courseId) {
                    throw new Error('Course ID not found');
                }

                const response = await axios.get(`http://localhost:8080/lms/course/${courseId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setCourse(response.data.result);
                
                // Mở rộng chương có thứ tự nhỏ nhất
                if (response.data.result.lesson?.length > 0) {
                    const sortedLessons = [...response.data.result.lesson].sort((a, b) => a.order - b.order);
                    const firstLessonId = sortedLessons[0].id;
                    setExpandedLessons({ [firstLessonId]: true });
                }
            } catch (err) {
                showAlert('error', 'Lỗi', err.response?.data?.message || err.message);
                console.error("Error fetching course details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetail();
    }, [courseId]);

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
        if (!id) return colors[0]; // Default color if id is missing
        const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[sum % colors.length];
    };

    const handleManageCourse = () => {
        navigate(`/teacher/course-management/${courseId}`, {
            state: { courseId, courseName: course.name }
        });
    };

    const toggleLesson = (lessonId) => {
        setExpandedLessons(prev => ({
            ...prev,
            [lessonId]: !prev[lessonId]
        }));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const handleAddLesson = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Tính order mới là max hiện tại + 1
            const currentMaxOrder = Math.max(...course.lesson.map(l => l.order), 0);
            const newOrder = currentMaxOrder + 1;

            const response = await axios.post('http://localhost:8080/lms/lesson/create', {
                courseId,
                description: newLesson.description,
                order: newOrder
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.code === 0) {
                // Refresh lại dữ liệu khóa học
                const updatedCourse = await axios.get(`http://localhost:8080/lms/course/${courseId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setCourse(updatedCourse.data.result);
                setShowAddLessonModal(false);
                setNewLesson({ description: '', order: 1 });
                showAlert('success', 'Thành công', 'Thêm chương mới thành công!');
            }
        } catch (err) {
            console.error("Error creating lesson:", err);
            showAlert('error', 'Lỗi', 'Có lỗi xảy ra khi thêm chương mới');
        }
    };

    if (loading) {
        return <div className="teacher-course-detail-container">
            <div>Đang tải dữ liệu...</div>
        </div>;
    }

    if (error) {
        return <div className="teacher-course-detail-container">
            <div>Có lỗi xảy ra: {error}</div>
        </div>;
    }

    if (!course) {
        return <div className="teacher-course-detail-container">
            <div>Không tìm thấy khóa học</div>
        </div>;
    }

    // Sắp xếp bài học theo thứ tự
    const sortedLessons = [...(course.lesson || [])].sort((a, b) => a.order - b.order);

    // Tính tổng số chapter (bài học nhỏ)
    const totalChapters = sortedLessons.reduce((sum, lesson) => sum + (lesson.chapter?.length || 0), 0);

    return (
        <div className="teacher-course-detail-container">
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
            <div className="course-detail-header">
                <h1>{course.name}</h1>
                <p className="course-description">{course.description}</p>
            </div>
            <div className="teacher-course-content-wrapper">
                <div className="teacher-course-content">
                    <div className="teacher-content-header">
                        <div className="teacher-content-header-top">
                            <h2>Nội dung khóa học</h2>
                            <button className="teacher-add-chapter-button" onClick={() => setShowAddLessonModal(true)}>
                                <Plus size={16} />
                                <span style={{ marginLeft: '5px' }}>Thêm chương</span>
                            </button>
                        </div>
                        <div className="teacher-content-summary">
                            {sortedLessons.length} chương • {totalChapters} bài học • {course.learningDurationType}
                        </div>
                    </div>
                    
                    <div className="teacher-chapters-list">
                        {sortedLessons.map((lesson) => (
                            <div key={lesson.id} className="teacher-chapter-item">
                                <div className="teacher-chapter-header" onClick={() => toggleLesson(lesson.id)}>
                                    <div className="teacher-chapter-collapse">
                                        {expandedLessons[lesson.id] ? "-" : "+"}
                                    </div>
                                    <div className="teacher-chapter-title">Chương {lesson.order}: {lesson.description}</div>
                                    <div className="teacher-chapter-lesson-count">
                                        {(lesson.chapter?.length || 0)} bài học
                                    </div>
                                </div>
                                
                                {expandedLessons[lesson.id] && (
                                    <div className="teacher-chapter-content">
                                        {/* Chapters */}
                                        {lesson.chapter && lesson.chapter.length > 0 && (
                                            <div className="teacher-lesson-section">
                                                <h4>Bài học</h4>
                                                {lesson.chapter
                                                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                                                    .map((chapter) => (
                                                    <div key={chapter.id} className="teacher-lesson-item">
                                                        <div className="teacher-lesson-icon">
                                                            <FileText size={16} />
                                                        </div>
                                                        <div className="teacher-lesson-title">
                                                            {chapter.name}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Quiz */}
                                        {lesson.lessonQuiz && lesson.lessonQuiz.length > 0 && (
                                            <div className="teacher-lesson-section">
                                                <h4>Bài kiểm tra</h4>
                                                {lesson.lessonQuiz.map((quiz, idx) => (
                                                    <div key={idx} className="teacher-lesson-item">
                                                        <div className="teacher-lesson-icon">
                                                            <FileQuestion size={16} />
                                                        </div>
                                                        <div className="teacher-lesson-title">
                                                            {quiz.question}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Tài liệu học */}
                                        {lesson.lessonMaterial && lesson.lessonMaterial.length > 0 && (
                                            <div className="teacher-lesson-section">
                                                <h4>Tài liệu học tập</h4>
                                                {lesson.lessonMaterial.map((material, idx) => (
                                                    <div key={idx} className="teacher-lesson-item">
                                                        <div className="teacher-lesson-icon">
                                                            <File size={16} />
                                                        </div>
                                                        <div className="teacher-lesson-title">
                                                            {material.path.split('/').pop()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="teacher-lesson-actions">
                                            <button 
                                                className="teacher-action-button material-button"
                                                onClick={() => navigate('/teacher/add-material', {
                                                    state: { 
                                                        courseId,
                                                        lessonId: lesson.id,
                                                        lessonName: `Chương ${lesson.order}: ${lesson.description}`,
                                                        type: 'material'
                                                    }
                                                })}
                                            >
                                                <FileText size={16} />
                                                <span>Thêm tài liệu</span>
                                            </button>
                                            <button 
                                                className="teacher-action-button quiz-button"
                                                onClick={() => navigate('/teacher/add-quiz', {
                                                    state: { 
                                                        courseId,
                                                        lessonId: lesson.id,
                                                        lessonName: `Chương ${lesson.order}: ${lesson.description}`,
                                                        type: 'quiz'
                                                    }
                                                })}
                                            >
                                                <FileQuestion size={16} />
                                                <span>Thêm bài kiểm tra</span>
                                            </button>
                                            <button 
                                                className="teacher-action-button content-button"
                                                onClick={() => navigate('/teacher/add-lesson', {
                                                    state: { 
                                                        courseId,
                                                        lessonId: lesson.id,
                                                        lessonName: `Chương ${lesson.order}: ${lesson.description}`,
                                                        type: 'content'
                                                    }
                                                })}
                                            >
                                                <Plus size={16} />
                                                <span>Thêm bài học</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="teacher-course-sidebar">
                    <div className="teacher-course-sidebar-image">
                        {course.image ? (
                            <img src={course.image} alt={course.name} className="teacher-course-sidebar-img" />
                        ) : (
                            <div className="course-placeholder" style={{ background: getConsistentColor(courseId) }}>
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

                    <button className="teacher-edit-button d-flex justify-center align-center" onClick={handleManageCourse}>
                        <FolderPen size={16} />
                        <span style={{marginLeft: '8px'}}>Quản lý khóa học</span>
                    </button>

                    <div className="teacher-course-info">
                        <div className="teacher-info-item">
                            <SquareUser size={16} className='mr-16'/>
                            <span className="teacher-info-text">Giảng viên: {course.teacher.fullName}</span>
                        </div>
                        <div className="teacher-info-item">
                            <CircleGauge size={16} className='mr-16'/>
                            <span className="teacher-info-text">
                                {course.status === 'PUBLIC' ? "Khóa học chung" : "Khóa học riêng tư"}
                            </span>
                        </div>
                        <div className="teacher-info-item">
                            <Film size={16} className='mr-16'/>
                            <span className="teacher-info-text">Tổng số {course.lesson?.length || 0} chương</span>
                        </div>
                        <div className="teacher-info-item">
                            <Clock size={16} className='mr-16'/>
                            <span className="teacher-info-text">{course.learningDurationType}</span>
                        </div>
                        <div className="teacher-info-item">
                            <AlarmClock size={16} className='mr-16'/>
                            <span className="teacher-info-text">
                                Từ {formatDate(course.startDate)} 
                                {course.endDate ? ` đến ${formatDate(course.endDate)}` : ''}
                            </span>
                        </div>
                        <div className="teacher-info-item">
                            <GraduationCap size={16} className='mr-16'/>
                            <span className="teacher-info-text">Chuyên ngành: {course.major}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal thêm chương mới */}
            {showAddLessonModal && (
                <div className="teacher-modal-overlay">
                    <div className="teacher-modal">
                        <h3>Thêm chương mới</h3>
                        <div className="teacher-modal-content">
                            <div className="form-group">
                                <label>Tiêu đề chương</label>
                                <input
                                    type='text'
                                    value={newLesson.description}
                                    onChange={(e) => setNewLesson(prev => ({
                                        ...prev,
                                        description: e.target.value
                                    }))}
                                    rows={4}
                                />
                            </div>
                        </div>
                        <div className="teacher-modal-actions">
                            <button 
                                onClick={() => {
                                    setShowAddLessonModal(false);
                                    setNewLesson({ description: '', order: 1 });
                                }} 
                                className="teacher-modal-cancel"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={handleAddLesson}
                                className="teacher-modal-confirm" 
                                disabled={!newLesson.description.trim()}
                            >
                                Thêm chương
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherCourseDetail; 