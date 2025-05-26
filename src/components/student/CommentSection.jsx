import React, { useEffect, useRef, useState } from 'react';
import logo from '../../logo.svg';
import axios from 'axios';
import '../../assets/css/comment-section.css';
import { 
    API_BASE_URL, 
    GET_STUDENT_INFO,
    GET_COMMENTS_BY_CHAPTER,
    GET_COMMENT_REPLIES, 
    WS_BASE_URL,
    WS_COMMENT_ENDPOINT,
    WS_REPLY_ENDPOINT,
    WS_COMMENTS_TOPIC,
    WS_REPLIES_TOPIC 
} from '../../services/apiService';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const CommentSection = ({ lessonId, courseId }) => {
    const [comments, setComments] = useState([]);
    const editorRef = useRef();
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [replyToId, setReplyToId] = useState(null);
    const [openReplyId, setOpenReplyId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingReplies, setLoadingReplies] = useState(false);
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
    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);
    
    // Trạng thái phân trang cho comments
    const [commentPagination, setCommentPagination] = useState({
        pageNumber: 0,
        pageSize: 10,
        totalPages: 0,
        totalElements: 0,
        loading: false
    });
    
    // Cache của comment replies để tránh gọi API nhiều lần
    const [repliesCache, setRepliesCache] = useState({});
    
    // Trạng thái phân trang cho replies
    const [replyPagination, setReplyPagination] = useState({});

    // Thêm state để lưu thông tin của comment được reply
    const [replyToComment, setReplyToComment] = useState(null);

    // Thêm state mới để lưu cache avatar
    const [avatarCache, setAvatarCache] = useState({});

    // STOMP WebSocket kết nối
    useEffect(() => {
        // Tạo kết nối socket mới khi component mount
        const connectSocket = () => {
            const socket = new SockJS(WS_BASE_URL);
            const client = new Client({
                webSocketFactory: () => socket,
                debug: function (str) {
                    console.log('STOMP Debug: ' + str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });
      
            // Khi kết nối thành công
            client.onConnect = (frame) => {
                setConnected(true);
                console.log('STOMP Connected: ' + frame);
        
                // Đăng ký nhận bình luận cho lesson hiện tại
                client.subscribe(WS_COMMENTS_TOPIC, (message) => {
                    if (message.body) {
                        const response = JSON.parse(message.body);
                        if (response && response.result) {
                            handleIncomingComment(response.result);
                        }
                    }
                });
        
                // Đăng ký nhận reply cho tất cả bình luận
                client.subscribe(WS_REPLIES_TOPIC, (message) => {
                    if (message.body) {
                        const response = JSON.parse(message.body);
                        if (response && response.result) {
                            handleIncomingReply(response.result);
                        }
                    }
                });
            };
      
            // Khi gặp lỗi
            client.onStompError = (frame) => {
                console.log('STOMP Error: ' + frame.headers['message']);
                console.log('Additional details: ' + frame.body);
            };
      
            // Khi mất kết nối
            client.onWebSocketClose = () => {
                console.log('WebSocket Connection Closed');
                setConnected(false);
                // Có thể thêm logic để thử kết nối lại ở đây
            };
      
            // Kết nối
            client.activate();
            setStompClient(client);
        };
    
        // Kết nối socket khi component mount
        if (lessonId) {
            connectSocket();
        }
    
        // Dọn dẹp khi component unmount
        return () => {
            if (stompClient) {
                stompClient.deactivate();
                setConnected(false);
            }
        };
    }, [lessonId]);

    // Xử lý comment mới nhận từ WebSocket
    const handleIncomingComment = (commentResponse) => {
        // Nếu là response cho cả page comments
        if (Array.isArray(commentResponse.content)) {
            // Sắp xếp comments từ mới đến cũ
            const sortedComments = [...commentResponse.content].sort((a, b) => {
                return new Date(b.createdDate) - new Date(a.createdDate);
            });
            
            setComments(sortedComments);
            setCommentPagination({
                pageNumber: commentResponse.number,
                pageSize: commentResponse.size,
                totalPages: commentResponse.totalPages,
                totalElements: commentResponse.totalElements,
                loading: false
            });
            return;
        }
        
        // Nếu là comment đơn lẻ
        setComments(prevComments => {
            // Cải thiện kiểm tra trùng lặp với nhiều điều kiện hơn
            const existingCommentIndex = prevComments.findIndex(c => {
                // Kiểm tra theo ID (từ server)
                if (c.commentId === commentResponse.commentId) return true;
                
                // Kiểm tra theo nội dung, người đăng và thời gian
                // So sánh thời gian trong khoảng 10 giây để tránh trường hợp người dùng gửi cùng nội dung nhiều lần
                const isContentMatch = c.detail === commentResponse.detail;
                const isUserMatch = c.username === commentResponse.username;
                
                // Nếu nội dung và người dùng khớp, đây có thể là bình luận trùng
                if (isContentMatch && isUserMatch) {
                    // Thêm kiểm tra thời gian nếu cả hai bên đều có createdDate
                    if (c.createdDate && commentResponse.createdDate) {
                        const time1 = new Date(c.createdDate).getTime();
                        const time2 = new Date(commentResponse.createdDate).getTime();
                        const timeDiff = Math.abs(time1 - time2);
                        
                        // Nếu thời gian chênh lệch ít hơn 10 giây, có thể coi là trùng lặp
                        return timeDiff < 10000; // 10 giây
                    }
                    
                    // Nếu không có thời gian để so sánh, vẫn coi là trùng lặp
                    return true;
                }
                
                return false;
            });
            
            // Nếu tìm thấy bình luận đã tồn tại
            if (existingCommentIndex >= 0) {
                // Cập nhật bình luận đã tồn tại (sử dụng dữ liệu từ server)
                const updatedComments = [...prevComments];
                
                // Chỉ cập nhật ID và các trường khác nếu comment hiện tại chưa có ID hợp lệ
                // (trường hợp optimistic comment được cập nhật bằng dữ liệu từ server)
                if (isNaN(parseInt(updatedComments[existingCommentIndex].commentId))) {
                    updatedComments[existingCommentIndex] = {
                        ...updatedComments[existingCommentIndex],
                        commentId: commentResponse.commentId
                    };
                } else {
                    // Nếu đã có ID hợp lệ, gộp các thuộc tính nhưng ưu tiên giữ nguyên ID hiện tại
                    const currentId = updatedComments[existingCommentIndex].commentId;
                    updatedComments[existingCommentIndex] = {
                        ...commentResponse,
                        commentId: currentId
                    };
                }
                
                return updatedComments;
            } else {
                // Thêm comment mới vào đầu danh sách (đã sắp xếp theo thời gian)
                return [commentResponse, ...prevComments];
            }
        });
    };

    // Xử lý reply mới nhận từ WebSocket
    const handleIncomingReply = (replyResponse) => {
        console.log('Received reply from server:', replyResponse);
        
        // Nếu không có dữ liệu hợp lệ, bỏ qua
        if (!replyResponse || !replyResponse.commentId) {
            console.error('Invalid reply response format:', replyResponse);
            return;
        }
        
        // Lấy commentId mà reply này thuộc về
        const commentId = replyResponse.commentId;
        
        // Cập nhật cache reply nếu có
        if (repliesCache[commentId]) {
            // Kiểm tra xem reply đã tồn tại trong cache chưa
            const existingReplyIndex = repliesCache[commentId].findIndex(r => 
                r.commentReplyId === replyResponse.commentReplyId ||
                (r.detail === replyResponse.detail && 
                 r.usernameReply === replyResponse.usernameReply &&
                 (r.commentReplyId?.startsWith('temp-') || false))
            );
            
            if (existingReplyIndex >= 0) {
                // Cập nhật reply hiện có
                setRepliesCache(prev => {
                    const updatedReplies = [...prev[commentId]];
                    updatedReplies[existingReplyIndex] = replyResponse;
                    return {
                        ...prev,
                        [commentId]: updatedReplies
                    };
                });
                // Không cập nhật countOfReply vì đây chỉ là cập nhật phản hồi đã tồn tại
            } else {
                // Thêm reply mới vào cache
                setRepliesCache(prev => ({
                    ...prev,
                    [commentId]: [...(prev[commentId] || []), replyResponse]
                }));
                
                // Chỉ cập nhật số lượng replies khi thực sự có reply mới 
                // mà không phải là cập nhật từ phần optimistic UI
                if (!replyResponse.commentReplyId.startsWith('temp-')) {
                    setComments(prevComments => 
                        prevComments.map(comment => 
                            comment.commentId === commentId 
                                ? { 
                                    ...comment, 
                                    // Sử dụng số lượng từ server nếu có, hoặc tăng lên 1
                                    countOfReply: replyResponse.replyCount || (comment.countOfReply || 0) + 1
                                } 
                                : comment
                        )
                    );
                }
            }
        } else {
            // Không có cache, tạo mới
            setRepliesCache(prev => ({
                ...prev,
                [commentId]: [replyResponse]
            }));
            
            // Chỉ cập nhật số lượng replies khi thực sự có reply mới
            if (!replyResponse.commentReplyId.startsWith('temp-')) {
                setComments(prevComments => 
                    prevComments.map(comment => 
                        comment.commentId === commentId 
                            ? { 
                                ...comment, 
                                // Sử dụng số lượng từ server nếu có, hoặc tăng lên 1
                                countOfReply: replyResponse.replyCount || (comment.countOfReply || 0) + 1
                            } 
                            : comment
                    )
                );
            }
        }
    };
    
    // Khi mới tải trang hoặc khi lessonId thay đổi
    useEffect(() => {
        const fetchComments = async () => {
            if (!lessonId) return;
            
            try {
                setLoading(true);
                setCommentPagination(prev => ({ ...prev, loading: true }));
                
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                // Đảm bảo có giá trị mặc định cho pageNumber và pageSize
                const pageSize = commentPagination?.pageSize !== undefined ? commentPagination.pageSize : 10;

                // Đặt pageNumber = 0 để lấy các phần tử đầu tiên
                const pageNumber = 0;

                // API call để lấy comments từ server sử dụng API mới với các tham số trong Headers
                const response = await axios.get(GET_COMMENTS_BY_CHAPTER, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'chapterId': lessonId,
                        'pageNumber': pageNumber.toString(),
                        'pageSize': pageSize.toString()
                    }
                });
                
                if (response.data && response.data.code === 0 && response.data.result) {
                    const result = response.data.result;
                    
                    // Cập nhật comments từ content và sắp xếp ngay từ đầu
                    const sortedComments = [...(result.content || [])].sort((a, b) => {
                        return new Date(b.createdDate) - new Date(a.createdDate);
                    });
                    
                    setComments(sortedComments);
                    
                    // Cập nhật thông tin phân trang từ result.page
                    if (result.page) {
                        setCommentPagination({
                            pageNumber: pageNumber, // Bắt đầu từ 0
                            pageSize: result.page.size,
                            totalPages: result.page.totalPages,
                            totalElements: result.page.totalElements,
                            loading: false
                        });
                    }
                } else {
                    setComments([]);
                    setError('Không thể tải bình luận');
                }
                
            } catch (err) {
                console.error('Error fetching comments:', err);
                setError('Không thể tải bình luận. Vui lòng thử lại sau.');
                setComments([]);
            } finally {
                setLoading(false);
                setCommentPagination(prev => ({ ...prev, loading: false }));
            }
        };

        fetchComments();
    }, [lessonId]);

    // Sửa lại useEffect để xử lý khi tải thêm comment
    useEffect(() => {
        // Chỉ gọi API khi có lessonId và pageNumber thay đổi (nhưng không phải lần đầu tiên load với pageNumber = 0)
        if (lessonId && commentPagination.pageNumber > 0) {
            const fetchMoreComments = async () => {
                try {
                    setCommentPagination(prev => ({ ...prev, loading: true }));
                    
                    const token = localStorage.getItem('authToken');
                    if (!token) {
                        throw new Error('No authentication token found');
                    }

                    // API call để lấy comments từ server với offset-based pagination
                    const response = await axios.get(GET_COMMENTS_BY_CHAPTER, {
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'chapterId': lessonId,
                            'pageNumber': commentPagination.pageNumber.toString(), // Vị trí phần tử bắt đầu
                            'pageSize': commentPagination.pageSize.toString()
                        }
                    });
                    
                    if (response.data && response.data.code === 0 && response.data.result) {
                        const result = response.data.result;
                        const newComments = result.content || [];
                        
                        // Khi tải thêm comments, thêm vào danh sách hiện tại
                        setComments(prevComments => {
                            // Tìm commentIds hiện tại để tránh trùng lặp
                            const existingIds = new Set(prevComments.map(c => c.commentId));
                            
                            // Lọc ra các comments mới chưa có trong danh sách
                            const filteredNewComments = newComments.filter(c => !existingIds.has(c.commentId));
                            
                            // Gộp danh sách comments hiện tại với danh sách mới
                            const mergedComments = [...prevComments, ...filteredNewComments];
                            
                            // Sắp xếp lại để đảm bảo thứ tự đúng
                            return mergedComments.sort((a, b) => {
                                return new Date(b.createdDate) - new Date(a.createdDate);
                            });
                        });
                        
                        // Cập nhật thông tin phân trang từ result.page
                        if (result.page) {
                            setCommentPagination({
                                pageNumber: commentPagination.pageNumber, // Giữ nguyên vị trí hiện tại
                                pageSize: result.page.size,
                                totalPages: result.page.totalPages,
                                totalElements: result.page.totalElements,
                                loading: false
                            });
                        }
                    }
                    
                } catch (err) {
                    console.error('Error fetching more comments:', err);
                } finally {
                    setCommentPagination(prev => ({ ...prev, loading: false }));
                }
            };

            fetchMoreComments();
        }
    }, [lessonId, commentPagination.pageNumber]);

    // Sửa lại hàm để tải thêm comments theo offset-based pagination
    const loadMoreComments = () => {
        if (!commentPagination.loading) {
            // Tính toán vị trí bắt đầu mới dựa trên số lượng comments đã có
            const nextOffset = comments.length;
            
            // Kiểm tra xem đã đến cuối danh sách chưa
            if (nextOffset < commentPagination.totalElements) {
                setCommentPagination(prev => ({
                    ...prev,
                    pageNumber: nextOffset // Đặt pageNumber thành offset mới
                }));
            }
        }
    };
    
    // Hàm để tải replies cho một comment
    const loadReplies = async (commentId) => {
        if (loadingReplies || repliesCache[commentId]) return;
        
        try {
            setLoadingReplies(true);
            
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // API call để lấy replies cho comment
            const response = await axios.get(GET_COMMENT_REPLIES, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'commentId': commentId,
                    'pageNumber': '0',
                    'pageSize': '10'
                }
            });
            
            if (response.data && response.data.code === 0 && response.data.result) {
                const result = response.data.result;
                
                // Lưu vào cache
                setRepliesCache(prev => ({
                    ...prev,
                    [commentId]: result.content || []
                }));
                
                // Lưu thông tin phân trang
                setReplyPagination(prev => ({
                    ...prev,
                    [commentId]: {
                        pageNumber: result.number,
                        pageSize: result.size,
                        totalPages: result.totalPages,
                        totalElements: result.totalElements
                    }
                }));
            }
            
        } catch (err) {
            console.error('Error loading replies:', err);
        } finally {
            setLoadingReplies(false);
        }
    };
    
    // Hiển thị/ẩn replies của một comment
    const toggleReplies = (commentId) => {
        if (repliesCache[commentId]) {
            // Nếu đã có trong cache, xóa khỏi cache để ẩn đi
            setRepliesCache(prev => {
                const newCache = { ...prev };
                delete newCache[commentId];
                return newCache;
            });
        } else {
            // Nếu chưa có, tải về
            loadReplies(commentId);
        }
    };

    // Hàm để tải thêm replies (phân trang)
    const loadMoreReplies = async (commentId) => {
        if (!replyPagination[commentId] || loadingReplies) return;
        
        // Kiểm tra xem đã đến trang cuối cùng chưa
        const { pageNumber, totalPages } = replyPagination[commentId];
        if (pageNumber >= totalPages - 1) return;
        
        try {
            setLoadingReplies(true);
            
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // API call để lấy trang kế tiếp của replies
            const response = await axios.get(GET_COMMENT_REPLIES, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'commentId': commentId,
                    'pageNumber': (pageNumber + 1).toString(),
                    'pageSize': replyPagination[commentId].pageSize.toString()
                }
            });
            
            if (response.data && response.data.code === 0 && response.data.result) {
                const result = response.data.result;
                const newReplies = result.content || [];
                
                // Thêm replies mới vào cache - giữ nguyên thứ tự từ server
                setRepliesCache(prev => {
                    // Gộp tất cả replies và sắp xếp lại sẽ được thực hiện khi render
                    return {
                        ...prev,
                        [commentId]: [...(prev[commentId] || []), ...newReplies]
                    };
                });
                
                // Cập nhật thông tin phân trang
                setReplyPagination(prev => ({
                    ...prev,
                    [commentId]: {
                        ...prev[commentId],
                        pageNumber: result.number,
                        // Giữ nguyên các thông tin khác
                    }
                }));
            }
            
        } catch (err) {
            console.error('Error loading more replies:', err);
        } finally {
            setLoadingReplies(false);
        }
    };

    useEffect(() => {
        const fetchStudentInfo = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                // Fetch student info
                const studentResponse = await axios.get(`${GET_STUDENT_INFO}`, {
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
                        const avatarUrl = await fetchAvatar(studentInfo.avatar);
                        if (avatarUrl) {
                            setAvatarUrl(avatarUrl);
                        }
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

    // Cập nhật hàm fetchAvatar để nhận avatarPath và trả về URL blob
    const fetchAvatar = async (avatarPath) => {
        if (!avatarPath) return null;
        
        // Nếu đã có trong cache thì trả về kết quả từ cache
        if (avatarCache[avatarPath]) {
            return avatarCache[avatarPath];
        }

        try {
            const token = localStorage.getItem('authToken');
            if (!token) return null;

            // Fetch avatar with authorization header
            const response = await axios.get(`${API_BASE_URL}${avatarPath}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob' // Important: we want the image as a blob
            });

            // Create a URL for the blob data
            const imageUrl = URL.createObjectURL(response.data);
            
            // Lưu vào cache
            setAvatarCache(prev => ({
                ...prev,
                [avatarPath]: imageUrl
            }));
            
            return imageUrl;
        } catch (err) {
            console.error('Error fetching avatar:', err);
            return null;
        }
    };

    // Function to handle comment submission
    const submitComment = () => {
        if (!commentText || commentText.trim() === '' || commentText === '<br>') {
            alert('Vui lòng nhập nội dung bình luận.');
            return;
        }
    
        if (replyToId) {
            // Là phản hồi - tạo đối tượng CommentReplyMessage theo định dạng backend yêu cầu
            const ownerUsername = replyToComment?.username || ''; // Lấy username của chủ nhân comment gốc
            
            const replyMessage = {
                ownerUsername: ownerUsername,
                replyUsername: studentData.email,
                chapterId: lessonId,
                courseId: courseId, 
                parentCommentId: replyToId,
                detail: commentText
            };
            
            console.log('Sending reply via WebSocket:', replyMessage);
            
            // Gửi reply qua WebSocket nếu đã kết nối
            if (connected && stompClient) {
                stompClient.publish({
                    destination: WS_REPLY_ENDPOINT,
                    body: JSON.stringify(replyMessage)
                });
                
                // Tạo đối tượng CommentReplyResponse cho optimistic UI
                const optimisticReply = {
                    commentId: replyToId,
                    commentReplyId: `temp-${Date.now()}`,
                    usernameOwner: ownerUsername,
                    fullnameOwner: replyToComment?.fullname || '',
                    usernameReply: studentData.email,
                    fullnameReply: studentData.name,
                    avatarReply: studentData.avatar,
                    detail: commentText,
                    createdDate: new Date().toISOString(),
                    replyCount: 0
                };
                
                // Cập nhật UI ngay lập tức (optimistic UI)
                setRepliesCache(prev => ({
                    ...prev,
                    [replyToId]: [...(prev[replyToId] || []), optimisticReply]
                }));
                
                // QUAN TRỌNG: Không cập nhật số lượng tại đây
                // Server sẽ gửi lại phản hồi mới qua WebSocket và handleIncomingReply sẽ cập nhật số lượng
            }
        } else {
            // Là bình luận mới - tạo đối tượng CommentMessage theo định dạng backend yêu cầu
            const commentMessage = {
                chapterId: lessonId,
                courseId: courseId,
                username: studentData.email,  // Đảm bảo dùng email
                detail: commentText,
                createdDate: new Date().toISOString()
            };
            
            // Gửi comment mới qua WebSocket nếu đã kết nối
            if (connected && stompClient) {
                console.log('Sending comment via WebSocket:', commentMessage);
                stompClient.publish({
                    destination: WS_COMMENT_ENDPOINT,  // Đảm bảo dùng endpoint từ apiService
                    body: JSON.stringify(commentMessage)
                });
                
                // Tạo đối tượng CommentChapterResponse cho optimistic UI
                const optimisticComment = {
                    commentId: `temp-${Date.now()}`,  // Thêm tiền tố để nhận biết dễ dàng
                    username: studentData.email,  // Đồng bộ với dữ liệu gửi lên server
                    fullname: studentData.name,
                    avatar: studentData.avatar,
                    detail: commentText,
                    createdDate: new Date().toISOString(),
                    countOfReply: 0
                };
                
                // Thêm comment vào state local để hiển thị ngay lập tức (optimistic UI)
                // Comment mới luôn ở đầu danh sách vì đã sắp xếp theo thời gian
                setComments(prevComments => [optimisticComment, ...prevComments]);
            }
        }
    
        setCommentText('');
        setReplyToId(null);
        setReplyToComment(null); // Reset thông tin comment được reply
        if (editorRef.current) editorRef.current.innerHTML = '';
        closeEditor();
        closeReply();
    };

    // Function to handle opening the editor
    const openEditor = () => {
        setIsEditorOpen(true);
        
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

    // xử lý up ảnh
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
        // Xử lý tệp đã chọn
        console.log('Tệp đã chọn:', file);
        }
    };
    
    // Function to openReplyEditor
    const openReplyEditor = (commentId, comment) => {
        setReplyToId(commentId);
        setOpenReplyId(commentId);
        setReplyToComment(comment);
        
        // Reset nội dung
        setCommentText('');
    };  

    // Function to closeReplyEditor
    const closeReply = () => {
        setOpenReplyId(null);
        setReplyToId(null);
        setReplyToComment(null);
        setCommentText('');
    };

    // Hàm để định dạng thời gian
    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return 'Không xác định';
        
        try {
            const date = new Date(dateTimeStr);
            const now = new Date();
            const diffMs = now - date;
            const diffSec = Math.floor(diffMs / 1000);
            const diffMin = Math.floor(diffSec / 60);
            const diffHour = Math.floor(diffMin / 60);
            const diffDay = Math.floor(diffHour / 24);
            const diffMonth = Math.floor(diffDay / 30);
            const diffYear = Math.floor(diffMonth / 12);
            
            if (diffSec < 60) return 'Vừa xong';
            if (diffMin < 60) return `${diffMin} phút trước`;
            if (diffHour < 24) return `${diffHour} giờ trước`;
            if (diffDay < 30) return `${diffDay} ngày trước`;
            if (diffMonth < 12) return `${diffMonth} tháng trước`;
            return `${diffYear} năm trước`;
        } catch (error) {
            return 'Không xác định';
        }
    };

    // Tạo Component mới để hiển thị avatar
    const UserAvatar = React.memo(({ avatar, name, className }) => {
        const [imgSrc, setImgSrc] = useState(null);
        
        useEffect(() => {
            const loadAvatar = async () => {
                // Nếu là URL đầy đủ (bắt đầu bằng http)
                if (avatar && avatar.startsWith('http')) {
                    setImgSrc(avatar);
                    return;
                }
                
                // Nếu là đường dẫn avatar từ backend
                if (avatar) {
                    const cachedUrl = avatarCache[avatar];
                    if (cachedUrl) {
                        setImgSrc(cachedUrl);
                    } else {
                        const url = await fetchAvatar(avatar);
                        if (url) {
                            setImgSrc(url);
                        }
                    }
                }
            };
            
            loadAvatar();
        }, [avatar, avatarCache]);
        
        if (imgSrc) {
            return <img src={imgSrc} alt="Avatar" className={className || "comment-avatar-circle"} />;
        }
        
        // Fallback khi không có avatar
        return (
            <div className={className || "comment-avatar-circle"}>
                {name ? name.charAt(0).toUpperCase() : '?'}
            </div>
        );
    });

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
                                className="comment-editor-content" 
                                contentEditable="true"
                                placeholder="Thêm bình luận mới của bạn"
                                onInput={handleEditorChange}
                            ></div>
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
                            <div className="author-avatar comment-avatar-circle">
                                {studentData.name ? studentData.name.charAt(0).toUpperCase() : '?'}
                            </div>
                        )}
                        <input 
                            type="text" 
                            className="announcement_header-input" 
                            placeholder="Thêm bình luận mới của bạn"
                        />
                    </div>
                )}
            </div>

            <p className="comment-count">{commentPagination.totalElements || comments.length} bình luận</p>

            {loading && <div className="comments-loading">Đang tải bình luận...</div>}
            
            {error && <div className="comments-error">{error}</div>}

            <div className="comment-list">
                {comments.map((comment) => (
                    <div key={comment.commentId} className="comment-container">
                        <div className="comment">
                            <div className="comment-content">
                                <UserAvatar 
                                    avatar={comment.avatar} 
                                    name={comment.fullname || comment.username}
                                    className="comment-avatar-circle"
                                />
                                <div className="comment-header">
                                    <span className="username">{comment.fullname || comment.username}</span>
                                    <span className="time">{formatDateTime(comment.createdDate)}</span>
                                </div>
                            </div>
                            <div
                                className="comment-text"
                                dangerouslySetInnerHTML={{ __html: comment.detail }}
                            ></div>
                            <div className="comment-actions">
                                <span onClick={() => openReplyEditor(comment.commentId, comment)}>Phản hồi</span>
                                {comment.countOfReply > 0 && (
                                    <span 
                                        className="view-replies" 
                                        onClick={() => toggleReplies(comment.commentId)}
                                    >
                                        {repliesCache[comment.commentId] ? 'Ẩn phản hồi' : `Xem ${comment.countOfReply} phản hồi`}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Phần form phản hồi - cập nhật để loại bỏ các nút định dạng */}
                        {openReplyId === comment.commentId && (
                            <div className="reply-editor-container">
                                <div className="d-flex align-items-start">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="author-avatar" />
                                    ) : (
                                        <div className="comment-avatar-circle author-avatar">
                                            {studentData.name ? studentData.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                    )}
                                    <div className="reply-content">
                                        <div className="reply-editor">
                                            <div 
                                                ref={editorRef}
                                                className="reply-editor-content" 
                                                contentEditable="true"
                                                placeholder="Phản hồi..."
                                                onInput={handleEditorChange}
                                            >
                                            </div>
                                        </div>
                                        
                                        <div className="reply-actions">
                                            <button className="comment-cancel-button" onClick={closeReply}>HỦY</button>
                                            <button className="comment-post-button" onClick={submitComment}>BÌNH LUẬN</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Phần hiển thị phản hồi cho comment này */}
                        {repliesCache[comment.commentId] && (
                            <div className="replies-container">
                                {loadingReplies && <div className="replies-loading">Đang tải phản hồi...</div>}
                                
                                {[...repliesCache[comment.commentId]]
                                    .sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate))
                                    .map((reply) => (
                                    <div key={reply.commentReplyId} className="comment reply">
                                <div className="comment-content">
                                            <UserAvatar 
                                                avatar={reply.avatarReply} 
                                                name={reply.fullnameReply || reply.usernameReply}
                                                className="comment-avatar-circle"
                                            />
                                    <div className="comment-header">
                                                <span className="username">{reply.fullnameReply || reply.usernameReply}</span>
                                                <span className="time">{formatDateTime(reply.createdDate)}</span>
                                    </div>
                                </div>
                                <div
                                    className="comment-text"
                                            dangerouslySetInnerHTML={{ __html: reply.detail }}
                                ></div>
                                <div className="comment-actions">
                                            <span onClick={() => openReplyEditor(comment.commentId, comment)}>Phản hồi</span>
                                </div>
                            </div>
                        ))}
                                
                                {/* Thêm nút xem thêm phản hồi nếu có nhiều hơn */}
                                {replyPagination[comment.commentId] && 
                                 replyPagination[comment.commentId].totalElements > repliesCache[comment.commentId].length && (
                                    <div className="load-more-replies">
                                        <button onClick={() => loadMoreReplies(comment.commentId)}>
                                            Xem thêm phản hồi
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                
                {/* Cập nhật điều kiện hiển thị nút "Xem thêm" dựa trên số lượng comments đã tải và tổng số comments */}
                {comments.length < commentPagination.totalElements && (
                    <div className="load-more-comments">
                        <button 
                            onClick={loadMoreComments}
                            disabled={commentPagination.loading}
                        >
                            {commentPagination.loading ? 'Đang tải...' : 'Xem thêm bình luận'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentSection;