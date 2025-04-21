import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../../logo.svg';
import { Search, Plus, Users } from 'lucide-react';
import Alert from '../common/Alert';
import '../../assets/css/add-students.css';

const AddStudentsPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchCourseInfo();
    }, [courseId]);

    const fetchCourseInfo = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            const response = await axios.get(`http://localhost:8080/lms/course/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCourse(response.data.result);
        } catch (error) {
            console.error('Error fetching course info:', error);
            showAlert('error', 'Lỗi', 'Không thể tải thông tin khóa học');
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // Thay đổi URL API này theo endpoint tìm kiếm sinh viên của bạn
            const response = await axios.get(`http://localhost:8080/lms/student/search?query=${searchTerm}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setSearchResults(response.data.result || []);
        } catch (error) {
            console.error('Error searching students:', error);
            showAlert('error', 'Lỗi', 'Không thể tìm kiếm sinh viên');
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

    const addStudentsToCourse = async () => {
        if (selectedStudents.length === 0) {
            showAlert('warning', 'Chú ý', 'Vui lòng chọn ít nhất một sinh viên');
            return;
        }
        
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // Thực hiện nhiều request để thêm từng sinh viên vào khóa học
            const requests = selectedStudents.map(student => {
                const formData = new FormData();
                formData.append('courseId', courseId);
                formData.append('studentId', student.id);
                
                return axios.post('http://localhost:8080/lms/joinclass/addstudent', formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            });
            
            await Promise.all(requests);
            showAlert('success', 'Thành công', 'Đã thêm sinh viên vào khóa học');
            setTimeout(() => {
                navigate(`/teacher/course/${courseId}`);
            }, 2000);
        } catch (error) {
            console.error('Error adding students to course:', error);
            showAlert('error', 'Lỗi', 'Không thể thêm sinh viên vào khóa học');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
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
                <h1>Thêm sinh viên vào khóa học</h1>
                {course && <h2>{course.name}</h2>}
            </div>
            
            <div className="add-students-content">
                <div className="search-section">
                    <div className="search-form">
                        <h3>Tìm kiếm sinh viên</h3>
                        <div className="search-input-group">
                            <input
                                type="text"
                                placeholder="Nhập tên hoặc email sinh viên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button onClick={handleSearch} disabled={loading}>
                                <Search size={18} />
                            </button>
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
                                                <img src={student.avatar || logo} alt={student.fullName} />
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
                                        <img src={student.avatar || logo} alt={student.fullName} />
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
                            onClick={() => navigate(`/teacher/course/${courseId}`)}
                        >
                            Hủy
                        </button>
                        <button 
                            className="confirm-btn"
                            onClick={addStudentsToCourse}
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

export default AddStudentsPage; 