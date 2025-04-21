import React, { useState, useEffect } from 'react';
import { getMyCourses, getAllCourses } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';
import CourseCard from './CourseCard';
import '../../assets/css/coursespage.css';

const CoursesPage = () => {
    const [myCourses, setMyCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState({
        myCourses: true,
        allCourses: true
    });
    const { authToken } = useAuth();

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const data = await getMyCourses();
                console.log('Fetched my courses:', data);
                setMyCourses(data || []);
                setLoading(prev => ({ ...prev, myCourses: false }));
            } catch (error) {
                console.error('Error fetching my courses:', error);
                setLoading(prev => ({ ...prev, myCourses: false }));
            }
        };

        const fetchAllCourses = async () => {
            try {
                const data = await getAllCourses();
                console.log('Fetched all courses:', data);
                setAllCourses(data || []);
                setLoading(prev => ({ ...prev, allCourses: false }));
            } catch (error) {
                console.error('Error fetching all courses:', error);
                setLoading(prev => ({ ...prev, allCourses: false }));
            }
        };

        fetchMyCourses();
        fetchAllCourses();
    }, [authToken]);

    const otherCourses = allCourses.filter(
        course => !myCourses.some(myCourse => myCourse.id === course.id)
    );

    if (loading.myCourses && loading.allCourses) {
        return <div className="courses-container">Đang tải dữ liệu khóa học...</div>;
    }

    return (
        <div className="courses-container">
            <div className="my-courses-section">
                <h1 className="section-title">Khóa học của bạn</h1>
                {loading.myCourses ? (
                    <p>Đang tải...</p>
                ) : myCourses.length === 0 ? (
                    <p className="empty-message">Bạn chưa đăng ký khóa học nào.</p>
                ) : (
                    <div className="courses-grid">
                        {myCourses.map(course => (
                            <CourseCard key={course.id} course={course} isEnrolled={true} />
                        ))}
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="section-divider"></div>

            {/* Phần khóa học phổ biến */}
            <div className="popular-courses-section">
                <h2 className="section-title">Các khóa học phổ biến</h2>
                {loading.allCourses ? (
                    <p>Đang tải...</p>
                ) : otherCourses.length === 0 ? (
                    <p className="empty-message">Không có khóa học nào khả dụng.</p>
                ) : (
                    <div className="courses-grid">
                        {otherCourses.map(course => (
                            <CourseCard key={course.id} course={course} isEnrolled={false} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoursesPage;
