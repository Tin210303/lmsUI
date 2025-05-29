import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { HiOutlineUserGroup, HiPlusCircle, HiRefresh } from 'react-icons/hi';
import { BiChevronDown, BiPlus, BiMessageDetail, BiSearch, BiX, BiPencil } from 'react-icons/bi';
import { FiSend, FiPaperclip, FiMoreVertical } from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import '../../assets/css/chatbox.css';
import { SEND_MESSAGE_API, API_BASE_URL, GET_STUDENT_INFO, GET_TEACHER_INFO } from '../../services/apiService'; // Assuming API_BASE_URL is for WebSocket too
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { Users } from 'lucide-react'
import TextareaAutosize from 'react-textarea-autosize';
import '../../assets/css/chatbox-styles.css'; // Add additional styles
import { AuthContext } from '../../context/AuthContext';

// Thêm biến debug để kiểm soát việc hiển thị log
const DEBUG_MODE = true;
const debugLog = (message, ...args) => {
    if (DEBUG_MODE) {
        console.log(message, ...args);
    }
};

// Tạo component riêng để hiển thị avatar từ cache
const CachedAvatar = React.memo(({ avatarUrl, sender }) => {
    const [imgError, setImgError] = useState(false);
    
    if (imgError) {
        const initial = (sender.name || sender.accountFullname || sender.accountUsername || '?').charAt(0).toUpperCase();
        return (
            <div className="avatar-fallback">
                {initial}
            </div>
        );
    }
    
    return (
        <img 
            src={avatarUrl}
            alt={sender.name || sender.accountFullname || 'avatar'} 
            className="avatar-image loaded"
            onError={() => {
                console.log('Lỗi tải avatar từ cache:', avatarUrl);
                setImgError(true);
            }} 
        />
    );
});

// Component hiển thị avatar nhóm trong header
const GroupHeaderAvatar = React.memo(({ avatar, name, fetchAvatar }) => {
    const [imgError, setImgError] = useState(false);
    const [avatarBlobUrl, setAvatarBlobUrl] = useState(null);
    
    // Sử dụng useEffect để tải avatar với bearer token
    useEffect(() => {
        const loadAvatar = async () => {
            if (avatar) {
                try {
                    // Sử dụng hàm fetchAvatar đã có sẵn để tải avatar với token
                    const blobUrl = await fetchAvatar(avatar);
                    if (blobUrl) {
                        setAvatarBlobUrl(blobUrl);
                    }
                } catch (error) {
                    console.error('Lỗi khi tải avatar header với token:', error);
                    setImgError(true);
                }
            }
        };
        
        loadAvatar();
        
        // Cleanup function để revoke blob URL khi unmount
        return () => {
            if (avatarBlobUrl && avatarBlobUrl.startsWith('blob:')) {
                URL.revokeObjectURL(avatarBlobUrl);
            }
        };
    }, [avatar, fetchAvatar]);
    
    if (!avatar) {
        return <HiOutlineUserGroup className="chat-header-icon" />;
    }
    
    if (imgError || !avatarBlobUrl) {
        return <HiOutlineUserGroup className="chat-header-icon" size={24} />;
    }
    
    return (
        <img 
            src={avatarBlobUrl}
            alt={name} 
            className="chat-header-avatar"
            onError={() => {
                console.error('Lỗi hiển thị avatar nhóm trong header:', avatar);
                setImgError(true);
            }}
        />
    );
});

// Component hiển thị avatar nhóm trong panel thông tin
const GroupInfoAvatar = React.memo(({ chatbox, onOpenUploadModal, fetchAvatar }) => {
    const [imgError, setImgError] = useState(false);
    const [avatarBlobUrl, setAvatarBlobUrl] = useState(null);
    
    // Sử dụng useEffect để tải avatar với bearer token
    useEffect(() => {
        const loadAvatar = async () => {
            if (chatbox && chatbox.avatar) {
                try {
                    // Sử dụng hàm fetchAvatar đã có sẵn để tải avatar với token
                    const blobUrl = await fetchAvatar(chatbox.avatar);
                    if (blobUrl) {
                        setAvatarBlobUrl(blobUrl);
                    }
                } catch (error) {
                    console.error('Lỗi khi tải avatar với token:', error);
                    setImgError(true);
                }
            }
        };
        
        loadAvatar();
        
        // Cleanup function để revoke blob URL khi unmount
        return () => {
            if (avatarBlobUrl && avatarBlobUrl.startsWith('blob:')) {
                URL.revokeObjectURL(avatarBlobUrl);
            }
        };
    }, [chatbox?.avatar, fetchAvatar]);
    
    // Nếu không có chatbox hoặc avatar
    if (!chatbox || !chatbox.avatar) {
        return (
            <div className="group-avatar" onClick={chatbox?.group ? onOpenUploadModal : undefined} title={chatbox?.group ? "Nhấp để thay đổi ảnh đại diện" : ""}>
                <HiOutlineUserGroup size={40} />
                {chatbox?.group && <div className="avatar-upload-overlay">Thay đổi ảnh</div>}
            </div>
        );
    }
    
    if (imgError || !avatarBlobUrl) {
        return (
            <div className="group-avatar-fallback" onClick={chatbox?.group ? onOpenUploadModal : undefined} title={chatbox?.group ? "Nhấp để thay đổi ảnh đại diện" : ""}>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="40" width="40" xmlns="http://www.w3.org/2000/svg">
                    <path fill="none" d="M0 0h24v24H0z"></path>
                    <path d="M9 13.75c-2.34 0-7 1.17-7 3.5V19h14v-1.75c0-2.33-4.66-3.5-7-3.5zM4.34 17c.84-.58 2.87-1.25 4.66-1.25s3.82.67 4.66 1.25H4.34zM9 12c1.93 0 3.5-1.57 3.5-3.5S10.93 5 9 5 5.5 6.57 5.5 8.5 7.07 12 9 12zm0-5c.83 0 1.5.67 1.5 1.5S9.83 10 9 10s-1.5-.67-1.5-1.5S8.17 7 9 7zm7.04 6.81c1.16.84 1.96 1.96 1.96 3.44V19h4v-1.75c0-2.02-3.5-3.17-5.96-3.44zM15 12c1.93 0 3.5-1.57 3.5-3.5S16.93 5 15 5c-.54 0-1.04.13-1.5.35.63.89 1 1.98 1 3.15s-.37 2.26-1 3.15c.46.22.96.35 1.5.35z"></path>
                </svg>
                {chatbox?.group && <div className="avatar-upload-overlay">Thay đổi ảnh</div>}
            </div>
        );
    }
    
    return (
        <div className="group-avatar" onClick={chatbox?.group ? onOpenUploadModal : undefined} title={chatbox?.group ? "Nhấp để thay đổi ảnh đại diện" : ""}>
            <img 
                src={avatarBlobUrl}
                alt={chatbox.name || "Avatar nhóm"} 
                className="group-avatar-image"
                onError={() => {
                    console.error('Lỗi hiển thị avatar nhóm:', chatbox.avatar);
                    setImgError(true);
                }}
            />
            {chatbox?.group && <div className="avatar-upload-overlay">Thay đổi ảnh</div>}
        </div>
    );
});

