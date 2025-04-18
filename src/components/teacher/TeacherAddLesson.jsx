import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../assets/css/teacher-add-lesson.css';

const TeacherAddLesson = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { courseId, lessonId, lessonName } = location.state || {};
    const [formData, setFormData] = useState({
        lessonId: lessonId,
        name: '',
        order: '',
        file: null,
        type: 'file'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            file: e.target.files[0]
        }));
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
                'http://localhost:8080/lms/chapter/create',
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.code === 0) {
                alert('Thêm nội dung bài học thành công!');
                navigate('/teacher/course', {
                    state: { courseId }
                });
            } else {
                throw new Error(response.data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error creating chapter:', error);
            alert(error.message || 'Có lỗi xảy ra khi thêm nội dung bài học');
        }
    };

    return (
        <div className="teacher-add-lesson-container">
            <h2>Thêm nội dung bài học</h2>
            <form onSubmit={handleSubmit} className="teacher-add-lesson-form">
                <div className="teacher-form-group">
                    <label>Tên bài học</label>
                    <input
                        type="text"
                        value={lessonName}
                        disabled
                        className="disabled-input"
                    />
                </div>

                <div className="teacher-form-group">
                    <label htmlFor="type">
                        Loại nội dung <span className="required">*</span>
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

                <div className="teacher-form-group">
                    <label htmlFor="name">
                        Tên nội dung <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Nhập tên nội dung"
                        required
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
                        onChange={handleInputChange}
                        placeholder="Nhập thứ tự"
                        required
                        min="1"
                    />
                </div>

                <div className="teacher-form-group">
                    <label htmlFor="file">
                        File đính kèm <span className="required">*</span>
                    </label>
                    <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        required
                        accept={formData.type === 'image' ? 'image/*' : formData.type === 'video' ? 'video/*' : '*'}
                    />
                </div>

                <div className="teacher-form-actions">
                    <button type="submit" className="confirm-button">Xác nhận</button>
                    <button 
                        type="button" 
                        className="cancel-button"
                        onClick={() => navigate('/teacher/course', {
                            state: { courseId }
                        })}
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TeacherAddLesson; 