import React, { useEffect, useRef, useState } from 'react';
import logo from '../../logo.svg';
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

    useEffect(() => {
        if (lessonId && commentsData[lessonId]) {
            setComments(commentsData[lessonId]);
        } else {
            setComments([]);
        }
    }, [lessonId]);

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
                            <button className="cancel-button" onClick={closeEditor}>HỦY</button>
                            <button className="post-button" onClick={submitComment}>BÌNH LUẬN</button>
                        </div>
                    </div>
                ) : (
                    <div 
                        className='d-flex open-editor'
                        onClick={openEditor}
                    > 
                        <img src={logo} alt="Avatar" className="author-avatar" />
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
                            <div className="avatar-circle">{comment.name[0]}</div>
                            <div className="comment-content">
                                <div className="comment-header">
                                    <span className="username">{comment.name}</span>
                                    <span className="time">{comment.time}</span>
                                </div>
                                <div
                                    className="comment-text"
                                    dangerouslySetInnerHTML={{ __html: comment.text }}
                                ></div>
                                <div className="comment-actions">
                                    <span onClick={() => openReplyEditor(comment.id)}>Phản hồi</span>
                                </div>
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
                                            <button className="cancel-button" onClick={closeReply}>HỦY</button>
                                            <button className="post-button" onClick={submitReply}>BÌNH LUẬN</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Phần hiển thị các phản hồi cho comment này */}
                        {comment.replies?.map((reply) => (
                            <div key={reply.id} className="comment reply">
                                <div className="avatar-circle">{reply.name[0]}</div>
                                <div className="comment-content">
                                    <div className="comment-header">
                                        <span className="username">{reply.name}</span>
                                        <span className="time">{reply.time}</span>
                                    </div>
                                    <div
                                        className="comment-text"
                                        dangerouslySetInnerHTML={{ __html: reply.text }}
                                    ></div>
                                    <div className="comment-actions">
                                        <span onClick={() => openReplyEditor(comment.id)}>Phản hồi</span>
                                    </div>
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