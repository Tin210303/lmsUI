// Mock database for courses in the LMS system
const coursesData = [
    {
        id: 1,
        title: "Kiến Thức Nhập Môn IT",
        color: "linear-gradient(to right, #ff4b6a, #7b2fbf)",
        subtitle: "Kiến thức nhập môn{}",
        students: "133.889",
        views: "9",
        duration: "3h12p",
        image: "cube",
        chapters: [
            {
                id: 1,
                title: "Khái niệm kĩ thuật cần biết",
                lessons: [
                    {
                        id: 1,
                        title: "Mô hình Client - Server là gì?",
                        type: "video",
                        videoUrl: "https://example.com/videos/client-server",
                        duration: "15:30"
                    },
                    {
                        id: 2,
                        title: "Domain là gì? Tên miền là gì?",
                        type: "text",
                        content: "Domain là địa chỉ website trên Internet...",
                        duration: "10:00"
                    },
                    {
                        id: 3,
                        title: "Câu hỏi kiểm tra",
                        type: "quiz",
                        timeLimit: "10",
                        questions: [
                            {
                                id: 1,
                                question: "Mô hình Client-Server gồm mấy thành phần chính?",
                                options: ["1", "2", "3", "4"],
                                correctAnswer: "2"
                            }
                        ],
                        duration: "10:00"
                    }
                ]
            },
            {
                id: 2,
                title: "Môi trường, con người IT",
                lessons: []
            }
        ],
        totalChapters: 2,
        totalLessons: 3,
        totalDuration: "00 giờ 35 phút",
        isPrivate: true,
        totalLessonsCount: 3,
        formattedDuration: "03 giờ 26 phút",
        deadline: "10 ngày"
    },
    {
        id: 2,
        title: "Lập trình C++ cơ bản, nâng cao",
        color: "linear-gradient(to right, #00d2c1, #00b5e0)",
        subtitle: "Từ cơ bản đến nâng cao",
        students: "33.889",
        views: "55",
        duration: "10h18p",
        image: "cpp",
        chapters: [
            {
                id: 1,
                title: "Cơ bản về C++",
                lessons: [
                    {
                        id: 1,
                        title: "Giới thiệu ngôn ngữ C++",
                        type: "video",
                        videoUrl: "https://example.com/videos/cpp-intro",
                        duration: "20:15"
                    },
                    {
                        id: 2,
                        title: "Cú pháp cơ bản C++",
                        type: "text",
                        content: "C++ là ngôn ngữ lập trình phổ biến được phát triển bởi Bjarne Stroustrup...",
                        duration: "15:00"
                    }
                ]
            },
            {
                id: 2,
                title: "Cấu trúc dữ liệu và giải thuật",
                lessons: [
                    {
                        id: 1,
                        title: "Mảng và Vector trong C++",
                        type: "video",
                        videoUrl: "https://example.com/videos/cpp-arrays",
                        duration: "25:30"
                    }
                ]
            }
        ],
        totalChapters: 2,
        totalLessons: 3,
        totalDuration: "10 giờ 18 phút",
        isPrivate: false,
        totalLessonsCount: 3,
        formattedDuration: "10 giờ 18 phút",
        deadline: "30 ngày"
    },
    {
        id: 3,
        title: "HTML CSS từ Zero đến Hero",
        color: "linear-gradient(to right, #1d75fb, #3e60ff)",
        subtitle: "từ zero đến hero",
        students: "208.852",
        views: "117",
        duration: "29h5p",
        image: "html",
        chapters: [
            {
                id: 1,
                title: "HTML cơ bản",
                lessons: [
                    {
                        id: 1,
                        title: "Cấu trúc HTML cơ bản",
                        type: "video",
                        videoUrl: "https://example.com/videos/html-basics",
                        duration: "18:45"
                    }
                ]
            },
            {
                id: 2,
                title: "CSS cơ bản",
                lessons: [
                    {
                        id: 1,
                        title: "Giới thiệu về CSS",
                        type: "video",
                        videoUrl: "https://example.com/videos/css-intro",
                        duration: "22:10"
                    }
                ]
            }
        ],
        totalChapters: 2,
        totalLessons: 2,
        totalDuration: "29 giờ 5 phút",
        isPrivate: false,
        totalLessonsCount: 2,
        formattedDuration: "29 giờ 5 phút",
        deadline: "45 ngày"
    },
    {
        id: 4,
        title: "Responsive Với Grid System",
        color: "linear-gradient(to right, #e94b9c, #a229c5)",
        subtitle: "@web design",
        students: "46.843",
        views: "34",
        duration: "6h31p",
        image: "responsive",
        chapters: [
            {
                id: 1,
                title: "Giới thiệu về Grid",
                lessons: []
            },
            {
                id: 2,
                title: "Thực hành Grid",
                lessons: []
            }
        ],
        totalChapters: 2,
        totalLessons: 0,
        totalDuration: "6 giờ 31 phút",
        isPrivate: true,
        totalLessonsCount: 0,
        formattedDuration: "6 giờ 31 phút",
        deadline: "15 ngày"
    },
    {
        id: 5,
        title: "Lập Trình JavaScript Cơ Bản",
        color: "linear-gradient(to right, #ffda65, #ffa05c)",
        subtitle: "{.Cơ bản}",
        students: "146.390",
        views: "112",
        duration: "24h15p",
        image: "js-basic",
        chapters: [
            {
                id: 1,
                title: "Cú pháp JavaScript",
                lessons: []
            },
            {
                id: 2,
                title: "DOM và sự kiện",
                lessons: []
            }
        ],
        totalChapters: 2,
        totalLessons: 0,
        totalDuration: "24 giờ 15 phút",
        isPrivate: false,
        totalLessonsCount: 0,
        formattedDuration: "24 giờ 15 phút",
        deadline: "30 ngày"
    },
    {
        id: 6,
        title: "Lập Trình JavaScript Nâng Cao",
        color: "linear-gradient(to right, #ff7448, #ff5639)",
        subtitle: "{.Nâng cao}",
        students: "40.379",
        views: "19",
        duration: "8h41p",
        image: "js-advanced",
        chapters: [
            {
                id: 1,
                title: "JavaScript nâng cao",
                lessons: []
            },
            {
                id: 2,
                title: "JavaScript ES6+",
                lessons: []
            }
        ],
        totalChapters: 2,
        totalLessons: 0,
        totalDuration: "8 giờ 41 phút",
        isPrivate: true,
        totalLessonsCount: 0,
        formattedDuration: "8 giờ 41 phút",
        deadline: "20 ngày"
    },
    {
        id: 7,
        title: "Làm việc với Terminal & Ubuntu",
        color: "linear-gradient(to right, #c42f7c, #f16033)",
        subtitle: "Windows Terminal",
        students: "20.380",
        views: "28",
        duration: "4h59p",
        image: "terminal",
        chapters: [
            {
                id: 1,
                title: "Cơ bản về Terminal",
                lessons: []
            },
            {
                id: 2,
                title: "Ubuntu commands",
                lessons: []
            }
        ],
        totalChapters: 2,
        totalLessons: 0,
        totalDuration: "4 giờ 59 phút",
        isPrivate: false,
        totalLessonsCount: 0,
        formattedDuration: "4 giờ 59 phút",
        deadline: "15 ngày"
    },
    {
        id: 8,
        title: "Xây Dựng Website với ReactJS",
        color: "linear-gradient(to right, #172b4c, #2b4c78)",
        subtitle: "Learn once, write anywhere",
        students: "74.502",
        views: "112",
        duration: "27h32p",
        image: "react",
        chapters: [
            {
                id: 1,
                title: "React cơ bản",
                lessons: []
            },
            {
                id: 2,
                title: "React hooks",
                lessons: []
            }
        ],
        totalChapters: 2,
        totalLessons: 0,
        totalDuration: "27 giờ 32 phút",
        isPrivate: true,
        totalLessonsCount: 0,
        formattedDuration: "27 giờ 32 phút",
        deadline: "40 ngày"
    }
];

