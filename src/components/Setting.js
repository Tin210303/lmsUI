import React, { useState } from 'react';
import '../assets/css/Setting.css';

const Setting = () => {
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
  
  // Check if all password requirements are met
  const allRequirementsMet = Object.values(passwordRequirements).every(req => req === true);
  
  // Check if old password is entered
  const isOldPasswordEntered = passwordData.oldPassword.trim() !== '';
  
  // Check if confirm password matches new password
  const isConfirmPasswordMatch = passwordData.confirmPassword !== '' && 
                                passwordData.confirmPassword === passwordData.newPassword;
  
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
                <div className="profile-image">
                  <span className="image-placeholder">.ar</span>
                </div>
                <button className="change-image-btn">Thay đổi ảnh</button>
              </div>
             
              <div className="profile-details">
                <h3 className="profile-name">{formData.fullName}</h3>
                <p className="profile-id">MSSV: {formData.studentId}</p>
                <p className="profile-faculty">{formData.faculty}</p>
                <p className="profile-semester">{formData.currentSemester}</p>
              </div>
            </div>
           
            <div className="info-details">
              <section>
                <h3>Thông tin cơ bản</h3>
                <div className="info-grid">
                  <div className="info-label">Họ và Tên:</div>
                  <div className="info-value">{formData.fullName}</div>
                 
                  <div className="info-label">MSSV:</div>
                  <div className="info-value">{formData.studentId}</div>
                 
                  <div className="info-label">Ngày Sinh:</div>
                  <div className="info-value">{formData.dateOfBirth}</div>
                 
                  <div className="info-label">Giới Tính:</div>
                  <div className="info-value">{formData.gender}</div>
                </div>
              </section>
             
              <section>
                <h3>Thông tin liên hệ</h3>
                <div className="info-grid">
                  <div className="info-label">Email:</div>
                  <div className="info-value">{formData.email}</div>
                 
                  <div className="info-label">Số Điện Thoại:</div>
                  <div className="info-value">{formData.phone}</div>
                 
                  <div className="info-label">Địa Chỉ:</div>
                  <div className="info-value">{formData.address}</div>
                </div>
              </section>
             
              <section>
                <h3>Thông tin học tập</h3>
                <div className="info-grid">
                  <div className="info-label">Khoa:</div>
                  <div className="info-value">{formData.faculty}</div>
                 
                  <div className="info-label">Lớp:</div>
                  <div className="info-value">{formData.className}</div>
                 
                  <div className="info-label">Khóa Học:</div>
                  <div className="info-value">{formData.schoolYear}</div>
                 
                  <div className="info-label">Học Kỳ Hiện Tại:</div>
                  <div className="info-value">{formData.currentSemester}</div>
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
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    className="password-input"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <span className="password-toggle">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  </span>
                </div>
                {isOldPasswordEntered && <span className="valid-indicator">✓</span>}
              </div>
             
              <div className={`form-group ${allRequirementsMet ? 'all-requirements-met' : ''}`}>
                <label>Mật Khẩu Mới</label>
                <div className="password-input-container">
                  <input
                    type="text"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`password-input ${allRequirementsMet ? 'password-success' : 'password-error'}`}
                  />
                  <span className="password-toggle">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
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
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`password-input ${passwordData.confirmPassword === '' ? 'password-placeholder' : 
                              isConfirmPasswordMatch ? 'password-success' : 'password-error'}`}
                    placeholder="enter your confirm new password"
                  />
                  <span className="password-toggle">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  </span>
                </div>
                {passwordData.confirmPassword !== '' && (
                  <span className={`valid-indicator ${isConfirmPasswordMatch ? 'success' : 'error'}`}>
                    {isConfirmPasswordMatch ? '✓' : '✗'}
                  </span>
                )}
              </div>
             
              <button className="change-password-btn">Đổi Mật Khẩu</button>
            </div>
          </div>
        )}
       
        {activeTab === 'help' && (
          <div className="help-content">
            <p>Nội dung trợ giúp sẽ hiển thị ở đây</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Setting;