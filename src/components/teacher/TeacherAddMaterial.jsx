import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Upload, X, RefreshCw } from 'lucide-react';
import '../../assets/css/teacher-add-material.css';
import { ADD_MATERIAL_API } from '../../services/apiService';

const TeacherAddMaterial = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { courseId, lessonId, lessonName } = location.state || {};
    const fileInputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        // Kiểm tra kích thước file (giới hạn 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Kích thước file không được vượt quá 10MB');
            return;
        }
        setSelectedFile(file);
        setError('');
    };

    const removeFile = () => {
        setSelectedFile(null);
        setError('');
        // Đặt lại input file
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleChangeFile = () => {
        // Kích hoạt click trên input file để mở lại hộp thoại chọn file
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Vui lòng chọn file tài liệu');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const formData = new FormData();
            formData.append('id', lessonId);
            formData.append('file', selectedFile);
            formData.append('type', 'file');

            const response = await axios.post(
                `${ADD_MATERIAL_API}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.code === 0) {
                // Điều hướng về trang danh sách khóa học, truyền expandedLessonId để chương vừa thêm tài liệu được mở rộng
                // giúp người dùng dễ dàng thấy được tài liệu vừa thêm vào
                navigate('/teacher/course', {
                    state: { 
                        courseId,
                        expandedLessonId: lessonId
                    }
                });
            } else {
                setError('Có lỗi xảy ra khi tải lên tài liệu');
            }
        } catch (error) {
            console.error('Error uploading material:', error);
            setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải lên tài liệu');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="teacher-add-material-container">
            <div className="material-header">
                <h2>Thêm tài liệu học tập</h2>
                <p className="material-lesson-name">{lessonName}</p>
            </div>

            <form onSubmit={handleSubmit} className="material-form">
                <div 
                    className={`material-file-upload-area ${dragActive ? 'material-drag-active' : ''} ${selectedFile ? 'material-file-selected' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    {!selectedFile ? (
                        <>
                            <Upload size={48} className="material-upload-icon" />
                            <p className="material-upload-text">
                                Kéo và thả file vào đây hoặc <label className="material-file-input-label">
                                    <input
                                        type="file"
                                        onChange={handleFileInput}
                                        className="material-file-input"
                                        ref={fileInputRef}
                                        accept=".pdf,.doc,.docx,.txt"
                                    />
                                    chọn file
                                </label>
                            </p>
                            <p className="material-upload-hint">Hỗ trợ: PDF, Word, TXT (Tối đa 1GB)</p>
                        </>
                    ) : (
                        <div className="material-selected-file">
                            <div className="material-file-info">
                                <span className="material-file-name">{selectedFile.name}</span>
                                <span className="material-file-size">
                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                </span>
                            </div>
                            <div className="material-file-actions">
                                <button 
                                    type="button" 
                                    className="material-change-file-btn"
                                    onClick={handleChangeFile}
                                >
                                    <RefreshCw size={16} />
                                    <span>Tải file mới</span>
                                </button>
                                <button 
                                    type="button" 
                                    className="material-remove-file"
                                    onClick={removeFile}
                                >
                                    <X size={16} />
                                    <span>Xóa file</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {error && <div className="material-error-message">{error}</div>}

                <div className="material-form-actions">
                    <button
                        type="button"
                        className="material-cancel-button"
                        onClick={() => {
                            // Khi hủy, vẫn truyền expandedLessonId để khi quay lại trang TeacherCourseDetail
                            // chương sẽ được mở rộng, giúp cải thiện UX
                            navigate('/teacher/course', {
                                state: { 
                                    courseId,
                                    expandedLessonId: lessonId
                                }
                            });
                        }}
                        disabled={uploading}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="material-submit-button"
                        disabled={!selectedFile || uploading}
                    >
                        {uploading ? 'Đang tải lên...' : 'Xác nhận'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TeacherAddMaterial; 