// Helper functions to work with course data
export const getAllCourses = () => {
    return coursesData;
};

export const getCourseById = (courseId) => {
    return coursesData.find(course => course.id === parseInt(courseId));
};

export const getChapterById = (courseId, chapterId) => {
    const course = getCourseById(courseId);
    if (!course) return null;
    
    return course.chapters.find(chapter => chapter.id === parseInt(chapterId));
};

export const getLessonById = (courseId, chapterId, lessonId) => {
    const chapter = getChapterById(courseId, chapterId);
    if (!chapter) return null;
    
    return chapter.lessons.find(lesson => lesson.id === parseInt(lessonId));
};

export const addChapter = (courseId, chapterTitle) => {
    const course = getCourseById(courseId);
    if (!course) return null;
    
    const newChapterId = Math.max(...course.chapters.map(ch => ch.id)) + 1;
    const newChapter = {
        id: newChapterId,
        title: chapterTitle,
        lessons: []
    };
    
    course.chapters.push(newChapter);
    course.totalChapters = course.chapters.length;
    
    return newChapter;
};

export const addLesson = (courseId, chapterId, lessonData) => {
    const chapter = getChapterById(courseId, chapterId);
    if (!chapter) return null;
    
    const newLessonId = chapter.lessons.length > 0 
        ? Math.max(...chapter.lessons.map(lesson => lesson.id)) + 1 
        : 1;
    
    const newLesson = {
        id: newLessonId,
        ...lessonData
    };
    
    chapter.lessons.push(newLesson);
    
    // Update course lesson counts
    const course = getCourseById(courseId);
    if (course) {
        course.totalLessons = course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
        course.totalLessonsCount = course.totalLessons;
    }
    
    return newLesson;
};

export default coursesData;
