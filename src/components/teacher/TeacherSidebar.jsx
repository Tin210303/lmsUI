import React from 'react';
import '../../assets/css/sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpenCheck, MessageSquareText} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { key: 'courses', label: 'Khóa học', icon: <BookOpenCheck size={20} />, path: '/teacher/dashboard' },
        { key: 'forum', label: 'Diễn đàn', icon: <MessageSquareText size={20} />, path: '/teacher/forum' },
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
