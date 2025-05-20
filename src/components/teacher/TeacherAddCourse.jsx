import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/teacher-add-course.css';
import Alert from '../common/Alert';
import axios from 'axios';
import { GET_MAJOR_API, ADD_COURSE_API, UPLOAD_COURSE_PHOTO_API } from '../../services/apiService';

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
        feeType: 'FREE',
        price: 0
    });

    // Thêm state cho việc kiểm soát hiển thị trường price
    const [showPriceField, setShowPriceField] = useState(false);

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

    // Cập nhật useEffect để kiểm soát hiển thị trường price dựa vào feeType
    useEffect(() => {
        setShowPriceField(formData.feeType === 'CHARGEABLE');
    }, [formData.feeType]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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

    // Xử lý thay đổi loại phí
    const handleFeeTypeChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            feeType: value,
            // Reset giá tiền nếu chuyển sang miễn phí
            price: value === 'FREE' ? 0 : prev.price
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Chuẩn bị dữ liệu gửi đi
            const courseData = {
                name: formData.name,
                description: formData.description,
                status: formData.status,
                startDate: formData.startDate,
                majorId: formData.majorId,
                learningDurationType: formData.learningDurationType,
                feeType: formData.feeType,
                price: formData.feeType === 'CHARGEABLE' ? Number(formData.price) : 0
            };
            
            // Chỉ gửi endDate nếu đã bật tùy chọn có thời hạn
            if (isEndDateEnabled && formData.endDate) {
                courseData.endDate = formData.endDate;
            }
            
            // Lấy token xác thực
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Gọi API tạo khóa học sử dụng axios
            console.log('Đang tạo khóa học mới...', courseData);
            const response = await axios.post(ADD_COURSE_API, courseData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Course created successfully:', response.data);
            
            // Kiểm tra nếu tạo khóa học thành công và có ảnh đại diện
            if (response.data && response.data.code === 0 && courseImage) {
                const courseId = response.data.result.id;
                console.log(`Khóa học đã được tạo thành công, ID: ${courseId}`);
                
                try {
                    // Gọi API upload ảnh đại diện
                    await uploadCoursePhoto(courseId, courseImage, token);
                    console.log('Đã upload ảnh đại diện cho khóa học thành công');
                    showAlert('success', 'Thành công', 'Thêm khóa học và ảnh đại diện thành công!');
                } catch (photoError) {
                    console.error('Error uploading course photo:', photoError);
                    // Hiển thị thông báo thành công nhưng có lỗi khi upload ảnh
                    showAlert('success', 'Thành công', 'Thêm khóa học thành công! Tuy nhiên, có lỗi khi tải lên ảnh đại diện.');
                }
            } else {
                showAlert('success', 'Thành công', 'Thêm khóa học thành công!');
            }
            
            // Navigate back to dashboard after successful creation
            setTimeout(() => {
                navigate('/teacher/dashboard');
            }, 1500);
        } catch (error) {
            console.error('Error creating course:', error);
            const errorMessage = error.response?.data?.message || error.message;
            showAlert('error', 'Lỗi', `Có lỗi xảy ra khi tạo khóa học: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hàm upload ảnh đại diện cho khóa học sử dụng axios
    const uploadCoursePhoto = async (courseId, photo, token) => {
        console.log(`Bắt đầu upload ảnh cho khóa học ID: ${courseId}`);
        console.log(`File ảnh: ${photo.name}, Kích thước: ${Math.round(photo.size / 1024)} KB`);
        
        // Tạo FormData mới cho việc upload ảnh
        const photoFormData = new FormData();
        photoFormData.append('file', photo);
        
        try {
            // Log URL API
            const apiUrl = `${UPLOAD_COURSE_PHOTO_API}/${courseId}/upload-photo`;
            console.log(`Gọi API: ${apiUrl}`);
            
            // Gọi API upload ảnh sử dụng axios
            const response = await axios.post(apiUrl, photoFormData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log('Upload ảnh thành công:', response.data);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi upload ảnh:', error);
            const errorMessage = error.response?.data?.message || error.message;
            throw new Error(`Error uploading photo: ${errorMessage}`);
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
                    <label>Loại phí <span style={{color: '#f00', marginLeft: '20px'}}>*</span></label>
                    <select 
                        name="feeType"
                        value={formData.feeType}
                        onChange={handleFeeTypeChange}
                        required
                    >
                        <option value="FREE">Miễn phí</option>
                        <option value="CHARGEABLE">Có phí</option>
                    </select>
                </div>
                {showPriceField && (
                    <div className="teacher-form-group">
                        <label>Giá tiền (USD) <span style={{color: '#f00', marginLeft: '20px'}}>*</span></label>
                        <input 
                            type="number" 
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            required={formData.feeType === 'CHARGEABLE'}
                        />
                    </div>
                )}
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