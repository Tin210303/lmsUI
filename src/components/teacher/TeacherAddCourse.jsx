import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/teacher-add-course.css';
import Alert from '../common/Alert';

const TeacherAddCourse = () => {
    const navigate = useNavigate();
    const [isEndDateEnabled, setIsEndDateEnabled] = useState(false);
    const today = new Date().toISOString().split('T')[0];
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: '',
        startDate: today,
        endDate: '',
        learningDurationType: 'Không thời hạn',
        major: 'IT'
    });

    const [alert, setAlert] = useState(null);
    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Prepare the request data
            const requestData = {
                ...formData,
                // If end date is not enabled, set learningDurationType to "Không thời hạn"
                // and remove the endDate from the request
                ...(isEndDateEnabled 
                    ? { 
                        learningDurationType: 'Có thời hạn',
                        endDate: formData.endDate 
                    } 
                    : { 
                        learningDurationType: 'Không thời hạn',
                        endDate: null 
                    }
                )
            };

            // Make the API call
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('http://localhost:8080/lms/course/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            console.log('Course created successfully:', result);
            showAlert('success', 'Thành công', 'Thêm khóa học thành công!');
            // Navigate back to dashboard after successful creation
            navigate('/teacher/dashboard');
        } catch (error) {
            console.error('Error creating course:', error);
            showAlert('error', 'Lỗi', 'Có lỗi xảy ra khi tạo khóa học. Vui lòng thử lại!');
        }
    };

    return (
        <div className="teacher-add-course-container">
            {alert && (
                <div className="alert-container">
                    <Alert
                        type={alert.type}
                        title={alert.title}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                </div>
            )}
            <h2>Thêm khóa học mới</h2>
            <form onSubmit={handleSubmit} className="teacher-add-course-form">
                <div className="teacher-form-group">
                    <label>Tên khóa học <span style={{color: '#f00', marginLeft: '20px'}}>*</span></label>
                    <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required 
                    />
                </div>
                <div className="teacher-form-group">
                    <label>Loại <span style={{color: '#f00', marginLeft: '20px'}}>*</span></label>
                    <select 
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Chọn loại</option>
                        <option value="PUBLIC">Khóa học miễn phí</option>
                        <option value="REQUEST">Khóa học yêu cầu đăng ký</option>
                        <option value="PRIVATE">Khóa học riêng tư</option>
                    </select>
                </div>
                <div className="teacher-form-group">
                    <label>Chuyên ngành <span style={{color: '#f00', marginLeft: '20px'}}>*</span></label>
                    <select 
                        name="major"
                        value={formData.major}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Chọn chuyên ngành</option>
                        <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Business">Kinh doanh</option>
                        <option value="Design">Thiết kế</option>
                        <option value="Language">Ngoại ngữ</option>
                    </select>
                </div>
                <div className="teacher-form-group">
                    <label>Ngày bắt đầu khóa học <span style={{color: '#f00', marginLeft: '20px'}}>*</span></label>
                    <input 
                        type="date" 
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required 
                    />
                </div>
                <div className="teacher-form-group">
                    <label>
                        Ngày kết thúc khóa học
                        <input 
                            className='teacher-form-group-checkbox' 
                            type="checkbox" 
                            checked={isEndDateEnabled}
                            onChange={() => setIsEndDateEnabled(!isEndDateEnabled)} 
                        />
                    </label>
                    <input 
                        type="date" 
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        disabled={!isEndDateEnabled}
                        required={isEndDateEnabled}
                    />
                </div>
                <div className="teacher-form-group">
                    <label>Ảnh đại diện cho khóa học<span style={{color: '#f00', marginLeft: '26px'}}></span></label>
                    <input type="file" />
                </div>
                <div className="teacher-form-group">
                    <label>Mô tả về khóa học<span style={{color: '#f00', marginLeft: '26px'}}></span></label>
                    <textarea 
                        rows="4"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                    ></textarea>
                </div>
                <div className="teacher-form-actions">
                    <button type="submit" className="teacher-confirm-button">Xác nhận</button>
                    <button type="button" className="teacher-cancel-button" onClick={() => navigate('/teacher/dashboard')}>Hủy</button>
                </div>
            </form>
        </div>
    );
};

export default TeacherAddCourse; 