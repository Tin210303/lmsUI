import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/teacher-add-course.css';
import Alert from '../common/Alert';
import axios from 'axios';
import { GET_MAJOR_API, ADD_COURSE_API } from '../../services/apiService';

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
        learningDurationType: 'UNLIMITED',
        majorId: '',
    });

    // Thêm state cho ảnh đại diện
    const [courseImage, setCourseImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const fileInputRef = useRef(null);

    const [alert, setAlert] = useState(null);
    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
    };

    const [error, setError] = useState('');
    const [majors, setMajors] = useState([]);
    const [loadingMajors, setLoadingMajors] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Lấy danh sách chuyên ngành từ API
    useEffect(() => {
        const fetchMajors = async () => {
            try {
                setLoadingMajors(true);
                const response = await axios.get(`${GET_MAJOR_API}`);
                
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

    // Xử lý khi thay đổi checkbox ngày kết thúc
    const handleEndDateToggle = () => {
        const newIsEnabled = !isEndDateEnabled;
        setIsEndDateEnabled(newIsEnabled);
        
        // Cập nhật learningDurationType dựa trên trạng thái checkbox
        setFormData(prev => ({
            ...prev,
            learningDurationType: newIsEnabled ? 'LIMITED' : 'UNLIMITED',
            // Nếu bỏ chọn, reset giá trị endDate
            endDate: newIsEnabled ? prev.endDate : ''
        }));
    };

    // Xử lý khi chọn ảnh
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCourseImage(file);
            
            // Tạo URL preview cho ảnh
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);
        }
    };

    // Xử lý click vào nút chọn ảnh
    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Prepare the request data
            const requestData = new FormData();
            
            // Thêm các trường dữ liệu cơ bản
            requestData.append('name', formData.name);
            requestData.append('description', formData.description);
            requestData.append('status', formData.status);
            requestData.append('startDate', formData.startDate);
            requestData.append('majorId', formData.majorId);
            requestData.append('learningDurationType', formData.learningDurationType);
            
            // Chỉ gửi endDate nếu đã bật tùy chọn có thời hạn
            if (isEndDateEnabled && formData.endDate) {
                requestData.append('endDate', formData.endDate);
            }
            
            // Thêm ảnh nếu có
            if (courseImage) {
                requestData.append('image', courseImage);
            }

            // Make the API call
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${ADD_COURSE_API}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: requestData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            console.log('Course created successfully:', result);
            showAlert('success', 'Thành công', 'Thêm khóa học thành công!');
            // Navigate back to dashboard after successful creation
            setTimeout(() => {
                navigate('/teacher/dashboard');
            }, 1500);
        } catch (error) {
            console.error('Error creating course:', error);
            showAlert('error', 'Lỗi', 'Có lỗi xảy ra khi tạo khóa học. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Dọn dẹp URL khi component unmount
    useEffect(() => {
        return () => {
            if (previewImage) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

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
                            onChange={handleEndDateToggle}
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
                    <label>Ảnh đại diện cho khóa học</label>
                    <div className="course-image-container">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                        <div className="course-image-upload" onClick={handleImageClick}>
                            {previewImage ? (
                                <div className="image-preview">
                                    <img src={previewImage} alt="Course preview" />
                                </div>
                            ) : (
                                <div className="image-placeholder">
                                    <span>Click để chọn ảnh</span>
                                </div>
                            )}
                            <button 
                                type="button" 
                                className="choose-image-button"
                                onClick={handleImageClick}
                            >
                                {previewImage ? 'Thay đổi ảnh' : 'Chọn ảnh'}
                            </button>
                            {courseImage && (
                                <div className="file-name">
                                    {courseImage.name} ({Math.round(courseImage.size / 1024)} KB)
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="teacher-form-group">
                    <label>Mô tả về khóa học</label>
                    <textarea 
                        rows="4"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                    ></textarea>
                </div>
                <div className="teacher-form-actions">
                    <button 
                        type="submit" 
                        className="teacher-confirm-button" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
                    </button>
                    <button 
                        type="button" 
                        className="teacher-cancel-button" 
                        onClick={() => navigate('/teacher/dashboard')}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TeacherAddCourse; 