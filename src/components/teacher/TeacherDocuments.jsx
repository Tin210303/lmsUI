import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Folder, Search } from 'lucide-react';
import { GET_MAJOR_API } from '../../services/apiService';
import '../../assets/css/teacher-documents.css';

const TeacherDocuments = () => {
    const navigate = useNavigate();
    const [majors, setMajors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        fetchMajors();
    }, []);
    
    const fetchMajors = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const response = await axios.get(GET_MAJOR_API, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data && response.data.code === 0) {
                setMajors(response.data.result || []);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch majors');
            }
        } catch (err) {
            console.error('Error fetching majors:', err);
            setError('Không thể tải danh sách chuyên ngành. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleMajorClick = (majorId) => {
        navigate(`/teacher/documents/manage/${majorId}`);
    };
    
    const filteredMajors = majors.filter(major => 
        major.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
        <div className="teacher-documents-container">
            <div className="documents-header">
                <h1>Quản lý tài liệu</h1>
                <div className="search-container">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm chuyên ngành..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>
            
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải danh sách chuyên ngành...</p>
                </div>
            ) : error ? (
                <div className="error-container">
                    <p>{error}</p>
                    <button onClick={fetchMajors} className="retry-button">Thử lại</button>
                </div>
            ) : (
                <div className="majors-grid">
                    {filteredMajors.length > 0 ? (
                        filteredMajors.map(major => (
                            <div 
                                key={major.id} 
                                className="major-folder"
                                onClick={() => handleMajorClick(major.id)}
                            >
                                <Folder size={64} className="folder-icon" />
                                <div className="folder-name">{major.name}</div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            <p>Không tìm thấy chuyên ngành nào phù hợp.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TeacherDocuments;

