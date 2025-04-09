import React from 'react';
import '../assets/css/footer.css'
import { 
Book, 
Users, 
Key, 
MapPin, 
Phone, 
Mail,
ChevronLeft,
ChevronRight,
ChevronRight as ArrowRight
} from 'lucide-react';

function Footer() {
    return (
        <footer className="bookflare-footer">
            {/* Features Banner */}
            <div className="features-banner">
                <div className="container">
                    <div className="features-list">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <Book color="white" size={24} />
                            </div>
                            <div className="feature-text">80,000 ONLINE COURSES</div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <Users color="white" size={24} />
                            </div>
                            <div className="feature-text">EXPERT INSTRUCTION</div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <Key color="white" size={24} />
                            </div>
                            <div className="feature-text">LIFETIME ACCESS</div>
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
                                <Book color="white" size={28} className="book-icon" />
                                <span className="logo-text">Bookflare</span>
                            </div>
                            <p className="company-description">
                                We are a new design studio based in USA. We have over 20 years of combined experience, and know a thing or two about designing websites and mobile apps.
                            </p>
                            <div className="contact-info">
                                <div className="contact-item">
                                    <MapPin size={18} />
                                    <span>1107 Wood Street Saginaw, MI New York 48607</span>
                                </div>
                                <div className="contact-item">
                                    <Phone size={18} />
                                    <span>+123 345 678 000</span>
                                </div>
                                <div className="contact-item">
                                    <Mail size={18} />
                                    <span>info@example.com</span>
                                </div>
                            </div>
                        </div>

                        {/* Useful Links */}
                        <div className="footer-column links-column">
                            <h3 className="column-title">USEFUL LINK</h3>
                            <ul className="footer-links">
                                <li>
                                    <a href="#">
                                        <ArrowRight size={14} className="arrow-icon" /> Register Activation Key
                                    </a>
                                </li>
                                <li>
                                    <a href="#">
                                        <ArrowRight size={14} className="arrow-icon" /> Our Plans
                                    </a>
                                </li>
                                <li>
                                    <a href="#">
                                        <ArrowRight size={14} className="arrow-icon" /> Government Solutions
                                    </a>
                                </li>
                                <li>
                                    <a href="#">
                                        <ArrowRight size={14} className="arrow-icon" /> Academic Solutions
                                    </a>
                                </li>
                                <li>
                                    <a href="#">
                                        <ArrowRight size={14} className="arrow-icon" /> Intellectual Property
                                    </a>
                                </li>
                            </ul>
                            <ul className="footer-links right-links">
                                <li>
                                    <a href="#">
                                        <ArrowRight size={14} className="arrow-icon" /> Free Trial
                                    </a>
                                </li>
                                <li>
                                    <a href="#">
                                        <ArrowRight size={14} className="arrow-icon" /> Support
                                    </a>
                                </li>
                                <li>
                                    <a href="#">
                                        <ArrowRight size={14} className="arrow-icon" /> Contact Us
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Recent Work */}
                        <div className="footer-column recent-work">
                            <div className="column-header">
                                <h3 className="column-title">RECENT WORK</h3>
                                <div className="navigation-arrows">
                                    <button className="nav-arrow prev">
                                        <ChevronLeft size={14} />
                                    </button>
                                    <button className="nav-arrow next">
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="work-gallery">
                                <div className="gallery-row">
                                    <div className="gallery-item">
                                        <img src="/api/placeholder/130/100" alt="Work sample" />
                                    </div>
                                    <div className="gallery-item">
                                        <img src="/api/placeholder/130/100" alt="Work sample" />
                                    </div>
                                    <div className="gallery-item">
                                        <img src="/api/placeholder/130/100" alt="Work sample" />
                                    </div>
                                </div>
                                <div className="gallery-row">
                                    <div className="gallery-item">
                                        <img src="/api/placeholder/130/100" alt="Work sample" />
                                    </div>
                                    <div className="gallery-item">
                                        <img src="/api/placeholder/130/100" alt="Work sample" />
                                    </div>
                                    <div className="gallery-item">
                                        <img src="/api/placeholder/130/100" alt="Work sample" />
                                    </div>
                                </div>
                            </div>
                            <a href="#" className="view-more">VIEW MORE »</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;