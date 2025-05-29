import React from 'react';
import '../assets/css/footer.css'
import { 
Book, 
Users, 
Key, 
MapPin, 
Phone, 
Mail,
Printer,
ChevronLeft,
ChevronRight,
ChevronRight as ArrowRight
} from 'lucide-react';
import logo from '../assets/imgs/logo.png';
import recentwork1 from '../assets/imgs/hoc1.jpg';
import recentwork2 from '../assets/imgs/hoc2.jpg';
import recentwork3 from '../assets/imgs/hoc3.jpg';
import recentwork4 from '../assets/imgs/hoc4.jpg';
import recentwork5 from '../assets/imgs/hoc5.jpg';
import recentwork6 from '../assets/imgs/section3.jpg';

function Footer() {
    return (
        <footer className="bookflare-footer" id='contact'>
            {/* Features Banner */}
            <div className="features-banner">
                <div className="container">
                    <div className="features-list">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <Book color="white" size={24} />
                            </div>
                            <div className="feature-text">80,000 KHÓA HỌC</div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <Users color="white" size={24} />
                            </div>
                            <div className="feature-text">GIẢNG DẠY BỞI CHUYÊN GIA</div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <Key color="white" size={24} />
                            </div>
                            <div className="feature-text">TRUY CẬP TRỌN ĐỜI</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="main-footer">
                <div className="container">
                    <div className="footer-content">
                        {/* Company Info */}
                        <div className="footer-column company-info">
                            <div className="footer-logo">
                                {/* <Book color="white" size={28} className="book-icon" />
                                <span className="logo-text">Bookflare</span> */}
                                <img src={logo} alt='Logo-LMS' style={{width: '12rem'}}/>
                            </div>
                            <p className="company-description">
                                Với hơn 30 năm kinh nghiệm tổng hợp trong lĩnh vực thiết kế hệ thống học tập và ứng dụng di động, chúng tôi tự tin mang đến trải nghiệm học tập hiệu quả và hiện đại cho người dùng
                            </p>
                            <div className="contact-info">
                                <div className="contact-item">
                                    <MapPin size={18} />
                                    <span>77 Nguyễn Huệ, Thành phố Huế, Phường Phú Nhuận, Quận Thuận Hóa, Thành phố Huế</span>
                                </div>
                                <div className="contact-item">
                                    <Phone size={18} />
                                    <span>Điện thoại: (+84) 0234.3823290</span>
                                </div>
                                <div className="contact-item">
                                    <Printer size={18} />
                                    <span>Fax: (+84) 0234.3824901</span>
                                </div>
                            </div>
                        </div>

                        {/* Useful Links */}
                        <div className="footer-column links-column">
                            <h3 className="column-title">LIÊN KẾT</h3>
                            <ul className="footer-links">
                                <li>
                                    <a href="https://student.husc.edu.vn" target="_blank" rel="noopener noreferrer">
                                        <ArrowRight size={14} className="arrow-icon" /> Trang Tín Chỉ
                                    </a>
                                </li>
                                <li>
                                    <a href="https://ums.husc.edu.vn/" target="_blank" rel="noopener noreferrer">
                                        <ArrowRight size={14} className="arrow-icon" /> Trang Thông Tin Đào Tạo
                                    </a>
                                </li>
                                <li>
                                    <a href="https://it.husc.edu.vn/" target="_blank" rel="noopener noreferrer">
                                        <ArrowRight size={14} className="arrow-icon" /> Khoa Công Nghệ Thông Tin
                                    </a>
                                </li>
                                <li>
                                    <a href="https://www.facebook.com/husc.edu.vn/" target="_blank" rel="noopener noreferrer">
                                        <ArrowRight size={14} className="arrow-icon" /> Đại Học Khoa Học Huế
                                    </a>
                                </li>
                                <li>
                                    <a href="https://www.facebook.com/DTDHCTSV.DHKH/" target="_blank" rel="noopener noreferrer">
                                        <ArrowRight size={14} className="arrow-icon" /> Phòng Đào Tạo ĐH & Công Tác SV
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Recent Work */}
                        <div className="footer-column recent-work">
                            <div className="column-header">
                                <h3 className="column-title">HOẠT ĐỘNG GẦN ĐÂY</h3>
                            </div>
                            <div className="work-gallery">
                                <div className="gallery-row">
                                    <div className="gallery-item">
                                        <img src={recentwork1} alt="Work sample" />
                                    </div>
                                    <div className="gallery-item">
                                        <img src={recentwork2} alt="Work sample" />
                                    </div>
                                    <div className="gallery-item">
                                        <img src={recentwork3} alt="Work sample" />
                                    </div>
                                </div>
                                <div className="gallery-row">
                                    <div className="gallery-item">
                                        <img src={recentwork4} alt="Work sample" />
                                    </div>
                                    <div className="gallery-item">
                                        <img src={recentwork5} alt="Work sample" />
                                    </div>
                                    <div className="gallery-item">
                                        <img src={recentwork6} alt="Work sample" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;