import React from 'react';
import '../../assets/css/sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpenCheck, MessageSquareText, Newspaper, MessageCircleMore} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { key: 'courses', label: 'Khóa học', icon: <BookOpenCheck size={20} />, path: '/teacher/dashboard' },
        { key: 'forum', label: 'Nhóm', icon: <MessageSquareText size={20} />, path: '/teacher/forum' },
        { key: 'posts', label: 'Tài liệu', icon: <Newspaper size={20} />, path: '/teacher/documents' },
        { key: 'chat', label: 'Nhắn tin', icon: <MessageCircleMore size={20} />, path: '/chat' },
    ];

    return (
        <div className="sidebar">
            {navItems.map((item) => (
                <div
                    key={item.key}
                    className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default Sidebar;
