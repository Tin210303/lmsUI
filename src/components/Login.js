import { useNavigate } from 'react-router-dom';
import React, { useState } from "react";
import logo from '../assets/imgs/Logo-ko-nen.png';
import logoGG from '../assets/imgs/logo-gg.png'
import axios from 'axios';
import '../assets/css/login.css';

function Login() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isUsernameFocused, setIsUsernameFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        const requestData = {
            username,
            password
        }

        try {
            // const response = await axios.post('http://localhost:8080/identity/auth/token', requestData, {
            //     headers: {
            //         'Content-Type': 'application/json'
            //     }
            // });

            // const token = response.data.result.token;
            // localStorage.setItem('authToken', token);

            // axios.get('http://localhost:8080/identity/users', {
            //     headers: {
            //         'Authorization': `Bearer ${token}`
            //     }
            // })
            // .then(response => {
            //     console.log(response.data);
            //     navigate('/homepage')
            // })
            // .catch(error => {
            //     console.error("Lỗi khi lấy dữ liệu:", error);
            // });
            navigate('/homepage')
        } catch (error) {
            setError('Sai TK or MK')
        }
    }

    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
                <div className="login-area">
                    <img src={logo} alt="logo" className="logo"/>
                    <h1>DÀNH CHO SINH VIÊN</h1>
                    <div className="login-input">
                        <input 
                            type="text" 
                            className='input input-id' 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onFocus={() => setIsUsernameFocused(true)}
                            onBlur={() => setIsUsernameFocused(username !== '')} // Nếu input rỗng thì bỏ active
                            required
                        />
                        <label className={`login-label label-st ${isUsernameFocused ? 'active' : ''}`}>Mã Sinh Viên</label>

                        <input 
                            type="password" 
                            className='input input-pass' 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setIsPasswordFocused(true)}
                            onBlur={() => setIsPasswordFocused(password !== '')} 
                            required
                        />
                        <label className={`login-label label-pass ${isPasswordFocused ? 'active' : ''}`}>Mật Khẩu</label>
                        
                        <div className="checkbox">
                            <input type="checkbox" id='checkbox'/>
                            <label htmlFor="checkbox">Lưu Mật Khẩu</label>
                        </div>
                    </div>
                    <div className="login-btn">
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <button type="submit" className="btn btn-login imy-20">ĐĂNG NHẬP</button>
                        <label>hoặc</label>
                        <button className="btn btn-login-email imy-20">
                            <img src={logoGG} alt="logo-google"/>
                            ĐĂNG NHẬP VỚI EMAIL ST HUSC
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Login