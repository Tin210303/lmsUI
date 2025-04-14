import React, { useState, useEffect } from 'react';
import { getMyCourses } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';
import CourseCard from './CourseCard';
import '../../assets/css/coursespage.css';

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { authToken } = useAuth();

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const data = await getMyCourses();
                console.log('Fetched my courses:', data);
                setCourses(data || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching my courses:', error);
                setLoading(false);
            }
        };

        fetchMyCourses();
    }, [authToken]);

    if (loading) {
        return <div className="courses-container">Đang tải khóa học của bạn...</div>;
    }

    return (
        <div className="courses-container">
            <h1>Khóa học của bạn</h1>

            {courses.length === 0 ? (
                <p>Bạn chưa đăng ký khóa học nào.</p>
            ) : (
                <div className="courses-grid">
                    {courses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CoursesPage;
