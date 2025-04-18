import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Upload, X } from 'lucide-react';
import '../../assets/css/teacher-add-material.css';

const TeacherAddMaterial = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { courseId, lessonId, lessonName } = location.state || {};

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
                'http://localhost:8080/lms/lessonmaterial/create',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.code === 0) {
                navigate('/teacher/course', {
                    state: { courseId }
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
                <p className="lesson-name">{lessonName}</p>
            </div>

            <form onSubmit={handleSubmit} className="material-form">
                <div 
                    className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    {!selectedFile ? (
                        <>
                            <Upload size={48} className="upload-icon" />
                            <p className="upload-text">
                                Kéo và thả file vào đây hoặc <label className="file-input-label">
                                    <input
                                        type="file"
                                        onChange={handleFileInput}
                                        className="file-input"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                                    />
                                    chọn file
                                </label>
                            </p>
                            <p className="upload-hint">Hỗ trợ: PDF, Word, Excel, PowerPoint (Tối đa 10MB)</p>
                        </>
                    ) : (
                        <div className="selected-file">
                            <div className="file-info">
                                <span className="file-name">{selectedFile.name}</span>
                                <span className="file-size">
                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                </span>
                            </div>
                            <button type="button" className="remove-file" onClick={removeFile}>
                                <X size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() => navigate('/teacher/course', {
                            state: { courseId }
                        })}
                        disabled={uploading}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={!selectedFile || uploading}
                    >
                        {uploading ? 'Đang tải lên...' : 'Thêm tài liệu'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TeacherAddMaterial; 