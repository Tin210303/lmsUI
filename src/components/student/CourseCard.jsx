import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Users, User } from 'lucide-react';
import axios from 'axios';

const CourseCard = ({ course }) => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lessonCount, setLessonCount] = useState(course?.lessonCount || '0');
    const [teacherName, setTeacherName] = useState(course.teacher?.fullName || 'N/A');
    const [studentCount, setStudentCount] = useState(course?.studentCount || '0');
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                // Fetch students
                const studentsResponse = await axios.get(`http://localhost:8080/lms/studentcourse/studentofcourse/${course.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setStudents(studentsResponse.data.result || []);

                
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [course.id]);

    // Hàm tạo slug từ tên khóa học
    const createSlug = (name) => {
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

        // Lưu ID khóa học vào localStorage với slug làm khóa
        localStorage.setItem(`course_${slug}`, course.id);
        
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
        const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
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

    return (
        <div className="course-card" onClick={handleClick}>
            <div className="course-image">
                {course.image ? (
                    <img src={course.image} alt={course.name} className="course-img" />
                ) : (
                    <div className="course-placeholder" style={{ background: getConsistentColor(course.id) }}>
                        <div className="image-text">
                            <div style={{ fontSize: "36px", fontWeight: "bold" }}>
                                {course.name?.charAt(0).toUpperCase() || 'C'}
                            </div>
                            <div style={{ fontSize: "14px", marginTop: "5px" }}>
                                {course.name || 'Course'}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="course-card-header">
                <h3 className="course-title">{course.name || 'Course Name'}</h3>
                <p className="course-dates">
                    Thời hạn: {formatDate(course.startDate)} - {course.endDate ? formatDate(course.endDate) : "Không giới hạn"}
                </p>
                <p className="course-major">Chuyên ngành: {course.major || 'N/A'}</p>
                <div className="course-status">
                    <span className={`status-badge ${course.status?.toLowerCase() || 'unknown'}`}>
                        {course.status || 'Unknown'}
                    </span>
                </div>
            </div>
            <div className="course-stats">
                <div className="stat-item">
                    <User size={16} />
                    <span>{teacherName}</span>
                </div>
                <div className="stat-item">
                    <Users size={16} />
                    <span>{studentCount}</span>
                </div>
                <div className="stat-item">
                    <Book size={16} />
                    <span>{loading ? '...' : lessonCount} bài học</span>
                </div>
            </div>
        </div>
    );
};

export default CourseCard; 