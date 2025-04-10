import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logo from '../../assets/imgs/logo.png';
import '../../assets/css/learning-page.css';
import CommentSection from './CommentSection';

const LearningPage = () => {
const { id } = useParams();
const navigate = useNavigate();

// Dữ liệu mẫu cho khóa học
const [courseData, setCourseData] = useState({
    title: "Lập Trình JavaScript Cơ Bản",
    progress: 95,
    totalLessons: 205,
    completedLessons: 195,
    chapters: [
    {
        id: 1,
        title: "Giới thiệu",
        totalLessons: 3,
        duration: "07:28",
        expanded: true,
        lessons: [
            { id: 1, title: "Lời khuyên trước khóa học", time: "04:20", type: "video", completed: true, active: true },
            { id: 2, title: "Cài đặt môi trường", time: "02:08", type: "video", completed: true },
            { id: 3, title: "Tham gia cộng đồng F8 trên Discord", time: "01:00", type: "document", completed: true }
        ]
    },
    {
        id: 2,
        title: "Biến, comments, built-in",
        totalLessons: 10,
        duration: "31:03",
        expanded: false,
        lessons: [
            { id: 1, title: "Lời khuyên trước khóa học", time: "04:20", type: "video", completed: false },
            { id: 2, title: "Cài đặt môi trường", time: "02:08", type: "video", completed: false },
            { id: 3, title: "Tham gia cộng đồng F8 trên Discord", time: "01:00", type: "document", completed: false }
        ]
    },
    {
        id: 3,
        title: "Toán tử, kiểu dữ liệu",
        totalLessons: 26,
        duration: "01:51:16",
        expanded: false,
        lessons: []
    },
    {
        id: 4,
        title: "Làm việc với hàm",
        totalLessons: 15,
        duration: "53:57",
        expanded: false,
        lessons: []
    },
    {
        id: 5,
        title: "Làm việc với chuỗi",
        totalLessons: 6,
        duration: "41:18",
        expanded: false,
        lessons: []
    },
    {
        id: 6,
        title: "Làm việc với số",
        totalLessons: 5,
        duration: "26:02",
        expanded: false,
        lessons: []
    },
    {
        id: 7,
        title: "Làm việc với mảng",
        totalLessons: 7,
        duration: "44:05",
        expanded: false,
        lessons: []
    }
    ]
})

// State để theo dõi chapter và lesson hiện tại
const [currentChapterId, setCurrentChapterId] = useState(1);
const [currentLessonId, setCurrentLessonId] = useState(1);
const [currentChapter, setCurrentChapter] = useState('');

// State để đóng mở sidebar
const [sidebarVisible, setSidebarVisible] = useState(true);

// Bắt các biến được active khi chạy lần đầu
useEffect(() => {
    const { chapterIndex, lessonIndex } = findCurrentPosition();
    if (chapterIndex !== -1 && lessonIndex !== -1) {
        const chapter = courseData.chapters[chapterIndex];
        const lesson = chapter.lessons[lessonIndex];

        setCurrentChapterId(chapter.id);
        setCurrentLessonId(lesson.id);
        setCurrentChapter(chapter.title);
    }
}, [courseData]);

// Hàm tìm vị trí của lesson hiện tại
const findCurrentPosition = () => {
  let chapterIndex = -1;
  let lessonIndex = -1;
  
  courseData.chapters.forEach((chapter, chapIdx) => {
    const foundLessonIdx = chapter.lessons.findIndex(lesson => lesson.active);
    if (foundLessonIdx !== -1) {
      chapterIndex = chapIdx;
      lessonIndex = foundLessonIdx;
    }
  });
  
  return { chapterIndex, lessonIndex };
};

// Hàm chuyển trạng thái active cho lesson mới
const setActiveLesson = (chapterIndex, lessonIndex) => {
    const updatedChapters = courseData.chapters.map((chapter, chapIdx) => {
        const updatedLessons = chapter.lessons.map((lesson, lesIdx) => {
            return {
                ...lesson,
                active: chapIdx === chapterIndex && lesIdx === lessonIndex
            };
        });
        
        return {
            ...chapter,
            expanded: chapIdx === chapterIndex ? true : chapter.expanded,
            lessons: updatedLessons
        };
    });

    setCourseData(prev => ({
        ...prev,
        chapters: updatedChapters
    }));

    // Cập nhật ID chapter và lesson hiện tại
    if (chapterIndex >= 0 && lessonIndex >= 0) {
        setCurrentChapterId(courseData.chapters[chapterIndex].id);
        setCurrentLessonId(courseData.chapters[chapterIndex].lessons[lessonIndex].id);
        setCurrentChapter(courseData.chapters[chapterIndex].title)
    }
};

// Xử lý đóng/mở chapter
const handleToggleChapter = (chapterId) => {
    const updatedChapters = courseData.chapters.map(chapter => {
        if (chapter.id === chapterId) {
            return {
                ...chapter,
                expanded: !chapter.expanded
            };
        }
        return chapter;
    });

    setCourseData(prev => ({
        ...prev,
        chapters: updatedChapters
    }));
};

// Xứ lý đóng/mở sidebar
const handleToggleSidebar = () => {
    setSidebarVisible(prev => !prev);
}; 

// Xử lý chuyển đến bài học trước
const handlePreviousLesson = () => {
    const { chapterIndex, lessonIndex } = findCurrentPosition();

    if (chapterIndex !== -1 && lessonIndex !== -1) {
        // Nếu không phải lesson đầu tiên trong chapter
        if (lessonIndex > 0) {
            setActiveLesson(chapterIndex, lessonIndex - 1);
        } 
        // Nếu là lesson đầu tiên và không phải chapter đầu tiên
        else if (chapterIndex > 0) {
            const prevChapterIndex = chapterIndex - 1;
            const prevChapter = courseData.chapters[prevChapterIndex];
            const prevLessonIndex = prevChapter.lessons.length - 1;
            
            if (prevLessonIndex >= 0) {
                setActiveLesson(prevChapterIndex, prevLessonIndex);
            }
        }
        // Ngược lại, đây là lesson đầu tiên của chapter đầu tiên, không làm gì cả
    }
};

// Xử lý chuyển đến bài học tiếp theo
const handleNextLesson = () => {
    const { chapterIndex, lessonIndex } = findCurrentPosition();

    if (chapterIndex !== -1 && lessonIndex !== -1) {
        const currentChapter = courseData.chapters[chapterIndex];
        
        // Nếu không phải lesson cuối cùng trong chapter
        if (lessonIndex < currentChapter.lessons.length - 1) {
            setActiveLesson(chapterIndex, lessonIndex + 1);
        } 
        // Nếu là lesson cuối cùng và không phải chapter cuối cùng
        else if (chapterIndex < courseData.chapters.length - 1) {
            const nextChapterIndex = chapterIndex + 1;
            const nextChapter = courseData.chapters[nextChapterIndex];
            
            // Mở rộng chapter tiếp theo nếu nó có bài học
            if (nextChapter.lessons.length > 0) {
                setActiveLesson(nextChapterIndex, 0);
            } else {
                // Nếu chapter tiếp theo không có bài học, tìm chapter tiếp theo có bài học
                for (let i = nextChapterIndex + 1; i < courseData.chapters.length; i++) {
                    if (courseData.chapters[i].lessons.length > 0) {
                        setActiveLesson(i, 0);
                        break;
                    }
                }
            }
        }
        // Ngược lại, đây là lesson cuối cùng của chapter cuối cùng, không làm gì cả
    }
};

// Xử lý khi click vào một lesson
const handleLessonClick = (chapterIndex, lessonIndex) => {
    setActiveLesson(chapterIndex, lessonIndex);
};

const handleBackToCourses = () => {
    navigate('/courses');
};

 // Xác định tiêu đề và URL video của bài học hiện tại
const getCurrentLessonInfo = () => {
    const { chapterIndex, lessonIndex } = findCurrentPosition();
    
    if (chapterIndex !== -1 && lessonIndex !== -1) {
        const lesson = courseData.chapters[chapterIndex].lessons[lessonIndex];
        return {
            title: lesson.title,
            videoUrl: `https://example.com/videos/${lesson.id}` // Thay bằng URL thực tế
        };
    }
    
    return {
        title: "Bài học không tồn tại",
        videoUrl: ""
    };
};
  
const currentLesson = getCurrentLessonInfo();
    return (
        <div className="learning-container">
            {/* Header */}
            <header className="learning-header">
                <div className="header-left">
                    <button onClick={handleBackToCourses} className="back-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <div className="course-logo-title">
                        <img src={logo} style={{width: '5rem'}} />
                        <h1 className="course-learning-title">{courseData.title}</h1>
                    </div>
                </div>
                <div className="header-right">
                    <div className="progress-info">
                        <span className="progress-percent">{courseData.progress}%</span>
                        <span className="progress-text">{courseData.completedLessons}/{courseData.totalLessons} bài học</span>
                    </div>
                    <button className="header-button note-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                        <span>Ghi chú</span>
                    </button>
                    <button className="header-button help-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                        <span>Hướng dẫn</span>
                    </button>
                </div>
            </header>

            {/* Main content */}
            <div className={`learning-main ${!sidebarVisible ? 'sidebar-hidden' : ''}`}>
                {/* Video area */}
                <div className="video-container">
                    <div className="video-player">
                        <iframe
                            width="100%"
                            height="100%"
                            src={currentLesson.videoUrl}
                            frameBorder="0"
                            allowFullScreen
                            title="Course video"
                        ></iframe>
                    </div>
                    <div className="video-info">
                        <h2 className="video-title">{currentLesson.title}</h2>
                        <CommentSection lessonId={currentLessonId} />
                    </div>
                </div>

                {/* Sidebar course content */}
                <div className="sidebar-container">
                    <div className="sidebar-header">
                        <h3>Nội dung khóa học</h3>
                    </div>
                    <div className="sidebar-content">
                        {courseData.chapters.map((chapter, chapterIndex) => (
                            <div key={chapter.id} className="chapter-item">
                                <div 
                                    className={`chapter-header ${chapter.expanded ? 'expanded' : ''}`}
                                    onClick={() => handleToggleChapter(chapter.id)}
                                >
                                    <div className="chapter-learning-title">
                                        <span className="chapter-number">{chapter.id}.</span>
                                        <span className="chapter-name">{chapter.title}</span>
                                    </div>
                                    <div className="chapter-meta">
                                        <span>{chapter.totalLessons}/{chapter.totalLessons} | {chapter.duration}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`chevron-icon ${chapter.expanded ? 'rotated' : ''}`}>
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </div>
                                </div>
                                
                                {chapter.expanded && (
                                    <div className="lessons-list">
                                        {chapter.lessons.map((lesson, lessonIndex) => (
                                            <div 
                                                key={lesson.id}
                                                className={`lesson-item ${lesson.active ? 'active' : ''}`}
                                                onClick={() => handleLessonClick(chapterIndex, lessonIndex)}
                                            >
                                                <div className="lesson-left">
                                                    {lesson.type === 'video' ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lesson-icon ${lesson.completed ? 'completed' : ''}`}>
                                                            <circle cx="12" cy="12" r="10"></circle>
                                                            <polygon points="10 8 16 12 10 16 10 8"></polygon>
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lesson-icon ${lesson.completed ? 'completed' : ''}`}>
                                                            <circle cx="12" cy="12" r="10"></circle>
                                                            <line x1="12" y1="8" x2="12" y2="16"></line>
                                                            <line x1="8" y1="12" x2="16" y2="12"></line>
                                                        </svg>
                                                    )}
                                                    <div className="lesson-title">
                                                        <span className="lesson-number">{lesson.id}.</span>
                                                        <span className="lesson-name">{lesson.title}</span>
                                                        {lesson.completed && (
                                                            <span className="lesson-completed-badge">✓</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="lesson-duration">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="10"></circle>
                                                        <polyline points="12 6 12 12 16 14"></polyline>
                                                    </svg>
                                                    {lesson.time}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className='learning-footer'>
                <div className="navigation-buttons">
                    <button onClick={handlePreviousLesson} className="prev-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        BÀI TRƯỚC
                    </button>
                    <button onClick={handleNextLesson} className="next-button">
                        BÀI TIẾP THEO
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>
                <div className="chapter-footer">
                    <div style={{fontWeight: 600}}>{currentChapterId}. {currentChapter}</div>
                    <button onClick={handleToggleSidebar} className="toggle-sidebar-button">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`icon ${sidebarVisible ? 'rotate-180' : ''}`}
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LearningPage;