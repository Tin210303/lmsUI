import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../assets/css/teacher-add-lesson.css';
import Alert from '../common/Alert';
import { ADD_CHAPTER_API, API_BASE_URL } from '../../services/apiService';
import { FileText, Image, Video, X, Upload, Trash2 } from 'lucide-react';

const TeacherAddLesson = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { courseId, lessonId, lessonName } = location.state || {};
    const [alert, setAlert] = useState(null);
    const fileInputRef = useRef(null);
    
    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
    };
    
    const [formData, setFormData] = useState({
        lessonId: lessonId,
        name: '',
        order: '',
        file: null,
        type: 'file'
    });
    const [loading, setLoading] = useState(true);
    const [selectedFileName, setSelectedFileName] = useState('');

    // Tự động lấy thứ tự lớn nhất hiện có và cộng thêm 1
    useEffect(() => {
        const fetchMaxOrder = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                // Lấy thông tin khóa học để tìm chapter có thứ tự lớn nhất
                // Chú ý: Trong giao diện, lesson = chapter trong backend và ngược lại
                const response = await axios.get(`${API_BASE_URL}/lms/course/${courseId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data && response.data.result) {
                    const courseData = response.data.result;
                    
                    // Tìm đúng lesson từ backend (lesson trong backend = chapter trong giao diện)
                    const currentLesson = courseData.lesson?.find(lessonItem => lessonItem.id === lessonId);
                    
                    if (currentLesson && currentLesson.chapter && currentLesson.chapter.length > 0) {
                        // Tìm order lớn nhất trong các chapter đã có
                        const maxOrder = Math.max(...currentLesson.chapter.map(chapter => chapter.order || 0));
                        setFormData(prev => ({
                            ...prev,
                            order: maxOrder + 1
                        }));
                        console.log(`Bài học mới sẽ có thứ tự: ${maxOrder + 1}`);
                    } else {
                        // Nếu không có chapter nào, order bắt đầu từ 1
                        setFormData(prev => ({
                            ...prev,
                            order: 1
                        }));
                        console.log('Không có bài học nào trước đó, thứ tự sẽ là: 1');
                    }
                }
            } catch (error) {
                console.error('Error fetching lesson data:', error);
                // Nếu có lỗi, mặc định order là 1
                setFormData(prev => ({
                    ...prev,
                    order: 1
                }));
            } finally {
                setLoading(false);
            }
        };

        if (lessonId && courseId) {
            fetchMaxOrder();
        }
    }, [lessonId, courseId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFormData(prev => ({
                ...prev,
                file: selectedFile
            }));
            setSelectedFileName(selectedFile.name);
        }
    };

    const handleRemoveFile = () => {
        setFormData(prev => ({
            ...prev,
            file: null
        }));
        setSelectedFileName('');
        // Reset input file để có thể chọn lại cùng file nếu muốn
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleChangeFile = () => {
        // Kích hoạt click trên input file để mở hộp thoại chọn file
        if (fileInputRef.current) fileInputRef.current.click();
    };

    // Function để hiển thị biểu tượng phù hợp với loại file
    const getFileIcon = () => {
        switch (formData.type) {
            case 'image':
                return <Image className="add-file-info-icon" />;
            case 'video':
                return <Video className="add-file-info-icon" />;
            default:
                return <FileText className="add-file-info-icon" />;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const formDataToSend = new FormData();
            formDataToSend.append('lessonId', formData.lessonId);
            formDataToSend.append('name', formData.name);
            formDataToSend.append('order', formData.order);
            formDataToSend.append('file', formData.file);
            formDataToSend.append('type', formData.type);

            const response = await axios.post(
                `${ADD_CHAPTER_API}`,
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.code === 0) {
                showAlert('success', 'Thành công', 'Thêm nội dung bài học thành công!');
                navigate('/teacher/course', {
                    state: { 
                        courseId,
                        expandedLessonId: lessonId
                    }
                });
            } else {
                throw new Error(response.data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error creating chapter:', error);
            if (error.response && error.response.data && error.response.data.code === 1029) {
                showAlert('error', 'Lỗi', 'Định dạng file không hợp lệ!');
            } else {
                showAlert('error', 'Lỗi', 'Có lỗi xảy ra khi thêm nội dung bài học!');
            }
        }
    };

    return (
        <div className="teacher-add-lesson-container">
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
            <h2>Thêm nội dung bài học</h2>
            <form onSubmit={handleSubmit} className="teacher-add-lesson-form">

                <div className="teacher-form-group">
                    <label>Tên chương</label>
                    <input
                        type="text"
                        value={lessonName}
                        disabled
                        className="disabled-input"
                    />
                </div>

                <div className="teacher-form-group">
                    <label htmlFor="order">
                        Thứ tự <span className="required">*</span>
                    </label>
                    <input
                        type="number"
                        id="order"
                        name="order"
                        value={formData.order}
                        disabled
                        className="disabled-input"
                        required
                    />
                </div>

                <div className="teacher-form-group">
                    <label htmlFor="name">
                        Tên bài học <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Nhập tên bài học"
                        required
                    />
                </div>

                <div className="teacher-form-group">
                    <label htmlFor="type">
                        Loại bài học <span className="required">*</span>
                    </label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="file">File</option>
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                    </select>
                </div>

                <div className={`teacher-form-group file-upload-group ${selectedFileName ? 'file-selected' : ''}`}>
                    <label htmlFor="file">
                        File đính kèm <span className="required">*</span>
                    </label>
                    <label htmlFor="file" className="add-file-upload-placeholder"></label>
                    <input
                        type="file"
                        id="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        required
                        className="lesson-file-input"
                        accept={formData.type === 'image' ? 'image/*' : formData.type === 'video' ? 'video/*' : '*'}
                    />
                    {selectedFileName && (
                        <div className="file-info">
                            {getFileIcon()}
                            <span className="add-file-name">{selectedFileName}</span>
                            <div className="file-actions">
                                <button 
                                    type="button" 
                                    className="change-file-btn" 
                                    onClick={handleChangeFile}
                                    title="Tải file khác"
                                >
                                    Tải file khác
                                </button>
                                <button 
                                    type="button" 
                                    className="remove-file-btn" 
                                    onClick={handleRemoveFile}
                                    title="Xóa file"
                                >
                                    Xóa file
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="teacher-form-actions">
                    <button type="submit" className="teacher-confirm-button">Xác nhận</button>
                    <button 
                        type="button" 
                        className="teacher-cancel-button"
                        onClick={() => {
                            // Chuyển hướng về trang course-detail và truyền expandedLessonId
                            // để chương được mở ra khi quay lại (cải thiện UX)
                            navigate('/teacher/course', {
                                state: { 
                                    courseId,
                                    expandedLessonId: lessonId 
                                }
                            });
                        }}
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TeacherAddLesson; 