import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/teacher-add-course.css';
import Alert from '../common/Alert';
import axios from 'axios';

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
        majorId: '',
    });

    const [alert, setAlert] = useState(null);
    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
    };

    const [error, setError] = useState('');
    const [majors, setMajors] = useState([]);
    const [loadingMajors, setLoadingMajors] = useState(false);

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        console.log(formData);
        
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
                        name="majorId"
                        value={formData.majorId}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Chọn chuyên ngành</option>
                        {majors.map(major => (
                            <option key={major.id} value={major.id}>
                                {major.name}
                            </option>
                        ))}
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