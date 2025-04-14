import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/header.css';
import logohusc from '../assets/imgs/Logo-ko-nen.png';
import logo from '../assets/imgs/logo.png';
import axios from 'axios';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';

function Header() {
    const navigate = useNavigate();
    const { login, logout, isAuthenticated } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);
    const [error, setError] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);
    const [loading, setLoading] = useState(false);

    // Registration form states
    const [regEmail, setRegEmail] = useState('');
    const [regUsername, setRegUsername] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [isRegFormValid, setIsRegFormValid] = useState(false);

    // Validate login form
    useEffect(() => {
        setIsFormValid(email.trim() !== '' && password.trim() !== '');
    }, [email, password]);

    // Validate registration form
    useEffect(() => {
        setIsRegFormValid(
            regEmail.trim() !== '' && 
            regUsername.trim() !== '' && 
            regPassword.trim() !== ''
        );
    }, [regEmail, regUsername, regPassword]);

    const resetForm = useCallback(() => {
        setEmail('');
        setPassword('');
        setRegEmail('');
        setRegUsername('');
        setRegPassword('');
        setError('');
        setSelectedRole(null);
    }, []);

    const closeAllModals = useCallback(() => {
        setShowLoginModal(false);
        setShowRegisterModal(false);
        resetForm();
    }, [resetForm]);

    const openLoginModal = useCallback(() => {
        setShowRegisterModal(false);
        setShowLoginModal(true);
        resetForm();
    }, [resetForm]);

    const openRegisterModal = useCallback(() => {
        setShowLoginModal(false);
        setShowRegisterModal(true);
        resetForm();
    }, [resetForm]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password, selectedRole);
            if (result.success) {
                setShowLoginModal(false);
                // Reset form
                setEmail('');
                setPassword('');
                setSelectedRole('student');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLoginWithHusc = (e) => {
        e.preventDefault();
        if (!selectedRole) {
            setError('Vui lòng chọn vai trò đăng nhập');
            return;
        }
        closeAllModals();
        navigate('/courses');
    };

    const handleRegister = (e) => {
        e.preventDefault();
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        openLoginModal();
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            <header className="header">
                <div className="logo"><img src={logo} alt="Logo"/></div>
                <nav className="nav">
                    <a href="#courses">Khóa học</a>
                    <a href="#about">Giới thiệu</a>
                    <a href="#contact">Liên hệ</a>
                </nav>
                {isAuthenticated ? (
                    <button className="login-btn" onClick={handleLogoutClick}>Đăng xuất</button>
                ) : (
                    <button className="login-btn" onClick={openLoginModal}>Đăng nhập</button>
                )}
            </header>
            
            {/* Login Modal */}
            {showLoginModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <button className="back-btn" onClick={closeAllModals}>Quay lại</button>
                            <button className="close-btn" onClick={closeAllModals}>×</button>
                        </div>

                        {!selectedRole ? (
                            // Bước chọn role
                            <div className="modal-content">
                                <div className="logo-container">
                                    <img src={logohusc} className="login-logo" alt="Logo HUSC" />
                                </div>
                                <h2 className="modal-title">Đăng nhập với tư cách</h2>
                                <div className="role-selection-buttons">
                                    <button className="role-btn student" onClick={() => setSelectedRole('student')}>
                                        Sinh viên
                                    </button>
                                    <button className="role-btn teacher" onClick={() => setSelectedRole('teacher')}>
                                        Giảng viên
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Form login sau khi chọn role
                            <div className="modal-content">
                                <div className="logo-container">
                                    <img src={logohusc} className="login-logo" alt="Logo HUSC" />
                                </div>
                                <h2 className="modal-title">
                                    Dành Cho {selectedRole === 'student' ? 'Sinh Viên' : 'Giảng Viên'}
                                </h2>

                                <form className="login-form" onSubmit={handleLogin}>
                                    {error && (
                                        <div className="alert alert-danger" role="alert">
                                            {error}
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <input
                                            type="email"
                                            className="form-group-login"
                                            placeholder="Địa chỉ Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="password"
                                            className="form-group-login"
                                            placeholder="Mật khẩu"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="form-checkbox">
                                        <input type="checkbox" id="remember" disabled={loading} />
                                        <label htmlFor="remember">Ghi nhớ đăng nhập</label>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className={`login-submit-btn ${isFormValid ? 'active' : 'disabled'}`}
                                        disabled={loading || !isFormValid}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Đang đăng nhập...
                                            </>
                                        ) : (
                                            'Đăng nhập'
                                        )}
                                    </button>

                                    <p>Hoặc</p>

                                    <button
                                        type="button"
                                        className="login-submit-btn d-flex justify-center align-center"
                                        onClick={handleLoginWithHusc}
                                        disabled={loading}
                                    >
                                        <FcGoogle size={24} style={{ marginRight: '8px' }} />
                                        Đăng nhập với Email HUSC
                                    </button>

                                    <div className="form-footer">
                                        <p>Bạn chưa có tài khoản? <a href="#" className="register-link" onClick={(e) => { e.preventDefault(); openRegisterModal(); }}>Đăng ký</a></p>
                                    </div>

                                    <div className="terms">
                                        <p>Việc bạn tiếp tục sử dụng trang web này đồng nghĩa bạn đồng ý với <a href="#terms">điều khoản sử dụng</a> của chúng tôi.</p>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <button className="back-btn" onClick={openLoginModal}>Quay lại</button>
                            <button className="close-btn" onClick={closeAllModals}>×</button>
                        </div>
                        
                        <div className="modal-content">
                            <div className="logo-container">
                                <img src={logohusc} className='login-logo' alt="Logo"/>
                            </div>
                            
                            <h2 className="modal-title">Đăng Ký Tài Khoản</h2>
                            
                            <form className="login-form" onSubmit={handleRegister}>
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        className='form-group-login'
                                        placeholder="Họ và tên của bạn" 
                                        value={regUsername}
                                        onChange={(e) => setRegUsername(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <input 
                                        type="email" 
                                        className='form-group-login'
                                        placeholder="Địa chỉ Email" 
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <input 
                                        type="password" 
                                        className='form-group-login'
                                        placeholder="Mật khẩu" 
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                
                                <button 
                                    type="submit"
                                    className={`login-submit-btn ${isRegFormValid ? 'active' : 'disabled'}`}
                                    disabled={!isRegFormValid}
                                >
                                    Đăng ký
                                </button>

                                <p>Hoặc</p>

                                <button 
                                    className="login-submit-btn d-flex justify-center align-center"
                                    onClick={handleLoginWithHusc}
                                >
                                    <FcGoogle size={24} style={{marginRight: '8px'}}/>
                                    Đăng ký với Email HUSC
                                </button>
                                
                                <div className="form-footer">
                                    <p>Bạn đã có tài khoản? <a href="#" className="register-link" onClick={(e) => {e.preventDefault(); openLoginModal();}}>Đăng nhập</a></p>
                                </div>
                                
                                <div className="terms">
                                    <p>Việc bạn tiếp tục sử dụng trang web này đồng nghĩa bạn đồng ý với <a href="#terms">điều khoản sử dụng</a> của chúng tôi.</p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Header;