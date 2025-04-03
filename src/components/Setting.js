import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import '../assets/css/Setting.css';
import { UserContext } from '../context/userContext';
import ReactPlayer from 'react-player';
import Grid from '@mui/material/Grid'
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import BookmarkIcon from '@mui/material/Icon'
import IconButton from '@mui/material/IconButton';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Slider from '@mui/material/Slider'

const Setting = () => {
  const accessToken = localStorage.getItem('authToken');
  const [uploading, setUploading] = useState(false);
  const { profileImage, setProfileImage, infoUser, setInfoUser } = useContext(UserContext)

  // Chạy fetchInfoUser khi component được mount
  useEffect(() => {
    fetchInfoUser();
  }, []);

  // Chạy fetchProfileImage khi infoUser được cập nhật
  useEffect(() => {
    if (infoUser?.result?.id) {
      fetchProfileImage();
    }
  }, [infoUser]); 

  const fetchInfoUser = async () => {
    try {
        const response = await axios.get('http://localhost:8080/lms/student/myinfo', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        setInfoUser(response.data);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
    }
  };
  
  // Lấy ảnh từ API
  const fetchProfileImage = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/lms/student/image/${infoUser.result.id}.JPG`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        responseType: 'blob'
      });
      const imageUrl = URL.createObjectURL(response.data);
      setProfileImage(imageUrl);
    } catch (error) {
      console.error('Lỗi khi lấy ảnh:', error);
    }
  };

  // Upload ảnh lên server
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      await axios.post(
        `http://localhost:8080/lms/student/${infoUser.result.id}/upload-photo`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      fetchProfileImage();
    } catch (error) {
      console.error('Lỗi khi upload ảnh:', error);
    } finally {
      setUploading(false);
    }
  };

  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    fullName: 'Nguyễn Đắc Tịnh Tín',
    studentId: '21T1080047',
    dateOfBirth: '21/03/2003',
    gender: 'Nam',
    email: 'tinnguyen210303@gmail.com',
    phone: '0702622279',
    address: '115/5 Đặng Tất, Phường Hương Vinh, Quận Xuân Phú, thành phố Huế, Tỉnh Thừa Thiên Huế, Việt Nam',
    faculty: 'Công Nghệ Thông Tin',
    className: 'KTPM-111',
    schoolYear: '2021 - 2025',
    currentSemester: 'Học kỳ 2, Năm học 2024 - 2025'
  });
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [passwordRequirements, setPasswordRequirements] = useState({
    minChars: false,
    uppercase: false,
    lowercase: false,
    special: false,
    number: false
  });

  // Xử lý đổi mật khẩu
  const handleChangePassword = async () => {
    if (!isOldPasswordEntered || !allRequirementsMet || !isConfirmPasswordMatch) {
      alert('Vui lòng nhập đúng thông tin đổi mật khẩu.');
      return;
    }
  
    try {
      const response = await axios.put(
        'http://localhost:8080/lms/users/changePassword',
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.id) {
        alert('Đổi mật khẩu thành công!');
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        if (response.data.code === 1009) {
          alert('Mật khẩu hiện tại của bạn không đúng')
        }
        alert( 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      alert((error.status === 400) ? 'Mật khẩu hiện tại của bạn không đúng' : 'lỗi');
    }
  };

  // Trạng thái hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    if (name === 'newPassword') {
      setPasswordRequirements({
        minChars: value.length >= 12,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
        number: /[0-9]/.test(value)
      });
    }
  };

  // Toggle hiển thị mật khẩu
  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  // Check if all password requirements are met
  const allRequirementsMet = Object.values(passwordRequirements).every(req => req === true);
  
  // Check if old password is entered
  const isOldPasswordEntered = passwordData.oldPassword.trim() !== '';
  
  // Check if confirm password matches new password
  const isConfirmPasswordMatch = passwordData.confirmPassword !== '' && 
                                passwordData.confirmPassword === passwordData.newPassword;
  
  // FAQ region
  const faqs = [
    { question: "Tổng quan về LMS", videoUrl: "https://player.vimeo.com/video/1071661900?h=baa0dd66d9&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" },
    { question: "Làm thế nào để đổi mật khẩu?", videoUrl: "https://www.youtube.com/watch?v=h6RONxjPBf4" },
    { question: "Làm thế nào để đổi ngôn ngữ?", videoUrl: "https://www.youtube.com/watch?v=n6Pnzi6r9NU" },
    { question: "Làm thế nào để tham gia làm bài thi?", videoUrl: "https://www.youtube.com/watch?v=RTBl0s8-y1o" },
    { question: "Làm thế nào để tải tài liệu học tập?", videoUrl: "https://www.youtube.com/watch?v=Vdm6i1m4tDE" },
    { question: "Làm thế nào để xây dựng lộ trình học tập?", videoUrl: "https://www.youtube.com/watch?v=NLBTbCfR-Fg" },
    { question: "Làm thế nào để trao đổi với giảng viên?", videoUrl: "https://www.youtube.com/watch?v=sVmgsS8_fc8" },
  ];
  

  const FAQItem = ({ title, url }) => {
    const [isActive, setIsActive] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const playerRef = useRef(null);
    const [played, setPlayed] = useState(0);
    const handleProgress = (state) => {
      setPlayed(state.played);
    };

    const formatTime = (time) => {
      const date = new Date(time * 1000);
      const hour = date.getUTCHours();
      const minute = date.getUTCMinutes();
      const second = ('0' + date.getUTCSeconds()).slice(-2);
      if (hour) {
        return `${hour}:${('0' + minute).slice(-2)}:${second}`;
      }
      return `${minute}:${second}`;
    }

    return (
      <div 
        className={`faq ${isActive ? "active" : ""}`} 
        onClick={() => {
          setIsActive(!isActive)
          setIsPlaying(!isPlaying)
        }}
      >
        <h3 className="faq-title">{title}</h3>
        <div className='video-container'>
          <ReactPlayer
            ref={playerRef}
            url={url}
            width="800px"
            height="360px"
            playing={isPlaying}
            controls={true}
            onProgress={handleProgress}
            className="faq-text"
          />

          {/* <div className='controls-wrapper'>
            <Grid container direction="row" alignItems="center" justifyContent="space-between" style={{padding:16}}>
              <Grid item>
                <Typography variant='h5' style={{color: "#fff"}}>Video title</Typography>
              </Grid>

              <Grid item>
                <Button variant="contained" color="primary" startIcon={<BookmarkIcon/>}>Bookmark</Button>
              </Grid>
            </Grid>

            <Grid container direction="row" alignItems="center" justifyContent="center">
              <IconButton aria-label='requind' className='control-icons'>
                <FastRewindIcon fontSize='inherit'/>
              </IconButton>

              <IconButton aria-label='requind' className='control-icons'>
                <PlayArrowIcon fontSize='inherit'/>
              </IconButton>

              <IconButton aria-label='requind' className='control-icons'>
                <FastForwardIcon fontSize='inherit'/>
              </IconButton>
            </Grid>

            <Grid container direction="row" alignItems="center" justifyContent="center" style={{padding: 16}}>

            </Grid>
          </div> */}

        </div>
        <button
          className="faq-toggle" 
          onClick={() => {
            setIsActive(!isActive)
            setIsPlaying(!isPlaying)
        }}
        >
          <i className={isActive ? "fas fa-times" : "fas fa-chevron-down"}></i>
        </button>
      </div>
    );
  };
  
  return (
    <div className="setting-container">
      <h1 className="setting-title">Cài Đặt</h1>
     
      <div className="setting-tabs">
        <button
          className={activeTab === 'personal' ? 'tab-active' : ''}
          onClick={() => handleTabChange('personal')}
        >
          Thông Tin Cá Nhân
        </button>
        <button
          className={activeTab === 'password' ? 'tab-active' : ''}
          onClick={() => handleTabChange('password')}
        >
          Đổi Mật Khẩu
        </button>
        <button
          className={activeTab === 'help' ? 'tab-active' : ''}
          onClick={() => handleTabChange('help')}
        >
          Trợ Giúp
        </button>
      </div>
     
      <div className="setting-content">
        {activeTab === 'personal' && (
          <div className="personal-info-content">
            <div className="profile-section">
              <div className="profile-image-container">
                {profileImage ? (
                  <img src={profileImage} alt="Avatar" className="profile-image" />
                ) : (
                  <span className="image-placeholder">No Image</span>
                )}
                <label htmlFor="upload-photo" className="change-image-btn">
                  {uploading ? 'Đang tải...' : 'Thay đổi ảnh'}
                </label>
                <input
                  type="file"
                  id="upload-photo"
                  accept="image/*"
                  className='change-image-btn'
                  style={{display: 'none'}}
                  onChange={handleImageUpload}
                />
              </div>
             
              <div className="profile-details">
                <h3 className="profile-name">{infoUser?.result?.fullName}</h3>
                <p className="profile-id">MSSV: {infoUser?.result?.code}</p>
                <p className="profile-faculty">{infoUser?.result?.major?.faculty?.name}</p>
                <p className="profile-semester">{infoUser?.result?.clazz?.course?.name} ({new Date(infoUser?.result?.clazz?.course?.startDate).getFullYear()} - {new Date(infoUser?.result?.clazz?.course?.endDate).getFullYear()})</p>
              </div>
            </div>
           
            <div className="info-details">
              <section>
                <h3>Thông tin cơ bản</h3>
                <div className="info-grid">
                  <div className="info-label">Họ và Tên:</div>
                  <div className="info-value">{infoUser?.result?.fullName}</div>
                 
                  <div className="info-label">MSSV:</div>
                  <div className="info-value">{infoUser?.result?.code}</div>
                 
                  <div className="info-label">Ngày Sinh:</div>
                  <div className="info-value">{new Date(infoUser?.result?.dateOfBirth).toLocaleDateString('vi-VN')}</div>
                 
                  <div className="info-label">Giới Tính:</div>
                  <div className="info-value">{infoUser?.result?.gender}</div>
                </div>
              </section>
             
              <section>
                <h3>Thông tin liên hệ</h3>
                <div className="info-grid">
                  <div className="info-label">Email:</div>
                  <div className="info-value">{infoUser?.result?.email}</div>
                 
                  <div className="info-label">Số Điện Thoại:</div>
                  <div className="info-value">{infoUser?.result?.phoneNumber}</div>
                 
                  <div className="info-label">Địa Chỉ:</div>
                  <div className="info-value">{infoUser?.result?.contactAddress}</div>
                </div>
              </section>
             
              <section>
                <h3>Thông tin học tập</h3>
                <div className="info-grid">
                  <div className="info-label">Khoa:</div>
                  <div className="info-value">{infoUser?.result?.major?.faculty?.name}</div>
                 
                  <div className="info-label">Lớp:</div>
                  <div className="info-value">{infoUser?.result?.major?.name}</div>
                 
                  <div className="info-label">Khóa Học:</div>
                  <div className="info-value">{infoUser?.result?.clazz?.course?.name} ({new Date(infoUser?.result?.clazz?.course?.startDate).getFullYear()} - {new Date(infoUser?.result?.clazz?.course?.endDate).getFullYear()})</div>
                </div>
              </section>
            </div>
          </div>
        )}
       
        {activeTab === 'password' && (
          <div className="password-content">
            <div className="password-form">
              <div className="form-group">
                <label>Mật Khẩu Hiện Tại</label>
                <div className="password-input-container">
                  <input
                    type={showPassword.oldPassword ? 'text' : 'password'}
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    className="password-input"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <span className="password-toggle" onClick={() => togglePasswordVisibility('oldPassword')}>
                    {showPassword.oldPassword ? '👁️' : '🙈'}
                  </span>
                </div>
              </div>
             
              <div className={`form-group ${allRequirementsMet ? 'all-requirements-met' : ''}`}>
                <label>Mật Khẩu Mới</label>
                <div className="password-input-container">
                  <input
                    type={showPassword.newPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`password-input ${allRequirementsMet ? 'password-success' : 'password-error'}`}
                  />
                  <span className="password-toggle" onClick={() => togglePasswordVisibility('newPassword')}>
                    {showPassword.newPassword ? '👁️' : '🙈'}
                  </span>
                </div>
                <p className="password-help">Vui lòng thêm tất cả các ký tự cần thiết để tạo mật khẩu an toàn.</p>
               
                <div className="password-requirements">
                  <div className={passwordRequirements.minChars ? 'requirement-met' : 'requirement-error'}>
                    <span className="bullet"></span> Tối thiểu 12 kí tự
                  </div>
                  <div className={passwordRequirements.uppercase ? 'requirement-met' : 'requirement-error'}>
                    <span className="bullet"></span> Tối thiểu 1 kí tự in hoa
                  </div>
                  <div className={passwordRequirements.lowercase ? 'requirement-met' : 'requirement-error'}>
                    <span className="bullet"></span> Tối thiểu 1 kí tự viết thường
                  </div>
                  <div className={passwordRequirements.special ? 'requirement-met' : 'requirement-error'}>
                    <span className="bullet"></span> Tối thiểu 1 kí tự đặc biệt
                  </div>
                  <div className={passwordRequirements.number ? 'requirement-met' : 'requirement-error'}>
                    <span className="bullet"></span> Tối thiểu 1 kí tự số
                  </div>
                </div>
              </div>
             
              <div className="form-group">
                <label>Xác Nhận Mật Khẩu</label>
                <div className="password-input-container">
                  <input
                    type={showPassword.confirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`password-input ${passwordData.confirmPassword === '' ? 'password-placeholder' : 
                              isConfirmPasswordMatch ? 'password-success' : 'password-error'}`}
                    placeholder="enter your confirm new password"
                  />
                  <span className="password-toggle" onClick={() => togglePasswordVisibility('confirmPassword')}>
                    {showPassword.confirmPassword ? '👁️' : '🙈'}
                  </span>
                </div>
                {passwordData.confirmPassword !== '' && (
                  <span className={`valid-indicator ${isConfirmPasswordMatch ? 'success' : 'error'}`}>
                    {isConfirmPasswordMatch ? '✓' : '✗'}
                  </span>
                )}
              </div>
             
              <button className="change-password-btn" onClick={handleChangePassword}>Đổi Mật Khẩu</button>
            </div>
          </div>
        )}
       
        {activeTab === 'help' && (
          <div className="help-content">
            <div className="faq-container">
              {faqs.map((faq, index) => (
                <FAQItem key={index} title={faq.question} url={faq.videoUrl}/>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Setting;