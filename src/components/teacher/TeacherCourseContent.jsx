import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronRight, BookOpen, HelpCircle, MessageSquare, FileText, Download, Menu, Lock, CircleCheck, MoreVertical, Edit, Trash2 } from 'lucide-react';
import '../../assets/css/learning-page.css';
import CommentSection from '../student/CommentSection';
import LearningContent from '../student/LearningContent';
import Alert from '../common/Alert';
import { API_BASE_URL } from '../../services/apiService';

const TeacherCourseContent = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);
    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
    };
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentChapterId, setCurrentChapterId] = useState(null);
    const [currentLessonId, setCurrentLessonId] = useState(null);
    const [currentChapter, setCurrentChapter] = useState('');
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [currentContent, setCurrentContent] = useState(null);
    const [currentQuizId, setCurrentQuizId] = useState(null);
    const [chapterCompleted, setChapterCompleted] = useState(false);
    const [completedChapters, setCompletedChapters] = useState([]);
    const [completedLessonIds, setCompletedLessonIds] = useState([]);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [completedQuizzes, setCompletedQuizzes] = useState([]);
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizResult, setQuizResult] = useState(null);
    const [allQuizQuestions, setAllQuizQuestions] = useState([]);
    const [quizLoading, setQuizLoading] = useState(false);
    const contentRef = useRef(null);
    
    // Ref để lưu trữ các chapter items trong sidebar
    const chapterRefs = useRef({});
    // Ref cho sidebar để cuộn
    const sidebarRef = useRef(null);
    
    // Thêm state để quản lý hiển thị modal CommentSection
    const [showCommentModal, setShowCommentModal] = useState(false);
    
    // Thêm state để quản lý menu
    const [menuOpen, setMenuOpen] = useState({ type: null, id: null });
    const [showEditChapterModal, setShowEditChapterModal] = useState(false);
    const [showEditLessonModal, setShowEditLessonModal] = useState(false);
    const [showDeleteChapterConfirm, setShowDeleteChapterConfirm] = useState(false);
    const [showDeleteLessonConfirm, setShowDeleteLessonConfirm] = useState(false);
    const [showDeleteQuizConfirm, setShowDeleteQuizConfirm] = useState(false);
    const [showDeleteMaterialConfirm, setShowDeleteMaterialConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [editChapterData, setEditChapterData] = useState({
        idLesson: '',
        description: '',
        order: 1
    });
    const [editLessonData, setEditLessonData] = useState({
        chapterId: '',
        name: '',
        order: 1,
        type: 'video',
    });
    
    // Fetch course data from API
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(`${API_BASE_URL}/lms/course/${courseId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const courseResult = response.data.result;
                console.log("Course data fetched:", courseResult); 
                setCourseData(courseResult);
                
                // Đảm bảo các lesson được sắp xếp theo thứ tự tăng dần
                if (courseResult.lesson && courseResult.lesson.length > 0) {
                    // Sắp xếp các chapter theo thứ tự
                    const sortedLessons = [...courseResult.lesson].sort((a, b) => a.order - b.order);
                    
                    // Lấy chapter đầu tiên (ở trên cùng)
                    const firstLesson = sortedLessons[0];
                    setCurrentChapterId(firstLesson.id);
                    setCurrentChapter(firstLesson.description);
                    
                    // Nếu chapter đầu tiên có lesson, lấy lesson đầu tiên
                    if (firstLesson.chapter && firstLesson.chapter.length > 0) {
                        // Sắp xếp các lesson trong chapter đầu tiên theo thứ tự
                        const sortedChapters = [...firstLesson.chapter].sort((a, b) => a.order - b.order);
                        
                        // Giảng viên không cần kiểm tra hoàn thành, chỉ cần hiển thị bài học đầu tiên
                            const firstChapterId = sortedChapters[0].id;
                            
                            setCurrentLessonId(firstChapterId);
                            setCurrentContent(sortedChapters[0]);
                    }
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId]);
    
    // Đơn giản hóa checkAllChaptersCompletion - chỉ kiểm tra không thực hiện gọi API
    const checkAllChaptersCompletion = async (courseData) => {
        if (!courseData?.lesson || courseData.lesson.length === 0) {
            console.log("No lessons found in course data");
            return [];
        }
        
        console.log("Checking completion status for all chapters");
        
        // Giảng viên chỉ cần hiển thị trạng thái đã hoàn thành có sẵn 
        // Không cần gọi API để cập nhật tiến độ
        return completedChapters;
    };

    // Đơn giản hóa initChapterProgress - không cần khởi tạo tiến độ cho giảng viên
    const initChapterProgress = async (chapterId) => {
        // Giảng viên không cần khởi tạo tiến độ, luôn trả về thành công
        console.log(`Teacher view - skipping progress initialization for chapter ${chapterId}`);
        return { result: { isCompleted: false } };
    };

    // Đơn giản hóa checkChapterCompletion - giảng viên chỉ cần xem trạng thái
    const checkChapterCompletion = async (chapterId) => {
        // Kiểm tra nếu chapter đã có trong danh sách hoàn thành
        const isCompleted = completedChapters.includes(chapterId);
                setChapterCompleted(isCompleted);
                
        console.log(`Teacher view - chapter ${chapterId} completion status: ${isCompleted}`);
        return isCompleted;
    };

    // Đơn giản hóa completeChapter - không cần cập nhật tiến độ cho giảng viên
    const completeChapter = async (chapterId) => {
        // Giảng viên không cần cập nhật tiến độ, chỉ cần cập nhật UI
                setChapterCompleted(true);
        
        // Thêm vào danh sách đã hoàn thành để hiển thị UI đúng
                setCompletedChapters(prev => {
                    if (prev.includes(chapterId)) {
                        return prev;
                    }
                    return [...prev, chapterId];
                });
                
        console.log(`Teacher view - marking chapter ${chapterId} as completed (UI only)`);
        return { code: 0, message: "Success" };
    };

    const handleToggleChapter = (chapterId) => {
        setCurrentChapterId(currentChapterId === chapterId ? null : chapterId);
    };

    const handleLessonClick = async (chapterId, lessonId, chapterTitle, lessonOrder) => {
        console.log(`Attempting to access chapter ${lessonId} in lesson ${chapterId}, order: ${lessonOrder}`);
        
        // Không cần kiểm tra quyền truy cập nữa, giảng viên luôn có quyền xem tất cả bài học
        console.log(`Chapter ${lessonId} is accessible, loading content`);
        setCurrentChapterId(chapterId);
        setCurrentLessonId(lessonId);
        setCurrentChapter(chapterTitle);
        
        // Tìm chapter data để cập nhật currentContent
        const lesson = courseData.lesson.find(l => l.id === chapterId);
        if (lesson?.chapter) {
            const chapter = lesson.chapter.find(c => c.id === lessonId);
            if (chapter) {
                // Cấu trúc lại dữ liệu chapter để phù hợp với LearningContent
                const formattedChapter = {
                    ...chapter,
                    id: chapter.id,
                    name: chapter.name,
                    order: chapter.order,
                    type: chapter.type || 'video', // Mặc định là video nếu không có type
                    lessonType: chapter.type || 'video',
                    data: {
                        ...chapter.data,
                        path: chapter.videoPath || chapter.path || ''
                    }
                };
                setCurrentContent(formattedChapter);
                console.log("Setting chapter content:", formattedChapter);
            }
        }
        
        // Giảng viên không cần theo dõi tiến độ, bỏ qua việc khởi tạo và kiểm tra tiến độ
        // Nhưng vẫn cần cập nhật completedChapters để hiển thị giao diện đúng
        checkChapterCompletion(lessonId);
};

const handleBackToCourses = () => {
        navigate('/teacher/course', {
            state: { courseId: courseId }
        });
};

    const handlePrevious = () => {
        if (!courseData?.lesson || !currentChapterId || !currentLessonId) return;
        
        // Tìm lesson hiện tại
        const currentLesson = courseData.lesson.find(l => l.id === currentChapterId);
        if (!currentLesson?.chapter) return;
        
        // Sắp xếp tất cả các lesson theo thứ tự
        const sortedLessons = [...courseData.lesson].sort((a, b) => a.order - b.order);
        
        // Tìm index của lesson hiện tại
        const currentLessonIndex = sortedLessons.findIndex(l => l.id === currentChapterId);

        // Tìm index của chapter hiện tại trong lesson
        const currentChapterIndex = currentLesson.chapter.findIndex(c => c.id === currentLessonId);
        
        // Nếu đây không phải là chapter đầu tiên của lesson hiện tại
        if (currentChapterIndex > 0) {
            // Lấy chapter trước đó trong cùng lesson
            const prevChapter = currentLesson.chapter[currentChapterIndex - 1];
            setCurrentLessonId(prevChapter.id);
            setCurrentContent(prevChapter);
            
            // Chỉ khởi tạo chapter progress nếu chapter chưa hoàn thành
            if (!completedChapters.includes(prevChapter.id)) {
                console.log(`Previous chapter ${prevChapter.id} not in completed list, initializing progress`);
                initChapterProgress(prevChapter.id);
            } else {
                console.log(`Previous chapter ${prevChapter.id} already completed, skipping initialization`);
            }
            
            // Luôn kiểm tra trạng thái hoàn thành
            checkChapterCompletion(prevChapter.id);
        } 
        // Nếu đây là chapter đầu tiên nhưng không phải lesson đầu tiên
        else if (currentLessonIndex > 0) {
            // Lấy lesson trước đó
            const prevLesson = sortedLessons[currentLessonIndex - 1];
            
            // Kiểm tra nếu lesson trước đó có chapter
            if (prevLesson.chapter && prevLesson.chapter.length > 0) {
                // Sắp xếp các chapter trong lesson trước đó
                const sortedPrevChapters = [...prevLesson.chapter].sort((a, b) => a.order - b.order);
                
                // Lấy chapter cuối cùng của lesson trước đó
                const lastChapterOfPrevLesson = sortedPrevChapters[sortedPrevChapters.length - 1];
                
                // Cập nhật state với lesson và chapter mới
                setCurrentChapterId(prevLesson.id);
                setCurrentLessonId(lastChapterOfPrevLesson.id);
                setCurrentChapter(prevLesson.description);
                setCurrentContent(lastChapterOfPrevLesson);
                
                // Chỉ khởi tạo chapter progress nếu chapter chưa hoàn thành
                if (!completedChapters.includes(lastChapterOfPrevLesson.id)) {
                    console.log(`Last chapter of previous lesson ${lastChapterOfPrevLesson.id} not in completed list, initializing progress`);
                    initChapterProgress(lastChapterOfPrevLesson.id);
                } else {
                    console.log(`Last chapter of previous lesson ${lastChapterOfPrevLesson.id} already completed, skipping initialization`);
                }
                
                // Luôn kiểm tra trạng thái hoàn thành
                checkChapterCompletion(lastChapterOfPrevLesson.id);
                
                // Cuộn đến chapter mới
                setTimeout(() => {
                    scrollToCurrentChapter(prevLesson.id, lastChapterOfPrevLesson.id);
                }, 300);
            }
        }
    };

    const handleNext = () => {
        if (!courseData?.lesson || !currentChapterId) return;
        
        // Tìm lesson hiện tại
        const currentLesson = courseData.lesson.find(l => l.id === currentChapterId);
        if (!currentLesson?.chapter) return;
        
        // Sắp xếp tất cả các lesson theo thứ tự
        const sortedLessons = [...courseData.lesson].sort((a, b) => a.order - b.order);
        
        // Tìm index của lesson hiện tại
        const currentLessonIndex = sortedLessons.findIndex(l => l.id === currentChapterId);

        // Tìm index của chapter hiện tại trong lesson
        const currentChapterIndex = currentLesson.chapter.findIndex(c => c.id === currentLessonId);
        
        // Nếu đây không phải là chapter cuối cùng của lesson hiện tại
        if (currentChapterIndex < currentLesson.chapter.length - 1) {
            // Lấy chapter tiếp theo trong cùng lesson
            const nextChapter = currentLesson.chapter[currentChapterIndex + 1];
            setCurrentLessonId(nextChapter.id);
            setCurrentContent(nextChapter);
            
            // Giảng viên không cần khởi tạo chapter progress
            
            // Luôn kiểm tra trạng thái hoàn thành để hiển thị UI đúng
            checkChapterCompletion(nextChapter.id);
        } 
        // Nếu đây là chapter cuối cùng của lesson hiện tại và không phải lesson cuối cùng
            else if (currentLessonIndex < sortedLessons.length - 1) {
                // Lấy lesson tiếp theo
                const nextLesson = sortedLessons[currentLessonIndex + 1];
                
            // Giảng viên không cần khởi tạo lesson progress
                
                // Kiểm tra nếu lesson tiếp theo có chapter
                if (nextLesson.chapter && nextLesson.chapter.length > 0) {
                    // Sắp xếp các chapter trong lesson tiếp theo
                    const sortedNextChapters = [...nextLesson.chapter].sort((a, b) => a.order - b.order);
                    
                    // Lấy chapter đầu tiên của lesson tiếp theo
                    const firstChapterOfNextLesson = sortedNextChapters[0];
                    
                    // Cập nhật state với lesson và chapter mới
                    setCurrentChapterId(nextLesson.id);
                    setCurrentLessonId(firstChapterOfNextLesson.id);
                    setCurrentChapter(nextLesson.description);
                    setCurrentContent(firstChapterOfNextLesson);
                    
                // Kiểm tra trạng thái hoàn thành để hiển thị UI đúng
                    checkChapterCompletion(firstChapterOfNextLesson.id);
                    
                    // Cuộn đến chapter mới
                    setTimeout(() => {
                        scrollToCurrentChapter(nextLesson.id, firstChapterOfNextLesson.id);
                    }, 300);
            }
        }
    };

    // Xử lý khi người dùng cuộn xuống hết trang (cho chapter dạng file)
    const handleScroll = (e) => {
        if (!currentLessonId || chapterCompleted) return;
        
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        
        // Kiểm tra nếu người dùng đã cuộn gần đến cuối trang (90%)
        if (scrollTop + clientHeight >= scrollHeight * 0.9) {
            // Đánh dấu chapter đã hoàn thành
            completeChapter(currentLessonId);
        }
    };

    // Xử lý khi video kết thúc (cho chapter dạng video)
    const handleVideoEnded = () => {
        console.log('Video ended, current lesson ID:', currentLessonId);
        
        if (!currentLessonId) {
            console.error('No currentLessonId when video ended');
            return;
        }
        
        if (chapterCompleted) {
            console.log('Chapter already completed, skipping');
            return;
        }
        
        console.log('Marking chapter as completed');
        // Đánh dấu chapter đã hoàn thành
        completeChapter(currentLessonId).then(result => {
            console.log('Complete chapter result:', result);
            // Kiểm tra lại trạng thái hoàn thành sau khi đánh dấu
            checkChapterCompletion(currentLessonId);
        }).catch(err => {
            console.error('Error in complete chapter after video end:', err);
        });
    };

    const handleMaterialClick = (lessonId, index, material) => {
        console.log(`Opening material from lesson ${lessonId} at index ${index}:`, material);
        
        // Đặt chapter hiện tại là lesson chứa material
        setCurrentChapterId(lessonId);
        
        // Lấy tên của lesson để hiển thị
        const lesson = courseData.lesson.find(l => l.id === lessonId);
        let materialName = `Tài liệu ${index + 1}`;
        
        // Lấy tên file từ đường dẫn nếu có thể
        if (material.path) {
            const pathParts = material.path.split('/');
            const fileName = pathParts[pathParts.length - 1];
            // Xóa UUID từ tên file nếu có
            const fileNameWithoutUUID = fileName.replace(/^[a-f0-9-]+\./, '');
            materialName = fileNameWithoutUUID;
        }
        
        // Lấy đuôi file để xác định loại
        let fileType = 'document';
        if (material.path) {
            const extension = material.path.split('.').pop().toLowerCase();
            if (['pdf'].includes(extension)) {
                fileType = 'pdf';
            } else if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) {
                fileType = 'document';
            } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
                fileType = 'spreadsheet';
            } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
                fileType = 'image';
            } else if (['ppt', 'pptx'].includes(extension)) {
                fileType = 'presentation';
            }
        }
        
        // Thiết lập material là nội dung hiện tại
        const currentMaterial = {
            id: `material-${lessonId}-${index}`,
            name: materialName,
            type: 'material', 
            lessonType: 'material',
            fileUrl: `${API_BASE_URL}${material.path}`,
            path: material.path,
            fileType,
            data: {
                path: material.path,
                type: fileType
            }
        };
        
        console.log("Setting material content:", currentMaterial);
        setCurrentContent(currentMaterial);
        setCurrentLessonId(null);
        
        // Đặt tên chapter hiện tại
        if (lesson) {
            setCurrentChapter(lesson.description);
        }
    };

    const handleQuizClick = (lessonId, index, quiz) => {
        console.log(`Opening quiz from lesson ${lessonId}`);
        
        // Giảng viên luôn có quyền xem bài kiểm tra
        
        // Reset trạng thái bài kiểm tra
        setQuizSubmitted(false);
        setQuizResult(null);
        setQuizLoading(true);
        
        // Đặt chapter hiện tại là lesson chứa quiz
        setCurrentChapterId(lessonId);
        
        // Lấy toàn bộ bài kiểm tra của lesson
        const lesson = courseData.lesson.find(l => l.id === lessonId);
        if (!lesson || !lesson.lessonQuiz || lesson.lessonQuiz.length === 0) {
            showAlert('error', 'Lỗi', 'Không tìm thấy bài kiểm tra cho chương này!');
            setQuizLoading(false);
            return;
        }
        
        // Thiết lập quizId hiện tại từ quiz được chọn
        const quizId = quiz?.id || `quiz-${lessonId}-${index}`;
        setCurrentQuizId(quizId);
        
        // Tạo danh sách tất cả các câu hỏi từ lessonQuiz
        const quizQuestions = lesson.lessonQuiz.map((quizItem, idx) => ({
            ...quizItem,
            index: idx,
            quizId: `quiz-${lessonId}-${idx}`,
            // Kiểm tra xem bài kiểm tra đã hoàn thành chưa
            isCompleted: completedQuizzes.includes(`quiz-${lessonId}-${idx}`)
        }));
        
        setAllQuizQuestions(quizQuestions);
        
        // Kiểm tra xem tất cả các bài kiểm tra đã hoàn thành chưa
        const allCompleted = quizQuestions.every(q => q.isCompleted);
        
        // Tạo đối tượng quiz tổng hợp để hiển thị
        setCurrentContent({
            name: `Bài kiểm tra: ${lesson.description}`,
            type: 'quiz',
            isQuiz: true,
            lessonId: lessonId,
            allCompleted: allCompleted,
            id: quizId // Thêm id của quiz vào currentContent
        });
        
        // Lấy các câu trả lời đã lưu trước đó (nếu có)
        let savedAnswers = {};
        quizQuestions.forEach(question => {
            const savedAnswer = quizAnswers[question.quizId];
            if (savedAnswer) {
                savedAnswers[question.quizId] = savedAnswer;
            }
        });
        
        // Đặt lại câu trả lời đã lưu
        if (Object.keys(savedAnswers).length > 0) {
            setQuizAnswers(savedAnswers);
        }
        
        // Không cần thiết lập currentLessonId vì đây không phải là lesson
        setCurrentLessonId(null);
        
        // Đặt tên chapter hiện tại
        if (lesson) {
            setCurrentChapter(lesson.description);
        }
        
        setQuizLoading(false);
    };
    
    // Xử lý khi người dùng chọn đáp án cho bài kiểm tra
    const handleQuizAnswerChange = (quizId, selectedAnswer) => {
        setQuizAnswers(prev => ({
            ...prev,
            [quizId]: selectedAnswer
        }));
    };
    
    // Hàm gọi API để đánh dấu lesson đã hoàn thành
    const completeLesson = async (lessonId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error("No token found when completing lesson");
                return null;
            }
            
            console.log('Sending request to complete lesson:', lessonId);
            
            const response = await axios.put(`${API_BASE_URL}/lms/lessonprogress/completelesson/${lessonId}`, null, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Complete lesson API response:', response.data);
            
            // Kiểm tra kết quả từ API
            if (response.data && response.data.code === 0) {
                console.log('Lesson successfully marked as completed');
                
                // Cập nhật danh sách lesson đã hoàn thành
                setCompletedLessonIds(prev => {
                    if (prev.includes(lessonId)) {
                        return prev;
                    }
                    return [...prev, lessonId];
                });
                
                toast.success('Đã hoàn thành bài học!');
                return response.data;
            } else {
                const errorMsg = response.data?.message || 'Unknown error when completing lesson';
                console.error('Failed to complete lesson:', errorMsg);
                toast.error(`Không thể hoàn thành bài học. Lỗi: ${errorMsg}`);
                return null;
            }
        } catch (err) {
            console.error('Error completing lesson:', err);
            toast.error('Có lỗi xảy ra khi đánh dấu hoàn thành bài học. Vui lòng thử lại sau.');
            return null;
        }
    };

    // Thêm hàm xử lý nộp bài kiểm tra
    const handleQuizSubmit = async () => {
        try {
            // Kiểm tra xem đã trả lời hết các câu hỏi chưa
            const unansweredQuestions = Object.entries(quizAnswers).filter(([_, answer]) => answer === null);
            
            if (unansweredQuestions.length > 0) {
                toast.warning(`Bạn cần trả lời tất cả ${allQuizQuestions.length} câu hỏi trước khi nộp bài`);
                return;
            }
            
            // Kiểm tra kết quả
            let correctAnswers = 0;
            const results = {};
            
            allQuizQuestions.forEach(question => {
                // Sử dụng quizId hoặc id tuỳ theo cấu trúc dữ liệu
                const questionId = question.id || question.quizId;
                const correctAnswer = question.correctAnswer || question.answer;
                const userAnswer = quizAnswers[questionId];
                
                const isCorrect = userAnswer === correctAnswer;
                results[questionId] = isCorrect;
                if (isCorrect) correctAnswers++;
            });
            
            const score = (correctAnswers / allQuizQuestions.length) * 100;
            
            // Lưu kết quả vào state
            setQuizResult({
                score,
                results,
                correctAnswers,
                totalQuestions: allQuizQuestions.length,
                isPassed: score === 100,
                allCorrect: score === 100, // Để tương thích với code cũ
                message: score === 100 
                    ? 'Chúc mừng! Bạn đã hoàn thành tất cả các câu hỏi đúng.' 
                    : 'Rất tiếc! Một số câu trả lời của bạn chưa chính xác. Vui lòng thử lại.'
            });
            
            setQuizSubmitted(true);
            
            // Nếu đạt 100%, cập nhật tiến độ
            if (score === 100) {
                const token = localStorage.getItem('authToken');
                
                // Thêm quiz vào danh sách đã hoàn thành
                if (currentQuizId) {
                    setCompletedQuizzes(prev => [...prev, currentQuizId]);
                }
                
                // Kiểm tra nếu tất cả các chapter trong lesson đã hoàn thành
                const allCompleted = isAllChaptersCompleted(currentChapterId);
                
                // Nếu tất cả chapter đã hoàn thành và bài kiểm tra cũng đã hoàn thành,
                // đánh dấu lesson là đã hoàn thành
                if (allCompleted) {
                    await completeLesson(currentChapterId);
                }
                
                toast.success('Hoàn thành bài kiểm tra thành công!');
            } else {
                toast.warning('Bạn cần trả lời đúng 100% câu hỏi để hoàn thành bài kiểm tra');
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            toast.error('Đã xảy ra lỗi khi nộp bài kiểm tra');
        }
    };
    
    // Xử lý khi người dùng muốn làm lại bài kiểm tra
    const handleRetryQuiz = () => {
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizResult(null);
    };

    // Xử lý tải xuống tài liệu
    const handleDownload = (material) => {
        console.log('Download clicked', material);
        
        // Xác định đường dẫn tài liệu dựa trên cấu trúc dữ liệu
        let materialPath;
        if (material?.data?.path) {
            materialPath = material.data.path;
        } else if (material?.path) {
            materialPath = material.path;
        } else if (currentContent?.data?.path) {
            materialPath = currentContent.data.path;
        } else if (currentContent?.path) {
            materialPath = currentContent.path;
        } else if (currentContent?.videoPath) {
            materialPath = currentContent.videoPath;
        }
        
        if (materialPath) {
            // Lấy extension từ đường dẫn
            const extension = materialPath.split('.').pop().toLowerCase();
            
            // Lấy tên file từ đường dẫn (sử dụng như backup)
            const pathParts = materialPath.split('/');
            const originalFileName = pathParts[pathParts.length - 1];
            
            // Xác định tên hiển thị và tên file tải xuống
            let displayName = '';
            
            // Ưu tiên lấy tên từ material hoặc currentContent
            if (material?.name) {
                displayName = material.name;
            } else if (currentContent?.name) {
                displayName = currentContent.name;
            } else {
                // Nếu đang ở một chapter, lấy tên của chapter đó
                if (currentLessonId) {
                    const currentChapter = courseData.lesson
                        .flatMap(lesson => lesson.chapter || [])
                        .find(chapter => chapter.id === currentLessonId);
                    
                    if (currentChapter?.name) {
                        displayName = currentChapter.name;
                    }
                }
                
                // Nếu vẫn không có tên, sử dụng tên file gốc sau khi loại bỏ UUID
                if (!displayName) {
                    displayName = originalFileName.replace(/^[a-f0-9-]+\./, '');
                }
            }
            
            // Đảm bảo tên file không chứa ký tự đặc biệt không hợp lệ
            displayName = displayName
                .replace(/[\/\\:*?"<>|]/g, '_')  // Thay thế ký tự không hợp lệ bằng dấu gạch dưới
                .trim();
            
            // Tạo tên file tải xuống với extension đúng
            let downloadFileName = displayName;
            if (!downloadFileName.toLowerCase().endsWith(`.${extension}`)) {
                downloadFileName = `${downloadFileName}.${extension}`;
            }
            
            // Tạo URL đầy đủ
            const fileUrl = `${API_BASE_URL}${materialPath}`;
            
            const getMimeType = (extension) => {
                switch (extension.toLowerCase()) {
                    case 'pdf':
                        return 'application/pdf';
                    case 'doc':
                        return 'application/msword';
                    case 'docx':
                        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    case 'xls':
                        return 'application/vnd.ms-excel';
                    case 'xlsx':
                        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    case 'txt':
                        return 'text/plain';
                    case 'png':
                        return 'image/png';
                    case 'jpg':
                    case 'jpeg':
                        return 'image/jpeg';
                    default:
                        return 'application/octet-stream';
                }
            };
            
            try {
                const token = localStorage.getItem('authToken');
                setDownloadLoading(true);
                
                // Sử dụng axios để tải tệp
                axios({
                    method: 'GET',
                    url: fileUrl,
                    responseType: 'blob',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    withCredentials: false
                })
                .then(response => {
                    // Tạo blob với đúng MIME type
                    const mimeType = getMimeType(extension);
                    const blob = new Blob([response.data], { type: mimeType });
                    const url = window.URL.createObjectURL(blob);
                    
                    console.log(`Tải xuống file: ${downloadFileName}`);
                    
                    // Tạo link tải xuống
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', downloadFileName);
                    document.body.appendChild(link);
                    link.click();
                    
                    // Cleanup
                    setTimeout(() => {
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                        setDownloadLoading(false);
                    }, 100);
                })
                .catch(error => {
                    console.error('Error downloading file:', error);
                    showAlert('error', 'Lỗi', 'Có lỗi khi tải file. Vui lòng thử lại sau.');
                    setDownloadLoading(false);
                });
            } catch (err) {
                console.error('Error downloading file:', err);
                showAlert('error', 'Lỗi', 'Có lỗi xảy ra khi tải tài liệu. Vui lòng thử lại.');
                setDownloadLoading(false);
            }
        } else {
            console.error('No file path provided for download');
            showAlert('error', 'Lỗi', 'Không thể tải xuống tài liệu. Đường dẫn tệp không hợp lệ.');
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

    // Tìm chapter đầu tiên chưa hoàn thành
    const findFirstIncompleteChapter = (courseData, completedChapterIds) => {
        let result = null;
        
        // Sắp xếp các lesson theo thứ tự
        const sortedLessons = [...courseData.lesson].sort((a, b) => a.order - b.order);
        
        // Duyệt qua từng lesson
        for (const lesson of sortedLessons) {
            if (lesson.chapter && lesson.chapter.length > 0) {
                // Sắp xếp các chapter trong lesson theo thứ tự
                const sortedChapters = [...lesson.chapter].sort((a, b) => a.order - b.order);
                
                // Tìm chapter đầu tiên chưa hoàn thành
                const incompleteChapter = sortedChapters.find(chapter => !completedChapterIds.includes(chapter.id));
                
                if (incompleteChapter) {
                    result = {
                        lessonId: lesson.id,
                        chapterId: incompleteChapter.id,
                        lessonTitle: lesson.description,
                        chapter: incompleteChapter
                    };
                    break;
                }
            }
        }
        
        return result;
    };
    
    // Cuộn đến chapter hiện tại trong sidebar
    const scrollToCurrentChapter = (lessonId, chapterId) => {
        // Mở lesson chứa chapter hiện tại
        if (lessonId !== currentChapterId) {
            setCurrentChapterId(lessonId);
        }
        
        // Lấy ref của chapter item trong sidebar
        const chapterKey = `${lessonId}-${chapterId}`;
        const chapterElement = chapterRefs.current[chapterKey];
        
        if (chapterElement && sidebarRef.current) {
            console.log("Scrolling to chapter:", chapterKey);
            
            // Tính toán vị trí cuộn
            const sidebarRect = sidebarRef.current.getBoundingClientRect();
            const chapterRect = chapterElement.getBoundingClientRect();
            
            // Cuộn sidebar đến vị trí của chapter
            sidebarRef.current.scrollTop = chapterElement.offsetTop - sidebarRect.height / 3;
            
        } else {
            console.log("Cannot scroll to chapter, element not found:", chapterKey);
        }
    };

    // Kiểm tra trạng thái hoàn thành của lesson
    const checkLessonCompletion = async (lessonId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error("No token found when checking lesson completion");
                return false;
            }
            
            console.log('Checking completion for lesson:', lessonId);
            
            const response = await axios.get(`${API_BASE_URL}/lms/lessonprogress/getprogress/${lessonId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Lesson completion response:', response.data);
            
            // Kiểm tra kết quả từ API và xác định trạng thái hoàn thành
            if (response.data && response.data.result) {
                const isCompleted = response.data.result.isCompleted === true;
                console.log(`Lesson ${lessonId} completion status:`, isCompleted);
                
                // Cập nhật danh sách các lesson đã hoàn thành
                if (isCompleted) {
                    setCompletedLessonIds(prev => {
                        if (prev.includes(lessonId)) {
                            return prev;
                        }
                        return [...prev, lessonId];
                    });
                }
                
                return isCompleted;
            } else {
                console.log(`Lesson ${lessonId} is not completed or no data found`);
                return false;
            }
        } catch (err) {
            console.error('Error checking lesson completion:', err);
            return false;
        }
    };

    // Kiểm tra xem tất cả các chapter trong lesson đã hoàn thành chưa
    const isAllChaptersCompleted = (lessonId) => {
        // Lấy lesson cần kiểm tra
        const lesson = courseData?.lesson?.find(l => l.id === lessonId);
        if (!lesson?.chapter || lesson.chapter.length === 0) return true; // Nếu không có chapter nào thì coi như đã hoàn thành
        
        // Kiểm tra từng chapter trong lesson
        const allChaptersCompleted = lesson.chapter.every(chapter => 
            completedChapters.includes(chapter.id)
        );
        
        return allChaptersCompleted;
    };

    // Kiểm tra xem bài kiểm tra có được phép làm hay không
    const isQuizAccessible = (lessonId) => {
        // Giảng viên luôn có quyền truy cập bài kiểm tra
        return true;
    };

    // Hook để load danh sách bài kiểm tra đã hoàn thành từ localStorage khi component mount
    useEffect(() => {
        try {
            const savedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
            if (savedQuizzes.length > 0) {
                setCompletedQuizzes(savedQuizzes);
            }
        } catch (err) {
            console.error('Error loading completed quizzes from localStorage:', err);
        }
    }, []);

    // Hàm gọi API để khởi tạo lesson progress
    const initLessonProgress = async (lessonId) => {
        try {
            // Kiểm tra nếu lesson đã hoàn thành thì không cần khởi tạo
            if (completedLessonIds.includes(lessonId)) {
                console.log(`Lesson ${lessonId} already completed, skipping initialization`);
                return { result: { isCompleted: true } };
            }
            
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error("No token found when initializing lesson");
                return null;
            }
            
            console.log('Checking if lesson progress exists:', lessonId);
            
            // Trước tiên, kiểm tra xem lesson progress đã tồn tại chưa
            const progressResponse = await axios.get(`${API_BASE_URL}/lms/lessonprogress/getprogress/${lessonId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Lesson progress check response:', progressResponse.data);
            
            // Nếu không có kết quả hoặc isCompleted là null, mới khởi tạo progress
            if (!progressResponse.data.result || progressResponse.data.result.isCompleted === null) {
                console.log('Initializing progress for lesson:', lessonId);
                
                const response = await axios.post(`${API_BASE_URL}/lms/lessonprogress/savelessonprogress/${lessonId}`, null, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log('Lesson progress initialized:', response.data);
                
                // Chỉ cập nhật nếu response.data.result tồn tại và có isCompleted = true
                if (response.data && response.data.result && response.data.result.isCompleted === true) {
                    setCompletedLessonIds(prev => {
                        if (prev.includes(lessonId)) {
                            return prev;
                        }
                        return [...prev, lessonId];
                    });
                }
                
                return response.data;
            } else {
                console.log(`Lesson ${lessonId} progress already exists with isCompleted=${progressResponse.data.result.isCompleted}, skipping initialization`);
                
                // Nếu isCompleted là true, cập nhật danh sách lesson đã hoàn thành
                if (progressResponse.data.result.isCompleted === true) {
                    setCompletedLessonIds(prev => {
                        if (prev.includes(lessonId)) {
                            return prev;
                        }
                        return [...prev, lessonId];
                    });
                }
                
                return progressResponse.data;
            }
        } catch (err) {
            console.error('Error initializing lesson progress:', err);
            return null;
        }
    };

    // Kiểm tra tất cả các lesson trong khóa học để xác định lesson đã hoàn thành
    useEffect(() => {
        const checkAllLessonsCompletion = async () => {
            if (!courseData?.lesson || courseData.lesson.length === 0) {
                console.log("No lessons found in course data");
                return;
            }
            
            console.log("Checking completion status for all lessons");
            
            const allLessonIds = courseData.lesson.map(lesson => lesson.id);
            console.log(`Found ${allLessonIds.length} lessons to check`);
            
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error("No token found when checking all lessons");
                return;
            }
            
            try {
                const completedIds = [];
                
                for (const lessonId of allLessonIds) {
                    const isCompleted = await checkLessonCompletion(lessonId);
                    if (isCompleted) {
                        completedIds.push(lessonId);
                    }
                }
                
                console.log(`Found ${completedIds.length} completed lessons:`, completedIds);
                
                // Cập nhật state với danh sách lesson đã hoàn thành
                if (completedIds.length > 0) {
                    setCompletedLessonIds(completedIds);
                }
            } catch (err) {
                console.error('Error checking all lessons completion:', err);
            }
        };
        
        if (courseData) {
            checkAllLessonsCompletion();
        }
    }, [courseData]);

    // Xử lý đóng menu khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Handle course content menus
            if (menuOpen.type && menuOpen.id) {
                const isMenuButton = event.target.closest('.menu-trigger-button');
                if (isMenuButton) {
                    return;
                }
                
                const isInsideMenu = event.target.closest('.item-menu');
                if (!isInsideMenu) {
                    setMenuOpen({ type: null, id: null });
                }
            }
        };
        
        // Thêm event listener khi component mount
        document.addEventListener('mousedown', handleClickOutside);
        
        // Cleanup khi component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);
    
    // Hàm xử lý mở/đóng menu
    const toggleMenu = (e, type, id) => {
        e.stopPropagation();
        if (menuOpen.type === type && menuOpen.id === id) {
            setMenuOpen({ type: null, id: null });
        } else {
            setMenuOpen({ type, id });
        }
    };

    // Xử lý chỉnh sửa chương học (lesson trong API)
    const handleEditChapter = (e, lesson) => {
        e.stopPropagation();
        setMenuOpen({ type: null, id: null });
        setEditChapterData({
            idLesson: lesson.id,
            description: lesson.description || '',
            order: lesson.order || 1
        });
        setShowEditChapterModal(true);
    };

    // Xử lý chỉnh sửa bài học (chapter trong API)
    const handleEditLesson = (e, chapter) => {
        e.stopPropagation();
        setMenuOpen({ type: null, id: null });
        setEditLessonData({
            chapterId: chapter.id,
            name: chapter.name || '',
            order: chapter.order || 1,
            type: chapter.type || 'video'
        });
        setShowEditLessonModal(true);
    };

    // Xử lý xác nhận xóa chương
    const handleDeleteChapterConfirm = (e, lesson) => {
        e.stopPropagation();
        setItemToDelete(lesson);
        setShowDeleteChapterConfirm(true);
        setMenuOpen({ type: null, id: null });
    };

    // Xử lý xác nhận xóa bài học
    const handleDeleteLessonConfirm = (e, chapter) => {
        e.stopPropagation();
        setItemToDelete(chapter);
        setShowDeleteLessonConfirm(true);
        setMenuOpen({ type: null, id: null });
    };

    // Xử lý xác nhận xóa bài kiểm tra
    const handleDeleteQuizConfirm = (e, quiz) => {
        e.stopPropagation();
        const quizToDelete = {
            id: quiz.id,
            question: quiz.question
        };
        setItemToDelete(quizToDelete);
        setShowDeleteQuizConfirm(true);
        setMenuOpen({ type: null, id: null });
    };

    // Xử lý xác nhận xóa tài liệu học tập
    const handleDeleteMaterialConfirm = (e, material) => {
        e.stopPropagation();
        const materialToDelete = {
            id: material.id,
            fileName: material.fileName || 'Tài liệu không tên'
        };
        setItemToDelete(materialToDelete);
        setShowDeleteMaterialConfirm(true);
        setMenuOpen({ type: null, id: null });
    };

    // Xử lý xóa chương
    const handleDeleteChapter = async () => {
        if (!itemToDelete) return;
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // API call to delete lesson (which is a chapter in the UI)
            const response = await axios.delete(`${API_BASE_URL}/lms/lesson/${itemToDelete.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', 'Đã xóa chương học thành công!');
                // Refresh lại danh sách
                window.location.reload();
            } else {
                throw new Error(response.data?.message || 'Failed to delete chapter');
            }
        } catch (err) {
            console.error('Error deleting chapter:', err);
            showAlert('error', 'Lỗi', 'Không thể xóa chương học. Vui lòng thử lại sau.');
        } finally {
            setShowDeleteChapterConfirm(false);
            setItemToDelete(null);
        }
    };

    // Xử lý xóa bài học
    const handleDeleteLesson = async () => {
        if (!itemToDelete) return;
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // API call to delete chapter (lesson in UI)
            const response = await axios.delete(`${API_BASE_URL}/lms/chapter/delete`, {
                headers: { 
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    chapterId: itemToDelete.id
                }
            });

            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', 'Đã xóa bài học thành công!');
                // Refresh lại danh sách
                window.location.reload();
            } else {
                throw new Error(response.data?.message || 'Failed to delete lesson');
            }
        } catch (err) {
            console.error('Error deleting lesson:', err);
            showAlert('error', 'Lỗi', 'Không thể xóa bài học. Vui lòng thử lại sau.');
        } finally {
            setShowDeleteLessonConfirm(false);
            setItemToDelete(null);
        }
    };

    // Xử lý xóa bài kiểm tra
    const handleDeleteQuiz = async () => {
        if (!itemToDelete) return;
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // API call to delete quiz
            const response = await axios.delete(`${API_BASE_URL}/lms/lessonquiz/${itemToDelete.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', 'Đã xóa bài kiểm tra thành công!');
                // Refresh lại danh sách
                window.location.reload();
            } else {
                throw new Error(response.data?.message || 'Failed to delete quiz');
            }
        } catch (err) {
            console.error('Error deleting quiz:', err);
            showAlert('error', 'Lỗi', 'Không thể xóa bài kiểm tra. Vui lòng thử lại sau.');
        } finally {
            setShowDeleteQuizConfirm(false);
            setItemToDelete(null);
        }
    };

    // Xử lý xóa tài liệu học tập
    const handleDeleteMaterial = async () => {
        if (!itemToDelete) return;
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // API call to delete material
            const response = await axios.delete(`${API_BASE_URL}/lms/lessonmaterial/${itemToDelete.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', 'Đã xóa tài liệu học tập thành công!');
                // Refresh lại danh sách
                window.location.reload();
            } else {
                throw new Error(response.data?.message || 'Failed to delete material');
            }
        } catch (err) {
            console.error('Error deleting material:', err);
            showAlert('error', 'Lỗi', 'Không thể xóa tài liệu học tập. Vui lòng thử lại sau.');
        } finally {
            setShowDeleteMaterialConfirm(false);
            setItemToDelete(null);
        }
    };

    // Xử lý cập nhật chương học
    const handleUpdateChapter = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // API call to update lesson (which is a chapter in the UI)
            const response = await axios.put(`${API_BASE_URL}/lms/lesson/update`, editChapterData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', 'Đã cập nhật chương học thành công!');
                // Refresh lại danh sách
                window.location.reload();
                setShowEditChapterModal(false);
            } else {
                throw new Error(response.data?.message || 'Failed to update chapter');
            }
        } catch (err) {
            console.error('Error updating chapter:', err);
            showAlert('error', 'Lỗi', 'Không thể cập nhật chương học. Vui lòng thử lại sau.');
        }
    };

    // Xử lý điều hướng đến trang chỉnh sửa bài học
    const navigateToEditLesson = () => {
        navigate(`/teacher/edit-lesson/${courseId}`, {
            state: { 
                courseId: courseId,
                lessonId: editLessonData.chapterId
            }
        });
        setShowEditLessonModal(false);
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>Có lỗi xảy ra: {error}</div>;
    if (!courseData) return <div>Không tìm thấy khóa học</div>;

    // Calculate total lessons and completed lessons
    const totalLessons = courseData.lesson.reduce((total, chapter) => 
        total + (chapter.chapter ? chapter.chapter.length : 0), 0);

    // Tính toán số chapter đã hoàn thành
    const completedLessons = completedChapters.length;

    // Tính toán tỷ lệ phần trăm hoàn thành khóa học
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Tính số lesson đã hoàn thành
    const completedLessonCount = completedLessonIds.length;

    // Kiểm tra xem chapter hiện tại có phải là chapter cuối cùng của lesson cuối cùng không
    const isLastChapterOfLastLesson = (lessonId, chapterId) => {
        if (!courseData?.lesson) return false;
        
        // Sắp xếp tất cả các lesson theo thứ tự
        const sortedLessons = [...courseData.lesson].sort((a, b) => a.order - b.order);
        
        // Kiểm tra xem lesson hiện tại có phải lesson cuối cùng không
        const isLastLesson = sortedLessons[sortedLessons.length - 1].id === lessonId;
        
        if (!isLastLesson) return false;
        
        // Lấy lesson hiện tại
        const currentLesson = courseData.lesson.find(l => l.id === lessonId);
        if (!currentLesson?.chapter) return false;
        
        // Sắp xếp các chapter trong lesson
        const sortedChapters = [...currentLesson.chapter].sort((a, b) => a.order - b.order);
        
        // Kiểm tra xem chapter hiện tại có phải chapter cuối cùng không
        return sortedChapters[sortedChapters.length - 1].id === chapterId;
    };

    // Kiểm tra xem chapter hiện tại có phải là chapter đầu tiên của lesson đầu tiên không
    const isFirstChapterOfFirstLesson = (lessonId, chapterId) => {
        if (!courseData?.lesson) return false;
        
        // Sắp xếp tất cả các lesson theo thứ tự
        const sortedLessons = [...courseData.lesson].sort((a, b) => a.order - b.order);
        
        // Kiểm tra xem lesson hiện tại có phải lesson đầu tiên không
        const isFirstLesson = sortedLessons[0].id === lessonId;
        
        if (!isFirstLesson) return false;
        
        // Lấy lesson hiện tại
        const currentLesson = courseData.lesson.find(l => l.id === lessonId);
        if (!currentLesson?.chapter) return false;
        
        // Sắp xếp các chapter trong lesson
        const sortedChapters = [...currentLesson.chapter].sort((a, b) => a.order - b.order);
        
        // Kiểm tra xem chapter hiện tại có phải chapter đầu tiên không
        return sortedChapters[0].id === chapterId;
    };

    // Cập nhật hàm xử lý khi nhấn nút Hỏi đáp
    const handleQuestionClick = () => {
        setShowCommentModal(true);
    };
    
    // Hàm đóng modal CommentSection
    const handleCloseCommentModal = () => {
        setShowCommentModal(false);
    };

    return (
        <div className="learning-container">
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
            {/* Header */}
            <header className="learning-header">
                <div className="header-left">
                    <button onClick={handleBackToCourses} className="learning-back-button">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="course-logo-title">
                        <h1 className="learning-course-title">{courseData.name}</h1>
                    </div>
                </div>
                <div className="header-right">
                    <button className="header-button">
                        <BookOpen size={16} />
                        <span>Lịch sử hỏi đáp</span>
                    </button>
                    <button className="header-button" onClick={handleQuestionClick}>
                        <HelpCircle size={16} />
                        <span>Hỏi Đáp</span>
                    </button>
                </div>
            </header>

            {/* Main content */}
            <div className="learning-content">
                {/* Left content area */}
                <div className="content-area" ref={contentRef} onScroll={handleScroll}>
                    {currentLessonId ? (
                        <LearningContent 
                            currentLesson={courseData.lesson
                                .flatMap(chapter => 
                                    chapter.chapter?.filter(lesson => lesson.id === currentLessonId) || []
                                )[0] || currentContent}
                            content={currentContent}
                            onDownload={handleDownload}
                            onVideoEnded={handleVideoEnded}
                        />
                    ) : currentContent?.lessonType === 'material' ? (
                        <div className="material-content">
                            <div className="file-material-wrapper">
                                <div className="file-material-header">
                                    <div className="learning-file-info">
                                        <FileText size={24} />
                                        <h3>{currentContent.name}</h3>
                                    </div>
                                    <div className="file-actions">
                                        <button 
                                            className="download-button"
                                            onClick={() => handleDownload(currentContent)}
                                            disabled={downloadLoading}
                                        >
                                            <Download size={16} />
                                            {downloadLoading ? 'Đang tải...' : 'Tải xuống'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : currentContent?.isQuiz ? (
                        <div className="quiz-content">
                            <h2>{currentContent.name}</h2>
                            
                            {quizLoading ? (
                                <div className="quiz-loading">
                                    <p>Đang tải bài kiểm tra...</p>
                                </div>
                            ) : (
                                <div className="quiz-instructions">
                                    <div className="all-quiz-questions">
                                        {allQuizQuestions.map((quizQuestion, qIndex) => (
                                            <div key={quizQuestion.quizId} className="quiz-question-container">
                                                <h3>Câu hỏi {qIndex + 1}: {quizQuestion.question}</h3>
                                                <div className="quiz-options">
                                                    {quizQuestion.option && quizQuestion.option.split(';').map((option, idx) => {
                                                        const optionValue = option.trim().charAt(0);
                                                        const isUserSelected = quizAnswers[quizQuestion.quizId] === optionValue;
                                                        
                                                        // Đối với giảng viên, hiển thị đáp án đúng
                                                        const isCorrectAnswer = optionValue === quizQuestion.answer;
                                                        
                                                        let optionClassName = '';
                                                        if (isCorrectAnswer) optionClassName = 'correct-answer';
                                                        
                                                        return (
                                                            <div key={`${quizQuestion.quizId}-${idx}`} className="quiz-option">
                                                                <input 
                                                                    type="radio" 
                                                                    id={`${quizQuestion.quizId}-option-${idx}`} 
                                                                    name={`quiz-option-${quizQuestion.quizId}`} 
                                                                    value={optionValue}
                                                                    checked={isUserSelected}
                                                                    onChange={() => handleQuizAnswerChange(quizQuestion.quizId, optionValue)}
                                                                />
                                                                <label 
                                                                    htmlFor={`${quizQuestion.quizId}-option-${idx}`}
                                                                    className={optionClassName}
                                                                >
                                                                    {option.trim()} {isCorrectAnswer && '(Đáp án đúng)'}
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="content-placeholder">
                            <h3>Vui lòng chọn một bài học để xem nội dung</h3>
                    </div>
                    )}
                </div>

                {/* Right sidebar */}
                <div className={`course-sidebar ${!sidebarVisible ? 'hidden' : ''}`} ref={sidebarRef}>
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
                                    <div className="chapter-actions-wrapper">
                                    <div className="chapter-meta">
                                            <span>
                                                {chapter.chapter?.length || 0} bài học
                                            </span>
                                        </div>
                                        <div className="teacher-content-lesson-actions">
                                            <button 
                                                className="menu-trigger-button"
                                                onClick={(e) => toggleMenu(e, 'chapter', chapter.id)}
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            
                                            {menuOpen.type === 'chapter' && menuOpen.id === chapter.id && (
                                                <div className="item-menu">
                                                    <button 
                                                        className="menu-item edit-item"
                                                        onClick={(e) => handleEditChapter(e, chapter)}
                                                    >
                                                        <Edit size={16} />
                                                        <span>Chỉnh sửa</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {currentChapterId === chapter.id && (
                                    <div className="chapter-content">
                                        {/* Lessons */}
                                        {chapter.chapter && 
                                            chapter.chapter
                                                .sort((a, b) => a.order - b.order)
                                                .map((lesson) => {
                                                    // Xác định trạng thái của lesson
                                                    const isCompleted = completedChapters.includes(lesson.id);
                                                    // Giảng viên luôn có quyền truy cập
                                                    const isAccessible = true;
                                                    const isActive = currentLessonId === lesson.id;
                                                    
                                                    // Tạo class dựa vào trạng thái
                                                    const lessonClass = `lesson-item 
                                                        ${isActive ? 'active' : ''} 
                                                        ${isCompleted ? 'completed' : ''}`;
                                                    
                                                    return (
                                                        <div 
                                                            key={lesson.id}
                                                                        className={lessonClass}
                                                                        ref={el => chapterRefs.current[`${chapter.id}-${lesson.id}`] = el}
                                                        >
                                                            <div className="lesson-info"
                                                                 onClick={() => handleLessonClick(chapter.id, lesson.id, chapter.description, lesson.order)}>
                                                                <FileText size={16} className="lesson-icon" />
                                                                <div className="lesson-title">
                                                                    <span className="learning-lesson-number">{lesson.order}.</span>
                                                                    <span className="learning-lesson-name">{lesson.name}</span>
                                                                </div>
                                                            </div>
                                                            <div className='d-flex align-center' style={{gap: '4px'}}>
                                                                {isCompleted ? (
                                                                    <CircleCheck size={16} className="lesson-icon" />
                                                                ) : (
                                                                    <div></div>
                                                                )}
                                                                <div className="teacher-content-lesson-actions">
                                                                    <button 
                                                                        className="menu-trigger-button"
                                                                        onClick={(e) => toggleMenu(e, 'lesson', lesson.id)}
                                                                    >
                                                                        <MoreVertical size={16} />
                                                                    </button>
                                                                    
                                                                    {menuOpen.type === 'lesson' && menuOpen.id === lesson.id && (
                                                                        <div className="item-menu">
                                                                            <button 
                                                                                className="menu-item edit-item"
                                                                                onClick={(e) => handleEditLesson(e, lesson)}
                                                                            >
                                                                                <Edit size={16} />
                                                                                <span>Chỉnh sửa</span>
                                                                            </button>
                                                                            <button 
                                                                                className="menu-item delete-item"
                                                                                onClick={(e) => handleDeleteLessonConfirm(e, lesson)}
                                                                            >
                                                                                <Trash2 size={16} />
                                                                                <span>Xóa</span>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                        }

                                        {/* Materials */}
                                        {chapter.lessonMaterial && chapter.lessonMaterial.length > 0 && (
                                            <>
                                            <div className="section-learning-header">
                                                <span>Tài liệu học tập ({chapter.lessonMaterial.length})</span>
                                            </div>
                                                <div className="materials-list">
                                                    {chapter.lessonMaterial.map((material, index) => {
                                                        // Lấy tên file từ đường dẫn
                                                        let materialName = `Tài liệu ${index + 1}`;
                                                        if (material.path) {
                                                            const pathParts = material.path.split('/');
                                                            const fileName = pathParts[pathParts.length - 1];
                                                            // Xóa UUID từ tên file nếu có
                                                            const fileNameWithoutUUID = fileName.replace(/^[a-f0-9-]+\./, '');
                                                            materialName = fileNameWithoutUUID;
                                                        }
                                                        
                                                        const isActive = currentContent && 
                                                                         currentContent.isMaterial && 
                                                                         currentContent.index === index &&
                                                                         currentChapterId === chapter.id;
                                                        
                                                        return (
                                                            <div 
                                                                key={`material-${chapter.id}-${index}`}
                                                                className={`lesson-item material-item ${isActive ? 'active' : ''}`}
                                                            >
                                                            <div className="lesson-info"
                                                                 onClick={() => handleMaterialClick(chapter.id, index, material)}>
                                                                    <FileText size={16} className="lesson-icon" />
                                                                    <div className="lesson-title">
                                                                        <span className="learning-lesson-number">{index + 1}.</span>
                                                                        <span className="learning-lesson-name">{materialName}</span>
                                                                    </div>
                                                                </div>
                                                            <div className="teacher-content-lesson-actions">
                                                                <button 
                                                                    className="menu-trigger-button"
                                                                    onClick={(e) => toggleMenu(e, 'material', material.id)}
                                                                >
                                                                    <MoreVertical size={16} />
                                                                </button>
                                                                
                                                                {menuOpen.type === 'material' && menuOpen.id === material.id && (
                                                                    <div className="item-menu">
                                                                        <button 
                                                                            className="menu-item delete-item"
                                                                            onClick={(e) => handleDeleteMaterialConfirm(e, material)}
                                                                        >
                                                                            <Trash2 size={16} />
                                                                            <span>Xóa</span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        )}

                                        {/* Quizzes */}
                                        {chapter.lessonQuiz && chapter.lessonQuiz.length > 0 && (
                                            <>
                                            <div className="section-learning-header">
                                                <span>Bài kiểm tra ({chapter.lessonQuiz.length})</span>
                                        </div>
                                                <div className="quiz-list">
                                                    {chapter.lessonQuiz.map((quiz, index) => {
                                                        const quizId = `quiz-${chapter.id}-${index}`;
                                                        const isActive = currentContent && 
                                                                         currentContent.isQuiz && 
                                                                         currentContent.index === index &&
                                                                         currentChapterId === chapter.id;
                                                        
                                                        const isCompleted = completedQuizzes.includes(quizId);
                                                    // Giảng viên luôn có quyền truy cập bài kiểm tra
                                                        
                                                        // Tạo class dựa vào trạng thái
                                                        const quizClass = `lesson-item quiz-item 
                                                            ${isActive ? 'active' : ''} 
                                                        ${isCompleted ? 'completed' : ''}`;
                                                        
                                                        return (
                                                            <div 
                                                                key={quizId}
                                                                className={quizClass}
                                                        >
                                                            <div className="lesson-info"
                                                                 onClick={() => handleQuizClick(chapter.id, index, quiz)}>
                                                                        <BookOpen size={16} className="lesson-icon" />
                                                                    <div className="lesson-title">
                                                                        <span className="learning-lesson-number">{index + 1}.</span>
                                                                        <span className="learning-lesson-name">
                                                                            {quiz.question ? 
                                                                             (quiz.question.length > 30 ? 
                                                                              quiz.question.substring(0, 30) + '...' : 
                                                                              quiz.question) : 
                                                                             `Bài kiểm tra ${index + 1}`}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            <div className="d-flex align-center">
                                                                {isCompleted && (
                                                                    <CircleCheck size={16} className="lesson-icon" />
                                                                )}
                                                                <div className="teacher-content-lesson-actions">
                                                                    <button 
                                                                        className="menu-trigger-button"
                                                                        onClick={(e) => toggleMenu(e, 'quiz', quiz.id)}
                                                                    >
                                                                        <MoreVertical size={16} />
                                                                    </button>
                                                                    
                                                                    {menuOpen.type === 'quiz' && menuOpen.id === quiz.id && (
                                                                        <div className="item-menu">
                                                                            <button 
                                                                                className="menu-item delete-item"
                                                                                onClick={(e) => handleDeleteQuizConfirm(e, quiz)}
                                                                            >
                                                                                <Trash2 size={16} />
                                                                                <span>Xóa</span>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
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
                            isFirstChapterOfFirstLesson(currentChapterId, currentLessonId)
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
                            isLastChapterOfLastLesson(currentChapterId, currentLessonId)
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

            {/* Modal CommentSection */}
            {showCommentModal && (
                <div className="comment-modal-overlay">
                    <div className="comment-modal">
                        <div className="comment-modal-close" onClick={handleCloseCommentModal}>
                            <ChevronRight size={24} />
                        </div>
                        <CommentSection lessonId={currentLessonId} courseId={courseId} />
                    </div>
                </div>
            )}

            {/* Thêm CSS cho menu và buttons */}
            <style jsx="true">{`
                .menu-trigger-button {
                    background: none;
                    border: none;
                    color: #666;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                
                .menu-trigger-button:hover {
                    background-color: rgba(0, 0, 0, 0.05);
                    color: #333;
                }
                
                .item-menu {
                    position: absolute;
                    right: 0;
                    top: 100%;
                    background: white;
                    border-radius: 4px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    z-index: 100;
                    min-width: 150px;
                    padding: 8px 0;
                }
                
                .menu-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    width: 100%;
                    border: none;
                    background: none;
                    cursor: pointer;
                    text-align: left;
                    transition: background-color 0.2s;
                }
                
                .menu-item:hover {
                    background-color: rgba(0, 0, 0, 0.05);
                }
                
                .edit-item {
                    color: #4f46e5;
                }
                
                .delete-item {
                    color: #ef4444;
                }
                
                .delete-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                
                .delete-modal-container, .edit-modal-container {
                    background: white;
                    border-radius: 8px;
                    padding: 24px;
                    width: 90%;
                    max-width: 500px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                }
                
                .delete-modal-container h2, .edit-modal-container h2 {
                    font-size: 1.5rem;
                    margin-bottom: 16px;
                    color: #333;
                }
                
                .delete-modal-actions, .edit-modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 16px;
                    margin-top: 24px;
                }
                
                .btn-cancel-delete, .btn-cancel-edit {
                    padding: 8px 16px;
                    border: 1px solid #d1d5db;
                    background: white;
                    color: #4b5563;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                }
                
                .btn-confirm-delete {
                    padding: 8px 16px;
                    border: none;
                    background: #ef4444;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .btn-confirm-edit {
                    padding: 8px 16px;
                    border: none;
                    background: #4f46e5;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .edit-form-group {
                    margin-bottom: 16px;
                }
                
                .edit-form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: #4b5563;
                }
                
                .edit-form-group input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                }
                
                .teacher-content-lesson-actions {
                    position: relative;
                    display: flex;
                    align-items: center;
                    margin-left: 8px;
                }
                
                .chapter-actions-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .teacher-lesson-actions {
                    position: relative;
                    display: flex;
                    align-items: center;
                    margin-left: 4px;
                    z-index: 10;
                }
                
                .menu-trigger-button {
                    width: 24px;
                    height: 24px;
                    min-width: 24px;
                    opacity: 0.7;
                    z-index: 2;
                }
                
                .menu-trigger-button:hover {
                    opacity: 1;
                }
                
                .item-menu {
                    right: 0;
                    top: calc(100% + 5px);
                    z-index: 100;
                }
                
                .lesson-item, .material-item, .quiz-item {
                    padding-right: 8px;
                }
                
                .lesson-item .menu-trigger-button,
                .material-item .menu-trigger-button,
                .quiz-item .menu-trigger-button {
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                
                .lesson-item:hover .menu-trigger-button,
                .material-item:hover .menu-trigger-button,
                .quiz-item:hover .menu-trigger-button,
                .menu-trigger-button:focus {
                    opacity: 1;
                }
                
                /* Thêm CSS cho các menu modal */
                .edit-modal-container h2, .delete-modal-container h2 {
                    margin-top: 0;
                    color: #333;
                }
                
                .edit-form-group input:focus {
                    outline: none;
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
                }
                
                .btn-cancel-delete:hover, .btn-cancel-edit:hover {
                    background-color: #f3f4f6;
                }
                
                .btn-confirm-delete:hover {
                    background-color: #dc2626;
                }
                
                .btn-confirm-edit:hover {
                    background-color: #4338ca;
                }
                
                /* Đảm bảo menu không bị che khuất */
                .chapter-content {
                    position: relative;
                    z-index: 1;
                }
                
                /* Điều chỉnh z-index để menu item hiển thị đúng */
                .item-menu {
                    z-index: 999;
                }
            `}</style>

            {/* Thêm các modal xác nhận và chỉnh sửa */}
            {showEditChapterModal && (
                <div className="delete-modal-overlay">
                    <div className="edit-modal-container">
                        <h2>Chỉnh sửa chương học</h2>
                        <form onSubmit={handleUpdateChapter}>
                            <div className="edit-form-group">
                                <label htmlFor="description">Tên chương:</label>
                                <input 
                                    type="text" 
                                    id="description" 
                                    value={editChapterData.description} 
                                    onChange={(e) => setEditChapterData({...editChapterData, description: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="edit-form-group">
                                <label htmlFor="order">Thứ tự:</label>
                                <input 
                                    type="number" 
                                    id="order" 
                                    value={editChapterData.order} 
                                    onChange={(e) => setEditChapterData({...editChapterData, order: parseInt(e.target.value) || 1})}
                                    min="1" 
                                    required 
                                />
                            </div>
                            <div className="edit-modal-actions">
                                <button 
                                    type="button" 
                                    className="btn-cancel-edit"
                                    onClick={() => setShowEditChapterModal(false)}
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-confirm-edit"
                                >
                                    <Edit size={16} /> Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditLessonModal && (
                <div className="delete-modal-overlay">
                    <div className="edit-modal-container">
                        <h2>Chỉnh sửa bài học</h2>
                        <div className="edit-form-group">
                            <label>Tên bài học: {editLessonData.name}</label>
                        </div>
                        <p>Để chỉnh sửa bài học này, bạn sẽ cần chuyển đến trang chỉnh sửa chi tiết.</p>
                        <div className="edit-modal-actions">
                            <button 
                                className="btn-cancel-edit"
                                onClick={() => setShowEditLessonModal(false)}
                            >
                                Hủy
                            </button>
                            <button 
                                className="btn-confirm-edit"
                                onClick={navigateToEditLesson}
                            >
                                <Edit size={16} /> Chỉnh sửa bài học
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteChapterConfirm && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal-container">
                        <h2>Xác nhận xóa chương</h2>
                        <p>Bạn có chắc chắn muốn xóa chương "{itemToDelete?.description}" không?</p>
                        <p>Tất cả bài học, bài kiểm tra và tài liệu trong chương này cũng sẽ bị xóa. Hành động này không thể hoàn tác.</p>
                        <div className="delete-modal-actions">
                            <button 
                                className="btn-cancel-delete"
                                onClick={() => {
                                    setShowDeleteChapterConfirm(false);
                                    setItemToDelete(null);
                                }}
                            >
                                Hủy
                            </button>
                            <button 
                                className="btn-confirm-delete"
                                onClick={handleDeleteChapter}
                            >
                                <Trash2 size={16} /> Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteLessonConfirm && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal-container">
                        <h2>Xác nhận xóa bài học</h2>
                        <p>Bạn có chắc chắn muốn xóa bài học "{itemToDelete?.name}" không?</p>
                        <p>Hành động này không thể hoàn tác.</p>
                        <div className="delete-modal-actions">
                            <button 
                                className="btn-cancel-delete"
                                onClick={() => {
                                    setShowDeleteLessonConfirm(false);
                                    setItemToDelete(null);
                                }}
                            >
                                Hủy
                            </button>
                            <button 
                                className="btn-confirm-delete"
                                onClick={handleDeleteLesson}
                            >
                                <Trash2 size={16} /> Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteQuizConfirm && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal-container">
                        <h2>Xác nhận xóa bài kiểm tra</h2>
                        <p>Bạn có chắc chắn muốn xóa bài kiểm tra "{itemToDelete?.question}" không?</p>
                        <p>Hành động này không thể hoàn tác.</p>
                        <div className="delete-modal-actions">
                            <button 
                                className="btn-cancel-delete"
                                onClick={() => {
                                    setShowDeleteQuizConfirm(false);
                                    setItemToDelete(null);
                                }}
                            >
                                Hủy
                            </button>
                            <button 
                                className="btn-confirm-delete"
                                onClick={handleDeleteQuiz}
                            >
                                <Trash2 size={16} /> Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteMaterialConfirm && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal-container">
                        <h2>Xác nhận xóa tài liệu học tập</h2>
                        <p>Bạn có chắc chắn muốn xóa tài liệu học tập "{itemToDelete?.fileName}" không?</p>
                        <p>Hành động này không thể hoàn tác.</p>
                        <div className="delete-modal-actions">
                            <button 
                                className="btn-cancel-delete"
                                onClick={() => {
                                    setShowDeleteMaterialConfirm(false);
                                    setItemToDelete(null);
                                }}
                            >
                                Hủy
                            </button>
                            <button 
                                className="btn-confirm-delete"
                                onClick={handleDeleteMaterial}
                            >
                                <Trash2 size={16} /> Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherCourseContent;