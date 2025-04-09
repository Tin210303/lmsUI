import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/header.css';
import logohusc from '../assets/imgs/Logo-ko-nen.png';
import logo from '../assets/imgs/logo.png';
import { FcGoogle } from 'react-icons/fc';

function Header() {
    const navigate = useNavigate();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    // Registration form states
    const [regEmail, setRegEmail] = useState('');
    const [regUsername, setRegUsername] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [isRegFormValid, setIsRegFormValid] = useState(false);
    
    // Check if both email and password have values for login
    useEffect(() => {
        setIsFormValid(email.trim() !== '' && password.trim() !== '');
    }, [email, password]);
    
    // Check if all registration fields have values
    useEffect(() => {
        setIsRegFormValid(
            regEmail.trim() !== '' && 
            regUsername.trim() !== '' && 
            regPassword.trim() !== '' 
        );
    }, [regEmail, regUsername, regPassword]);
    
    const openLoginModal = () => {
        setSelectedRole(null); // reset role selection
        setShowLoginModal(true);
        setShowRegisterModal(false);
    };
      
    const openRegisterModal = () => {
        setShowRegisterModal(true);
        setShowLoginModal(false);
    };
    
    const closeAllModals = () => {
        setShowLoginModal(false);
        setShowRegisterModal(false);
        // Clear form data
        setEmail('');
        setPassword('');
        setRegEmail('');
        setRegUsername('');
        setRegPassword('');
    };
    
    // Xử lý đăng nhập
    const handleLogin = (e) => {
        e.preventDefault();
        
        // Ở đây bạn có thể thêm logic để gọi API đăng nhập
        // Ví dụ:
        // loginUser(email, password)
        //   .then(response => {
        //     // Lưu token vào localStorage
        //     localStorage.setItem('token', response.token);
        //     // Chuyển hướng đến trang chủ
        //     navigate('/');
        //   })
        //   .catch(error => {
        //     // Xử lý lỗi
        //     alert('Đăng nhập thất bại: ' + error.message);
        //   });
        
        // Mô phỏng đăng nhập thành công và chuyển hướng
        console.log('Đăng nhập với:', email, password);
        
        // Lưu trạng thái đăng nhập vào localStorage (giả định)
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('role', selectedRole);

        
        // Đóng modal
        closeAllModals();
        
        navigate('/courses');
    };
    
    // Xử lý đăng nhập bằng Email HUSC
    const handleLoginWithHusc = (e) => {
        e.preventDefault();
        
        // Mô phỏng đăng nhập thành công
        console.log('Đăng nhập với Email HUSC');
        
        // Lưu trạng thái đăng nhập
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isHuscUser', 'true');
        localStorage.setItem('role', selectedRole);
        
        // Đóng modal
        closeAllModals();
        
        navigate('/courses');
    };
    
    // Xử lý đăng ký
    const handleRegister = (e) => {
        e.preventDefault();
        
        // Xử lý logic đăng ký
        console.log('Đăng ký với:', regUsername, regEmail, regPassword);
        
        // Thông báo đăng ký thành công và chuyển sang đăng nhập
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        openLoginModal();
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
                <button className="login-btn" onClick={openLoginModal}>Đăng nhập</button>
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

                                <form className="login-form" onSubmit={(e) => {
                                    e.preventDefault();
                                    console.log('Đăng nhập với:', email, password, selectedRole);
                                    localStorage.setItem('isLoggedIn', 'true');
                                    localStorage.setItem('userEmail', email);
                                    localStorage.setItem('role', selectedRole);
                                    closeAllModals();
                                    navigate(selectedRole === 'teacher' ? '/teacher/courses' : '/courses'); // hoặc `/teacher/dashboard` nếu phân quyền
                                }}>
                                    <div className="form-group">
                                        <input
                                            type="email"
                                            className="form-group-login"
                                            placeholder="Địa chỉ Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
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
                                        />
                                    </div>

                                    <div className="form-checkbox">
                                        <input type="checkbox" id="remember" />
                                        <label htmlFor="remember">Ghi nhớ đăng nhập</label>
                                    </div>

                                    <button
                                        type="submit"
                                        className={`login-submit-btn ${isFormValid ? 'active' : 'disabled'}`}
                                        disabled={!isFormValid}
                                        >
                                        Đăng nhập
                                    </button>

                                    <p>Hoặc</p>

                                    <button
                                        className="login-submit-btn d-flex justify-center align-center"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            console.log('Đăng nhập với Email HUSC');
                                            localStorage.setItem('isLoggedIn', 'true');
                                            localStorage.setItem('isHuscUser', 'true');
                                            localStorage.setItem('role', selectedRole);
                                            closeAllModals();
                                            navigate(selectedRole === 'teacher' ? '/teacher/dashboard' : '/courses'); // hoặc phân theo role
                                        }}
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