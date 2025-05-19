import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

// Token durations aligned with API specifications
const TOKEN_VALID_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export const AuthProvider = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const TOKEN_REFRESH_INTERVAL = 950 * 1000;

    // Kiểm tra xác thực từ localStorage khi component mount
    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);
            const storedToken = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('user');
            const storedIsLoggedIn = localStorage.getItem('isLoggedIn');

            if (storedToken && storedUser && storedIsLoggedIn === 'true') {
                try {
                    // Kiểm tra token có hợp lệ không bằng cách gọi API kiểm tra token
                    const response = await axios.post('http://localhost:8080/lms/auth/verify', {
                        token: storedToken
                    }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    // Nếu token hợp lệ
                    if (response.data && response.data.code === 0) {
                        setAuthToken(storedToken);
                        setUser(JSON.parse(storedUser));
                        setIsAuthenticated(true);
                        console.log('Auth restored from localStorage');
                    } else {
                        // Nếu token không hợp lệ, thử refresh
                        await refreshToken();
                    }
                } catch (error) {
                    console.error("Error verifying token:", error);
                    // Thử refresh token nếu verify thất bại
                    await refreshToken();
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    // Function to refresh token
    const refreshToken = async () => {
        try {
            const currentToken = localStorage.getItem('authToken');
            if (!currentToken) {
                // No token found, redirect to login
                setIsAuthenticated(false);
                setUser(null);
                return;
            }

            // Call the refresh token API
            const response = await axios.post('http://localhost:8080/lms/auth/refresh', {
                token: currentToken
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Update with new token if provided
            if (response.data && response.data.result && response.data.result.token) {
                const newToken = response.data.result.token;
                localStorage.setItem('authToken', newToken);
                setAuthToken(newToken);
                
                // Cũng cập nhật user nếu có trong response
                if (response.data.result.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.result.user));
                    setUser(response.data.result.user);
                } else {
                    // Nếu không có user trong response, lấy từ localStorage
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }
                }
                
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Lỗi khi refresh token:", error);
            // If refresh fails with 401, clear auth state
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('role');
                setAuthToken(null);
                setUser(null);
                setIsAuthenticated(false);
            }
            return false;
        }
    };

    useEffect(() => {
        // Skip token verification if we're already on the login page
        if (location.pathname === '/') {
            return;
        }

        // Check token existence
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/');
            return;
        }

        // Set up axios interceptor to catch 401 errors
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response && error.response.status === 401) {
                    // Only redirect if the error is not from the refresh token endpoint
                    if (!error.config.url.includes('/refresh')) {
                        // Try to refresh the token once
                        refreshToken().catch(() => {
                            // If refresh fails, redirect to login
                            localStorage.removeItem('authToken');
                            navigate('/');
                        });
                    }
                }
                return Promise.reject(error);
            }
        );

        // Set up interval for token refresh
        const tokenRefreshInterval = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL);

        // Clean up
        return () => {
            clearInterval(tokenRefreshInterval);
            axios.interceptors.response.eject(interceptor);
        };
    }, [navigate, location.pathname, TOKEN_REFRESH_INTERVAL]);

    // Logout function
    const handleLogout = async () => {
        try {
            // Get the token from localStorage
            const token = localStorage.getItem('authToken');
            
            if (token) {
                // Call the logout API with token in request body
                await axios.post('http://localhost:8080/lms/auth/logout', {
                    token: token
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
        } finally {
            // Always remove the token and redirect regardless of API success/failure
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('role');
            setAuthToken(null);
            setUser(null);
            setIsAuthenticated(false);
            navigate('/');
        }
    };

    // Login function
    const login = useCallback(async (email, password, role) => {
        try {
            const response = await axios.post('http://localhost:8080/lms/auth/token', 
                {
                    username: email,
                    password
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            console.log('Login response:', response.data);

            if (response.data) {
                switch (response.data.code) {
                    case 0: // Success
                        const { token } = response.data.result;
                        
                        // Kiểm tra role từ token trước khi hoàn tất đăng nhập
                        try {
                            // Kiểm tra token tồn tại
                            if (!token) {
                                throw new Error('Token không tồn tại');
                            }
                            
                            // Giải mã phần payload của JWT token
                            const tokenParts = token.split('.');
                            if (tokenParts.length !== 3) {
                                throw new Error('Token không hợp lệ');
                            }
                            
                            // Giải mã Base64 của phần payload
                            const payload = JSON.parse(atob(tokenParts[1]));
                            
                            // Kiểm tra role trong payload
                            if (!payload || !payload.scope) {
                                throw new Error('Token không chứa thông tin quyền truy cập');
                            }

                            const userRole = payload.scope;
                            
                            // Kiểm tra xem role có khớp với role đã chọn không
                            const isTeacherWithStudentRole = role === 'teacher' && userRole !== 'ROLE_TEACHER';
                            const isStudentWithTeacherRole = role === 'student' && userRole !== 'ROLE_STUDENT';
                            
                            if (isTeacherWithStudentRole || isStudentWithTeacherRole) {
                                // Role không khớp, trả về lỗi mà không thực hiện đăng nhập
                                return { 
                                    success: false, 
                                    error: `Tài khoản này không tồn tại hoặc không có quyền đăng nhập với vai trò ${role === 'teacher' ? 'giảng viên' : 'sinh viên'}`
                                };
                            }
                        } catch (error) {
                            console.error('Lỗi khi kiểm tra token:', error);
                            return { 
                                success: false, 
                                error: `Có lỗi xảy ra khi xác thực tài khoản: ${error.message}`
                            };
                        }
                        
                        // Nếu kiểm tra role thành công, tiếp tục quá trình đăng nhập
                        const userData = { ...response.data.result, role };
                        const expiryTime = Date.now() + TOKEN_VALID_DURATION;
                        
                        console.log('Login successful, token:', token.substring(0, 15) + '...');
                        console.log('Token will expire at:', new Date(expiryTime).toLocaleString());

                        // Update localStorage first
                        localStorage.setItem('authToken', token);
                        localStorage.setItem('user', JSON.stringify(userData));
                        localStorage.setItem('isLoggedIn', 'true');
                        localStorage.setItem('role', role);
                        
                        // Then update state
                        setAuthToken(token);
                        setUser(userData);
                        setIsAuthenticated(true);

                        // Navigate to appropriate page based on role
                        if (role === 'teacher') {
                            navigate('/teacher/dashboard');
                        } else {
                            navigate('/courses');
                        }
                        return { success: true };

                    case 1: // Account not found
                        return { success: false, error: 'Tài khoản không tồn tại' };
                    
                    case 2: // Wrong password
                        return { success: false, error: 'Mật khẩu không chính xác' };
                    
                    case 3: // Account locked
                        return { success: false, error: 'Tài khoản đã bị khóa' };
                    
                    default:
                        return { success: false, error: 'Đã xảy ra lỗi không xác định' };
                }
            }
            return { success: false, error: 'Phản hồi không hợp lệ từ máy chủ' };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Đã xảy ra lỗi kết nối'
            };
        }
    }, [navigate]);

    // Nếu đang loading, hiển thị trạng thái loading hoặc null
    if (isLoading) {
        return (
            <AuthContext.Provider value={{ isLoading }}>
                {/* Có thể render một loading spinner ở đây */}
                {children}
            </AuthContext.Provider>
        );
    }

    return (
        <AuthContext.Provider value={{ 
            user, 
            authToken, 
            isAuthenticated,
            isLoading,
            login,
            logout: handleLogout,
            refreshToken
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);