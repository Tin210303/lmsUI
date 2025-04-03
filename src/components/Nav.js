import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/css/nav.css';
import HomeIcon from '@mui/icons-material/Home';

function Nav() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    const TOKEN_REFRESH_INTERVAL = 300000; // Refresh token every 15 seconds (before 20s expiration)
    
    // // Function to refresh token
    // const refreshToken = async () => {
    //     try {
    //         const currentToken = localStorage.getItem('authToken');
    //         if (!currentToken) {
    //             // No token found, redirect to login
    //             navigate('/');
    //             return;
    //         }

    //         // Call the refresh token API
    //         const response = await axios.post('http://localhost:8080/lms/auth/refresh', {
    //             token: currentToken
    //         }, {
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             }
    //         });

    //         // Update with new token if provided
    //         if (response.data && response.data.result && response.data.result.token) {
    //             localStorage.setItem('authToken', response.data.result.token);
    //         }
    //     } catch (error) {
    //         console.error("Lỗi khi refresh token:", error);
    //         // If refresh fails with 401, redirect to login
    //         if (error.response && error.response.status === 401) {
    //             localStorage.removeItem('authToken');
    //             navigate('/');
    //         }
    //     }
    // };

    // useEffect(() => {
    //     // Skip token verification if we're already on the login page
    //     if (location.pathname === '/') {
    //         return;
    //     }

    //     // Check token existence
    //     const token = localStorage.getItem('authToken');
    //     if (!token) {
    //         navigate('/');
    //         return;
    //     }

    //     // Set up axios interceptor to catch 401 errors
    //     const interceptor = axios.interceptors.response.use(
    //         response => response,
    //         error => {
    //             if (error.response && error.response.status === 401) {
    //                 // Only redirect if the error is not from the refresh token endpoint
    //                 if (!error.config.url.includes('/refresh')) {
    //                     // Try to refresh the token once
    //                     refreshToken().catch(() => {
    //                         // If refresh fails, redirect to login
    //                         localStorage.removeItem('authToken');
    //                         navigate('/');
    //                     });
    //                 }
    //             }
    //             return Promise.reject(error);
    //         }
    //     );

    //     // Set up interval for token refresh
    //     const tokenRefreshInterval = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL);

    //     // Clean up
    //     return () => {
    //         clearInterval(tokenRefreshInterval);
    //         axios.interceptors.response.eject(interceptor);
    //     };
    // }, [navigate, location.pathname, TOKEN_REFRESH_INTERVAL]);

    
    const navItems = [
        {
            icon: "fa-house-chimney",
            text: "Trang Chủ",
            path: "/homepage"
        },
        {
            icon: "fa-laptop-code",
            text: "Lớp Học",
            path: "/homepage/courses"
        },
        {
            icon: "fa-newspaper",
            text: "Học Tập",
            path: "/homepage/results"
        },
        {
            icon: "fa-calendar-days",
            text: "Lịch Học",
            path: "/homepage/calendars"
        },
        {
            icon: "fa-comments",
            text: "Diễn Đàn",
            path: "/homepage/forums"
        },
        {
            icon: "fa-gear",
            text: "Cài Đặt",
            path: "/homepage/settings"
        }
    ];
   
    useEffect(() => {
        // Monitor current path for navigation styling
        if (location.pathname.includes('/settings')) {
            setActiveIndex(5);
        } else if (location.pathname === '/homepage') {
            setActiveIndex(0);
        } else if (location.pathname.includes('/courses')) {
            setActiveIndex(1);
        } else if (location.pathname.includes('/results')) {
            setActiveIndex(2);
        } else if (location.pathname.includes('/calendars')) {
            setActiveIndex(3);
        } else if (location.pathname.includes('/forums')) {
            setActiveIndex(4);
        }
    }, [location.pathname]);

    

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
            navigate('/');
        }
    };

    return (
        <nav>
            {navItems.map((item, index) => (
                <Link
                    key={index}
                    to={item.path}
                    className="nav-item d-flex justify-content-center align-items-center"
                    onClick={() => setActiveIndex(index)}
                >
                    <div
                        className={`nav-active d-flex align-items-center ${activeIndex === index ? "active" : ""}`}
                    >
                        <i className={`fa-solid ${item.icon}`}></i>
                        <p>{item.text}</p>
                    </div>
                </Link>
            ))}
            {/* Add logout button separately to handle the logout function */}
            <div 
                className="nav-item d-flex justify-content-center align-items-center"
                onClick={handleLogout}
                style={{ cursor: 'pointer' }}
            >
                <div className="nav-active d-flex align-items-center">
                    <i className="fa-solid fa-right-from-bracket"></i>
                    <p>Đăng Xuất</p>
                </div>
            </div>
        </nav>
    );
}

export default Nav;