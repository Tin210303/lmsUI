import React from 'react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        console.log('Navigating to course with ID:', course.id);
        navigate(`/courses/${course.id}`);
    };

    return (
        <div className="course-card" onClick={handleClick}>
            <div className="course-image">
                {course.image ? (
                    <img src={course.image} alt={course.name} className="course-img" />
                ) : (
                    <div className="no-image" style={{ background: '#f0f0f0' }}>
                        <span>{course.name.charAt(0)}</span>
                    </div>
                )}
            </div>
            <div className="course-content">
                <h3 className="course-title">{course.name}</h3>
                <div className="course-info">
                    <p className="course-teacher">Giảng viên: {course.teacher?.fullName}</p>
                    <p className="course-duration">Loại khóa học: {course.learningDurationType}</p>
                    <p className="course-dates">
                        {new Date(course.startDate).toLocaleDateString('vi-VN')} - 
                        {new Date(course.endDate).toLocaleDateString('vi-VN')}
                    </p>
                </div>
                <div className="course-status">
                    <span className={`status-badge ${course.status.toLowerCase()}`}>
                        {course.status}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CourseCard; 