import React, { useEffect, useRef, useState } from 'react';
import logo from '../../logo.svg';
import axios from 'axios';
import '../../assets/css/comment-section.css';

// Dữ liệu mẫu (sau này có thể gọi từ API)
const commentsData = {
    1: [
            {
                id: 1,
                name: 'nguyen hieu',
                time: '8 tháng trước',
                text: 'có bạn nào làm giống như a Sơn mà không chạy được không ạ :(',
                replies: [
                    {
                        id: 11,
                        name: 'phạm dũng',
                        time: '2 tháng trước',
                        text: '@nguyen hieu tôi console ra từng phần còn không chạy được cơ',
                    },
                ],
            },
            {
                id: 2,
                name: 'hoi luyen',
                time: '10 tháng trước',
                text: 'Làm sao để có được tư duy viết code như thế này nhỉ?...',
            },
    ],
    2: [
            {
                id: 3,
                name: 'Lưu Linh',
                time: '1 năm trước',
                text: 'các bài về Form Validate anh Sơn mong muốn viết source...',
            },
    ],
};

const CommentSection = ({ lessonId }) => {
    const [comments, setComments] = useState([]);
    const editorRef = useRef();
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [replyToId, setReplyToId] = useState(null);
    const [openReplyId, setOpenReplyId] = useState(null);
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        list: false
    });
    const [loading, setLoading] = useState(false);
    const [studentData, setStudentData] = useState({
            name: '',
            email: '',
            major: '',
            joinedDays: 0,
            avatar: null,
            id: null
        });
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (lessonId && commentsData[lessonId]) {
            setComments(commentsData[lessonId]);
        } else {
            setComments([]);
        }
    }, [lessonId]);

    useEffect(() => {
        const fetchStudentInfo = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                // Fetch student info
                const studentResponse = await axios.get('http://localhost:8080/lms/student/myinfo', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Check response
                if (studentResponse.data.code === 0 && studentResponse.data.result) {
                    const studentInfo = studentResponse.data.result;
                    // Calculate joined days (using a placeholder - you might want to adjust this)
                    const joinedDays = 3; // Placeholder

                    setStudentData({
                        name: studentInfo.fullName || '',
                        email: studentInfo.email || '',
                        major: studentInfo.major || 'Kỹ thuật phần mềm', // Default if not available
                        joinedDays: joinedDays,
                        avatar: studentInfo.avatar,
                        id: studentInfo.id
                    });

                    // Fetch avatar if available
                    if (studentInfo.avatar) {
                        fetchAvatar(studentInfo.avatar);
                    }
                }

            } catch (err) {
                console.error('Error fetching student data:', err);
                setError('Failed to load student information. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchStudentInfo();
    }, []);

    // Hàm gọi API để lấy ra ảnh đại diện của sinh viên
    const fetchAvatar = async (avatarPath) => {
        if (!avatarPath) return;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            // Fetch avatar with authorization header
            const response = await axios.get(`http://localhost:8080${avatarPath}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob' // Important: we want the image as a blob
            });

            // Create a URL for the blob data
            const imageUrl = URL.createObjectURL(response.data);
            setAvatarUrl(imageUrl);
        } catch (err) {
            console.error('Error fetching avatar:', err);
        }
    };

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
        setCommentText('');
    };

    // Function to handle text changes in the contenteditable div
    const handleEditorChange = () => {
        if (editorRef.current) {
            setCommentText(editorRef.current.innerHTML);
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

    // xử lý up ảnh
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
        // Xử lý tệp đã chọn
        console.log('Tệp đã chọn:', file);
        }
    };

    // Function to handle announcement submission
    const submitComment = () => {
        if (!commentText || commentText.trim() === '' || commentText === '<br>') {
            alert('Vui lòng nhập nội dung bình luận.');
            return;
        }
    
        const newEntry = {
            id: Date.now(),
            name: 'Người dùng',
            time: 'Vừa xong',
            text: commentText,
        };
    
        if (replyToId) {
            // Là phản hồi
            setComments((prevComments) =>
                prevComments.map((comment) =>
                    comment.id === replyToId
                        ? {
                              ...comment,
                              replies: [...(comment.replies || []), newEntry],
                          }
                        : comment
                )
            );
        } else {
            // Là bình luận mới
            setComments((prevComments) => [
                { ...newEntry, replies: [] },
                ...prevComments,
            ]);
        }
    
        setCommentText('');
        setReplyToId(null);
        if (editorRef.current) editorRef.current.innerHTML = '';
        closeEditor();
    };
    
    // Function to openReplyEditor
    const openReplyEditor = (commentId) => {
        setReplyToId(commentId);
        setOpenReplyId(commentId);
        
        // Reset nội dung và trạng thái định dạng
        setCommentText('');
        setActiveFormats({
            bold: false,
            italic: false,
            underline: false,
            list: false
        });
    };  

    // Function to closeReplyEditor
    const closeReply = () => {
        setOpenReplyId(null);
        setReplyToId(null);
        setCommentText('');
    };

    // Function to submitReply
    const submitReply = () => {
        if (!commentText || commentText.trim() === '' || commentText === '<br>') {
            alert('Vui lòng nhập nội dung phản hồi.');
            return;
        }

        const newReply = {
            id: Date.now(),
            name: 'Người dùng',
            time: 'Vừa xong',
            text: commentText,
        };

        // Cập nhật comments với phản hồi mới
        setComments((prevComments) =>
            prevComments.map((comment) => {
                if (comment.id === replyToId) {
                    return {
                        ...comment,
                        replies: [...(comment.replies || []), newReply],
                    };
                }
                return comment;
            })
        );

        // Đóng form phản hồi và reset
        closeReply();
    };

    return (
        <div className="comment-section">
            <h2>Hỏi đáp</h2>

            <div className="comment-input">
                {isEditorOpen ? (
                    <div className="announcement-editor">
                        <div
                            className={`editor ${isInputFocused ? 'active' : ''}`} 
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(editorRef.current.textContent !== '')}
                        >
                            <div 
                                ref={editorRef}
                                className="editor-content" 
                                contentEditable="true"
                                placeholder="Thêm bình luận mới của bạn"
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
                            <button className="comment-cancel-button" onClick={closeEditor}>HỦY</button>
                            <button className="comment-post-button" onClick={submitComment}>BÌNH LUẬN</button>
                        </div>
                    </div>
                ) : (
                    <div 
                        className='d-flex open-editor'
                        onClick={openEditor}
                    > 
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className='author-avatar'/>
                        ) : (
                            <svg className='avatar' width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="100" cy="100" r="100" fill="#ff4757" />
                                <path d="M100,40 C60,40 40,70 40,110 C40,150 60,180 100,180 C140,180 160,150 160,110 C160,70 140,40 100,40 Z" fill="#2f3542" />
                                <path d="M65,90 C65,80 75,70 85,70 C95,70 100,80 100,90 C100,80 105,70 115,70 C125,70 135,80 135,90 C135,100 125,110 115,110 C105,110 100,100 100,90 C100,100 95,110 85,110 C75,110 65,100 65,90 Z" fill="#f1f2f6" />
                                <path d="M70,75 C70,70 75,65 80,65 C85,65 90,70 90,75 C90,80 85,85 80,85 C75,85 70,80 70,75 Z" fill="#3742fa" />
                                <path d="M110,75 C110,70 115,65 120,65 C125,65 130,70 130,75 C130,80 125,85 120,85 C115,85 110,80 110,75 Z" fill="#3742fa" />
                                <path d="M65,120 C65,140 80,160 100,160 C120,160 135,140 135,120 C135,110 120,100 100,100 C80,100 65,110 65,120 Z" fill="#f1f2f6" />
                                <path d="M70,110 C80,120 90,125 100,125 C110,125 120,120 130,110 C120,105 110,100 100,100 C90,100 80,105 70,110 Z" fill="#2f3542" />
                            </svg>
                        )}
                        <input 
                            type="text" 
                            className="announcement_header-input" 
                            placeholder="Thêm bình luận mới của bạn"
                        />
                    </div>
                )}
            </div>

            <p className="comment-count">{comments.length} bình luận</p>

            <div className="comment-list">
                {comments.map((comment) => (
                    <div key={comment.id}>
                        <div className="comment">
                            <div className="comment-content">
                                <div className="comment-avatar-circle">{comment.name[0]}</div>
                                <div className="comment-header">
                                    <span className="username">{comment.name}</span>
                                    <span className="time">{comment.time}</span>
                                </div>
                            </div>
                            <div
                                className="comment-text"
                                dangerouslySetInnerHTML={{ __html: comment.text }}
                            ></div>
                            <div className="comment-actions">
                                <span onClick={() => openReplyEditor(comment.id)}>Phản hồi</span>
                            </div>
                        </div>

                        {/* Phần form phản hồi - chỉ hiển thị khi openReplyId === comment.id */}
                        {openReplyId === comment.id && (
                            <div className="reply-editor-container">
                                <div className="d-flex align-items-start">
                                    <img src={logo} alt="Avatar" className="author-avatar" />
                                    <div className="reply-content">
                                        <div className="reply-editor">
                                            <div 
                                                ref={editorRef}
                                                className="reply-editor-content" 
                                                contentEditable="true"
                                                placeholder="Phản hồi..."
                                                onInput={handleEditorChange}
                                                onSelect={checkFormatting}
                                                onMouseUp={checkFormatting}
                                                onKeyUp={checkFormatting}
                                            >
                                                <span className="mention">@{comment.name}</span>&nbsp;
                                            </div>
                                            
                                            <div className="reply-editor-toolbar">
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
                                            </div>
                                        </div>
                                        
                                        <div className="reply-actions">
                                            <button className="comment-cancel-button" onClick={closeReply}>HỦY</button>
                                            <button className="comment-post-button" onClick={submitReply}>BÌNH LUẬN</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Phần hiển thị các phản hồi cho comment này */}
                        {comment.replies?.map((reply) => (
                            <div key={reply.id} className="comment reply">
                                <div className="comment-content">
                                    <div className="comment-avatar-circle">{reply.name[0]}</div>
                                    <div className="comment-header">
                                        <span className="username">{reply.name}</span>
                                        <span className="time">{reply.time}</span>
                                    </div>
                                </div>
                                <div
                                    className="comment-text"
                                    dangerouslySetInnerHTML={{ __html: reply.text }}
                                ></div>
                                <div className="comment-actions">
                                    <span onClick={() => openReplyEditor(comment.id)}>Phản hồi</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
                <p className="view-more-comments">Xem thêm bình luận</p>
            </div>
        </div>
    );
};

export default CommentSection;