import React from 'react';
import '../../assets/css/student-header.css';
import {Search} from 'lucide-react'
import logo from '../../assets/imgs/logo.png';
import avatar from '../../logo.svg';

const StudentHeader = () => {
    return (
        <header className="student-header">
            <div className="left-section">
                <img src={logo} alt="LMS Logo" className="logo" />
                <span className="title">Hệ Thống Học Tập Trực Tuyến</span>
            </div>

            <div className="search-box">
                <span className="search-icon">
                    <Search size={18} color='#787878'/>
                </span>
                <input
                    type="text"
                    placeholder="Tìm kiếm khóa học, bài viết, video, ..."
                />
            </div>

            <div className="right-section">
                <span className="my-courses">Khóa học của bạn</span>
                <div className="bell-icon">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="20"
                        viewBox="0 0 24 24"
                        width="20"
                        fill="currentColor"
                    >
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-2.8-1.7-5.1-4.3-5.8V4a1.7 1.7 0 0 0-3.4 0v1.2C7.7 5.9 6 8.2 6 11v5l-2 2v1h16v-1l-2-2z" />
                    </svg>
                </div>
                <img src={avatar} alt="Avatar" className="avatar" />
            </div>
        </header>
    );
};

export default StudentHeader;
