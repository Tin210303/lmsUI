import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, BookOpen, HelpCircle, MessageSquare, FileText, Download, Menu } from 'lucide-react';
import logo from '../../assets/imgs/logo.png';
import '../../assets/css/learning-page.css';
import CommentSection from './CommentSection';
import LearningContent from './LearningContent';

const LearningPage = () => {
const { id } = useParams();
const navigate = useNavigate();
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentChapterId, setCurrentChapterId] = useState(null);
    const [currentLessonId, setCurrentLessonId] = useState(null);
const [currentChapter, setCurrentChapter] = useState('');
const [sidebarVisible, setSidebarVisible] = useState(true);
    const [currentContent, setCurrentContent] = useState(null);

    // Fetch course data from API
useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(`http://localhost:8080/lms/course/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                setCourseData(response.data.result);
                // Set initial active chapter and lesson
                if (response.data.result.lesson && response.data.result.lesson.length > 0) {
                    const firstLesson = response.data.result.lesson[0];
                    setCurrentChapterId(firstLesson.id);
                    setCurrentChapter(firstLesson.description);
                    
                    // If there are chapters, set the first chapter as active
                    if (firstLesson.chapter && firstLesson.chapter.length > 0) {
                        setCurrentLessonId(firstLesson.chapter[0].id);
                    }
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [id]);

    const handleToggleChapter = (chapterId) => {
        setCurrentChapterId(currentChapterId === chapterId ? null : chapterId);
    };

    const handleLessonClick = (chapterId, lessonId, chapterTitle) => {
        setCurrentChapterId(chapterId);
        setCurrentLessonId(lessonId);
        setCurrentChapter(chapterTitle);
};

const handleBackToCourses = () => {
    navigate('/courses');
};

    const handlePrevious = () => {
        if (!courseData?.lesson || !currentChapterId) return;
        
        // Tìm lesson hiện tại
        const currentLesson = courseData.lesson.find(l => l.id === currentChapterId);
        if (!currentLesson?.chapter) return;

        // Tìm index của chapter hiện tại trong lesson
        const currentChapterIndex = currentLesson.chapter.findIndex(c => c.id === currentLessonId);
        if (currentChapterIndex > 0) {
            // Lấy chapter trước đó trong cùng lesson
            const prevChapter = currentLesson.chapter[currentChapterIndex - 1];
            setCurrentLessonId(prevChapter.id);
            setCurrentContent(prevChapter);
        }
    };

    const handleNext = () => {
        if (!courseData?.lesson || !currentChapterId) return;
        
        // Tìm lesson hiện tại
        const currentLesson = courseData.lesson.find(l => l.id === currentChapterId);
        if (!currentLesson?.chapter) return;

        // Tìm index của chapter hiện tại trong lesson
        const currentChapterIndex = currentLesson.chapter.findIndex(c => c.id === currentLessonId);
        if (currentChapterIndex < currentLesson.chapter.length - 1) {
            // Lấy chapter tiếp theo trong cùng lesson
            const nextChapter = currentLesson.chapter[currentChapterIndex + 1];
            setCurrentLessonId(nextChapter.id);
            setCurrentContent(nextChapter);
        }
    };

    const handleDownload = () => {
        if (currentContent?.type === 'material') {
            // Implement download functionality
            console.log('Download clicked');
        }
    };

    const handleComment = () => {
        // Implement comment functionality
        console.log('Comment clicked');
    };

    const handleHelp = () => {
        // Implement help functionality
        console.log('Help clicked');
    };

    const handleNotes = () => {
        // Implement notes functionality
        console.log('Notes clicked');
    };

    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>Có lỗi xảy ra: {error}</div>;
    if (!courseData) return <div>Không tìm thấy khóa học</div>;

    // Calculate total lessons and completed lessons
    const totalLessons = courseData.lesson.reduce((total, chapter) => 
        total + (chapter.chapter ? chapter.chapter.length : 0), 0);
    const completedLessons = 0; // This should be updated based on your actual data
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return (
        <div className="learning-container">
            {/* Header */}
            <header className="learning-header">
                <div className="header-left">
                    <button onClick={handleBackToCourses} className="back-button">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="course-logo-title">
                        <img src={logo} alt="Logo" className="header-logo" />
                        <h1 className="learning-course-title">{courseData.name}</h1>
                    </div>
                </div>
                <div className="header-right">
                    <div className="progress-info">
                        <span className="progress-percent">{progress}%</span>
                        <span className="progress-text">{completedLessons}/{totalLessons} bài học</span>
                    </div>
                    <button className="header-button">
                        <BookOpen size={16} />
                        <span>Ghi chú</span>
                    </button>
                    <button className="header-button">
                        <HelpCircle size={16} />
                        <span>Hướng dẫn</span>
                    </button>
                </div>
            </header>

            {/* Main content */}
            <div className="learning-content">
                {/* Left content area */}
                <div className="content-area">
                    {currentLessonId && courseData.lesson.map(chapter => 
                        chapter.chapter?.find(lesson => lesson.id === currentLessonId)
                    ).filter(Boolean)[0] ? (
                        <LearningContent 
                            currentLesson={courseData.lesson.map(chapter => 
                                chapter.chapter?.find(lesson => lesson.id === currentLessonId)
                            ).filter(Boolean)[0]}
                            content={currentContent}
                            onDownload={handleDownload}
                        />
                    ) : (
                        <div className="content-placeholder">
                            <h3>Vui lòng chọn một bài học để xem nội dung</h3>
                    </div>
                    )}
                    {/* <CommentSection lessonId={currentLessonId} /> */}
                </div>

                {/* Right sidebar */}
                <div className={`course-sidebar ${!sidebarVisible ? 'hidden' : ''}`}>
                    <div className="sidebar-header">
                        <h3>Nội dung khóa học</h3>
                    </div>
                    <div className="chapters-list">
                        {courseData.lesson
                            .sort((a, b) => a.order - b.order)
                            .map((chapter) => (
                            <div key={chapter.id} className="chapter-item">
                                <div 
                                    className={`chapter-header ${currentChapterId === chapter.id ? 'active' : ''}`}
                                    onClick={() => handleToggleChapter(chapter.id)}
                                >
                                        <div className="learning-chapter-title">
                                            <span className="chapter-number">{chapter.order}.</span>
                                            <span className="chapter-name">{chapter.description}</span>
                                    </div>
                                    <div className="chapter-meta">
                                            <span>{chapter.chapter?.length || 0}/{chapter.chapter?.length || 0}</span>
                                            <span className="duration">{chapter.duration || '00:00'}</span>
                                    </div>
                                </div>
                                
                                {currentChapterId === chapter.id && (
                                    <div className="chapter-content">
                                        {/* Lessons */}
                                        {chapter.chapter && 
                                            chapter.chapter
                                                .sort((a, b) => a.order - b.order)
                                                .map((lesson) => (
                                            <div 
                                                key={lesson.id}
                                                className={`lesson-item ${currentLessonId === lesson.id ? 'active' : ''}`}
                                                onClick={() => handleLessonClick(chapter.id, lesson.id, chapter.description)}
                                            >
                                                <div className="lesson-info">
                                                    <FileText size={16} className="lesson-icon" />
                                                    <div className="lesson-title">
                                                        <span className="learning-lesson-number">{lesson.order}.</span>
                                                        <span className="learning-lesson-name">{lesson.name}</span>
                                                    </div>
                                                </div>
                                                <span className="lesson-duration">00:00</span>
                                            </div>
                                        ))}

                                        {/* Materials */}
                                        {chapter.lessonMaterial && chapter.lessonMaterial.length > 0 && (
                                            <div className="section-header">
                                                <span>Tài liệu học tập ({chapter.lessonMaterial.length})</span>
                                            </div>
                                        )}

                                        {/* Quizzes */}
                                        {chapter.lessonQuiz && chapter.lessonQuiz.length > 0 && (
                                            <div className="section-header">
                                                <span>Bài kiểm tra ({chapter.lessonQuiz.length})</span>
                                        </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Navigation */}
            <footer className="learning-footer">
                <div className="footer-left">
                    <button 
                        className="footer-button footer-prev-button"
                        onClick={handlePrevious}
                        disabled={
                            !currentChapterId || 
                            !currentLessonId || 
                            courseData?.lesson
                                ?.find(l => l.id === currentChapterId)
                                ?.chapter?.[0]?.id === currentLessonId
                        }
                    >
                        <ChevronLeft size={16} />
                        Bài trước
                    </button>
                    <button 
                        className="footer-button footer-next-button"
                        onClick={handleNext}
                        disabled={
                            !currentChapterId || 
                            !currentLessonId || 
                            courseData?.lesson
                                ?.find(l => l.id === currentChapterId)
                                ?.chapter?.slice(-1)[0]?.id === currentLessonId
                        }
                    >
                        Bài tiếp theo
                        <ChevronRight size={16} />
                    </button>
                </div>
                <div className="footer-right">
                    <div className="current-lesson-info">
                        {currentLessonId && courseData?.lesson?.map(chapter => 
                            chapter.chapter?.find(lesson => lesson.id === currentLessonId)
                        ).filter(Boolean)[0]?.name || 'Chọn bài học'}
                    </div>
                    <button 
                        className="footer-button"
                        onClick={toggleSidebar}
                    >
                        <Menu size={16} />
                        {sidebarVisible ? 'Ẩn mục lục' : 'Hiện mục lục'}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default LearningPage;