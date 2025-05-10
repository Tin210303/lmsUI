import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../../logo.svg';
import { Search, Plus, Users } from 'lucide-react';
import Alert from '../common/Alert';
import '../../assets/css/add-students.css';
import { API_BASE_URL, SEARCH_STUDENT_NOT_IN_GROUP, ADD_STUDENT_GROUP } from '../../services/apiService';

const AddStudentsGroup = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Thay searchTerm đơn bằng 3 state riêng biệt
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState({});
    
    const [searchResults, setSearchResults] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    // Hàm gọi API để lấy ra ảnh đại diện của sinh viên
    const fetchAvatar = async (avatarPath, studentId) => {
        
        if (!avatarPath) return;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            // Fetch avatar with authorization header
            const response = await axios.get(`${API_BASE_URL}${avatarPath}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob' 
            });

            // Create a URL for the blob data
            const imageUrl = URL.createObjectURL(response.data);
            setAvatarUrl(prev => ({
                ...prev,
                [studentId]: imageUrl
            }));
        } catch (err) {
            console.error('Error fetching avatar:', err);
        }
    };

    const handleSearch = async () => {
        // Kiểm tra ít nhất một trường đã được nhập
        if (!fullName.trim()) {
            showAlert('warning', 'Chú ý', 'Vui lòng nhập ít nhất một điều kiện tìm kiếm');
            return;
        }
        
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // Tạo URL params cho phương thức GET
            const params = new URLSearchParams();
            params.append('groupId', id);
            params.append('keyword', fullName.trim());
            params.append('pageNumber', 0);
            params.append('pageSize', 10);

            // Gọi API bằng phương thức GET với params trong URL
            const response = await axios.get(
                `${SEARCH_STUDENT_NOT_IN_GROUP}?${params.toString()}`,
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            // Xử lý kết quả
            if (response.data && response.data.result) {
                // Nếu API trả về dạng phân trang
                const students = response.data.result.content;
                setSearchResults(students);
                
                students.forEach(student => {
                    if (student.avatar) {
                        fetchAvatar(student.avatar, student.id);
                    }
                });
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching students:', error);
            showAlert('error', 'Lỗi', 'Không thể tìm kiếm sinh viên');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const addStudentToSelection = (student) => {
        if (!selectedStudents.some(s => s.id === student.id)) {
            setSelectedStudents([...selectedStudents, student]);
        }
    };

    const removeStudentFromSelection = (studentId) => {
        setSelectedStudents(selectedStudents.filter(student => student.id !== studentId));
    };

    const addStudentsToGroup = async () => {
        if (selectedStudents.length === 0) {
            showAlert('warning', 'Chú ý', 'Vui lòng chọn ít nhất một sinh viên');
            return;
        }
        
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // Lấy danh sách ID của các sinh viên đã chọn
            const studentIds = selectedStudents.map(student => student.id);

            // Gọi API addstudents với id và danh sách studentIds
            const response = await axios.post(
                `${ADD_STUDENT_GROUP}`,
                {
                    groupId: id,
                    studentIds: studentIds
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Xử lý kết quả
            if (response.data && response.data.code === 0) {
                showAlert('success', 'Thành công', 'Đã thêm sinh viên vào khóa học');
                setTimeout(() => {
                    navigate(`/teacher/groups/${id}`);
                }, 1000);
            } else {
                showAlert('error', 'Lỗi', response.data?.message || 'Không thể thêm sinh viên vào khóa học');
            }
        } catch (error) {
            console.error('Error adding students to course:', error);
            showAlert('error', 'Lỗi', 'Không thể thêm sinh viên vào khóa học');
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý khi người dùng nhấn phím Enter trong bất kỳ ô input nào
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
    };

    const resetSearchForm = () => {
        setFullName('');
        setSearchResults([]);
    };

    return (
        <div className="add-students-container">
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
            
            <div className="add-students-header">
                <h1>Thêm sinh viên vào group</h1>
            </div>
            
            <div className="add-students-content">
                <div className="search-section">
                    <div className="search-form">
                        <h3>Tìm kiếm sinh viên</h3>
                        <div className="search-form-inputs">
                            <div className="search-form-group">
                                <label htmlFor="fullName">Tên sinh viên hoặc Email</label>
                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder="Nhập tên sinh viên..."
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>

                            <div className="search-buttons">
                                <button 
                                    className="search-btn" 
                                    onClick={handleSearch} 
                                    disabled={loading}
                                >
                                    <Search size={18} />
                                    <span>Tìm kiếm</span>
                                </button>
                                <button 
                                    className="reset-btn" 
                                    onClick={resetSearchForm}
                                    disabled={loading}
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="search-results">
                        <h3>Kết quả tìm kiếm</h3>
                        {loading ? (
                            <div className="loading-search">Đang tìm kiếm...</div>
                        ) : (
                            <div className="results-list">
                                {searchResults.length === 0 ? (
                                    <div className="no-results">Không tìm thấy sinh viên nào</div>
                                ) : (
                                    searchResults.map(student => (
                                        <div key={student.id} className="student-result-item">
                                            <div className="student-info">
                                                {avatarUrl[student.id] ? (
                                                    <img src={avatarUrl[student.id]} alt="Avatar"/>
                                                ) : (
                                                    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="100" cy="100" r="100" fill="#ff4757" />
                                                        <path d="M100,40 C60,40 40,70 40,110 C40,150 60,180 100,180 C140,180 160,150 160,110 C160,70 140,40 100,40 Z" fill="#2f3542" />
                                                        <path d="M65,90 C65,80 75,70 85,70 C95,70 100,80 100,90 C100,80 105,70 115,70 C125,70 135,80 135,90 C135,100 125,110 115,110 C105,110 100,100 100,90 C100,100 95,110 85,110 C75,110 65,100 65,90 Z" fill="#f1f2f6" />
                                                        <path d="M70,75 C70,70 75,65 80,65 C85,65 90,70 90,75 C90,80 85,85 80,85 C75,85 70,80 70,75 Z" fill="#3742fa" />
                                                        <path d="M110,75 C110,70 115,65 120,65 C125,65 130,70 130,75 C130,80 125,85 120,85 C115,85 110,80 110,75 Z" fill="#3742fa" />
                                                        <path d="M65,120 C65,140 80,160 100,160 C120,160 135,140 135,120 C135,110 120,100 100,100 C80,100 65,110 65,120 Z" fill="#f1f2f6" />
                                                        <path d="M70,110 C80,120 90,125 100,125 C110,125 120,120 130,110 C120,105 110,100 100,100 C90,100 80,105 70,110 Z" fill="#2f3542" />
                                                    </svg>
                                                )}
                                                <div>
                                                    <div className="student-name">{student.fullName}</div>
                                                    <div className="student-email">{student.email}</div>
                                                </div>
                                            </div>
                                            <button 
                                                className="add-btn"
                                                onClick={() => addStudentToSelection(student)}
                                                disabled={selectedStudents.some(s => s.id === student.id)}
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="selected-section">
                    <div className="selected-header">
                        <h3>Sinh viên đã chọn</h3>
                        <div className="selected-count">
                            <Users size={18} />
                            <span>{selectedStudents.length}</span>
                        </div>
                    </div>
                    
                    <div className="selected-list">
                        {selectedStudents.length === 0 ? (
                            <div className="no-selected">Chưa có sinh viên nào được chọn</div>
                        ) : (
                            selectedStudents.map(student => (
                                <div key={student.id} className="selected-student-item">
                                    <div className="student-info">
                                        {avatarUrl[student.id] ? (
                                            <img src={avatarUrl[student.id]} alt="Avatar"/>
                                        ) : (
                                            <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="100" cy="100" r="100" fill="#ff4757" />
                                                <path d="M100,40 C60,40 40,70 40,110 C40,150 60,180 100,180 C140,180 160,150 160,110 C160,70 140,40 100,40 Z" fill="#2f3542" />
                                                <path d="M65,90 C65,80 75,70 85,70 C95,70 100,80 100,90 C100,80 105,70 115,70 C125,70 135,80 135,90 C135,100 125,110 115,110 C105,110 100,100 100,90 C100,100 95,110 85,110 C75,110 65,100 65,90 Z" fill="#f1f2f6" />
                                                <path d="M70,75 C70,70 75,65 80,65 C85,65 90,70 90,75 C90,80 85,85 80,85 C75,85 70,80 70,75 Z" fill="#3742fa" />
                                                <path d="M110,75 C110,70 115,65 120,65 C125,65 130,70 130,75 C130,80 125,85 120,85 C115,85 110,80 110,75 Z" fill="#3742fa" />
                                                <path d="M65,120 C65,140 80,160 100,160 C120,160 135,140 135,120 C135,110 120,100 100,100 C80,100 65,110 65,120 Z" fill="#f1f2f6" />
                                                <path d="M70,110 C80,120 90,125 100,125 C110,125 120,120 130,110 C120,105 110,100 100,100 C90,100 80,105 70,110 Z" fill="#2f3542" />
                                            </svg>
                                        )}
                                        <div>
                                            <div className="student-name">{student.fullName}</div>
                                            <div className="student-email">{student.email}</div>
                                        </div>
                                    </div>
                                    <button 
                                        className="remove-btn"
                                        onClick={() => removeStudentFromSelection(student.id)}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="add-student-action-buttons">
                        <button 
                            className="cancel-btn"
                            onClick={() => navigate(`/teacher/groups/${id}`)}
                        >
                            Hủy
                        </button>
                        <button 
                            className="confirm-btn"
                            onClick={addStudentsToGroup}
                            disabled={selectedStudents.length === 0 || loading}
                        >
                            {loading ? 'Đang thêm...' : 'Thêm vào khóa học'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddStudentsGroup; 