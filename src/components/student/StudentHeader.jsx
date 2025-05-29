import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, LogOut, Bell, Check, KeySquare, MessageCircle, UserPlus, CheckCircle, XCircle, FileText, MessageSquare } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import logo from '../../assets/imgs/LMS-logo.jpg';
import notificationSound from '../../assets/sounds/notification.mp3';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL, SEARCH_COURSE_API, GET_MY_COURSE, GET_PROGRESS_PERCENT, GET_STUDENT_INFO } from '../../services/apiService';
import '../../assets/css/student-header.css';
import axios from 'axios';

// Constants cho endpoint thông báo
const NOTIFICATIONS_API = `${API_BASE_URL}/lms/notifications`;

const StudentHeader = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isNotificationOpen, setNotificationOpen] = useState(false);
    const [isCoursesOpen, setCoursesOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const notificationRef = useRef(null);
    const coursesRef = useRef(null);
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
    
    // Lấy state cho phân trang thông báo
    const [notificationsPagination, setNotificationsPagination] = useState({
        pageNumber: 0,
        pageSize: 10,
        totalPages: 0,
        totalElements: 0
    });
    const [loadingMoreNotifications, setLoadingMoreNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationsListRef = useRef(null);
    
    // Thêm state cho chức năng tìm kiếm
    const [searchQueryCourse, setSearchQueryCourse] = useState('');
    const [searchQueryTeacher, setSearchQueryTeacher] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);
    
    // Thêm state cho debounce
    const searchTimeoutRef = useRef(null);

    // State cho phân trang và cuộn vô hạn tìm kiếm
    const [searchPagination, setSearchPagination] = useState({
        pageNumber: 0,
        pageSize: 10,
        totalPages: 0,
        totalElements: 0
    });
    const [loadingMoreResults, setLoadingMoreResults] = useState(false);
    const searchResultsRef = useRef(null);

    // Thêm state cho phân trang và cuộn vô hạn của khóa học
    const [coursesPagination, setCoursesPagination] = useState({
        pageNumber: 0,
        pageSize: 10,
        totalPages: 0,
        totalElements: 0
    });
    const [loadingMoreCourses, setLoadingMoreCourses] = useState(false);
    const coursesListRef = useRef(null);

    // State cho phần đổi mật khẩu
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changePasswordLoading, setChangePasswordLoading] = useState(false);
    const [changePasswordError, setChangePasswordError] = useState('');
    const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
    
    // State để quản lý hiệu ứng khi đóng modal
    const [modalClosing, setModalClosing] = useState(false);

    // Thêm state để lưu ảnh đại diện khóa học
    const [courseImages, setCourseImages] = useState({});

    // Thêm state cho WebSocket client
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Thêm state cho hiệu ứng nháy thông báo mới
    const [notificationHighlight, setNotificationHighlight] = useState(false);
    const audioRef = useRef(null);

    // Thêm state để theo dõi trạng thái kết nối và số lần thử lại
    const [connectionAttempts, setConnectionAttempts] = useState(0);
    const maxReconnectAttempts = 5;
    const reconnectIntervalRef = useRef(null);

    // Thêm state để theo dõi thông báo mới nhận về
    const [newNotificationIds, setNewNotificationIds] = useState(new Set());

    // Thêm state để biết còn thông báo để load không
    const [hasMoreNotifications, setHasMoreNotifications] = useState(true);

    // Thêm useEffect để xử lý việc loại bỏ đánh dấu là "mới" sau một khoảng thời gian
    useEffect(() => {
        const timerIds = [];
        
        newNotificationIds.forEach(id => {
            const timerId = setTimeout(() => {
                setNewNotificationIds(prev => {
                    const updated = new Set(prev);
                    updated.delete(id);
                    return updated;
                });
            }, 5000); // Sau 5 giây, bỏ đánh dấu là thông báo mới
            
            timerIds.push(timerId);
        });
        
        // Dọn dẹp khi component unmount hoặc danh sách thay đổi
        return () => {
            timerIds.forEach(id => clearTimeout(id));
        };
    }, [newNotificationIds]);

    // lắng nghe sự kiện để set avatar ngay khi avatar được cập nhật
    useEffect(() => {
        const handleAvatarUpdate = (event) => {
            setAvatarUrl(event.detail.avatarUrl);
        };
        
        window.addEventListener('avatar_updated', handleAvatarUpdate);
        
        return () => {
            window.removeEventListener('avatar_updated', handleAvatarUpdate);
        };
    }, []);

    // Thiết lập kết nối WebSocket khi có email
    useEffect(() => {
        // Chỉ kết nối khi đã có email của sinh viên
        if (studentData.email && !stompClient) {
            const connectWebSocket = () => {
                const socket = new SockJS(`${API_BASE_URL}/lms/ws`);
                const client = new Client({
                    webSocketFactory: () => socket,
                    connectHeaders: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`
                    },
                    debug: function(str) {
                        console.log('STOMP: ' + str);
                    },
                    reconnectDelay: 5000,
                    heartbeatIncoming: 4000,
                    heartbeatOutgoing: 4000
                });

                client.onConnect = function(frame) {
                    console.log('Kết nối WebSocket thành công!', frame);
                    setIsConnected(true);
                    
                    // Đăng ký kênh thông báo với userName là email
                    const notificationTopic = `/topic/notifications/${studentData.email}`;
                    console.log(`Đăng ký kênh thông báo: ${notificationTopic}`);
                    
                    client.subscribe(notificationTopic, function(message) {
                        // Xử lý thông báo nhận được
                        try {
                            const receivedNotification = JSON.parse(message.body);
                            console.log('Nhận thông báo mới từ WebSocket:', receivedNotification);
                            
                            // Kích hoạt hiệu ứng nháy cho bell icon
                            setNotificationHighlight(true);
                            
                            // Phát âm thanh thông báo nếu có
                            if (audioRef.current) {
                                audioRef.current.currentTime = 0; // Reset âm thanh về đầu
                                audioRef.current.play().catch(error => {
                                    console.log('Không thể phát âm thanh thông báo:', error);
                                });
                            }
                            
                            // Tắt hiệu ứng sau 3 giây
                            setTimeout(() => {
                                setNotificationHighlight(false);
                            }, 3000);
                            
                            // Xử lý dữ liệu thông báo dựa vào cấu trúc
                            if (receivedNotification.notificationId) {
                                // Trường hợp nhận trực tiếp một thông báo với định dạng giống API
                                const formattedNotification = {
                                    id: receivedNotification.notificationId,
                                    title: getNotificationTitle(receivedNotification),
                                    message: receivedNotification.description || receivedNotification.message || receivedNotification.content || 'Không có nội dung',
                                    time: formatRelativeTime(receivedNotification.createdAt) || 'Vừa xong',
                                    read: receivedNotification.isRead || false,
                                    type: getNotificationType(receivedNotification),
                                    rawType: receivedNotification.notificationType,
                                    originalData: receivedNotification
                                };
                                
                                // Thêm thông báo mới vào đầu danh sách
                                setNotifications(prev => [formattedNotification, ...prev]);
                                
                                // Đánh dấu là thông báo mới để có hiệu ứng
                                setNewNotificationIds(prev => new Set(prev).add(formattedNotification.id));
                                
                                // Cập nhật số lượng thông báo chưa đọc
                                if (!formattedNotification.read) {
                                    setUnreadCount(prevCount => prevCount + 1);
                                }
                                
                                // Hiển thị notification trên trình duyệt nếu được hỗ trợ và thông báo chưa đọc
                                if (!formattedNotification.read && Notification.permission === "granted") {
                                    new Notification(formattedNotification.title, { 
                                        body: formattedNotification.message,
                                        icon: logo
                                    });
                                }
                            } else if (receivedNotification.notificationDetails && Array.isArray(receivedNotification.notificationDetails)) {
                                // Trường hợp nhận được danh sách thông báo (giống format API)
                                const formattedNotifications = receivedNotification.notificationDetails.map(notif => ({
                                    id: notif.notificationId,
                                    title: getNotificationTitle(notif),
                                    message: notif.description || notif.message || notif.content || 'Không có nội dung',
                                    time: formatRelativeTime(notif.createdAt) || 'Vừa xong',
                                    read: notif.isRead || false,
                                    type: getNotificationType(notif),
                                    rawType: notif.notificationType,
                                    originalData: notif
                                }));
                                
                                // Thêm các thông báo mới vào đầu danh sách, tránh trùng lặp
                                setNotifications(prevNotifications => {
                                    const existingIds = new Set(prevNotifications.map(n => n.id));
                                    const newNotifications = formattedNotifications.filter(n => !existingIds.has(n.id));
                                    
                                    // Đánh dấu các thông báo mới để có hiệu ứng
                                    if (newNotifications.length > 0) {
                                        setNewNotificationIds(prev => {
                                            const updated = new Set(prev);
                                            newNotifications.forEach(n => updated.add(n.id));
                                            return updated;
                                        });
                                    }
                                    
                                    return [...newNotifications, ...prevNotifications];
                                });
                                
                                // Cập nhật số lượng thông báo chưa đọc
                                if (receivedNotification.countUnreadNotification !== undefined) {
                                    setUnreadCount(receivedNotification.countUnreadNotification);
                                } else {
                                    // Nếu không có sẵn số lượng chưa đọc, tính từ danh sách
                                    const newUnread = formattedNotifications.filter(n => !n.read).length;
                                    setUnreadCount(prevCount => prevCount + newUnread);
                                }
                                
                                // Hiển thị thông báo trên trình duyệt cho thông báo mới nhất chưa đọc
                                const unreadNotifications = formattedNotifications.filter(n => !n.read);
                                if (unreadNotifications.length > 0 && Notification.permission === "granted") {
                                    new Notification(unreadNotifications[0].title, {
                                        body: unreadNotifications[0].message,
                                        icon: logo
                                    });
                                }
                            } else if (typeof receivedNotification === 'object') {
                                // Trường hợp khác - thử chuyển đổi sang định dạng thông báo tiêu chuẩn
                                try {
                                    // Đoán định dạng dựa trên các trường có sẵn
                                    const formattedNotification = {
                                        id: receivedNotification.id || receivedNotification.notificationId || Date.now(),
                                        title: receivedNotification.title || 'Thông báo mới',
                                        message: receivedNotification.description || receivedNotification.message || receivedNotification.content || '',
                                        time: 'Vừa xong',
                                        read: false,
                                        type: 'general',
                                        rawType: receivedNotification.type || 'GENERAL',
                                    };
                                    
                                    // Thêm thông báo mới vào đầu danh sách
                                    setNotifications(prev => [formattedNotification, ...prev]);
                                    
                                    // Đánh dấu là thông báo mới để có hiệu ứng
                                    setNewNotificationIds(prev => new Set(prev).add(formattedNotification.id));
                                    
                                    // Cập nhật số lượng thông báo chưa đọc
                                    setUnreadCount(prevCount => prevCount + 1);
                                    
                                    // Hiển thị notification trên trình duyệt
                                    if (Notification.permission === "granted") {
                                        new Notification(formattedNotification.title, { 
                                            body: formattedNotification.message,
                                            icon: logo
                                        });
                                    }
                                } catch (formatError) {
                                    console.error('Lỗi khi chuyển đổi định dạng thông báo:', formatError);
                                }
                            }
                            
                            // Tự động mở dropdown thông báo khi nhận thông báo mới
                            if (!isNotificationOpen) {
                                setNotificationOpen(true);
                            }
                            
                        } catch (error) {
                            console.error('Lỗi xử lý thông báo từ WebSocket:', error);
                        }
                    });
                    
                    // Yêu cầu server gửi lại thông báo chưa đọc sau khi kết nối
                    try {
                        const token = localStorage.getItem('authToken');
                        if (token) {
                            // Gửi tin nhắn để yêu cầu server gửi thông báo chưa đọc
                            client.publish({
                                destination: '/app/notifications.request',
                                headers: { 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({
                                    email: studentData.email,
                                    action: 'FETCH_UNREAD'
                                })
                            });
                            console.log('Đã gửi yêu cầu lấy thông báo chưa đọc');
                        }
                    } catch (error) {
                        console.error('Lỗi khi yêu cầu thông báo chưa đọc:', error);
                    }
                };

                client.onStompError = function(frame) {
                    console.error('Lỗi kết nối STOMP:', frame);
                    setIsConnected(false);
                    
                    // Thử kết nối lại sau 5 giây
                    setTimeout(() => {
                        console.log('Đang thử kết nối lại WebSocket...');
                        if (client) {
                            client.activate();
                        }
                    }, 5000);
                };
                
                client.onWebSocketClose = function() {
                    console.log('Kết nối WebSocket đã đóng');
                    setIsConnected(false);
                    
                    // Thử kết nối lại sau 3 giây nếu kết nối bị đóng bất ngờ
                    setTimeout(() => {
                        console.log('Đang thử kết nối lại WebSocket sau khi đóng...');
                        if (client && !client.connected) {
                            client.activate();
                        }
                    }, 3000);
                };
                
                client.activate();
                setStompClient(client);
                
                // Ping server định kỳ để giữ kết nối
                const pingInterval = setInterval(() => {
                    if (client && client.connected) {
                        try {
                            client.publish({
                                destination: '/app/ping',
                                body: JSON.stringify({ timestamp: new Date().getTime() })
                            });
                            console.log('Ping server để giữ kết nối');
                        } catch (error) {
                            console.error('Lỗi khi ping server:', error);
                        }
                    }
                }, 30000); // ping mỗi 30 giây
                
                return () => clearInterval(pingInterval);
            };

            const wsConnection = connectWebSocket();
            return wsConnection;
        }
        
        // Dọn dẹp khi component unmount
        return () => {
            if (stompClient) {
                console.log('Ngắt kết nối WebSocket khi component unmount');
                stompClient.deactivate();
                setStompClient(null);
                setIsConnected(false);
            }
        };
    }, [studentData.email]);

    // Thêm useEffect để theo dõi và khôi phục kết nối WebSocket
    useEffect(() => {
        // Kiểm tra và khôi phục kết nối WebSocket nếu cần
        if (!isConnected && studentData.email && connectionAttempts < maxReconnectAttempts) {
            console.log(`Đang thử kết nối lại WebSocket (lần thử ${connectionAttempts + 1}/${maxReconnectAttempts})...`);
            
            // Xóa timeout hiện tại nếu có
            if (reconnectIntervalRef.current) {
                clearTimeout(reconnectIntervalRef.current);
            }
            
            // Đặt timeout mới để thử kết nối lại
            reconnectIntervalRef.current = setTimeout(() => {
                // Tăng số lần thử kết nối
                setConnectionAttempts(prev => prev + 1);
                
                // Tạo kết nối WebSocket mới
                if (!stompClient) {
                    const socket = new SockJS(`${API_BASE_URL}/ws`);
                    const client = new Client({
                        webSocketFactory: () => socket,
                        connectHeaders: {
                            Authorization: `Bearer ${localStorage.getItem('authToken')}`
                        },
                        debug: function(str) {
                            console.log('STOMP Reconnect: ' + str);
                        },
                        reconnectDelay: 5000,
                        heartbeatIncoming: 4000,
                        heartbeatOutgoing: 4000
                    });
                    
                    client.onConnect = function() {
                        console.log('Kết nối WebSocket thành công khi thử lại!');
                        setIsConnected(true);
                        setConnectionAttempts(0); // Reset số lần thử kết nối
                        
                        // Đóng timeout nếu có
                        if (reconnectIntervalRef.current) {
                            clearTimeout(reconnectIntervalRef.current);
                            reconnectIntervalRef.current = null;
                        }
                    };
                    
                    client.activate();
                    setStompClient(client);
                } else if (!stompClient.connected) {
                    // Nếu đã có client nhưng không kết nối, thử kết nối lại
                    stompClient.activate();
                }
            }, 3000 * (connectionAttempts + 1)); // Thời gian thử lại tăng dần
        }
        
        // Dọn dẹp timeout khi component unmount hoặc dependencies thay đổi
        return () => {
            if (reconnectIntervalRef.current) {
                clearTimeout(reconnectIntervalRef.current);
            }
        };
    }, [isConnected, studentData.email, connectionAttempts, stompClient]);

    // Tạo màu nền dựa trên ID khóa học (để luôn cố định cho mỗi khóa học)
    const getConsistentColor = (id) => {
        const colors = [
            'linear-gradient(to right, #4b6cb7, #182848)',
            'linear-gradient(to right, #1d75fb, #3e60ff)',
            'linear-gradient(to right, #ff416c, #ff4b2b)',
            'linear-gradient(to right, #11998e, #38ef7d)',
            'linear-gradient(to right, #8e2de2, #4a00e0)',
            'linear-gradient(to right, #fc4a1a, #f7b733)',
            'linear-gradient(to right, #5433ff, #20bdff)',
            'linear-gradient(to right, #2b5876, #4e4376)'
        ];
        if (!id) return colors[0]; 
        const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[sum % colors.length];
    };

    // Hàm tìm kiếm khóa học với phân trang
    const searchCourses = async (courseName, teacherName, pageNumber = 0, pageSize = 3, appendResults = false) => {
        if ((!courseName || courseName.trim() === '') && (!teacherName || teacherName.trim() === '')) {
            setSearchResults([]);
            setIsSearchOpen(false);
            return;
        }
        
        if (!appendResults) {
            setIsSearching(true);
        } else {
            setLoadingMoreResults(true);
        }
        
        setIsSearchOpen(true);
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Không tìm thấy token xác thực');
            }
            
            // Tạo form data theo yêu cầu của backend
            console.log(`Tìm kiếm với: courseName=${courseName}, teacherName=${teacherName}, pageNumber=${pageNumber}, pageSize=${pageSize}`);
            
            const response = await axios.get(`${SEARCH_COURSE_API}`, {
                params: {
                    courseName: courseName || '',
                    teacherName: teacherName || '',
                    pageNumber: pageNumber,
                    pageSize: pageSize
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data && response.data.code === 0) {
                console.log('Kết quả tìm kiếm:', response.data.result);
                
                // Cập nhật thông tin phân trang
                const pageInfo = response.data.result.page || {};
                setSearchPagination({
                    pageNumber: pageInfo.number || 0,
                    pageSize: pageInfo.size || 3,
                    totalPages: pageInfo.totalPages || 1,
                    totalElements: pageInfo.totalElements || 0
                });
                
                // Nếu là tải thêm, nối vào kết quả hiện tại
                if (appendResults) {
                    setSearchResults(prev => [...prev, ...(response.data.result.content || [])]);
                } else {
                    setSearchResults(response.data.result.content || []);
                }
            } else {
                if (!appendResults) {
                    setSearchResults([]);
                }
            }
        } catch (error) {
            console.error('Lỗi khi tìm kiếm khóa học:', error);
            // Hiển thị thông tin chi tiết lỗi để gỡ lỗi
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
            if (!appendResults) {
                setSearchResults([]);
            }
        } finally {
            setIsSearching(false);
            setLoadingMoreResults(false);
        }
    };

    // Cập nhật hàm xử lý thay đổi cho input tìm kiếm khóa học
    const handleSearchCourseChange = (e) => {
        const courseValue = e.target.value;
        setSearchQueryCourse(courseValue);
        
        // Xóa timeout hiện tại nếu có
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        // Tạo timeout mới để debounce
        searchTimeoutRef.current = setTimeout(() => {
            // Reset lại trang về 0 khi thực hiện tìm kiếm mới
            setSearchPagination(prev => ({
                ...prev,
                pageNumber: 0
            }));
            searchCourses(courseValue, searchQueryTeacher, 0, searchPagination.pageSize);
        }, 500); // Đợi 500ms sau khi người dùng ngừng gõ
    };
    
    // Cập nhật hàm xử lý thay đổi cho input tìm kiếm giảng viên
    const handleSearchTeacherChange = (e) => {
        const teacherValue = e.target.value;
        setSearchQueryTeacher(teacherValue);
        
        // Xóa timeout hiện tại nếu có
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        // Tạo timeout mới để debounce
        searchTimeoutRef.current = setTimeout(() => {
            // Reset lại trang về 0 khi thực hiện tìm kiếm mới
            setSearchPagination(prev => ({
                ...prev,
                pageNumber: 0
            }));
            searchCourses(searchQueryCourse, teacherValue, 0, searchPagination.pageSize);
        }, 500); // Đợi 500ms sau khi người dùng ngừng gõ
    };

    // Xóa timeout khi component unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Hàm xử lý tìm kiếm khi nhấn nút
    const handleSearch = () => {
        // Reset lại trang về 0 khi thực hiện tìm kiếm mới
        setSearchPagination(prev => ({
            ...prev,
            pageNumber: 0
        }));
        searchCourses(searchQueryCourse, searchQueryTeacher, 0, searchPagination.pageSize);
    };

    // Hàm xử lý tải thêm kết quả khi cuộn
    const loadMoreSearchResults = () => {
        if (searchPagination.pageNumber >= searchPagination.totalPages - 1) return;
        
        const nextPage = searchPagination.pageNumber + 1;
        searchCourses(searchQueryCourse, searchQueryTeacher, nextPage, searchPagination.pageSize, true);
    };

    // Theo dõi sự kiện cuộn để tải thêm kết quả
    useEffect(() => {
        const handleScroll = (e) => {
            if (!searchResultsRef.current || loadingMoreResults) return;
            
            const element = searchResultsRef.current;
            const isBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 20;
            
            if (isBottom && searchPagination.pageNumber < searchPagination.totalPages - 1) {
                loadMoreSearchResults();
            }
        };
        
        const searchResultsElement = searchResultsRef.current;
        if (searchResultsElement) {
            searchResultsElement.addEventListener('scroll', handleScroll);
        }
        
        return () => {
            if (searchResultsElement) {
                searchResultsElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, [loadingMoreResults, searchPagination.pageNumber, searchPagination.totalPages, searchQueryCourse, searchQueryTeacher]);

    // Cập nhật hàm fetchCourses để hỗ trợ phân trang
    const fetchCourses = async (pageNumber = 0, pageSize = 10, appendResults = false) => {
        if (!appendResults) {
            setLoading(true);
        } else {
            setLoadingMoreCourses(true);
        }
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Không tìm thấy token xác thực');
            
            // Fetch my courses with pagination
            const myCourseResponse = await axios.get(`${GET_MY_COURSE}`, {
                params: {
                    pageNumber: pageNumber,
                    pageSize: pageSize
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Extract data and pagination info
            const responseData = myCourseResponse.data;
            if (responseData.code === 0 && responseData.result) {
                const myCourses = responseData.result.content || [];
                
                // Update pagination information
                const pageInfo = responseData.result.page || {};
                setCoursesPagination({
                    pageNumber: pageInfo.number || 0,
                    pageSize: pageInfo.size || 10,
                    totalPages: pageInfo.totalPages || 1,
                    totalElements: pageInfo.totalElements || 0
                });
                
                // Fetch details and calculate progress for each course
                const coursesWithProgress = await Promise.all(myCourses.map(async (course) => {
                    try {
                        // Get course details
                        const courseDetailResponse = await axios.get(`${API_BASE_URL}/lms/course/${course.id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        
                        const courseDetail = courseDetailResponse.data.result;
                        
                        // Calculate progress percentage
                        const progressResponse = await axios.get(`${GET_PROGRESS_PERCENT}`, {
                            params: {
                                courseId: course.id,
                                studentId: studentData.id
                            },
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const progressPercentage = progressResponse.data.result
                        
                        
                        // Format last studied date if available
                        let lastStudiedInfo = "Chưa bắt đầu học";
                        
                        if (course.startDate) {
                            const date = new Date(course.startDate);
                            const now = new Date();
                            const diffTime = Math.abs(now - date);
                            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                            
                            if (diffDays === 0) {
                                lastStudiedInfo = "Học hôm nay";
                            } else if (diffDays === 1) {
                                lastStudiedInfo = "Học hôm qua";
                            } else if (diffDays < 30) {
                                lastStudiedInfo = `Học cách đây ${diffDays} ngày trước`;
                            } else if (diffDays < 365) {
                                const months = Math.floor(diffDays / 30);
                                lastStudiedInfo = `Học cách đây ${months} tháng trước`;
                            } else {
                                const years = Math.floor(diffDays / 365);
                                lastStudiedInfo = `Học cách đây ${years} năm trước`;
                            }
                        }
                        
                        return {
                            id: course.id,
                            title: courseDetail.name || "Khóa học",
                            lastStudied: lastStudiedInfo,
                            progress: progressPercentage,
                            path: `/learning/${course.id}`,
                            image: courseDetail.image
                        };
                    } catch (error) {
                        console.error(`Lỗi khi xử lý khóa học ${course.id}:`, error);
                        return null;
                    }
                }));
                
                // Filter out any null courses (failed to process)
                const validCourses = coursesWithProgress.filter(course => course !== null);
                
                // Append or replace the courses based on the appendResults flag
                if (appendResults) {
                    setCourses(prevCourses => [...prevCourses, ...validCourses]);
                } else {
                    setCourses(validCourses);
                }
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khóa học:", error);
        } finally {
            setLoading(false);
            setLoadingMoreCourses(false);
        }
    };

    // Hàm load thêm khóa học khi cuộn
    const loadMoreCourses = () => {
        if (coursesPagination.pageNumber >= coursesPagination.totalPages - 1) return;
        
        const nextPage = coursesPagination.pageNumber + 1;
        fetchCourses(nextPage, coursesPagination.pageSize, true);
    };

    // Theo dõi sự kiện cuộn để tải thêm khóa học
    useEffect(() => {
        // Chỉ áp dụng khi dropdown khóa học đang mở
        if (!isCoursesOpen) return;
        
        const handleScroll = (e) => {
            if (!coursesListRef.current || loadingMoreCourses) return;
            
            const element = coursesListRef.current;
            const isBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 20;
            
            if (isBottom && coursesPagination.pageNumber < coursesPagination.totalPages - 1) {
                loadMoreCourses();
            }
        };
        
        const coursesListElement = coursesListRef.current;
        if (coursesListElement) {
            coursesListElement.addEventListener('scroll', handleScroll);
        }
        
        return () => {
            if (coursesListElement) {
                coursesListElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, [isCoursesOpen, loadingMoreCourses, coursesPagination.pageNumber, coursesPagination.totalPages]);

    // Cập nhật useEffect để gọi fetchCourses khi dropdown mở
    useEffect(() => {
        if (isCoursesOpen && courses.length === 0) {
            fetchCourses(0, coursesPagination.pageSize);
        }
    }, [isCoursesOpen]);

    const handleLogout = () => {
        logout();
        navigate('/'); // Redirect to homepage after logout
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
            const response = await axios.get(`${API_BASE_URL}${avatarPath}`, {
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

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const toggleNotification = () => {
        setNotificationOpen(!isNotificationOpen);
        
        // Nếu dropdown được mở và chưa có thông báo, lấy danh sách thông báo
        if (!isNotificationOpen && notifications.length === 0) {
            fetchNotifications(0, notificationsPagination.pageSize);
        }
    };

    const toggleCourses = (e) => {
        e.preventDefault(); // Prevent navigation
        setCoursesOpen(!isCoursesOpen);
    };

    // Hàm đánh dấu thông báo đã đọc
    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Không tìm thấy token xác thực');
            
            // Gọi API đánh dấu đã đọc
            const response = await axios.put(`${API_BASE_URL}/lms/notifications/${id}/read`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data && response.data.code === 0) {
                // Cập nhật state local
                setNotifications(prevNotifications => 
                    prevNotifications.map(notification => 
                        notification.id === id ? { ...notification, read: true } : notification
                    )
                );
                // Giảm số lượng chưa đọc
                setUnreadCount(prevCount => Math.max(0, prevCount - 1));
            }
        } catch (error) {
            console.error('Lỗi khi đánh dấu đã đọc thông báo:', error);
        }
    };

    // Hàm đánh dấu tất cả thông báo đã đọc
    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Không tìm thấy token xác thực');
            
            // Cập nhật UI trước khi gọi API để tạo trải nghiệm mượt mà hơn
            setNotifications(prevNotifications => 
                prevNotifications.map(notification => ({
                    ...notification,
                    read: true
                }))
            );
            setUnreadCount(0);
            setNewNotificationIds(new Set());
            setNotificationHighlight(false);
            
            // Gọi API đánh dấu tất cả đã đọc
            const response = await axios.post(`${API_BASE_URL}/lms/notifications/readAll`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data && response.data.code !== 0) {
                // Nếu API thất bại, rollback lại trạng thái
                console.error('Lỗi khi đánh dấu đã đọc:', response.data);
                await fetchNotifications(0, notificationsPagination.pageSize);
            }
        } catch (error) {
            console.error('Lỗi khi đánh dấu tất cả thông báo đã đọc:', error);
            // Nếu có lỗi, fetch lại dữ liệu để đồng bộ với server
            await fetchNotifications(0, notificationsPagination.pageSize);
        }
    };

    // Lấy số lượng thông báo chưa đọc
    const getUnreadCount = () => {
        return unreadCount;
    };

    // Hàm để lấy danh sách thông báo từ API
    const fetchNotifications = async (pageNumber = 0, pageSize = 10, appendResults = false) => {
        if (!appendResults) {
            setNotificationsLoading(true);
        } else {
            setLoadingMoreNotifications(true);
        }
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Không tìm thấy token xác thực');
            
            // Gọi API lấy thông báo
            const response = await axios.get(NOTIFICATIONS_API, {
                params: {
                    pageNumber: pageNumber,
                    pageSize: pageSize
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data && response.data.code === 0) {
                console.log('API Notification Response:', response.data);
                
                const notificationsData = response.data.result;
                
                // Cập nhật số lượng thông báo chưa đọc
                setUnreadCount(notificationsData.countUnreadNotification || 0);
                
                // Xử lý danh sách thông báo
                const formattedNotifications = (notificationsData.notificationDetails || []).map(notification => {
                    return {
                        id: notification.notificationId,
                        title: getNotificationTitle(notification),
                        message: notification.description || notification.message || notification.content || 'Không có nội dung',
                        time: formatRelativeTime(notification.createdAt),
                        read: notification.isRead,
                        type: getNotificationType(notification),
                        rawType: notification.notificationType,
                        originalData: notification
                    };
                });
                
                // Kiểm tra xem còn thông báo để load không dựa vào số lượng thông báo nhận được
                const hasMore = formattedNotifications.length === pageSize;
                setHasMoreNotifications(hasMore);
                console.log(`Nhận được ${formattedNotifications.length} thông báo. Còn thông báo để load: ${hasMore}`);
                
                // Nếu là tải thêm, nối vào kết quả hiện tại và loại bỏ trùng lặp
                if (appendResults) {
                    setNotifications(prev => {
                        // Tạo Map để kiểm tra trùng lặp nhanh hơn
                        const existingIds = new Map(prev.map(n => [n.id, true]));
                        
                        // Chỉ thêm thông báo mới không trùng lặp
                        const uniqueNewNotifications = formattedNotifications.filter(n => !existingIds.has(n.id));
                        
                        console.log(`Đã lọc ${formattedNotifications.length - uniqueNewNotifications.length} thông báo trùng lặp`);
                        
                        return [...prev, ...uniqueNewNotifications];
                    });
                } else {
                    setNotifications(formattedNotifications);
                }
                
                // Cập nhật thông tin phân trang - chỉ dùng pageNumber để biết vị trí tiếp theo để load
                const nextStartPosition = pageNumber + pageSize;
                setNotificationsPagination(prev => ({
                    pageNumber: nextStartPosition,
                    pageSize: pageSize,
                    totalPages: 1, // Không còn quan trọng vì chúng ta không dựa vào totalPages nữa
                    totalElements: 1 // Không còn quan trọng vì chúng ta không dựa vào totalElements nữa
                }));
            }
        } catch (error) {
            console.error('Lỗi khi gọi API thông báo:', error);
            setHasMoreNotifications(false); // Nếu có lỗi, giả định không còn thông báo
        } finally {
            if (!appendResults) {
                setNotificationsLoading(false);
            } else {
                setLoadingMoreNotifications(false);
            }
        }
    };

    // Theo dõi sự kiện cuộn để tải thêm thông báo
    useEffect(() => {
        // Chỉ thêm event listener khi dropdown thông báo đang mở
        if (!isNotificationOpen) return;

        const handleScroll = () => {
            const element = notificationsListRef.current;
            if (!element || loadingMoreNotifications || !hasMoreNotifications) return;

            const isBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 20;
            
            if (isBottom) {
                console.log('Đã cuộn đến cuối danh sách thông báo');
                console.log('Vị trí tiếp theo để load:', notificationsPagination.pageNumber);
                console.log('Còn thông báo để load:', hasMoreNotifications ? 'Có' : 'Không');
                loadMoreNotifications();
            }
        };
        
        const notificationsElement = notificationsListRef.current;
        if (notificationsElement) {
            notificationsElement.addEventListener('scroll', handleScroll);
        }
        
        return () => {
            if (notificationsElement) {
                notificationsElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, [isNotificationOpen, loadingMoreNotifications, notificationsPagination, hasMoreNotifications]);

    // Hàm để tải thêm thông báo khi cuộn xuống
    const loadMoreNotifications = useCallback(() => {
        if (loadingMoreNotifications) {
            console.log('Đang tải thêm thông báo, bỏ qua yêu cầu mới');
            return;
        }
        
        if (!hasMoreNotifications) {
            console.log('Đã tải hết tất cả thông báo, không còn thông báo để load');
            return;
        }
        
        const currentPosition = notificationsPagination.pageNumber;
        console.log('Tải thêm thông báo từ vị trí:', currentPosition);
        fetchNotifications(currentPosition, notificationsPagination.pageSize, true);
    }, [loadingMoreNotifications, notificationsPagination, hasMoreNotifications, fetchNotifications]);

    // Cập nhật để lấy thông báo khi dropdown mở
    useEffect(() => {
        if (isNotificationOpen) {
            console.log('Dropdown thông báo được mở, tải thông báo ban đầu');
            setHasMoreNotifications(true); // Reset lại trạng thái khi mở dropdown
            setNotificationsPagination(prev => ({
                ...prev,
                pageNumber: 0
            }));
            fetchNotifications(0, 10, false);
        }
    }, [isNotificationOpen]);

    // Xử lý click vào kết quả tìm kiếm
    const handleSearchResultClick = async (course) => {
        setIsSearchOpen(false);
        setSearchQueryCourse('');
        setSearchQueryTeacher('');
        
        // Tạo slug từ tên khóa học (giống với CourseCard.jsx)
        let slug = '';
        
        if (course.name) {
            // Chuyển tiếng Việt có dấu thành không dấu
            let str = course.name.toLowerCase();
            str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            
            // Thay thế ký tự đặc biệt và dấu cách bằng dấu gạch ngang
            str = str.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            
            // Thêm timestamp để đảm bảo slug là duy nhất
            slug = `${str}-${Date.now()}`;
        } else {
            // Nếu không có tên, sử dụng ID và thêm timestamp
            slug = `course-${Date.now()}`;
        }
        
        // Kiểm tra xem sinh viên đã đăng ký khóa học này chưa
        let isEnrolled = false;
        
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                // Gọi API để lấy danh sách khóa học đã đăng ký
                const myCourseResponse = await axios.get(`${GET_MY_COURSE}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const myCourses = myCourseResponse.data.result.content || [];
                
                // Kiểm tra xem khóa học hiện tại có trong danh sách đã đăng ký không
                isEnrolled = myCourses.some(myCourse => myCourse.id === course.id);
                console.log(`Khóa học ${course.name} (ID: ${course.id}) đã đăng ký: ${isEnrolled}`);
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra trạng thái đăng ký khóa học:', error);
            // Nếu có lỗi, mặc định là false
            isEnrolled = false;
        }
        
        // Lưu ID khóa học vào localStorage với slug làm khóa
        localStorage.setItem(`course_${slug}`, course.id);
        localStorage.setItem(`course_${slug}_enrolled`, isEnrolled); // Lưu trạng thái đăng ký thực tế
        
        console.log(`Chuyển hướng đến khóa học với slug: ${slug}, ID: ${course.id}, đã đăng ký: ${isEnrolled}`);
        
        // Chuyển hướng đến trang chi tiết khóa học với slug
        navigate(`/courses/detail/${slug}`);
    };
    
    // Hàm để fetch ảnh đại diện khóa học
    const fetchCourseImage = async (course) => {
        // Nếu đã fetch ảnh này rồi thì không fetch lại
        if (courseImages[course.id]) return;
        
        // Nếu khóa học không có ảnh thì bỏ qua
        if (!course.image) return;
        
        try {
            // Lấy token xác thực
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('No authentication token found');
                return;
            }
            
            // Tạo URL đầy đủ cho ảnh
            const imageUrl = `${API_BASE_URL}${course.image}`;
            console.log(`Đang tải ảnh khóa học từ: ${imageUrl}`);
            
            // Gọi API để lấy ảnh với Bearer token sử dụng axios
            const response = await axios({
                method: 'GET',
                url: imageUrl,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob' // Quan trọng: yêu cầu response dạng blob
            });
            
            // Tạo URL object từ blob
            const imageObjectUrl = URL.createObjectURL(response.data);
            
            // Cập nhật state với URL ảnh
            setCourseImages(prev => ({
                ...prev,
                [course.id]: imageObjectUrl
            }));
        } catch (error) {
            console.error('Lỗi khi tải ảnh khóa học:', error);
        }
    };
    
    // Thêm useEffect để tải ảnh cho các khóa học trong kết quả tìm kiếm
    useEffect(() => {
        // Fetch ảnh cho mỗi khóa học có ảnh
        searchResults.forEach(course => {
            if (course.image) {
                fetchCourseImage(course);
            }
        });
        
        // Cleanup function để giải phóng URL object khi component unmount
        return () => {
            Object.values(courseImages).forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, [searchResults]);

    // Render kết quả tìm kiếm
    const renderSearchResults = () => {
        if (isSearching && searchResults.length === 0) {
            return (
                <div className="search-results-loading">
                    <div className="search-spinner"></div>
                    <span>Đang tìm kiếm...</span>
                </div>
            );
        }

        if (searchResults.length === 0) {
            return (
                <div className="search-results-empty">
                    <p>Không tìm thấy kết quả phù hợp</p>
                </div>
            );
        }

        return (
            <>
                <div className="search-results-list" ref={searchResultsRef}>
                    {searchResults.map(course => (
                        <div 
                            key={course.id} 
                            className="search-result-item"
                            onClick={() => handleSearchResultClick(course)}
                        >
                            <div className="search-result-image">
                                {courseImages[course.id] ? (
                                    <img 
                                        src={courseImages[course.id]} 
                                        alt={course.name} 
                                        className="search-result-img" 
                                    />
                                ) : (
                                    <div className="search-result-placeholder" style={{ background: getConsistentColor(course.id) }}>
                                        {course.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="search-result-content">
                                <div className="search-result-info">
                                    <div>
                                        <h4 className="search-result-title">{course.name}</h4>
                                        <span className="search-result-teacher">
                                            {course.teacher ? `Giảng viên: ${course.teacher.fullName}` : 'Chưa có giảng viên'}
                                        </span>
                                    </div>
                                    <span className={`search-result-status ${course.status?.toLowerCase() || 'unknown'}`}>
                                        {course.status || 'Không xác định'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {loadingMoreResults && (
                        <div className="search-results-loading-more">
                            <div className="search-spinner-small"></div>
                            <span>Đang tải thêm...</span>
                        </div>
                    )}
                </div>
                
                {searchResults.length > 0 && (
                    <div className="search-results-count">
                        Hiển thị: {searchResults.length}/{searchPagination.totalElements} kết quả
                    </div>
                )}
            </>
        );
    };

    const renderCourseContent = () => {
        if (loading && courses.length === 0) {
            return (
                <div className="header-courses-spinner">
                    <div className="header-spinner"></div>
                </div>
            );
        }

        if (courses.length === 0) {
            return (
                <div className="header-courses-empty">
                    <p>Bạn chưa đăng ký khóa học nào</p>
                </div>
            );
        }

        return (
            <>
                <div className="header-courses-list" ref={coursesListRef}>
                    {courses.map(course => (
                        <Link to={course.path} key={course.id} className="header-course-item">
                            <div className="header-course-image">
                                {courseImages[course.id] ? (
                                    <img 
                                        src={courseImages[course.id]} 
                                        alt={course.title} 
                                        className="search-result-img" 
                                    />
                                ) : (
                                    <div className="search-result-placeholder" style={{ background: getConsistentColor(course.id) }}>
                                        {course.title.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="header-course-content">
                                <h4 className="header-course-title">{course.title}</h4>
                                <div className="header-course-info">
                                    {course.lastStudied}
                                </div>
                                
                                {course.progress > 0 ? (
                                    <div className="header-progress-container">
                                        <div className="header-progress-bar">
                                            <div 
                                                className="header-progress-fill" 
                                                style={{ width: `${course.progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="header-progress-tooltip">
                                            Hoàn thành: {course.progress}%
                                        </div>
                                    </div>
                                ) : (
                                    <Link to={course.path} className="header-start-button">
                                        Bắt đầu học
                                    </Link>
                                )}
                            </div>
                        </Link>
                    ))}
                    
                    {loadingMoreCourses && (
                        <div className="header-courses-loading-more">
                            <div className="header-spinner-small"></div>
                            <span>Đang tải thêm...</span>
                        </div>
                    )}
                </div>
                
                {courses.length > 0 && coursesPagination.totalElements > 0 && (
                    <div className="header-courses-count">
                        Hiển thị: {courses.length}/{coursesPagination.totalElements} khóa học
                    </div>
                )}
            </>
        );
    };

    const handleChangePassword = async () => {
        setChangePasswordError('');
        setChangePasswordSuccess('');
        if (!oldPassword || !newPassword || !confirmPassword) {
            setChangePasswordError('Vui lòng nhập đầy đủ thông tin.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setChangePasswordError('Mật khẩu xác nhận không khớp.');
            return;
        }
        setChangePasswordLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(
                `${API_BASE_URL}/lms/account/changePassword`,
                { oldPassword, newPassword },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (response.data && response.data.code === 200) {
                setChangePasswordSuccess('Đổi mật khẩu thành công!');
                setTimeout(() => {
                    closePasswordModal();
                }, 500);
            } else {
                setChangePasswordError(response.data?.message || 'Đổi mật khẩu thất bại.');
            }
        } catch (err) {
            setChangePasswordError('Đổi mật khẩu thất bại. Vui lòng thử lại.');
        } finally {
            setChangePasswordLoading(false);
        }
    };

    // Hàm để đóng modal với hiệu ứng fade out
    const closePasswordModal = () => {
        setModalClosing(true);
        setTimeout(() => {
            setShowChangePassword(false);
            setModalClosing(false);
            // Reset các state khi đóng
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setChangePasswordError('');
            setChangePasswordSuccess('');
        }, 300); // thời gian phải khớp với thời gian animation
    };

    // Hàm tiện ích để định dạng thời gian thông báo (thời gian tương đối)
    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'Không xác định';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            
            if (diffHours === 0) {
                const diffMinutes = Math.floor(diffTime / (1000 * 60));
                
                if (diffMinutes === 0) {
                    return 'Vừa xong';
                }
                
                return `${diffMinutes} phút trước`;
            }
            
            return `${diffHours} giờ trước`;
        } else if (diffDays === 1) {
            return 'Hôm qua';
        } else if (diffDays < 7) {
            return `${diffDays} ngày trước`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} tuần trước`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} tháng trước`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `${years} năm trước`;
        }
    };

    // Hàm để lấy tiêu đề thông báo dựa trên loại thông báo
    const getNotificationTitle = (notification) => {
        // Nếu thông báo đã có tiêu đề, ưu tiên sử dụng
        if (notification.title && notification.title.trim() !== '') {
            return notification.title;
        }
        
        // Nếu không có tiêu đề, tạo tiêu đề dựa trên loại thông báo
        switch (notification.notificationType) {
            case 'COMMENT':
                return `Bình luận mới ${notification.sender ? 'từ ' + notification.sender : ''}`;
            case 'MESSAGE':
                return `Tin nhắn mới ${notification.sender ? 'từ ' + notification.sender : ''}`;
            case 'COMMENT_REPLY':
                return `Phản hồi bình luận ${notification.sender ? 'từ ' + notification.sender : ''}`;
            case 'CHAT_MESSAGE':
                return `Tin nhắn trò chuyện ${notification.sender ? 'từ ' + notification.sender : ''}`;
            case 'JOIN_CLASS_PENDING':
                return `Yêu cầu tham gia lớp ${notification.className || ''}`;
            case 'JOIN_CLASS_REJECTED':
                return `Từ chối tham gia lớp ${notification.className || ''}`;
            case 'JOIN_CLASS_APPROVED':
                return `Chấp nhận tham gia lớp ${notification.className || ''}`;
            case 'POST_CREATED':
                return `Bài đăng mới ${notification.sender ? 'từ ' + notification.sender : ''}`;
            case 'POST_COMMENT':
                return `Bình luận bài đăng ${notification.sender ? 'từ ' + notification.sender : ''}`;
            case 'POST_COMMENT_REPLY':
                return `Phản hồi bình luận bài đăng ${notification.sender ? 'từ ' + notification.sender : ''}`;
            default:
                return notification.title || 'Thông báo mới';
        }
    };

    // Hàm để lấy icon thông báo dựa trên loại thông báo
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'COMMENT':
            case 'COMMENT_REPLY':
            case 'POST_COMMENT':
            case 'POST_COMMENT_REPLY':
                return <MessageSquare size={16} />;
            case 'MESSAGE':
            case 'CHAT_MESSAGE':
                return <MessageCircle size={16} />;
            case 'JOIN_CLASS_PENDING':
                return <UserPlus size={16} />;
            case 'JOIN_CLASS_APPROVED':
                return <CheckCircle size={16} />;
            case 'JOIN_CLASS_REJECTED':
                return <XCircle size={16} />;
            case 'POST_CREATED':
                return <FileText size={16} />;
            default:
                return <Bell size={16} />;
        }
    };

    // Hàm để lấy loại thông báo cho CSS styling
    const getNotificationType = (notification) => {
        switch (notification.notificationType) {
            case 'COMMENT':
            case 'COMMENT_REPLY':
            case 'POST_COMMENT':
            case 'POST_COMMENT_REPLY':
                return 'comment';
            case 'MESSAGE':
            case 'CHAT_MESSAGE':
                return 'message';
            case 'JOIN_CLASS_PENDING':
            case 'JOIN_CLASS_APPROVED':
            case 'JOIN_CLASS_REJECTED':
                return 'enrollment';
            case 'POST_CREATED':
                return 'post';
            default:
                return 'general';
        }
    };

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    return (
        <header className="student-header">
            {/* Thêm audio cho thông báo */}
            <audio ref={audioRef} preload="auto">
                <source src={notificationSound} type="audio/mpeg" />
            </audio>
            
            <div className="left-section">
                <Link to="/courses"><img src={logo} alt="LMS Logo" className="logo" /></Link>
                <span className="title">Hệ Thống Học Tập Trực Tuyến</span>
            </div>

            <div className="student-header-search-box" ref={searchRef}>
                <div className="student-header-search-inputs">
                    <div className="student-header-search-input-group">
                        <span className="student-header-search-icon">
                            <Search size={18} color='#787878'/>
                        </span>
                        <input
                            type="text"
                            placeholder="Tên khóa học..."
                            value={searchQueryCourse}
                            onChange={handleSearchCourseChange}
                            onFocus={() => {
                                if (searchQueryCourse || searchQueryTeacher) setIsSearchOpen(true);
                            }}
                        />
                    </div>
                    <div className="student-header-search-input-group">
                        <span className="student-header-search-icon">
                            <User size={18} color='#787878'/>
                        </span>
                        <input
                            type="text"
                            placeholder="Tên giảng viên..."
                            value={searchQueryTeacher}
                            onChange={handleSearchTeacherChange}
                            onFocus={() => {
                                if (searchQueryCourse || searchQueryTeacher) setIsSearchOpen(true);
                            }}
                        />
                    </div>
                    <button 
                        className="search-button" 
                        onClick={handleSearch}
                        disabled={isSearching}
                    >
                        {isSearching ? (
                            <div className="search-button-spinner"></div>
                        ) : (
                            <Search size={18} color='#fff'/>
                        )}
                    </button>
                </div>
                
                {isSearchOpen && (searchQueryCourse || searchQueryTeacher) && (
                    <div className="search-results-dropdown">
                        <div className="search-results-header">
                            <h3>Kết quả tìm kiếm</h3>
                            <div className="search-results-close" onClick={() => setIsSearchOpen(false)}>
                                ×
                            </div>
                        </div>
                        {renderSearchResults()}
                    </div>
                )}
            </div>

            <div className="right-section">
                
                <div className="header-courses-dropdown-wrapper" ref={coursesRef}>
                    <a href="#" className="header-my-courses" onClick={toggleCourses}>Khóa học của tôi</a>
                    
                    {isCoursesOpen && (
                        <div className="header-courses-dropdown">
                            <div className="courses-header">
                                <h3>Khóa học của tôi</h3>
                                <Link to="/courses" className="view-all-link">Xem tất cả</Link>
                            </div>  
                            
                            {renderCourseContent()}
                        </div>
                    )}
                </div>
                
                <div className="bell-icon" ref={notificationRef}>
                    <div 
                        onClick={toggleNotification}
                        className={notificationHighlight ? 'notification-highlight' : ''}
                    >
                        <Bell size={20} />
                        {getUnreadCount() > 0 && (
                            <span className="notification-badge">{getUnreadCount()}</span>
                        )}
                    </div>
                    
                    {isNotificationOpen && (
                        <div className="notification-dropdown">
                            <div className="notification-header">
                                <h3>Thông Báo</h3>
                                <div className="notification-actions">
                                    <button className="notification-action" onClick={markAllAsRead}>
                                        <Check size={14} />
                                        <span>Đánh dấu đã đọc</span>
                                    </button>
                                </div>
                            </div>
                            
                            {notificationsLoading ? (
                                <div className="notification-loading">
                                    <div className="notification-spinner"></div>
                                    <span>Đang tải thông báo...</span>
                                </div>
                            ) : notifications.length > 0 ? (
                                <ul className="notification-list" 
                                    ref={notificationsListRef} 
                                    style={{ 
                                        maxHeight: '400px',
                                        overflowY: 'auto',
                                        overflowX: 'hidden'
                                    }}
                                >
                                    {notifications.map(notification => {
                                        // Kiểm tra xem có phải là thông báo mới không
                                        const isNew = newNotificationIds.has(notification.id);
                                        // Thêm class cho các loại thông báo - Sửa logic class để đảm bảo cập nhật ngay lập tức
                                        const itemClass = `notification-item ${notification.read === false ? 'notification-unread' : ''} notification-type-${notification.type} ${isNew ? 'notification-item-new' : ''}`;
                                        
                                        return (
                                            <li 
                                                key={notification.id} 
                                                className={itemClass}
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                <div className={`notification-icon notification-icon-${notification.type}`}>
                                                    {getNotificationIcon(notification.rawType)}
                                                </div>
                                                <div className="notification-content">
                                                    <h4 className="notification-title">
                                                        {notification.title}
                                                    </h4>
                                                    {notification.message && notification.message.length > 0 && (
                                                        <p className="notification-message">{notification.message}</p>
                                                    )}
                                                    <div className="notification-time">{notification.time}</div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                    
                                    {loadingMoreNotifications && (
                                        <li className="notification-loading-more">
                                            <div className="notification-spinner"></div>
                                            <span>Đang tải thêm thông báo...</span>
                                        </li>
                                    )}
                                </ul>
                            ) : (
                                <div className="notification-empty">
                                    <p>Bạn không có thông báo nào</p>
                                </div>
                            )}
                            
                            <div className="notification-footer">
                                <Link to="/notifications">Xem tất cả thông báo</Link>
                            </div>
                        </div>
                    )}
                </div>
                
                {user && (
                    <div className="profile-section">
                        <div className="profile-info" onClick={toggleDropdown} style={{ cursor: 'pointer' }}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className='avatar'/>
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
                        </div>
                       
                        {isDropdownOpen && (
                            <div className="profile-dropdown">
                                <Link to="/profile" className="header-dropdown-item" onClick={() => setDropdownOpen(false)}>
                                    <User size={16} />
                                    <span>Thông tin cá nhân</span>
                                </Link>
                                <button onClick={() => setShowChangePassword(true)} className="header-dropdown-item">
                                    <KeySquare size={16} />
                                    <span>Đổi mật khẩu</span>
                                </button>
                                <button onClick={handleLogout} className="header-dropdown-item logout-button">
                                    <LogOut size={16} />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Modal đổi mật khẩu với hiệu ứng fade */}
            {showChangePassword && (
                <div 
                    className={`password-modal-overlay ${modalClosing ? 'modal-exit' : 'modal-enter'}`}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closePasswordModal();
                    }}
                >
                    <div className="password-modal" onClick={e => e.stopPropagation()}>
                        <h2>Đổi Mật Khẩu</h2>
                        <input
                            type="password"
                            placeholder="Mật khẩu cũ"
                            value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Mật khẩu mới"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Xác nhận mật khẩu mới"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                        {changePasswordError && <div className="password-error-message">{changePasswordError}</div>}
                        {changePasswordSuccess && <div className="password-success-message">{changePasswordSuccess}</div>}
                        <div className="password-modal-actions">
                            <button onClick={closePasswordModal}>Hủy</button>
                            <button onClick={handleChangePassword} disabled={changePasswordLoading}>
                                {changePasswordLoading ? 'Đang xử lý...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default StudentHeader;