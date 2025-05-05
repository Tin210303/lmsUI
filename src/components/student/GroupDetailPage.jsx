import React, { useState, useRef, useEffect } from 'react';
import '../../assets/css/group-detail.css';
import logo from '../../logo.svg';
import { useParams, useNavigate } from 'react-router-dom';

// Sample announcements data
const announcements = [
{
    id: 1,
    author: 'Tín Nguyễn',
    time: '09:12',
    content: 'Tin đẹp trai vãi chưởng',
    formattedContent: '<strong>A</strong>',
    avatar: '/api/placeholder/40/40'
},
{
    id: 2,
    author: 'Tín Nguyễn',
    time: '09:12',
    content: 'Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng Tin đẹp trai vãi chưởngTin đẹp trai vãi chưởng Tin đẹp trai vãi chưởng',
    formattedContent: '<strong>A</strong>',
    avatar: '/api/placeholder/40/40'
}
];

function GroupDetailPage() {
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const editorRef = useRef(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isActive, setisActive] = useState('wall');
    const [selectedCourse, setSelectedCourse] = useState({});
    const [comments, setComments] = useState('');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [announcementText, setAnnouncementText] = useState('');
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        list: false
    });
    console.log('Current ID:', id);
    useEffect(() => {
        // Fetch group data from localStorage (in a real app, you would fetch from API)
        const fetchGroup = () => {
            try {
                console.log('Current ID:', id);
                const groupData = localStorage.getItem(`group_${id}`);
                console.log('check group dâta',groupData);
                
                if (groupData) {
                    setSelectedCourse(JSON.parse(groupData));
                }
            } catch (error) {
                console.error('Error fetching group data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGroup();
    }, [id]);


    // Back to courses list
    const backToCousesList = () => {
        setSelectedCourse(null);
    }

    // Handle change tabs
    const handleTabChange = (tab) => {
        setisActive(tab);
    }

    // Handle comment change
    const handleCommentChange = (e) => {
        setComments(e.target.value);
    }

    // Handle comment submit
    const handleCommentSubmit = (e) => {
        if (e.key === 'Enter') {
        // Here you would usually send the comment to a server
        setComments('');
        }
    }

    // Function to handle opening the editor
    const openEditor = () => {
        setIsEditorOpen(true);
        // Reset all active formats when opening the editor
        setActiveFormats({
        bold: false,
        italic: false,
        underline: false,
        list: false
        });
        
        // Focus on the editor after it renders
        setTimeout(() => {
        if (editorRef.current) {
            editorRef.current.focus();
        }
        }, 0);
    };

    // Function to handle closing the editor
    const closeEditor = () => {
        setIsEditorOpen(false);
        setAnnouncementText('');
    };

    // Function to handle text changes in the contenteditable div
    const handleEditorChange = () => {
        if (editorRef.current) {
        setAnnouncementText(editorRef.current.innerHTML);
        }
    };

    // Function for handling formatting with toggle functionality
    const toggleFormatting = (command, format) => {
        document.execCommand(command, false, null);
        
        // Toggle the active state
        setActiveFormats({
        ...activeFormats,
        [format]: document.queryCommandState(command)
        });
        
        // Focus back on the editor
        if (editorRef.current) {
        editorRef.current.focus();
        }
    };

    // Function to check the current formatting state
    const checkFormatting = () => {
        setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        list: document.queryCommandState('insertUnorderedList')
        });
    };

    // Function to handle announcement submission
    const submitAnnouncement = () => {
        if (announcementText.trim()) {
        // Create a new announcement
        const newAnnouncement = {
            id: Date.now(),
            author: 'Giáo viên',
            time: new Date().toLocaleString('vi-VN'),
            content: announcementText
        };
        
        // Add to announcements array
        announcements.push(newAnnouncement)
        
        closeEditor();
        }
    };

    // xử lý up ảnh
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
        // Xử lý tệp đã chọn
        console.log('Tệp đã chọn:', file);
        }
    };


    // Render tab content based on active tab
    const renderTabContent = () => {
        switch(isActive) {
            case 'wall':
                return (
                <div className="wall-content">
                    <div className="class-info">
                        <div className="class-code">
                            <div className="label">Mã Lớp</div>
                            <div className="value">Tin221436</div>
                        </div>
                        <div className="upcoming-deadline">
                            <div className="label">Sắp đến hạn</div>
                            <div className="value">Không có bài tập nào sắp đến hạn</div>
                            <a className="view-all" onClick={() => handleTabChange('tasks')}>Xem tất cả</a>
                        </div>
                    </div>
                    
                    <div className="class-announcement">
                        <div className="announcement_header">
                            {isEditorOpen ? (
                                <div className="announcement-editor">
                                    <div className="editor-recipient">Dành cho: Tất cả học viên</div>
                                    <div
                                        className={`editor ${isInputFocused ? 'active' : ''}`} 
                                        onFocus={() => setIsInputFocused(true)}
                                        onBlur={() => setIsInputFocused(editorRef.current.textContent !== '')}
                                    >
                                        <div 
                                            ref={editorRef}
                                            className="editor-content" 
                                            contentEditable="true"
                                            placeholder="Thông báo nội dung cho lớp học của bạn"
                                            onInput={handleEditorChange}
                                            onSelect={checkFormatting}
                                            onMouseUp={checkFormatting}
                                            onKeyUp={checkFormatting}
                                        ></div>
                                        
                                        <div className="editor-toolbar">
                                            <button 
                                                className={`toolbar-button bold ${activeFormats.bold ? 'active' : ''}`}
                                                title="In đậm"
                                                onClick={() => toggleFormatting('bold', 'bold')}
                                            >
                                                B
                                            </button>
                                            <button 
                                                className={`toolbar-button italic ${activeFormats.italic ? 'active' : ''}`}
                                                title="In nghiêng"
                                                onClick={() => toggleFormatting('italic', 'italic')}
                                            >
                                                I
                                            </button>
                                            <button 
                                                className={`toolbar-button underline ${activeFormats.underline ? 'active' : ''}`}
                                                title="Gạch chân"
                                                onClick={() => toggleFormatting('underline', 'underline')}
                                            >
                                                U
                                            </button>
                                            <button 
                                                className={`toolbar-button list ${activeFormats.list ? 'active' : ''}`}
                                                title="Danh sách"
                                                onClick={() => toggleFormatting('insertUnorderedList', 'list')}
                                            >
                                                ☰
                                            </button>
                                            {/* Nút tải tệp */}
                                            <button
                                                className="toolbar-button upload-file"
                                                title="Tải lên tệp"
                                                onClick={() => document.getElementById('file-input').click()}
                                            >
                                                📎
                                            </button>
                                            <input
                                                id="file-input"
                                                type="file"
                                                style={{ display: 'none' }}
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="editor-actions">
                                        <button className="cancel-button" onClick={closeEditor}>Hủy</button>
                                        <button className="post-button" onClick={submitAnnouncement}>Đăng</button>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    className='d-flex open-editor'
                                    onClick={openEditor}
                                > 
                                    <img src={logo} alt="Avatar" className="group-author-avatar" />
                                    <input 
                                        type="text" 
                                        className="announcement_header-input" 
                                        placeholder="Thông báo nội dung cho lớp học phần"
                                    />
                                </div>
                            )}
                        </div>
                        
                        {announcements.map((announcement) => (
                            <div key={announcement.id} className="announcement_item">
                                <div className="announcement-author">
                                    <img src={logo} alt="Avatar" className="group-author-avatar" />
                                    <div className="author-info">
                                        <div className="author-name">{announcement.author}</div>
                                        <div className="announcement-time">{announcement.time}</div>
                                    </div>
                                    <button className="more-options">⋮</button>
                                </div>

                                <div className="announcement_content" dangerouslySetInnerHTML={{ __html: announcement.content }}></div>
                                
                                <div className="group-comment-section">
                                    <img src={logo} alt="Avatar" className="comment-avatar" />
                                    <input
                                        type="text"
                                        className="group-comment-input"
                                        placeholder="Thêm nhận xét trong lớp học..."
                                        value={comments}
                                        onChange={handleCommentChange}
                                        onKeyPress={handleCommentSubmit}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                );
            case 'tasks':
                return (
                    <div className="tasks-content">
                        <div className="tasks-list">
                            <div className="task-item">
                                <div className="task-icon">
                                    <i className="fa-solid fa-clipboard task-icon-img"></i>
                                </div>
                                <div className="task-details">
                                    <div className="task-title">Kiểm tra giữa kì</div>
                                    <div className="task-deadline">Đến hạn 21 thg 3</div>
                                </div>
                                <div className="task-actions">
                                    <button className="task-more-options">⋮</button>
                                </div>
                            </div>
                    
                            <div className="task-item">
                                <div className="task-icon">
                                    <i className="fa-solid fa-clipboard task-icon-img"></i>
                                </div>
                                <div className="task-details">
                                    <div className="task-title">Kiểm tra 15p</div>
                                    <div className="task-deadline">Không có ngày đến hạn</div>
                                </div>
                                <div className="task-actions">
                                    <button className="task-more-options">⋮</button>
                                </div>
                            </div>
                    
                            <div className="task-item">
                                <div className="task-icon">
                                    <i className="fa-solid fa-clipboard task-icon-img"></i>
                                </div>
                                <div className="task-details">
                                    <div className="task-title">Kiểm tra cuối kì</div>
                                    <div className="task-deadline">Đến hạn 21 thg 5</div>
                                </div>
                                <div className="task-actions">
                                    <button className="task-more-options">⋮</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'people':
                return (
                    <div className="people-content">
                        <div className="people-section" style={{marginBottom: '12px'}}>
                            <div className="group-section-header">
                                <h3>Giáo Viên</h3>
                                <button className="add-person-button">
                                    <span>+</span>
                                </button>
                            </div>
                            <div className="people-list teacher-list">
                                <div className="teacher-item">
                                    <div className="person-avatar">
                                        <img src={logo} alt="Avatar" />
                                    </div>
                                    <div className="person-name">
                                        Tín Nguyễn
                                    </div>
                                </div>
                            </div>
                        </div>
                
                        <div className="people-section">
                            <div className="group-section-header">
                                <h3>Sinh Viên</h3>
                                <button className="add-person-button">
                                    <span>+</span>
                                </button>
                            </div>
                            <div className="people-list-container">
                                <div className="people-list student-list">
                                    <div className="person-item">
                                        <div className="person-avatar">
                                            <img src={logo} alt="Avatar" />
                                        </div>
                                        <div className="person-name">
                                            Tiến Lê Văn
                                        </div>
                                    </div>
                                    <div className="person-item">
                                        <div className="person-avatar">
                                            <img src={logo} alt="Avatar" />
                                        </div>
                                        <div className="person-name">
                                            Tân Ngô
                                        </div>
                                    </div>
                                    <div className="person-item">
                                        <div className="person-avatar">
                                            <img src={logo} alt="Avatar" />
                                        </div>
                                        <div className="person-name">
                                            Tiến Nguyễn Đình
                                        </div>
                                    </div>
                                    <div className="person-item">
                                        <div className="person-avatar">
                                            <img src={logo} alt="Avatar" />
                                        </div>
                                        <div className="person-name">
                                            Thành Nguyễn Hoàng Quang Minh
                                        </div>
                                    </div>
                                    <div className="person-item">
                                        <div className="person-avatar">
                                            <img src={logo} alt="Avatar" />
                                        </div>
                                        <div className="person-name">
                                            Quang Trần Đại
                                        </div>
                                    </div>
                                    {/* Additional students to demonstrate scrolling */}
                                    <div className="person-item">
                                        <div className="person-avatar">
                                            <img src={logo} alt="Avatar" />
                                        </div>
                                        <div className="person-name">
                                            Huy Phan Quốc
                                        </div>
                                    </div>
                                    <div className="person-item">
                                        <div className="person-avatar">
                                            <img src={logo} alt="Avatar" />
                                        </div>
                                        <div className="person-name">
                                            Nhật Võ Minh
                                        </div>
                                    </div>
                                    <div className="person-item">
                                        <div className="person-avatar">
                                            <img src={logo} alt="Avatar" />
                                        </div>
                                        <div className="person-name">
                                            Dũng Trần Văn
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'marks':
                return <div className="marks-content">Nội dung Điểm</div>;
            default:
                return null;
        }
    };

    return (
        <div className='content-container'>
            <div className='course-detail-section'> 
                <div className='group-detail-header'> 
                    <div className='back-nav'> 
                        <button onClick={backToCousesList} className="back_button">Lớp Học</button>  
                        &gt; 
                        <span style={{ marginLeft: '16px' , color: '#000'}}>{selectedCourse.name}</span>
                    </div>
                </div>
                <div className='course-tabs'> 
                    <button
                        className={isActive === 'wall' ? 'tab-active' : ''}
                        onClick={() => handleTabChange('wall')}
                        >
                        Bảng Tin
                    </button>
                    <button
                        className={isActive === 'tasks' ? 'tab-active' : ''}
                        onClick={() => handleTabChange('tasks')}
                        >
                        Bài Tập Trên Lớp
                    </button>
                    <button
                        className={isActive === 'people' ? 'tab-active' : ''}
                        onClick={() => handleTabChange('people')}
                        >
                        Mọi Người
                    </button>
                    <button
                        className={isActive === 'marks' ? 'tab-active' : ''}
                        onClick={() => handleTabChange('marks')}
                        >
                        Điểm
                    </button>
                </div>
                
                <div className="group-course-content">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}

export default GroupDetailPage;


