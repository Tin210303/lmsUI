import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, LogOut } from 'lucide-react';
import logo from '../../assets/imgs/logo.png';
import { useAuth } from '../../context/AuthContext';
import '../../assets/css/header.css'; // Use the shared header CSS

const StudentHeader = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/'); // Redirect to homepage after logout
    };

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    // Function to close dropdown if clicked outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (event.target.closest('.profile-section')) {
                return; // Clicked inside the profile section, do nothing
            }
            setDropdownOpen(false); // Clicked outside, close dropdown
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <header className="header">
            <div className="left-section">
                <Link to="/courses"><img src={logo} alt="LMS Logo" className="logo" /></Link>
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
                <Link to="/courses" className="my-courses">Khóa học của tôi</Link>
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
                {user && (
                    <div className="profile-section">
                        <div className="profile-info" onClick={toggleDropdown} style={{ cursor: 'pointer' }}>
                             <img 
                                src={user.avatar || '/path/to/default-avatar.png'} // Use actual avatar or default
                                alt="Ava" 
                                className="avatar"
                            />
                        </div>
                       
                        {isDropdownOpen && (
                            <div className="profile-dropdown">
                                <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                    <User size={16} />
                                    <span>Thông tin cá nhân</span>
                                </Link>
                                <button onClick={handleLogout} className="dropdown-item logout-button">
                                    <LogOut size={16} />
                                    <span>Đăng Xuất</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default StudentHeader;
