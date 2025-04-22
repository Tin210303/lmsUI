import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, BookOpen, HelpCircle, MessageSquare, FileText, Download, Menu, Lock, CircleCheck } from 'lucide-react';
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
    const [chapterCompleted, setChapterCompleted] = useState(false);
    const [completedChapters, setCompletedChapters] = useState([]);
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
                
                const courseResult = response.data.result;
                console.log("Course data fetched:", courseResult); // Thêm log để kiểm tra dữ liệu
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
                        
                        // Kiểm tra tất cả các chapter để xác định những chapter đã hoàn thành
                        // Lấy kết quả trực tiếp từ hàm thay vì sử dụng state
                        const completedIds = await checkAllChaptersCompletion(courseResult);
                        
                        // Tìm chapter đầu tiên chưa hoàn thành
                        const firstIncompleteChapter = findFirstIncompleteChapter(courseResult, completedIds);
                        
                        if (firstIncompleteChapter) {
                            console.log("Found first incomplete chapter:", firstIncompleteChapter);
                            
                            // Thiết lập chapter hiện tại là chapter đầu tiên chưa hoàn thành
                            setCurrentChapterId(firstIncompleteChapter.lessonId);
                            setCurrentLessonId(firstIncompleteChapter.chapterId);
                            setCurrentChapter(firstIncompleteChapter.lessonTitle);
                            setCurrentContent(firstIncompleteChapter.chapter);
                            
                            // Khởi tạo progress cho chapter này nếu chưa tồn tại
                            if (!completedIds.includes(firstIncompleteChapter.chapterId)) {
                                console.log("Initializing first incomplete chapter");
                                await initChapterProgress(firstIncompleteChapter.chapterId);
                            }
                            
                            // Kiểm tra trạng thái hoàn thành của chapter
                            await checkChapterCompletion(firstIncompleteChapter.chapterId);
                            
                            // Cuộn đến chapter sau khi render hoàn tất
                            setTimeout(() => {
                                scrollToCurrentChapter(firstIncompleteChapter.lessonId, firstIncompleteChapter.chapterId);
                            }, 500);
                        } else {
                            // Nếu tất cả chapter đã hoàn thành, load chapter đầu tiên như mặc định
                            const firstChapterId = sortedChapters[0].id;
                            
                            console.log("All chapters completed or no incomplete chapter found, loading first chapter");
                            
                            // Sử dụng completedIds trả về từ hàm thay vì state completedChapters
                            if (!completedIds.includes(firstChapterId)) {
                                console.log("First chapter is not completed, initializing");
                                await initChapterProgress(firstChapterId);
                            } else {
                                console.log("First chapter is already completed, skipping initialization");
                            }
                            
                            setCurrentLessonId(firstChapterId);
                            setCurrentContent(sortedChapters[0]);
                            checkChapterCompletion(firstChapterId);
                        }
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
    
    // Kiểm tra tất cả các chapter để xác định những chapter đã hoàn thành
    const checkAllChaptersCompletion = async (courseData) => {
        if (!courseData?.lesson || courseData.lesson.length === 0) {
            console.log("No lessons found in course data");
            return [];
        }
        
        console.log("Checking completion status for all chapters");
        
        // Tạo mảng chứa tất cả các chapter id cần kiểm tra
        const allChapterIds = [];
        courseData.lesson.forEach(lesson => {
            if (lesson.chapter && lesson.chapter.length > 0) {
                lesson.chapter.forEach(chapter => {
                    allChapterIds.push(chapter.id);
                });
            }
        });
        
        console.log(`Found ${allChapterIds.length} chapters to check`);
        
        // Sử dụng Promise.all để kiểm tra đồng thời nhiều chapter
        const completedChapterIds = [];
        
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error("No token found when checking all chapters");
            return [];
        }
        
        try {
            const checkPromises = allChapterIds.map(async (chapterId) => {
                try {
                    const response = await axios.get(`http://localhost:8080/lms/lessonchapterprogress/getprogress/${chapterId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (response.data && response.data.result && response.data.result.isCompleted === true) {
                        console.log(`Chapter ${chapterId} is completed`);
                        completedChapterIds.push(chapterId);
                        return chapterId;
                    }
                    return null;
                } catch (err) {
                    console.log(`No progress found for chapter ${chapterId}`);
                    return null;
                }
            });
            
            // Chờ tất cả promises hoàn thành
            await Promise.all(checkPromises);
            
            console.log(`Found ${completedChapterIds.length} completed chapters:`, completedChapterIds);
            
            // Cập nhật state với danh sách chapter đã hoàn thành
            if (completedChapterIds.length > 0) {
                setCompletedChapters(completedChapterIds);
            }
            
            // Trả về mảng các chapter đã hoàn thành để sử dụng trực tiếp
            return completedChapterIds;
        } catch (err) {
            console.error("Error when checking all chapters:", err);
            return [];
        }
    };

    // Kiểm tra xem chapter có được phép truy cập hay không
    const isChapterAccessible = (chapterOrder, lessonId) => {
        // Lấy lesson đầu tiên (lesson có order = 1)
        const firstLesson = courseData?.lesson?.find(lesson => lesson.order === 1);
        // Lấy chapter đầu tiên trong lesson đầu tiên
        const firstLessonFirstChapter = firstLesson?.chapter?.find(chapter => chapter.order === 1);
        
        // Nếu đây là chapter đầu tiên của lesson đầu tiên, luôn cho phép truy cập
        if (firstLesson && firstLessonFirstChapter && firstLessonFirstChapter.id === lessonId) {
            return true;
        }
        
        // Nếu chapter hiện tại đã hoàn thành, cho phép truy cập
        if (completedChapters.includes(lessonId)) {
            return true;
        }
        
        // Lấy lesson chứa chapter hiện tại
        const currentLesson = courseData.lesson.find(lesson => 
            lesson.chapter && lesson.chapter.some(chapter => chapter.id === lessonId)
        );
        
        if (!currentLesson?.chapter) return false;
        
        // Sắp xếp các chapter theo thứ tự
        const sortedChapters = [...currentLesson.chapter].sort((a, b) => a.order - b.order);
        
        // Tìm vị trí của chapter hiện tại
        const currentChapterIndex = sortedChapters.findIndex(chapter => chapter.id === lessonId);
        
        // Nếu đây là chapter đầu tiên của lesson và lesson trước đã hoàn thành
        if (currentChapterIndex === 0) {
            // Tìm lesson trước đó
            const previousLesson = courseData.lesson
                .sort((a, b) => a.order - b.order)
                .find(lesson => lesson.order === currentLesson.order - 1);
            
            // Nếu không có lesson trước đó, chỉ cho phép truy cập nếu đây là lesson đầu tiên
            if (!previousLesson) {
                return currentLesson.order === 1;
            }
            
            // Kiểm tra xem lesson trước đó đã hoàn thành các chapter và làm bài kiểm tra chưa
            const previousLessonId = previousLesson.id;
            const previousLessonCompleted = isLessonCompleted(previousLessonId);
            
            // Nếu lesson trước không có bài kiểm tra
            if (!previousLesson.lessonQuiz || previousLesson.lessonQuiz.length === 0) {
                return previousLessonCompleted;
            }
            
            // Kiểm tra xem bài kiểm tra của lesson trước đã hoàn thành chưa
            const previousLessonQuizCompleted = previousLesson.lessonQuiz.every((quiz, index) => 
                completedQuizzes.includes(`quiz-${previousLessonId}-${index}`)
            );
            
            return previousLessonCompleted && previousLessonQuizCompleted;
        }
        
        // Nếu không phải chapter đầu tiên, kiểm tra xem chapter trước đó đã hoàn thành chưa
        const previousChapter = sortedChapters[currentChapterIndex - 1];
        return completedChapters.includes(previousChapter.id);
    };

    // Hàm gọi API để khởi tạo chapter progress
    const initChapterProgress = async (chapterId) => {
        try {
            // Kiểm tra nếu chapter đã hoàn thành thì không cần khởi tạo nữa
            if (completedChapters.includes(chapterId)) {
                console.log(`Chapter ${chapterId} already completed, skipping initialization`);
                return { result: { isCompleted: true } };
            }
            
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error("No token found when initializing chapter");
                return null;
            }
            
            console.log('Initializing progress for chapter:', chapterId);
            
            const response = await axios.post(`http://localhost:8080/lms/lessonchapterprogress/savechapterprogress/${chapterId}`, null, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Chapter progress initialized:', response.data);
            
            // Chỉ cập nhật nếu response.data.result tồn tại và có isCompleted = true
            if (response.data && response.data.result && response.data.result.isCompleted === true) {
                setCompletedChapters(prev => {
                    // Kiểm tra nếu chapterId đã tồn tại trong danh sách
                    if (prev.includes(chapterId)) {
                        return prev;
                    }
                    return [...prev, chapterId];
                });
            }
            
            return response.data;
        } catch (err) {
            console.error('Error initializing chapter progress:', err);
            return null;
        }
    };

    // Kiểm tra trạng thái hoàn thành của chapter
    const checkChapterCompletion = async (chapterId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error("No token found when checking chapter completion");
                return;
            }
            
            console.log('Checking completion for chapter:', chapterId);
            
            const response = await axios.get(`http://localhost:8080/lms/lessonchapterprogress/getprogress/${chapterId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Chapter completion response:', response.data);
            
            // Kiểm tra kết quả từ API và thiết lập trạng thái hoàn thành
            if (response.data && response.data.result) {
                const isCompleted = response.data.result.isCompleted === true;
                console.log(`Chapter ${chapterId} completion status:`, isCompleted);
                
                setChapterCompleted(isCompleted);
                
                // Cập nhật danh sách các chapter đã hoàn thành
                if (isCompleted) {
                    setCompletedChapters(prev => {
                        if (prev.includes(chapterId)) {
                            return prev;
                        }
                        return [...prev, chapterId];
                    });
                }
            } else {
                console.log(`Chapter ${chapterId} is not completed or no data found`);
                setChapterCompleted(false);
            }
        } catch (err) {
            console.error('Error checking chapter completion:', err);
            setChapterCompleted(false);
        }
    };

    // Hàm gọi API để đánh dấu chapter đã hoàn thành
    const completeChapter = async (chapterId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error("No token found when completing chapter");
                return null;
            }
            
            console.log('Sending request to complete chapter:', chapterId);
            
            const response = await axios.put(`http://localhost:8080/lms/lessonchapterprogress/completechapter/${chapterId}`, null, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Complete chapter API response:', response.data);
            
            // Kiểm tra code từ API response
            if (response.data && response.data.code === 0) {
                console.log('Chapter successfully marked as completed');
                
                // Cập nhật state
                setChapterCompleted(true);
                setCompletedChapters(prev => {
                    if (prev.includes(chapterId)) {
                        return prev;
                    }
                    return [...prev, chapterId];
                });
                
                return response.data;
            } else {
                const errorMsg = response.data?.message || 'Unknown error when completing chapter';
                console.error('Failed to complete chapter:', errorMsg);
                alert(`Không thể hoàn thành bài học. Lỗi: ${errorMsg}`);
                return null;
            }
        } catch (err) {
            console.error('Error completing chapter:', err);
            alert('Có lỗi xảy ra khi đánh dấu hoàn thành bài học. Vui lòng thử lại sau.');
            return null;
        }
    };

    const handleToggleChapter = (chapterId) => {
        setCurrentChapterId(currentChapterId === chapterId ? null : chapterId);
    };

    const handleLessonClick = async (chapterId, lessonId, chapterTitle, lessonOrder) => {
        console.log(`Attempting to access chapter ${lessonId} in lesson ${chapterId}, order: ${lessonOrder}`);
        
        // Kiểm tra xem chapter có được phép truy cập hay không
        if (!isChapterAccessible(lessonOrder, lessonId)) {
            console.log(`Chapter ${lessonId} not accessible`);
            alert('Bạn cần hoàn thành các bài học trước đó để mở khóa bài này!');
            return;
        }
        
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
        
        // Chỉ khởi tạo chapter progress nếu chapter chưa hoàn thành
        if (!completedChapters.includes(lessonId)) {
            console.log(`Chapter ${lessonId} not in completed list, initializing progress`);
            await initChapterProgress(lessonId);
        } else {
            console.log(`Chapter ${lessonId} already completed, skipping initialization`);
        }
        
        // Luôn kiểm tra trạng thái hoàn thành
        await checkChapterCompletion(lessonId);
    };

    const handleBackToCourses = () => {
        navigate('/courses');
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
        if (!courseData?.lesson || !currentChapterId || !chapterCompleted) return;
        
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
            
            // Chỉ khởi tạo chapter progress nếu chapter chưa hoàn thành
            if (!completedChapters.includes(nextChapter.id)) {
                initChapterProgress(nextChapter.id);
            }
            
            // Luôn kiểm tra trạng thái hoàn thành
            checkChapterCompletion(nextChapter.id);
        } 
        // Nếu đây là chapter cuối cùng nhưng không phải lesson cuối cùng
        else if (currentLessonIndex < sortedLessons.length - 1) {
            // Lấy lesson tiếp theo
            const nextLesson = sortedLessons[currentLessonIndex + 1];
            
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
                
                // Chỉ khởi tạo chapter progress nếu chapter chưa hoàn thành
                if (!completedChapters.includes(firstChapterOfNextLesson.id)) {
                    initChapterProgress(firstChapterOfNextLesson.id);
                }
                
                // Luôn kiểm tra trạng thái hoàn thành
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
            fileUrl: `http://localhost:8080${material.path}`,
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
        
        // Kiểm tra xem bài kiểm tra có được phép làm hay không
        if (!isQuizAccessible(lessonId)) {
            alert('Bạn cần hoàn thành tất cả các bài học trong chương này trước khi làm bài kiểm tra!');
            return;
        }
        
        // Reset trạng thái bài kiểm tra
        setQuizSubmitted(false);
        setQuizResult(null);
        setQuizLoading(true);
        
        // Đặt chapter hiện tại là lesson chứa quiz
        setCurrentChapterId(lessonId);
        
        // Lấy toàn bộ bài kiểm tra của lesson
        const lesson = courseData.lesson.find(l => l.id === lessonId);
        if (!lesson || !lesson.lessonQuiz || lesson.lessonQuiz.length === 0) {
            alert('Không tìm thấy bài kiểm tra cho chương này!');
            setQuizLoading(false);
            return;
        }
        
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
            allCompleted: allCompleted
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
    
    // Xử lý khi người dùng nộp bài kiểm tra
    const handleQuizSubmit = (lessonId) => {
        // Kiểm tra xem tất cả các câu hỏi đã được trả lời chưa
        const allAnswered = allQuizQuestions.every(question => 
            quizAnswers[question.quizId] !== undefined
        );
        
        if (!allAnswered) {
            alert('Vui lòng trả lời tất cả các câu hỏi trước khi nộp bài!');
            return;
        }
        
        // Kiểm tra từng câu trả lời
        let allCorrect = true;
        const resultDetails = allQuizQuestions.map(question => {
            const userAnswer = quizAnswers[question.quizId];
            const isCorrect = userAnswer === question.answer;
            
            if (!isCorrect) {
                allCorrect = false;
            }
            
            return {
                quizId: question.quizId,
                isCorrect: isCorrect
            };
        });
        
        // Hiển thị kết quả tổng hợp
        setQuizResult({
            allCorrect,
            details: resultDetails,
            message: allCorrect 
                ? 'Chúc mừng! Bạn đã hoàn thành tất cả các câu hỏi đúng.' 
                : 'Rất tiếc! Một số câu trả lời của bạn chưa chính xác. Vui lòng thử lại.'
        });
        
        // Đánh dấu đã nộp bài
        setQuizSubmitted(true);
        
        // Nếu đúng hết, đánh dấu tất cả bài kiểm tra đã hoàn thành
        if (allCorrect) {
            const newCompletedQuizzes = [...completedQuizzes];
            
            allQuizQuestions.forEach(question => {
                if (!completedQuizzes.includes(question.quizId)) {
                    newCompletedQuizzes.push(question.quizId);
                }
            });
            
            // Cập nhật state
            setCompletedQuizzes(newCompletedQuizzes);
            
            // Lưu trạng thái vào localStorage
            try {
                localStorage.setItem('completedQuizzes', JSON.stringify(newCompletedQuizzes));
            } catch (err) {
                console.error('Error saving completed quizzes to localStorage:', err);
            }
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
            const fileUrl = `http://localhost:8080${materialPath}`;
            
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
                    alert('Có lỗi khi tải file. Vui lòng thử lại sau.');
                    setDownloadLoading(false);
                });
            } catch (err) {
                console.error('Error downloading file:', err);
                alert('Có lỗi xảy ra khi tải tài liệu. Vui lòng thử lại.');
                setDownloadLoading(false);
            }
        } else {
            console.error('No file path provided for download');
            alert('Không thể tải xuống tài liệu. Đường dẫn tệp không hợp lệ.');
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

    // Kiểm tra xem tất cả các chapter trong lesson đã hoàn thành chưa
    const isLessonCompleted = (lessonId) => {
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
        // Kiểm tra xem tất cả các chapter trong lesson đã hoàn thành chưa
        return isLessonCompleted(lessonId);
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

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>Có lỗi xảy ra: {error}</div>;
    if (!courseData) return <div>Không tìm thấy khóa học</div>;

    // Calculate total lessons and completed lessons
    const totalLessons = courseData.lesson.reduce((total, chapter) => 
        total + (chapter.chapter ? chapter.chapter.length : 0), 0);
    const completedLessons = completedChapters.length; // Số chapter đã hoàn thành
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

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
                            <h2>{currentContent.name}</h2>
                            <div className="file-wrapper">
                                <div className="file-header">
                                    <div className="learning-file-info">
                                        <FileText size={24} />
                                        <h3>{currentContent.name}</h3>
                                    </div>
                                    <div className="file-actions">
                                        <button 
                                            className="view-button"
                                            onClick={() => window.open(`http://localhost:8080${currentContent.path}`, '_blank')}
                                        >
                                            <BookOpen size={16} />
                                            Xem tài liệu
                                        </button>
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
                                <div className="material-body">
                                    {currentContent.fileType === 'pdf' && (
                                        <div className="pdf-preview">
                                            <div className="file-actions pdf-actions">
                                                <button 
                                                    className="download-button"
                                                    onClick={() => handleDownload(currentContent)}
                                                    disabled={downloadLoading}
                                                >
                                                    <Download size={16} />
                                                    {downloadLoading ? 'Đang tải...' : 'Tải xuống'}
                                                </button>
                                            </div>
                                            <iframe 
                                                src={`http://localhost:8080${currentContent.path}#toolbar=0`} 
                                                title={currentContent.name}
                                                width="100%"
                                                height="600px"
                                                style={{border: 'none'}}
                                            />
                                        </div>
                                    )}
                                    {currentContent.fileType === 'image' && (
                                        <div className="image-preview">
                                            <img 
                                                src={`http://localhost:8080${currentContent.path}`} 
                                                alt={currentContent.name} 
                                                style={{maxWidth: '100%'}}
                                            />
                                        </div>
                                    )}
                                    {['document', 'spreadsheet', 'presentation', 'unknown'].includes(currentContent.fileType) && (
                                        <div className="file-info">
                                            <p>Tài liệu này không hỗ trợ xem trực tiếp. Vui lòng tải xuống hoặc mở trong tab mới để xem.</p>
                                            <div className="file-buttons">
                                                <a 
                                                    href={`http://localhost:8080${currentContent.path}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="material-link"
                                                >
                                                    <BookOpen size={16} />
                                                    Mở trong tab mới
                                                </a>
                                                <button 
                                                    className="material-download"
                                                    onClick={() => handleDownload(currentContent)}
                                                    disabled={downloadLoading}
                                                >
                                                    <Download size={16} />
                                                    {downloadLoading ? 'Đang tải...' : 'Tải xuống'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : currentContent?.isQuiz ? (
                        <div className="quiz-content">
                            <h2>{currentContent.name}</h2>
                            {currentContent.allCompleted && !quizSubmitted ? (
                                <div className="quiz-completed-info">
                                    <div className="quiz-completion-message">
                                        <CircleCheck size={24} />
                                        <p>Bạn đã hoàn thành tất cả bài kiểm tra này. Bạn có thể làm lại nếu muốn.</p>
                                    </div>
                                </div>
                            ) : null}
                            
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
                                                        
                                                        // Chỉ hiển thị kết quả nếu đã nộp bài
                                                        const showCorrectAnswer = quizSubmitted && quizResult?.allCorrect && optionValue === quizQuestion.answer;
                                                        const showWrongAnswer = quizSubmitted && !quizResult?.allCorrect && isUserSelected && optionValue !== quizQuestion.answer;
                                                        
                                                        let optionClassName = '';
                                                        if (showCorrectAnswer) optionClassName = 'correct-answer';
                                                        if (showWrongAnswer) optionClassName = 'wrong-answer';
                                                        
                                                        return (
                                                            <div key={`${quizQuestion.quizId}-${idx}`} className="quiz-option">
                                                                <input 
                                                                    type="radio" 
                                                                    id={`${quizQuestion.quizId}-option-${idx}`} 
                                                                    name={`quiz-option-${quizQuestion.quizId}`} 
                                                                    value={optionValue}
                                                                    checked={isUserSelected}
                                                                    onChange={() => handleQuizAnswerChange(quizQuestion.quizId, optionValue)}
                                                                    disabled={quizSubmitted}
                                                                />
                                                                <label 
                                                                    htmlFor={`${quizQuestion.quizId}-option-${idx}`}
                                                                    className={optionClassName}
                                                                >
                                                                    {option.trim()}
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                {qIndex < allQuizQuestions.length - 1 && (
                                                    <hr className="quiz-divider" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {quizSubmitted && quizResult && (
                                        <div className={`quiz-result ${quizResult.allCorrect ? 'correct' : 'incorrect'}`}>
                                            <p>{quizResult.message}</p>
                                        </div>
                                    )}
                                    
                                    <div className="quiz-actions">
                                        {!quizSubmitted ? (
                                            <button 
                                                className="submit-quiz-button"
                                                onClick={() => handleQuizSubmit(currentContent.lessonId)}
                                                disabled={allQuizQuestions.some(q => !quizAnswers[q.quizId])}
                                            >
                                                Nộp bài
                                            </button>
                                        ) : (
                                            <div className="quiz-action-buttons">
                                                {quizResult && quizResult.allCorrect ? (
                                                    <button 
                                                        className="quiz-continue-button"
                                                        onClick={() => handleNext()}
                                                    >
                                                        Tiếp tục
                                                    </button>
                                                ) : (
                                                    <button 
                                                        className="quiz-retry-button"
                                                        onClick={handleRetryQuiz}
                                                    >
                                                        Làm lại
                                                    </button>
                                                )}
                                            </div>
                                        )}
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
                                    <div className="chapter-meta">
                                            <span>
                                                {chapter.chapter ? 
                                                    chapter.chapter.filter(c => completedChapters.includes(c.id)).length 
                                                    : 0}/{chapter.chapter?.length || 0}
                                            </span>
                                            <span className="duration">{chapter.duration || '00:00'}</span>
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
                                                    const isAccessible = isChapterAccessible(lesson.order, lesson.id);
                                                    const isActive = currentLessonId === lesson.id;
                                                    
                                                    // Tạo class dựa vào trạng thái
                                                    const lessonClass = `lesson-item 
                                                        ${isActive ? 'active' : ''} 
                                                        ${isCompleted ? 'completed' : ''} 
                                                        ${!isAccessible ? 'locked' : ''}`;
                                                    
                                                    return (
                                            <div 
                                                key={lesson.id}
                                                            className={lessonClass}
                                                            onClick={() => handleLessonClick(chapter.id, lesson.id, chapter.description, lesson.order)}
                                                            ref={el => chapterRefs.current[`${chapter.id}-${lesson.id}`] = el}
                                            >
                                                <div className="lesson-info">
                                                                {!isAccessible ? (
                                                                    <Lock size={16} className="lesson-icon lock-icon" />
                                                                ) : (
                                                    <FileText size={16} className="lesson-icon" />
                                                                )}
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
                                                <span className="lesson-duration">00:00</span>
                                            </div>
                                                        </div>
                                                    );
                                                })
                                        }

                                        {/* Materials */}
                                        {chapter.lessonMaterial && chapter.lessonMaterial.length > 0 && (
                                            <>
                                            <div className="section-header">
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
                                                                onClick={() => handleMaterialClick(chapter.id, index, material)}
                                                            >
                                                                <div className="lesson-info">
                                                                    <FileText size={16} className="lesson-icon" />
                                                                    <div className="lesson-title">
                                                                        <span className="learning-lesson-number">{index + 1}.</span>
                                                                        <span className="learning-lesson-name">{materialName}</span>
                                                                    </div>
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
                                            <div className="section-header">
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
                                                        const isAccessible = isQuizAccessible(chapter.id);
                                                        
                                                        // Tạo class dựa vào trạng thái
                                                        const quizClass = `lesson-item quiz-item 
                                                            ${isActive ? 'active' : ''} 
                                                            ${isCompleted ? 'completed' : ''} 
                                                            ${!isAccessible ? 'locked' : ''}`;
                                                        
                                                        return (
                                                            <div 
                                                                key={quizId}
                                                                className={quizClass}
                                                                onClick={() => handleQuizClick(chapter.id, index, quiz)}
                                                            >
                                                                <div className="lesson-info">
                                                                    {!isAccessible ? (
                                                                        <Lock size={16} className="lesson-icon lock-icon" />
                                                                    ) : (
                                                                        <BookOpen size={16} className="lesson-icon" />
                                                                    )}
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
                                                                {isCompleted && (
                                                                    <CircleCheck size={16} className="lesson-icon" />
                                                                )}
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
                            !chapterCompleted || 
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
                        {chapterCompleted && <span className="completion-status">(Đã hoàn thành)</span>}
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