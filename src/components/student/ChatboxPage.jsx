import React, { useState } from 'react';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { BiChevronDown, BiPlus, BiMessageDetail } from 'react-icons/bi';
import { FiSend, FiPaperclip } from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import '../../assets/css/chatbox.css';

const ChatboxPage = () => {
    const [message, setMessage] = useState('');

    // Sample data for demonstration
    const channels = [
        { id: 1, name: 'Group 1', active: true },
        { id: 2, name: 'Group 1', active: false },
        { id: 3, name: 'Group 1', active: false },
        { id: 4, name: 'Group 1', active: false },
    ];

    const directMessages = [
        { id: 1, name: 'Ngô Tấn', active: false },
        { id: 2, name: 'Lê Văn Tiến', active: false },
        { id: 3, name: 'Nguyễn Đình Tiến', active: false },
    ];

    const chatMessages = [
        {
            id: 1,
            sender: 'Teacher',
            message: 'Buổi học sáng nay. Thời gian chủ yếu giành cho việc làm bài tập. Cụ thể các em sẽ đọc trong phần bài tập sẽ đăng lên lúc 7h25.',
            time: '11:44 AM',
            isCurrentUser: false,
        },
        {
            id: 2,
            sender: 'Me',
            message: 'Bộ máy đéo thích học',
            time: '11:44 AM',
            isCurrentUser: true,
        },
        {
            id: 3,
            sender: 'Teacher',
            message: 'Ngu còn ko chịu học hành',
            time: '11:45 AM',
            isCurrentUser: false,
        },
        {
            id: 4,
            sender: 'Me',
            message: 'Thích thế đấy',
            time: '11:46 AM',
            isCurrentUser: true,
        },
    ];

    const handleSendMessage = (e) => {
        e.preventDefault();
        // In a real app, this would send a message to the backend
        if (message.trim() !== '') {
            console.log('Sending message:', message);
            setMessage('');
        }
    };

    return (
        <div className="chatbox-container">
            {/* Left Sidebar */}
            <div className="chatbox-sidebar">
                <h2 className="chatbox-sidebar-header">Chat History</h2>
                
                {/* Channels Section */}
                <div className="sidebar-section">
                    <div className="chatbox-section-header">
                        <h3>Channel</h3>
                        <BiChevronDown />
                    </div>
                    
                    <ul className="channel-list">
                        {channels.map(channel => (
                            <li key={channel.id} className={`channel-item ${channel.active ? 'active' : ''}`}>
                                <HiOutlineUserGroup className="channel-icon" />
                                <span className="channel-name">{channel.name}</span>
                                {channel.id === 1 && <BsThreeDotsVertical className="channel-actions" />}
                            </li>
                        ))}
                    </ul>
                    
                    <button className="add-new-button">
                        <BiPlus />
                        <span>Add New Channel</span>
                    </button>
                </div>
                
                {/* Direct Messages Section */}
                <div className="sidebar-section">
                    <div className="chatbox-section-header">
                        <h3>Direct Messages</h3>
                        <BiChevronDown />
                    </div>
                    
                    <ul className="dm-list">
                        {directMessages.map(dm => (
                            <li key={dm.id} className={`dm-item ${dm.active ? 'active' : ''}`}>
                                <FaUserCircle className="dm-icon" />
                                <span className="dm-name">{dm.name}</span>
                            </li>
                        ))}
                    </ul>
                    
                    <button className="add-new-button">
                        <BiPlus />
                        <span>Add New Chat</span>
                    </button>
                </div>
            </div>
            
            {/* Chat Area */}
            <div className="chat-area">
                {/* Chat Header */}
                <div className="chat-header">
                    <div className="chat-header-left">
                        <HiOutlineUserGroup className="chat-header-icon" />
                        <h2 className="chat-header-title">Group 1</h2>
                    </div>
                    <div className="chat-header-right">
                        <BsThreeDotsVertical className="chat-header-actions" />
                    </div>
                </div>
                
                {/* Chat Messages */}
                <div className="chat-messages">
                    <div className="message-date-divider">Today, 24 April</div>
                    
                    {chatMessages.map(msg => (
                        <div key={msg.id} className={`message-container ${msg.isCurrentUser ? 'current-user' : ''}`}>
                            {!msg.isCurrentUser && (
                                <div className="message-avatar">
                                    <FaUserCircle size={32} color="#e74c3c" />
                                </div>
                            )}
                            {msg.isCurrentUser && (
                                <div className="message-avatar">
                                    <FaUserCircle size={32} color="#3498db" />
                                </div>
                            )}
                            <div className={`message-bubble ${msg.isCurrentUser ? 'current-user' : ''}`}>
                                <div className="message-content">{msg.message}</div>
                                <div className="message-time">{msg.time}</div>
                            </div>
                            
                        </div>
                    ))}
                </div>
                
                {/* Message Input */}
                <form className="message-input-container" onSubmit={handleSendMessage}>
                    <button type="button" className="attach-button">
                        <BiPlus />
                    </button>
                    <button type="button" className="emoji-button">
                        <FiPaperclip />
                    </button>
                    <input
                        type="text"
                        className="message-input"
                        placeholder="Aa"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button type="submit" className="send-button">
                        <FiSend />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatboxPage;
