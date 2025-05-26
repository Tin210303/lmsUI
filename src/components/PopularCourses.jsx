import React from 'react';
import '../assets/css/popular-courses.css';
import jsimg from '../assets/imgs/js1.jpg';
import htmlimg from '../assets/imgs/html.png';
import reactimg from '../assets/imgs/reactjs.jpg';
import { User, Users, Book } from 'lucide-react'; 

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

    const truncateTeacherName = (name, maxLength = 11) => {
        if (!name) return 'Giảng viên';
        // Đảm bảo name là chuỗi
        const nameStr = String(name);
        if (nameStr.length <= maxLength) return nameStr;
        return nameStr.substring(0, maxLength) + '..';
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

                <div className='popular-courses-grid'>
                    <div className="course-card">
                        <div className="course-image">
                            <img src={jsimg} alt={jsimg} className="course-img" />
                        </div>
                        <div className="course-card-header">
                            <h3 className="course-title">Lập trình JavaScript cơ bản</h3>
                            <p className="course-dates">
                                Thời hạn: Không giới hạn
                            </p>
                            <p className="course-major">Chuyên ngành: Công nghệ thông tin</p>
                            <div className="course-status">
                                <span className={`status-badge public`}>
                                    PUBLIC
                                </span>
                                <span className="status-badge free">Miễn phí</span>
                            </div>
                        </div>
                        <div className="course-stats">
                            <div className="stat-item">
                                <User size={16} />
                                <span>{truncateTeacherName('Lê Văn Tiến')}</span>
                            </div>
                            <div className="stat-item">
                                <Users size={16} />
                                <span>45</span>
                            </div>
                            <div className="stat-item">
                                <Book size={16} />
                                <span>50 bài học</span>
                            </div>
                        </div>
                    </div>

                    <div className="course-card">
                        <div className="course-image">
                            <img src={htmlimg} alt={htmlimg} className="course-img" />
                        </div>
                        <div className="course-card-header">
                            <h3 className="course-title">HTML & CSS cơ bản đến nâng cao</h3>
                            <p className="course-dates">
                                Thời hạn: Không giới hạn
                            </p>
                            <p className="course-major">Chuyên ngành: Công nghệ thông tin</p>
                            <div className="course-status">
                                <span className={`status-badge public`}>
                                    PUBLIC
                                </span>
                                <span className="status-badge free">Miễn phí</span>
                            </div>
                        </div>
                        <div className="course-stats">
                            <div className="stat-item">
                                <User size={16} />
                                <span>{truncateTeacherName('Nguyễn Đình Tiến')}</span>
                            </div>
                            <div className="stat-item">
                                <Users size={16} />
                                <span>21</span>
                            </div>
                            <div className="stat-item">
                                <Book size={16} />
                                <span>117 bài học</span>
                            </div>
                        </div>
                    </div>

                    <div className="course-card">
                        <div className="course-image">
                            <img src={reactimg} alt={reactimg} className="course-img" />
                        </div>
                        <div className="course-card-header">
                            <h3 className="course-title">Xây dựng Website với ReactJS</h3>
                            <p className="course-dates">
                                Thời hạn: Không giới hạn
                            </p>
                            <p className="course-major">Chuyên ngành: Công nghệ thông tin</p>
                            <div className="course-status">
                                <span className={`status-badge public`}>
                                    PUBLIC
                                </span>
                                <span className="status-badge free">Miễn phí</span>
                            </div>
                        </div>
                        <div className="course-stats">
                            <div className="stat-item">
                                <User size={16} />
                                <span>{truncateTeacherName('Lê Văn Tiến')}</span>
                            </div>
                            <div className="stat-item">
                                <Users size={16} />
                                <span>83</span>
                            </div>
                            <div className="stat-item">
                                <Book size={16} />
                                <span>122 bài học</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default PopularCourses;