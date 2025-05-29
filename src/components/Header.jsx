import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/header.css';
import logohusc from '../assets/imgs/Logo-ko-nen.png';
import logo from '../assets/imgs/LMS-logo.jpg';
import axios from 'axios';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { FORGOT_PASSWORD_API, GET_MAJOR_API, SEND_EMAIL_API, VERIFY_EMAIL_API, CREATE_TEACHER_ACCOUNT, CREATE_STUDENT_ACCOUNT } from '../services/apiService';
import { Eye, EyeOff } from 'lucide-react';

function Header() {
    const navigate = useNavigate();
    const { login, logout, isAuthenticated } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('STUDENT');
    const [error, setError] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);
    const [loading, setLoading] = useState(false);

    // State cho chức năng quên mật khẩu
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
    const [forgotPasswordError, setForgotPasswordError] = useState('');
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
    const [isForgotPasswordFormValid, setIsForgotPasswordFormValid] = useState(false);

    // Registration form states
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regFullName, setRegFullName] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    const [isRegFormValid, setIsRegFormValid] = useState(false);
    
    // Registration steps management
    const [registrationStep, setRegistrationStep] = useState(1);
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [selectedMajor, setSelectedMajor] = useState('');
    const [majors, setMajors] = useState([]);
    const [loadingMajors, setLoadingMajors] = useState(false);
    const [registrationRole, setRegistrationRole] = useState('STUDENT'); // 'STUDENT' hoặc 'TEACHER'

    // Thêm state cho chức năng hiển thị/ẩn mật khẩu
    const [showPassword, setShowPassword] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validate forgot password form
    useEffect(() => {
        setIsForgotPasswordFormValid(forgotPasswordEmail.trim() !== '' && 
                                     forgotPasswordEmail.includes('@'));
    }, [forgotPasswordEmail]);

    // Lấy danh sách chuyên ngành từ API
    useEffect(() => {
        const fetchMajors = async () => {
            try {
                setLoadingMajors(true);
                const response = await axios.get(GET_MAJOR_API);
                
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
            // Kiểm tra họ tên, mật khẩu, xác nhận mật khẩu, và chuyên ngành (nếu là sinh viên)
            if (registrationRole === 'STUDENT') {
                setIsRegFormValid(
                    regFullName.trim() !== '' && 
                    regPassword.trim() !== '' &&
                    regConfirmPassword.trim() !== '' &&
                    regPassword === regConfirmPassword &&
                    selectedMajor !== ''
                );
            } else {
                // Giảng viên không cần chọn chuyên ngành
                setIsRegFormValid(
                    regFullName.trim() !== '' && 
                    regPassword.trim() !== '' &&
                    regConfirmPassword.trim() !== '' &&
                    regPassword === regConfirmPassword
                );
            }
        }
    }, [regEmail, regPassword, regConfirmPassword, regFullName, registrationStep, verificationCode, selectedMajor, registrationRole]);

    const resetForm = useCallback(() => {
        setEmail('');
        setPassword('');
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');
        setRegFullName('');
        setError('');
        setSelectedRole('STUDENT');
        setRegistrationStep(1);
        setVerificationCode(['', '', '', '', '', '']);
        setSelectedMajor('');
        setForgotPasswordEmail('');
        setForgotPasswordError('');
        setForgotPasswordSuccess('');
        setShowPassword(false);
        setShowRegPassword(false);
        setShowConfirmPassword(false);
    }, []);

    const closeAllModals = useCallback(() => {
        setShowLoginModal(false);
        setShowRegisterModal(false);
        setShowForgotPasswordModal(false);
        resetForm();
    }, [resetForm]);

    const openLoginModal = useCallback((role = 'STUDENT') => {
        setShowRegisterModal(false);
        setShowForgotPasswordModal(false);
        setShowLoginModal(true);
        setSelectedRole(role);
        resetForm();
    }, [resetForm]);

    const openForgotPasswordModal = useCallback(() => {
        setShowLoginModal(false);
        setShowRegisterModal(false);
        setShowForgotPasswordModal(true);
        resetForm();
        // Pre-fill với email đã nhập trong form đăng nhập nếu có
        if (email) setForgotPasswordEmail(email);
    }, [resetForm, email]);

    // Chuyển đổi vai trò đăng nhập
    const toggleLoginRole = useCallback(() => {
        setSelectedRole(prevRole => prevRole === 'STUDENT' ? 'TEACHER' : 'STUDENT');
    }, []);

    const switchToRegister = useCallback(() => {
        setShowLoginModal(false);
        setShowForgotPasswordModal(false);
        setShowRegisterModal(true);
        setEmail('');
        setPassword('');
        setError('');
        setRegistrationStep(1);
        setRegistrationRole(selectedRole); // Lấy vai trò từ màn hình đăng nhập
    }, [selectedRole]);

    const switchToLogin = useCallback(() => {
        setShowRegisterModal(false);
        setShowForgotPasswordModal(false);
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
            // Gọi API đăng nhập và kiểm tra role
            const result = await login(email, password, selectedRole);
            
            if (result.success) {
                // Đăng nhập thành công và role đã được kiểm tra đúng
                closeAllModals(); // Đóng modal đăng nhập và reset form
            } else {
                // Hiển thị lỗi từ API hoặc lỗi kiểm tra role
                setError('Sai thông tin đăng nhập.');
            }
        } catch (err) {
            console.error('Lỗi đăng nhập:', err);
            setError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý quên mật khẩu
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
            setForgotPasswordError('Vui lòng nhập email hợp lệ');
            return;
        }

        setForgotPasswordLoading(true);
        setForgotPasswordError('');
        setForgotPasswordSuccess('');

        try {
            const formData = new FormData();
            formData.append('email', forgotPasswordEmail);

            const response = await axios.post( FORGOT_PASSWORD_API, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.code === 200) {
                setForgotPasswordSuccess('Mật khẩu mới đã được gửi vào email');
                
                // Chuyển về màn hình đăng nhập sau 2 giây
                setTimeout(() => {
                    setEmail(forgotPasswordEmail); // Pre-fill email
                    setShowForgotPasswordModal(false);
                    setShowLoginModal(true);
                    setForgotPasswordEmail('');
                    setForgotPasswordSuccess('');
                }, 2000);
            } else {
                setForgotPasswordError(response.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.');
            }
        } catch (err) {
            console.error('Error requesting password reset:', err);
            if (err.response && err.response.data) {
                setForgotPasswordError(err.response.data.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
            } else {
                setForgotPasswordError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
            }
        } finally {
            setForgotPasswordLoading(false);
        }
    };

    const handleLoginWithHusc = (e) => {
        e.preventDefault();
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

            const response = await axios.post(SEND_EMAIL_API, formData, {
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

            const response = await axios.post(VERIFY_EMAIL_API, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.result === true && response.data.code === 0) {
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

        // Kiểm tra lại mật khẩu khớp nhau trước khi đăng ký
        if (regPassword !== regConfirmPassword) {
            setError('Mật khẩu xác nhận không khớp với mật khẩu đã nhập');
            setLoading(false);
            return;
        }

        try {
            const registerData = {
                email: regEmail,
                password: regPassword,
                fullName: regFullName,
                ...(registrationRole === 'STUDENT' ? { majorId: selectedMajor } : {})
            };

            const apiUrl = registrationRole === 'STUDENT'
                ? CREATE_STUDENT_ACCOUNT
                : CREATE_TEACHER_ACCOUNT;

            const response = await axios.post(apiUrl, registerData);

            if (response.data && response.data.code === 0) {
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                openLoginModal();
            } else {
                setError(response.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            }
        } catch (err) {
            console.error('Error registering:', err);
            if (err && err.response && err.response.data && err.response.data.code === 1001) {
                setError('Tài khoản đã tồn tại.');
            } else {
                setError('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Xử lý nhập mã xác nhận (cho trường hợp paste hoặc input khác không qua keydown)
    const handleVerificationCodeChange = (index, value) => {
        // Chỉ cho phép nhập số
        if (!/^\d*$/.test(value)) {
            return;
        }

        // Nếu nhập nhiều ký tự (như khi paste), xử lý từng ký tự
        if (value.length > 1) {
            const digits = value.split('').filter(digit => /^\d$/.test(digit));
            
            // Cập nhật các ô từ vị trí hiện tại
            const newCode = [...verificationCode];
            for (let i = 0; i < Math.min(digits.length, 6 - index); i++) {
                newCode[index + i] = digits[i];
            }
            setVerificationCode(newCode);
            
            // Focus vào ô tiếp theo sau khi đã điền
            const nextIndex = Math.min(index + digits.length, 5);
            const nextInput = document.getElementById(`verification-${nextIndex}`);
            if (nextInput) nextInput.focus();
        } else {
            // Xử lý nhập một ký tự thông thường
            const newCode = [...verificationCode];
            newCode[index] = value;
            setVerificationCode(newCode);
            
            // Tự động chuyển đến ô tiếp theo
            if (value !== '' && index < 5) {
                const nextInput = document.getElementById(`verification-${index + 1}`);
                if (nextInput) nextInput.focus();
            }
        }
    };

    // Xử lý sự kiện phím để hỗ trợ điều hướng giữa các ô nhập mã xác nhận
    const handleVerificationKeyDown = (index, e) => {
        // Xử lý các phím điều hướng và xóa
        switch (e.key) {
            case 'Backspace':
                // Ngăn chặn xử lý mặc định của trình duyệt
                e.preventDefault();

                const newCode = [...verificationCode];

                // Nếu ô hiện tại không trống, xóa giá trị của ô hiện tại
                if (verificationCode[index] !== '') {
                    newCode[index] = '';
                    setVerificationCode(newCode);
                } 
                // Nếu ô hiện tại trống và không phải ô đầu tiên, chuyển focus về ô trước và xóa nó
                else if (index > 0) {
                    newCode[index - 1] = '';
                    setVerificationCode(newCode);
                    
                    // Focus vào ô trước đó
                    const prevInput = document.getElementById(`verification-${index - 1}`);
                    if (prevInput) prevInput.focus();
                }
                break;
            
            case 'ArrowLeft':
                // Di chuyển sang ô bên trái nếu có thể
                if (index > 0) {
                    const prevInput = document.getElementById(`verification-${index - 1}`);
                    if (prevInput) prevInput.focus();
                }
                break;
            
            case 'ArrowRight':
                // Di chuyển sang ô bên phải nếu có thể
                if (index < 5) {
                    const nextInput = document.getElementById(`verification-${index + 1}`);
                    if (nextInput) nextInput.focus();
                }
                break;
            
            // Trường hợp nhấn phím là số từ 0-9, tự động điền và chuyển đến ô tiếp theo
            default:
                if (/^\d$/.test(e.key)) {
                    e.preventDefault();
                    const newCode = [...verificationCode];
                    newCode[index] = e.key;
                    setVerificationCode(newCode);
                    
                    // Tự động chuyển đến ô tiếp theo nếu không phải ô cuối
                    if (index < 5) {
                        const nextInput = document.getElementById(`verification-${index + 1}`);
                        if (nextInput) nextInput.focus();
                    }
                }
        }
    };

    // Xử lý sự kiện paste đặc biệt cho các ô nhập mã xác nhận
    const handleVerificationPaste = (index, e) => {
        // Ngăn xử lý mặc định của trình duyệt
        e.preventDefault();
        
        // Lấy nội dung từ clipboard
        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedData = clipboardData.getData('Text');
        
        // Lọc chỉ lấy các ký tự số
        const digits = pastedData.split('').filter(char => /^\d$/.test(char));
        
        if (digits.length > 0) {
            // Cập nhật các ô từ vị trí hiện tại
            const newCode = [...verificationCode];
            
            for (let i = 0; i < Math.min(digits.length, 6 - index); i++) {
                newCode[index + i] = digits[i];
            }
            
            setVerificationCode(newCode);
            
            // Focus vào ô tiếp theo sau khi đã điền hoặc ô cuối cùng
            const nextIndex = Math.min(index + digits.length, 5);
            const nextInput = document.getElementById(`verification-${nextIndex}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/');
    };

    const [activeSection, setActiveSection] = useState("home");
    const scrollToSection = (id) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Render form based on current registration step
    const renderRegistrationForm = () => {
        switch (registrationStep) {
            case 1:
                return (
                    <form className="header-login-form" onSubmit={handleSendVerificationCode}>
                        <h2 className="header-modal-title">Đăng Ký Tài Khoản {registrationRole === 'STUDENT' ? 'Sinh Viên' : 'Giảng Viên'}</h2>
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}
                        <div className="header-role-selection-buttons mb-16">
                            <button
                                type="button"
                                className={`header-role-btn ${registrationRole === 'STUDENT' ? 'student active' : ''}`}
                                onClick={() => setRegistrationRole('STUDENT')}
                            >
                                Sinh viên
                            </button>
                            <button
                                type="button"
                                className={`header-role-btn ${registrationRole === 'TEACHER' ? 'teacher active' : ''}`}
                                onClick={() => setRegistrationRole('TEACHER')}
                            >
                                Giảng viên
                            </button>
                        </div>
                        <div className="header-form-group">
                            <input
                                type="email"
                                className="header-form-group-login"
                                placeholder="Vui lòng nhập Email có đuôi husc.edu.vn"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            className={`header-login-submit-btn ${isRegFormValid ? 'active' : 'disabled'}`}
                            disabled={!isRegFormValid || loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Xác nhận'}
                        </button>
                        
                        <div className="header-form-footer">
                            <p>Bạn đã có tài khoản? <a href="#" className="header-register-link" onClick={(e) => { 
                                e.preventDefault(); 
                                switchToLogin();
                            }}>Đăng nhập</a></p>
                        </div>
                    </form>
                );
            case 2:
                return (
                    <form className="header-login-form" onSubmit={handleVerifyCode}>
                        <h2 className="header-modal-title">Nhập mã xác nhận</h2>
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
                                    onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                                    onPaste={(e) => handleVerificationPaste(index, e)}
                                    disabled={loading}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>
                        <button
                            type="submit"
                            className={`header-login-submit-btn ${isRegFormValid ? 'active' : 'disabled'}`}
                            disabled={!isRegFormValid || loading}
                        >
                            {loading ? 'Đang xác minh...' : 'Xác nhận'}
                        </button>
                    </form>
                );
            case 3:
                return (
                    <form className="header-login-form" onSubmit={handleCompleteRegistration}>
                        <h2 className="header-modal-title">Hoàn tất đăng ký {registrationRole === 'STUDENT' ? 'Sinh Viên' : 'Giảng Viên'}</h2>
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}
                        <div className="header-form-group">
                            <input
                                type="text"
                                className="header-form-group-login"
                                placeholder="Họ và tên"
                                value={regFullName}
                                onChange={(e) => setRegFullName(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="header-form-group">
                            <div className="password-input-container">
                            <input
                                    type={showRegPassword ? "text" : "password"}
                                className="header-form-group-login"
                                placeholder="Mật khẩu"
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                                <button 
                                    type="button" 
                                    className="password-toggle-button" 
                                    onClick={() => setShowRegPassword(!showRegPassword)}
                                >
                                    {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="header-form-group">
                            <div className="password-input-container">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="header-form-group-login"
                                    placeholder="Xác nhận mật khẩu"
                                    value={regConfirmPassword}
                                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <button 
                                    type="button" 
                                    className="password-toggle-button" 
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {regPassword !== regConfirmPassword && regConfirmPassword !== '' && (
                                <span className="password-mismatch-error">Mật khẩu không khớp</span>
                            )}
                        </div>
                        {registrationRole === 'STUDENT' && (
                            <div className="header-form-group">
                                {loadingMajors ? (
                                    <div className="select-loading">Đang tải danh sách chuyên ngành...</div>
                                ) : (
                                    <select
                                        className="header-form-group-login"
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
                            className={`header-login-submit-btn ${isRegFormValid ? 'active' : 'disabled'}`}
                            disabled={!isRegFormValid || loading || (registrationRole === 'STUDENT' && loadingMajors)}
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
                    <a onClick={() => scrollToSection("home")} className={activeSection === "home" ? "active" : ""}>Trang chủ</a>
                    <a onClick={() => scrollToSection("courses")}  className={activeSection === "courses" ? "active" : ""}>Khóa học</a>
                    <a onClick={() => scrollToSection("about")} className={activeSection === "about" ? "active" : ""}>Về chúng tôi</a>
                    <a onClick={() => scrollToSection("contact")} className={activeSection === "contact" ? "active" : ""}>Liên hệ</a>
                </nav>
                {isAuthenticated ? (
                    <button className="login-btn" onClick={handleLogoutClick}>Đăng xuất</button>
                ) : (
                    <div className="auth-buttons">
                        <button className="login-btn" onClick={() => openLoginModal('STUDENT')}>Đăng nhập</button>
                        <button className="header-register-btn" onClick={() => {
                            setShowLoginModal(false);
                            setShowRegisterModal(true);
                            resetForm();
                            setRegistrationRole('STUDENT');
                        }}>Đăng ký</button>
                    </div>
                )}
            </header>
            
            {/* Login Modal */}
            {showLoginModal && (
                <div className="header-modal-overlay">
                    <div className="header-modal-container">
                        <div className="header-modal-header">
                            <button className="header-back-btn" onClick={toggleLoginRole}>
                                Đăng nhập với tư cách {selectedRole === 'STUDENT' ? 'giảng viên' : 'sinh viên'}
                            </button>
                            <button className="header-close-btn" onClick={closeAllModals}>×</button>
                        </div>

                            <div className="header-modal-content">
                                <div className="header-logo-container">
                                    <img src={logohusc} className="header-login-logo" alt="Logo HUSC" />
                                </div>
                                <h2 className="header-modal-title">
                                    Dành Cho {selectedRole === 'STUDENT' ? 'Sinh Viên' : 'Giảng Viên'}
                                </h2>

                                <form className="header-login-form" onSubmit={handleLogin}>
                                    {error && (
                                        <div className="alert alert-danger" role="alert">
                                            {error}
                                        </div>
                                    )}
                                    <div className="header-form-group">
                                        <input
                                            type="email"
                                            className="header-form-group-login"
                                            placeholder="Địa chỉ Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="header-form-group">
                                    <div className="password-input-container">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="header-form-group-login"
                                            placeholder="Mật khẩu"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                        <button 
                                            type="button" 
                                            className="password-toggle-button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    </div>
                                    
                                    <div className='d-flex justify-between align-center' style={{marginBottom: '1.5rem'}}>
                                        <div className="header-form-checkbox">
                                            <input type="checkbox" id="remember" disabled={loading} />
                                            <label htmlFor="remember">Ghi nhớ đăng nhập</label>
                                        </div>
                                    <a href="#" className='forgot-link' onClick={(e) => {
                                            e.preventDefault();
                                            openForgotPasswordModal();
                                        }}>Quên mật khẩu?</a>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className={`header-login-submit-btn ${isFormValid ? 'active' : 'disabled'}`}
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
                                        className="header-login-submit-btn d-flex justify-center align-center"
                                        onClick={handleLoginWithHusc}
                                        disabled={loading}
                                    >
                                        <FcGoogle size={24} style={{ marginRight: '8px' }} />
                                        Đăng nhập với Email HUSC
                                    </button>

                                    <div className="header-form-footer">
                                        <p>Bạn chưa có tài khoản? <a href="#" className="header-register-link" onClick={(e) => { 
                                            e.preventDefault(); 
                                            switchToRegister();
                                        }}>Đăng ký {selectedRole === 'STUDENT' ? 'Sinh viên' : 'Giảng viên'}</a></p>
                                    </div>

                                    <div className="terms">
                                        <p>Việc bạn tiếp tục sử dụng trang web này đồng nghĩa bạn đồng ý với <a href="#terms">điều khoản sử dụng</a> của chúng tôi.</p>
                                    </div>
                                </form>
                            </div>
                    </div>
                </div>
            )}
            
            {/* Modal Quên Mật Khẩu */}
            {showForgotPasswordModal && (
                <div className="header-modal-overlay">
                    <div className="header-modal-container">
                        <div className="header-modal-header">
                            <button className="header-back-btn" onClick={openLoginModal}>Quay lại</button>
                            <button className="header-close-btn" onClick={closeAllModals}>×</button>
                        </div>
                        
                        <div className="header-modal-content">
                            <div className="header-logo-container">
                                <img src={logohusc} className="header-login-logo" alt="Logo HUSC" />
                            </div>
                            
                            <form className="header-login-form" onSubmit={handleForgotPassword}>
                                <h2 className="header-modal-title">Quên Mật Khẩu</h2>
                                
                                {forgotPasswordError && (
                                    <div className="alert alert-danger" role="alert">
                                        {forgotPasswordError}
                                    </div>
                                )}
                                
                                {forgotPasswordSuccess && (
                                    <div className="alert alert-success" role="alert">
                                        {forgotPasswordSuccess}
                                    </div>
                                )}
                                
                                <p className="header-forgot-password-info">
                                    Vui lòng nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi mật khẩu mới vào email của bạn.
                                </p>
                                
                                <div className="header-form-group">
                                    <input
                                        type="email"
                                        className="header-form-group-login"
                                        placeholder="Địa chỉ Email"
                                        value={forgotPasswordEmail}
                                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                        required
                                        disabled={forgotPasswordLoading || forgotPasswordSuccess !== ''}
                                    />
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className={`header-login-submit-btn ${isForgotPasswordFormValid ? 'active' : 'disabled'}`}
                                    disabled={!isForgotPasswordFormValid || forgotPasswordLoading || forgotPasswordSuccess !== ''}
                                >
                                    {forgotPasswordLoading ? (
                                        <>
                                            <span className="spinner-header-border spinner-header-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Yêu cầu mật khẩu mới'
                                    )}
                                </button>
                                
                                <div className="header-form-footer">
                                    <p>Đã nhớ mật khẩu? <a href="#" onClick={(e) => { 
                                        e.preventDefault(); 
                                        switchToLogin();
                                    }}>Quay lại đăng nhập</a></p>
                                </div>
                            </form>
                            
                            <div className="terms">
                                <p>Việc bạn tiếp tục sử dụng trang web này đồng nghĩa bạn đồng ý với <a href="#terms">điều khoản sử dụng</a> của chúng tôi.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="header-modal-overlay">
                    <div className="header-modal-container">
                        <div className="header-modal-header">
                            <button className="header-back-btn" onClick={openLoginModal}>Quay lại</button>
                            <button className="header-close-btn" onClick={closeAllModals}>×</button>
                        </div>
                        
                        <div className="header-modal-content">
                            <div className="header-logo-container">
                                <img src={logohusc} className='header-login-logo' alt="Logo"/>
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