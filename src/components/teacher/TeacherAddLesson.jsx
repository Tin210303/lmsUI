import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../assets/css/teacher-add-lesson.css';
import { getChapterById, addLesson } from '../../database/courseData';

const TeacherAddLesson = () => {
    const { courseId, chapterId } = useParams();
    const navigate = useNavigate();
    const [lessonType, setLessonType] = useState('video');
    const [lessonTitle, setLessonTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [textFile, setTextFile] = useState(null);
    const [textContent, setTextContent] = useState('');
    const [quizTimeLimit, setQuizTimeLimit] = useState('10');
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [chapterTitle, setChapterTitle] = useState('');

    // Update useEffect to use the centralized database
    useEffect(() => {
        const chapter = getChapterById(courseId, chapterId);
        if (chapter) {
            setChapterTitle(chapter.title);
        } else {
            console.error("Chapter not found");
            setChapterTitle("Chapter " + chapterId);
        }
    }, [courseId, chapterId]);

    const handleAddQuestion = () => {
        // Logic to add a new quiz question
        console.log("Add new quiz question");
    };

    // Update handleSubmit to use the centralized database
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Prepare data based on lesson type
        let lessonData = {
            title: lessonTitle,
            type: lessonType
        };

        switch (lessonType) {
            case 'video':
                lessonData.videoUrl = videoUrl;
                lessonData.duration = "10:00"; // Example duration
                break;
            case 'text':
                lessonData.content = textContent;
                lessonData.duration = "10:00"; // Example duration
                break;
            case 'quiz':
                lessonData.timeLimit = quizTimeLimit;
                lessonData.questions = quizQuestions;
                lessonData.duration = quizTimeLimit + ":00";
                break;
            default:
                break;
        }

        // Add the lesson using the centralized function
        const newLesson = addLesson(courseId, chapterId, lessonData);
        
        if (newLesson) {
            console.log("Lesson added successfully:", newLesson);
        } else {
            console.error("Failed to add lesson");
        }
        
        // Navigate back to the course detail page
        navigate(`/teacher/course/${courseId}`);
    };

    // Different form based on selected lesson type
    const renderLessonForm = () => {
        switch (lessonType) {
            case 'video':
                return (
                    <>
                        <div className="teacher-form-group">
                            <label>
                                Tải file Video hoặc URL <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                placeholder="Nhập URL video"
                            />
                        </div>
                    </>
                );
            case 'text':
                return (
                    <>
                        <div className="teacher-form-group">
                            <label>
                                Tải file Text <span className="required">*</span>
                            </label>
                            <input
                                type="file"
                                onChange={(e) => setTextFile(e.target.files[0])}
                            />
                        </div>
                        <div className="teacher-form-group">
                            <label>
                                Nội dung bài học <span className="required">*</span>
                            </label>
                            <textarea
                                rows="6"
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                            ></textarea>
                        </div>
                    </>
                );
            case 'quiz':
                return (
                    <>
                        <div className="teacher-form-group">
                            <label>
                                Thời hạn <span className="required">*</span>
                            </label>
                            <select 
                                value={quizTimeLimit}
                                onChange={(e) => setQuizTimeLimit(e.target.value)}
                                required
                            >
                                <option value="10">10 phút</option>
                                <option value="15">15 phút</option>
                                <option value="20">20 phút</option>
                                <option value="30">30 phút</option>
                            </select>
                        </div>
                        <div className="teacher-form-group">
                            <label>
                                Nội dung bài Quiz <span className="required">*</span>
                            </label>
                            <button type="button" className="add-question-button" onClick={handleAddQuestion}>
                                + Thêm câu hỏi
                            </button>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="teacher-add-lesson-container">
            <h2>Thêm bài học mới</h2>
            <form onSubmit={handleSubmit} className="teacher-add-lesson-form">
                <div className="teacher-form-group">
                    <label>Chương học</label>
                    <input
                        type="text"
                        value={chapterTitle}
                        disabled
                    />
                </div>
                <div className="teacher-form-group">
                    <label>
                        Tiêu đề bài học <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        value={lessonTitle}
                        onChange={(e) => setLessonTitle(e.target.value)}
                        placeholder="Nhập tiêu đề bài học"
                        required
                    />
                </div>
                <div className="teacher-form-group">
                    <label>
                        Loại <span className="required">*</span>
                    </label>
                    <select 
                        value={lessonType}
                        onChange={(e) => setLessonType(e.target.value)}
                        required
                    >
                        <option value="video">Video</option>
                        <option value="text">Text</option>
                        <option value="quiz">Quiz</option>
                    </select>
                </div>

                {renderLessonForm()}

                <div className="form-divider"></div>

                <div className="teacher-form-actions">
                    <button type="submit" className="confirm-button">Xác nhận</button>
                    <button 
                        type="button" 
                        className="cancel-button"
                        onClick={() => navigate(`/teacher/course/${courseId}`)}
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TeacherAddLesson; 