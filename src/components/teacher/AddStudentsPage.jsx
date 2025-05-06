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
    
    // Thay searchTerm đơn bằng 3 state riêng biệt
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [majorName, setMajorName] = useState('');
    
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
            params.append('courseId', courseId);
            params.append('keyword', fullName.trim());
            params.append('pageNumber', 0);
            params.append('pageSize', 10);

            // Gọi API bằng phương thức GET với params trong URL
            const response = await axios.get(
                `http://localhost:8080/lms/studentcourse/searchstudentnotin?${params.toString()}`,
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

    const addStudentsToCourse = async () => {
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

            // Gọi API addstudents với courseId và danh sách studentIds
            const response = await axios.post(
                'http://localhost:8080/lms/studentcourse/addstudents',
                {
                    courseId: courseId,
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
            if (response.data && response.data.code === 200) {
                showAlert('success', 'Thành công', 'Đã thêm sinh viên vào khóa học');
                setTimeout(() => {
                    navigate(`/teacher/course-management/${courseId}`);
                }, 2000);
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
        setEmail('');
        setMajorName('');
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
                <h1>Thêm sinh viên vào khóa học</h1>
                {course && <h2>{course.name}</h2>}
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
                            onClick={() => navigate(`/teacher/course-management/${courseId}`)}
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