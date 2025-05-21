import React from 'react';
import '../assets/css/popular-courses.css';

function PopularCourses() {
    // Sample courses data
    const courses = [
        {
            id: 1,
            title: 'Build A Full Web Chat App',
            instructor: 'Ana Murphy',
            description: 'Lobortis arcu, a vestibulum augue. Vivamus ipsum neque, facilisis vel mollis vitae.',
            image: '/path/to/chat-app-image.jpg',
            rating: 5.0,
            reviews: 980,
            price: 'FREE'
        },
        {
            id: 2,
            title: 'Complete JavaScript Course',
            instructor: 'Rosy Janner',
            description: 'Lobortis arcu, a vestibulum augue. Vivamus ipsum neque, facilisis vel mollis vitae.',
            image: '/path/to/javascript-image.jpg',
            rating: 4.7,
            reviews: 2632,
            price: 'FREE'
        },
        {
            id: 3,
            title: 'Learning Python Data Analysis',
            instructor: 'Tom Steven',
            description: 'Lobortis arcu, a vestibulum augue. Vivamus ipsum neque, facilisis vel mollis vitae.',
            image: '/path/to/python-image.jpg',
            rating: 4.8,
            reviews: 7982,
            price: 'FREE'
        }
    ];

    // Function to render rating stars
    const renderRatingStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
        stars.push(
            <span key={i} className={i <= rating ? 'star filled' : 'star'}>★</span>
        );
        }
        return stars;
    };

    return (
        <section className="popular-courses">
            <div className="popular-container">
                <div className="section-header">
                <h2>Khám Phá Các Khóa Học Phổ Biến Nhất</h2>
                <p>
                    Với nội dung được chọn lọc kỹ lưỡng và giảng viên giàu kinh nghiệm, các khóa học dưới đây đang nhận được sự quan tâm hàng đầu từ học viên. Tăng cường kiến thức và kỹ năng của bạn ngay hôm nay với những khóa học miễn phí chất lượng cao!
                </p>
                </div>

                <div className="popular-courses-grid">
                {courses.map((course) => (
                    <div key={course.id} className="popular-course-card">
                        <div className="popular-course-image">
                            <img src={course.image} alt={course.title} />
                        </div>
                        <div className="popular-course-content">
                            <h3>{course.title}</h3>
                            <p className="instructor" style={{ color: course.id === 1 ? '#4CAF50' : course.id === 2 ? '#E91E63' : '#9C27B0' }}>
                            {course.instructor}
                            </p>
                            <p className="description">{course.description}</p>
                            <div className="popular-course-meta">
                                <div className="rating">
                                    {renderRatingStars(course.rating)}
                                    <span className="rating-value">{course.rating.toFixed(1)}</span>
                                    <span className="review-count">({course.reviews.toLocaleString()})</span>
                                </div>
                                <div className={`price ${course.price === 'FREE' ? 'free' : ''}`}>
                                    {course.price}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </section>
    );
}

export default PopularCourses;