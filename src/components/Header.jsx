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
    const [regPassword, setRegPassword] = useState('');
    const [regFullName, setRegFullName] = useState('');
    const [isRegFormValid, setIsRegFormValid] = useState(false);
    
    // Registration steps management
    const [registrationStep, setRegistrationStep] = useState(1);
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [selectedMajor, setSelectedMajor] = useState('');
    const [majors, setMajors] = useState([]);
    const [loadingMajors, setLoadingMajors] = useState(false);
    const [registrationRole, setRegistrationRole] = useState('student'); // 'student' hoặc 'teacher'

    // Lấy danh sách chuyên ngành từ API
    useEffect(() => {
        const fetchMajors = async () => {
            try {
                setLoadingMajors(true);
                const response = await axios.get('http://localhost:8080/lms/major');
                
                if (response.data && response.data.code === 0) {
                    console.log('Danh sách chuyên ngành:', response.data.result);
                    setMajors(response.data.result);
                } else {
                    console.error('Lỗi khi lấy danh sách chuyên ngành:', response.data);
                    setError('Không thể lấy danh sách chuyên ngành. Vui lòng thử lại sau.');
                }
            } catch (err) {
                console.error('Lỗi khi gọi API chuyên ngành:', err);
                setError('Đã xảy ra lỗi khi lấy danh sách chuyên ngành.');
            } finally {
                setLoadingMajors(false);
            }
        };

        fetchMajors();
    }, []);

    // Validate login form
    useEffect(() => {
        setIsFormValid(email.trim() !== '' && password.trim() !== '');
    }, [email, password]);

    // Validate registration form based on current step
    useEffect(() => {
        if (registrationStep === 1) {
            // Kiểm tra email có đuôi @husc.edu.vn
            setIsRegFormValid(regEmail.trim() !== '' && regEmail.includes('@husc.edu.vn'));
        } else if (registrationStep === 2) {
            // Kiểm tra mã xác nhận có đủ 6 số
            const isCodeComplete = verificationCode.every(digit => digit !== '');
            setIsRegFormValid(isCodeComplete);
        } else if (registrationStep === 3) {
            // Kiểm tra họ tên, mật khẩu và chuyên ngành (nếu là sinh viên)
            if (registrationRole === 'student') {
                setIsRegFormValid(
                    regFullName.trim() !== '' && 
                    regPassword.trim() !== '' &&
                    selectedMajor !== ''
                );
            } else {
                // Giảng viên không cần chọn chuyên ngành
                setIsRegFormValid(
                    regFullName.trim() !== '' && 
                    regPassword.trim() !== ''
                );
            }
        }
    }, [regEmail, regPassword, regFullName, registrationStep, verificationCode, selectedMajor, registrationRole]);

    const resetForm = useCallback(() => {
        setEmail('');
        setPassword('');
        setRegEmail('');
        setRegPassword('');
        setRegFullName('');
        setError('');
        setSelectedRole(null);
        setRegistrationStep(1);
        setVerificationCode(['', '', '', '', '', '']);
        setSelectedMajor('');
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

    const switchToRegister = useCallback(() => {
        setShowLoginModal(false);
        setShowRegisterModal(true);
        setEmail('');
        setPassword('');
        setError('');
        setRegistrationStep(1);
        setRegistrationRole(selectedRole || 'student'); // Lấy vai trò từ màn hình đăng nhập
    }, [selectedRole]);

    const switchToLogin = useCallback(() => {
        setShowRegisterModal(false);
        setShowLoginModal(true);
        setRegEmail('');
        setRegPassword('');
        setError('');
    }, []);

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

    // Xử lý gửi mã xác nhận đến email
    const handleSendVerificationCode = async (e) => {
        e.preventDefault();
        if (!regEmail || !regEmail.includes('@husc.edu.vn')) {
            setError('Vui lòng nhập email hợp lệ với đuôi @husc.edu.vn');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('email', regEmail);

            const response = await axios.post('http://localhost:8080/lms/email/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.code === 200) {
                setRegistrationStep(2);
                setError('');
            } else {
                setError(response.data?.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại.');
            }
        } catch (err) {
            console.error('Error sending verification code:', err);
            if (err && err.response.data.code === 1024) {
                setError('Email đã tồn tại');
            }
        } finally {
            setLoading(false);
        }
    };

    // Xử lý xác minh mã
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const code = verificationCode.join('');
            const formData = new FormData();
            formData.append('email', regEmail);
            formData.append('code', code);

            const response = await axios.post('http://localhost:8080/lms/email/verifycode', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.code === 0) {
                setRegistrationStep(3);
                setError('');
            } else {
                setError(response.data?.message || 'Mã xác nhận không đúng. Vui lòng thử lại.');
            }
        } catch (err) {
            console.error('Error verifying code:', err);
            setError('Đã xảy ra lỗi khi xác minh mã. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Hoàn tất đăng ký
    const handleCompleteRegistration = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const registerData = {
                email: regEmail,
                password: regPassword,
                fullName: regFullName,
                ...(registrationRole === 'student' ? { majorId: selectedMajor } : {})
            };

            const apiUrl = registrationRole === 'student'
                ? 'http://localhost:8080/lms/student/create'
                : 'http://localhost:8080/lms/teacher/create';

            const response = await axios.post(apiUrl, registerData);

            if (response.data && response.data.code === 0) {
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                openLoginModal();
            } else {
                setError(response.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            }
        } catch (err) {
            console.error('Error registering:', err);
            if (err && err.response.data.code === 1001) {
                setError('Tài khoản đã tồn tại.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Xử lý nhập mã xác nhận
    const handleVerificationCodeChange = (index, value) => {
        if (value.length > 1) {
            value = value.charAt(value.length - 1);
        }
        
        if (!/^\d*$/.test(value) && value !== '') {
            return;
        }

        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Auto-focus next input
        if (value !== '' && index < 5) {
            const nextInput = document.getElementById(`verification-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/');
    };

    // Render form based on current registration step
    const renderRegistrationForm = () => {
        switch (registrationStep) {
            case 1:
                return (
                    <form className="login-form" onSubmit={handleSendVerificationCode}>
                        <h2 className="modal-title">Đăng Ký Tài Khoản {registrationRole === 'student' ? 'Sinh Viên' : 'Giảng Viên'}</h2>
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}
                        <div className="role-selection-buttons mb-16">
                            <button
                                type="button"
                                className={`role-btn ${registrationRole === 'student' ? 'active' : ''}`}
                                onClick={() => setRegistrationRole('student')}
                            >
                                Sinh viên
                            </button>
                            <button
                                type="button"
                                className={`role-btn ${registrationRole === 'teacher' ? 'active' : ''}`}
                                onClick={() => setRegistrationRole('teacher')}
                            >
                                Giảng viên
                            </button>
                        </div>
                        <div className="form-group">
                            <input
                                type="email"
                                className="form-group-login"
                                placeholder="Vui lòng nhập Email có đuôi husc.edu.vn"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            className={`login-submit-btn ${isRegFormValid ? 'active' : 'disabled'}`}
                            disabled={!isRegFormValid || loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Xác nhận'}
                        </button>
                        
                        <div className="form-footer">
                            <p>Bạn đã có tài khoản? <a href="#" className="register-link" onClick={(e) => { 
                                e.preventDefault(); 
                                switchToLogin();
                            }}>Đăng nhập</a></p>
                        </div>
                    </form>
                );
            case 2:
                return (
                    <form className="login-form" onSubmit={handleVerifyCode}>
                        <h2 className="modal-title">Nhập mã xác nhận</h2>
                        <p className="verification-info">
                            Mã xác nhận đã được gửi đến Email của bạn
                            <br />
                            <small>(nếu không thấy mã xác nhận, vui lòng kiểm tra trong thư mục thư rác)</small>
                        </p>
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}
                        <div className="verification-code-container">
                            {verificationCode.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`verification-${index}`}
                                    type="text"
                                    className="verification-code-input"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                                    disabled={loading}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>
                        <button
                            type="submit"
                            className={`login-submit-btn ${isRegFormValid ? 'active' : 'disabled'}`}
                            disabled={!isRegFormValid || loading}
                        >
                            {loading ? 'Đang xác minh...' : 'Xác nhận'}
                        </button>
                    </form>
                );
            case 3:
                return (
                    <form className="login-form" onSubmit={handleCompleteRegistration}>
                        <h2 className="modal-title">Hoàn tất đăng ký {registrationRole === 'student' ? 'Sinh Viên' : 'Giảng Viên'}</h2>
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-group-login"
                                placeholder="Họ và tên"
                                value={regFullName}
                                onChange={(e) => setRegFullName(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                className="form-group-login"
                                placeholder="Mật khẩu"
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        {registrationRole === 'student' && (
                            <div className="form-group">
                                {loadingMajors ? (
                                    <div className="select-loading">Đang tải danh sách chuyên ngành...</div>
                                ) : (
                                    <select
                                        className="form-group-login"
                                        value={selectedMajor}
                                        onChange={(e) => setSelectedMajor(e.target.value)}
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Chọn chuyên ngành</option>
                                        {majors.map(major => (
                                            <option key={major.id} value={major.id}>
                                                {major.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}
                        <button
                            type="submit"
                            className={`login-submit-btn ${isRegFormValid ? 'active' : 'disabled'}`}
                            disabled={!isRegFormValid || loading || (registrationRole === 'student' && loadingMajors)}
                        >
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>
                    </form>
                );
            default:
                return null;
        }
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
                                                <span className="spinner-header-border spinner-header-border-sm me-2" role="status" aria-hidden="true"></span>
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
                                        <p>Bạn chưa có tài khoản? <a href="#" className="register-link" onClick={(e) => { 
                                            e.preventDefault(); 
                                            switchToRegister();
                                        }}>Đăng ký {selectedRole === 'student' ? 'Sinh viên' : 'Giảng viên'}</a></p>
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
                            
                            {renderRegistrationForm()}
                            
                            <div className="terms">
                                <p>Việc bạn tiếp tục sử dụng trang web này đồng nghĩa bạn đồng ý với <a href="#terms">điều khoản sử dụng</a> của chúng tôi.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Header;