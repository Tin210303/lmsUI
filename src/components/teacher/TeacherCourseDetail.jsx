import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../assets/css/teacher-course-detail.css';
import { CircleGauge, Film, Clock, AlarmClock, FileText, Play, CircleHelp } from 'lucide-react';
import { getCourseById, addChapter } from '../../database/courseData';

const TeacherCourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [expandedChapters, setExpandedChapters] = useState({1: true}); // Chapter 1 expanded by default
    const [showChapterModal, setShowChapterModal] = useState(false);
    const [newChapterTitle, setNewChapterTitle] = useState('');
    
    useEffect(() => {
        const course = getCourseById(id);
        if (course) {
            setCourse(course);
        } else {
            console.error("Course not found");
            // Could navigate back to dashboard or show error
        }
    }, [id]);

    const handleEditClick = () => {
        // Navigate to edit page
        console.log("Edit course", id);
    };

    const handleAddChapter = () => {
        // Open modal to input chapter title
        setNewChapterTitle('');
        setShowChapterModal(true);
    };

    const handleCreateChapter = () => {
        if (!course || !newChapterTitle.trim()) return;
        
        // Use the centralized function to add a chapter
        const newChapter = addChapter(id, newChapterTitle.trim());
        
        if (newChapter) {
            // Update the expand state
            setExpandedChapters(prev => ({
                ...prev,
                [newChapter.id]: true
            }));
            
            // Close the modal
            setShowChapterModal(false);
        }
    };

    const handleAddLesson = (chapterId) => {
        // Navigate to the add lesson page with course and chapter info
        navigate(`/teacher/course/${id}/chapter/${chapterId}/add-lesson`);
    };

    const toggleChapter = (chapterId) => {
        setExpandedChapters(prev => ({
            ...prev,
            [chapterId]: !prev[chapterId]
        }));
    };

    if (!course) {
        return <div>Loading...</div>;
    }

    return (
        <div className="teacher-course-detail-container">
            <h1 className="teacher-course-title">{course.title}</h1>
            
            <div className="teacher-course-content-wrapper">
                <div className="teacher-course-content">
                    <div className="teacher-content-header">
                        <div className="teacher-content-header-top">
                            <h2>Nội dung khóa học</h2>
                            <button className="teacher-add-chapter-button" onClick={handleAddChapter}>
                                + Thêm chương
                            </button>
                        </div>
                        <div className="teacher-content-summary">
                            {course.totalChapters} chương • {course.totalLessons} bài học • Thời lượng {course.totalDuration}
                        </div>
                    </div>
                    
                    <div className="teacher-chapters-list">
                        {course.chapters.map((chapter) => (
                            <div key={chapter.id} className="teacher-chapter-item">
                                <div className="teacher-chapter-header" onClick={() => toggleChapter(chapter.id)}>
                                    <div className="teacher-chapter-collapse">
                                        {expandedChapters[chapter.id] ? "-" : "+"}
                                    </div>
                                    <div className="teacher-chapter-title">{chapter.id}. {chapter.title}</div>
                                    <div className="teacher-chapter-lessons">{Array.isArray(chapter.lessons) ? chapter.lessons.length : 0} bài học</div>
                                </div>
                                
                                {expandedChapters[chapter.id] && (
                                    <div className="teacher-chapter-content">
                                        {chapter.lessons && chapter.lessons.length > 0 ? (
                                            <div className="teacher-lesson-list">
                                                {chapter.lessons.map((lesson, index) => (
                                                    <div key={lesson.id} className="teacher-lesson-item">
                                                        <div className="teacher-lesson-icon">
                                                            {lesson.type === 'video' && <Play size={16} />}
                                                            {lesson.type === 'text' && <FileText size={16} />}
                                                            {lesson.type === 'quiz' && <CircleHelp size={16} />}
                                                        </div>
                                                        <div className="teacher-lesson-title">
                                                            {index + 1}. {lesson.title}
                                                        </div>
                                                        <div className="teacher-lesson-duration">
                                                            {lesson.duration}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}
                                        <div className="teacher-add-lesson">
                                            <button className="teacher-add-lesson-button" onClick={() => handleAddLesson(chapter.id)}>
                                                + Thêm bài học
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="teacher-course-sidebar">
                    <div className="teacher-course-image" style={{ background: course.color }}></div>
                    
                    <button className="teacher-edit-button" onClick={handleEditClick}>Chỉnh sửa</button>
                    
                    <div className="teacher-course-info">
                        <div className="teacher-info-item">
                            <CircleGauge size={16} className='mr-16'/>
                            <span className="teacher-info-text">
                                {course.isPrivate ? "Khóa học riêng cho sinh viên trong lớp" : "Khóa học chung"}
                            </span>
                        </div>
                        <div className="teacher-info-item">
                            <Film size={16} className='mr-16'/>
                            <span className="teacher-info-text">Tổng số {course.totalLessonsCount} bài học</span>
                        </div>
                        <div className="teacher-info-item">
                            <Clock size={16} className='mr-16'/>
                            <span className="teacher-info-text">Thời lượng {course.formattedDuration}</span>
                        </div>
                        <div className="teacher-info-item">
                            <AlarmClock size={16} className='mr-16'/>
                            <span className="teacher-info-text">Giới hạn {course.deadline}</span>
                        </div>
                    </div>
                </div>
            </div>

            {showChapterModal && (
                <div className="teacher-modal-overlay">
                    <div className="teacher-modal">
                        <h3>Thêm chương mới</h3>
                        <div className="teacher-modal-content">
                            <label>Tiêu đề chương</label>
                            <input 
                                type="text" 
                                value={newChapterTitle} 
                                onChange={(e) => setNewChapterTitle(e.target.value)}
                                placeholder="Nhập tiêu đề chương"
                                autoFocus
                            />
                        </div>
                        <div className="teacher-modal-actions">
                            <button onClick={() => setShowChapterModal(false)} className="teacher-modal-cancel">
                                Hủy
                            </button>
                            <button 
                                onClick={handleCreateChapter} 
                                className="teacher-modal-confirm" 
                                disabled={!newChapterTitle.trim()}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherCourseDetail; 