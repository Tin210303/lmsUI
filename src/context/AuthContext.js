import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

// Token durations aligned with API specifications
const TOKEN_VALID_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const TOKEN_REFRESH_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const REFRESH_MARGIN = 60 * 1000; // Refresh 60 seconds before expiration

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [tokenExpiry, setTokenExpiry] = useState(null);
    const [refreshTimer, setRefreshTimer] = useState(null);

    // Function to refresh token
    const refreshToken = useCallback(async () => {
        try {
            const currentToken = localStorage.getItem('authToken');
            if (!currentToken) {
                handleLogout();
                return false;
            }

            const response = await axios.post('http://localhost:8080/lms/auth/refresh', 
                { token: currentToken },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.data && response.data.code === 0) {
                const { token } = response.data.result;
                const newExpiryTime = Date.now() + TOKEN_VALID_DURATION;
                
                // Update localStorage first
                localStorage.setItem('authToken', token);
                localStorage.setItem('tokenExpiry', newExpiryTime.toString());

                // Then update state
                setAuthToken(token);
                setTokenExpiry(newExpiryTime);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error refreshing token:', error);
            handleLogout();
            return false;
        }
    }, []);

    // Logout function
    const handleLogout = useCallback(() => {
        // Clear localStorage first
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('role');

        // Clear timer if exists
        if (refreshTimer) {
            clearTimeout(refreshTimer);
        }

        // Reset all state
        setRefreshTimer(null);
        setAuthToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setTokenExpiry(null);
    }, [refreshTimer]);

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
                        const authenticated = response.data.result.authenticated;
                        const userData = { ...response.data.result, role }; // Add role to user data
                        const expiryTime = Date.now() + TOKEN_VALID_DURATION;
                        
                        console.log('Login successful, token:', token.substring(0, 15) + '...');
                        console.log('Token will expire at:', new Date(expiryTime).toLocaleString());

                        // Update localStorage first
                        localStorage.setItem('authToken', token);
                        localStorage.setItem('user', JSON.stringify(userData));
                        localStorage.setItem('tokenExpiry', expiryTime.toString());
                        localStorage.setItem('isLoggedIn', 'true');
                        localStorage.setItem('role', role);

                        // Then update state
                        setAuthToken(token);
                        setUser(userData);
                        setTokenExpiry(expiryTime);
                        setIsAuthenticated(true);

                        // Schedule token refresh
                        const timeUntilRefresh = TOKEN_VALID_DURATION - REFRESH_MARGIN;
                        const timer = setTimeout(refreshToken, timeUntilRefresh);
                        setRefreshTimer(timer);

                        // Navigate to appropriate page based on role
                        if (role === 'teacher') {
                            navigate('/teacher/dashboard');
                        } else {
                            navigate('/courses');
                        }
                        return { success: true };

                    case 1: // Account not found
                        return { success: false, error: 'Account not found' };
                    
                    case 2: // Wrong password
                        return { success: false, error: 'Incorrect password' };
                    
                    case 3: // Account locked
                        return { success: false, error: 'Account is locked' };
                    
                    default:
                        return { success: false, error: 'Unknown error occurred' };
                }
            }
            return { success: false, error: 'Invalid response from server' };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Network error occurred'
            };
        }
    }, [refreshToken, navigate]);

    // Initialize auth state
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const storedUser = localStorage.getItem('user');
                const storedExpiry = localStorage.getItem('tokenExpiry');

                if (!token || !storedUser || !storedExpiry) {
                    handleLogout();
                    return;
                }

                const expiryTime = parseInt(storedExpiry, 10);
                const now = Date.now();

                if (now >= expiryTime - REFRESH_MARGIN) {
                    // Token is expired or close to expiring, try to refresh
                    const refreshed = await refreshToken();
                    if (!refreshed) {
                        handleLogout();
                        return;
                    }
                }

                // Set the authentication state
                setAuthToken(token);
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
                setTokenExpiry(expiryTime);

                // Schedule next refresh
                const timeUntilRefresh = expiryTime - now - REFRESH_MARGIN;
                if (timeUntilRefresh > 0) {
                    const timer = setTimeout(refreshToken, timeUntilRefresh);
                    setRefreshTimer(timer);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                handleLogout();
            }
        };

        initializeAuth();

        return () => {
            if (refreshTimer) {
                clearTimeout(refreshTimer);
            }
        };
    }, []); // Run only once on mount

    return (
        <AuthContext.Provider value={{ 
            user, 
            authToken, 
            isAuthenticated,
            login,
            logout: handleLogout,
            refreshToken
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