const ChatboxPage = () => {
    const [allChatboxes, setAllChatboxes] = useState([]); // Stores all fetched chatboxes
    const [displayedChatboxes, setDisplayedChatboxes] = useState([]); // For UI rendering, can be filtered/typed later
    const [selectedChatbox, setSelectedChatbox] = useState(null);
    console.log('aaaaaaaaaaaaaaaa', selectedChatbox);
    
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    const [chatboxesLoading, setChatboxesLoading] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sendMessageLoading, setSendMessageLoading] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    const [chatboxesError, setChatboxesError] = useState(null);
    const [messagesError, setMessagesError] = useState(null);
    const [sendMessageError, setSendMessageError] = useState(null);

    const [chatboxesPage, setChatboxesPage] = useState({ pageNumber: 0, pageSize: 50, totalPages: 0 });
    const [messagesPage, setMessagesPage] = useState({ pageNumber: 0, pageSize: 20, totalPages: 0 });
    const [currentPage, setCurrentPage] = useState(0);
    const [totalMessageCount, setTotalMessageCount] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);

    const messagesEndRef = useRef(null);
    const chatMessagesContainerRef = useRef(null); // Ref for the messages container to check scroll position

    // Placeholder for current user ID - replace with actual logic
    const [currentUserId, setCurrentUserId] = useState(null);

    // New state for create channel modal
    const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [searchUserQuery, setSearchUserQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [createChannelError, setCreateChannelError] = useState(null);
    
    // WebSocket client reference
    const stompClientRef = useRef(null);

    // Add these state variables for direct chat modal
    const [showDirectChatModal, setShowDirectChatModal] = useState(false);
    const [directChatError, setDirectChatError] = useState(null);

    // Thêm state cho thông tin người dùng hiện tại từ API
    const [currentUserInfo, setCurrentUserInfo] = useState(null);

    // Thêm state theo dõi trạng thái kết nối WebSocket
    const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected'

    // Thêm state để theo dõi quá trình tải thông tin người dùng
    const [userInfoLoading, setUserInfoLoading] = useState(true);

    // Thêm ref để theo dõi subscription hiện tại
    const currentSubscriptionRef = useRef(null);

    // Thêm state cho thông báo
    const [notification, setNotification] = useState('');
    const [showNotification, setShowNotification] = useState(false);

    // Thêm ref để theo dõi tin nhắn đã xử lý, không dùng sessionStorage nữa
    const processedMessageIds = useRef(new Set());

    // Thêm state để quản lý việc hiển thị menu thông tin
    const [showChatInfo, setShowChatInfo] = useState(false);

    // Thêm state để lưu cache của avatar dưới dạng blob URL
    const [avatarCache, setAvatarCache] = useState({});

    // Thêm state cho chức năng upload avatar nhóm
    const [showAvatarUploadModal, setShowAvatarUploadModal] = useState(false);
    const [selectedGroupAvatar, setSelectedGroupAvatar] = useState(null);
    const [groupAvatarPreview, setGroupAvatarPreview] = useState(null);
    const [uploadingGroupAvatar, setUploadingGroupAvatar] = useState(false);
    const [uploadAvatarError, setUploadAvatarError] = useState(null);
    const avatarInputRef = useRef(null);

    // Thêm state cho chức năng đổi tên nhóm chat
    const [isEditingGroupName, setIsEditingGroupName] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [renamingError, setRenamingError] = useState(null);
    const groupNameInputRef = useRef(null);

    // Thêm state để theo dõi trạng thái mở/đóng của các section
    const [groupSectionExpanded, setGroupSectionExpanded] = useState(true);
    const [directMessageSectionExpanded, setDirectMessageSectionExpanded] = useState(true);

    // Thêm state để quản lý modal thêm thành viên
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [addMemberError, setAddMemberError] = useState(null);
    const [searchMemberQuery, setSearchMemberQuery] = useState('');
    const [searchMemberResults, setSearchMemberResults] = useState([]);
    const [selectedNewMembers, setSelectedNewMembers] = useState([]);
    const [isSearchingMembers, setIsSearchingMembers] = useState(false);

    // Thêm state để quản lý menu xóa thành viên
    const [activeMemberMenu, setActiveMemberMenu] = useState(null);
    const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [removingMember, setRemovingMember] = useState(false);
    const [removeMemberError, setRemoveMemberError] = useState(null);

    // Hàm tải avatar sử dụng axios với Bearer token
    const fetchAvatar = async (avatarUrl) => {
        if (!avatarUrl) return null;
        
        // Thêm logs để debug
        console.log('Đang cố gắng tải avatar từ:', avatarUrl);
        
        // Nếu đã có trong cache, trả về URL blob đó
        if (avatarCache[avatarUrl]) {
            console.log('Đã tìm thấy avatar trong cache');
            return avatarCache[avatarUrl];
        }
        
        try {
            // Lấy token xác thực
            const token = getToken();
            if (!token) {
                console.error("Không tìm thấy token xác thực.");
                return null;
            }
            
            // Xác định đường dẫn đầy đủ cho avatar
            let fullUrl;
            
            // Nếu đã là URL đầy đủ
            if (avatarUrl.startsWith('http')) {
                fullUrl = avatarUrl;
            } 
            // Nếu đường dẫn bắt đầu bằng /lms - sử dụng localhost:8080
            else if (avatarUrl.startsWith('/lms')) {
                fullUrl = `http://localhost:8080${avatarUrl}`;
            }
            // Các đường dẫn tương đối khác
            else {
                fullUrl = `http://localhost:8080/${avatarUrl.startsWith('/') ? avatarUrl.substring(1) : avatarUrl}`;
            }
            
            console.log('Tải avatar từ URL:', fullUrl);
            console.log('Sử dụng token:', token.substring(0, 10) + '...');
            
            // Gọi API để lấy dữ liệu avatar
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Lỗi khi tải avatar: ${response.status} ${response.statusText}`);
            }
            
            // Chuyển response thành blob
            const imageBlob = await response.blob();
            console.log('Kích thước blob:', imageBlob.size, 'bytes');
            
            if (imageBlob.size === 0) {
                console.error('Nhận được blob rỗng!');
                return null;
            }
            
            // Tạo URL object từ blob response
            const blobUrl = URL.createObjectURL(imageBlob);
            console.log('Đã tạo blob URL:', blobUrl);
            
            // Lưu vào state cache
            setAvatarCache(prev => ({
                ...prev,
                [avatarUrl]: blobUrl
            }));
            
            return blobUrl;
        } catch (error) {
            console.error('Lỗi chi tiết khi tải avatar:', error);
            return null;
        }
    };
    
    // Sử dụng useEffect để tải avatar khi component mount và khi selectedChatbox thay đổi
    useEffect(() => {
        // Tải avatar cho tất cả thành viên trong chatbox được chọn
        const loadAvatars = async () => {
            if (selectedChatbox && selectedChatbox.memberAccountUsernames) {
                for (const member of selectedChatbox.memberAccountUsernames) {
                    if (member.avatar) {
                        await fetchAvatar(member.avatar);
                    }
                }
            }
        };
        
        loadAvatars();
    }, [selectedChatbox]);
    
    // Thêm useEffect để tải avatar khi tìm kiếm người dùng
    useEffect(() => {
        // Tải avatar cho kết quả tìm kiếm
        const loadSearchResultAvatars = async () => {
            if (searchResults && searchResults.length > 0) {
                for (const user of searchResults) {
                    if (user.avatar) {
                        await fetchAvatar(user.avatar);
                    }
                }
            }
        };
        
        loadSearchResultAvatars();
    }, [searchResults]);
    
    // Thêm useEffect để tải avatar cho người dùng đã chọn
    useEffect(() => {
        // Tải avatar cho người dùng đã chọn
        const loadSelectedUserAvatars = async () => {
            if (selectedUsers && selectedUsers.length > 0) {
                for (const user of selectedUsers) {
                    if (user.avatar) {
                        await fetchAvatar(user.avatar);
                    }
                }
            }
        };
        
        loadSelectedUserAvatars();
    }, [selectedUsers]);

    // Thêm hàm để hiển thị/ẩn menu thông tin
    const toggleChatInfo = () => {
        setShowChatInfo(!showChatInfo);
    };

    // Thêm useEffect để cập nhật class của chat-area khi showChatInfo thay đổi
    useEffect(() => {
        const chatArea = document.querySelector('.chat-area');
        if (chatArea) {
            if (showChatInfo) {
                chatArea.classList.add('info-panel-active');
            } else {
                chatArea.classList.remove('info-panel-active');
            }
        }
    }, [showChatInfo]);

    // Function to get current user info - can be called multiple times without duplicating API calls
    const getCurrentUserInfo = async (retry = true) => {
        try {
            setUserInfoLoading(true);
            
            // Lấy token
            const token = getToken();
            if (!token) {
                console.error("❌ Không tìm thấy token. Không thể lấy thông tin người dùng.");
                setUserInfoLoading(false);
                return null;
            }
            
            // Xác định API endpoint dựa trên role từ localStorage (chỉ để xác định đường dẫn API)
            let userInfoEndpoint = GET_STUDENT_INFO; // Mặc định là student
            
            try {
                // Thử lấy role từ localStorage để xác định endpoint
                const localUserInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
                const userRole = localUserInfo.role || '';
                
                if (userRole.toLowerCase().includes('teacher') || userRole.toLowerCase().includes('admin')) {
                    userInfoEndpoint = GET_TEACHER_INFO;
                }
            } catch (error) {
                console.warn("⚠️ Không thể đọc role từ localStorage, sử dụng endpoint mặc định:", error);
            }
            
            console.log(`🔍 Đang gọi API lấy thông tin người dùng từ ${userInfoEndpoint}`);
            
            // Gọi API để lấy thông tin người dùng
            const response = await axios.get(userInfoEndpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.data && response.data.result) {
                const apiUserInfo = response.data.result;
                
                console.log('✅ Đã nhận thông tin người dùng từ API:', apiUserInfo);
                
                // Lưu thông tin người dùng từ API vào state
                setCurrentUserInfo(apiUserInfo);
                
                // Cập nhật currentUserId
                if (apiUserInfo.id) {
                    setCurrentUserId(apiUserInfo.id.toString());
                    console.log('ID người dùng từ API:', apiUserInfo.id.toString());
                }
                
                // Cũng cập nhật thông tin vào localStorage để làm cache và sử dụng khi khởi động
                localStorage.setItem('apiUserInfo', JSON.stringify(apiUserInfo));
                
                setUserInfoLoading(false);
                return apiUserInfo;
            } else {
                console.error("❌ Phản hồi API không hợp lệ khi lấy thông tin người dùng:", response.data);
                setUserInfoLoading(false);
                return null;
            }
        } catch (error) {
            console.error("❌ Lỗi khi lấy thông tin người dùng từ API:", error);
            
            // Thử lấy từ cache (localStorage) nếu có lỗi và chưa retry
            if (retry) {
                console.log("🔄 Thử lấy từ cache localStorage...");
                try {
                    const cachedApiUserInfo = JSON.parse(localStorage.getItem('apiUserInfo'));
                    if (cachedApiUserInfo) {
                        console.log("✅ Đã lấy thông tin người dùng từ cache:", cachedApiUserInfo);
                        setCurrentUserInfo(cachedApiUserInfo);
                        
                        if (cachedApiUserInfo.id) {
                            setCurrentUserId(cachedApiUserInfo.id.toString());
                        }
                        
                        setUserInfoLoading(false);
                        return cachedApiUserInfo;
                    }
                } catch (cacheError) {
                    console.error("❌ Lỗi khi lấy thông tin người dùng từ cache:", cacheError);
                }
                
                // Thử lại sau 3 giây nếu lần đầu thất bại
                console.log("⏱️ Lỗi kết nối, thử lại sau 3 giây...");
                setTimeout(() => getCurrentUserInfo(false), 3000);
            }
            
            setUserInfoLoading(false);
            return null;
        }
    };

    // Cập nhật useEffect để sử dụng thông tin người dùng từ API
    useEffect(() => {
        console.log("🚀 Khởi tạo component...");
        
        // Reset danh sách tin nhắn đã xử lý mỗi khi component mount
        processedMessageIds.current.clear();
        
        // Gọi API để lấy thông tin người dùng
        getCurrentUserInfo().then(userInfo => {
            if (userInfo) {
                console.log("✅ Đã khởi tạo thông tin người dùng từ API");
                
                // Tiếp tục khởi tạo sau khi có thông tin người dùng
                fetchChatboxesInitial();
                connectWebSocket();
            } else {
                console.error("❌ Không thể lấy thông tin người dùng từ API");
                
                // Vẫn tiếp tục khởi tạo với thông tin có sẵn
                fetchChatboxesInitial();
                connectWebSocket();
            }
        });
        
        // Cleanup khi unmount
        return () => {
            disconnectWebSocket();
            // Xóa dữ liệu trạng thái
            processedMessageIds.current.clear();
            
            // Giải phóng bộ nhớ từ avatar blob URLs
            Object.values(avatarCache).forEach(blobUrl => {
                try {
                    URL.revokeObjectURL(blobUrl);
                } catch (error) {
                    console.error("Lỗi khi giải phóng bộ nhớ blob URL:", error);
                }
            });
        };
    }, []);

    // Tách hàm để kết nối và ngắt kết nối WebSocket
    const connectWebSocket = () => {
        debugLog("🔄 Bắt đầu kết nối WebSocket...");
        
        // Ngắt kết nối cũ nếu có
        disconnectWebSocket();
        
        return new Promise((resolve, reject) => {
            const token = getToken();
            if (!token) {
                console.error("❌ Không thể kết nối WebSocket: Không tìm thấy token");
                setConnectionStatus('disconnected');
                reject(new Error("Không tìm thấy token"));
                return;
            }
            
            setConnectionStatus('connecting');
            
            try {
                // Tạo kết nối SockJS mới
                const socket = new SockJS(`${API_BASE_URL}/lms/ws`);
                
                // Cấu hình STOMP client
                const client = new Client({
                    webSocketFactory: () => socket,
                    debug: function (str) {
                        if (str.includes('CONNECTED') || str.includes('ERROR') || str.includes('DISCONNECT')) {
                            debugLog('[STOMP DEBUG]:', str);
                        }
                    },
                    reconnectDelay: 1000, // Giảm thời gian chờ kết nối lại
                    heartbeatIncoming: 4000,
                    heartbeatOutgoing: 4000,
                    connectHeaders: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                // Xử lý khi kết nối thành công
                client.onConnect = (frame) => {
                    console.log('✅ Đã kết nối thành công tới WebSocket!', frame);
                    setConnectionStatus('connected');
                    
                    // QUAN TRỌNG: Đăng ký kênh nhận tin nhắn cá nhân
                    client.subscribe('/user/queue/messages', (message) => {
                        try {
                            debugLog('📩 Tin nhắn từ /user/queue/messages:', message.body);
                            const messageData = JSON.parse(message.body);
                            
                            // Xử lý tin nhắn ngay lập tức
                            handleIncomingMessage(messageData);
                        } catch (error) {
                            console.error('❌ Lỗi khi xử lý tin nhắn từ /user/queue/messages:', error);
                        }
                    });
                    
                    // Đăng ký kênh topic/messages cho tin nhắn công khai
                    client.subscribe('/topic/messages', (message) => {
                        try {
                            debugLog('📩 Tin nhắn công khai từ /topic/messages:', message.body);
                            const messageData = JSON.parse(message.body);
                            
                            // Xử lý tin nhắn ngay lập tức
                            handleIncomingMessage(messageData);
                        } catch (error) {
                            console.error('❌ Lỗi khi xử lý tin nhắn công khai:', error);
                        }
                    });
                    
                    // QUAN TRỌNG: Đăng ký nhận thông báo về chatbox mới
                    client.subscribe('/user/queue/chatbox', (message) => {
                        try {
                            debugLog('📦 Cập nhật chatbox từ /user/queue/chatbox:', message.body);
                            const chatboxData = JSON.parse(message.body);
                            
                            // Cập nhật danh sách chatbox
                            updateChatboxList(chatboxData);
                            
                            // Nếu đây là chatbox mới, đăng ký kênh của nó
                            if (chatboxData && chatboxData.id) {
                                console.log('🔔 Phát hiện chatbox mới, đăng ký kênh:', chatboxData.id);
                                // Đăng ký kênh chatbox mới
                                subscribeToSpecificChatbox(chatboxData.id);
                            }
                        } catch (error) {
                            console.error('❌ Lỗi khi xử lý cập nhật chatbox:', error);
                        }
                    });
                    
                    // Đăng ký kênh thông báo cá nhân dựa trên email của người dùng
                    if (currentUserInfo && currentUserInfo.email) {
                        const notificationChannel = `/topic/notifications/${currentUserInfo.email}`;
                        console.log('🔔 Đăng ký kênh thông báo cá nhân:', notificationChannel);
                        
                        client.subscribe(notificationChannel, (message) => {
                            try {
                                debugLog('🔔 Thông báo từ kênh cá nhân:', message.body);
                                const notificationData = JSON.parse(message.body);
                                
                                // TODO: Xử lý thông báo ở đây
                                console.log('📣 Đã nhận thông báo mới:', notificationData);
                                
                                // Hiển thị thông báo cho người dùng
                                showTemporaryNotification(`Thông báo mới: ${notificationData.content || 'Bạn có thông báo mới'}`);
                            } catch (error) {
                                console.error('❌ Lỗi khi xử lý thông báo cá nhân:', error);
                            }
                        });
                    } else {
                        console.warn('⚠️ Không thể đăng ký kênh thông báo: Thiếu thông tin email người dùng');
                    }
                    
                    // Đăng ký tất cả các kênh chatbox nếu đã có danh sách
                    debugLog('Kiểm tra danh sách chatbox có sẵn để đăng ký:', allChatboxes.length);
                    if (allChatboxes.length > 0) {
                        console.log(`🔔 Đăng ký ${allChatboxes.length} kênh chatbox đã có sẵn`);
                        subscribeToAllChatboxChannels(allChatboxes);
                    }
                    
                    // Nếu đã chọn chatbox, đăng ký kênh chatbox cụ thể
                    if (selectedChatbox) {
                        console.log('🔔 Đăng ký kênh cho chatbox đang được chọn:', selectedChatbox.id);
                        subscribeToSpecificChatbox(selectedChatbox.id);
                    }
                    
                    // Kiểm tra định kỳ trạng thái kết nối
                    const checkConnectionInterval = setInterval(() => {
                        if (!client.connected) {
                            console.warn('⚠️ WebSocket đã mất kết nối, đang thử kết nối lại...');
                            clearInterval(checkConnectionInterval);
                            connectWebSocket();
                        }
                    }, 5000); // Kiểm tra mỗi 5 giây
                    
                    // Lưu interval ID để có thể clear khi cần
                    client.checkConnectionIntervalId = checkConnectionInterval;
                    
                    // Giải quyết promise sau khi kết nối thành công
                    resolve(client);
                };
                
                // Xử lý lỗi STOMP
                client.onStompError = (frame) => {
                    console.error('❌ Lỗi STOMP:', frame.headers['message'], frame.body);
                    setConnectionStatus('disconnected');
                    
                    // Reject promise khi có lỗi
                    reject(new Error(`Lỗi STOMP: ${frame.headers['message']}`));
                    
                    // Thử kết nối lại sau một khoảng thời gian
                    setTimeout(() => connectWebSocket().catch(err => console.error('Lỗi kết nối lại:', err)), 2000);
                };
                
                // Xử lý đóng kết nối WebSocket
                client.onWebSocketClose = () => {
                    console.warn('⚠️ Kết nối WebSocket đã đóng, đang thử kết nối lại...');
                    setConnectionStatus('connecting');
                    
                    // Thử kết nối lại sau một khoảng thời gian
                    setTimeout(() => connectWebSocket().catch(err => console.error('Lỗi kết nối lại:', err)), 1000);
                };
                
                // Kích hoạt kết nối
                client.activate();
                stompClientRef.current = client;
                
                // Set up ping định kỳ để giữ kết nối
                const pingInterval = setInterval(() => {
                    if (stompClientRef.current && stompClientRef.current.connected) {
                        debugLog('Ping WebSocket để giữ kết nối...');
                        
                        // Gửi message ping để giữ kết nối sống
                        try {
                            stompClientRef.current.publish({
                                destination: '/app/chat/ping',
                                body: JSON.stringify({ timestamp: new Date().toISOString() })
                            });
                        } catch (error) {
                            console.warn('⚠️ Không thể ping WebSocket:', error);
                            // Thử kết nối lại nếu không thể ping
                            connectWebSocket().catch(err => console.error('Lỗi kết nối lại sau ping:', err));
                        }
                    } else {
                        console.warn('⚠️ WebSocket không kết nối, đang thử kết nối lại...');
                        connectWebSocket().catch(err => console.error('Lỗi kết nối lại từ ping interval:', err));
                    }
                }, 15000); // Ping mỗi 15 giây
                
                // Lưu interval ID để có thể clear khi cần
                client.pingIntervalId = pingInterval;
                
            } catch (error) {
                console.error('❌ Lỗi khi thiết lập kết nối WebSocket:', error);
                setConnectionStatus('disconnected');
                
                // Reject promise khi có lỗi
                reject(error);
                
                // Thử kết nối lại sau một khoảng thời gian
                setTimeout(() => connectWebSocket().catch(err => console.error('Lỗi kết nối lại sau lỗi:', err)), 2000);
            }
        });
    };

    // Hàm ngắt kết nối WebSocket
    const disconnectWebSocket = () => {
        // Hủy đăng ký kênh chatbox hiện tại
        unsubscribeFromCurrentChatbox();
        
        // Hủy đăng ký tất cả các kênh global
        if (window.chatboxSubscriptions) {
            Object.values(window.chatboxSubscriptions).forEach(subscription => {
                try {
                    subscription.unsubscribe();
                } catch (error) {
                    console.error('Lỗi khi hủy đăng ký kênh global:', error);
                }
            });
            window.chatboxSubscriptions = {};
        }
        
        if (stompClientRef.current) {
            try {
                // Clear ping interval nếu có
                if (stompClientRef.current.pingIntervalId) {
                    clearInterval(stompClientRef.current.pingIntervalId);
                }
                
                // Ngắt kết nối WebSocket
                if (stompClientRef.current.connected) {
                    console.log('Đang ngắt kết nối WebSocket...');
                    stompClientRef.current.deactivate();
                }
                
                stompClientRef.current = null;
            } catch (error) {
                console.error('Lỗi khi ngắt kết nối WebSocket:', error);
            }
        }
    };

    // Cập nhật danh sách chatbox khi nhận được thông báo từ WebSocket
    const updateChatboxList = (chatboxData) => {
        if (!chatboxData || !chatboxData.id) {
            console.warn('Dữ liệu chatbox không hợp lệ:', chatboxData);
            return;
        }
        
        // Cập nhật danh sách chatbox
        setAllChatboxes(prev => {
            // Kiểm tra xem chatbox đã tồn tại chưa
            const exists = prev.some(cb => cb.id === chatboxData.id);
            
            if (exists) {
                // Cập nhật chatbox hiện có
                return prev.map(cb => cb.id === chatboxData.id ? chatboxData : cb);
            } else {
                // Thêm chatbox mới vào đầu danh sách
                return [chatboxData, ...prev];
            }
        });
        
        // Cũng cập nhật danh sách hiển thị
        setDisplayedChatboxes(prev => {
            const exists = prev.some(cb => cb.id === chatboxData.id);
            
            if (exists) {
                return prev.map(cb => cb.id === chatboxData.id ? chatboxData : cb);
            } else {
                return [chatboxData, ...prev];
            }
        });
        
        // Nếu đang đợi tin nhắn cho chatbox này, cập nhật trạng thái
        if (selectedChatbox?.id === chatboxData.id) {
            setSelectedChatbox(chatboxData);
        }
        
        // Làm mới danh sách chatbox nếu chưa có
        if (allChatboxes.length === 0) {
            fetchChatboxesInitial();
        }
    };

    // Xử lý tin nhắn đến từ WebSocket - đơn giản hóa
    const handleIncomingMessage = (messageData) => {
        // Debug
        console.log(`🔍 Xử lý tin nhắn ${messageData.id} đến chatbox ${messageData.chatBoxId}`);
        
        // Kiểm tra tin nhắn hợp lệ - phải có ID chatbox
        if (!messageData || !messageData.chatBoxId) {
            console.warn('❌ Tin nhắn không hợp lệ:', messageData);
            return;
        }
        
        // Xác định email của người dùng hiện tại từ API hoặc localStorage
        const currentUserEmail = currentUserInfo?.email || 
                                JSON.parse(localStorage.getItem('userInfo'))?.email || 
                                localStorage.getItem('email');
        
        // Trích xuất thông tin người gửi và so sánh email
        let sender;
        let isFromCurrentUser = false;
        
        if (messageData.senderAccount && Array.isArray(messageData.senderAccount) && messageData.senderAccount.length > 0) {
            const senderData = messageData.senderAccount[0];
            
            // So sánh chính xác bằng email
            isFromCurrentUser = currentUserEmail && senderData.accountUsername === currentUserEmail;
            
            // Tạo đối tượng người gửi
            sender = {
                id: senderData.accountId,
                name: senderData.accountFullname,
                username: senderData.accountUsername,
                email: senderData.accountUsername, // Thường là email
                avatarUrl: senderData.avatar,
                accountId: senderData.accountId,
                accountUsername: senderData.accountUsername,
                accountFullname: senderData.accountFullname,
                avatar: senderData.avatar
            };
        } 
        // Thử tìm thông tin người gửi nếu không có mảng senderAccount nhưng có thông tin sender trực tiếp
        else if (messageData.senderAccount && typeof messageData.senderAccount === 'string') {
            // Trường hợp senderAccount là email thay vì mảng
            const senderEmail = messageData.senderAccount;
            
            // So sánh chính xác bằng email
            isFromCurrentUser = currentUserEmail && senderEmail === currentUserEmail;
            
            sender = { 
                id: 'unknown', 
                name: senderEmail.split('@')[0] || 'Người dùng',
                username: senderEmail,
                email: senderEmail,
                avatarUrl: messageData.avatarSenderAccount || null, // Thêm xử lý avatarSenderAccount
                accountUsername: senderEmail
            };
        }
        // Nếu không có thông tin người gửi, sử dụng mặc định
        else {
            console.warn('⚠️ Tin nhắn không có thông tin người gửi rõ ràng, sử dụng thông tin mặc định');
            sender = { 
                id: 'unknown', 
                name: 'Người dùng không xác định',
                username: 'unknown',
                email: 'unknown',
                avatarUrl: null
            };
        }
        
        // Chuẩn bị tin nhắn đã xử lý
        const processedMessage = {
            ...messageData,
            sender: sender,
            isFromCurrentUser: isFromCurrentUser,
            isOptimistic: false
        };
        
        // Xem tin nhắn có phải là rỗng hay không
        if (!processedMessage.content && !processedMessage.path) {
            console.warn('⚠️ Tin nhắn rỗng, bỏ qua');
            return;
        }
        
        console.log(`✅ Đã xử lý tin nhắn: ${isFromCurrentUser ? 'Từ người dùng hiện tại' : 'Từ người khác'}`);
        
        // Cập nhật tin nhắn trong chatbox hiện tại nếu đang chọn chatbox này
        if (selectedChatbox && selectedChatbox.id === messageData.chatBoxId) {
            setMessages(prev => {
                // Kiểm tra xem tin nhắn đã tồn tại hay là tin nhắn optimistic không
                const existingMessage = prev.find(msg => 
                    msg.id === processedMessage.id || 
                    (msg.id?.toString().startsWith('temp-') && 
                     msg.content === processedMessage.content &&
                     msg.isOptimistic)
                );
                
                // Nếu đã tồn tại trong state và không phải là tin nhắn optimistic, bỏ qua
                if (existingMessage && !existingMessage.isOptimistic) {
                    console.log(`⏩ Bỏ qua tin nhắn ${processedMessage.id} đã có trong state`);
                    return prev;
                }
                
                // Nếu là tin nhắn optimistic cần cập nhật
                if (existingMessage && existingMessage.isOptimistic) {
                    console.log(`✅ Cập nhật tin nhắn optimistic ${existingMessage.id} thành tin nhắn thực tế ${processedMessage.id}`);
                    return prev.map(msg => 
                        (msg.id === existingMessage.id || 
                         (msg.id?.toString().startsWith('temp-') && 
                          msg.content === processedMessage.content)) 
                            ? processedMessage 
                            : msg
                    );
                }
                
                // Nếu là tin nhắn mới, thêm vào và sắp xếp
                console.log('✅ Thêm tin nhắn mới vào danh sách:', processedMessage.content);
                
                // Thêm thông báo âm thanh nếu tin nhắn từ người khác
                if (!isFromCurrentUser) {
                    try {
                        // Tạo âm thanh thông báo tin nhắn mới
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1111/1111.wav');
                        audio.volume = 0.5;
                        audio.play().catch(err => console.log('Không thể phát âm thanh thông báo:', err));
                    } catch (e) {
                        console.log('Lỗi khi phát âm thanh thông báo:', e);
                    }
                }
                
                const newMessages = [...prev, processedMessage];
                console.log(`✅ Danh sách tin nhắn mới có ${newMessages.length} tin nhắn (thêm 1 từ ${prev.length})`);
                
                // Cuộn xuống cuối khi có tin nhắn mới
                setTimeout(() => {
                    scrollToBottom(true);
                }, 100);
                
                return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            });
        } else {
            // Nếu không phải chatbox đang chọn, cập nhật thông tin cho chatbox đó và phát âm thanh
            console.log(`📢 Có tin nhắn mới trong chatbox ${messageData.chatBoxId} (không phải chatbox đang chọn)`);
            
            // Phát âm thanh thông báo tin nhắn mới (ở mức nhỏ hơn)
            try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1111/1111.wav');
                audio.volume = 0.3;
                audio.play().catch(err => console.log('Không thể phát âm thanh thông báo:', err));
            } catch (e) {
                console.log('Lỗi khi phát âm thanh thông báo:', e);
            }
        }
        
        // Luôn cập nhật thông tin chatbox, bất kể đang chọn chatbox nào
        updateChatboxWithMessage(messageData.chatBoxId, processedMessage);
    };

    // Cập nhật thông tin chatbox với tin nhắn mới
    const updateChatboxWithMessage = (chatBoxId, message) => {
        const updateChatbox = cb => {
            if (cb.id === chatBoxId) {
                // Xác định xem đây có phải là tin nhắn mới không
                const isNewMessage = !selectedChatbox || selectedChatbox.id !== chatBoxId;
                
                // Cập nhật thông tin tin nhắn cuối cùng
                return {
                    ...cb,
                    lastMessage: message.content,
                    lastMessageBy: message.sender?.name || message.sender?.accountFullname || 'Người dùng',
                    lastMessageTime: message.createdAt,
                    // Đánh dấu có tin nhắn mới nếu không phải là chatbox đang chọn
                    hasNewMessages: isNewMessage,
                    newMessageCount: isNewMessage ? (cb.newMessageCount || 0) + 1 : 0
                };
            }
            return cb;
        };
        
        // Cập nhật cả hai danh sách
        setAllChatboxes(prev => prev.map(updateChatbox));
        setDisplayedChatboxes(prev => prev.map(updateChatbox));
    };

    // Cậi thiện hàm xử lý khi chọn chatbox để đảm bảo ẩn panel thông tin khi chuyển chatbox
    const handleSelectChatbox = (chatbox) => {
        if (selectedChatbox?.id === chatbox.id) return; 
        
        console.log(`🔘 Đang chọn chatbox: ${chatbox.id}`);
        
        // Ẩn panel thông tin khi chuyển chatbox
        setShowChatInfo(false);
        
        // Hủy subscription trước đó nếu có
        unsubscribeFromCurrentChatbox();
        
        // Đặt lại flag tin nhắn mới và đếm số lượng khi chọn chatbox
        if (chatbox.hasNewMessages) {
            setAllChatboxes(prev => 
                prev.map(cb => 
                    cb.id === chatbox.id 
                    ? { ...cb, hasNewMessages: false, newMessageCount: 0 } 
                    : cb
                )
            );
            
            setDisplayedChatboxes(prev => 
                prev.map(cb => 
                    cb.id === chatbox.id 
                    ? { ...cb, hasNewMessages: false, newMessageCount: 0 } 
                    : cb
                )
            );
        }
        
        // Thiết lập chatbox được chọn
        setSelectedChatbox(chatbox);
        
        // Đăng ký kênh WebSocket cho chatbox đã chọn NGAY LẬP TỨC
        if (stompClientRef.current && stompClientRef.current.connected) {
            console.log(`🔔 Đăng ký kênh WebSocket ngay lập tức cho chatbox: ${chatbox.id}`);
            subscribeToSpecificChatbox(chatbox.id);
        } else {
            console.log('⚠️ WebSocket chưa kết nối, đang thử kết nối và đăng ký kênh...');
            connectWebSocket()
                .then(() => subscribeToSpecificChatbox(chatbox.id))
                .catch(err => console.error('❌ Lỗi khi kết nối WebSocket để đăng ký kênh:', err));
        }
        
        // Tải tin nhắn từ API
        fetchMessages(chatbox.id, false);
        
        // Cuộn xuống cuối tin nhắn sau khi chọn chatbox
        // Đặt timeout để đảm bảo DOM đã cập nhật
        setTimeout(() => {
            scrollToBottom(false);
        }, 300);
    };

    // Thêm useEffect để xử lý khi nhấn ESC để đóng panel thông tin
    useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === 'Escape' && showChatInfo) {
                setShowChatInfo(false);
            }
        };

        window.addEventListener('keydown', handleEscKey);
        return () => {
            window.removeEventListener('keydown', handleEscKey);
        };
    }, [showChatInfo]);

    // Cải thiện hàm useEffect khi chọn chatbox
    useEffect(() => {
        if (selectedChatbox) {
            console.log(`🔄 Đã chọn chatbox ${selectedChatbox.id}, đang tải tin nhắn...`);
            
            // Reset các state
            setMessages([]);
            setCurrentPage(0);
            setTotalMessageCount(0);
            setHasMoreMessages(false);
            setMessagesError(null);
            
            // Đảm bảo rằng có kết nối WebSocket và đăng ký kênh chatbox
            if (stompClientRef.current && stompClientRef.current.connected) {
                // WebSocket đã kết nối, đăng ký kênh ngay lập tức
                subscribeToSpecificChatbox(selectedChatbox.id);
            } else {
                // WebSocket chưa kết nối, thử kết nối lại
                console.warn('⚠️ WebSocket không kết nối, đang thử kết nối lại...');
                connectWebSocket()
                    .then(() => {
                        // Sau khi kết nối thành công, đăng ký kênh chatbox
                        subscribeToSpecificChatbox(selectedChatbox.id);
                    })
                    .catch(error => {
                        console.error('❌ Không thể kết nối WebSocket:', error);
                    });
            }
        }
    }, [selectedChatbox?.id]); 

    // Thêm useEffect đặc biệt để đảm bảo tin nhắn từ API và WebSocket không bị xung đột
    useEffect(() => {
        if (selectedChatbox && stompClientRef.current && stompClientRef.current.connected) {
            // Khi WebSocket đã kết nối và chatbox đã được chọn, đảm bảo đăng ký kênh đó
            subscribeToSpecificChatbox(selectedChatbox.id);
        }
    }, [stompClientRef.current?.connected, selectedChatbox?.id]);

    // Hàm kiểm tra và khởi tạo lại WebSocket nếu cần
    const checkWebSocketConnection = () => {
        if (!stompClientRef.current || !stompClientRef.current.connected) {
            console.warn('⚠️ WebSocket không kết nối, đang thử kết nối lại...');
            connectWebSocket();
            return false;
        }
        return true;
    };

    useEffect(() => {
        if (selectedChatbox) {
            setMessages([]); // Clear previous messages
            setMessagesPage(prev => ({ ...prev, pageNumber: 0, totalPages: 0 })); // Reset messages page
            setCurrentPage(0);
            setTotalMessageCount(0);
            setHasMoreMessages(false);
            setMessagesError(null);
            fetchMessages(selectedChatbox.id, false); // Fetch new messages for the selected chatbox
            
            // Khi đã chọn chatbox, kiểm tra kết nối WebSocket
            if (stompClientRef.current && !stompClientRef.current.connected) {
                console.log("Phát hiện WebSocket không kết nối, đang thử kết nối lại...");
                checkWebSocketConnection();
            }
        }
    }, [selectedChatbox?.id]); // Phụ thuộc vào ID chatbox thay vì đối tượng

    const getToken = () => {
        // Thử lấy token từ các key khác nhau trong localStorage
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
            console.error("Authentication token not found.");
            setChatboxesError("Authentication required. Please login again.");
            return null;
        }
        return token;
    };

    const fetchChatboxesInitial = async () => {
        const token = getToken();
        if (!token) return;

        setChatboxesLoading(true);
        setChatboxesError(null);
        try {
            // Fetch chatboxes from the API endpoint
            const response = await axios.get(`${API_BASE_URL}/lms/chatBox`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { 
                    pageNumber: chatboxesPage.pageNumber, 
                    pageSize: chatboxesPage.pageSize 
                }
            });

            if (response.data && response.data.result) {
                const { content, page } = response.data.result;
                setAllChatboxes(content);
                setDisplayedChatboxes(content); // Initially display all fetched
                setChatboxesPage(prev => ({ 
                    ...prev, 
                    totalPages: page.totalPages, 
                    pageNumber: page.number 
                }));
                
                console.log('Fetched chatboxes:', content);
                
                // Auto-select the first chatbox if not already selected and list is not empty
                if (content.length > 0 && !selectedChatbox) {
                    // Uncomment to auto-select first chatbox
                    // setSelectedChatbox(content[0]);
                }
                
                // Đăng ký tất cả các kênh chatbox sau khi lấy danh sách
                if (content.length > 0) {
                    subscribeToAllChatboxChannels(content);
                }
            } else {
                setChatboxesError('Failed to fetch chatboxes or empty response.');
            }
        } catch (error) {
            console.error('Error fetching chatboxes:', error);
            setChatboxesError(error.response?.data?.message || 'An error occurred while fetching chatboxes.');
        } finally {
            setChatboxesLoading(false);
        }
    };

    // Thêm hàm để đăng ký tất cả các kênh chatbox
    const subscribeToAllChatboxChannels = (chatboxes) => {
        if (!stompClientRef.current || !stompClientRef.current.connected) {
            console.warn('⚠️ WebSocket chưa kết nối, không thể đăng ký kênh chatbox');
            console.log('🔄 Đang thử kết nối WebSocket trước khi đăng ký tất cả kênh...');
            
            // Thử kết nối lại và đăng ký khi kết nối thành công
            connectWebSocket()
                .then(() => {
                    console.log('✅ Kết nối WebSocket thành công, đang đăng ký tất cả kênh chatbox');
                    subscribeToAllChatboxChannels(chatboxes);
                })
                .catch(error => {
                    console.error('❌ Không thể kết nối WebSocket để đăng ký kênh:', error);
                });
            return;
        }
        
        console.log(`🔔 Đăng ký tất cả ${chatboxes.length} kênh chatbox`);
        
        // Không giới hạn số lượng kênh đăng ký để đảm bảo nhận đủ tin nhắn
        const chatboxesToSubscribe = chatboxes;
        
        // Đăng ký từng kênh chatbox
        chatboxesToSubscribe.forEach(chatbox => {
            try {
                // Kiểm tra xem đã đăng ký kênh này chưa
                const subscriptionId = `global-chatbox-${chatbox.id}`;
                
                // Lưu trữ danh sách subscription
                if (!window.chatboxSubscriptions) {
                    window.chatboxSubscriptions = {};
                }
                
                // Nếu đã có subscription cho chatbox này, hủy đăng ký trước
                if (window.chatboxSubscriptions[subscriptionId]) {
                    console.log(`⏩ Hủy đăng ký kênh /topic/chatbox/${chatbox.id} trước đó`);
                    
                    try {
                        window.chatboxSubscriptions[subscriptionId].unsubscribe();
                    } catch (unsubError) {
                        console.warn(`⚠️ Lỗi khi hủy đăng ký kênh /topic/chatbox/${chatbox.id}:`, unsubError);
                    }
                    delete window.chatboxSubscriptions[subscriptionId];
                }
                
                console.log(`🔔 Đăng ký kênh /topic/chatbox/${chatbox.id}`);
                
                // Đăng ký kênh cho chatbox này
                const subscription = stompClientRef.current.subscribe(
                    `/topic/chatbox/${chatbox.id}`, 
                    (message) => {
                        try {
                            console.log(`📩 [Global] Nhận dữ liệu từ kênh /topic/chatbox/${chatbox.id}`);
                            const data = JSON.parse(message.body);
                            
                            // Xử lý tin nhắn - sử dụng cùng logic như trong hàm subscribeToSpecificChatbox
                            if (data && data.chatBoxId) {
                                console.log(`✅ [Global] Xử lý tin nhắn từ kênh global: ${data.id}`);
                                handleIncomingMessage(data);
                            } 
                            else if (data && data.type === 'MESSAGE' && data.content) {
                                console.log(`✅ [Global] Xử lý tin nhắn kiểu đóng gói: ${data.content.id}`);
                                handleIncomingMessage(data.content);
                            } 
                            else if (data && data.type === 'UPDATE' && data.content) {
                                console.log(`✅ [Global] Xử lý cập nhật chatbox: ${data.content.id}`);
                                updateChatboxList(data.content);
                            }
                            else if (Array.isArray(data)) {
                                console.log(`✅ [Global] Xử lý mảng dữ liệu từ kênh ${chatbox.id}, độ dài:`, data.length);
                                data.forEach((item, index) => {
                                    if (item && item.chatBoxId) {
                                        handleIncomingMessage(item);
                                    }
                                });
                            }
                            else {
                                console.log(`⚠️ [Global] Định dạng dữ liệu không nhận dạng được:`, data);
                                // Thử xử lý như tin nhắn
                                if (data && (data.id || data.content)) {
                                    handleIncomingMessage(data);
                                }
                            }
                        } catch (error) {
                            console.error(`❌ [Global] Lỗi khi xử lý dữ liệu từ kênh /topic/chatbox/${chatbox.id}:`, error);
                        }
                    },
                    { id: subscriptionId }
                );
                
                // Lưu subscription để có thể hủy đăng ký sau này
                window.chatboxSubscriptions[subscriptionId] = subscription;
                
            } catch (error) {
                console.error(`❌ Lỗi khi đăng ký global kênh /topic/chatbox/${chatbox.id}:`, error);
            }
        });
        
        console.log(`✅ Đã đăng ký ${chatboxesToSubscribe.length} kênh chatbox`);
    };

    // Cập nhật fetchMessages để đảm bảo tin nhắn từ API luôn hiển thị đúng
    const fetchMessages = async (chatId, loadMore = false, size = 20) => {
        if (!chatId) return;
        
        const page = loadMore ? currentPage + 1 : 0;
        
        setIsLoadingMessages(true);
        setMessagesError(null);
        
        try {
            console.log(`📋 Đang tải tin nhắn cho chatbox ${chatId}, trang ${page}, kích thước ${size}`);
            
            // Sử dụng URL API đúng dựa trên cấu trúc endpoint
            const apiUrl = `${API_BASE_URL}/lms/chatBox/${chatId}/messages`;
            debugLog('URL API tin nhắn:', apiUrl);
            
            const token = getToken();
            if (!token) {
                throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
            }
            
            const response = await axios.get(
                apiUrl, 
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                    params: {
                        pageNumber: page,
                        pageSize: size
                    }
                }
            );
            
            debugLog('Phản hồi API tin nhắn:', response.data);
            
            if (!response.data || !response.data.result) {
                console.error('❌ Cấu trúc phản hồi API không hợp lệ:', response.data);
                throw new Error('Cấu trúc phản hồi API không hợp lệ');
            }
            
            const { content: messagesList, page: paginationInfo } = response.data.result;
            
            if (!Array.isArray(messagesList)) {
                console.error('❌ Dữ liệu tin nhắn không hợp lệ:', messagesList);
                throw new Error('Dữ liệu tin nhắn không hợp lệ');
            }
            
            console.log(`📋 Nhận được ${messagesList.length} tin nhắn từ API`);
            
            // Thông tin người dùng để xác định tin nhắn của ai
            const userInfo = currentUserInfo || JSON.parse(localStorage.getItem('userInfo')) || {};
            const userId = userInfo.id || localStorage.getItem('userId');
            const userEmail = userInfo.email || localStorage.getItem('email');
            
            // Xử lý danh sách tin nhắn
            let fetchedMessages = messagesList.map(message => {
                // Trích xuất thông tin người gửi từ mảng senderAccount
                const sender = message.senderAccount && message.senderAccount.length > 0 
                    ? {
                        id: message.senderAccount[0].accountId,
                        name: message.senderAccount[0].accountFullname,
                        username: message.senderAccount[0].accountUsername,
                        avatarUrl: message.senderAccount[0].avatar,
                        // Thêm các trường gốc để dễ dàng truy cập
                        accountId: message.senderAccount[0].accountId,
                        accountUsername: message.senderAccount[0].accountUsername,
                        accountFullname: message.senderAccount[0].accountFullname,
                        avatar: message.senderAccount[0].avatar,
                        email: message.senderAccount[0].accountUsername // Thêm email để so sánh chính xác
                    } 
                    : message.senderAccount && typeof message.senderAccount === 'string'
                    ? { 
                        id: 'unknown', 
                        name: message.senderAccount.split('@')[0] || 'Người dùng',
                        username: message.senderAccount,
                        avatarUrl: message.avatarSenderAccount || null,
                        email: message.senderAccount, // Email trực tiếp
                        accountUsername: message.senderAccount
                    }
                    : { id: 'unknown', name: 'Người dùng không xác định', username: 'unknown', avatarUrl: null };
                
                // Kiểm tra nếu tin nhắn là từ người dùng hiện tại - SO SÁNH BẰNG EMAIL
                const isFromCurrentUser = 
                    (sender.email && userEmail && sender.email.toLowerCase() === userEmail.toLowerCase());
                
                return {
                    ...message,
                    sender: sender, // Đối tượng sender để dễ sử dụng
                    isFromCurrentUser // Cờ để hiển thị UI
                };
            });
            
            // Sort messages by creation time (oldest to newest)
            fetchedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            
            console.log(`📋 Đã xử lý ${fetchedMessages.length} tin nhắn từ API`);
            
            // Lấy thông tin phân trang từ phản hồi API
            const totalMessages = paginationInfo ? paginationInfo.totalElements : fetchedMessages.length;
            const totalPages = paginationInfo ? paginationInfo.totalPages : 1;
            
            setCurrentPage(page);
            setTotalMessageCount(totalMessages);
            setHasMoreMessages(page < totalPages - 1);
            
            console.log(`📋 Tổng cộng ${totalMessages} tin nhắn, trang ${page + 1}/${totalPages}`);
            
            // Lưu các ID tin nhắn vào bộ đệm để tránh hiển thị lại từ WebSocket
            fetchedMessages.forEach(msg => {
                if (msg.id) {
                    processedMessageIds.current.add(`${chatId}_${msg.id}`);
                }
            });
            
            // Nếu đang tải thêm (phân trang), thêm vào tin nhắn hiện có
            if (loadMore) {
                // Thêm vào danh sách hiện có, giữ nguyên thứ tự thời gian
                setMessages(prevMessages => {
                    const newMessages = [...prevMessages];
                    
                    // Chỉ thêm các tin nhắn chưa có trong danh sách
                    fetchedMessages.forEach(fetchedMsg => {
                        const existingIndex = newMessages.findIndex(msg => msg.id === fetchedMsg.id);
                        if (existingIndex === -1) {
                            newMessages.push(fetchedMsg);
                        }
                    });
                    
                    // Sắp xếp lại theo thời gian
                    return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                });
            } else {
                // Trang đầu tiên - đặt lại toàn bộ danh sách tin nhắn
                setMessages(fetchedMessages);
                
                // Nếu tải tin nhắn mới (không phải tải thêm), cuộn xuống cuối sau khi tải xong
                setTimeout(() => {
                    scrollToBottom(false);
                }, 200);
            }
            
        } catch (error) {
            console.error('❌ Lỗi khi tải tin nhắn:', error);
            setMessagesError('Không thể tải tin nhắn: ' + (error.message || 'Vui lòng thử lại sau.'));
        } finally {
            setIsLoadingMessages(false);
        }
    };

    // Cập nhật hàm subscribeToSpecificChatbox để đảm bảo không có đăng ký trùng lặp
    const subscribeToSpecificChatbox = (chatboxId) => {
        // Kiểm tra kết nối WebSocket
        if (!stompClientRef.current || !stompClientRef.current.connected) {
            console.warn('⚠️ WebSocket không kết nối, không thể đăng ký kênh chatbox');
            console.log('🔄 Đang cố gắng kết nối WebSocket trước khi đăng ký kênh...');
            
            // Thử kết nối lại và đăng ký khi kết nối thành công
            connectWebSocket()
                .then(() => {
                    console.log('✅ Kết nối WebSocket thành công, đang đăng ký kênh');
                    subscribeToSpecificChatbox(chatboxId);
                })
                .catch(error => {
                    console.error('❌ Không thể kết nối WebSocket để đăng ký kênh:', error);
                });
            return;
        }
        
        try {
            // Hủy đăng ký kênh hiện tại trước khi đăng ký kênh mới
            if (currentSubscriptionRef.current) {
                try {
                    console.log(`🔕 Hủy đăng ký kênh chatbox hiện tại trước khi đăng ký mới`);
                    currentSubscriptionRef.current.unsubscribe();
                    currentSubscriptionRef.current = null;
                } catch (error) {
                    console.error('❌ Lỗi khi hủy đăng ký kênh chatbox:', error);
                }
            }
            
            console.log(`🔔 Đăng ký kênh /topic/chatbox/${chatboxId} cho chatbox được chọn`);
            
            // Đăng ký vào kênh của chatbox cụ thể
            const subscription = stompClientRef.current.subscribe(
                `/topic/chatbox/${chatboxId}`, 
                (message) => {
                    try {
                        console.log(`📩 Nhận tin nhắn từ kênh /topic/chatbox/${chatboxId}`);
                        
                        // Phân tích dữ liệu JSON từ body của message
                        const data = JSON.parse(message.body);
                        
                        // Xử lý dữ liệu 
                        if (data && typeof data === 'object') {
                            // Trường hợp tin nhắn trực tiếp
                            if (data.chatBoxId) {
                                console.log(`✅ Xử lý tin nhắn từ kênh ${chatboxId} có ID: ${data.id}`);
                                handleIncomingMessage(data);
                            } 
                            // Format thay thế: kiểu { type: 'MESSAGE', content: { tin nhắn } }
                            else if (data.type === 'MESSAGE' && data.content) {
                                console.log(`✅ Xử lý tin nhắn kiểu đóng gói từ kênh ${chatboxId}`);
                                handleIncomingMessage(data.content);
                            } 
                            // Format thay thế: kiểu { type: 'UPDATE', content: { chatbox } }
                            else if (data.type === 'UPDATE' && data.content) {
                                console.log(`✅ Xử lý cập nhật chatbox từ kênh ${chatboxId}`);
                                updateChatboxList(data.content);
                            }
                            // Trường hợp dữ liệu là mảng
                            else if (Array.isArray(data)) {
                                console.log(`✅ Xử lý mảng tin nhắn từ kênh ${chatboxId}, số lượng: ${data.length}`);
                                data.forEach(item => {
                                    if (item && item.chatBoxId) {
                                        handleIncomingMessage(item);
                                    }
                                });
                            }
                            // Các trường hợp đặc biệt khác
                            else {
                                console.log(`⚠️ Dữ liệu không nhận dạng được, thử phân tích:`, data);
                                
                                // Kiểm tra các định dạng đặc biệt khác
                                if (data.message) handleIncomingMessage(data.message);
                                else if (data.data) {
                                    if (Array.isArray(data.data)) {
                                        data.data.forEach(item => {
                                            if (item && item.chatBoxId) handleIncomingMessage(item);
                                        });
                                    } else if (data.data.chatBoxId) {
                                        handleIncomingMessage(data.data);
                                    }
                                }
                                else if (data.id || data.content) {
                                    handleIncomingMessage(data);
                                }
                            }
                        } else {
                            console.warn(`⚠️ Dữ liệu không hợp lệ từ kênh ${chatboxId}:`, data);
                        }
                    } catch (error) {
                        console.error(`❌ Lỗi khi xử lý dữ liệu từ kênh /topic/chatbox/${chatboxId}:`, error);
                        console.error(`Dữ liệu gốc:`, message.body);
                    }
                },
                { id: `chatbox-subscription-${chatboxId}` }
            );
            
            // Lưu subscription để có thể hủy đăng ký sau này
            currentSubscriptionRef.current = subscription;
            
            console.log(`✅ Đăng ký thành công kênh /topic/chatbox/${chatboxId}`);
            
            // Đánh dấu kênh này đã được đăng ký trong danh sách toàn cục
            if (!window.chatboxSubscriptions) {
                window.chatboxSubscriptions = {};
            }
            window.chatboxSubscriptions[`global-chatbox-${chatboxId}`] = true;
            
        } catch (error) {
            console.error(`❌ Lỗi khi đăng ký kênh /topic/chatbox/${chatboxId}:`, error);
        }
    };

    // Hàm để hủy đăng ký kênh chatbox
    const unsubscribeFromCurrentChatbox = () => {
        if (currentSubscriptionRef.current) {
            try {
                console.log('🔕 Hủy đăng ký kênh chatbox hiện tại');
                currentSubscriptionRef.current.unsubscribe();
                currentSubscriptionRef.current = null;
            } catch (error) {
                console.error('❌ Lỗi khi hủy đăng ký kênh chatbox:', error);
            }
        }
    };

    // Thêm hàm scrollToBottom
    const scrollToBottom = (smooth = false) => {
        if (chatMessagesContainerRef.current) {
            if (smooth) {
                chatMessagesContainerRef.current.scrollTo({
                    top: chatMessagesContainerRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            } else {
                chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
            }
        }
    };

    // Thêm useEffect để cuộn xuống khi tin nhắn thay đổi
    useEffect(() => {
        // Nếu đã tải tin nhắn và không phải đang tải thêm tin nhắn cũ, thì cuộn xuống cuối
        if (messages.length > 0 && !isLoadingMessages) {
            scrollToBottom(false);
        }
    }, [messages, selectedChatbox?.id]);

    // Cập nhật hàm handleSendMessage để cuộn xuống sau khi gửi tin nhắn
    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim()) return;
        
        // Ensure we have an active chat selected
        if (!selectedChatbox || !selectedChatbox.id) {
            console.error("Vui lòng chọn một cuộc trò chuyện để gửi tin nhắn");
            setSendMessageError("Vui lòng chọn một cuộc trò chuyện để gửi tin nhắn");
            return;
        }
        
        // Create temporary ID for optimistic UI update
        const tempId = `temp-${Date.now()}`;
        
        // Lấy email của người dùng hiện tại
        const currentUserEmail = currentUserInfo?.email || 
                                JSON.parse(localStorage.getItem('userInfo'))?.email ||
                                localStorage.getItem('email');
        
        // Sử dụng thông tin người dùng từ API
        let sender;
        
        if (currentUserInfo) {
            sender = {
                accountId: currentUserInfo.id,
                accountUsername: currentUserInfo.email,
                accountFullname: currentUserInfo.fullName,
                avatar: currentUserInfo.avatar
            };
        } else {
            // Backup từ localStorage nếu không có API
            const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
            
            sender = {
                accountId: userInfo.id || "unknown",
                accountUsername: userInfo.email || currentUserEmail || "unknown",
                accountFullname: userInfo.fullName || "You",
                avatar: userInfo.avatar || null
            };
        }
        
        // Create optimistic message matching API structure
        const optimisticMessage = {
            id: tempId,
            chatBoxId: selectedChatbox.id,
            content: newMessage,
            createdAt: new Date().toISOString(),
            type: null,
            path: null,
            filename: null,
            senderAccount: [sender], // Sử dụng mảng như trong API
            sender: {
                id: sender.accountId,
                name: sender.accountFullname,
                username: sender.accountUsername,
                email: sender.accountUsername, // Thêm email để so sánh
                avatarUrl: sender.avatar,
                accountId: sender.accountId,
                accountUsername: sender.accountUsername,
                accountFullname: sender.accountFullname,
                avatar: sender.avatar
            },
            isFromCurrentUser: true,
            isOptimistic: true
        };
        
        // Update UI immediately with optimistic message
        setMessages(prev => [...prev, optimisticMessage]);
        // Clear input
        setNewMessage('');
        
        // Cuộn xuống cuối trang để hiển thị tin nhắn mới
        setTimeout(() => {
            scrollToBottom(true);
        }, 100);
        
        // Save original message in case we need to restore on error
        const originalMessageText = newMessage;
        
        try {
            // Check WebSocket connection before sending
            if (!checkWebSocketConnection()) {
                console.warn('Đang kết nối lại... Vui lòng thử lại sau.');
                setSendMessageError('Đang kết nối lại... Vui lòng thử lại sau.');
                
                // Remove optimistic message
                setMessages(prev => prev.filter(m => m.id !== tempId));
                // Restore message input
                setNewMessage(originalMessageText);
                return;
            }
            
            // Đảm bảo có thông tin người gửi
            if (!currentUserInfo && !currentUserInfo?.email) {
                // Thử lấy thông tin user từ API nếu chưa có
                const userInfo = await getCurrentUserInfo();
                if (!userInfo || !userInfo.email) {
                    throw new Error("Không thể xác định email người dùng");
                }
            }
            
            // Lấy token từ hàm thống nhất
            const token = getToken();
            if (!token) {
                throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
            }
            
            // Tạo đối tượng tin nhắn theo định dạng yêu cầu của backend
            const messageRequest = {
                senderAccount: currentUserInfo?.email || sender.accountUsername || currentUserEmail,
                chatBoxId: selectedChatbox.id,
                content: originalMessageText,
                file: null,
                fileType: null
            };
            
            console.log(`Đang gửi tin nhắn qua WebSocket đến chatbox ${selectedChatbox.id}:`, messageRequest);
            
            // Gửi tin nhắn qua WebSocket
            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.publish({
                    destination: '/app/chat/sendMessage',
                    body: JSON.stringify(messageRequest),
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log('Tin nhắn đã được gửi qua WebSocket');
                
                // Tin nhắn đã gửi thành công qua WebSocket
                // Backend sẽ gửi lại tin nhắn qua kênh đăng ký (/user/queue/messages)
                // và sẽ được xử lý trong hàm subscribe, nên không cần xử lý phản hồi ở đây
                
                // Xóa thông báo lỗi nếu có
                setSendMessageError(null);
                
                // Đặt thời gian chờ để tự động xóa optimistic message nếu không nhận được phản hồi
                setTimeout(() => {
                    setMessages(prev => {
                        // Nếu vẫn còn tin nhắn optimistic, cập nhật trạng thái để không còn hiển thị loading
                        return prev.map(msg => 
                            msg.id === tempId ? { ...msg, isOptimistic: false } : msg
                        );
                    });
                    
                    // Cuộn xuống cuối trang lần nữa nếu cần
                    scrollToBottom(true);
                }, 5000); // Đợi 5 giây
            } else {
                throw new Error("Kết nối WebSocket không khả dụng");
            }
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
            setSendMessageError(`Không thể gửi tin nhắn: ${error.message}`);
            
            // Remove optimistic message from UI
            setMessages(prev => prev.filter(m => m.id !== tempId));
            
            // Restore message input so user can try again
            setNewMessage(originalMessageText);
            
            // Thử phương án dự phòng: gửi qua API HTTP nếu WebSocket không hoạt động
            try {
                console.log("Thử gửi tin nhắn qua API HTTP...");
                
                // Xây dựng URL đầy đủ cho API gửi tin nhắn
                const sendMessageApiUrl = `${API_BASE_URL}/lms/chatBox/${selectedChatbox.id}/messages`;
                
                // Prepare form data for API
                const formData = new FormData();
                formData.append('chatBoxId', selectedChatbox.id);
                formData.append('content', originalMessageText);
                
                // Send message via API
                const response = await axios.post(
                    sendMessageApiUrl,
                    formData,
                    {
                        headers: { 
                            'Authorization': `Bearer ${getToken()}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                
                console.log('Phản hồi API gửi tin nhắn:', response.data);
                
                // If successful, replace optimistic message with server response
                if (response.data && (response.data.status === "OK" || response.data.code === 0)) {
                    const serverMessage = response.data.data || response.data.result;
                    
                    if (serverMessage) {
                        const sender = serverMessage.senderAccount && serverMessage.senderAccount.length > 0 
                            ? serverMessage.senderAccount[0] 
                            : currentUserInfo ? {
                                accountId: currentUserInfo.id,
                                accountUsername: currentUserInfo.email,
                                accountFullname: currentUserInfo.fullName,
                                avatar: currentUserInfo.avatar
                            } : null;
                        
                        const processedServerMessage = {
                            ...serverMessage,
                            sender: {
                                id: sender.accountId,
                                name: sender.accountFullname,
                                username: sender.accountUsername,
                                email: sender.accountUsername, // Thêm email để so sánh
                                avatarUrl: sender.avatar,
                                accountId: sender.accountId,
                                accountUsername: sender.accountUsername,
                                accountFullname: sender.accountFullname,
                                avatar: sender.avatar
                            },
                            isFromCurrentUser: true
                        };
                        
                        // Add message back to the list
                        setMessages(prev => {
                            // Remove optimistic message if exists
                            const filteredMessages = prev.filter(m => m.id !== tempId);
                            return [...filteredMessages, processedServerMessage].sort(
                                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                            );
                        });
                        
                        setSendMessageError("Đã gửi tin nhắn qua API HTTP (WebSocket không khả dụng)");
                        setTimeout(() => setSendMessageError(null), 3000);
                        
                        // Cuộn xuống cuối để hiển thị tin nhắn mới
                        setTimeout(() => {
                            scrollToBottom(true);
                        }, 200);
                    }
                }
            } catch (httpError) {
                console.error('Lỗi khi gửi tin nhắn qua API HTTP:', httpError);
                setSendMessageError("Không thể gửi tin nhắn qua cả WebSocket và API HTTP. Vui lòng thử lại sau.");
            }
        }
    };

    // Cập nhật hàm formatDisplayTime để hiển thị đẹp hơn
    const formatDisplayTime = (dateTimeStr) => {
        if (!dateTimeStr) return '';
        
        try {
            const date = new Date(dateTimeStr);
            const now = new Date();
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            
            // Nếu là ngày hôm nay, chỉ hiển thị giờ
            if (date.toDateString() === now.toDateString()) {
                return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            }
            
            // Nếu là ngày hôm qua, hiển thị "Hôm qua" và giờ
            if (date.toDateString() === yesterday.toDateString()) {
                return `Hôm qua ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
            }
            
            // Nếu là trong tuần này (trong vòng 7 ngày), hiển thị tên ngày và giờ
            const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
            if (daysDiff < 7) {
                return `${date.toLocaleDateString('vi-VN', { weekday: 'long' })} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
            }
            
            // Nếu là lâu hơn, hiển thị ngày đầy đủ
            return date.toLocaleDateString('vi-VN', { 
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Lỗi định dạng ngày tháng:', error);
            return dateTimeStr; 
        }
    };
    
    // Thêm useEffect để tự động ẩn thông báo lỗi sau 4 giây
    useEffect(() => {
        let timer;
        if (sendMessageError) {
            timer = setTimeout(() => {
                setSendMessageError(null);
            }, 4000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [sendMessageError]);

    // Helper to get avatar, trying to use API_BASE_URL for relative paths
    const getSenderAvatar = (sender) => {
        if (!sender) {
            return <FaUserCircle size={32} color="#ccc" />;
        }
        
        if (sender?.avatarUrl || sender?.avatar) {
            const avatarUrl = sender.avatarUrl || sender.avatar;
            if (!avatarUrl) return <FaUserCircle size={32} />;
            
            // Kiểm tra xem avatarUrl đã được cache chưa
            const cachedUrl = avatarCache[avatarUrl];
            
            // Nếu đã có trong cache, sử dụng URL blob từ cache
            if (cachedUrl) {
                return <CachedAvatar avatarUrl={cachedUrl} sender={sender} />;
            }
            
            // Nếu chưa cache, tải avatar và hiển thị placeholder trước
            // Gọi fetchAvatar để tải avatar (kết quả sẽ được lưu vào cache)
            fetchAvatar(avatarUrl);
            
            // Hiển thị hình đại diện bằng chữ cái đầu tiên trong khi đợi tải
            const initial = (sender.name || sender.accountFullname || sender.accountUsername || '?').charAt(0).toUpperCase();
            
            return (
                <div className="avatar-fallback">
                    {initial}
                </div>
            );
        } 
        
        // Fallback color generation based on sender ID or name
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c'];
        const nameOrId = sender?.id?.toString() || sender?.accountId?.toString() || sender?.name || sender?.accountFullname || sender?.accountUsername || 'default';
        const charCodeSum = nameOrId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const color = colors[charCodeSum % colors.length];
        
        // Lấy chữ cái đầu tiên của tên làm avatar
        const initial = (sender.name || sender.accountFullname || sender.accountUsername || '?').charAt(0).toUpperCase();
        
        // Trả về avatar với chữ cái đầu tiên hoặc biểu tượng người dùng
        if (initial !== '?') {
            return (
                <div className="avatar-initial" style={{ backgroundColor: color }}>
                    {initial}
                </div>
            );
        }
        
        return <FaUserCircle size={32} color={color} />;
    };

    // Filter chatboxes based on the "group" flag from API response
    const channelsToDisplay = displayedChatboxes.filter(cb => cb.group === true);
    const directMessagesToDisplay = displayedChatboxes.filter(cb => cb.group === false);

    // Function to search users to add to the group
    const searchUsers = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        const token = getToken();
        if (!token) return;

        setIsSearching(true);
        try {
            // Using the correct endpoint from ChatMemberController
            const response = await axios.get(`${API_BASE_URL}/lms/chatmember/search`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { 
                    chatBoxId: "", // Empty to search all users
                    searchString: query,
                    pageNumber: 0,
                    pageSize: 10
                }
            });

            if (response.data && response.data.result && response.data.result.content) {
                setSearchResults(response.data.result.content);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching users:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Function to handle selecting a user from search results
    const handleSelectUser = (user) => {
        // Check if user is already selected
        if (!selectedUsers.some(selectedUser => selectedUser.accountId === user.accountId)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setSearchUserQuery('');
        setSearchResults([]);
    };

    // Function to remove a user from selected users
    const handleRemoveUser = (userId) => {
        setSelectedUsers(selectedUsers.filter(user => user.accountId !== userId));
    };

    // Function to manually refresh chatbox list
    const refreshChatboxList = () => {
        console.log('Manually refreshing chatbox list');
        fetchChatboxesInitial();
    };

    // Thêm hàm hiển thị thông báo
    const showTemporaryNotification = (message) => {
        setNotification(message);
        setShowNotification(true);
        
        // Tự động ẩn thông báo sau 2 giây
        setTimeout(() => {
            setShowNotification(false);
            setTimeout(() => {
                setNotification('');
            }, 500); // Chờ animation kết thúc
        }, 2000);
    };

    // Cập nhật phần xử lý tạo chat để sử dụng thông báo mới
    const handleCreateChannel = async () => {
        // For direct chat, we skip the group name validation
        const isDirectChat = groupName.trim() === '';
        
        if (!isDirectChat && !groupName.trim()) {
            setCreateChannelError('Please enter a group name');
            return;
        }
        
        if (selectedUsers.length === 0) {
            const errorMessage = isDirectChat ? 
                'Please select a user to chat with' : 
                'Please select at least one user to add to the group';
            setCreateChannelError(errorMessage);
            return;
        }
        
        // For direct chat, ensure only one user is selected
        if (isDirectChat && selectedUsers.length !== 1) {
            setCreateChannelError('Direct chat can only be created with one user');
            return;
        }

        const token = getToken();
        if (!token) {
            setCreateChannelError('Authentication token not found. Please login again.');
            return;
        }

        try {
            // Get current user info from API if not already available
            let apiUserInfo = currentUserInfo;
            if (!apiUserInfo) {
                apiUserInfo = await getCurrentUserInfo();
                if (!apiUserInfo) {
                    setCreateChannelError('Failed to get user information. Please try again.');
                    return;
                }
            }
            
            // Ensure we have the email
            if (!apiUserInfo.email) {
                console.error('API user info does not contain email:', apiUserInfo);
                setCreateChannelError('User email not available. Please try again.');
                return;
            }
            
            console.log('Using email from API for chat creation:', apiUserInfo.email);
            
            // Log selected users to verify they have accountUsername
            console.log('Selected users with accountUsername:', selectedUsers.map(user => ({
                id: user.accountId,
                fullname: user.accountFullname,
                username: user.accountUsername
            })));

            // Create the request object exactly as expected by the backend
            const anotherAccountsList = selectedUsers.map(user => user.accountUsername);
            console.log('Extracted usernames for anotherAccounts:', anotherAccountsList);

            const request = {
                anotherAccounts: anotherAccountsList,
                groupName: groupName,
                currentAccountUsername: apiUserInfo.email // Use email from API
            };

            console.log('Sending chat creation request:', request);

            // Send the request through WebSocket
            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.publish({
                    destination: '/app/chat/create',
                    body: JSON.stringify(request),
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('Chat creation request sent successfully');
                
                // Reset form and close modals
                setSelectedUsers([]);
                
                // Only reset groupName if it's a group chat, not a direct chat
                if (!isDirectChat) {
                    setGroupName('');
                }
                
                // Close the appropriate modal
                if (isDirectChat) {
                    setShowDirectChatModal(false);
                    setDirectChatError(null);
                } else {
                    setShowCreateChannelModal(false);
                    setCreateChannelError(null);
                }
                
                // Hiển thị thông báo bằng React state thay vì tạo DOM trực tiếp
                const notificationMessage = isDirectChat 
                    ? 'Đã tạo đoạn chat trực tiếp! Đang cập nhật danh sách...' 
                    : `Đã tạo nhóm "${groupName}"! Đang cập nhật danh sách...`;
                
                showTemporaryNotification(notificationMessage);
                
                // Refresh chatbox list after a short delay
                setTimeout(() => {
                    refreshChatboxList();
                }, 1000);
            } else {
                setCreateChannelError('WebSocket connection not available. Please refresh the page and try again.');
            }
        } catch (error) {
            console.error('Error in handleCreateChannel:', error);
            if (groupName.trim() === '') {
                setDirectChatError(`Error: ${error.response?.data?.message || error.message || 'Unknown error occurred'}`);
            } else {
                setCreateChannelError(`Error: ${error.response?.data?.message || error.message || 'Unknown error occurred'}`);
            }
        }
    };

    // Handler for the search input with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchUserQuery.trim()) {
                searchUsers(searchUserQuery);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchUserQuery]);

    // Function to toggle the create channel modal
    const toggleCreateChannelModal = () => {
        setShowCreateChannelModal(!showCreateChannelModal);
        if (!showCreateChannelModal) {
            // Reset form when opening the modal
            setGroupName('');
            setSelectedUsers([]);
            setSearchUserQuery('');
            setSearchResults([]);
            setCreateChannelError(null);
        }
    };

    // Function to toggle the direct chat modal
    const toggleDirectChatModal = () => {
        setShowDirectChatModal(!showDirectChatModal);
        if (!showDirectChatModal) {
            // Reset form when opening the modal
            setSelectedUsers([]);
            setSearchUserQuery('');
            setSearchResults([]);
            setDirectChatError(null);
        }
    };

    // Function to create a direct chat
    const handleCreateDirectChat = async () => {
        if (selectedUsers.length !== 1) {
            setDirectChatError('Please select exactly one user for direct chat');
            return;
        }

        // Call the existing handleCreateChannel function with empty groupName
        try {
            // Reset the groupName temporarily to empty string
            const previousGroupName = groupName;
            setGroupName('');
            
            // Call the existing function (which will use empty groupName)
            await handleCreateChannel();
            
            // Restore the previous groupName value if needed
            setGroupName(previousGroupName);
        } catch (error) {
            console.error('Error creating direct chat:', error);
            setDirectChatError(`Error: ${error.message || 'Unknown error occurred'}`);
        }
    };

    // Cập nhật hàm findOtherPersonInChat để thêm thông tin debug
    const findOtherPersonInChat = (chatbox) => {
        if (!chatbox?.memberAccountUsernames || !Array.isArray(chatbox.memberAccountUsernames) || chatbox.memberAccountUsernames.length === 0) {
            console.log('No valid memberAccountUsernames found in chatbox:', chatbox?.id);
            return null;
        }
        
        // In ra ID của tất cả các thành viên để debug
        const memberIds = chatbox.memberAccountUsernames.map(m => m.accountId).join(', ');
        const memberUsernames = chatbox.memberAccountUsernames.map(m => m.accountUsername).join(', ');
        console.log(`ChatBox ${chatbox.id} members - IDs: [${memberIds}], Usernames: [${memberUsernames}]`);
        
        // Nếu chỉ có một người dùng, trả về người đó
        if (chatbox.memberAccountUsernames.length === 1) {
            console.log(`ChatBox ${chatbox.id} has only one member, returning it:`, chatbox.memberAccountUsernames[0]?.accountFullname);
            return chatbox.memberAccountUsernames[0];
        }
        
        // ƯU TIÊN 1: Sử dụng email từ API để so sánh
        if (currentUserInfo && currentUserInfo.email) {
            const currentEmail = currentUserInfo.email;
            console.log(`ChatBox ${chatbox.id}: Comparing API email: ${currentEmail} with chat members`);
            
            const otherPerson = chatbox.memberAccountUsernames.find(
                member => member.accountUsername !== currentEmail
            );
            
            if (otherPerson) {
                console.log(`ChatBox ${chatbox.id}: Found other person using API email: ${otherPerson.accountFullname}`);
                return otherPerson;
            } else {
                console.log(`ChatBox ${chatbox.id}: Could not find other person using API email ${currentEmail}`);
            }
        } else {
            console.log(`ChatBox ${chatbox.id}: No API email available for comparison`);
        }
        
        // ƯU TIÊN 2: Sử dụng email từ localStorage để so sánh
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
            
            if (userInfo.email) {
                const localEmail = userInfo.email;
                console.log(`ChatBox ${chatbox.id}: Comparing localStorage email: ${localEmail} with chat members`);
                
                const otherPerson = chatbox.memberAccountUsernames.find(
                    member => member.accountUsername !== localEmail
                );
                
                if (otherPerson) {
                    console.log(`ChatBox ${chatbox.id}: Found other person using localStorage email: ${otherPerson.accountFullname}`);
                    return otherPerson;
                } else {
                    console.log(`ChatBox ${chatbox.id}: Could not find other person using localStorage email ${localEmail}`);
                }
            } else {
                console.log(`ChatBox ${chatbox.id}: No localStorage email available for comparison`);
            }
        } catch (error) {
            console.error(`ChatBox ${chatbox.id}: Error getting email from localStorage:`, error);
        }
        
        // DỰ PHÒNG: Sử dụng ID để so sánh
        if (currentUserInfo && currentUserInfo.id) {
            const apiId = currentUserInfo.id.toString();
            console.log(`ChatBox ${chatbox.id}: Comparing API ID: ${apiId} with chat members`);
            
            const otherPerson = chatbox.memberAccountUsernames.find(
                member => member.accountId !== apiId
            );
            
            if (otherPerson) {
                console.log(`ChatBox ${chatbox.id}: Found other person using API ID: ${otherPerson.accountFullname}`);
                return otherPerson;
            } else {
                console.log(`ChatBox ${chatbox.id}: Could not find other person using API ID ${apiId}`);
            }
        } else {
            console.log(`ChatBox ${chatbox.id}: No API ID available for comparison`);
        }
        
        // Trường hợp đặc biệt: nếu có chính xác 2 người và không thể xác định, trả về người còn lại
        if (chatbox.memberAccountUsernames.length === 2) {
            // Giả định rằng userInfo luôn là phần tử đầu tiên trong mảng, nên trả về phần tử thứ hai
            console.log(`ChatBox ${chatbox.id}: Using fallback method for 2-person chat, returning second member: ${chatbox.memberAccountUsernames[1]?.accountFullname}`);
            return chatbox.memberAccountUsernames[1];
        }
        
        // Nếu không thể xác định, trả về người dùng đầu tiên trong danh sách
        console.log(`ChatBox ${chatbox.id}: Could not determine other person, returning first member: ${chatbox.memberAccountUsernames[0]?.accountFullname}`);
        return chatbox.memberAccountUsernames[0];
    };

    // Khi currentUserInfo thay đổi (đã lấy được từ API), tải lại danh sách chat nếu cần
    useEffect(() => {
        if (currentUserInfo) {
            console.log('Current user info from API is now available. Refreshing chat list if needed.');
            // Kiểm tra nếu danh sách chat đã được tải trước đó
            if (allChatboxes.length === 0 && !chatboxesLoading) {
                refreshChatboxList();
            }
        }
    }, [currentUserInfo]);

    // Hàm helper để lấy tên hiển thị của người dùng trong chat
    const getChatDisplayName = (chatbox) => {
        // Nếu là chat nhóm, hiển thị tên nhóm
        if (chatbox.group) {
            return chatbox.name || 'Chat Group';
        }
        
        // Nếu là chat trực tiếp, hiển thị tên người còn lại
        const otherPerson = findOtherPersonInChat(chatbox);
        return otherPerson?.accountFullname || chatbox.name || 'Direct Chat';
    };

    // Sử dụng ref để theo dõi tin nhắn mới nhất cho mỗi chatbox
    const lastMessageTimeRef = useRef({});

    // Cập nhật lastMessageTimeRef khi có tin nhắn mới
    useEffect(() => {
        if (selectedChatbox && messages.length > 0) {
            // Lấy tin nhắn mới nhất trong chatbox hiện tại
            const sortedMessages = [...messages].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            
            // Lưu thời gian tin nhắn mới nhất cho chatbox này
            if (sortedMessages[0]) {
                lastMessageTimeRef.current[selectedChatbox.id] = sortedMessages[0].createdAt;
            }
        }
    }, [messages, selectedChatbox]);

    // Thêm useEffect để xử lý đóng panel khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Kiểm tra xem panel có đang hiển thị không và click có phải là bên ngoài panel không
            if (showChatInfo) {
                const panel = document.querySelector('.chat-info-panel');
                const button = document.querySelector('.chat-header-action-btn');
                
                if (panel && !panel.contains(event.target) && button && !button.contains(event.target)) {
                    setShowChatInfo(false);
                }
            }
        };
        
        // Thêm event listener
        document.addEventListener('mousedown', handleClickOutside);
        
        // Cleanup
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showChatInfo]);

    // Hàm để mở modal upload avatar nhóm
    const handleOpenAvatarUploadModal = () => {
        if (!selectedChatbox || !selectedChatbox.group) {
            console.log('Không thể thay đổi avatar: Chatbox không phải là nhóm hoặc chưa được chọn');
            return;
        }
        
        setShowAvatarUploadModal(true);
        setUploadAvatarError(null);
        setGroupAvatarPreview(null);
        setSelectedGroupAvatar(null);
        
        console.log('Mở modal upload avatar cho nhóm:', selectedChatbox.name);
    };

    // Hàm đóng modal upload avatar và reset các state
    const handleCloseAvatarUploadModal = () => {
        setShowAvatarUploadModal(false);
        setUploadAvatarError(null);
        setGroupAvatarPreview(null);
        setSelectedGroupAvatar(null);
    };

    // Hàm xử lý khi người dùng chọn file avatar
    const handleGroupAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Kiểm tra kích thước file (tối đa 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setUploadAvatarError('Kích thước ảnh không được vượt quá 5MB');
                return;
            }
            
            // Kiểm tra loại file
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
            if (!validImageTypes.includes(file.type)) {
                setUploadAvatarError('Chỉ chấp nhận các file hình ảnh (JPG, PNG, GIF)');
                return;
            }
            
            // Cập nhật state file đã chọn
            setSelectedGroupAvatar(file);
            
            // Tạo preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setGroupAvatarPreview(e.target.result);
            };
            reader.readAsDataURL(file);
            
            // Xóa thông báo lỗi nếu có
            setUploadAvatarError(null);
        }
    };

    // Hàm upload avatar nhóm lên server
    const handleGroupAvatarUpload = async () => {
        if (!selectedGroupAvatar || !selectedChatbox || !selectedChatbox.id) {
            setUploadAvatarError('Vui lòng chọn hình ảnh trước khi tải lên');
            return;
        }
        
        try {
            setUploadingGroupAvatar(true);
            setUploadAvatarError(null);
            
            // Lấy token xác thực
            const token = getToken();
            if (!token) {
                throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            }
            
            // Tạo form data
            const formData = new FormData();
            formData.append('file', selectedGroupAvatar);
            
            console.log('Bắt đầu upload avatar nhóm...');
            
            // Gọi API để upload avatar
            const response = await axios.post(
                `${API_BASE_URL}/lms/chatBox/${selectedChatbox.id}/upload-avatar`, 
                formData, 
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            console.log('Kết quả upload avatar:', response.data);
            
            // Kiểm tra kết quả từ API
            if (response.data && (response.data.code === 0 || response.status === 200)) {
                // Lấy đường dẫn avatar mới từ phản hồi API
                const newAvatarPath = response.data.result;
                console.log('Đường dẫn avatar mới:', newAvatarPath);
                
                // Cập nhật avatar cho chatbox trong state
                if (newAvatarPath) {
                    // Tạo URL preview trước bằng Blob URL từ file đã chọn
                    const tempUrl = URL.createObjectURL(selectedGroupAvatar);
                    
                    // Cập nhật cache trước
                    setAvatarCache(prev => ({
                        ...prev,
                        [newAvatarPath]: tempUrl
                    }));
                    
                    // Cập nhật chatbox được chọn
                    setSelectedChatbox(prev => ({
                        ...prev,
                        avatar: newAvatarPath
                    }));
                    
                    // Cập nhật danh sách chatbox
                    setAllChatboxes(prev => 
                        prev.map(cb => 
                            cb.id === selectedChatbox.id 
                            ? { ...cb, avatar: newAvatarPath } 
                            : cb
                        )
                    );
                    
                    setDisplayedChatboxes(prev => 
                        prev.map(cb => 
                            cb.id === selectedChatbox.id 
                            ? { ...cb, avatar: newAvatarPath } 
                            : cb
                        )
                    );
                    
                    // Hiển thị thông báo thành công
                    showTemporaryNotification('Đã cập nhật ảnh đại diện nhóm!');
                    
                    // Tải avatar thực từ server một cách không đồng bộ
                    setTimeout(() => {
                        fetchAvatar(newAvatarPath).catch(err => 
                            console.error('Lỗi khi tải lại avatar mới:', err)
                        );
                    }, 1000);
                }
                
                // Đóng modal
                handleCloseAvatarUploadModal();
            } else {
                throw new Error('Không thể tải lên ảnh đại diện. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi khi upload avatar nhóm:', error);
            setUploadAvatarError(`Lỗi: ${error.response?.data?.message || error.message || 'Không thể tải lên ảnh đại diện'}`);
        } finally {
            setUploadingGroupAvatar(false);
        }
    };

    // Thêm useEffect để tải avatar cho nhóm chat khi chọn chatbox
    useEffect(() => {
        // Tải avatar cho nhóm chat được chọn
        const loadGroupAvatar = async () => {
            if (selectedChatbox && selectedChatbox.group && selectedChatbox.avatar) {
                console.log('Đang tải avatar cho nhóm:', selectedChatbox.name);
                
                // Kiểm tra nếu chưa có trong cache
                if (!avatarCache[selectedChatbox.avatar]) {
                    try {
                        // Thử tải trực tiếp
                        const token = getToken();
                        if (!token) return;
                        
                        const fullUrl = `http://localhost:8080${selectedChatbox.avatar}`;
                        console.log('Tải avatar nhóm từ:', fullUrl);
                        
                        const response = await fetch(fullUrl, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        
                        const imageBlob = await response.blob();
                        console.log('Kích thước blob avatar nhóm:', imageBlob.size, 'bytes');
                        
                        if (imageBlob.size > 0) {
                            const imageUrl = URL.createObjectURL(imageBlob);
                            console.log('Đã tạo blob URL cho avatar nhóm:', imageUrl);
                            
                            // Cập nhật cache
                            setAvatarCache(prev => ({
                                ...prev,
                                [selectedChatbox.avatar]: imageUrl
                            }));
                        }
                    } catch (error) {
                        console.error('Lỗi khi tải avatar nhóm:', error);
                    }
                }
            }
        };
        
        loadGroupAvatar();
    }, [selectedChatbox, avatarCache]);

    // Hàm bắt đầu chỉnh sửa tên nhóm
    const handleStartEditingGroupName = () => {
        // Chỉ cho phép đổi tên nhóm chat, không đổi tên chat cá nhân
        if (!selectedChatbox || !selectedChatbox.group) return;
        
        setNewGroupName(selectedChatbox.name || '');
        setIsEditingGroupName(true);
        setRenamingError(null);
        
        // Focus vào input sau khi render
        setTimeout(() => {
            if (groupNameInputRef.current) {
                groupNameInputRef.current.focus();
            }
        }, 100);
    };

    // Hàm hủy chỉnh sửa tên nhóm
    const handleCancelEditingGroupName = () => {
        setIsEditingGroupName(false);
        setRenamingError(null);
    };

    // Hàm lưu tên nhóm mới
    const handleSaveGroupName = async () => {
        // Kiểm tra tên nhóm mới không được để trống
        if (!newGroupName.trim()) {
            setRenamingError('Tên nhóm không được để trống');
            return;
        }
        
        // Nếu tên không thay đổi, hủy chỉnh sửa
        if (newGroupName.trim() === selectedChatbox.name) {
            setIsEditingGroupName(false);
            return;
        }
        
        try {
            // Lấy token xác thực
            const token = getToken();
            if (!token) {
                throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            }
            
            console.log(`Đang đổi tên nhóm ${selectedChatbox.id} từ "${selectedChatbox.name}" thành "${newGroupName}"`);
            
            // Gọi API để đổi tên nhóm
            const response = await axios.put(
                `${API_BASE_URL}/lms/chatBox/rename`, 
                null, // không cần body vì dùng params
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        chatBoxId: selectedChatbox.id,
                        newName: newGroupName.trim()
                    }
                }
            );
            
            console.log('Kết quả đổi tên nhóm:', response.data);
            
            // Kiểm tra kết quả từ API
            if (response.data && (response.data.code === 0 || response.status === 200)) {
                // Cập nhật tên nhóm trong state
                const updatedChatBox = response.data.result;
                
                // Cập nhật selectedChatbox
                setSelectedChatbox(prev => ({
                    ...prev,
                    name: updatedChatBox.name || newGroupName.trim()
                }));
                
                // Cập nhật danh sách chatbox
                setAllChatboxes(prev => 
                    prev.map(cb => 
                        cb.id === selectedChatbox.id 
                        ? { ...cb, name: updatedChatBox.name || newGroupName.trim() } 
                        : cb
                    )
                );
                
                setDisplayedChatboxes(prev => 
                    prev.map(cb => 
                        cb.id === selectedChatbox.id 
                        ? { ...cb, name: updatedChatBox.name || newGroupName.trim() } 
                        : cb
                    )
                );
                
                // Hiển thị thông báo thành công
                showTemporaryNotification('Đã cập nhật tên nhóm!');
                
                // Kết thúc chỉnh sửa
                setIsEditingGroupName(false);
            } else {
                throw new Error('Không thể đổi tên nhóm. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi khi đổi tên nhóm:', error);
            setRenamingError(`Lỗi: ${error.response?.data?.message || error.message || 'Không thể đổi tên nhóm'}`);
        }
    };

    // Hàm xử lý khi nhấn phím trong input tên nhóm
    const handleGroupNameKeyDown = (e) => {
        if (e.key === 'Enter') {
        e.preventDefault();
            handleSaveGroupName();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancelEditingGroupName();
        }
    };

    // Hàm lấy email của người dùng trong chat
    const getSenderEmail = (memberAccounts) => {
        if (!memberAccounts || !Array.isArray(memberAccounts) || memberAccounts.length === 0) {
            return '';
        }
        
        // Tìm người dùng khác (không phải người dùng hiện tại)
        const otherPerson = findOtherPersonInChat({memberAccountUsernames: memberAccounts});
        
        // Trả về email của người đó (thường là accountUsername)
        return otherPerson?.accountUsername || '';
    };

    // Hàm toggle section nhóm
    const toggleGroupSection = (e) => {
        e.stopPropagation(); // Ngăn sự kiện lan truyền lên các phần tử cha
        setGroupSectionExpanded(!groupSectionExpanded);
    };

    // Hàm toggle section tin nhắn trực tiếp
    const toggleDirectMessageSection = (e) => {
        e.stopPropagation(); // Ngăn sự kiện lan truyền lên các phần tử cha
        setDirectMessageSectionExpanded(!directMessageSectionExpanded);
    };

    // Thêm useEffect để mở rộng section khi có tin nhắn mới
    useEffect(() => {
        // Kiểm tra nếu có bất kỳ chatbox nhóm nào có tin nhắn mới
        const hasNewGroupMessages = channelsToDisplay.some(chatbox => chatbox.hasNewMessages);
        if (hasNewGroupMessages && !groupSectionExpanded) {
            setGroupSectionExpanded(true);
        }
        
        // Kiểm tra nếu có bất kỳ chatbox tin nhắn trực tiếp nào có tin nhắn mới
        const hasNewDirectMessages = directMessagesToDisplay.some(chatbox => chatbox.hasNewMessages);
        if (hasNewDirectMessages && !directMessageSectionExpanded) {
            setDirectMessageSectionExpanded(true);
        }
    }, [channelsToDisplay, directMessagesToDisplay, groupSectionExpanded, directMessageSectionExpanded]);
    
    // Thêm useEffect để mở rộng section khi chatbox được chọn
    useEffect(() => {
        if (selectedChatbox) {
            // Nếu chatbox được chọn là nhóm, mở rộng section nhóm
            if (selectedChatbox.group && !groupSectionExpanded) {
                setGroupSectionExpanded(true);
            }
            // Nếu chatbox được chọn là tin nhắn trực tiếp, mở rộng section tin nhắn
            else if (!selectedChatbox.group && !directMessageSectionExpanded) {
                setDirectMessageSectionExpanded(true);
            }
        }
    }, [selectedChatbox, groupSectionExpanded, directMessageSectionExpanded]);

    // Kiểm tra xem có tin nhắn mới nào trong section nhóm không
    const hasNewGroupMessages = channelsToDisplay.some(chatbox => chatbox.hasNewMessages);
    
    // Kiểm tra xem có tin nhắn mới nào trong section tin nhắn trực tiếp không
    const hasNewDirectMessages = directMessagesToDisplay.some(chatbox => chatbox.hasNewMessages);
    
    // Hàm toggle modal thêm thành viên
    const toggleAddMemberModal = () => {
        setShowAddMemberModal(!showAddMemberModal);
        if (!showAddMemberModal) {
            // Reset form khi mở modal
            setSelectedNewMembers([]);
            setSearchMemberQuery('');
            setSearchMemberResults([]);
            setAddMemberError(null);
        }
    };

    // Tìm kiếm thành viên để thêm vào nhóm
    const searchMembers = async (query) => {
        if (!query.trim() || !selectedChatbox) {
            setSearchMemberResults([]);
            return;
        }

        const token = getToken();
        if (!token) return;

        setIsSearchingMembers(true);
        try {
            // Sử dụng endpoint tìm kiếm thành viên
            const response = await axios.get(`${API_BASE_URL}/lms/chatmember/search`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { 
                    chatBoxId: selectedChatbox.id, // Truyền ID của chatbox hiện tại
                    searchString: query,
                    pageNumber: 0,
                    pageSize: 10
                }
            });

            if (response.data && response.data.result && response.data.result.content) {
                setSearchMemberResults(response.data.result.content);
            } else {
                setSearchMemberResults([]);
            }
        } catch (error) {
            console.error('Lỗi khi tìm kiếm thành viên:', error);
            setSearchMemberResults([]);
        } finally {
            setIsSearchingMembers(false);
        }
    };

    // Xử lý khi chọn thành viên từ kết quả tìm kiếm
    const handleSelectMember = (user) => {
        // Kiểm tra xem người dùng đã được chọn chưa
        if (!selectedNewMembers.some(selectedUser => selectedUser.accountId === user.accountId)) {
            setSelectedNewMembers([...selectedNewMembers, user]);
        }
        setSearchMemberQuery('');
        setSearchMemberResults([]);
    };

    // Xóa thành viên đã chọn
    const handleRemoveMember = (userId) => {
        setSelectedNewMembers(selectedNewMembers.filter(user => user.accountId !== userId));
    };

    // Thêm thành viên vào nhóm chat
    const handleAddMembersToGroup = async () => {
        if (selectedNewMembers.length === 0) {
            setAddMemberError('Vui lòng chọn ít nhất một người dùng để thêm vào nhóm');
            return;
        }

        const token = getToken();
        if (!token) {
            setAddMemberError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            return;
        }

        try {
            // Kiểm tra kết nối WebSocket
            if (!stompClientRef.current || !stompClientRef.current.connected) {
                console.warn('⚠️ WebSocket không kết nối, đang thử kết nối lại...');
                
                try {
                    await connectWebSocket();
                } catch (error) {
                    console.error('❌ Không thể kết nối WebSocket:', error);
                    throw new Error('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
                }
                
                if (!stompClientRef.current || !stompClientRef.current.connected) {
                    throw new Error('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
                }
            }
            
            // Lấy thông tin người dùng hiện tại
            let apiUserInfo = currentUserInfo;
            if (!apiUserInfo) {
                apiUserInfo = await getCurrentUserInfo();
                if (!apiUserInfo) {
                    throw new Error('Không thể lấy thông tin người dùng. Vui lòng thử lại.');
                }
            }
            
            // Lấy username của người dùng hiện tại
            const currentUsername = apiUserInfo.email || JSON.parse(localStorage.getItem('userInfo'))?.email || '';
            
            if (!currentUsername) {
                throw new Error('Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại.');
            }
            
            // Tạo danh sách thành viên theo định dạng yêu cầu
            const chatMemberRequests = selectedNewMembers.map(user => ({
                memberId: user.accountId.toString(),
                memberAccount: user.accountUsername
            }));
            
            console.log('Thêm thành viên mới vào nhóm:', chatMemberRequests);
            
            // Tạo đối tượng request theo đúng định dạng ChatBoxAddMemberRequest
            const addMemberRequest = {
                chatboxId: selectedChatbox.id.toString(),
                chatBoxName: selectedChatbox.name || '',
                chatMemberRequests: chatMemberRequests,
                usernameOfRequestor: currentUsername
            };
            
            console.log('Gửi request thêm thành viên qua WebSocket:', addMemberRequest);
            
            // Gửi request qua WebSocket
            stompClientRef.current.publish({
                destination: '/app/chat/addMembers',
                body: JSON.stringify(addMemberRequest),
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('✅ Đã gửi yêu cầu thêm thành viên qua WebSocket');
            
            // Hiển thị thông báo thành công
            showTemporaryNotification('Đã thêm thành viên vào nhóm!');
            
            // Thêm thành viên vào state mà không đợi phản hồi từ API (optimistic update)
            // Cập nhật UI để hiển thị thành viên mới ngay lập tức
            const updatedMembers = [
                ...(selectedChatbox.memberAccountUsernames || []),
                ...selectedNewMembers.map(user => ({
                    accountId: user.accountId,
                    accountUsername: user.accountUsername,
                    accountFullname: user.accountFullname,
                    avatar: user.avatar
                }))
            ];
            
            // Cập nhật chatbox được chọn
            setSelectedChatbox(prev => ({
                ...prev,
                memberAccountUsernames: updatedMembers
            }));
            
            // Đóng modal
            setShowAddMemberModal(false);
            
            // Làm mới danh sách chatbox sau 2 giây
            setTimeout(() => {
                refreshChatboxList();
            }, 2000);
            
        } catch (error) {
            console.error('Lỗi khi thêm thành viên:', error);
            setAddMemberError(`Lỗi: ${error.response?.data?.message || error.message || 'Không thể thêm thành viên'}`);
        }
    };

    // Thêm useEffect để xử lý tìm kiếm thành viên với debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchMemberQuery.trim()) {
                searchMembers(searchMemberQuery);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchMemberQuery]);

    // Hàm hiển thị menu thành viên
    const toggleMemberMenu = (memberId, e) => {
        e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
        
        if (activeMemberMenu === memberId) {
            setActiveMemberMenu(null);
        } else {
            setActiveMemberMenu(memberId);
        }
    };

    // Hàm đóng tất cả các menu thành viên khi click ra ngoài
    const closeMemberMenus = () => {
        setActiveMemberMenu(null);
    };

    // Thêm useEffect để đóng menu khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeMemberMenu && !event.target.closest('.member-menu-container')) {
                setActiveMemberMenu(null);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeMemberMenu]);

    // Hàm hiển thị modal xác nhận xóa thành viên
    const showRemoveMemberConfirmation = (member, e) => {
        e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
        
        // Kiểm tra nếu nhóm chỉ còn 3 thành viên thì không cho phép xóa
        if (selectedChatbox.memberAccountUsernames && selectedChatbox.memberAccountUsernames.length <= 3) {
            showTemporaryNotification('Không thể xóa thành viên khi nhóm chỉ còn 3 người!');
            setActiveMemberMenu(null); // Đóng menu
            return;
        }
        
        setMemberToRemove(member);
        setShowRemoveMemberModal(true);
        setActiveMemberMenu(null); // Đóng menu
        setRemoveMemberError(null);
    };

    // Hàm đóng modal xác nhận xóa thành viên
    const closeRemoveMemberModal = () => {
        setShowRemoveMemberModal(false);
        setMemberToRemove(null);
        setRemoveMemberError(null);
    };

    // Hàm xóa thành viên khỏi nhóm chat
    const handleRemoveMemberFromGroup = async () => {
        if (!memberToRemove || !selectedChatbox) {
            return;
        }
        
        // Kiểm tra lại nếu nhóm chỉ còn 3 thành viên thì không cho phép xóa
        if (selectedChatbox.memberAccountUsernames && selectedChatbox.memberAccountUsernames.length <= 3) {
            setRemoveMemberError('Không thể xóa thành viên khi nhóm chỉ còn 3 người!');
            return;
        }
        
        setRemovingMember(true);
        setRemoveMemberError(null);
        
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            }
            
            const memberUsername = memberToRemove.accountUsername;
            const chatBoxId = selectedChatbox.id;
            
            console.log(`Đang xóa thành viên ${memberUsername} khỏi nhóm ${chatBoxId}...`);
            
            // Gọi API xóa thành viên
            const response = await axios.delete(
                `http://localhost:8080/lms/chatBox/${chatBoxId}/members/${memberUsername}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            console.log('Kết quả xóa thành viên:', response.data);
            
            // Cập nhật UI sau khi xóa thành công
            const updatedMembers = selectedChatbox.memberAccountUsernames.filter(
                member => member.accountUsername !== memberUsername
            );
            
            // Cập nhật chatbox được chọn
            setSelectedChatbox(prev => ({
                ...prev,
                memberAccountUsernames: updatedMembers
            }));
            
            // Hiển thị thông báo thành công
            showTemporaryNotification('Đã xóa thành viên khỏi nhóm!');
            
            // Đóng modal
            closeRemoveMemberModal();
            
            // Làm mới danh sách chatbox sau 1 giây
            setTimeout(() => {
                refreshChatboxList();
            }, 1000);
            
        } catch (error) {
            console.error('Lỗi khi xóa thành viên:', error);
            setRemoveMemberError(`Lỗi: ${error.response?.data?.message || error.message || 'Không thể xóa thành viên'}`);
        } finally {
            setRemovingMember(false);
        }
    };

    return (
        <div className="chatbox-container">
            {/* Left Sidebar */}
            <div className="chatbox-sidebar">
                <div className="chatbox-sidebar-header-container">
                    <h2 className="chatbox-sidebar-header">NHẮN TIN</h2>
                </div>
                
                {chatboxesLoading && displayedChatboxes.length === 0 && <p className="sidebar-loading">Loading chats...</p>}
                {chatboxesError && <p className="sidebar-error">{chatboxesError}</p>}
                
                {/* Channels Section - Populated from API */} 
                <div className="sidebar-section">
                    <div 
                        className={`chatbox-section-header ${groupSectionExpanded ? 'active' : ''} ${hasNewGroupMessages && !groupSectionExpanded ? 'has-new-messages' : ''}`} 
                        onClick={toggleGroupSection}
                    >
                        <h3>Nhóm</h3>
                        <div className="section-header-right">
                            {hasNewGroupMessages && !groupSectionExpanded && (
                                <span className="section-new-indicator"></span>
                            )}
                            <BiChevronDown className={`toggle-icon ${!groupSectionExpanded ? 'collapsed' : ''}`} />
                        </div>
                    </div>
                    <div className={`sidebar-section-content ${groupSectionExpanded ? 'expanded' : 'collapsed'}`}>
                        <ul className="channel-list">
                            {channelsToDisplay.map(chatbox => (
                                <li key={chatbox.id} 
                                    className={`channel-item ${selectedChatbox?.id === chatbox.id ? 'active' : ''} ${chatbox.hasNewMessages ? 'has-new-messages' : ''}`}
                                    onClick={() => handleSelectChatbox(chatbox)} >
                                    <div className="channel-item-header">
                                    <Users className="channel-icon" size={16} />
                                        <span className="channel-name">{chatbox.name || 'Unnamed Group'}</span>
                                    </div>
                                    {chatbox.hasNewMessages && chatbox.newMessageCount > 0 && (
                                        <span className={`new-message-badge ${chatbox.newMessageCount > 9 ? 'count' : ''}`}>
                                            {chatbox.newMessageCount > 99 ? '99+' : chatbox.newMessageCount}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                        {/* Kept your original Add New Channel button structure */}
                        <button className="add-new-button" onClick={toggleCreateChannelModal}>
                            <BiPlus />
                            <span>Nhóm Mới</span>
                        </button>
                    </div>
                </div>
                
                {/* Direct Messages Section - Populated from API */} 
                <div className="sidebar-section">
                    <div 
                        className={`chatbox-section-header ${directMessageSectionExpanded ? 'active' : ''} ${hasNewDirectMessages && !directMessageSectionExpanded ? 'has-new-messages' : ''}`}
                        onClick={toggleDirectMessageSection}
                    >
                        <h3>Tin Nhắn</h3>
                        <div className="section-header-right">
                            {hasNewDirectMessages && !directMessageSectionExpanded && (
                                <span className="section-new-indicator"></span>
                            )}
                            <BiChevronDown className={`toggle-icon ${!directMessageSectionExpanded ? 'collapsed' : ''}`} />
                        </div>
                    </div>
                    <div className={`sidebar-section-content ${directMessageSectionExpanded ? 'expanded' : 'collapsed'}`}>
                        <ul className="dm-list">
                            {directMessagesToDisplay.map(chatbox => {
                                // Sử dụng hàm tiện ích để tìm người dùng còn lại
                                const otherPerson = findOtherPersonInChat(chatbox);
                                const displayName = getChatDisplayName(chatbox);

                                return (
                                    <li key={chatbox.id} 
                                        className={`dm-item ${selectedChatbox?.id === chatbox.id ? 'active' : ''} ${chatbox.hasNewMessages ? 'has-new-messages' : ''}`}
                                        onClick={() => handleSelectChatbox(chatbox)} >
                                        <div className="dm-item-header">
                                            <div className="dm-icon-wrapper"> 
                                                {getSenderAvatar(otherPerson)} 
                                            </div>
                                            <span className="dm-name">
                                                {displayName}
                                            </span>
                                        </div>
                                        {chatbox.hasNewMessages && chatbox.newMessageCount > 0 && (
                                            <span className={`new-message-badge ${chatbox.newMessageCount > 9 ? 'count' : ''}`}>
                                                {chatbox.newMessageCount > 99 ? '99+' : chatbox.newMessageCount}
                                            </span>
                                        )}
                                </li>
                                );
                            })}
                        </ul>
                        {/* Kept your original Add New Chat button structure */}
                        <button className="add-new-button" onClick={toggleDirectChatModal}>
                            <BiPlus />
                            <span>Tin Nhắn Mới</span>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Chat Area */}
            <div className="chat-area">
                {!selectedChatbox ? (
                    <div className="no-chat-selected">
                        <BiMessageDetail size={80} />
                        <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
                    </div>
                ) : (
                    <>
                {/* Chat Header */}
                <div className="chat-header">
                    <div className="chat-header-left">
                        {selectedChatbox.group ? (
                            // Hiển thị biểu tượng nhóm hoặc avatar nhóm nếu có
                            <div className="chat-header-icon">
                                <GroupHeaderAvatar 
                                    avatar={selectedChatbox.avatar} 
                                    name={selectedChatbox.name} 
                                    fetchAvatar={fetchAvatar}
                                />
                            </div>
                        ) : (
                            // Hiển thị avatar người dùng cho trò chuyện trực tiếp
                            <div className="chat-header-icon">
                                {getSenderAvatar(findOtherPersonInChat(selectedChatbox))}
                            </div>
                        )}
                        <h2 className="chat-header-title">
                            {getChatDisplayName(selectedChatbox)}
                        </h2>
                    </div>
                    <div className="chat-header-right">
                        <button className="chat-header-action-btn" title="More options" onClick={toggleChatInfo}>
                            <FiMoreVertical />
                        </button>
                    </div>
                </div>
                
                {/* Chat Info Panel */}
                <div className={`chat-info-panel ${showChatInfo ? 'active' : ''}`}>
                    <div className="chat-info-header">
                        <h3>{selectedChatbox.group ? 'Thông tin nhóm' : 'Thông tin người dùng'}</h3>
                        <button className="close-chat-info-btn" onClick={toggleChatInfo}>
                            <BiX size={24} />
                        </button>
                    </div>
                    
                    <div className="chat-info-content">
                        {/* Avatar và Tên */}
                        <div className="chat-info-profile">
                            {selectedChatbox.group ? (
                                /* Hiển thị avatar nhóm nếu là group chat */
                                <GroupInfoAvatar 
                                    chatbox={selectedChatbox} 
                                    onOpenUploadModal={handleOpenAvatarUploadModal}
                                    fetchAvatar={fetchAvatar}
                                />
                            ) : (
                                /* Hiển thị avatar người dùng nếu là direct message */
                                <div className="user-large-avatar">
                                    {getSenderAvatar(findOtherPersonInChat(selectedChatbox))}
                                </div>
                            )}
                            
                            {selectedChatbox && selectedChatbox.group ? (
                                /* Form chỉnh sửa tên nhóm */
                                isEditingGroupName ? (
                                    <div className="edit-group-name-container">
                                        <input
                                            type="text"
                                            className="edit-group-name-input"
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                            onKeyDown={handleGroupNameKeyDown}
                                            autoFocus
                                            ref={groupNameInputRef}
                                        />
                                        {renamingError && <div className="rename-error">{renamingError}</div>}
                                        <div className="edit-group-name-actions">
                                            <button
                                                className="cancel-group-name-btn"
                                                onClick={handleCancelEditingGroupName}
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                className="save-group-name-btn"
                                                onClick={handleSaveGroupName}
                                                disabled={!newGroupName.trim() || newGroupName === selectedChatbox.name}
                                            >
                                                Lưu
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Hiển thị tên nhóm có thể chỉnh sửa */
                                    <div 
                                        className="chat-info-name editable" 
                                        onClick={handleStartEditingGroupName}
                                    >
                                        <span>{selectedChatbox.name}</span>
                                        <BiPencil className="edit-icon" />
                                    </div>
                                )
                            ) : (
                                /* Hiển thị tên người dùng nếu là direct message */
                                <div className="chat-info-name">
                                    {findOtherPersonInChat(selectedChatbox)?.accountFullname || getChatDisplayName(selectedChatbox)}
                                </div>
                            )}
                            
                            {/* Hiển thị username nếu là direct message */}
                            {!selectedChatbox.group && (
                                <div className="chat-info-email">
                                    {findOtherPersonInChat(selectedChatbox)?.accountUsername || ''}
                                </div>
                            )}
                        </div>
                        
                        {/* Hành động - Chỉ hiển thị nút thêm thành viên nếu là nhóm */}
                        {selectedChatbox.group && (
                            <div className="chat-info-actions">
                                <button className="add-member-btn" onClick={toggleAddMemberModal}>
                                    <BiPlus size={18} />
                                    <span>Thêm thành viên</span>
                                </button>
                            </div>
                        )}
                        
                        {/* Danh sách thành viên - Chỉ hiển thị nếu là nhóm */}
                        {selectedChatbox.group && (
                            <div className="chat-members-list">
                                <h4>Thành viên ({selectedChatbox.memberAccountUsernames?.length || 0})</h4>
                                {selectedChatbox.memberAccountUsernames && selectedChatbox.memberAccountUsernames.length > 0 ? (
                                    <ul>
                                        {selectedChatbox.memberAccountUsernames.map(member => (
                                            <li key={member.accountId} className="chat-member-item">
                                                <div className="member-avatar">
                                                    {getSenderAvatar(member)}
                                                </div>
                                                <div className="member-info">
                                                    <span className="member-name">{member.accountFullname || member.accountUsername}</span>
                                                    <span className="member-email">{member.accountUsername}</span>
                                                </div>
                                                <div className="member-menu-container">
                                                    <button 
                                                        className="member-menu-button" 
                                                        onClick={(e) => toggleMemberMenu(member.accountId, e)}
                                                        aria-label="Member options"
                                                    >
                                                        <BsThreeDotsVertical size={16} />
                                                    </button>
                                                    {activeMemberMenu === member.accountId && (
                                                        <div className="member-menu-dropdown">
                                                            <button 
                                                                className={`member-menu-item remove-member ${selectedChatbox.memberAccountUsernames.length <= 3 ? 'disabled' : ''}`}
                                                                onClick={(e) => showRemoveMemberConfirmation(member, e)}
                                                                disabled={selectedChatbox.memberAccountUsernames.length <= 3}
                                                            >
                                                                <BiX size={18} />
                                                                <span>Xóa thành viên</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-members-message">Không có thành viên</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Chat Messages */}
                <div className="chat-messages" ref={chatMessagesContainerRef}>
                    {isLoadingMessages && messages.length === 0 && 
                        <div className="messages-loading">
                            <div className="loading-spinner"></div>
                            <p>Đang tải tin nhắn...</p>
                        </div>
                    }
                    
                    {messagesError && <p className="messages-error">{messagesError}</p>}
                    
                    {hasMoreMessages && (
                        <div className="load-more-messages-container">
                            <button onClick={() => fetchMessages(selectedChatbox.id, currentPage + 1)} className="load-more-messages-btn">
                                Tải thêm tin nhắn cũ
                            </button>
                                </div>
                            )}

                    {messages.length === 0 && !isLoadingMessages && (
                        <div className="no-messages">
                            <p>Chưa có tin nhắn nào trong cuộc trò chuyện này</p>
                            <p className="no-messages-hint">Hãy bắt đầu cuộc trò chuyện ngay!</p>
                        </div>
                    )}
                    
                    {messages.map((msg, index) => {
                        // Lấy email của người dùng hiện tại
                        const currentUserEmail = currentUserInfo?.email || 
                                                JSON.parse(localStorage.getItem('userInfo'))?.email || 
                                                localStorage.getItem('email');
                        
                        // Lấy email của người gửi
                        const senderEmail = msg.sender?.email || 
                                            msg.sender?.username || 
                                            msg.sender?.accountUsername || 
                                            (msg.senderAccount && msg.senderAccount.length > 0 ? msg.senderAccount[0].accountUsername : null);
                        
                        // So sánh để xác định tin nhắn là của mình hay người khác
                        const isMe = currentUserEmail && senderEmail && senderEmail.toLowerCase() === currentUserEmail.toLowerCase();
                        
                        // Lưu lại flag isFromCurrentUser để các phần khác có thể sử dụng
                        msg.isFromCurrentUser = isMe;
                        
                        // Get sender information from the updated structure
                        const sender = msg.sender || 
                            (msg.senderAccount && msg.senderAccount.length > 0 ? {
                                id: msg.senderAccount[0].accountId,
                                name: msg.senderAccount[0].accountFullname || msg.senderAccount[0].accountUsername,
                                avatarUrl: msg.senderAccount[0].avatar,
                                // Thêm các trường gốc để dễ dàng sử dụng khi cần
                                accountId: msg.senderAccount[0].accountId,
                                accountUsername: msg.senderAccount[0].accountUsername,
                                accountFullname: msg.senderAccount[0].accountFullname,
                                avatar: msg.senderAccount[0].avatar
                            } : null);
                        
                        // Check if we should show a date separator
                        const showDateSeparator = index === 0 || 
                            new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
                        
                        // Kiểm tra nếu tin nhắn có nội dung
                        if (!msg.content && !msg.path) {
                            return null; // Không hiển thị tin nhắn rỗng
                        }
                        
                        // Kiểm tra xem đây có phải là tin nhắn mới đến không
                        const isNewMessage = !msg.isOptimistic && 
                                             msg.id && 
                                             !msg.id.toString().startsWith('temp-') && 
                                             new Date(msg.createdAt) > new Date(Date.now() - 10000); // Trong vòng 10 giây
                        
                        return (
                            <React.Fragment key={msg.id || index}>
                                {showDateSeparator && (
                                    <div className="date-separator">
                                        {new Date(msg.createdAt).toLocaleDateString('vi-VN', { 
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </div>
                                )}
                                <div className={`message-container ${isMe ? 'current-user' : ''} ${isNewMessage ? 'new-message' : ''}`}>
                                    {!isMe && (
                                <div className="message-avatar">
                                            {getSenderAvatar(sender)}
                                </div>
                            )}
                                    {isMe && (
                                        <div className="message-avatar current-user-avatar">
                                            {getSenderAvatar(sender)} 
                                        </div>
                                    )}
                                    <div className={`message-bubble ${isMe ? 'current-user' : ''} ${msg.isOptimistic ? 'optimistic-message' : ''}`}>
                                        {!isMe && <div className="message-sender-name">{sender?.name || sender?.accountFullname || sender?.accountUsername || 'Người dùng không xác định'}</div>} 
                                        <div className="message-content">{msg.content}</div>
                                        <div className="message-time">
                                            {formatDisplayTime(msg.createdAt)}
                                            {msg.isOptimistic && <span className="message-sending"> (đang gửi...)</span>}
                                        </div>
                            </div>
                            
                        </div>
                            </React.Fragment>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
                
                {/* Message Input */}
                <form className="message-input-container" onSubmit={handleSendMessage}>
                    <button type="button" className="attach-button" title="Đính kèm tệp (tính năng sắp ra mắt)">
                        <FiPaperclip />
                    </button>
                    {/* Emoji button placeholder */}
                    {/* <button type="button" className="emoji-button"> <BiSmile /> </button> */}
                    <TextareaAutosize
                        className="message-input"
                        placeholder="Nhập tin nhắn..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={messagesLoading || sendMessageLoading}
                        minRows={1}
                        maxRows={6}
                    />
                    <button type="submit" className="chatbox-send-button" disabled={sendMessageLoading || newMessage.trim() === ''}>
                        {sendMessageLoading ? <div className="typing-indicator"><span></span><span></span><span></span></div> : <FiSend />}
                    </button>
                </form>
                {sendMessageError && <p className="send-message-error">{sendMessageError}</p>}
                    </>
                )}
            </div>

            {/* Create Channel Modal */}
            {showCreateChannelModal && (
                <div className="modal-overlay">
                    <div className="modal-content create-channel-modal">
                        <div className="chat-modal-header">
                            <h3>Nhóm mới</h3>
                            <button className="chat-close-modal-btn" onClick={toggleCreateChannelModal}>
                                <BiX size={24} />
                            </button>
                        </div>
                        <div className="chat-modal-body">
                            {createChannelError && (
                                <div className="error-message">{createChannelError}</div>
                            )}
                            
                            <div className="chat-form-group">
                                <label htmlFor="groupName">Tên nhóm</label>
                                <input
                                    type="text"
                                    id="groupName"
                                    placeholder="Nhập tên nhóm"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                />
                            </div>
                            
                            <div className="chat-form-group">
                                <label htmlFor="searchUser">Tìm kiếm</label>
                                <div className="search-input-container">
                                    <input
                                        type="text"
                                        id="searchUser"
                                        placeholder="Tìm kiếm"
                                        value={searchUserQuery}
                                        onChange={(e) => setSearchUserQuery(e.target.value)}
                                    />
                                </div>
                                
                                {isSearching && <div className="loading-spinner"></div>}
                                
                                {searchResults.length > 0 && (
                                    <ul className="search-results">
                                        {searchResults.map(user => (
                                            <li 
                                                key={user.accountId} 
                                                className="chat-search-result-item"
                                                onClick={() => handleSelectUser(user)}
                                            >
                                                <div className="user-avatar">
                                                    {getSenderAvatar({id: user.accountId, name: user.accountFullname, avatarUrl: user.avatar})}
                                                </div>
                                                <div className='user-info'>
                                                    <span className="user-name">{user.accountFullname}</span>
                                                    <span className="user-email">{user.accountUsername}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            
                            {selectedUsers.length > 0 && (
                                <div className="selected-users">
                                    <label>Selected Users</label>
                                    <ul className="selected-users-list">
                                        {selectedUsers.map(user => (
                                            <li key={user.accountId} className="selected-user-item">
                                                <div className='d-flex align-center' style={{gap: '12px'}}>
                                                    <div className="user-avatar">
                                                        {getSenderAvatar({id: user.accountId, name: user.accountFullname, avatarUrl: user.avatar})}
                                                    </div>
                                                    <div className='user-info'>
                                                        <span className="user-name">{user.accountFullname}</span>
                                                        <span className="user-email">{user.accountUsername}</span>
                                                    </div>
                                                </div>
                                                <button 
                                                    className="remove-user-btn"
                                                    onClick={() => handleRemoveUser(user.accountId)}
                                                >
                                                    <BiX />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="chat-modal-footer">
                            <button className="chat-cancel-btn" onClick={toggleCreateChannelModal}>Hủy</button>
                            <button className="chat-create-btn" onClick={handleCreateChannel}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Direct Chat Modal */}
            {showDirectChatModal && (
                <div className="modal-overlay">
                    <div className="modal-content create-channel-modal">
                        <div className="chat-modal-header">
                            <h3>Tin nhắn mới</h3>
                            <button className="chat-close-modal-btn" onClick={toggleDirectChatModal}>
                                <BiX size={24} />
                            </button>
                        </div>
                        <div className="chat-modal-body">
                            {directChatError && (
                                <div className="error-message">{directChatError}</div>
                            )}
                            
                            <div className="chat-form-group">
                                <label htmlFor="searchUserDirect">Tìm kiếm người dùng</label>
                                <input
                                    type="text"
                                    id="searchUserDirect"
                                    placeholder="Tìm kiếm"
                                    value={searchUserQuery}
                                    onChange={(e) => setSearchUserQuery(e.target.value)}
                                />
                                
                                {isSearching && <div className="loading-spinner"></div>}
                                
                                {searchResults.length > 0 && (
                                    <ul className="search-results">
                                        {searchResults.map(user => (
                                            <li 
                                                key={user.accountId} 
                                                className="chat-search-result-item"
                                                onClick={() => handleSelectUser(user)}
                                            >
                                                <div className="user-avatar">
                                                    {getSenderAvatar({id: user.accountId, name: user.accountFullname, avatarUrl: user.avatar})}
                                                </div>
                                                <div className='user-info'>
                                                    <span className="user-name">{user.accountFullname}</span>
                                                    <span className="user-email">{user.accountUsername}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            
                            {selectedUsers.length > 0 && (
                                <div className="selected-users">
                                    <label>Selected User</label>
                                    <ul className="selected-users-list">
                                        {selectedUsers.map(user => (
                                            <li key={user.accountId} className="selected-user-item">
                                                <div className='d-flex align-center' style={{gap: '12px'}}>
                                                    <div className="user-avatar">
                                                        {getSenderAvatar({id: user.accountId, name: user.accountFullname, avatarUrl: user.avatar})}
                                                    </div>
                                                    <div className='user-info'>
                                                        <span className="user-name">{user.accountFullname}</span>
                                                        <span className="user-email">{user.accountUsername}</span>
                                                    </div>
                                                </div>
                                                <button 
                                                    className="remove-user-btn"
                                                    onClick={() => handleRemoveUser(user.accountId)}
                                                >
                                                    <BiX />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="chat-modal-footer">
                            <button className="chat-cancel-btn" onClick={toggleDirectChatModal}>Hủy</button>
                            <button className="chat-create-btn" onClick={handleCreateDirectChat}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hiển thị trạng thái kết nối WebSocket */}
            {connectionStatus && (
                <div className={`connection-status ${connectionStatus}`}>
                    <div className="connection-indicator"></div>
                    <span>
                        {connectionStatus === 'connected' ? 'Đã kết nối' : 
                         connectionStatus === 'connecting' ? 'Đang kết nối...' : 
                         'Mất kết nối'}
                    </span>
                </div>
            )}

            {/* Hiển thị thông báo bằng JSX */}
            {showNotification && (
                <div className="created-notification" style={{ opacity: showNotification ? '1' : '0' }}>
                    <div className="created-notification-content">
                        <div>{notification}</div>
                    </div>
                </div>
            )}

            {/* Modal Upload Avatar Nhóm */}
            {showAvatarUploadModal && (
                <div className="modal-overlay">
                    <div className="avatar-upload-modal">
                        <div className="avatar-upload-modal-header">
                            <h3>Thay đổi ảnh đại diện nhóm</h3>
                            <button className="chat-close-modal-btn" onClick={handleCloseAvatarUploadModal}>
                                <BiX size={24} />
                            </button>
                        </div>
                        <div className="avatar-upload-modal-body">
                            <div className="avatar-preview-container">
                                <div className="avatar-preview">
                                    {groupAvatarPreview ? (
                                        <img src={groupAvatarPreview} alt="Preview" />
                                    ) : (
                                        <HiOutlineUserGroup size={60} color="#999" />
                                    )}
                                </div>
                            </div>
                            <div className="avatar-input-container">
                                <input
                                    type="file"
                                    id="group-avatar-input"
                                    onChange={handleGroupAvatarChange}
                                    accept="image/jpeg,image/png,image/gif,image/jpg"
                                    style={{ display: 'none' }}
                                    ref={avatarInputRef}
                                />
                                <label htmlFor="group-avatar-input" className="avatar-input-label">
                                    <BiPlus size={18} style={{ marginRight: '8px' }} />
                                    Chọn ảnh
                                </label>
                                <button
                                    className="avatar-upload-btn"
                                    onClick={handleGroupAvatarUpload}
                                    disabled={!selectedGroupAvatar || uploadingGroupAvatar}
                                >
                                    {uploadingGroupAvatar ? 'Đang tải lên...' : 'Xác nhận'}
                                </button>
                                {uploadAvatarError && (
                                    <div className="avatar-upload-error">
                                        {uploadAvatarError}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Thêm thành viên */}
            {showAddMemberModal && (
                <div className="modal-overlay">
                    <div className="modal-content create-channel-modal">
                        <div className="chat-modal-header">
                            <h3>Thêm thành viên vào nhóm</h3>
                            <button className="chat-close-modal-btn" onClick={toggleAddMemberModal}>
                                <BiX size={24} />
                            </button>
                        </div>
                        <div className="chat-modal-body">
                            {addMemberError && (
                                <div className="error-message">{addMemberError}</div>
                            )}
                            
                            <div className="chat-form-group">
                                <label htmlFor="searchMember">Tìm kiếm người dùng</label>
                                <div className="search-input-container">
                                    <input
                                        type="text"
                                        id="searchMember"
                                        placeholder="Tìm kiếm người dùng để thêm vào nhóm"
                                        value={searchMemberQuery}
                                        onChange={(e) => setSearchMemberQuery(e.target.value)}
                                    />
                                </div>
                                
                                {isSearchingMembers && <div className="loading-spinner"></div>}
                                
                                {searchMemberResults.length > 0 && (
                                    <ul className="search-results">
                                        {searchMemberResults.map(user => (
                                            <li 
                                                key={user.accountId} 
                                                className="chat-search-result-item"
                                                onClick={() => handleSelectMember(user)}
                                            >
                                                <div className="user-avatar">
                                                    {getSenderAvatar({id: user.accountId, name: user.accountFullname, avatarUrl: user.avatar})}
                                                </div>
                                                <div className='user-info'>
                                                    <span className="user-name">{user.accountFullname}</span>
                                                    <span className="user-email">{user.accountUsername}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            
                            {selectedNewMembers.length > 0 && (
                                <div className="selected-users">
                                    <label>Người dùng đã chọn</label>
                                    <ul className="selected-users-list">
                                        {selectedNewMembers.map(user => (
                                            <li key={user.accountId} className="selected-user-item">
                                                <div className='d-flex align-center' style={{gap: '12px'}}>
                                                    <div className="user-avatar">
                                                        {getSenderAvatar({id: user.accountId, name: user.accountFullname, avatarUrl: user.avatar})}
                                                    </div>
                                                    <div className='user-info'>
                                                        <span className="user-name">{user.accountFullname}</span>
                                                        <span className="user-email">{user.accountUsername}</span>
                                                    </div>
                                                </div>
                                                <button 
                                                    className="remove-user-btn"
                                                    onClick={() => handleRemoveMember(user.accountId)}
                                                >
                                                    <BiX />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="chat-modal-footer">
                            <button className="chat-cancel-btn" onClick={toggleAddMemberModal}>Hủy</button>
                            <button 
                                className="chat-create-btn" 
                                onClick={handleAddMembersToGroup}
                                disabled={selectedNewMembers.length === 0}
                            >
                                Thêm thành viên
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal xác nhận xóa thành viên */}
            {showRemoveMemberModal && memberToRemove && (
                <div className="modal-overlay">
                    <div className="modal-content remove-member-modal">
                        <div className="chat-modal-header">
                            <h3>Xác nhận xóa thành viên</h3>
                            <button className="chat-close-modal-btn" onClick={closeRemoveMemberModal}>
                                <BiX size={24} />
                            </button>
                        </div>
                        <div className="chat-modal-body">
                            {removeMemberError && (
                                <div className="error-message">{removeMemberError}</div>
                            )}
                            
                            <p className="confirm-message">
                                Bạn có chắc chắn muốn xóa <strong>{memberToRemove.accountFullname || memberToRemove.accountUsername}</strong> khỏi nhóm?
                            </p>
                            
                            <div className="member-preview">
                                <div className="member-avatar">
                                    {getSenderAvatar(memberToRemove)}
                                </div>
                                <div className="member-info">
                                    <span className="member-name">{memberToRemove.accountFullname || memberToRemove.accountUsername}</span>
                                    <span className="member-email">{memberToRemove.accountUsername}</span>
                                </div>
                            </div>
                        </div>
                        <div className="chat-modal-footer">
                            <button className="chat-cancel-btn" onClick={closeRemoveMemberModal} disabled={removingMember}>Hủy</button>
                            <button 
                                className="chat-delete-btn" 
                                onClick={handleRemoveMemberFromGroup}
                                disabled={removingMember}
                            >
                                {removingMember ? 'Đang xóa...' : 'Xóa thành viên'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatboxPage;
