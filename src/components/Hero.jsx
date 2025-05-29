import React from 'react';
import '../assets/css/hero.css';
import { useState, useEffect } from 'react';

function Hero() {
    const [hovered, setHovered] = useState(false);
    const [animateClass, setAnimateClass] = useState("");

    useEffect(() => {
        if (hovered) {
        setAnimateClass("animate-green");
        } else {
        setAnimateClass("animate-red");
        }

        const interval = setInterval(() => {
        setAnimateClass(hovered ? "animate-green" : "animate-red");
        }, 1000); // Mỗi 1 giây lặp lại

        return () => clearInterval(interval);
    }, [hovered]);
    return (
        <section className="hero" id='home'>
            <div className="hero-container">
                <div className="hero-content">
                    <h1>Nền tảng học trực tuyến hiện đại & hiệu quả</h1>
                    <p>
                    Khám phá hàng trăm khóa học chất lượng cao được thiết kế bởi các giảng viên hàng đầu của trường Đại học Khoa Học.
                    </p>
                    <button
                    className={`cta-button ${animateClass}`}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    >
                    <span className="arrow">BẮT ĐẦU NGAY →</span>
                    </button>

                </div>
            </div>
        </section>
    );
}

export default Hero;