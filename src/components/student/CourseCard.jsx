import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Users, User } from 'lucide-react';
import axios from 'axios';

const CourseCard = ({ course, isEnrolled = false }) => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Đảm bảo các state là kiểu dữ liệu chuỗi
    const [lessonCount, setLessonCount] = useState(course?.lessonCount?.toString() || '0');
    
    // Đảm bảo teacherName là chuỗi, tránh render trực tiếp đối tượng teacher
    const [teacherName, setTeacherName] = useState(
        typeof course.teacher === 'object' ? (course.teacher?.fullName || 'N/A') : 
        typeof course.teacher === 'string' ? course.teacher : 'N/A'
    );
    
    // Đảm bảo studentCount là chuỗi
    const [studentCount, setStudentCount] = useState(course?.studentCount?.toString() || '0');
    const [courseImage, setCourseImage] = useState(null);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const token = localStorage.getItem('authToken');
    //             if (!token) {
    //                 throw new Error('No authentication token found');
    //             }

    //             // Fetch students
    //             const studentsResponse = await axios.get(`http://localhost:8080/lms/studentcourse/studentofcourse/${course.id}`, {
    //                 headers: {
    //                     'Authorization': `Bearer ${token}`
    //                 }
    //             });
    //             setStudents(studentsResponse.data.result || []);

    //             if (course.image) {
    //                 // Tạo URL đầy đủ từ tên file ảnh
    //                 const imageUrl = `http://localhost:8080/lms/course/image/${course.image}`;
    //                 setCourseImage(imageUrl);
    //             }
    //         } catch (err) {
    //             console.error('Error fetching data:', err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchData();
    // }, [course.id]);

    // Hàm tạo slug từ tên khóa học
    const createSlug = (name) => {
        if (!name || typeof name !== 'string') return 'course-' + Date.now();
        
        // Chuyển tiếng Việt có dấu thành không dấu
        let str = name.toLowerCase();
        str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        // Thay thế ký tự đặc biệt và dấu cách bằng dấu gạch ngang
        str = str.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        
        // Thêm thời gian hiện tại để đảm bảo slug là duy nhất
        return str + '-' + Date.now();
    };

    const handleClick = () => {
        // Tạo slug từ tên khóa học
        const slug = createSlug(course.name);

        // Lưu ID khóa học và trạng thái đăng ký vào localStorage với slug làm khóa
        localStorage.setItem(`course_${slug}`, course.id);
        localStorage.setItem(`course_${slug}_enrolled`, isEnrolled);
        
        // Điều hướng sử dụng slug thay vì ID
        console.log('Navigating to course with slug:', slug);
        navigate(`/courses/detail/${slug}`);
    };

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
        if (!id) return colors[0]; 
        // Đảm bảo ID là chuỗi trước khi xử lý
        const idStr = String(id);
        const sum = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[sum % colors.length];
    };
    
    // Format dates
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Cắt ngắn tên giảng viên nếu quá dài
    const truncateTeacherName = (name, maxLength = 11) => {
        if (!name) return 'Giảng viên';
        // Đảm bảo name là chuỗi
        const nameStr = String(name);
        if (nameStr.length <= maxLength) return nameStr;
        return nameStr.substring(0, maxLength) + '..';
    };

    // Đảm bảo course name là chuỗi
    const courseName = typeof course.name === 'string' ? course.name : 'Course Name';
    // Đảm bảo course major là chuỗi
    const courseMajor = typeof course.major === 'string' ? course.major : 'N/A';
    // Đảm bảo course status là chuỗi
    const courseStatus = typeof course.status === 'string' ? course.status : 'Unknown';

    return (
        <div className="course-card" onClick={handleClick}>
            <div className="course-image">
                {courseImage ? (
                    <img src={courseImage} alt={courseName} className="course-img" />
                ) : (
                    <div className="course-placeholder" style={{ background: getConsistentColor(course.id) }}>
                        <div className="image-text">
                            <div style={{ fontSize: "36px", fontWeight: "bold" }}>
                                {courseName.charAt(0).toUpperCase() || 'C'}
                            </div>
                            <div style={{ fontSize: "14px", marginTop: "5px" }}>
                                {courseName}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="course-card-header">
                <h3 className="course-title">{courseName}</h3>
                <p className="course-dates">
                    Thời hạn: {formatDate(course.startDate)} - {course.endDate ? formatDate(course.endDate) : "Không giới hạn"}
                </p>
                <p className="course-major">Chuyên ngành: {courseMajor}</p>
                <div className="course-status">
                    <span className={`status-badge ${courseStatus.toLowerCase()}`}>
                        {courseStatus}
                    </span>
                </div>
            </div>
            <div className="course-stats">
                <div className="stat-item" title={teacherName}>
                    <User size={16} />
                    <span>{truncateTeacherName(teacherName)}</span>
                </div>
                <div className="stat-item" title={`${studentCount} sinh viên`}>
                    <Users size={16} />
                    <span>{studentCount}</span>
                </div>
                <div className="stat-item">
                    <Book size={16} />
                    <span>{lessonCount} bài học</span>
                </div>
            </div>
        </div>
    );
};

export default CourseCard; 