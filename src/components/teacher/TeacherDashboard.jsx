import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Eye } from 'lucide-react';
import '../../assets/css/coursespage.css';

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
    },
];

const CourseImage = ({ courseId, bgColor, subtitle }) => {
    const getImageContent = (id) => {
        switch (id) {
        case 1: return "⬛";
        case 2: return "C++";
        case 3: return "HTML";
        case 4: return "CSS";
        case 5: return "JS";
        case 6: return "JS";
        case 7: return "WSL";
        case 8: return "⚛️";
        default: return "";
        }
    };

    return (
        <div className="course-image" style={{ background: bgColor }}>
            <div className="image-text">
                <div style={{ fontSize: "28px", marginBottom: "5px" }}>
                    {getImageContent(courseId)}
                </div>
                <div style={{ fontSize: "14px" }}>{subtitle}</div>
            </div>
        </div>
    );
};

const CourseCard = ({ course }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/teacher/course/${course.id}`);
    };

    return (
        <div className="course-card" onClick={handleClick}>
            <CourseImage courseId={course.id} bgColor={course.color} subtitle={course.subtitle} />
            <h3 className="course-title">{course.title}</h3>
            <p className="free-tag">Miễn phí</p>
            <div className="course-stats">
                <div className="stat-item">
                    <Users size={16} />
                    <span>{course.students}</span>
                </div>
                <div className="stat-item">
                    <Eye size={16} />
                    <span>{course.views}</span>
                </div>
                <div className="stat-item">
                    <Clock size={16} />
                    <span>{course.duration}</span>
                </div>
            </div>
        </div>
    );
};

const TeacherDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="page-layout">
            <div className="main-content">
                <div className="course-container">
                    <div className="course-header">
                        <h2 className="course-header-title">Khóa học của bạn</h2>
                        <button className="add-course-button" onClick={() => navigate('/teacher/add-course')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            <span style={{ marginLeft: '5px' }}>Thêm Khóa Học</span>
                        </button>
                    </div>
                    <div className="courses-grid">
                        {coursesData.map(course => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
