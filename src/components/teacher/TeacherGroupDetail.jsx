import React, { useState, useRef, useEffect } from 'react';
import '../../assets/css/teacher-group-detail.css';
import logo from '../../logo.svg';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Download, FileText, Video, Image, Upload, EllipsisVertical, UserPlus, NotepadText, Plus, Search, AlertCircle, HelpCircle, Trash2 } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { 
    API_BASE_URL, 
    GET_POST_GROUP, 
    ADD_POST_GROUP, 
    DELETE_POST_GROUP, 
    GET_STUDENTS_GROUP, 
    DELETE_STUDENT_GROUP,
    DELETE_MULTIPLE_STUDENTS_GROUP,
    GET_TESTS_IN_GROUP, 
    GET_STUDENT_TEST_RESULT, 
    UPDATE_POST_API,
    DELETE_TEST_API,
    GET_COMMENTS_BY_POST,
    GET_TEACHER_INFO,
    WS_BASE_URL,
    WS_POST_COMMENT_ENDPOINT,
    WS_POST_COMMENTS_TOPIC,
    GET_COMMENT_REPLIES
} from '../../services/apiService';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';
import Alert from '../common/Alert';

const TeacherGroupDetail = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const editorRef = useRef(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isActive, setisActive] = useState('wall');
    const [selectedGroup, setSelectedGroup] = useState({});
    const [commentText, setCommentText] = useState('');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [announcementText, setAnnouncementText] = useState('');
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        list: false
    });
    const [posts, setPosts] = useState([]);
    
    // WebSocket state
    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);
    
    // Teacher info state
    const [teacherInfo, setTeacherInfo] = useState({
        id: null,
        email: '',
        fullName: '',
        avatar: null
    });
    
    const [postLoading, setPostLoading] = useState(false);
    const [postError, setPostError] = useState(null);
    const [pagination, setPagination] = useState({
        pageNumber: 0,
        pageSize: 10,
        totalPages: 0,
        totalElements: 0
    });

    // Alert state
    const [alert, setAlert] = useState(null);
    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
    };
    
    // Thêm state để quản lý menu dropdown
    const [activeMenu, setActiveMenu] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    
    // Thêm state để quản lý file đã chọn
    const [selectedFiles, setSelectedFiles] = useState([]);
    
    // Thêm state để quản lý modal xem trước file
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewContent, setPreviewContent] = useState(null);
    const [previewType, setPreviewType] = useState(null);
    
    // Thêm state để quản lý animation đóng menu
    const [closingMenu, setClosingMenu] = useState(null);
    
    // Thêm state quản lý sinh viên
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentsError, setStudentsError] = useState(null);
    const [studentsPagination, setStudentsPagination] = useState({
        pageNumber: 0,
        pageSize: 5,
        totalPages: 0,
        totalElements: 0
    });
    const [avatarUrl, setAvatarUrl] = useState({});
    const [teacherAvatarUrl, setTeacherAvatarUrl] = useState(null);
    
    // Thêm state để quản lý menu xóa sinh viên
    const [activeStudentMenu, setActiveStudentMenu] = useState(null);
    const [closingStudentMenu, setClosingStudentMenu] = useState(null);
    const [studentDeleteLoading, setStudentDeleteLoading] = useState(false);
    
    // Thêm state để quản lý danh sách bài kiểm tra và phân trang
    const [tests, setTests] = useState([]);
    const [testsLoading, setTestsLoading] = useState(false);
    const [testsError, setTestsError] = useState(null);
    const [testsPagination, setTestsPagination] = useState({
        pageNumber: 0,
        pageSize: 10,
        totalPages: 0,
        totalElements: 0
    });
    
    // Thêm state để quản lý dữ liệu điểm số
    const [marksData, setMarksData] = useState({
        tests: [],
        students: [],
        results: {},
        loading: false,
        error: null
    });
    
    // Thêm state để quản lý hiển thị menu tùy chọn cho điểm số
    const [activeMarkMenu, setActiveMarkMenu] = useState(null);
    const [closingMarkMenu, setClosingMarkMenu] = useState(null);
    
    // Thêm state để quản lý việc chọn sinh viên
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [actionMenuOpen, setActionMenuOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    
    // Thêm state để quản lý menu test
    const [activeTestMenu, setActiveTestMenu] = useState(null);
    const [closingTestMenu, setClosingTestMenu] = useState(null);
    const [testToDelete, setTestToDelete] = useState(null);
    const [showDeleteTestConfirm, setShowDeleteTestConfirm] = useState(false);
    const [testDeleteLoading, setTestDeleteLoading] = useState(false);
    
    // Xử lý đóng menu khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Chỉ xử lý khi có menu đang mở
            if (activeMenu !== null) {
                // Kiểm tra xem click có phải là nút more-options không
                const isMoreOptionsButton = event.target.closest('.more-options');
                // Nếu click vào nút more-options thì không đóng menu (đã xử lý trong togglePostMenu)
                if (isMoreOptionsButton) {
                    return;
                }
                
                // Kiểm tra xem click có trong menu không
                const isInsideMenu = event.target.closest('.post-options-menu');
                if (!isInsideMenu) {
                    // Thêm animation đóng menu khi click ra ngoài
                    setClosingMenu(activeMenu);
                    // Đợi animation hoàn thành rồi mới đóng menu
                    setTimeout(() => {
                        setActiveMenu(null);
                        setClosingMenu(null);
                    }, 150); // 150ms - thời gian của animation đóng
                }
            }
            
            // Xử lý menu sinh viên
            if (activeStudentMenu !== null) {
                // Kiểm tra xem click có phải là nút 3 chấm không
                const isMoreOptionsButton = event.target.closest('.student-menu-button');
                if (isMoreOptionsButton) {
                    return;
                }
                
                // Kiểm tra xem click có trong menu không
                const isInsideMenu = event.target.closest('.student-options-menu');
                if (!isInsideMenu) {
                    // Thêm animation đóng menu
                    setClosingStudentMenu(activeStudentMenu);
                    setTimeout(() => {
                        setActiveStudentMenu(null);
                        setClosingStudentMenu(null);
                    }, 150);
                }
            }
            
            // Xử lý menu điểm số
            if (activeMarkMenu !== null) {
                // Kiểm tra xem click có phải là nút 3 chấm không
                const isMoreOptionsButton = event.target.closest('.mark-menu-button');
                if (isMoreOptionsButton) {
                    return;
                }
                
                // Kiểm tra xem click có trong menu không
                const isInsideMenu = event.target.closest('.mark-options-menu');
                if (!isInsideMenu) {
                    // Thêm animation đóng menu
                    setClosingMarkMenu(activeMarkMenu);
                    setTimeout(() => {
                        setActiveMarkMenu(null);
                        setClosingMarkMenu(null);
                    }, 150);
                }
            }

            // Xử lý menu thao tác hàng loạt
            if (actionMenuOpen) {
                // Kiểm tra xem click có phải là nút thao tác không
                const isActionButton = event.target.closest('.action-menu-button');
                if (isActionButton) {
                    return;
                }
                
                // Kiểm tra xem click có trong menu không
                const isInsideMenu = event.target.closest('.action-menu');
                if (!isInsideMenu) {
                    setActionMenuOpen(false);
                }
            }
        };
        
        // Thêm event listener khi component mount
        document.addEventListener('mousedown', handleClickOutside);
        
        // Cleanup khi component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeMenu, closingMenu, activeStudentMenu, closingStudentMenu, activeMarkMenu, closingMarkMenu, actionMenuOpen]);
    
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

    // Fetch teacher info and set up WebSocket when component mounts
    useEffect(() => {
        fetchTeacherInfo();
        
        // Only set up WebSocket after teacher info is fetched
        const setupWs = async () => {
            await fetchTeacherInfo();
            setupWebSocket();
        };
        
        setupWs();
        
        // Clean up WebSocket connection when component unmounts
        return () => {
            if (stompClient) {
                console.log('Deactivating WebSocket connection');
                stompClient.deactivate();
                setConnected(false);
                setStompClient(null);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    // Reconnect WebSocket if connection is lost
    useEffect(() => {
        if (!connected && stompClient === null) {
            const reconnectTimer = setTimeout(() => {
                console.log('Attempting to reconnect WebSocket...');
                setupWebSocket();
            }, 5000); // Try to reconnect after 5 seconds
            
            return () => clearTimeout(reconnectTimer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connected, stompClient]);

    // Fetch posts for this group
    const fetchPosts = async (isLoadMore = false, pageNumberParam = null) => {
        setPostLoading(true);
        setPostError(null);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Xác định pageNumber cần tải
            // Nếu có pageNumberParam được truyền vào, sử dụng nó
            // Nếu isLoadMore = true nhưng không có pageNumberParam, sử dụng pageNumber từ state
            // Nếu isLoadMore = false, sử dụng pageNumber = 0 (trang đầu tiên)
            const pageToLoad = pageNumberParam !== null ? pageNumberParam : 
                              (isLoadMore ? pagination.pageNumber : 0);
            
            // Tạo URLSearchParams để gửi tham số GET
            const params = new URLSearchParams();
            params.append('groupId', id);
            params.append('pageNumber', pageToLoad.toString());
            params.append('pageSize', pagination.pageSize.toString());
            
            console.log(`Fetching posts for page ${pageToLoad} with pageSize ${pagination.pageSize}`);
            
            // Gọi API với phương thức GET và params
            const response = await axios.get(
                `${GET_POST_GROUP}?${params.toString()}`,
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
                    console.log(`Fetched posts data for page ${pageToLoad}:`, responseData);
                    
                    // Kiểm tra xem responseData có chứa bài đăng nào không
                    if (responseData.content.length === 0) {
                        // Không có bài đăng nào, không cần cập nhật UI
                        console.log("No posts returned from API");
                        if (isLoadMore) {
                            // Nếu đang tải thêm mà không có dữ liệu, đặt lại pageNumber về trang trước đó
                            setPagination(prev => ({
                                ...prev,
                                pageNumber: prev.pageNumber > 0 ? prev.pageNumber - 1 : 0
                            }));
                        }
                        setPostLoading(false);
                        return;
                    }
                    
                    // Xử lý dữ liệu trả về từ API
                    if (isLoadMore) {
                        console.log("Loading more posts, appending to existing list");
                        
                        // Thêm bài đăng mới vào danh sách hiện tại
                        setPosts(prevPosts => {
                            // Tạo Map để lưu các bài đăng hiện tại theo ID để dễ dàng kiểm tra trùng lặp
                            const existingPostsMap = new Map();
                            prevPosts.forEach(post => existingPostsMap.set(post.id, post));
                            
                            // Đếm số bài đăng mới
                            let newPostsCount = 0;
                            
                            // Thêm các bài đăng mới vào danh sách
                            const updatedPosts = [...prevPosts];
                            responseData.content.forEach(post => {
                                // Nếu bài đăng chưa tồn tại trong danh sách hiện tại, thêm vào
                                if (!existingPostsMap.has(post.id)) {
                                    updatedPosts.push(post);
                                    newPostsCount++;
                                }
                            });
                            
                            console.log(`Found ${newPostsCount} new posts out of ${responseData.content.length} posts returned from API`);
                            
                            // Sắp xếp lại danh sách theo thời gian tạo (mới nhất lên đầu)
                            return updatedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        });
                    } else {
                        console.log("Loading posts, replacing existing list");
                    // Sắp xếp bài đăng mới nhất lên đầu (dựa vào trường createdAt)
                    const sortedPosts = [...responseData.content].sort((a, b) => {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
                    setPosts(sortedPosts);
                    }
                    
                    // Cập nhật thông tin phân trang từ đối tượng page trong response
                    setPagination(prev => ({
                        ...prev,
                        pageNumber: isLoadMore ? pageToLoad : 0,
                        pageSize: responseData.page.size,
                        totalPages: responseData.page.totalPages,
                        totalElements: responseData.page.totalElements
                    }));
                    
                    console.log("Updated pagination:", {
                        pageNumber: isLoadMore ? pageToLoad : 0,
                        totalPages: responseData.page.totalPages,
                        hasMore: (isLoadMore ? pageToLoad : 0) < responseData.page.totalPages - 1
                    });

                    // Fetch avatar if available
                    responseData.content.forEach(post => {
                        if (post.teacher && post.teacher.avatar) {
                            fetchTeacherAvatar(post.teacher.avatar);
                        }
                        
                        // Automatically fetch comments for each post
                        fetchComments(post.id);
                        
                        // Mark comments as shown for all posts
                        setShowComments(prev => ({
                            ...prev,
                            [post.id]: false
                        }));
                    });
                } else {
                    // Xử lý trường hợp responseData không có content
                    console.warn("Response data doesn't contain content property:", responseData);
                    setPosts([]);
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
            // Reset pagination khi tab thay đổi và gọi fetchPosts
            setPagination(prev => ({
                ...prev,
                pageNumber: 0
            }));
            // Chỉ gọi fetchPosts khi component mount lần đầu hoặc khi tab thay đổi
            fetchPosts(false, 0);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isActive]); // Không thêm pagination.pageNumber vào dependencies

    // Back to groups list
    const backToGroupsList = () => {
        navigate('/teacher/groups');
    }

    // Handle change tabs
    const handleTabChange = (tab) => {
        setisActive(tab);
        
        // Reset pagination when changing tabs
        if (tab === 'wall') {
            setPagination({
                pageNumber: 0,
                pageSize: 5,
                totalPages: 0,
                totalElements: 0
            });
        }
    }

    // Handle comment change
    const handleCommentChange = (postId, value) => {
        setCommentInput(prev => ({
            ...prev,
            [postId]: value
        }));
    };

    // Add a variable to track the last comment submission time
    const [lastCommentTime, setLastCommentTime] = useState({});

    // Handle comment submit
    const handleCommentSubmit = async (postId, e) => {
        if (e.key === 'Enter' && commentInput[postId]?.trim()) {
            try {
                // Check if WebSocket is connected
                if (!connected || !stompClient) {
                    showAlert('error', 'Lỗi', 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
                    return;
                }
                
                const token = localStorage.getItem('authToken');
                if (!token) {
                    showAlert('error', 'Lỗi', 'Bạn cần đăng nhập để gửi bình luận.');
                    return;
                }
                
                // Prevent rapid submissions (debounce)
                const now = Date.now();
                const lastTime = lastCommentTime[postId] || 0;
                if (now - lastTime < 2000) { // 2 seconds debounce
                    console.log('Comment submission throttled, please wait');
                    return;
                }
                
                // Update last comment time
                setLastCommentTime(prev => ({
                    ...prev,
                    [postId]: now
                }));
                
                // Create comment message
                const commentMessage = {
                    postId: postId,
                    username: teacherInfo.email,
                    detail: commentInput[postId],
                    createdDate: new Date().toISOString()
                };
                
                console.log('Sending comment via WebSocket:', commentMessage);
                
                // Clear input immediately for better UX
                const commentText = commentInput[postId];
                setCommentInput(prev => ({
                    ...prev,
                    [postId]: ''
                }));
                
                // Bỏ việc kiểm tra trùng lặp hoặc chỉ kiểm tra comment vừa gửi trong vài giây gần nhất
                // để tránh gửi trùng do click nhiều lần, nhưng vẫn cho phép gửi nội dung trùng lặp sau đó
                const recentDuplicateThreshold = 2000; // 5 seconds
                const isDuplicate = postComments[postId]?.some(
                    comment => comment.detail === commentText && 
                               comment.username === teacherInfo.email && 
                               comment.commentId.startsWith('temp-') && // Chỉ kiểm tra comment tạm thời (chưa được xác nhận từ server)
                               (Date.now() - new Date(comment.createdDate).getTime()) < recentDuplicateThreshold
                );

                if (isDuplicate) {
                    console.log('Recent duplicate comment detected, not sending to prevent rapid duplicate submissions');
                    return;
                }
                
                // Send comment via WebSocket with authentication header
                stompClient.publish({
                    destination: WS_POST_COMMENT_ENDPOINT,
                    body: JSON.stringify(commentMessage),
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                // Add optimistic comment to the UI
                const optimisticComment = {
                    commentId: `temp-${Date.now()}`,
                    postId: postId,
                    username: teacherInfo.email,
                    fullname: teacherInfo.fullName,
                    detail: commentText,
                    createdDate: new Date().toISOString(),
                    avatar: teacherInfo.avatar,
                    updateDate: null,
                    countOfReply: 0
                };
                
                // Thêm avatar URL cho comment tạm thời nếu có
                if (teacherAvatarUrl && optimisticComment.commentId) {
                    setCommentAvatarUrls(prev => ({
                        ...prev,
                        [optimisticComment.commentId]: teacherAvatarUrl
                    }));
                }
                
                setPostComments(prev => {
                    const currentComments = prev[postId] || [];
                    return {
                        ...prev,
                        [postId]: [optimisticComment, ...currentComments]
                    };
                });
                
                // Ensure comments are shown for this post
                setShowComments(prev => ({
                    ...prev,
                    [postId]: true
                }));
                
            } catch (error) {
                console.error('Error submitting comment:', error);
                showAlert('error', 'Lỗi', 'Không thể đăng bình luận. Vui lòng thử lại sau.');
            }
        }
    };

    // Thêm state quản lý lỗi validation cho editor
    const [editorValidationError, setEditorValidationError] = useState('');

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
        
        // Reset validation error
        setEditorValidationError('');
        
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
        setSelectedFiles([]);
        setEditorValidationError('');
    };

    // Function to handle text changes in the contenteditable div
    const handleEditorChange = () => {
        if (editorRef.current) {
        setAnnouncementText(editorRef.current.innerHTML);
        // Xóa lỗi validation nếu có nội dung
        if (editorRef.current.textContent.trim() && editorValidationError) {
            setEditorValidationError('');
        }
        }
    };

    // Xóa lỗi validation khi người dùng bắt đầu nhập nội dung hoặc thêm file
    useEffect(() => {
        const hasContent = announcementText.trim() || selectedFiles.length > 0;
        if (hasContent && editorValidationError) {
            setEditorValidationError('');
        }
    }, [announcementText, selectedFiles, editorValidationError]);

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
        // Kiểm tra xem bài đăng có nội dung hoặc file đính kèm không
        const hasContent = announcementText.trim() || selectedFiles.length > 0;
        
        if (!hasContent) {
            // Hiển thị thông báo lỗi trực tiếp trong form
            setEditorValidationError('Nội dung không được để trống');
            return;
        }
        
            try {
                const token = localStorage.getItem('authToken');
                const formData = new FormData();
                formData.append('groupId', id);
                formData.append('title', '');
                formData.append('text', announcementText);
                // Gửi từng file theo dạng fileUploadRequests[i].file và fileUploadRequests[i].type
                selectedFiles.forEach((file, idx) => {
                    formData.append(`fileUploadRequests[${idx}].file`, file);
                    // Xác định type
                    const mimeType = file.type;
                    let type = 'file';
                    if (mimeType.startsWith('image/')) type = 'image';
                    else if (mimeType.startsWith('video/')) type = 'video';
                    formData.append(`fileUploadRequests[${idx}].type`, type);
                });
                const response = await axios.post(
                    `${ADD_POST_GROUP}`,
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                if (response.data && response.data.code === 0) {
                fetchPosts(false, 0);
                    closeEditor();
                    setAnnouncementText('');
                    setSelectedFiles([]);
                } else {
                    console.error('Error creating post:', response.data?.message);
                showAlert('error', 'Lỗi', response.data?.message || 'Không thể tạo bài đăng');
                }
            } catch (error) {
                console.error('Error creating post:', error);
            showAlert('error', 'Lỗi', 'Không thể tạo bài đăng. Vui lòng thử lại sau.');
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
        return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
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

    // Xử lý khi chọn file
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            setSelectedFiles((prev) => [...prev, ...files]);
        }
    };
    
    // Xóa file đã chọn theo index
    const removeSelectedFile = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Hàm để lấy URL icon tương ứng với loại file
    const getFileIconUrl = (mimeType, extension) => {
        // Url cơ bản cho icon Google Drive
        const baseUrl = "https://drive-thirdparty.googleusercontent.com/16/type/";
        
        if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || extension === 'docx') {
            return `${baseUrl}application/vnd.openxmlformats-officedocument.wordprocessingml.document`;
        } else if (mimeType === 'application/msword' || extension === 'doc') {
            return `${baseUrl}application/msword`;
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || extension === 'xlsx') {
            return `${baseUrl}application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
        } else if (mimeType === 'application/vnd.ms-excel' || extension === 'xls') {
            return `${baseUrl}application/vnd.ms-excel`;
        } else if (mimeType === 'application/pdf' || extension === 'pdf') {
            return `${baseUrl}application/pdf`;
        } else if (mimeType.startsWith('image/')) {
            return `${baseUrl}image/${mimeType.split('/')[1]}`;
        } else if (mimeType.startsWith('video/')) {
            return `${baseUrl}video/${mimeType.split('/')[1]}`;
        } else if (mimeType === 'text/plain' || extension === 'txt') {
            return `${baseUrl}text/plain`;
        } else {
            // Icon mặc định cho các loại file khác
            return `${baseUrl}application/octet-stream`;
        }
    };
    
    // Hàm trả về mô tả loại file dựa trên MIME type
    const getMimeTypeDescription = (mimeType) => {
        if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return 'Microsoft Word';
        } else if (mimeType === 'application/msword') {
            return 'Microsoft Word';
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            return 'Microsoft Excel';
        } else if (mimeType === 'application/vnd.ms-excel') {
            return 'Microsoft Excel';
        } else if (mimeType === 'application/pdf') {
            return 'PDF Document';
        } else if (mimeType.startsWith('image/')) {
            return 'Image';
        } else if (mimeType.startsWith('video/')) {
            return 'Video';
        } else if (mimeType === 'text/plain') {
            return 'Text Document';
        } else {
            return 'File';
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

    // Hàm xử lý hiển thị/ẩn menu cho từng bài viết
    const togglePostMenu = (postId) => {
        if (activeMenu === postId) {
            // Xử lý animation đóng menu
            setClosingMenu(postId);
            // Đợi animation hoàn thành rồi mới đóng menu
            setTimeout(() => {
                setActiveMenu(null);
                setClosingMenu(null);
            }, 150); // 150ms - thời gian của animation đóng
        } else {
            if (closingMenu) {
                // Nếu đang có menu đang đóng, hủy animation
                setClosingMenu(null);
            }
            setActiveMenu(postId); // Hiển thị menu của bài viết được chọn
        }
    };
    
    // Hàm xử lý xóa bài viết
    const handleDeletePost = async (postId) => {
        if (deleteLoading) return; // Tránh gọi lại khi đang xử lý
        
        try {
            setDeleteLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Tạo FormData để gửi postId
            const formData = new FormData();
            formData.append('postId', postId);
            
            // Gọi API xóa bài viết với phương thức DELETE
            const response = await axios.delete(
                `${DELETE_POST_GROUP}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    data: formData
                }
            );
            
            // Kiểm tra kết quả trả về
            if (response.data && response.data.code === 0) {
                // Xóa thành công, cập nhật lại danh sách bài viết
                fetchPosts(false, 0);
                // Đóng menu
                setActiveMenu(null);
            } else {
                throw new Error(response.data?.message || 'Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            // Có thể hiển thị thông báo lỗi ở đây
        } finally {
            setDeleteLoading(false);
        }
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

    // Hàm gọi API để lấy ra ảnh đại diện của giảng viên
    const fetchTeacherAvatar = async (avatarPath) => {
        
        if (!avatarPath) return;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            // Fetch avatar with authorization header
            const response = await axios.get(`${API_BASE_URL}${avatarPath}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob' 
            });

            // Create a URL for the blob data
            const imageUrl = URL.createObjectURL(response.data);
            setTeacherAvatarUrl(imageUrl);
        } catch (err) {
            console.error('Error fetching avatar:', err);
        }
    };

    // Hàm gọi API để lấy ra ảnh đại diện của sinh viên
    const fetchAvatar = async (avatarPath, studentId) => {
        
        if (!avatarPath) return;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            // Fetch avatar with authorization header
            const response = await axios.get(`${API_BASE_URL}${avatarPath}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob' 
            });

            // Create a URL for the blob data
            const imageUrl = URL.createObjectURL(response.data);
            setAvatarUrl(prev => ({
                ...prev,
                [studentId]: imageUrl
            }));
        } catch (err) {
            console.error('Error fetching avatar:', err);
        }
    };

    // Cập nhật hàm fetchStudents để hỗ trợ isLoadMore và pageNumberParam
    const fetchStudents = async (isLoadMore = false, pageNumberParam = null) => {
        if (!id) return;
        
        setStudentsLoading(true);
        setStudentsError(null);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Xác định pageNumber cần tải
            // Nếu có pageNumberParam được truyền vào, sử dụng nó
            // Nếu isLoadMore = true nhưng không có pageNumberParam, sử dụng pageNumber từ state
            // Nếu isLoadMore = false, sử dụng pageNumber = 0 (trang đầu tiên)
            const pageToLoad = pageNumberParam !== null ? pageNumberParam : 
                              (isLoadMore ? studentsPagination.pageNumber : 0);
            
            // Tạo URLSearchParams để gửi tham số GET
            const params = new URLSearchParams();
            params.append('groupId', id);
            params.append('pageSize', studentsPagination.pageSize.toString());
            params.append('pageNumber', pageToLoad.toString());
            
            console.log(`Fetching students for page ${pageToLoad} with pageSize ${studentsPagination.pageSize}`);
            
            // Gọi API với phương thức GET và params
            const response = await axios.get(
                `${GET_STUDENTS_GROUP}?${params.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            // Kiểm tra kết quả trả về
            if (response.data && response.data.code === 0) {
                const responseData = response.data.result;
                console.log(`Fetched students data for page ${pageToLoad}:`, responseData);
                
                // Kiểm tra xem responseData có chứa sinh viên nào không
                if (responseData.content && responseData.content.length === 0) {
                    console.log("No students returned from API");
                    if (isLoadMore) {
                        // Nếu đang tải thêm mà không có dữ liệu, đặt lại pageNumber về trang trước đó
                        setStudentsPagination(prev => ({
                            ...prev,
                            pageNumber: prev.pageNumber > 0 ? prev.pageNumber - 1 : 0
                        }));
                    }
                    setStudentsLoading(false);
                    return;
                }
                
                // Nếu kết quả trả về là dạng phân trang
                if (responseData.content) {
                    // Nếu isLoadMore = true, thêm sinh viên mới vào danh sách hiện tại
                    // Nếu không, thay thế danh sách hiện tại
                    if (isLoadMore) {
                        console.log("Loading more students, appending to existing list");
                        
                        // Thêm sinh viên mới vào danh sách hiện tại
                        setStudents(prevStudents => {
                            // Tạo Map để lưu các sinh viên hiện tại theo ID để dễ dàng kiểm tra trùng lặp
                            const existingStudentsMap = new Map();
                            prevStudents.forEach(student => existingStudentsMap.set(student.id, student));
                            
                            // Đếm số sinh viên mới
                            let newStudentsCount = 0;
                            
                            // Thêm các sinh viên mới vào danh sách
                            const updatedStudents = [...prevStudents];
                            responseData.content.forEach(student => {
                                // Nếu sinh viên chưa tồn tại trong danh sách hiện tại, thêm vào
                                if (!existingStudentsMap.has(student.id)) {
                                    updatedStudents.push(student);
                                    newStudentsCount++;
                                }
                            });
                            
                            console.log(`Found ${newStudentsCount} new students out of ${responseData.content.length} students returned from API`);
                            
                            return updatedStudents;
                        });
                    } else {
                        console.log("Loading students, replacing existing list");
                    setStudents(responseData.content);
                    }
                    
                    // Cập nhật thông tin phân trang
                    setStudentsPagination(prev => ({
                        ...prev,
                        pageNumber: isLoadMore ? pageToLoad : 0,
                        totalPages: responseData.totalPages || responseData.page?.totalPages || 0,
                        totalElements: responseData.totalElements || responseData.page?.totalElements || 0
                    }));
                    
                    console.log("Updated students pagination:", {
                        pageNumber: isLoadMore ? pageToLoad : 0,
                        totalPages: responseData.totalPages || responseData.page?.totalPages || 0,
                        hasMore: (isLoadMore ? pageToLoad : 0) < (responseData.totalPages || responseData.page?.totalPages || 0) - 1
                    });
                    
                    // Tải avatar cho sinh viên mới
                    responseData.content.forEach(student => {
                        if (student.avatar) {
                            fetchAvatar(student.avatar, student.id);
                        }
                    });
                } else {
                    // Nếu kết quả trả về không phải dạng phân trang
                    console.warn("Response data doesn't contain content property:", responseData);
                    setStudents([]);
                }
            } else {
                throw new Error(response.data?.message || 'Failed to fetch students');
            }
        } catch (err) {
            console.error('Error fetching students:', err);
            setStudentsError('Không thể tải danh sách sinh viên. Vui lòng thử lại sau.');
        } finally {
            setStudentsLoading(false);
        }
    };

    // Thay đổi useEffect để lấy sinh viên chỉ khi tab thay đổi
    useEffect(() => {
        if (id && isActive === 'people') {
            // Reset pagination khi tab thay đổi
            setStudentsPagination(prev => ({
                ...prev,
                pageNumber: 0
            }));
            // Chỉ gọi fetchStudents khi tab thay đổi, không gọi khi thay đổi trang
            fetchStudents(false, 0);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isActive]); // Loại bỏ studentsPagination.pageNumber và pageSize từ dependencies

    // Hàm xử lý khi thay đổi trang trong phần sinh viên
    const handleStudentsPageChange = (newPage) => {
        // Cập nhật state pagination với pageNumber mới
        setStudentsPagination({
            ...studentsPagination,
            pageNumber: newPage
        });
        
        // Gọi fetchStudents với isLoadMore = false và trang mới
        fetchStudents(false, newPage);
    };

    // Hàm xử lý hiển thị/ẩn menu xóa sinh viên
    const toggleStudentMenu = (studentId) => {
        if (activeStudentMenu === studentId) {
            // Thêm animation đóng menu
            setClosingStudentMenu(studentId);
            setTimeout(() => {
                setActiveStudentMenu(null);
                setClosingStudentMenu(null);
            }, 150);
        } else {
            if (closingStudentMenu) {
                setClosingStudentMenu(null);
            }
            setActiveStudentMenu(studentId);
        }
    };
    
    // Hàm xử lý xóa sinh viên
    const handleDeleteStudent = async (studentId) => {
        if (studentDeleteLoading) return; // Tránh gọi lại khi đang xử lý
        
        try {
            setStudentDeleteLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Tạo FormData để gửi dữ liệu
            const formData = new FormData();
            formData.append('groupId', id);
            formData.append('studentId', studentId);
            
            // Gọi API xóa sinh viên với phương thức DELETE
            const response = await axios.delete(
                DELETE_STUDENT_GROUP,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    data: formData
                }
            );
            
            // Kiểm tra kết quả trả về
            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', `Xóa sinh viên thành công`);
                // Xóa thành công, cập nhật lại danh sách sinh viên
                fetchStudents();
                // Đóng menu
                setActiveStudentMenu(null);
            } else {
                showAlert('error', 'Lỗi', `${response.data?.message}`);
                throw new Error(response.data?.message || 'Failed to delete student');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            // Có thể hiển thị thông báo lỗi ở đây
        } finally {
            setStudentDeleteLoading(false);
        }
    };

    // Thêm hàm xử lý chuyển đến trang tạo bài tập
    const handleCreateTask = () => {
        navigate(`/teacher/groups/${id}/create-task`);
    };

    // Cập nhật hàm fetchTests
    const fetchTests = async (isLoadMore = false, pageNumberParam = null) => {
        if (!id) return;
        
        setTestsLoading(true);
        setTestsError(null);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Xác định pageNumber cần tải
            // Nếu có pageNumberParam được truyền vào, sử dụng nó
            // Nếu isLoadMore = true nhưng không có pageNumberParam, sử dụng pageNumber từ state
            // Nếu isLoadMore = false, sử dụng pageNumber = 0 (trang đầu tiên)
            const pageToLoad = pageNumberParam !== null ? pageNumberParam : 
                              (isLoadMore ? testsPagination.pageNumber : 0);
            
            // Tạo FormData để gửi tham số
            const formData = new FormData();
            formData.append('groupId', id);
            formData.append('pageSize', testsPagination.pageSize.toString());
            formData.append('pageNumber', pageToLoad.toString());
            
            // Tạo URL với query parameters từ FormData
            let url = GET_TESTS_IN_GROUP;
            let searchParams = new URLSearchParams();
            for (let [key, value] of formData.entries()) {
                searchParams.append(key, value);
            }
            url = `${url}?${searchParams.toString()}`;
            
            console.log(`Fetching tests for page ${pageToLoad} with pageSize ${testsPagination.pageSize}`);
            
            // Gọi API với phương thức GET
            const response = await axios.get(
                url,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            // Kiểm tra kết quả trả về
            if (response.data && response.data.code === 0) {
                const responseData = response.data.result;
                console.log(`Fetched tests data for page ${pageToLoad}:`, responseData);
                
                // Nếu kết quả trả về là dạng phân trang
                if (responseData.content) {
                    // Kiểm tra xem responseData có chứa bài kiểm tra nào không
                    if (responseData.content.length === 0) {
                        console.log("No tests returned from API");
                        if (isLoadMore) {
                            // Nếu đang tải thêm mà không có dữ liệu, đặt lại pageNumber về trang trước đó
                            setTestsPagination(prev => ({
                                ...prev,
                                pageNumber: prev.pageNumber > 0 ? prev.pageNumber - 1 : 0
                            }));
                        }
                        setTestsLoading(false);
                        return;
                    }
                    
                    // Nếu isLoadMore = true, thêm bài kiểm tra mới vào danh sách hiện tại
                    // Nếu không, thay thế danh sách hiện tại
                    if (isLoadMore) {
                        console.log("Loading more tests, appending to existing list");
                        
                        // Thêm bài kiểm tra mới vào danh sách hiện tại
                        setTests(prevTests => {
                            // Tạo Map để lưu các bài kiểm tra hiện tại theo ID để dễ dàng kiểm tra trùng lặp
                            const existingTestsMap = new Map();
                            prevTests.forEach(test => existingTestsMap.set(test.id, test));
                            
                            // Đếm số bài kiểm tra mới
                            let newTestsCount = 0;
                            
                            // Thêm các bài kiểm tra mới vào danh sách
                            const updatedTests = [...prevTests];
                            responseData.content.forEach(test => {
                                // Nếu bài kiểm tra chưa tồn tại trong danh sách hiện tại, thêm vào
                                if (!existingTestsMap.has(test.id)) {
                                    updatedTests.push(test);
                                    newTestsCount++;
                                }
                            });
                            
                            console.log(`Found ${newTestsCount} new tests out of ${responseData.content.length} tests returned from API`);
                            
                            return updatedTests;
                        });
                    } else {
                        console.log("Loading tests, replacing existing list");
                    setTests(responseData.content);
                    }
                    
                    // Cập nhật thông tin phân trang
                    setTestsPagination(prev => ({
                        ...prev,
                        pageNumber: isLoadMore ? pageToLoad : 0,
                        totalPages: responseData.totalPages || responseData.page?.totalPages || 0,
                        totalElements: responseData.totalElements || responseData.page?.totalElements || 0
                    }));
                    
                    console.log("Updated tests pagination:", {
                        pageNumber: isLoadMore ? pageToLoad : 0,
                        totalPages: responseData.totalPages || responseData.page?.totalPages || 0,
                        hasMore: (isLoadMore ? pageToLoad : 0) < (responseData.totalPages || responseData.page?.totalPages || 0) - 1
                    });
                } else {
                    // Nếu kết quả trả về không phải dạng phân trang
                    console.warn("Response data doesn't contain content property:", responseData);
                    setTests([]);
                }
            } else {
                throw new Error(response.data?.message || 'Failed to fetch tests');
            }
        } catch (err) {
            console.error('Error fetching tests:', err);
            setTestsError('Không thể tải danh sách bài kiểm tra. Vui lòng thử lại sau.');
        } finally {
            setTestsLoading(false);
        }
    };

    // Thay đổi useEffect để lấy bài kiểm tra chỉ khi tab thay đổi
    useEffect(() => {
        if (id && isActive === 'tasks') {
            // Reset pagination khi tab thay đổi
            setTestsPagination(prev => ({
                ...prev,
                pageNumber: 0
            }));
            // Chỉ gọi fetchTests khi tab thay đổi, không gọi khi thay đổi trang
            fetchTests(false, 0);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isActive]); // Loại bỏ testsPagination.pageNumber và pageSize từ dependencies

    // Hàm xử lý khi thay đổi trang
    const handleTestsPageChange = (newPage) => {
        // Cập nhật state pagination với pageNumber mới
        setTestsPagination({
            ...testsPagination,
            pageNumber: newPage
        });
        
        // Gọi fetchTests với isLoadMore = false và trang mới
        fetchTests(false, newPage);
    };

    // Thêm hàm xử lý khi click vào bài kiểm tra
    const handleTaskClick = (testId) => {
        navigate(`/teacher/tests/${testId}`);
    };

    // Hàm để lấy dữ liệu điểm số của tất cả sinh viên cho tất cả bài kiểm tra
    const fetchMarksData = async () => {
        if (!id) return;
        
        setMarksData(prev => ({ ...prev, loading: true, error: null }));
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // 1. Lấy danh sách các bài kiểm tra trong nhóm
            const testsParams = new URLSearchParams();
            testsParams.append('groupId', id);
            testsParams.append('pageSize', 100); // Lấy tối đa 100 bài kiểm tra
            testsParams.append('pageNumber', 0);
            
            const testsResponse = await axios.get(
                `${GET_TESTS_IN_GROUP}?${testsParams.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (testsResponse.data && testsResponse.data.code !== 0) {
                throw new Error(testsResponse.data?.message || 'Failed to fetch tests');
            }
            
            // 2. Lấy danh sách sinh viên trong nhóm
            const studentsParams = new URLSearchParams();
            studentsParams.append('groupId', id);
            studentsParams.append('pageSize', 100); // Lấy tối đa 100 sinh viên
            studentsParams.append('pageNumber', 0);
            
            const studentsResponse = await axios.get(
                `${GET_STUDENTS_GROUP}?${studentsParams.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (studentsResponse.data && studentsResponse.data.code !== 0) {
                throw new Error(studentsResponse.data?.message || 'Failed to fetch students');
            }
            
            const tests = testsResponse.data.result.content || [];
            const students = studentsResponse.data.result.content || [];
            
            // Khởi tạo đối tượng lưu trữ kết quả
            const results = {};
            
            // 3. Lấy kết quả bài kiểm tra cho từng sinh viên và từng bài kiểm tra
            for (const student of students) {
                results[student.id] = {};
                
                for (const test of tests) {
                    try {
                        const params = new URLSearchParams();
                        params.append('testId', test.id);
                        params.append('studentId', student.id);
                        
                        const resultResponse = await axios.get(
                            `${GET_STUDENT_TEST_RESULT}?${params.toString()}`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            }
                        );
                        
                        if (resultResponse.data && resultResponse.data.code === 0) {
                            results[student.id][test.id] = resultResponse.data.result;
                        } else {
                            // Nếu không có kết quả, gán giá trị null
                            results[student.id][test.id] = null;
                        }
                    } catch (error) {
                        // Nếu API trả về lỗi, gán giá trị null (sinh viên chưa làm bài kiểm tra)
                        results[student.id][test.id] = null;
                        console.log(`No result for student ${student.id} and test ${test.id}`);
                    }
                }
            }
            
            // Cập nhật state với dữ liệu đã lấy
            setMarksData({
                tests,
                students,
                results,
                loading: false,
                error: null
            });
            
            // Tải avatar cho sinh viên
            students.forEach(student => {
                if (student.avatar) {
                    fetchAvatar(student.avatar, student.id);
                }
            });
            
        } catch (error) {
            console.error('Error fetching marks data:', error);
            setMarksData(prev => ({
                ...prev,
                loading: false,
                error: 'Không thể tải dữ liệu điểm số. Vui lòng thử lại sau.'
            }));
        }
    };
    
    // Load dữ liệu điểm số khi vào tab "marks"
    useEffect(() => {
        if (id && isActive === 'marks') {
            fetchMarksData();
        }
    }, [id, isActive]);
    
    // Hàm để xem chi tiết kết quả bài kiểm tra của sinh viên
    const viewStudentTestDetail = (testId, studentId, resultId) => {
        if (!resultId) return; // Không có kết quả để xem
        
        const params = new URLSearchParams();
        params.append('testId', testId);
        params.append('studentId', studentId);
        
        navigate(`/teacher/test-results/${resultId}?${params.toString()}`);
    };
    
    // Thêm hàm xử lý hiển thị/ẩn menu cho điểm số
    const toggleMarkMenu = (markId) => {
        if (activeMarkMenu === markId) {
            // Thêm animation đóng menu
            setClosingMarkMenu(markId);
            setTimeout(() => {
                setActiveMarkMenu(null);
                setClosingMarkMenu(null);
            }, 150);
        } else {
            if (closingMarkMenu) {
                setClosingMarkMenu(null);
            }
            setActiveMarkMenu(markId);
        }
    };

    // Thêm hàm xử lý chọn/bỏ chọn tất cả sinh viên
    const handleSelectAllStudents = (e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        
        if (isChecked) {
            // Chọn tất cả sinh viên hiển thị trên trang hiện tại
            const allStudentIds = students.map(student => student.id);
            setSelectedStudents(allStudentIds);
        } else {
            // Bỏ chọn tất cả
            setSelectedStudents([]);
        }
    };

    // Thêm hàm xử lý chọn/bỏ chọn một sinh viên
    const handleSelectStudent = (studentId, isChecked) => {
        if (isChecked) {
            // Thêm sinh viên vào danh sách đã chọn
            setSelectedStudents(prev => [...prev, studentId]);
        } else {
            // Xóa sinh viên khỏi danh sách đã chọn
            setSelectedStudents(prev => prev.filter(id => id !== studentId));
            // Đảm bảo trạng thái "Chọn tất cả" được cập nhật chính xác
            setSelectAll(false);
        }
    };

    // Thêm hàm xử lý khi nhấn vào nút "Thao tác"
    const toggleActionMenu = () => {
        setActionMenuOpen(prev => !prev);
    };

    // Thêm hàm xử lý khi nhấn vào nút "Xóa" trong menu thao tác
    const openDeleteConfirmation = () => {
        setConfirmDialogOpen(true);
        setActionMenuOpen(false); // Đóng menu thao tác
    };

    // Thêm hàm xử lý khi xác nhận xóa nhiều sinh viên
    const handleDeleteMultipleStudents = async () => {
        if (bulkDeleteLoading || selectedStudents.length === 0) return;
        
        try {
            setBulkDeleteLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Gọi API xóa nhiều sinh viên
            const response = await axios.delete(
                DELETE_MULTIPLE_STUDENTS_GROUP,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        baseId: id,
                        studentIds: selectedStudents
                    }
                }
            );
            
            // Kiểm tra kết quả trả về
            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', `Đã xóa ${selectedStudents.length} sinh viên khỏi nhóm`);
                // Cập nhật lại danh sách sinh viên
                fetchStudents();
                // Reset các state liên quan
                setSelectedStudents([]);
                setSelectAll(false);
            } else {
                showAlert('error', 'Lỗi', response.data?.message || 'Không thể xóa sinh viên');
            }
        } catch (error) {
            console.error('Error deleting multiple students:', error);
            showAlert('error', 'Lỗi', 'Không thể xóa sinh viên. Vui lòng thử lại sau.');
        } finally {
            setBulkDeleteLoading(false);
            setConfirmDialogOpen(false);
        }
    };

    // Reset selected students when changing page
    useEffect(() => {
        setSelectedStudents([]);
        setSelectAll(false);
    }, [studentsPagination.pageNumber]);

    // Add state for comments
    const [postComments, setPostComments] = useState({});
    const [commentInput, setCommentInput] = useState({});
    const [commentLoading, setCommentLoading] = useState({});
    const [commentPagination, setCommentPagination] = useState({});
    const [showComments, setShowComments] = useState({});
    
    // Fetch comments for a post
    const fetchComments = async (postId, pageNumber = 0) => {
        try {
            setCommentLoading(prev => ({
                ...prev,
                [postId]: true
            }));
            
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Set pageSize to 10 comments per page (matching API default)
            const pageSize = 10;
            
            // Call API to fetch comments
            const response = await axios.get(GET_COMMENTS_BY_POST, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'postId': postId,
                    'pageNumber': pageNumber.toString(),
                    'pageSize': pageSize.toString()
                }
            });
            
            if (response.data && response.data.code === 0) {
                const result = response.data.result;
                
                // Fetch avatars for all comments
                if (result.content && result.content.length > 0) {
                    result.content.forEach(comment => {
                        if (comment.avatar) {
                            fetchCommentAvatar(comment.avatar, comment.commentId);
                        }
                    });
                }
                
                // If loading more comments, append to existing list
                if (pageNumber > 0 && postComments[postId]) {
                    setPostComments(prev => ({
                        ...prev,
                        [postId]: [...prev[postId], ...result.content]
                    }));
                } else {
                    // Otherwise replace the list
                    setPostComments(prev => ({
                        ...prev,
                        [postId]: result.content || []
                    }));
                    
                    // Automatically load replies for comments that have replies
                    if (result.content && result.content.length > 0) {
                        // Find comments that have replies (countOfReply > 0)
                        const commentsWithReplies = result.content.filter(comment => comment.countOfReply > 0);
                        
                        // Fetch replies for those comments
                        commentsWithReplies.forEach(comment => {
                            // Set showReplies to true and fetch replies
                            setPostComments(prevState => {
                                const updatedComments = prevState[postId].map(c => {
                                    if (c.commentId === comment.commentId) {
                                        return { ...c, showReplies: true };
                                    }
                                    return c;
                                });
                                
                                return {
                                    ...prevState,
                                    [postId]: updatedComments
                                };
                            });
                            
                            // Call fetchCommentReplies for this comment
                            fetchCommentReplies(comment.commentId);
                        });
                    }
                }
                
                // Update pagination info using the page object from response
                setCommentPagination(prev => ({
                    ...prev,
                    [postId]: {
                        pageNumber: result.page.number,
                        pageSize: result.page.size,
                        totalPages: result.page.totalPages,
                        totalElements: result.page.totalElements
                    }
                }));
            } else {
                throw new Error(response.data?.message || 'Failed to fetch comments');
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setCommentLoading(prev => ({
                ...prev,
                [postId]: false
            }));
        }
    };

    // Toggle showing comments for a post
    const toggleComments = (postId) => {
        const newState = !showComments[postId];
        
        setShowComments(prev => ({
            ...prev,
            [postId]: newState
        }));
        
        // If showing comments and they haven't been loaded yet, fetch them
        if (newState && (!postComments[postId] || postComments[postId].length === 0)) {
            fetchComments(postId);
        }
    };

    // Load more comments for a post
    const loadMoreComments = (postId) => {
        const currentPage = commentPagination[postId]?.pageNumber || 0;
        const nextPage = currentPage + 1;
        
        if (nextPage < (commentPagination[postId]?.totalPages || 0)) {
            fetchComments(postId, nextPage);
        }
    };

    // Format comment time
    const formatCommentTime = (dateTimeStr) => {
        try {
            const date = new Date(dateTimeStr);
            const now = new Date();
            const diffMs = now - date;
            
            // Less than a minute
            if (diffMs < 60000) {
                return 'Vừa xong';
            }
            
            // Less than an hour
            if (diffMs < 3600000) {
                const minutes = Math.floor(diffMs / 60000);
                return `${minutes} phút trước`;
            }
            
            // Less than a day
            if (diffMs < 86400000) {
                const hours = Math.floor(diffMs / 3600000);
                return `${hours} giờ trước`;
            }
            
            // Less than a week
            if (diffMs < 604800000) {
                const days = Math.floor(diffMs / 86400000);
                return `${days} ngày trước`;
            }
            
            // Otherwise, return formatted date
            return date.toLocaleString('vi-VN', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric'
            });
        } catch (error) {
            return dateTimeStr;
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
                                                    <Upload size={16}/>
                                                </button>
                                                <input
                                                    id="file-input"
                                                    type="file"
                                                    style={{ display: 'none' }}
                                                    onChange={handleFileChange}
                                                    multiple
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Hiển thị danh sách file đã chọn */}
                                        {selectedFiles.length > 0 && (
                                            <div className="selected-file-card">
                                                {selectedFiles.map((file, idx) => (
                                                    <div className="file-attachment-preview" key={idx}>
                                                        <div className="file-preview-icon">
                                                            <img 
                                                                src={getFileIconUrl(file.type, getFileExtension(file.name))} 
                                                                alt="File icon" 
                                                            />
                                                        </div>
                                                        <div className="file-preview-details">
                                                            <div className="file-preview-name">{file.name}</div>
                                                            <div className="file-preview-type">{getMimeTypeDescription(file.type)}</div>
                                                        </div>
                                                        <div className="file-preview-actions">
                                                            <button 
                                                                className="file-remove-button" 
                                                                onClick={() => removeSelectedFile(idx)}
                                                                title="Xóa file"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Hiển thị thông báo lỗi validation */}
                                        {editorValidationError && (
                                            <div className="validation-error-message">
                                                <AlertCircle size={16} />
                                                <span>{editorValidationError}</span>
                                            </div>
                                        )}
                                        
                                        <div className="editor-actions">
                                            <button className="post-cancel-button" onClick={closeEditor}>Hủy</button>
                                            <button className="post-button" onClick={submitAnnouncement}>Đăng</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        className='d-flex open-editor'
                                        onClick={openEditor}
                                    > 
                                        {teacherAvatarUrl ? (
                                            <img src={teacherAvatarUrl} alt="Avatar" className="group-author-avatar"/>
                                        ) : (
                                            <img src='https://randomuser.me/api/portraits/men/1.jpg' className="group-author-avatar"/>
                                        )}
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
                                <div className="tests-error">
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
                                                <>
                                                    <div key={post.id} className="announcement_item">
                                                        <div className="announcement-author">
                                                            {teacherAvatarUrl ? (
                                                                <img src={teacherAvatarUrl} alt="Avatar" className='group-author-avatar'/>
                                                            ) : (
                                                                <img src='https://randomuser.me/api/portraits/men/1.jpg' className='group-author-avatar'/>
                                                            )}
                                                            <div className="author-info">
                                                                <div className="author-name">
                                                                    {post.teacher?.fullName || 'Giáo viên'}
                                                                </div>
                                                                <div className="announcement-time">
                                                                    {formatDateTime(post.createdAt)}
                                                                </div>
                                                            </div>
                                                            <div className="post-options-container">
                                                                <button 
                                                                    className="more-options" 
                                                                    onClick={() => togglePostMenu(post.id)}
                                                                >
                                                                    <EllipsisVertical size={20}/>
                                                                </button>
                                                                {(activeMenu === post.id || closingMenu === post.id) && (
                                                                    <div className={`post-options-menu ${closingMenu === post.id ? 'post-options-menu-exit' : ''}`}>
                                                                        <button 
                                                                            className="post-option-item post-edit-button"
                                                                            onClick={(e) => handleEditPost(post, e)}
                                                                        >
                                                                            Chỉnh sửa
                                                                        </button>
                                                                        <button 
                                                                            className="post-option-item post-delete-button"
                                                                            onClick={() => handleDeletePost(post.id)}
                                                                            disabled={deleteLoading}
                                                                        >
                                                                            {deleteLoading && activeMenu === post.id ? 'Đang xóa...' : 'Xóa'}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="announcement_content" dangerouslySetInnerHTML={{ __html: post.text }}></div>

                                                        {/* Hiển thị tất cả file đính kèm */}
                                                        {Array.isArray(post.files) && post.files.length > 0 && (
                                                            <div className="announcement_attachment_list">
                                                                {post.files.map((file, idx) => (
                                                                    <div key={idx} className="announcement_attachment">
                                                                        <button 
                                                                            onClick={() => openPreviewModal(file.fileUrl)}
                                                                            className="tgd-file-attachment-button"
                                                                        >
                                                                            <div className="tgd-file-icon">
                                                                                {file.fileType === 'image' ? <Image size={20} /> : 
                                                                                    file.fileType === 'video' ? <Video size={20} /> : 
                                                                                    <FileText size={20} />}
                                                                            </div>
                                                                            <div className="tgd-file-info">
                                                                                <div className="tgd-file-name">{file.fileName}</div>
                                                                                <div className="tgd-file-action">Nhấn để xem trước</div>
                                                                            </div>
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className='group-comment-divided'>
                                                        {/* Comment count and toggle */}
                                                        {commentPagination[post.id]?.totalElements > 0 && (
                                                            <div className="group-comment-toggle" onClick={() => toggleComments(post.id)}>
                                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36077 14.891 4 16.1272L3 21L7.8728 20C9.10904 20.6392 10.5124 21 12 21Z" stroke="#5F6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                </svg>
                                                                {showComments[post.id] ? 'Ẩn bình luận' : 
                                                                    `${commentPagination[post.id]?.totalElements || 0} bình luận`}
                                                            </div>
                                                        )}
                                                        
                                                        {/* Comments list */}
                                                        {(showComments[post.id] && commentPagination[post.id]?.totalElements > 0) && (
                                                            <div className="group-comments-list">
                                                                {commentLoading[post.id] && (
                                                                    <div className="comments-loading">
                                                                        <div className="comments-loading-spinner"></div>
                                                                        <p>Đang tải nhận xét...</p>
                                                                    </div>
                                                                )}
                                                                
                                                                {!commentLoading[post.id] && postComments[post.id]?.length === 0 && (
                                                                    <div className="no-comments">
                                                                        <p>Chưa có nhận xét nào</p>
                                                                    </div>
                                                                )}
                                                                
                                                                {!commentLoading[post.id] && postComments[post.id]?.map((comment) => (
                                                                    <div key={comment.commentId} className="group-comment-item">
                                                                        <div className="group-comment-avatar-container">
                                                                            {commentAvatarUrls[comment.commentId] ? (
                                                                                <img 
                                                                                    src={commentAvatarUrls[comment.commentId]} 
                                                                                    alt="Avatar" 
                                                                                    className="group-comment-avatar-small"
                                                                                />
                                                                            ) : comment.avatar ? (
                                                                                <img 
                                                                                    src={`${API_BASE_URL}${comment.avatar}`} 
                                                                                    alt="Avatar" 
                                                                                    className="group-comment-avatar-small"
                                                                                    onError={(e) => {
                                                                                        e.target.onerror = null;
                                                                                        e.target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <div className="comment-avatar-circle" style={{marginRight: '0'}}>
                                                                                    {comment.fullname?.charAt(0) || '?'}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="group-comment-content">
                                                                            <div className="group-comment-header">
                                                                                <span className="group-comment-author">{comment.fullname || 'Người dùng'}</span>
                                                                                <span className="group-comment-time">{formatCommentTime(comment.createdDate)}</span>
                                                                            </div>
                                                                            <div className="group-comment-text">{comment.detail}</div>
                                                                            <div className="group-comment-actions">
                                                                                {comment.countOfReply > 0 && (
                                                                                    <button 
                                                                                        className="group-comment-show-replies-btn"
                                                                                        onClick={() => toggleCommentReplies(comment.commentId)}
                                                                                    >
                                                                                        {comment.showReplies ? 'Ẩn trả lời' : `Xem ${comment.countOfReply} trả lời`}
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                            
                                                                            {/* Display replies if available and showReplies is true */}
                                                                            {comment.showReplies && (
                                                                                <div className="group-comment-replies">
                                                                                    {comment.loadingReplies ? (
                                                                                        <div className="group-reply-loading">
                                                                                            <div className="group-reply-loading-spinner"></div>
                                                                                            <p>Đang tải trả lời...</p>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <>
                                                                                            {comment.replies && comment.replies.length > 0 ? (
                                                                                                <>
                                                                                                    {comment.replies.map(reply => (
                                                                                                        <div key={reply.commentId} className="group-reply-item">
                                                                                                            <div className="comment-avatar-container">
                                                                                                                {commentAvatarUrls[reply.commentId] ? (
                                                                                                                    <img 
                                                                                                                        src={commentAvatarUrls[reply.commentId]} 
                                                                                                                        alt="Avatar" 
                                                                                                                        className="group-comment-avatar-small"
                                                                                                                        onError={(e) => {
                                                                                                                            e.target.onerror = null;
                                                                                                                            e.target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                                                                                                                            console.error(`Failed to load avatar for reply ${reply.commentId} (${reply.username})`);
                                                                                                                        }}
                                                                                                                    />
                                                                                                                ) : reply.avatar ? (
                                                                                                                    <img 
                                                                                                                        src={`${API_BASE_URL}${reply.avatar}`} 
                                                                                                                        alt="Avatar" 
                                                                                                                        className="group-comment-avatar-small"
                                                                                                                        onLoad={() => {
                                                                                                                            // Khi ảnh tải xong, lưu vào cache với username
                                                                                                                            console.log(`Avatar loaded from API for ${reply.commentId} (${reply.username})`);
                                                                                                                            setCommentAvatarUrls(prev => ({
                                                                                                                                ...prev,
                                                                                                                                [reply.commentId]: `${API_BASE_URL}${reply.avatar}`
                                                                                                                            }));
                                                                                                                        }}
                                                                                                                        onError={(e) => {
                                                                                                                            e.target.onerror = null;
                                                                                                                            e.target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                                                                                                                            console.error(`Failed to load avatar for reply ${reply.commentId} (${reply.username})`);
                                                                                                                        }}
                                                                                                                    />
                                                                                                                ) : reply.username === teacherInfo.email && teacherAvatarUrl ? (
                                                                                                                    // Nếu là reply của giáo viên hiện tại
                                                                                                                    <img 
                                                                                                                        src={teacherAvatarUrl} 
                                                                                                                        alt="Avatar" 
                                                                                                                        className="group-comment-avatar-small"
                                                                                                                        onError={(e) => {
                                                                                                                            e.target.onerror = null;
                                                                                                                            e.target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                                                                                                                        }}
                                                                                                                    />
                                                                                                                ) : (
                                                                                                                    <div className="comment-avatar-circle" style={{marginRight: '0'}}>
                                                                                                                        {reply.fullname?.charAt(0) || '?'}
                                                                                                                    </div>
                                                                                                                )}
                                                                                                            </div>
                                                                                                            <div className="group-reply-content">
                                                                                                                <div className="group-comment-header">
                                                                                                                    <span className="group-comment-author">{reply.fullname || reply.username || 'Người dùng'}</span>
                                                                                                                    <span className="group-comment-time">{formatCommentTime(reply.createdDate)}</span>
                                                                                                                </div>
                                                                                                                <div className="group-comment-text">
                                                                                                                    {reply.replyToUsername && (
                                                                                                                        <span className="reply-mention">@{reply.replyToFullname || reply.replyToUsername}</span>
                                                                                                                    )}
                                                                                                                    {reply.detail}
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    ))}
                                                                                                    
                                                                                                    {/* Nút tải thêm replies */}
                                                                                                    {comment.replyPagination && 
                                                                                                    comment.replyPagination.number < comment.replyPagination.totalPages - 1 && (
                                                                                                        <button 
                                                                                                            className="group-load-more-replies-btn"
                                                                                                            onClick={() => loadMoreReplies(comment.commentId)}
                                                                                                        >
                                                                                                            Tải thêm trả lời
                                                                                                        </button>
                                                                                                    )}
                                                                                                </>
                                                                                            ) : (
                                                                                                // Only show "No replies" if we've confirmed there are no replies
                                                                                                // from the server (replies array exists but is empty)
                                                                                                <div className="no-replies">
                                                                                                    <p>{comment.replies && comment.countOfReply === 0 ? 'Chưa có trả lời nào' : 'Đang tải trả lời...'}</p>
                                                                                                </div>
                                                                                            )}
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="comment-menu-container">
                                                                            <button 
                                                                                className="comment-menu-btn" 
                                                                                onClick={() => toggleCommentMenu(comment.commentId)}
                                                                                aria-label="Menu bình luận"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                                    <circle cx="12" cy="12" r="1"></circle>
                                                                                    <circle cx="12" cy="5" r="1"></circle>
                                                                                    <circle cx="12" cy="19" r="1"></circle>
                                                                                </svg>
                                                                            </button>
                                                                            {(activeCommentMenu === comment.commentId || closingCommentMenu === comment.commentId) && (
                                                                                <div className={`comment-options-menu ${closingCommentMenu === comment.commentId ? 'comment-options-menu-exit' : ''}`}>
                                                                                    <button 
                                                                                        className="comment-option-item comment-reply-option"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleReplyToComment(comment, post.id);
                                                                                            toggleCommentMenu(comment.commentId);
                                                                                        }}
                                                                                    >
                                                                                        Trả lời
                                                                                    </button>
                                                                                    <button 
                                                                                        className="comment-option-item comment-edit-option"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleEditComment(comment);
                                                                                            toggleCommentMenu(comment.commentId);
                                                                                        }}
                                                                                    >
                                                                                        Chỉnh sửa
                                                                                    </button>
                                                                                    <button 
                                                                                        className="comment-option-item comment-delete-option"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleDeleteComment(comment);
                                                                                            toggleCommentMenu(comment.commentId);
                                                                                        }}
                                                                                    >
                                                                                        Xóa
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                
                                                                {/* Load more comments button */}
                                                                {!commentLoading[post.id] && 
                                                                postComments[post.id]?.length > 0 && 
                                                                commentPagination[post.id]?.pageNumber < commentPagination[post.id]?.totalPages - 1 && (
                                                                    <div className="load-more-comments">
                                                                        <button onClick={() => loadMoreComments(post.id)}>
                                                                            Xem thêm nhận xét
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="group-comment-section">
                                                            {teacherAvatarUrl ? (
                                                                <img src={teacherAvatarUrl} alt="Avatar" className='comment-avatar'/>
                                                            ) : (
                                                                <img src='https://randomuser.me/api/portraits/men/1.jpg' className='comment-avatar'/>
                                                            )}
                                                            <div className={`comment-input-container post-id-${post.id}`}>
                                                                <input
                                                                    type="text"
                                                                    className="group-comment-input"
                                                                    placeholder={replyToComment ? `Trả lời ${replyToComment.fullname || replyToComment.username}...` : "Thêm nhận xét trong lớp học..."}
                                                                    value={commentInput[post.id] || ''}
                                                                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                                                    onKeyPress={(e) => replyToComment ? 
                                                                        handleCommentReply(post.id, replyToComment, e) : 
                                                                        handleCommentSubmit(post.id, e)
                                                                    }
                                                                />
                                                                <button 
                                                                    className="comment-send-button"
                                                                    onClick={(e) => {
                                                                        if (commentInput[post.id]?.trim()) {
                                                                            if (replyToComment) {
                                                                                handleCommentReply(post.id, replyToComment, { key: 'Enter' });
                                                                            } else {
                                                                                handleCommentSubmit(post.id, { key: 'Enter' });
                                                                            }
                                                                        }
                                                                    }}
                                                                    aria-label="Gửi nhận xét"
                                                                    disabled={!commentInput[post.id]?.trim()}
                                                                >
                                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="#5F6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    
                                                </>
                                            ))}
                                            
                                            {/* Hiển thị nút "Tải thêm bài đăng" nếu còn trang để tải */}
                                            {pagination.pageNumber < pagination.totalPages - 1 && pagination.totalPages > 1 && (
                                                <div className="load-more-container">
                                                    <button 
                                                        className="load-more-btn"
                                                        onClick={handleLoadMorePosts}
                                                        disabled={postLoading}
                                                    >
                                                        {postLoading ? (
                                                            <>
                                                                <span className="spinner-border-sm"></span>
                                                                Đang tải...
                                                            </>
                                                        ) : (
                                                            'Tải thêm bài đăng'
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="no-posts">
                                            <div className='no-posts-icon'>
                                                <svg viewBox="0 0 241 149" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="Fnu4gf">
                                                    <path d="M138.19 145.143L136.835 145.664C134.646 146.498 132.249 145.352 131.519 143.164L82.4271 8.37444C81.5933 6.18697 82.7398 3.79117 84.9286 3.06201L86.2836 2.54118C88.4724 1.70786 90.8697 2.85368 91.5993 5.04115L140.691 139.831C141.421 142.018 140.379 144.414 138.19 145.143Z" stroke="#5F6368" stroke-width="2"></path>
                                                    <path d="M76.6602 10.5686C78.2029 12.2516 83.3923 14.7762 88.4414 13.0932C98.5395 9.72709 96.8565 2.57422 96.8565 2.57422" stroke="#5F6368" stroke-width="2" stroke-linecap="round"></path>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M60.1224 147.643C94.7266 135.143 112.55 96.9147 99.938 62.4361C87.4305 27.8532 49.1783 10.1451 14.5742 22.6449L60.1224 147.643ZM65.855 98.4772C77.3203 94.3106 83.2613 81.4983 79.0922 70.0401C74.923 58.4777 62.207 52.5403 50.6376 56.8111L65.855 98.4772Z" fill="#CEEAD6" class="rTGbBf"></path>
                                                    <path d="M58.1473 128.38L52.2567 130.905M52.2567 110.288L45.5246 112.812M44.6831 92.6157L39.2132 94.7195M38.3717 74.5232L32.9019 76.6269M32.4811 56.4306L26.5905 58.5344M25.749 38.7588L19.8584 40.8626" stroke="white" stroke-width="2" stroke-linecap="round"></path>
                                                    <path d="M87.5996 128.38C94.472 121.227 105.86 101.199 103.168 78.3098C100.475 55.4206 89.7034 42.1247 84.6543 38.3379" stroke="#5F6368" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                                    <path d="M225.952 147.956H157.994C154.554 147.956 151.74 145.143 151.74 141.706V73.79C151.74 70.3525 154.554 67.54 157.994 67.54H225.952C229.391 67.54 232.205 70.3525 232.205 73.79V141.706C232.205 145.247 229.495 147.956 225.952 147.956Z" stroke="#5F6368" stroke-width="2"></path>
                                                    <path d="M232.205 73.79C232.205 70.3525 229.391 67.54 225.952 67.54H157.994C154.554 67.54 151.74 70.3525 151.74 73.79V100.977L232.205 81.4982V73.79Z" fill="#5F6368"></path>
                                                    <path d="M191.66 131.497C204.957 131.497 215.737 120.724 215.737 107.435C215.737 94.146 204.957 83.373 191.66 83.373C178.363 83.373 167.583 94.146 167.583 107.435C167.583 120.724 178.363 131.497 191.66 131.497Z" fill="white" stroke="#5F6368" stroke-width="2"></path>
                                                    <path d="M211.303 90.0912L207.095 93.4573M191.527 82.5176V87.1459M174.697 88.8289L178.063 93.4573M165.44 106.921L170.91 107.763M178.063 122.49L174.697 126.697M191.527 128.801V133.429M205.833 122.49L209.62 126.697M213.407 107.763H218.456" stroke="#5F6368" stroke-width="2" stroke-linecap="round"></path>
                                                    <path d="M191.66 114.935C195.804 114.935 199.164 111.578 199.164 107.435C199.164 103.293 195.804 99.9355 191.66 99.9355C187.515 99.9355 184.155 103.293 184.155 107.435C184.155 111.578 187.515 114.935 191.66 114.935Z" fill="#5F6368"></path>
                                                    <path d="M10.7177 130.977C12.698 130.977 12.698 127.852 10.7177 127.852C8.73733 127.852 8.73733 130.977 10.7177 130.977Z" fill="#5F6368"></path>
                                                    <path d="M19.4368 106.921L8.49707 82.0967" stroke="#5F6368" stroke-width="2" stroke-linecap="round"></path>
                                                    <path d="M13.126 93.0719C13.126 90.9273 13.5467 89.2442 14.7268 87.1405C17.0871 82.9328 22.162 83.7743 22.8034 86.3398C23.2241 88.0229 22.3005 91.7688 19.7759 93.072C16.8301 94.5926 14.809 94.755 13.9675 94.755" stroke="#5F6368" stroke-width="2" stroke-linecap="round"></path>
                                                    <path d="M13.2331 93.6244C11.8849 91.9565 10.4997 90.9119 8.25948 90.0176C3.77892 88.2289 0.360966 92.0735 1.47485 94.4719C2.20559 96.0453 3.84062 97.8046 8.06124 97.8046C11.3764 97.8046 12.9821 95.9913 13.6366 95.4624" stroke="#5F6368" stroke-width="2" stroke-linecap="round"></path>
                                                    <path d="M26.5609 148.997C39.7431 148.997 50.4294 138.317 50.4294 125.143C50.4294 111.969 39.7431 101.289 26.5609 101.289C13.3787 101.289 2.69238 111.969 2.69238 125.143C2.69238 138.317 13.3787 148.997 26.5609 148.997Z" fill="#DADCE0"></path>
                                                    <path d="M16.8671 139.622C18.8475 139.622 18.8475 136.497 16.8671 136.497C14.8867 136.497 14.8867 139.622 16.8671 139.622Z" fill="#5F6368"></path>
                                                    <path d="M21.245 131.81C23.2254 131.81 23.2254 128.685 21.245 128.685C19.2647 128.685 19.2647 131.81 21.245 131.81Z" fill="#5F6368"></path>
                                                    <path d="M29.3749 138.685C31.3553 138.685 31.3553 135.56 29.3749 135.56C27.3946 135.56 27.3946 138.685 29.3749 138.685Z" fill="#5F6368"></path>
                                                    <path d="M23.538 143.477C25.5184 143.477 25.5184 140.352 23.538 140.352C21.5576 140.352 21.5576 143.477 23.538 143.477Z" fill="#5F6368"></path>
                                                    <path d="M18.3261 102.748C5.92283 107.227 -0.435161 120.977 4.0467 133.373C5.29745 136.914 7.38204 139.935 9.98777 142.435L34.0647 102.54C29.0617 100.873 23.6418 100.769 18.3261 102.748Z" fill="#5F6368"></path>
                                                    <path d="M149.451 35.8135C150.433 41.143 154.921 51.129 163.336 48.4362C171.751 45.7433 168.666 35.1122 165.861 29.9229" stroke="#5F6368" stroke-width="2" stroke-linecap="round"></path>
                                                    <path d="M167.374 31.082L148.926 37.4361C147.154 32.332 149.864 26.8112 154.971 25.0404C160.078 23.2696 165.602 25.9779 167.374 31.082Z" fill="#1E8E3E" class="P5VoX"></path>
                                                    <path d="M199.581 23.0616L194.474 8.99933C195.933 7.95767 197.184 6.60353 198.122 5.04105C198.539 4.31189 198.956 3.47857 198.956 2.64525C198.956 1.81193 198.33 0.87444 197.497 0.87444C197.184 0.87444 196.871 0.978606 196.559 1.08277C194.474 1.91609 193.119 3.89523 191.972 5.87437L189.784 6.70769C190.201 4.52022 189.575 2.12442 188.116 0.45778C187.907 0.249449 187.803 0.145284 187.491 0.0411187C186.969 -0.167212 186.448 0.45778 186.136 0.978606C184.885 3.16607 184.781 5.87437 185.614 8.27017L168.104 14.6242C165.811 15.4576 164.56 18.0617 165.394 20.3533L166.228 22.7491C166.957 24.8324 169.25 25.8741 171.335 25.1449L174.045 32.5407C171.231 33.0615 168.625 34.7281 166.228 36.3948C165.186 37.1239 164.143 37.9573 164.247 39.3114C164.352 40.4572 165.186 41.2905 166.228 41.7072C168.104 42.3322 169.876 41.603 171.648 40.978C173.211 40.3531 174.879 39.7281 176.442 39.1031L176.859 40.3531C173.732 43.0614 171.752 47.1238 171.752 51.6029C171.752 56.3945 173.941 60.6653 177.485 63.3736C175.713 63.5819 173.837 64.1027 172.273 64.936C171.752 65.1444 171.335 65.4569 171.127 65.9777C170.71 66.811 171.439 67.8527 172.377 68.1652C173.315 68.4777 174.253 68.2693 175.192 68.061C176.963 67.7485 184.676 67.2277 188.637 66.4985C194.474 66.4985 212.714 66.4985 216.258 66.4985C224.596 66.4985 231.267 56.8112 231.267 48.4779C231.267 43.478 228.765 38.9989 224.909 36.2906C224.596 30.4574 230.225 31.3948 231.996 31.7073C234.185 32.2282 236.374 33.8948 238.459 32.3323C239.293 31.7073 239.709 30.6657 239.918 29.7282C245.338 7.43685 204.688 -2.97967 199.581 23.0616Z" fill="#DADCE0"></path>
                                                    <path d="M185.302 16.0826C186.108 16.0826 186.761 15.4297 186.761 14.6243C186.761 13.8189 186.108 13.166 185.302 13.166C184.496 13.166 183.843 13.8189 183.843 14.6243C183.843 15.4297 184.496 16.0826 185.302 16.0826Z" fill="#5F6368"></path>
                                                    <path d="M211.303 27.3983C213.406 25.7153 218.96 22.8541 224.346 24.8738C229.732 26.8934 232.2 30.7644 232.761 32.4474M211.303 20.2454C213.266 18.0014 219.044 14.3548 226.45 17.7209C231.359 19.9521 236.969 24.8738 239.073 31.1852M200.363 21.9285C199.942 23.4713 199.101 27.4825 199.101 31.1852C199.101 34.8878 199.942 40.0211 200.363 42.1248" stroke="#5F6368" stroke-width="2" stroke-linecap="round"></path>
                                                    <path d="M165.172 18.1085L168.233 16.9138" stroke="#5F6368" stroke-width="2" stroke-linecap="round"></path>
                                                    <path d="M172.172 67.3701H216.351" stroke="#5F6368" stroke-width="2" stroke-linecap="round"></path>
                                                    <path d="M135.145 49.6982L127.151 65.687M116.211 11.8301L118.735 36.6548" stroke="#5F6368" stroke-width="2" stroke-linecap="round"></path>
                                                    
                                                </svg>
                                            </div>
                                            <div>
                                                <h2 className='no-posts-title'>Đây là nơi bạn giao tiếp với group của mình</h2>
                                                <p className='no-posts-subtitle'>Sử dụng bảng tin để thông báo, đăng bài tập và trả lời câu hỏi của sinh viên</p>
                                            </div>
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
                        {/* Nút tạo bài kiểm tra */}
                        <div className="tasks-header">
                            <button 
                                className="create-task-button"
                                onClick={handleCreateTask}
                            >
                                <Plus size={20} />
                                <span>Tạo bài kiểm tra</span>
                            </button>
                        </div>
                        
                        {/* Loading và Error */}
                        {testsLoading && (
                            <div className="tests-loading">
                                <div className="tests-loading-spinner"></div>
                                <p>Đang tải danh sách bài kiểm tra...</p>
                            </div>
                        )}
                        
                        {testsError && (
                            <div className="tests-error">
                                <p>{testsError}</p>
                                <button onClick={fetchTests}>Thử lại</button>
                            </div>
                        )}
                        
                        {/* Danh sách bài kiểm tra */}
                        {!testsLoading && !testsError && (
                            <>
                                <div className="tasks-list">
                                    {tests.length > 0 ? (
                                        tests.map((test) => (
                                            <div 
                                                className="task-item" 
                                                key={test.id} 
                                                onClick={() => handleTaskClick(test.id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="task-icon">
                                                    <NotepadText size={24}/>
                                                </div>
                                                <div className="task-details">
                                                    <div className="task-title">{test.title}</div>
                                                    <div className="task-deadline">
                                                        {test.expiredAt 
                                                            ? `Đến hạn ${formatDateTime(test.expiredAt).split(',')[0]}` 
                                                            : 'Không có ngày đến hạn'}
                                                    </div>
                                                </div>
                                                <div className="task-actions">
                                                    <button 
                                                        className="task-more-options"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleTestMenu(test.id);
                                                        }}
                                                    >
                                                        <EllipsisVertical size={20}/>
                                                    </button>
                                                    {(activeTestMenu === test.id || closingTestMenu === test.id) && (
                                                        <div className={`test-options-menu ${closingTestMenu === test.id ? 'test-options-menu-exit' : ''}`}>
                                                            <button 
                                                                className="test-option-item test-delete-button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setTestToDelete(test.id);
                                                                    setShowDeleteTestConfirm(true);
                                                                    setActiveTestMenu(null);
                                                                }}
                                                            >
                                                                <Trash2 size={16} />
                                                                Xóa
                                                            </button>
                                                            <button 
                                                                className="test-option-item test-reuse-button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // TODO: Implement reuse functionality
                                                                    setActiveTestMenu(null);
                                                                }}
                                                            >
                                                                <FileText size={16} />
                                                                Sử dụng lại bài kiểm tra
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-tasks">
                                            <p>Chưa có bài kiểm tra nào trong nhóm này</p>
                                            <p>Nhấn vào nút "Tạo bài kiểm tra" để tạo bài kiểm tra mới</p>
                                </div>
                                    )}
                                </div>
                                
                                {/* Nút tải thêm bài kiểm tra */}
                                {testsPagination.pageNumber < testsPagination.totalPages - 1 && (
                                    <div className="load-more-container">
                                        <button 
                                            className="load-more-btn"
                                            onClick={handleLoadMoreTests}
                                            disabled={testsLoading}
                                        >
                                            {testsLoading ? (
                                                <>
                                                    <span className="spinner-border-sm"></span>
                                                    Đang tải...
                                                </>
                                            ) : (
                                                'Tải thêm bài kiểm tra'
                                            )}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );
            case 'people':
                return (
                    <div className="people-content">
                        <div className="people-section" style={{marginBottom: '12px'}}>
                            <div className="group-section-header">
                                <h3>Giáo Viên</h3>
                            </div>
                            <div className="people-list teacher-list">
                                <div className="teacher-item">
                                    <div className="person-avatar">
                                        {teacherAvatarUrl ? (
                                            <img src={teacherAvatarUrl} alt="Avatar"/>
                                        ) : (
                                            <img src='https://randomuser.me/api/portraits/men/1.jpg'/>
                                        )}
                                    </div>
                                    <div className='person-info'>
                                    <div className="person-name">
                                            {selectedGroup.teacher?.fullName || 'Giáo viên'}
                                        </div>
                                        <div className="person-email">
                                            {selectedGroup.teacher?.email || ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                
                        <div className="people-section">
                            <div className="group-section-header">
                                <h3>Sinh Viên</h3>
                                <div className="student-actions-container">
                                    <button className="add-student-group-btn" onClick={() => navigate(`/teacher/groups/${id}/add-students`)}>
                                        <UserPlus size={20} enableBackground={0}/>
                                    </button>
                                </div>
                            </div>
                            <div className="people-list-container">
                                {studentsLoading && (
                                    <div className="students-loading">
                                        <div className="students-loading-spinner"></div>
                                        <p>Đang tải danh sách sinh viên...</p>
                                        </div>
                                )}
                                
                                {studentsError && (
                                    <div className="students-error">
                                        <p>{studentsError}</p>
                                        <button onClick={fetchStudents}>Thử lại</button>
                                        </div>
                                )}
                                
                                {!studentsLoading && !studentsError && (
                                    <>
                                        {students.length > 0 && (
                                        <div className="select-all-container">
                                            <label className="select-all-checkbox">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectAll}
                                                    onChange={handleSelectAllStudents}
                                                />
                                                {selectedStudents.length > 0 && (
                                                    <div className="action-menu-container">
                                                        <button 
                                                            className="action-menu-button" 
                                                            onClick={toggleActionMenu}
                                                            disabled={selectedStudents.length === 0}
                                                        >
                                                            Thao tác
                                                        </button>
                                                        {actionMenuOpen && (
                                                            <div className="action-menu">
                                                                <button 
                                                                    className="action-menu-item delete-action"
                                                                    onClick={openDeleteConfirmation}
                                                                >
                                                                    <Trash2 size={16} />
                                                                    <span>Xóa</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                        )}

                                        <div className="people-list student-list">
                                            {students.length > 0 ? (
                                                students.map((student, index) => {
                                                    const isSelected = selectedStudents.includes(student.id);
                                                    return (
                                                        <div 
                                                            className={`person-item ${isSelected ? 'selected' : ''}`} 
                                                            key={student.id || index}
                                                        >
                                                            <div className="person-checkbox">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={isSelected}
                                                                    onChange={(e) => handleSelectStudent(student.id, e.target.checked)}
                                                                />
                                                            </div>
                                                            <div className="person-avatar">
                                                                {avatarUrl[student.id] ? (
                                                                    <img src={avatarUrl[student.id]} alt="Avatar"/>
                                                                ) : (
                                                                    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                                                        <circle cx="100" cy="100" r="100" fill="#ff4757" />
                                                                        <path d="M100,40 C60,40 40,70 40,110 C40,150 60,180 100,180 C140,180 160,150 160,110 C160,70 140,40 100,40 Z" fill="#2f3542" />
                                                                        <path d="M65,90 C65,80 75,70 85,70 C95,70 100,80 100,90 C100,80 105,70 115,70 C125,70 135,80 135,90 C135,100 125,110 115,110 C105,110 100,100 100,90 C100,100 95,110 85,110 C75,110 65,100 65,90 Z" fill="#f1f2f6" />
                                                                        <path d="M70,75 C70,70 75,65 80,65 C85,65 90,70 90,75 C90,80 85,85 80,85 C75,85 70,80 70,75 Z" fill="#3742fa" />
                                                                        <path d="M110,75 C110,70 115,65 120,65 C125,65 130,70 130,75 C130,80 125,85 120,85 C115,85 110,80 110,75 Z" fill="#3742fa" />
                                                                        <path d="M65,120 C65,140 80,160 100,160 C120,160 135,140 135,120 C135,110 120,100 100,100 C80,100 65,110 65,120 Z" fill="#f1f2f6" />
                                                                        <path d="M70,110 C80,120 90,125 100,125 C110,125 120,120 130,110 C120,105 110,100 100,100 C90,100 80,105 70,110 Z" fill="#2f3542" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <div className="person-info">
                                                                <div className="person-name">
                                                                    {student.fullName || `Học sinh ${index + 1}`}
                                                                </div>
                                                                <div className="person-email">
                                                                    {student.email || ''}
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Thêm nút 3 chấm và menu xóa sinh viên */}
                                                            <div className="student-options-container">
                                                                <button 
                                                                    className="student-menu-button" 
                                                                    onClick={() => toggleStudentMenu(student.id)}
                                                                >
                                                                    <EllipsisVertical size={20}/>
                                                                </button>
                                                                {(activeStudentMenu === student.id || closingStudentMenu === student.id) && (
                                                                    <div className={`student-options-menu ${closingStudentMenu === student.id ? 'student-options-menu-exit' : ''}`}>
                                                                        <button 
                                                                            className="student-option-item student-delete-button"
                                                                            onClick={() => handleDeleteStudent(student.id)}
                                                                            disabled={studentDeleteLoading}
                                                                        >
                                                                            {studentDeleteLoading && activeStudentMenu === student.id ? 'Đang xóa...' : 'Xóa'}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="no-students">
                                                    <p>Chưa có sinh viên nào trong nhóm này</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Nút tải thêm sinh viên */}
                                        {studentsPagination.pageNumber < studentsPagination.totalPages - 1 && (
                                            <div className="load-more-container">
                                                <button 
                                                    className="load-more-btn"
                                                    onClick={handleLoadMoreStudents}
                                                    disabled={studentsLoading}
                                                >
                                                    {studentsLoading ? (
                                                        <>
                                                            <span className="spinner-border-sm"></span>
                                                            Đang tải...
                                                        </>
                                                    ) : (
                                                        'Tải thêm sinh viên'
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'marks':
                return (
                    <div className="marks-content">
                        {/* Loading state */}
                        {marksData.loading && (
                            <div className="marks-loading">
                                <div className="tests-loading-spinner"></div>
                                <p>Đang tải dữ liệu điểm số...</p>
                            </div>
                        )}
                        
                        {/* Error state */}
                        {marksData.error && (
                            <div className="marks-error">
                                <AlertCircle size={24} />
                                <p>{marksData.error}</p>
                                <button onClick={fetchMarksData}>Thử lại</button>
                            </div>
                        )}
                        
                        {/* Content when data is loaded */}
                        {!marksData.loading && !marksData.error && (
                            <div className="marks-table-container">
                                {marksData.tests.length === 0 || marksData.students.length === 0 ? (
                                    <div className="no-marks-data">
                                        {marksData.tests.length === 0 ? (
                                            <p>Chưa có bài kiểm tra nào trong nhóm này.</p>
                                        ) : (
                                            <p>Chưa có sinh viên nào trong nhóm này.</p>
                                        )}
                                    </div>
                                ) : (
                                    <table className="marks-table">
                                        <thead>
                                            <tr>
                                                <th className="student-column">Sinh viên</th>
                                                {marksData.tests.map(test => (
                                                    <th key={test.id} className="test-column">{test.title}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {marksData.students.map(student => (
                                                <tr key={student.id}>
                                                    <td className="student-cell">
                                                        <div className="student-name-cell">
                                                            {avatarUrl[student.id] ? (
                                                                <img src={avatarUrl[student.id]} alt="Avatar" className='student-avatar'/>
                                                            ) : (
                                                                <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className='student-avatar'>
                                                                    <circle cx="100" cy="100" r="100" fill="#ff4757" />
                                                                    <path d="M100,40 C60,40 40,70 40,110 C40,150 60,180 100,180 C140,180 160,150 160,110 C160,70 140,40 100,40 Z" fill="#2f3542" />
                                                                    <path d="M65,90 C65,80 75,70 85,70 C95,70 100,80 100,90 C100,80 105,70 115,70 C125,70 135,80 135,90 C135,100 125,110 115,110 C105,110 100,100 100,90 C100,100 95,110 85,110 C75,110 65,100 65,90 Z" fill="#f1f2f6" />
                                                                    <path d="M70,75 C70,70 75,65 80,65 C85,65 90,70 90,75 C90,80 85,85 80,85 C75,85 70,80 70,75 Z" fill="#3742fa" />
                                                                    <path d="M110,75 C110,70 115,65 120,65 C125,65 130,70 130,75 C130,80 125,85 120,85 C115,85 110,80 110,75 Z" fill="#3742fa" />
                                                                    <path d="M65,120 C65,140 80,160 100,160 C120,160 135,140 135,120 C135,110 120,100 100,100 C80,100 65,110 65,120 Z" fill="#f1f2f6" />
                                                                    <path d="M70,110 C80,120 90,125 100,125 C110,125 120,120 130,110 C120,105 110,100 100,100 C90,100 80,105 70,110 Z" fill="#2f3542" />
                                                                </svg>
                                                            )}
                                                            <span>{student.fullName}</span>
                                                        </div>
                                                    </td>
                                                    {marksData.tests.map(test => {
                                                        const result = marksData.results[student.id]?.[test.id];
                                                        const markId = `${student.id}-${test.id}`;
                                                        
                                                        return (
                                                            <td key={markId} className="mark-cell">
                                                                {result ? (
                                                                    <div className="mark-content">
                                                                        <div className="mark-score-container">
                                                                            <span className="mark-score-display">
                                                                                {result.score}/{result.testStudentAnswer.reduce((sum, item) => sum + item.testQuestion.point, 0)}
                                                                            </span>
                                                                            <button 
                                                                                className="mark-menu-button"
                                                                                onClick={() => toggleMarkMenu(markId)}
                                                                            >
                                                                                <EllipsisVertical size={16} />
                                                                            </button>
                                                                            
                                                                            {/* Menu tùy chọn */}
                                                                            {(activeMarkMenu === markId || closingMarkMenu === markId) && (
                                                                                <div className={`mark-options-menu ${closingMarkMenu === markId ? 'mark-options-menu-exit' : ''}`}>
                                                                                    <button 
                                                                                        className="mark-option-item mark-detail-button"
                                                                                        onClick={() => viewStudentTestDetail(test.id, student.id, result.id)}
                                                                                    >
                                                                                        <Search size={14} />
                                                                                        Chi tiết
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="no-attempt">
                                                                        Thiếu
                                                                    </span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>
                );
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

    // Thêm state để quản lý modal chỉnh sửa bài đăng
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editPostId, setEditPostId] = useState(null);
    const [editPostText, setEditPostText] = useState('');
    const [editSelectedFiles, setEditSelectedFiles] = useState([]);
    const [editExistingFiles, setEditExistingFiles] = useState([]);
    const [editLoading, setEditLoading] = useState(false);
    const [editActiveFormats, setEditActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        list: false
    });

    // Hàm để xử lý khi mở modal chỉnh sửa
    const openEditModal = (post) => {
        console.log("Initializing modal for post:", post.id);
        
        if (!post || editModalOpen) {
            console.warn("Cannot open modal: post is null or modal is already open");
            return;
        }
        
        // Đặt các state cho modal edit
        setEditPostId(post.id);
        setEditPostText(post.text || '');
        
        // Lưu danh sách file hiện có từ bài đăng
        if (Array.isArray(post.files) && post.files.length > 0) {
            // Đảm bảo rằng mỗi file có ID
            const existingFiles = post.files.map(file => {
                // Nếu file đã có ID, sử dụng luôn
                if (file.id) return file;
                
                // Nếu không có ID nhưng có fileUrl, tạo ID từ fileUrl
                if (file.fileUrl) {
                    return {
                        ...file,
                        id: file.fileUrl.split('/').pop() // Lấy phần cuối của URL làm ID
                    };
                }
                
                // Trường hợp khác, tạo ID tạm thời
                return {
                    ...file,
                    id: `temp-file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                };
            });
            
            console.log("Existing files for editing:", existingFiles.length);
            setEditExistingFiles(existingFiles);
        } else {
            console.log("No existing files for this post");
            setEditExistingFiles([]);
        }
        
        // Reset files mới
        setEditSelectedFiles([]);
        
        // Reset các trạng thái format
        setEditActiveFormats({
            bold: false,
            italic: false,
            underline: false,
            list: false
        });
        
        // Hiển thị modal sau khi đã thiết lập tất cả state cần thiết
        requestAnimationFrame(() => {
            setEditModalOpen(true);
        });
    };

    // Hàm để đóng modal chỉnh sửa
    const closeEditModal = () => {
        console.log("Closing edit modal");
        
        // Đóng modal
        setEditModalOpen(false);
        
        // Sau khi đóng modal mới reset các state khác
        setTimeout(() => {
            setEditPostId(null);
            setEditPostText('');
            setEditSelectedFiles([]);
            setEditExistingFiles([]);
            setEditActiveFormats({
                bold: false,
                italic: false,
                underline: false,
                list: false
            });
        }, 100);
    };
    
    // Hàm để xử lý cập nhật bài đăng
    const handleUpdatePost = async ({ text, newFiles, existingFiles }) => {
        if (!editPostId) return;
        
        try {
            setEditLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Tạo FormData để gửi dữ liệu cập nhật
            const formData = new FormData();
            formData.append('postId', editPostId);
            formData.append('title', ''); // Có thể để trống hoặc điền title nếu có
            formData.append('text', text); // Sử dụng text từ tham số
            
            // Thêm các oldFileIds[] cho file hiện tại muốn giữ lại
            if (existingFiles && existingFiles.length > 0) {
                existingFiles.forEach((file, idx) => {
                    formData.append(`oldFileIds[${idx}]`, file.id);
                });
            }
            
            // Thêm các fileUploadRequests[] cho các file mới
            if (newFiles && newFiles.length > 0) {
                // Gửi từng file mới
                newFiles.forEach((file, idx) => {
                    // Thêm file - đây là trường MultipartFile trong FileUploadRequest
                    formData.append(`fileUploadRequests[${idx}].file`, file);
                    
                    // Xác định type - đây là trường String trong FileUploadRequest
                    const mimeType = file.type;
                    let type = 'file';
                    if (mimeType.startsWith('image/')) type = 'image';
                    else if (mimeType.startsWith('video/')) type = 'video';
                    formData.append(`fileUploadRequests[${idx}].type`, type);
                });
            }
            
            // Debug - kiểm tra dữ liệu đang gửi đi
            console.log("Sending update for post:", editPostId);
            console.log("New files to upload:", newFiles?.length || 0);
            console.log("Existing files to keep:", existingFiles?.length || 0);
            
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
            }
            
            // Gọi API cập nhật bài đăng
            const response = await axios.put(
                UPDATE_POST_API,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            // Kiểm tra kết quả trả về
            if (response.data && response.data.code === 0) {
                // Đóng modal và tải lại danh sách bài đăng
                closeEditModal();
                fetchPosts(false, 0);
                showAlert('success', 'Thành công', 'Cập nhật bài đăng thành công');
            } else {
                showAlert('error', 'Lỗi', response.data?.message || 'Cập nhật bài đăng thất bại');
            }
        } catch (error) {
            console.error('Error updating post:', error);
            showAlert('error', 'Lỗi', 'Cập nhật bài đăng thất bại. Vui lòng thử lại sau.');
        } finally {
            setEditLoading(false);
        }
    };

    // Cập nhật hàm togglePostMenu để thêm xử lý khi click vào nút chỉnh sửa
    const handleEditPost = (post, e) => {
        e.stopPropagation(); // Ngăn event bubble
        
        // Kiểm tra tránh mở modal nếu đã mở sẵn
        if (editModalOpen) {
            console.log("Modal is already open, ignoring click");
            return;
        }
        
        setActiveMenu(null); // Đóng menu
        setClosingMenu(null);
        
        console.log("Opening edit modal for post:", post.id);
        openEditModal(post); // Mở modal chỉnh sửa
    };

    // Component Modal chỉnh sửa bài đăng
    const EditPostModal = React.memo(({ 
        isOpen, 
        onClose,
        initialText,
        existingFiles,
        onSave,
        isLoading
    }) => {
        // Local state cho toàn bộ form thay vì phụ thuộc vào props từ bên ngoài
        const [text, setText] = useState('');
        const [selectedFiles, setSelectedFiles] = useState([]);
        const [remainingFiles, setRemainingFiles] = useState([]);
        const [isInputFocused, setIsInputFocused] = useState(false);
        const [validationError, setValidationError] = useState('');
        const [activeFormats, setActiveFormats] = useState({
            bold: false,
            italic: false,
            underline: false,
            list: false
        });
        
        // Refs
        const editorRef = useRef(null);
        const hasInitialized = useRef(false);
        
        // Kiểm tra nội dung có trống không
        const isContentEmpty = () => {
            // Loại bỏ HTML tags, khoảng trắng và kiểm tra có nội dung không
            const content = text.replace(/<[^>]*>/g, '').trim();
            return !content.length && !remainingFiles.length && !selectedFiles.length;
        };
        
        // Khởi tạo giá trị khi modal mở và chưa được khởi tạo
        useEffect(() => {
            if (isOpen && !hasInitialized.current) {
                console.log("Initializing local modal state");
                setText(initialText || '');
                setRemainingFiles(existingFiles || []);
                setSelectedFiles([]);
                setValidationError('');
                hasInitialized.current = true;
                
                // Reset formatting
                setActiveFormats({
                    bold: false,
                    italic: false,
                    underline: false,
                    list: false
                });
            }
        }, [isOpen, initialText, existingFiles]);
        
        // Reset khi modal đóng
        useEffect(() => {
            if (!isOpen) {
                hasInitialized.current = false;
                setValidationError('');
            }
        }, [isOpen]);
        
        // Khởi tạo content cho editor sau khi render
        useEffect(() => {
            const initializeEditor = () => {
                if (isOpen && editorRef.current && hasInitialized.current && text) {
                    try {
                        if (editorRef.current.innerHTML !== text) {
                            editorRef.current.innerHTML = text;
                        }
                    } catch (err) {
                        console.error("Error setting editor content:", err);
                    }
                }
            };
            
            // Gọi ngay lần đầu
            initializeEditor();
            
            // Và lên lịch gọi thêm lần nữa để đảm bảo
            const timer = setTimeout(initializeEditor, 100);
            return () => clearTimeout(timer);
        }, [isOpen, text]);
        
        // Handle focus khi đã có content
        useEffect(() => {
            if (isOpen && editorRef.current && text && !isInputFocused) {
                const timer = setTimeout(() => {
                    try {
                        editorRef.current.focus();
                        setIsInputFocused(!!text.trim());
                    } catch (err) {
                        console.error("Error focusing editor:", err);
                    }
                }, 200);
                return () => clearTimeout(timer);
            }
        }, [isOpen, text, isInputFocused]);
        
        // Xóa thông báo lỗi khi người dùng bắt đầu nhập
        useEffect(() => {
            if (validationError && (!isContentEmpty())) {
                setValidationError('');
            }
        }, [text, selectedFiles, remainingFiles, validationError]);
        
        // Không render khi không mở
        if (!isOpen) return null;
        
        // Xử lý thay đổi nội dung
        const handleEditorChange = () => {
            if (editorRef.current) {
                setText(editorRef.current.innerHTML);
            }
        };
        
        // Xử lý định dạng
        const handleFormatting = (command, format) => {
            document.execCommand(command, false, null);
            
            // Update active state
            setActiveFormats(prev => ({
                ...prev,
                [format]: document.queryCommandState(command)
            }));
            
            // Focus lại
            if (editorRef.current) editorRef.current.focus();
        };
        
        // Kiểm tra định dạng hiện tại
        const checkFormatting = () => {
            setActiveFormats({
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
                list: document.queryCommandState('insertUnorderedList')
            });
        };
        
        // Xử lý thêm file mới
        const handleFileChange = (event) => {
            const files = Array.from(event.target.files);
            if (files.length > 0) {
                setSelectedFiles(prev => [...prev, ...files]);
                // Xóa thông báo lỗi nếu có
                setValidationError('');
            }
        };
        
        // Xóa file mới
        const removeSelectedFile = (index) => {
            setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        };
        
        // Xóa file hiện có
        const removeExistingFile = (fileId) => {
            setRemainingFiles(prev => prev.filter(file => file.id !== fileId));
        };
        
        // Xử lý lưu
        const handleSave = () => {
            if (isContentEmpty()) {
                setValidationError('Nội dung không được để trống');
                return;
            }
            onSave({
                text,
                newFiles: selectedFiles,
                existingFiles: remainingFiles
            });
        };
        
        return (
            <div className="tgd-edit-post-modal-overlay">
                <div className="tgd-edit-post-modal">
                    <div className="tgd-edit-post-modal-header">
                        <h3>Chỉnh sửa bài đăng</h3>
                        <button 
                            className="tgd-edit-post-close-button"
                            onClick={onClose}
                        >
                            <X size={18} />
                        </button>
                    </div>
                    
                    <div className="tgd-edit-post-modal-content">
                        <div className="editor-recipient">Dành cho: Tất cả học viên</div>
                        <div
                            className={`editor ${isInputFocused ? 'active' : ''}`} 
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(editorRef.current?.textContent !== '')}
                        >
                            <div 
                                ref={editorRef}
                                className="editor-content" 
                                contentEditable="true"
                                placeholder="Chỉnh sửa thông báo nội dung cho lớp học của bạn"
                                onInput={handleEditorChange}
                                onSelect={checkFormatting}
                                onMouseUp={checkFormatting}
                                onKeyUp={checkFormatting}
                            ></div>
                            
                            <div className="editor-toolbar">
                                <button 
                                    className={`toolbar-button bold ${activeFormats.bold ? 'active' : ''}`}
                                    title="In đậm"
                                    onClick={() => handleFormatting('bold', 'bold')}
                                >
                                    B
                                </button>
                                <button 
                                    className={`toolbar-button italic ${activeFormats.italic ? 'active' : ''}`}
                                    title="In nghiêng"
                                    onClick={() => handleFormatting('italic', 'italic')}
                                >
                                    I
                                </button>
                                <button 
                                    className={`toolbar-button underline ${activeFormats.underline ? 'active' : ''}`}
                                    title="Gạch chân"
                                    onClick={() => handleFormatting('underline', 'underline')}
                                >
                                    U
                                </button>
                                <button 
                                    className={`toolbar-button list ${activeFormats.list ? 'active' : ''}`}
                                    title="Danh sách"
                                    onClick={() => handleFormatting('insertUnorderedList', 'list')}
                                >
                                    ☰
                                </button>
                                <button
                                    className="toolbar-button upload-file"
                                    title="Tải lên tệp"
                                    onClick={() => document.getElementById('edit-file-input').click()}
                                >
                                    <Upload size={16}/>
                                </button>
                                <input
                                    id="edit-file-input"
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                    multiple
                                />
                            </div>
                        </div>
                        
                        {/* Hiển thị danh sách file hiện có */}
                        {remainingFiles.length > 0 && (
                            <div className="edit-existing-files">
                                <div className="selected-file-card">
                                    {remainingFiles.map((file) => (
                                        <div className="file-attachment-preview" key={file.id}>
                                            <div className="file-preview-icon">
                                                {file.fileType === 'image' ? <Image size={20} /> : 
                                                 file.fileType === 'video' ? <Video size={20} /> : 
                                                 <FileText size={20} />}
                                            </div>
                                            <div className="file-preview-details">
                                                <div className="file-preview-name">{file.fileName}</div>
                                                <div className="file-preview-type">{file.fileType || 'File'}</div>
                                            </div>
                                            <div className="file-preview-actions">
                                                <button 
                                                    className="file-remove-button" 
                                                    onClick={() => removeExistingFile(file.id)}
                                                    title="Xóa file"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Hiển thị danh sách file mới đã chọn */}
                        {selectedFiles.length > 0 && (
                            <div className="edit-new-files">
                                <h4>File mới thêm</h4>
                                <div className="selected-file-card">
                                    {selectedFiles.map((file, idx) => (
                                        <div className="file-attachment-preview" key={idx}>
                                            <div className="file-preview-icon">
                                                <img 
                                                    src={getFileIconUrl(file.type, getFileExtension(file.name))} 
                                                    alt="File icon" 
                                                />
                                            </div>
                                            <div className="file-preview-details">
                                                <div className="file-preview-name">{file.name}</div>
                                                <div className="file-preview-type">{getMimeTypeDescription(file.type)}</div>
                                            </div>
                                            <div className="file-preview-actions">
                                                <button 
                                                    className="file-remove-button" 
                                                    onClick={() => removeSelectedFile(idx)}
                                                    title="Xóa file"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Hiển thị thông báo lỗi validation */}
                        {validationError && (
                            <div className="validation-error-message">
                                <AlertCircle size={16} />
                                <span>{validationError}</span>
                            </div>
                        )}
                        
                        <div className="group-editor-actions">
                            <button 
                                className="post-cancel-button" 
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Hủy
                            </button>
                            <button 
                                className="post-button" 
                                onClick={handleSave}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }, (prevProps, nextProps) => {
        // Custom comparison function để tránh re-render không cần thiết
        // Chỉ re-render khi các props quan trọng thay đổi
        return (
            prevProps.isOpen === nextProps.isOpen &&
            prevProps.initialText === nextProps.initialText &&
            prevProps.existingFiles === nextProps.existingFiles &&
            prevProps.onSave === nextProps.onSave &&
            prevProps.isLoading === nextProps.isLoading
        );
    });

    // Thêm UI cho hộp thoại xác nhận xóa
    const ConfirmationDialog = () => {
        if (!confirmDialogOpen) return null;
        
        return (
            <div className="confirmation-dialog-overlay">
                <div className="confirmation-dialog">
                    <div className="confirmation-dialog-header">
                        <h3>Xác nhận xóa</h3>
                    </div>
                    <div className="confirmation-dialog-content">
                        <p>Bạn có chắc chắn muốn xóa {selectedStudents.length} sinh viên đã chọn khỏi nhóm?</p>
                        <p className="warning-text">Lưu ý: Hành động này không thể hoàn tác.</p>
                    </div>
                    <div className="confirmation-dialog-footer">
                        <button 
                            className="cancel-button" 
                            onClick={() => setConfirmDialogOpen(false)}
                            disabled={bulkDeleteLoading}
                        >
                            Hủy
                        </button>
                        <button 
                            className="confirm-button" 
                            onClick={handleDeleteMultipleStudents}
                            disabled={bulkDeleteLoading}
                        >
                            {bulkDeleteLoading ? 'Đang xóa...' : 'Xóa'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Hàm xử lý khi bấm nút "Xem thêm bài đăng"
    const handleLoadMorePosts = () => {
        // Kiểm tra xem còn trang nào để tải tiếp không
        if (pagination.pageNumber >= pagination.totalPages - 1) {
            console.log("No more pages to load");
            return;
        }
        
        // Tăng pageNumber lên 1
        const nextPage = pagination.pageNumber + 1;
        
        console.log("Loading more posts, current page:", pagination.pageNumber, "next page:", nextPage);
        console.log("Pagination info:", pagination);
        
        // Cập nhật state pagination với pageNumber mới
        setPagination(prev => ({
            ...prev,
            pageNumber: nextPage
        }));
        
        // Gọi fetchPosts với tham số isLoadMore = true và truyền trực tiếp nextPage
        // để đảm bảo sử dụng đúng trang cần tải, không phụ thuộc vào việc state đã cập nhật hay chưa
        fetchPosts(true, nextPage);
    };

    // Thêm hàm để tải thêm sinh viên
    const handleLoadMoreStudents = () => {
        // Kiểm tra xem còn trang nào để tải tiếp không
        if (studentsPagination.pageNumber >= studentsPagination.totalPages - 1) {
            console.log("No more students pages to load");
            return;
        }
        
        // Tăng pageNumber lên 1
        const nextPage = studentsPagination.pageNumber + 1;
        
        console.log("Loading more students, current page:", studentsPagination.pageNumber, "next page:", nextPage);
        console.log("Students pagination info:", studentsPagination);
        
        // Cập nhật state pagination với pageNumber mới
        setStudentsPagination(prev => ({
            ...prev,
            pageNumber: nextPage
        }));
        
        // Gọi fetchStudents với tham số isLoadMore = true và truyền trực tiếp nextPage
        // để đảm bảo sử dụng đúng trang cần tải, không phụ thuộc vào việc state đã cập nhật hay chưa
        fetchStudents(true, nextPage);
    };

    // Thêm hàm để tải thêm bài kiểm tra
    const handleLoadMoreTests = () => {
        // Kiểm tra xem còn trang nào để tải tiếp không
        if (testsPagination.pageNumber >= testsPagination.totalPages - 1) {
            console.log("No more tests pages to load");
            return;
        }
        
        // Tăng pageNumber lên 1
        const nextPage = testsPagination.pageNumber + 1;
        
        console.log("Loading more tests, current page:", testsPagination.pageNumber, "next page:", nextPage);
        console.log("Tests pagination info:", testsPagination);
        
        // Cập nhật state pagination với pageNumber mới
        setTestsPagination(prev => ({
            ...prev,
            pageNumber: nextPage
        }));
        
        // Gọi fetchTests với tham số isLoadMore = true và truyền trực tiếp nextPage
        // để đảm bảo sử dụng đúng trang cần tải, không phụ thuộc vào việc state đã cập nhật hay chưa
        fetchTests(true, nextPage);
    };

    // Add this function after other menu toggle functions
    const toggleTestMenu = (testId) => {
        if (activeTestMenu === testId) {
            setClosingTestMenu(testId);
            setTimeout(() => {
                setActiveTestMenu(null);
                setClosingTestMenu(null);
            }, 150);
        } else {
            if (closingTestMenu) {
                setClosingTestMenu(null);
            }
            setActiveTestMenu(testId);
        }
    };

    // Add this function after other delete handlers
    const handleDeleteTest = async () => {
        if (!testToDelete || testDeleteLoading) return;
        
        try {
            setTestDeleteLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Create FormData to send testId
            const formData = new FormData();
            formData.append('testId', testToDelete);
            
            // Call API to delete test
            const response = await axios.delete(
                DELETE_TEST_API,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    data: formData
                }
            );
            
            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', 'Xóa bài kiểm tra thành công');
                // Refresh test list
                fetchTests(false, 0);
            } else {
                throw new Error(response.data?.message || 'Failed to delete test');
            }
        } catch (error) {
            console.error('Error deleting test:', error);
            showAlert('error', 'Lỗi', 'Không thể xóa bài kiểm tra. Vui lòng thử lại sau.');
        } finally {
            setTestDeleteLoading(false);
            setShowDeleteTestConfirm(false);
            setTestToDelete(null);
        }
    };

    // Add this component before the return statement
    const DeleteTestConfirmationDialog = () => {
        if (!showDeleteTestConfirm) return null;
        
        return (
            <div className="confirmation-dialog-overlay">
                <div className="confirmation-dialog">
                    <div className="confirmation-dialog-header">
                        <h3>Xác nhận xóa bài kiểm tra</h3>
                    </div>
                    <div className="confirmation-dialog-content">
                        <p>Bạn có chắc chắn muốn xóa bài kiểm tra này?</p>
                        <p className="warning-text">Lưu ý: Hành động này không thể hoàn tác.</p>
                    </div>
                    <div className="confirmation-dialog-footer">
                        <button 
                            className="cancel-button" 
                            onClick={() => {
                                setShowDeleteTestConfirm(false);
                                setTestToDelete(null);
                            }}
                            disabled={testDeleteLoading}
                        >
                            Hủy
                        </button>
                        <button 
                            className="confirm-button" 
                            onClick={handleDeleteTest}
                            disabled={testDeleteLoading}
                        >
                            {testDeleteLoading ? 'Đang xóa...' : 'Xóa'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Fetch teacher information
    const fetchTeacherInfo = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const response = await axios.get(GET_TEACHER_INFO, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data && response.data.code === 0) {
                const teacherData = response.data.result;
                setTeacherInfo({
                    id: teacherData.id,
                    email: teacherData.email,
                    fullName: teacherData.fullName,
                    avatar: teacherData.avatar
                });
                
                // Fetch avatar if available
                if (teacherData.avatar) {
                    fetchTeacherAvatar(teacherData.avatar);
                }
            }
        } catch (error) {
            console.error('Error fetching teacher info:', error);
        }
    };

    // Set up WebSocket connection
    const setupWebSocket = () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('No authentication token found for WebSocket');
                return;
            }

            // Create a new SockJS socket
            const socket = new SockJS(WS_BASE_URL);
            
            // Create a STOMP client over the socket
            const client = new Client({
                webSocketFactory: () => socket,
                debug: function(str) {
                    console.log('STOMP Debug: ' + str);
                },
                reconnectDelay: 2000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                // Add connection headers with authentication token
                connectHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Set up connect callback
            client.onConnect = (frame) => {
                console.log('Connected to WebSocket: ' + frame);
                setConnected(true);
                
                // Subscribe to post comments topic with authentication
                client.subscribe(WS_POST_COMMENTS_TOPIC, (message) => {
                    if (message.body) {
                        try {
                            const response = JSON.parse(message.body);
                            console.log('Received WebSocket message:', response);
                            if (response && response.result) {
                                handleIncomingComment(response.result);
                            }
                        } catch (error) {
                            console.error('Error parsing WebSocket message:', error);
                        }
                    }
                }, {
                    Authorization: `Bearer ${token}`
                });
            };
            
            // Set up error callback
            client.onStompError = (frame) => {
                console.error('STOMP Error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
                setConnected(false);
            };
            
            // Set up close callback
            client.onWebSocketClose = () => {
                console.log('WebSocket Connection Closed');
                setConnected(false);
            };
            
            // Activate the client
            client.activate();
            setStompClient(client);
            
        } catch (error) {
            console.error('Error setting up WebSocket:', error);
        }
    };

    // Handle incoming comment from WebSocket
    const handleIncomingComment = (commentData) => {
        console.log('Processing incoming comment:', commentData);
        
        // Check if this is a comment for a post we're currently displaying
        if (commentData && commentData.postId) {
            const postId = commentData.postId;
            
            // Fetch avatar for the incoming comment if available
            if (commentData.avatar) {
                fetchCommentAvatar(commentData.avatar, commentData.commentId);
            }
            
            // Update comments for this post
            setPostComments(prev => {
                // If we already have comments for this post
                const currentComments = prev[postId] || [];
                
                // Perform a more thorough check for duplicate comments
                // Check for same ID or very similar content posted around the same time
                const isDuplicate = currentComments.some(comment => {
                    // Check for exact ID match
                    if (comment.commentId === commentData.commentId) {
                        return true;
                    }
                    
                    // For "optimistic" comments with temp ID, check if content and author match
                    // and if the time difference is small (within 5 seconds) 
                    // ONLY check temporary comments to prevent duplicates due to network issues
                    if (comment.detail === commentData.detail && 
                        comment.username === commentData.username &&
                        comment.commentId.startsWith('temp-')) {
                        
                        const commentDate = new Date(comment.createdDate);
                        const newCommentDate = new Date(commentData.createdDate);
                        const timeDiff = Math.abs(commentDate - newCommentDate);
                        
                        // If the content is the same and posted within 5 seconds, consider it a duplicate
                        if (timeDiff < 5000) {
                            console.log('Found duplicate comment based on content and time proximity');
                            return true;
                        }
                    }
                    
                    return false;
                });
                
                if (isDuplicate) {
                    console.log(`Duplicate comment detected for post ${postId}, not adding`);
                    return prev;
                }
                
                console.log(`Adding new comment to post ${postId}`);
                // Add new comment to the beginning of the array
                return {
                    ...prev,
                    [postId]: [commentData, ...currentComments]
                };
            });
            
            // Update comment count in pagination
            setCommentPagination(prev => {
                const currentPagination = prev[postId] || {
                    pageNumber: 0,
                    pageSize: 10,
                    totalPages: 1,
                    totalElements: 0
                };
                
                // Only increment if we're actually adding a comment (not a duplicate)
                // We need to check this inside the setPostComments callback
                // For now, we'll just avoid double counting
                // A more robust solution would involve tracking if the comment was added
                
                // Increment total elements count only if not a duplicate
                // This will be slightly inaccurate but prevents overcounting
                const newTotalElements = currentPagination.totalElements + 1;
                
                // Calculate new total pages based on page size
                const pageSize = currentPagination.pageSize || 10;
                const newTotalPages = Math.ceil(newTotalElements / pageSize);
                
                console.log(`Updating pagination for post ${postId}: ${newTotalElements} comments, ${newTotalPages} pages`);
                
                return {
                    ...prev,
                    [postId]: {
                        ...currentPagination,
                        totalElements: newTotalElements,
                        totalPages: newTotalPages
                    }
                };
            });
            
            // Always ensure comments are shown for this post - comments are now always visible
            setShowComments(prev => ({
                ...prev,
                [postId]: true
            }));
        } else {
            console.warn('Received invalid comment data:', commentData);
        }
    };

    // Add states to manage comment menu, reply and edit states
    const [activeCommentMenu, setActiveCommentMenu] = useState(null);
    const [closingCommentMenu, setClosingCommentMenu] = useState(null);
    const [replyToComment, setReplyToComment] = useState(null);
    const [editingComment, setEditingComment] = useState(null);

    // Toggle comment menu
    const toggleCommentMenu = (commentId) => {
        if (activeCommentMenu === commentId) {
            // Add closing animation
            setClosingCommentMenu(commentId);
            setTimeout(() => {
                setActiveCommentMenu(null);
                setClosingCommentMenu(null);
            }, 150);
        } else {
            if (closingCommentMenu) {
                setClosingCommentMenu(null);
            }
            setActiveCommentMenu(commentId);
        }
    };

    // Handle reply to comment
    const handleReplyToComment = (comment, postId) => {
        setReplyToComment(comment);
        setEditingComment(comment);
        setActiveCommentMenu(comment.commentId);
        
        // Set the comment input to "@username " and focus on the input field
        const replyPrefix = `@${comment.fullname || comment.username} `;
        setCommentInput(prev => ({
            ...prev,
            [postId]: replyPrefix
        }));
        
        // Focus the input field and set cursor after the @mention
        setTimeout(() => {
            const inputField = document.querySelector(`.post-id-${postId} .group-comment-input`);
            if (inputField) {
                inputField.focus();
                inputField.setSelectionRange(replyPrefix.length, replyPrefix.length);
            }
        }, 50);
    };

    // Handle edit comment
    const handleEditComment = (comment) => {
        setEditingComment(comment);
        setActiveCommentMenu(comment.commentId);
    };

    // Handle delete comment
    const handleDeleteComment = (comment) => {
        setPostComments(prev => {
            const postId = comment.postId;
            const updatedComments = prev[postId].filter(c => c.commentId !== comment.commentId);
            return {
                ...prev,
                [postId]: updatedComments
            };
        });
        setEditingComment(null);
        setActiveCommentMenu(null);
    };

    // WebSocket setup for comment replies
    useEffect(() => {
        // Only set up subscription when stompClient is ready and connected
        if (stompClient && connected) {
            console.log('Setting up WebSocket subscription for comment replies');
            
            // Subscribe to comment replies topic
            const replySubscription = stompClient.subscribe(
                '/topic/comment-replies', 
                (message) => {
                    if (message.body) {
                        try {
                            const response = JSON.parse(message.body);
                            console.log('Received comment reply WebSocket message:', response);
                            if (response && response.result) {
                                handleIncomingReply(response.result);
                            }
                        } catch (error) {
                            console.error('Error parsing comment reply WebSocket message:', error);
                        }
                    }
                },
                {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`
                }
            );
            
            // Clean up subscription when component unmounts
            return () => {
                if (replySubscription) {
                    console.log('Unsubscribing from comment replies topic');
                    replySubscription.unsubscribe();
                }
            };
        }
    }, [stompClient, connected]);

    // Handle comment reply
    const handleCommentReply = async (postId, parentComment, e) => {
        if (e.key === 'Enter' && commentInput[postId]?.trim()) {
            try {
                // Check if WebSocket is connected
                if (!connected || !stompClient) {
                    showAlert('error', 'Lỗi', 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
                    return;
                }
                
                const token = localStorage.getItem('authToken');
                if (!token) {
                    showAlert('error', 'Lỗi', 'Bạn cần đăng nhập để gửi bình luận.');
                    return;
                }
                
                // Prevent rapid submissions (debounce)
                const now = Date.now();
                const lastTime = lastCommentTime[postId] || 0;
                if (now - lastTime < 2000) { // 2 seconds debounce
                    console.log('Comment reply submission throttled, please wait');
                    return;
                }
                
                // Update last comment time
                setLastCommentTime(prev => ({
                    ...prev,
                    [postId]: now
                }));
                
                // Extract actual reply text by removing the @username prefix
                let replyText = commentInput[postId];
                const mentionPrefix = `@${parentComment.fullname || parentComment.username} `;
                if (replyText.startsWith(mentionPrefix)) {
                    replyText = replyText.substring(mentionPrefix.length);
                }
                
                // Clear input
                setCommentInput(prev => ({
                    ...prev,
                    [postId]: ''
                }));
                
                // Clear the reply-to state
                setReplyToComment(null);
                
                // Create comment reply message according to the API structure
                const replyMessage = {
                    ownerUsername: parentComment.username, // Username of the comment being replied to
                    replyUsername: teacherInfo.email, // Current user's username
                    parentCommentId: parentComment.commentId, // ID of the comment being replied to
                    detail: replyText // Reply content
                };
                
                console.log('Sending comment reply via WebSocket:', replyMessage);
                
                // Send via WebSocket
                stompClient.publish({
                    destination: '/app/comment-reply', // Map to @MessageMapping("/comment-reply")
                    body: JSON.stringify(replyMessage),
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                // Generate a unique temporary ID for the optimistic reply
                const tempReplyId = `temp-reply-${Date.now()}`;
                
                // Add optimistic reply to UI - using the same format as the mapped API response
                const optimisticReply = {
                    commentId: `temp-reply-${Date.now()}`, // Temporary ID for the reply
                    parentCommentId: parentComment.commentId, // ID of the parent comment
                    username: teacherInfo.email,
                    fullname: teacherInfo.fullName,
                    avatar: teacherInfo.avatar,
                    detail: replyText,
                    createdDate: new Date().toISOString(),
                    updateDate: null,
                    countOfReply: 0,
                    isReply: true,
                    replyToUsername: parentComment.username,
                    replyToFullname: parentComment.fullname
                };
                
                // Store teacher's avatar URL for this temporary reply if available
                if (teacherAvatarUrl && optimisticReply.commentId) {
                    setCommentAvatarUrls(prev => ({
                        ...prev,
                        [optimisticReply.commentId]: teacherAvatarUrl
                    }));
                }
                
                // Add the reply to the comment's replies array or create it if it doesn't exist
                setPostComments(prev => {
                    const currentComments = prev[postId] || [];
                    
                    // Find the parent comment
                    const updatedComments = currentComments.map(comment => {
                        if (comment.commentId === parentComment.commentId) {
                            // Create or update replies array
                            const replies = comment.replies || [];
                            
                            // Ensure comment shows replies after adding a new one
                            return {
                                ...comment,
                                replies: [optimisticReply, ...replies],
                                countOfReply: (comment.countOfReply || 0) + 1,
                                showReplies: true,
                                reloadReplies: false
                            };
                        }
                        return comment;
                    });
                    
                    return {
                        ...prev,
                        [postId]: updatedComments
                    };
                });
                
            } catch (error) {
                console.error('Error submitting comment reply:', error);
                showAlert('error', 'Lỗi', 'Không thể trả lời bình luận. Vui lòng thử lại sau.');
            }
        }
    };

    // Handle incoming reply from WebSocket
    const handleIncomingReply = (replyData) => {
        console.log('Processing incoming reply:', replyData);
        
        if (!replyData || !replyData.commentId) {
            console.warn('Invalid reply data received:', replyData);
            return;
        }
        
        // Transform WebSocket reply data to match our expected format
        // Check if we're receiving data in the API format or the internal format
        const formattedReply = replyData.commentReplyId ? {
            commentId: replyData.commentReplyId, // Use the reply's ID as the commentId
            parentCommentId: replyData.commentId, // Parent comment ID
            username: replyData.usernameReply,
            fullname: replyData.fullnameReply,
            avatar: replyData.avatarReply,
            detail: replyData.detail,
            createdDate: replyData.createdDate,
            updateDate: replyData.updateDate,
            isReply: true,
            replyToUsername: replyData.usernameOwner,
            replyToFullname: replyData.fullnameOwner
        } : replyData; // If it's already in our format, use it as is
        
        console.log('Formatted reply data:', formattedReply);
        console.log('Reply username:', formattedReply.username);
        console.log('Reply fullname:', formattedReply.fullname);
        console.log('Reply avatar path:', formattedReply.avatar);
        console.log('Current teacher email:', teacherInfo?.email);
        console.log('Is reply from current teacher?', formattedReply.username === teacherInfo?.email);
        
        // Lưu thông tin người gửi reply để sử dụng sau này
        const replySender = {
            username: formattedReply.username,
            fullname: formattedReply.fullname,
            avatar: formattedReply.avatar
        };
        console.log('Reply sender info:', replySender);
        
        // Fetch avatar for the incoming reply if it has one
        if (formattedReply.avatar) {
            console.log('Fetching avatar for reply:', formattedReply.commentId);
            fetchCommentAvatar(formattedReply.avatar, formattedReply.commentId, formattedReply.username);
        } else {
            console.warn('No avatar path found for reply:', formattedReply.commentId);
            
            // Nếu không có avatar từ server, kiểm tra xem reply có phải của giáo viên hiện tại không
            if (formattedReply.username === teacherInfo.email) {
                // Nếu là reply của giáo viên hiện tại, sử dụng avatar hiện tại
                if (teacherAvatarUrl) {
                    console.log('Using teacher avatar for reply:', formattedReply.commentId);
                    setCommentAvatarUrls(prev => ({
                        ...prev,
                        [formattedReply.commentId]: teacherAvatarUrl
                    }));
                }
            }
        }
        
        // Find the post that contains the parent comment
        setPostComments(prev => {
            // Search through all posts
            let postIdWithParent = null;
            let parentComment = null;
            
            // Find which post contains the parent comment
            Object.entries(prev).forEach(([postId, comments]) => {
                const foundParent = comments.find(comment => 
                    comment.commentId === formattedReply.parentCommentId
                );
                if (foundParent) {
                    postIdWithParent = postId;
                    parentComment = foundParent;
                }
            });
            
            if (!postIdWithParent || !parentComment) {
                console.warn('Parent comment not found for reply:', formattedReply);
                return prev;
            }
            
            // Add parent comment info to reply if not already present
            if (!formattedReply.replyToUsername) {
                formattedReply.replyToUsername = parentComment.username;
                formattedReply.replyToFullname = parentComment.fullname;
            }
            
            // Check if this is a duplicate reply
            const isDuplicate = parentComment.replies?.some(reply => {
                // Kiểm tra trùng lặp ID chính xác
                if (reply.commentId === formattedReply.commentId) {
                    return true;
                }
                
                // Chỉ kiểm tra trùng lặp cho reply tạm thời để tránh duplicate do trễ mạng
                if (reply.commentId.startsWith('temp-') && 
                    reply.detail === formattedReply.detail && 
                    reply.username === formattedReply.username) {
                    
                    // Kiểm tra nếu thời gian tạo gần nhau
                    const replyDate = new Date(reply.createdDate);
                    const newReplyDate = new Date(formattedReply.createdDate);
                    const timeDiff = Math.abs(replyDate - newReplyDate);
                    
                    // Nếu thời gian tạo gần nhau trong vòng 5 giây, coi là trùng lặp
                    if (timeDiff < 5000) {
                        console.log('Found duplicate reply based on content and time proximity');
                        return true;
                    }
                }
                
                return false;
            });
            
            if (isDuplicate) {
                console.log('Duplicate reply detected, not adding');
                return prev;
            }
            
            // If replies haven't been loaded yet but there are replies available, load them
            if ((!parentComment.replies || parentComment.replies.length === 0) && 
                (parentComment.countOfReply > 0 || !parentComment.showReplies)) {
                // Do not return here, continue with the update below
                // Also trigger loading all replies for this comment
                setTimeout(() => fetchCommentReplies(formattedReply.parentCommentId), 0);
            }
            
            // Update the parent comment with the new reply
            const updatedComments = prev[postIdWithParent].map(comment => {
                if (comment.commentId === formattedReply.parentCommentId) {
                    const replies = comment.replies || [];
                    
                    // Kiểm tra xem reply đã tồn tại chưa
                    const existingReplyIndex = replies.findIndex(r => r.commentId === formattedReply.commentId);
                    
                    if (existingReplyIndex >= 0) {
                        // Nếu reply đã tồn tại, cập nhật thông tin
                        const updatedReplies = [...replies];
                        updatedReplies[existingReplyIndex] = {
                            ...updatedReplies[existingReplyIndex],
                            ...formattedReply
                        };
                        
                        return {
                            ...comment,
                            replies: updatedReplies
                        };
                    } else {
                        // Nếu là reply mới, thêm vào đầu danh sách
                        return {
                            ...comment,
                            replies: [formattedReply, ...replies],
                            countOfReply: (comment.countOfReply || 0) + 1,
                            showReplies: true,
                            reloadReplies: false
                        };
                    }
                }
                return comment;
            });
            
            return {
                ...prev,
                [postIdWithParent]: updatedComments
            };
        });
    };

    // Toggle showing replies for a comment
    const toggleCommentReplies = (commentId) => {
        setPostComments(prev => {
            // Find which post has this comment
            let targetPostId = null;
            let targetComment = null;
            
            // Search through all posts
            Object.entries(prev).forEach(([postId, comments]) => {
                comments.forEach(comment => {
                    if (comment.commentId === commentId) {
                        targetPostId = postId;
                        targetComment = comment;
                    }
                });
            });
            
            if (!targetPostId || !targetComment) {
                return prev;
            }
            
            // Toggle the showReplies property
            const updatedComments = prev[targetPostId].map(comment => {
                if (comment.commentId === commentId) {
                    const willShowReplies = !comment.showReplies;
                    
                    // Nếu đang toggle từ ẩn sang hiển thị và chưa có replies hoặc cần tải lại
                    if (willShowReplies && (!comment.replies || comment.replies.length === 0 || comment.reloadReplies)) {
                        // Gọi hàm để fetch replies
                        fetchCommentReplies(commentId);
                    }
                    
                    return {
                        ...comment,
                        showReplies: willShowReplies,
                        // Chỉ đánh dấu là cần tải lại khi comment có countOfReply > 0 nhưng chưa có replies
                        reloadReplies: willShowReplies ? false : (comment.countOfReply > 0)
                    };
                }
                return comment;
            });
            
            return {
                ...prev,
                [targetPostId]: updatedComments
            };
        });
    };

    // Hàm fetch reply comments từ API
    const fetchCommentReplies = async (commentId, pageNumber = 0) => {
        try {
            // Thiết lập loading state cho comment này
            setPostComments(prev => {
                // Tìm post và comment
                let targetPostId = null;
                let targetComment = null;
                
                Object.entries(prev).forEach(([postId, comments]) => {
                    comments.forEach(comment => {
                        if (comment.commentId === commentId) {
                            targetPostId = postId;
                            targetComment = comment;
                        }
                    });
                });
                
                if (!targetPostId) return prev;
                
                const updatedComments = prev[targetPostId].map(comment => {
                    if (comment.commentId === commentId) {
                        return { ...comment, loadingReplies: true };
                    }
                    return comment;
                });
                
                return {
                    ...prev,
                    [targetPostId]: updatedComments
                };
            });
            
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Bạn cần đăng nhập để xem trả lời bình luận');
            }
            
            // Use the GET_COMMENT_REPLIES constant from apiService.js
            // This ensures we're using the correct and consistent endpoint URL
            const response = await axios.get(GET_COMMENT_REPLIES, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'commentId': commentId,
                    'pageSize': '10',
                    'pageNumber': pageNumber.toString()
                }
            });
            
            // Change how we process the response since we're using axios now
            if (response.data && response.data.code === 0 && response.data.result) {
                const { content, page } = response.data.result;
                
                // Map API response format to the format expected by our component
                const mappedReplies = content.map(reply => ({
                    commentId: reply.commentReplyId, // Use the reply's ID as the commentId
                    parentCommentId: reply.commentId, // Store the parent comment ID
                    username: reply.usernameReply,
                    fullname: reply.fullnameReply,
                    avatar: reply.avatarReply,
                    detail: reply.detail,
                    createdDate: reply.createdDate,
                    updateDate: reply.updateDate,
                    isReply: true,
                    replyToUsername: reply.usernameOwner,
                    replyToFullname: reply.fullnameOwner
                }));
                
                // Fetch avatars for all replies
                mappedReplies.forEach(reply => {
                    if (reply.avatar) {
                        fetchCommentAvatar(reply.avatar, reply.commentId);
                    }
                });
                
                // Cập nhật replies vào state
                setPostComments(prev => {
                    // Tìm post và comment
                    let targetPostId = null;
                    
                    Object.entries(prev).forEach(([postId, comments]) => {
                        comments.forEach(comment => {
                            if (comment.commentId === commentId) {
                                targetPostId = postId;
                            }
                        });
                    });
                    
                    if (!targetPostId) return prev;
                    
                    const updatedComments = prev[targetPostId].map(comment => {
                        if (comment.commentId === commentId) {
                            // Nếu là trang đầu tiên, gán mới replies
                            // Nếu không, ghép vào replies hiện tại
                            const existingReplies = comment.replies || [];
                            const updatedReplies = pageNumber === 0 
                                ? [...mappedReplies] 
                                : [...existingReplies, ...mappedReplies];
                            
                            return { 
                                ...comment, 
                                replies: updatedReplies,
                                replyPagination: page,
                                loadingReplies: false,
                                reloadReplies: false
                            };
                        }
                        return comment;
                    });
                    
                    return {
                        ...prev,
                        [targetPostId]: updatedComments
                    };
                });
            } else {
                throw new Error(response.data?.message || 'Không thể tải trả lời bình luận');
            }
        } catch (error) {
            console.error('Error fetching comment replies:', error);
            showAlert('error', 'Lỗi', error.message || 'Không thể tải trả lời bình luận');
            
            // Xóa trạng thái loading
            setPostComments(prev => {
                // Tìm post và comment
                let targetPostId = null;
                
                Object.entries(prev).forEach(([postId, comments]) => {
                    comments.forEach(comment => {
                        if (comment.commentId === commentId) {
                            targetPostId = postId;
                        }
                    });
                });
                
                if (!targetPostId) return prev;
                
                const updatedComments = prev[targetPostId].map(comment => {
                    if (comment.commentId === commentId) {
                        return { ...comment, loadingReplies: false };
                    }
                    return comment;
                });
                
                return {
                    ...prev,
                    [targetPostId]: updatedComments
                };
            });
        }
    };

    // Hàm tải thêm replies
    const loadMoreReplies = (commentId) => {
        setPostComments(prev => {
            // Tìm post và comment
            let targetPostId = null;
            let targetComment = null;
            
            Object.entries(prev).forEach(([postId, comments]) => {
                comments.forEach(comment => {
                    if (comment.commentId === commentId) {
                        targetPostId = postId;
                        targetComment = comment;
                    }
                });
            });
            
            if (!targetPostId || !targetComment || !targetComment.replyPagination) return prev;
            
            // Kiểm tra nếu đã tải hết replies
            if (targetComment.replyPagination.number >= targetComment.replyPagination.totalPages - 1) {
                return prev;
            }
            
            // Gọi API với số trang tiếp theo
            fetchCommentReplies(commentId, targetComment.replyPagination.number + 1);
            
            return prev;
        });
    };

    // Add state for comment avatars URLs
    const [commentAvatarUrls, setCommentAvatarUrls] = useState({});
    
    // Function to fetch comment avatar
    const fetchCommentAvatar = async (avatarPath, commenterId, username) => {
        if (!avatarPath) return;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            console.log(`Fetching avatar for comment/reply: ${commenterId}, path: ${avatarPath}, username: ${username}`);

            // Kiểm tra xem có phải avatar của giáo viên hiện tại không
            if (teacherInfo && teacherInfo.avatar === avatarPath && teacherInfo.email === username) {
                console.log(`Using cached teacher avatar for ${commenterId} because username matches: ${username}`);
                if (teacherAvatarUrl) {
                    setCommentAvatarUrls(prev => ({
                        ...prev,
                        [commenterId]: teacherAvatarUrl
                    }));
                    return;
                }
            } else if (teacherInfo && teacherInfo.avatar === avatarPath) {
                console.log(`Avatar path matches current teacher but username doesn't match. Current: ${teacherInfo.email}, Reply: ${username}`);
            }

            // Fetch avatar with authorization header
            const response = await axios.get(`${API_BASE_URL}${avatarPath}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob' 
            });

            // Create a URL for the blob data
            const imageUrl = URL.createObjectURL(response.data);
            console.log(`Avatar fetched successfully for ${commenterId}, username: ${username}`);
            
            setCommentAvatarUrls(prev => ({
                ...prev,
                [commenterId]: imageUrl
            }));
        } catch (err) {
            console.error('Error fetching comment avatar:', err);
            // Nếu lỗi và là avatar của giáo viên hiện tại, sử dụng avatar hiện tại
            if (teacherInfo && teacherInfo.avatar === avatarPath && teacherInfo.email === username && teacherAvatarUrl) {
                setCommentAvatarUrls(prev => ({
                    ...prev,
                    [commenterId]: teacherAvatarUrl
                }));
            }
        }
    };

    return (
        <div className='content-container'>
            {alert && (
                <div className="alert-container">
                    <Alert
                        type={alert.type}
                        title={alert.title}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                </div>
            )}
            <div className='course-detail-section'>
                <div className='group-detail-header'> 
                    <div className='back-nav'> 
                        <button onClick={backToGroupsList} className="back_button">Groups</button>  
                        &gt; 
                        <span style={{ marginLeft: '16px' , color: '#5f6368'}}>{selectedGroup.name}</span>
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
                        Bài Kiểm Tra
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
            
            {/* Modal chỉnh sửa bài đăng */}
            <EditPostModal 
                isOpen={editModalOpen} 
                onClose={closeEditModal}
                initialText={editPostText}
                existingFiles={editExistingFiles}
                onSave={handleUpdatePost}
                isLoading={editLoading}
            />

            {/* Thêm hộp thoại xác nhận xóa */}
            <ConfirmationDialog />
            
            {/* Add DeleteTestConfirmationDialog */}
            <DeleteTestConfirmationDialog />
        </div>
    );
}

export default TeacherGroupDetail;