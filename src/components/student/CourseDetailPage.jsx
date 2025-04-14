import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../../services/courseService';
import '../../assets/css/course-detail.css';
import { Check, CirclePlay, CircleGauge, Film, Clock, AlarmClock, Plus, Minus } from 'lucide-react';

const CourseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openChapters, setOpenChapters] = useState({});

    useEffect(() => {
        const fetchCourse = async () => {
            console.log('CourseDetailPage - Fetching course with ID:', id);
            const courseData = await getCourseById(id);
            console.log('CourseDetailPage - Course data received:', courseData);
            setCourse(courseData);
            if (courseData && courseData.lesson && courseData.lesson.length > 0) {
                setOpenChapters({ [courseData.lesson[0].id || 0]: true });
            }
            setLoading(false);
        };
        fetchCourse();
    }, [id]);

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

    const handleRegister = () => {
        navigate(`/learning/${id}`);
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

    return (
        <div className="course-detail-container">
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
                        <strong>{numChapters}</strong> chương · 
                        <strong>{displayLessonOrItemCount}</strong> {lessonOrItemText} · 
                        Thời gian học: <strong>{formatDate(course.startDate)} - {formatDate(course.endDate)}</strong>
                    </p>
                </div>

                <div className="course-content">
                    {course.lesson.map((chapter, idx) => {
                        const chapterId = chapter.id || idx;
                        const isOpen = openChapters[chapterId];
                        return (
                            <div key={chapterId} className="chapter">
                                <div className="chapter-title" onClick={() => toggleChapter(chapterId)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {isOpen ? <Minus size={18} color='#066fbf' /> : <Plus size={18} color='#066fbf'/>}
                                        <span style={{ fontWeight: '600', paddingBottom: '3px' }}>{idx + 1}. {chapter.description}</span>
                                    </div>
                                    <span style={{ fontSize: '0.9rem' }}>
                                        {chapter.chapter && chapter.chapter.length > 0
                                            ? `${chapter.chapter.length} bài học`
                                            : `${(chapter.lessonMaterial?.length || 0) + (chapter.lessonQuiz?.length || 0)} mục`}
                                    </span>
                                </div>
                                {isOpen && (
                                    <ul className="lesson-list">
                                        {chapter.chapter && chapter.chapter.length > 0 ? (
                                            chapter.chapter.map((lesson, lessonIdx) => (
                                                <li key={lesson.id || lessonIdx}>
                                                    <div className='d-flex align-center'>
                                                        <CirclePlay size={16} color='#066fbf' opacity={0.4}/>
                                                        <span style={{marginLeft: '12px', paddingBottom: '3px', fontSize: '0.9rem'}}>
                                                            {lessonIdx + 1}. {lesson.name || lesson.description || 'Bài học không tên'} 
                                                        </span>
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <li><span style={{ marginLeft: '28px', fontSize: '0.9rem', fontStyle: 'italic' }}>Chưa có bài học cụ thể.</span></li>
                                        )}
                                        
                                        {chapter.lessonMaterial && chapter.lessonMaterial.length > 0 && (
                                            <li>
                                                <div className='d-flex align-center'>
                                                    <CirclePlay size={16} color='#066fbf' opacity={0.4}/>
                                                    <span style={{marginLeft: '12px', paddingBottom: '3px', fontSize: '0.9rem'}}>
                                                        Tài liệu chương ({chapter.lessonMaterial.length})
                                                    </span>
                                                </div>
                                            </li>
                                        )}
                                        {chapter.lessonQuiz && chapter.lessonQuiz.length > 0 && (
                                            <li>
                                                <div className='d-flex align-center'>
                                                    <CirclePlay size={16} color='#066fbf' opacity={0.4}/>
                                                    <span style={{marginLeft: '12px', paddingBottom: '3px', fontSize: '0.9rem'}}>
                                                        Bài kiểm tra chương ({chapter.lessonQuiz.length})
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
                {course.videoPreview && (
                    <div className="video-preview">
                        <iframe width="100%" height="200" src={course.videoPreview} frameBorder="0" allowFullScreen></iframe>
                    </div>
                )}
                <div className="price-box">
                    <p className="free-label">{course.status === 'PUBLIC' ? 'Miễn phí' : 'Trả phí'}</p>
                    <button className="register-btn" onClick={handleRegister}>ĐĂNG KÝ HỌC</button>
                    <ul className="info-list">
                        <li><CircleGauge size={16} className='mr-16'/> {course.major}</li>
                        <li><Film size={16} className='mr-16'/> Tổng số {numChapters} chương / {displayLessonOrItemCount} {lessonOrItemText}</li>
                        <li><Clock size={16} className='mr-16'/> Thời gian học: {formatDate(course.startDate)} - {formatDate(course.endDate)}</li>
                        <li><AlarmClock size={16} className='mr-16'/> {course.learningDurationType}</li>
                    </ul>
                    <div className="teacher-info">
                        <h4>Giảng viên</h4>
                        <p>{course.teacher?.fullName || 'N/A'}</p>
                        <p>{course.teacher?.email || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;
