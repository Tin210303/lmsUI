import React from 'react';
import '../assets/css/hero.css';

function Hero() {
    return (
        <section className="hero">
            <div className="hero-container">
                <div className="hero-content">
                    <h1>Nền tảng học trực tuyến hiện đại & hiệu quả</h1>
                    <p>
                    Khám phá hàng trăm khóa học chất lượng cao được thiết kế bởi các giảng viên hàng đầu của trường Đại học Khoa Học.
                    </p>
                    <button className="cta-button">BẮT ĐẦU NGAY <span className="arrow">→</span></button>
                </div>
                
                <div className="feature-boxes">
                    <div className="feature-box">
                        <div className="icon-container">
                            <img src="" alt="Course Management" />
                        </div>
                        <h3>Course Management</h3>
                    </div>
                    
                    <div className="feature-box active">
                        <div className="icon-container">
                            <img src="" alt="Online Learn Courses" />
                        </div>
                        <h3>Online Learn Courses</h3>
                    </div>
                    
                    <div className="feature-box">
                        <div className="icon-container">
                            <img src="/" alt="Teacher Management" />
                        </div>
                        <h3>Teacher Management</h3>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;