import React, { useState, useRef, useEffect } from 'react';
import '../../assets/css/teacher-group-detail.css';
import logo from '../../logo.svg';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { X, Download, FileText, Video, Image } from 'lucide-react';
// Thêm thư viện cần thiết để xử lý các loại file đặc biệt
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';

const TeacherGroupDetail = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const editorRef = useRef(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isActive, setisActive] = useState('wall');
    const [selectedGroup, setSelectedGroup] = useState({});
    const [comments, setComments] = useState('');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [announcementText, setAnnouncementText] = useState('');
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        list: false
    });
    const [posts, setPosts] = useState([]);
    const [postLoading, setPostLoading] = useState(false);
    const [postError, setPostError] = useState(null);
    const [pagination, setPagination] = useState({
        pageNumber: 0,
        pageSize: 10,
        totalPages: 0,
        totalElements: 0
    });
    
    // Thêm state để quản lý modal xem trước file
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewContent, setPreviewContent] = useState(null);
    const [previewType, setPreviewType] = useState(null);
    
    // Fetch group data
    useEffect(() => {
        const fetchGroup = () => {
            try {
                const groupData = localStorage.getItem(`group_${id}`);
                if (groupData) {
                    setSelectedGroup(JSON.parse(groupData));
                }
            } catch (error) {
                console.error('Error fetching group data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGroup();
    }, [id]);

    // Fetch posts for this group
    const fetchPosts = async () => {
        setPostLoading(true);
        setPostError(null);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Tạo URLSearchParams để gửi tham số GET
            const params = new URLSearchParams();
            params.append('groupId', id);
            params.append('pageNumber', pagination.pageNumber.toString());
            params.append('pageSize', pagination.pageSize.toString());
            
            // Gọi API với phương thức GET và params
            const response = await axios.get(
                `http://localhost:8080/lms/post?${params.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            // Kiểm tra kết quả trả về
            if (response.data && response.data.code === 0) {
                const responseData = response.data.result;
                
                // Nếu kết quả trả về là dạng phân trang
                if (responseData.content) {
                    setPosts(responseData.content);
                    
                    // Cập nhật thông tin phân trang
                    setPagination({
                        ...pagination,
                        totalPages: responseData.totalPages,
                        totalElements: responseData.totalElements
                    });
                } else {
                    // Nếu kết quả trả về là mảng thông thường
                    setPosts(responseData);
                }
            } else {
                throw new Error(response.data?.message || 'Failed to fetch posts');
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
            setPostError('Không thể tải danh sách bài đăng. Vui lòng thử lại sau.');
        } finally {
            setPostLoading(false);
        }
    };
    
    useEffect(() => {
        if (id && isActive === 'wall') {
            fetchPosts();
        }
    }, [id, pagination.pageNumber, pagination.pageSize, isActive]);

    // Back to groups list
    const backToGroupsList = () => {
        navigate('/teacher/groups');
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
    const submitAnnouncement = async () => {
        if (announcementText.trim()) {
            try {
                const token = localStorage.getItem('authToken');
                
                // Tạo dữ liệu cho bài đăng mới
                const postData = {
                    groupId: id,
                    text: announcementText
                };
                
                // Gửi yêu cầu POST đến API
                const response = await axios.post(
                    'http://localhost:8080/lms/post/create',
                    postData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                if (response.data && response.data.code === 0) {
                    // Refresh danh sách bài đăng
                    fetchPosts();
                    // Đóng editor
                    closeEditor();
                } else {
                    console.error('Error creating post:', response.data?.message);
                }
            } catch (error) {
                console.error('Error creating post:', error);
            }
        }
    };

    // Hàm để tạo đường dẫn đầy đủ cho file
    const getFullFilePath = (path) => {
        if (!path) return '';
        // Kiểm tra xem path đã có tiền tố http:// hoặc https:// chưa
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        // Thêm tiền tố server nếu path chỉ là đường dẫn tương đối
        return `http://localhost:8080${path.startsWith('/') ? '' : '/'}${path}`;
    };

    // Hàm để lấy tên file từ đường dẫn
    const getFileNameFromPath = (path) => {
        if (!path) return 'Tệp đính kèm';
        const parts = path.split('/');
        return parts[parts.length - 1];
    };

    // Hàm để lấy phần mở rộng của file từ đường dẫn
    const getFileExtension = (filename) => {
        if (!filename) return '';
        return filename.split('.').pop().toLowerCase();
    };

    // Hàm để xác định kiểu MIME dựa trên phần mở rộng
    const getMimeType = (extension) => {
        switch (extension.toLowerCase()) {
            case 'pdf':
                return 'application/pdf';
            case 'doc':
                return 'application/msword';
            case 'docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            case 'xls':
                return 'application/vnd.ms-excel';
            case 'xlsx':
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            case 'txt':
                return 'text/plain';
            case 'png':
                return 'image/png';
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'mp4':
                return 'video/mp4';
            case 'avi':
                return 'video/x-msvideo';
            case 'mov':
                return 'video/quicktime';
            default:
                return 'application/octet-stream';
        }
    };

    // Hàm để xác định loại file
    const getFileType = (path) => {
        if (!path) return 'unknown';
        const extension = getFileExtension(path);
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'];
        const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];

        if (imageExtensions.includes(extension)) return 'image';
        if (videoExtensions.includes(extension)) return 'video';
        if (documentExtensions.includes(extension)) return 'document';
        return 'unknown';
    };

    // Hàm để mở modal xem trước file
    const openPreviewModal = async (path) => {
        if (!path) return;
        
        setPreviewFile(path);
        setPreviewModalOpen(true);
        setPreviewLoading(true);
        setPreviewContent(null);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('Bạn cần đăng nhập để xem file');
                return;
            }
            
            const fullPath = getFullFilePath(path);
            const extension = getFileExtension(path);
            setPreviewType(extension);
            
            const response = await axios.get(fullPath, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            });
            
            const blob = response.data;
            
            // Xử lý theo loại file
            switch (extension) {
                case 'txt':
                    const text = await blob.text();
                    setPreviewContent(text);
                    break;
                    
                case 'docx':
                    try {
                        const container = document.createElement('div');
                        await renderAsync(blob, container);
                        setPreviewContent(container.innerHTML);
                    } catch (error) {
                        console.error('Error rendering docx:', error);
                        setPreviewContent(null);
                    }
                    break;
                    
                case 'xlsx':
                case 'xls':
                    try {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            try {
                                const data = new Uint8Array(e.target.result);
                                const workbook = XLSX.read(data, { type: 'array' });
                                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                                const htmlTable = XLSX.utils.sheet_to_html(firstSheet);
                                setPreviewContent(htmlTable);
                                setPreviewLoading(false);
                            } catch (error) {
                                console.error('Error processing Excel data:', error);
                                setPreviewContent(null);
                                setPreviewLoading(false);
                            }
                        };
                        reader.onerror = () => {
                            console.error('Error reading Excel file');
                            setPreviewContent(null);
                            setPreviewLoading(false);
                        };
                        reader.readAsArrayBuffer(blob);
                        // Không đặt loading = false ở đây vì đang xử lý bất đồng bộ
                        return;
                    } catch (error) {
                        console.error('Error with Excel file:', error);
                        setPreviewContent(null);
                    }
                    break;
                    
                case 'pdf':
                    const url = URL.createObjectURL(blob);
                    setPreviewContent(url);
                    break;
                    
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                case 'bmp':
                case 'webp':
                    const imageUrl = URL.createObjectURL(blob);
                    setPreviewContent(imageUrl);
                    break;
                    
                case 'mp4':
                case 'webm':
                case 'ogg':
                    const videoUrl = URL.createObjectURL(blob);
                    setPreviewContent(videoUrl);
                    break;
                    
                default:
                    // Các loại file không được hỗ trợ xem trước
                    setPreviewContent(null);
                    break;
            }
        } catch (error) {
            console.error('Error previewing file:', error);
            setPreviewContent(null);
        } finally {
            // Với các loại file như Excel, setting loading sẽ được xử lý bởi callback
            if (getFileExtension(path) !== 'xlsx' && getFileExtension(path) !== 'xls') {
                setPreviewLoading(false);
            }
        }
    };

    // Hàm để đóng modal xem trước
    const closePreviewModal = () => {
        setPreviewModalOpen(false);
        // Nếu có URL blob, giải phóng nó
        if (previewContent && (previewType === 'pdf' || getFileType(previewFile) === 'image' || getFileType(previewFile) === 'video')) {
            URL.revokeObjectURL(previewContent);
        }
        setPreviewContent(null);
        setPreviewFile(null);
    };

    // Hàm để tải file với Bearer token
    const downloadFile = async (path) => {
        if (!path) return;
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('Bạn cần đăng nhập để tải file');
                return;
            }
            
            const fullPath = getFullFilePath(path);
            const extension = getFileExtension(path);
            const mimeType = getMimeType(extension);
            
            // Sử dụng axios để gửi yêu cầu GET với token xác thực
            const response = await axios.get(fullPath, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            });
            
            // Tạo blob với MIME type phù hợp
            const blob = new Blob([response.data], { type: mimeType });
            
            // Tạo URL tạm thời cho blob
            const url = window.URL.createObjectURL(blob);
            
            // Tạo một thẻ a ẩn và kích hoạt sự kiện click để tải xuống
            const link = document.createElement('a');
            link.href = url;
            // Lấy tên file từ đường dẫn
            link.setAttribute('download', getFileNameFromPath(path));
            document.body.appendChild(link);
            link.click();
            
            // Dọn dẹp
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);
            }, 100);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Lỗi khi tải file. Vui lòng thử lại sau.');
        }
    };

    // Xử lý up ảnh
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const token = localStorage.getItem('authToken');
                const formData = new FormData();
                formData.append('file', file);
                formData.append('groupId', id);
                
                const response = await axios.post(
                    'http://localhost:8080/lms/post/upload',
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                
                if (response.data && response.data.code === 0) {
                    // Thêm link của file vào nội dung
                    const fileLink = response.data.result.path;
                    if (editorRef.current) {
                        // Thêm link của file vào editor với đường dẫn đầy đủ
                        const fileName = file.name;
                        const fullPath = getFullFilePath(fileLink);
                        // Thay đổi ở đây - tạo HTML download kích hoạt JavaScript function
                        const linkText = `<span class="editor-file-link" onclick="window.downloadAttachment('${fileLink}')">${fileName}</span>`;
                        document.execCommand('insertHTML', false, linkText);
                    }
                } else {
                    console.error('Error uploading file:', response.data?.message);
                }
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
    };

    // Hàm format thời gian
    const formatDateTime = (dateTimeStr) => {
        try {
            const date = new Date(dateTimeStr);
            return date.toLocaleString('vi-VN', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateTimeStr;
        }
    };

    // Xử lý khi thay đổi trang
    const handlePageChange = (newPage) => {
        setPagination({
            ...pagination,
            pageNumber: newPage
        });
    };

    // Khi component mount, thêm hàm download global để có thể gọi từ HTML
    useEffect(() => {
        // Expose the download function to window so it can be called from HTML content
        window.downloadAttachment = (path) => {
            downloadFile(path);
        };
        
        // Cleanup function
        return () => {
            delete window.downloadAttachment;
        };
    }, []);

    // Render tab content based on active tab
    const renderTabContent = () => {
        switch(isActive) {
            case 'wall':
                return (
                <div className="wall-content">
                    <div className="class-info">
                        <div className="class-code">
                            <div className="label">Mã Nhóm</div>
                            <div className="value">{selectedGroup.id}</div>
                        </div>
                        <div className="upcoming-deadline">
                            <div className="label">Thông tin nhóm</div>
                            <div className="value">{selectedGroup.description || 'Chưa có mô tả'}</div>
                            <a className="view-all" onClick={() => handleTabChange('people')}>Xem thành viên</a>
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
                        
                        {/* Loading và Error */}
                        {postLoading && (
                            <div className="post-loading">
                                <div className="post-loading-spinner"></div>
                                <p>Đang tải bài đăng...</p>
                            </div>
                        )}
                        
                        {postError && (
                            <div className="post-error">
                                <p>{postError}</p>
                                <button onClick={fetchPosts}>Thử lại</button>
                            </div>
                        )}
                        
                        {/* Danh sách bài đăng */}
                        {!postLoading && !postError && (
                            <>
                                {posts.length > 0 ? (
                                    <>
                                        {posts.map((post) => (
                                            <div key={post.id} className="announcement_item">
                                <div className="announcement-author">
                                                    <img 
                                                        src={post.creator?.avatar || logo} 
                                                        alt="Avatar" 
                                                        className="group-author-avatar" 
                                                    />
                                    <div className="author-info">
                                                        <div className="author-name">
                                                            {post.creator?.fullName || 'Giáo viên'}
                                                        </div>
                                                        <div className="announcement-time">
                                                            {formatDateTime(post.createdAt)}
                                                        </div>
                                    </div>
                                    <button className="more-options">⋮</button>
                                </div>

                                                <div className="announcement_content" dangerouslySetInnerHTML={{ __html: post.text }}></div>
                                                
                                                {post.path && (
                                                    <div className="announcement_attachment">
                                                        <button 
                                                            onClick={() => openPreviewModal(post.path)}
                                                            className="tgd-file-attachment-button"
                                                        >
                                                            <div className="tgd-file-icon">
                                                                {getFileType(post.path) === 'image' ? <Image size={18} /> : 
                                                                 getFileType(post.path) === 'video' ? <Video size={18} /> : 
                                                                 <FileText size={18} />}
                                                            </div>
                                                            <div className="tgd-file-info">
                                                                <div className="tgd-file-name">{getFileNameFromPath(post.path)}</div>
                                                                <div className="tgd-file-action">Nhấn để xem trước</div>
                                                            </div>
                                                        </button>
                                                    </div>
                                                )}
                                
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
                                        
                                        {/* Phân trang */}
                                        {pagination.totalPages > 1 && (
                                            <div className="posts-pagination">
                                                <button 
                                                    disabled={pagination.pageNumber === 0}
                                                    onClick={() => handlePageChange(pagination.pageNumber - 1)}
                                                >
                                                    Trước
                                                </button>
                                                <span>
                                                    Trang {pagination.pageNumber + 1} / {pagination.totalPages}
                                                </span>
                                                <button 
                                                    disabled={pagination.pageNumber >= pagination.totalPages - 1}
                                                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                                                >
                                                    Sau
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="no-posts">
                                        <p>Chưa có bài đăng nào trong nhóm này</p>
                                    </div>
                                )}
                            </>
                        )}
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
                                        <img src={selectedGroup.teacher?.avatar || logo} alt="Avatar" />
                                    </div>
                                    <div className="person-name">
                                        {selectedGroup.teacher?.fullName || 'Giáo viên'}
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
                                    {selectedGroup.students && selectedGroup.students.length > 0 ? (
                                        selectedGroup.students.map((student, index) => (
                                            <div className="person-item" key={student.id || index}>
                                        <div className="person-avatar">
                                                    <img src={student.avatar || logo} alt="Avatar" />
                                        </div>
                                        <div className="person-name">
                                                    {student.fullName || `Học sinh ${index + 1}`}
                                        </div>
                                    </div>
                                        ))
                                    ) : (
                                        <div className="no-students">
                                            <p>Chưa có học sinh nào trong nhóm này</p>
                                        </div>
                                    )}
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

    // Component Modal xem trước file
    const FilePreviewModal = () => {
        if (!previewModalOpen) return null;
        
        const renderPreviewContent = () => {
            if (previewLoading) {
                return (
                    <div className="tgd-preview-loading">
                        <div className="tgd-preview-loading-spinner"></div>
                        <p>Đang tải nội dung...</p>
                    </div>
                );
            }
            
            if (!previewContent) {
                return (
                    <div className="tgd-preview-not-available">
                        <FileText size={48} />
                        <p>Không thể xem trước nội dung file này</p>
                        <p>Vui lòng tải xuống để xem</p>
                    </div>
                );
            }
            
            // Xác định cách hiển thị dựa trên loại file
            switch (previewType) {
                case 'txt':
                    return (
                        <div className="tgd-text-preview">
                            <pre>{previewContent}</pre>
                        </div>
                    );
                    
                case 'docx':
                    return (
                        <div 
                            className="tgd-docx-preview"
                            dangerouslySetInnerHTML={{ __html: previewContent }}
                        />
                    );
                    
                case 'xlsx':
                case 'xls':
                    return (
                        <div 
                            className="tgd-excel-preview"
                            dangerouslySetInnerHTML={{ __html: previewContent }}
                        />
                    );
                    
                case 'pdf':
                    return (
                        <div className="tgd-pdf-preview">
                            <iframe
                                src={previewContent}
                                title="PDF Viewer"
                                width="100%"
                                height="100%"
                            />
                        </div>
                    );
                    
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                case 'bmp':
                case 'webp':
                    return (
                        <div className="tgd-image-preview">
                            <img src={previewContent} alt="Preview" />
                        </div>
                    );
                    
                case 'mp4':
                case 'webm':
                case 'ogg':
                    return (
                        <div className="tgd-video-preview">
                            <video controls>
                                <source src={previewContent} type={getMimeType(previewType)} />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    );
                    
                default:
                    return (
                        <div className="tgd-preview-not-available">
                            <FileText size={48} />
                            <p>Định dạng file không được hỗ trợ xem trước</p>
                            <p>Vui lòng tải xuống để xem</p>
                        </div>
                    );
            }
        };
        
        return (
            <div className="tgd-file-preview-modal-overlay">
                <div className="tgd-file-preview-modal">
                    <div className="tgd-file-preview-modal-header">
                        <h3>Xem trước: {getFileNameFromPath(previewFile)}</h3>
                        <div className="tgd-file-preview-modal-actions">
                            <button 
                                className="tgd-file-download-button"
                                onClick={() => downloadFile(previewFile)}
                            >
                                <Download size={18} />
                                <span>Tải xuống</span>
                            </button>
                            <button 
                                className="tgd-file-close-button"
                                onClick={closePreviewModal}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="tgd-file-preview-modal-content">
                        {renderPreviewContent()}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className='content-container'>
            <div className='course-detail-section'> 
                <div className='group-detail-header'> 
                    <div className='back-nav'> 
                        <button onClick={backToGroupsList} className="back_button">Lớp Học</button>  
                        &gt; 
                        <span style={{ marginLeft: '16px' , color: '#000'}}>{selectedGroup.name}</span>
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
            
            {/* Modal Xem trước file */}
            <FilePreviewModal />
        </div>
    );
}

export default TeacherGroupDetail;